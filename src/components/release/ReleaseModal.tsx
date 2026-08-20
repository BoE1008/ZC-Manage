import { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Select,
  Input,
  InputNumber,
  DatePicker,
  Space,
  Button,
  Spin,
} from "antd";
import dayjs from "dayjs";
import { Dayjs } from "dayjs";

const dayjsVal = (v: string | Dayjs | undefined) =>
  v ? dayjs(v as string) : undefined;
import { Container } from "@/types";
import { getContainerList } from "@/restApi/container";
import { getCustomersList } from "@/restApi/customer";
import { getSuppliersList } from "@/restApi/supplyer";
import {
  addReleaseOrder,
  editReleaseOrder,
  getReleaseOrderDetail,
  ReleaseOrder,
  ReleaseOrderForm,
} from "@/restApi/releaseOrder";

const ORDER_TYPE_OPTIONS = [
  { label: "卖出放箱", value: "卖出放箱" },
  { label: "租箱", value: "租箱" },
  { label: "回程", value: "回程" },
];

interface Props {
  id: string | null;
  onSave: () => void;
  onClose: () => void;
}

export const ReleaseModal = ({ id, onSave, onClose }: Props) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [containers, setContainers] = useState<Container[]>([]);
  const [buyers, setBuyers] = useState<any[]>([]);
  const [yards, setYards] = useState<any[]>([]);

  useEffect(() => {
    setInitLoading(true);
    // 选项加载：箱号=container；买方=customer；堆场=supplier（各取前1000条）
    // getCustomersList / getSuppliersList 返回响应体本身，列表在 .entity.data
    const optsReady = Promise.all([
      getContainerList({ pageNo: 1, pageSize: 1000 }),
      getCustomersList(1, 1000),
      getSuppliersList(1, 1000),
    ])
      .then(([cRes, cusRes, supRes]) => {
        const buyersArr = (cusRes.entity?.data ?? []) as any[];
        const yardsArr = (supRes.entity?.data ?? []) as any[];
        setContainers(cRes.entity?.data ?? []);
        setBuyers(buyersArr);
        setYards(yardsArr);
        return { buyersArr, yardsArr };
      })
      .finally(() => setInitLoading(false));

    if (!id) return; // 新增：仅加载下拉
    Promise.all([optsReady, getReleaseOrderDetail(id)])
      .then(([opts, r]: any) => {
        // 兼容：{code, entity: {data}} / {code, entity}
        const d = r?.entity?.data ?? r?.entity;
        if (!d) return;
        const vals: any = { ...d };
        // 旧数据可能只存了名称未存 id：按名称反查选项 id，保证回显且保存带回 id
        if (!vals.buyerId && vals.buyerName) {
          const o = opts.buyersArr.find((x: any) => x.name === vals.buyerName);
          if (o) vals.buyerId = o.id;
        }
        if (!vals.yardId && vals.yardName) {
          const o = opts.yardsArr.find((x: any) => x.name === vals.yardName);
          if (o) vals.yardId = o.id;
        }
        const setVals: any = { ...vals };
        if (setVals.pickupTime) {
          const d = dayjs(setVals.pickupTime as string);
          if (d.isValid()) setVals.pickupTime = d;
        }
        form.setFieldsValue(setVals);
      })
      .catch(() => {});
  }, [id]);

  const handleOk = () => {
    return form.validateFields().then((values) => {
      setLoading(true);
      const payload: ReleaseOrderForm = {
        orderType: values.orderType,
        containerId: values.containerId,
        containerNo: values.containerNo,
        buyerId: values.buyerId,
        buyerName: values.buyerName,
        yardId: values.yardId,
        yardName: values.yardName,
        pickupTime: values.pickupTime
          ? dayjs(values.pickupTime).format("YYYY-MM-DD")
          : undefined,
        income: values.income,
        remark: values.remark,
      };
      const api = id
        ? editReleaseOrder({ ...payload, id } as ReleaseOrderForm & {
            id: string;
          })
        : addReleaseOrder(payload);
      api
        .then(() => {
          onSave();
          onClose();
        })
        .catch(() => {
          setLoading(false);
        });
    });
  };

  return (
    <Modal
      title={id ? "编辑放箱令" : "生成放箱令"}
      open
      onOk={handleOk}
      onCancel={onClose}
      width={760}
      destroyOnClose
      footer={
        <Space>
          <Button onClick={onClose} disabled={loading}>
            取消
          </Button>
          <Button type="primary" onClick={handleOk} loading={loading}>
            保存
          </Button>
        </Space>
      }
    >
      {initLoading ? (
        <div className="flex justify-center py-8">
          <Spin />
        </div>
      ) : (
        <>
          <div className="text-xs font-bold text-[#198348] pb-1 mb-3 border-b border-dashed border-gray-200">
            放箱信息
          </div>
          <Form
            form={form}
            layout="vertical"
            initialValues={{ orderType: "卖出放箱" }}
          >
            <div className="grid grid-cols-2 gap-x-4">
              <Form.Item<any>
                name="orderType"
                label={
                  <span className="text-xs">
                    放箱类型 <span className="text-red-500">*</span>
                  </span>
                }
                rules={[{ required: true }]}
              >
                <Select options={ORDER_TYPE_OPTIONS} />
              </Form.Item>
              <Form.Item<any>
                name="containerId"
                label={
                  <span className="text-xs">
                    箱号 <span className="text-red-500">*</span>
                  </span>
                }
                rules={[{ required: true }]}
              >
                <Select
                  showSearch
                  filterOption={(i, o) =>
                    ((o?.label as string) || "")
                      .toLowerCase()
                      .includes(i.toLowerCase())
                  }
                  options={containers.map((c) => ({
                    label: `${c.containerNo} (${c.status})`,
                    value: c.id,
                  }))}
                  onChange={(val) => {
                    const c = containers.find((x) => x.id === val);
                    if (c) form.setFieldValue("containerNo", c.containerNo);
                  }}
                />
              </Form.Item>
              <Form.Item<any> name="containerNo" hidden>
                <Input />
              </Form.Item>
              <Form.Item<any>
                name="buyerId"
                label={<span className="text-xs">买方/租方</span>}
              >
                <Select
                  allowClear
                  showSearch
                  filterOption={(i, o) =>
                    ((o?.label as string) || "")
                      .toLowerCase()
                      .includes(i.toLowerCase())
                  }
                  options={buyers.map((b) => ({ label: b.name, value: b.id }))}
                  onChange={(val) => {
                    const b = buyers.find((x) => x.id === val);
                    if (b) form.setFieldValue("buyerName", b.name);
                  }}
                />
              </Form.Item>
              <Form.Item<any> name="buyerName" hidden>
                <Input />
              </Form.Item>
              <Form.Item<any>
                name="yardId"
                label={<span className="text-xs">放箱堆场</span>}
              >
                <Select
                  allowClear
                  showSearch
                  filterOption={(i, o) =>
                    ((o?.label as string) || "")
                      .toLowerCase()
                      .includes(i.toLowerCase())
                  }
                  options={yards.map((y) => ({ label: y.name, value: y.id }))}
                  onChange={(val) => {
                    const y = yards.find((x) => x.id === val);
                    if (y) form.setFieldValue("yardName", y.name);
                  }}
                />
              </Form.Item>
              <Form.Item<any> name="yardName" hidden>
                <Input />
              </Form.Item>
              <Form.Item<any>
                name="income"
                label={<span className="text-xs">收入</span>}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="卖出/出租收入"
                />
              </Form.Item>
              <Form.Item<any>
                name="pickupTime"
                label={<span className="text-xs">客户提箱时间</span>}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item<any>
                name="remark"
                label={<span className="text-xs">备注</span>}
                className="col-span-2"
              >
                <Input.TextArea rows={2} />
              </Form.Item>
            </div>
          </Form>
        </>
      )}
    </Modal>
  );
};
