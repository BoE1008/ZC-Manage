import { useState, useEffect, useMemo } from "react";
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
  message,
} from "antd";
const { RangePicker } = DatePicker;
import dayjs from "dayjs";
import { Container, ContainerStatus } from "@/types";
import { getContainerList } from "@/restApi/container";
import { getYardList } from "@/restApi/yard";
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
  { label: "卖出放箱", value: "sale" },
  { label: "回程放箱", value: "return" },
  { label: "租给客户", value: "rent" },
];

const RELEASE_METHOD_OPTIONS = [
  { label: "指定箱号", value: "designated" },
  { label: "不指定箱号", value: "undesignated" },
];

// 放箱可见的箱子状态（堆存中）
const STOCK_STATUSES: ContainerStatus[] = [
  "domestic_storage",
  "overseas_storage",
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
  const [selectedBoxes, setSelectedBoxes] = useState<string[]>([]);
  const [orderNo, setOrderNo] = useState<string>("");

  // 加载下拉选项
  useEffect(() => {
    setInitLoading(true);
    Promise.all([
      getContainerList({ pageNo: 1, pageSize: 1000 }),
      getCustomersList(1, 1000),
      getSuppliersList(1, 1000),
      getYardList({ pageNo: 1, pageSize: 1000 }),
    ])
      .then(([cRes, cusRes, supRes, yardRes]) => {
        setContainers(cRes.entity?.data ?? []);
        setBuyers(cusRes.entity?.data ?? []);
        setYards(yardRes?.entity?.data ?? []);
      })
      .finally(() => setInitLoading(false));
  }, []);

  // 编辑回显
  useEffect(() => {
    if (!id) {
      form.resetFields();
      setSelectedBoxes([]);
      setOrderNo("");
      return;
    }
    getReleaseOrderDetail(id)
      .then((res: any) => {
        const entity = res?.entity ?? {};
        const d = entity.data ?? {};
        setOrderNo(d.orderNo ?? "");
        const vals: any = { ...d };
        // 旧数据只存名称未存 id：按名称反查
        if (!vals.buyerId && vals.buyerName) {
          const o = buyers.find((x: any) => x.name === vals.buyerName);
          if (o) vals.buyerId = o.id;
        }
        if (!vals.yardId && vals.yardName) {
          const o = yards.find((x: any) => x.name === vals.yardName);
          if (o) vals.yardId = o.id;
        }
        if (vals.pickupTime) {
          const v = dayjs(vals.pickupTime as string);
          if (v.isValid()) vals.pickupTime = v;
        }
        // 指令期限：字符串 "2026-08-10 至 2026-08-20" → [dayjs, dayjs]
        if (vals.deadline && typeof vals.deadline === "string") {
          const parts = vals.deadline.split(/\s*至\s*/);
          if (parts.length === 2) {
            const a = dayjs(parts[0]);
            const b = dayjs(parts[1]);
            if (a.isValid() && b.isValid()) vals.deadline = [a, b];
            else delete vals.deadline;
          } else {
            delete vals.deadline;
          }
        }
        form.setFieldsValue(vals);
        // 已选箱子
        const boxes = Array.isArray(entity.boxes) ? entity.boxes : [];
        setSelectedBoxes(
          boxes.map((b: any) => b.containerNo).filter(Boolean) as string[],
        );
      })
      .catch(() => {});
  }, [id, buyers, yards]);

  // 仅显示堆存中的箱子
  const stockBoxes = useMemo(
    () =>
      containers.filter((c) =>
        STOCK_STATUSES.includes(c.status as ContainerStatus),
      ),
    [containers],
  );

  // 按 type 计数（已选箱子）
  const typeCount = useMemo(() => {
    const map: Record<string, number> = {};
    selectedBoxes.forEach((boxNo) => {
      const c = containers.find((x) => x.containerNo === boxNo);
      if (c) {
        const k = c.status || "其他";
        map[k] = (map[k] || 0) + 1;
      }
    });
    return map;
  }, [selectedBoxes, containers]);

  const toggleBox = (boxNo: string, checked: boolean) => {
    setSelectedBoxes((prev) =>
      checked ? [...prev, boxNo] : prev.filter((x) => x !== boxNo),
    );
  };

  const toggleAll = (checked: boolean) => {
    setSelectedBoxes(checked ? stockBoxes.map((c) => c.containerNo) : []);
  };

  const handleOk = () => {
    return form.validateFields().then((values) => {
      // 不指定箱号时，无需勾选集装箱
      if (values.releaseMethod !== "undesignated" && selectedBoxes.length === 0) {
        message.error("请至少勾选一个箱子");
        return;
      }
      setLoading(true);
      const deadlineStr =
        values.deadline && Array.isArray(values.deadline)
          ? `${values.deadline[0].format("YYYY-MM-DD")} 至 ${values.deadline[1].format("YYYY-MM-DD")}`
          : undefined;
      const pickupTimeStr = values.pickupTime
        ? dayjs(values.pickupTime).format("YYYY-MM-DD")
        : undefined;

      const payload: any = {
        orderType: values.orderType,
        releaseMethod: values.releaseMethod,
        containerType: values.containerType,
        quantity: values.quantity ? Number(values.quantity) : undefined,
        region: values.region,
        buyerId: values.buyerId,
        buyerName: values.buyerName,
        yardId: values.yardId,
        yardName: values.yardName,
        deadline: deadlineStr,
        income: values.income,
        pickupTime: pickupTimeStr,
        remark: values.remark,

        // 批量多箱明细
        boxes: selectedBoxes.map((boxNo) => ({
          containerNo: boxNo,
          containerId: containers.find((c) => c.containerNo === boxNo)?.id,
        })),
      };
      const api = id
        ? editReleaseOrder({ ...payload, id } as ReleaseOrderForm & {
            id: string;
          })
        : addReleaseOrder(payload as ReleaseOrderForm);
      api
        .then(() => {
          message.success(id ? "放箱令已更新" : "放箱令已生成");
          onSave();
          onClose();
        })
        .catch((e: any) => {
          message.error(e?.msg || "保存失败");
          setLoading(false);
        });
    });
  };

  const downloadWord = () => {
    message.info("📄 下载 Word 放箱单功能待对接后端 /zc/releaseOrder/doc 接口");
  };

  return (
    <Modal
      title={
        <span className="text-[#198348] font-bold">
          {id
            ? `编辑放箱令 - ${orderNo || "..."}`
            : "生成放箱令（支持批量放箱）"}
        </span>
      }
      open
      onCancel={onClose}
      width={720}
      destroyOnClose
      footer={
        <Space>
          <Button onClick={onClose} disabled={loading}>
            取消
          </Button>
          {id && <Button onClick={downloadWord}>📄 下载 Word 放箱单</Button>}
          <Button type="primary" onClick={handleOk} loading={loading}>
            {id ? "保存" : "生成放箱令"}
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
          {/* 放箱信息 */}
          <div className="text-xs font-bold text-[#198348] pb-1 mb-3 border-b border-dashed border-gray-200">
            放箱信息
          </div>
          <Form
            form={form}
            layout="vertical"
            initialValues={{ orderType: "卖出放箱" }}
          >
            <div className="grid grid-cols-2 gap-x-4">
              <Form.Item
                name="orderType"
                label={
                  <span className="text-xs">
                    放箱类型 <span className="text-red-500">*</span>
                  </span>
                }
                rules={[{ required: true, message: "请选择放箱类型" }]}
              >
                <Select options={ORDER_TYPE_OPTIONS} />
              </Form.Item>

              <Form.Item
                name="containerType"
                label={<span className="text-xs">箱型</span>}
              >
                <Select
                  allowClear
                  placeholder="选择箱型"
                  options={[
                    { label: "20GP", value: "20GP" },
                    { label: "40GP", value: "40GP" },
                    { label: "40HQ", value: "40HQ" },
                    { label: "45HQ", value: "45HQ" },
                  ]}
                />
              </Form.Item>

              <Form.Item
                name="releaseMethod"
                label={<span className="text-xs">放箱方式</span>}
              >
                <Select
                  allowClear
                  placeholder="选择放箱方式"
                  options={RELEASE_METHOD_OPTIONS}
                />
              </Form.Item>

              <Form.Item
                name="quantity"
                label={<span className="text-xs">放箱数量</span>}
              >
                <Input type="number" min={1} placeholder="不指定箱号时填写" />
              </Form.Item>

              <Form.Item
                name="region"
                label={<span className="text-xs">放箱地区</span>}
              >
                <Input placeholder="如：上海 / 深圳" />
              </Form.Item>

              <Form.Item
                name="buyerId"
                label={<span className="text-xs">买方/租方</span>}
              >
                <Select
                  allowClear
                  showSearch
                  placeholder="-"
                  filterOption={(i, o) =>
                    ((o?.label as string) || "")
                      .toLowerCase()
                      .includes(i.toLowerCase())
                  }
                  options={buyers.map((b) => ({ label: b.name, value: b.id }))}
                  onChange={(val) => {
                    const b = buyers.find((x) => x.id === val);
                    form.setFieldValue("buyerName", b?.name);
                  }}
                />
              </Form.Item>
              <Form.Item name="buyerName" hidden>
                <Input />
              </Form.Item>

              <Form.Item
                name="yardId"
                label={
                  <span className="text-xs">
                    放箱堆场{" "}
                    <span className="text-gray-400 font-normal">
                      (可指定可不指定)
                    </span>
                  </span>
                }
              >
                <Select
                  allowClear
                  showSearch
                  placeholder="不指定（提箱后回填匹配）"
                  filterOption={(i, o) =>
                    ((o?.label as string) || "")
                      .toLowerCase()
                      .includes(i.toLowerCase())
                  }
                  options={yards.map((y) => ({
                    label: y.yardName,
                    value: y.id,
                  }))}
                  onChange={(val) => {
                    const y = yards.find((x) => x.id === val);
                    form.setFieldValue("yardName", y?.yardName);
                  }}
                />
              </Form.Item>
              <Form.Item name="yardName" hidden>
                <Input />
              </Form.Item>

              <Form.Item
                name="deadline"
                label={<span className="text-xs">指令期限</span>}
              >
                <RangePicker
                  style={{ width: "100%" }}
                  format="YYYY-MM-DD"
                  placeholder={["起始日期", "截止日期"]}
                />
              </Form.Item>

              <Form.Item
                name="income"
                label={<span className="text-xs">收入 (USD)</span>}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="卖出/出租收入"
                />
              </Form.Item>

              <Form.Item
                name="pickupTime"
                label={<span className="text-xs">客户提箱时间（统一）</span>}
                extra={
                  <span className="text-[11px] text-gray-400">
                    留空则提箱后通过"匹配提箱信息"回填
                  </span>
                }
              >
                <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
              </Form.Item>

              <Form.Item
                name="remark"
                label={<span className="text-xs">备注</span>}
                className="col-span-2"
              >
                <Input.TextArea rows={2} placeholder="如有额外说明" />
              </Form.Item>
            </div>
          </Form>

          {/* 放箱指令 */}
          <div className="text-xs font-bold text-[#198348] pb-1 mt-2 mb-2 border-b border-dashed border-gray-200 flex items-center">
            放箱指令（勾选箱子，可多选批量放箱）
            <span className="ml-1 font-normal text-gray-400 text-[11px]">
              — 仅显示堆存中的箱子
            </span>
          </div>

          <div
            className="border border-gray-200 rounded p-2 mb-2"
            style={{ maxHeight: 240, overflowY: "auto" }}
          >
            {stockBoxes.length === 0 ? (
              <div className="text-center text-gray-400 py-4 text-xs">
                暂无堆存中的箱子可放箱
              </div>
            ) : (
              stockBoxes.map((c) => {
                const checked = selectedBoxes.includes(c.containerNo);
                return (
                  <label
                    key={c.id}
                    className="flex items-center gap-2 py-1 px-1 cursor-pointer hover:bg-gray-50 rounded"
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-[#198348]"
                      checked={checked}
                      onChange={(e) =>
                        toggleBox(c.containerNo, e.target.checked)
                      }
                    />
                    <span className="font-mono text-xs text-[#198348] w-32">
                      {c.containerNo}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                        c.status === "domestic_storage"
                          ? "bg-cyan-50 text-cyan-700 border border-cyan-200"
                          : c.status === "overseas_storage"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {c.status === "domestic_storage"
                        ? "国内堆存"
                        : c.status === "overseas_storage"
                          ? "国外堆存"
                          : c.status || "其他"}
                    </span>
                    <span className="text-[11px] text-gray-400 truncate flex-1">
                      {c.liftingYardId || ""}
                    </span>
                  </label>
                );
              })
            )}
          </div>

          <div className="flex items-center gap-2 text-xs mb-2">
            <Button size="small" onClick={() => toggleAll(true)}>
              全选
            </Button>
            <Button size="small" onClick={() => toggleAll(false)}>
              取消全选
            </Button>
            <span className="text-gray-500">
              已勾选 <b className="text-[#198348]">{selectedBoxes.length}</b>{" "}
              个箱子
            </span>
            <span className="ml-auto text-[11px] text-gray-500">
              {Object.entries(typeCount)
                .map(([k, v]) => `${k} ${v}`)
                .join(" / ")}
            </span>
          </div>
        </>
      )}
    </Modal>
  );
};
