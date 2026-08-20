import { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Space,
  Button,
  message,
  DatePicker,
} from "antd";
import dayjs from "dayjs";

import { Container, ContainerForm } from "@/types";
import {
  getContainerDetail,
  addContainer,
  editContainer,
} from "@/restApi/container";
import { getSuppliersList } from "@/restApi/supplyer";
import { getCustomersList } from "@/restApi/customer";
import { getProjectList } from "@/restApi/project";

interface Props {
  id: string | null;
  onSave: () => void;
  onClose: () => void;
}

const STATUS_OPTIONS = [
  { label: "待提箱", value: "pending" },
  { label: "提箱中", value: "lifting" },
  { label: "在途", value: "in_transit" },
  { label: "已落箱", value: "dropped" },
  { label: "堆存", value: "storage" },
  { label: "已放箱", value: "released" },
  { label: "已提箱", value: "picked_up" },
  { label: "已还箱", value: "returned" },
];

const USAGE_OPTIONS = [
  { label: "买箱", value: "purchase" },
  { label: "租箱", value: "long_rental" },
];

const COND_OPTIONS = [
  { label: "新箱", value: "new" },
  { label: "次新箱", value: "sub_new" },
  { label: "适货箱", value: "cargo_worthy" },
];

export const ContainerModal = ({ id, onSave, onClose }: Props) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<
    { label: string; value: string }[]
  >([]);
  const [buyers, setBuyers] = useState<{ label: string; value: string }[]>([]);
  const [yards, setYards] = useState<{ label: string; value: string }[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  const isEdit = id !== null;

  // 加载下拉选项
  useEffect(() => {
    getSuppliersList(1, 1000).then((r: any) => {
      const supList = r.entity?.data ?? [];
      const supOpts = supList.map((s: any) => ({ label: s.name, value: s.id }));
      setSuppliers(supOpts);
      setYards(supOpts);
    });
    getCustomersList(1, 1000).then((r: any) => {
      setBuyers(
        ((r.entity?.data ?? []) as any[]).map((b: any) => ({
          label: b.name,
          value: b.id,
        })),
      );
    });
    getProjectList(1, 1000).then((r: any) => {
      const list = r?.entity?.data ?? [];
      setProjects(list);
    });
  }, []);

  // 编辑时回填
  useEffect(() => {
    if (!id) return;
    getContainerDetail(id).then((r: any) => {
      const d = r?.entity?.data ?? r?.entity ?? r;
      if (!d) return;
      const vals: any = { ...d };
      // 日期 dayjs 化（供 DatePicker 显示）
      const dateFields = ["liftingTime", "sendTime", "eta", "ata"] as const;
      dateFields.forEach((f) => {
        const raw = vals[f] as string;
        if (!raw || raw === '0000-00-00') return;
        const dd = dayjs(raw);
        if (dd.isValid()) vals[f] = dd;
      });
      // 供应商 id 反查
      if (!vals.supplierId && vals.supplierName) {
        const o = suppliers.find((x) => x.label === vals.supplierName);
        if (o) vals.supplierId = o.value;
      }
      // 买方 id 反查
      if (!vals.buyerId && vals.buyerName) {
        const o = buyers.find((x) => x.label === vals.buyerName);
        if (o) vals.buyerId = o.value;
      }
      // 提箱堆场 id 反查
      if (!vals.liftingYardId && vals.liftingYardName) {
        const o = suppliers.find((x) => x.label === vals.liftingYardName);
        if (o) vals.liftingYardId = o.value;
      }
      // 项目名称直接回填（不依赖 options）
      if (vals.projectName) {
        vals.projectId = vals.projectId || vals.projectName;
      }
      // 日期有效化
      ["liftingTime", "sendTime", "eta", "ata"].forEach((f) => {
        const raw = vals[f];
        if (!raw) {
          delete vals[f];
          return;
        }
        const dd = dayjs(raw as string);
        if (dd.isValid()) vals[f] = dd;
        else delete vals[f];
      });
      form.setFieldsValue(vals);
    });
  }, [id, suppliers, buyers]);

  // projects 加载完成后，用 projectName 回填 Select（value=name 直接显示）
  useEffect(() => {
    if (!id || !projects.length) return;
    getContainerDetail(id).then((r: any) => {
      const d = r?.entity?.data ?? r?.entity ?? r;
      if (!d || !d.projectName) return;
      form.setFieldValue("projectId", d.projectName);
    });
  }, [id, projects]);

  const handleOk = async () => {
    try {
      setLoading(true);
      await form.validateFields();
      const values = form.getFieldsValue();
      // 日期字段：dayjs -> 字符串
      (["liftingTime", "sendTime", "eta", "ata"] as const).forEach((f) => {
        const v = (values as any)[f];
        if (v && dayjs(v as any).isValid())
          (values as any)[f] = (v as any).format("YYYY-MM-DD");
        else delete (values as any)[f];
      });
      // 供应商名称
      const sup = suppliers.find((x) => x.value === values.supplierId);
      if (sup) values.supplierName = sup.label;
      const yard = yards.find((x) => x.value === values.liftingYardId);
      if (yard) values.liftingYardName = yard.label;
      // 买方名称
      const buyer = buyers.find((x) => x.value === values.buyerId);
      if (buyer) values.buyerName = buyer.label;
      // 项目名称（value 直接是 name）
      values.projectName = values.projectId || "";
      // 去掉多余字段
      delete values.storageCost;
      delete values.storageIncome;
      delete values.saleIncome;
      const payload: any = { ...values };
      if (id) {
        await editContainer({ ...payload, id } as ContainerForm & {
          id: string;
        });
      } else {
        await addContainer(payload as ContainerForm);
      }
      message.success(id ? "编辑成功" : "新增成功");
      onSave();
    } catch {
      // validation error or api error, ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open
      title={
        <span className="font-bold">{id ? "编辑集装箱" : "新增集装箱"}</span>
      }
      onCancel={onClose}
      footer={null}
      width={720}
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="pt-2">
        <div className="grid grid-cols-2 gap-x-4">
          <Form.Item
            name="containerNo"
            label={<span className="text-xs">箱号</span>}
          >
            <Input placeholder="如：EISU1234567" />
          </Form.Item>
          <Form.Item
            name="containerType"
            label={<span className="text-xs">箱型</span>}
          >
            <Select
              allowClear
              placeholder="请选择"
              options={[
                { label: "20GP", value: "20GP" },
                { label: "40GP", value: "40GP" },
                { label: "40HC", value: "40HC" },
                { label: "45HC", value: "45HC" },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="usageType"
            label={<span className="text-xs">使用类型</span>}
          >
            <Select allowClear placeholder="请选择" options={USAGE_OPTIONS} />
          </Form.Item>
          <Form.Item
            name="conditionType"
            label={<span className="text-xs">箱况</span>}
          >
            <Select allowClear placeholder="请选择" options={COND_OPTIONS} />
          </Form.Item>
          <Form.Item
            name="supplierId"
            label={<span className="text-xs">供应商</span>}
          >
            <Select allowClear placeholder="请选择" options={suppliers} />
          </Form.Item>
          <Form.Item
            name="cost"
            label={<span className="text-xs">采购成本</span>}
          >
            <InputNumber style={{ width: "100%" }} placeholder="USD" />
          </Form.Item>
        </div>

        {/* 项目 */}
        <div className="grid grid-cols-2 gap-x-4">
          <Form.Item
            name="projectId"
            label={<span className="text-xs">当前项目</span>}
          >
            <Select
              allowClear
              placeholder="选择项目"
              value={undefined}
              options={projects.map((p) => ({ label: p.name, value: p.name }))}
            />
          </Form.Item>
          <Form.Item
            name="shipName"
            label={<span className="text-xs">船名/班列号</span>}
          >
            <Input placeholder="如：CMA CGM BOURBON" />
          </Form.Item>
        </div>

        {/* 提箱信息 */}
        <div className="text-xs font-bold text-[#198348] py-2 border-b border-dashed border-gray-200 mt-2">
          提箱信息
        </div>
        <div className="grid grid-cols-2 gap-x-4">
          <Form.Item
            name="liftingYardId"
            label={<span className="text-xs">提箱堆场</span>}
          >
            <Select allowClear placeholder="请选择" options={yards} />
          </Form.Item>
          <Form.Item
            name="liftingTime"
            label={<span className="text-xs">提箱时间</span>}
            getValueProps={(v) => ({ value: v ? dayjs(v) : undefined })}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="liftingOrderNo"
            label={<span className="text-xs">提箱令编号</span>}
          >
            <Input placeholder="如：S225142" />
          </Form.Item>
          <Form.Item
            name="status"
            label={<span className="text-xs">状态</span>}
          >
            <Select allowClear placeholder="请选择" options={STATUS_OPTIONS} />
          </Form.Item>
        </div>

        {/* 运输信息 */}
        <div className="text-xs font-bold text-[#198348] py-2 border-b border-dashed border-gray-200 mt-2">
          运输信息
        </div>
        <div className="grid grid-cols-2 gap-x-4">
          <Form.Item
            name="sendTime"
            label={<span className="text-xs">发运时间</span>}
            getValueProps={(v) => ({ value: v ? dayjs(v) : undefined })}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="eta"
            label={<span className="text-xs">预计到达</span>}
            getValueProps={(v) => ({ value: v ? dayjs(v) : undefined })}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="ata"
            label={<span className="text-xs">实际到达</span>}
            getValueProps={(v) => ({ value: v ? dayjs(v) : undefined })}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </div>

        {/* 费用信息 */}
        <div className="text-xs font-bold text-[#198348] py-2 border-b border-dashed border-gray-200 mt-2">
          费用信息
        </div>
        <div className="grid grid-cols-2 gap-x-4">
          <Form.Item
            name="storageCost"
            label={<span className="text-xs">堆存成本</span>}
          >
            <InputNumber style={{ width: "100%" }} placeholder="USD" />
          </Form.Item>
          <Form.Item
            name="storageIncome"
            label={<span className="text-xs">堆存收入</span>}
          >
            <InputNumber style={{ width: "100%" }} placeholder="USD" />
          </Form.Item>
          <Form.Item
            name="saleIncome"
            label={<span className="text-xs">卖出收入</span>}
          >
            <InputNumber style={{ width: "100%" }} placeholder="USD" />
          </Form.Item>
        </div>

        {/* 还箱信息 */}
        <div className="text-xs font-bold text-[#198348] py-2 border-b border-dashed border-gray-200 mt-2">
          还箱信息
        </div>
        <div className="grid grid-cols-2 gap-x-4">
          <Form.Item
            name="returnCity"
            label={<span className="text-xs">还箱城市</span>}
          >
            <Input placeholder="如：上海" />
          </Form.Item>
          <Form.Item
            name="returnFee"
            label={<span className="text-xs">还箱费用</span>}
          >
            <InputNumber style={{ width: "100%" }} placeholder="USD" />
          </Form.Item>
        </div>

        {/*买方信息*/}
        <div className="text-xs font-bold text-[#198348] py-2 border-b border-dashed border-gray-200 mt-2">
          买方信息
        </div>
        <div className="grid grid-cols-2 gap-x-4">
          <Form.Item
            name="buyerId"
            label={<span className="text-xs">买方</span>}
          >
            <Select allowClear placeholder="请选择" options={buyers} />
          </Form.Item>
          <Form.Item
            name="pickupTime"
            label={<span className="text-xs">提箱时间</span>}
            getValueProps={(v) => ({ value: v ? dayjs(v) : undefined })}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </div>

        <Form.Item<any>
          name="remark"
          label={<span className="text-xs">备注</span>}
          className="mt-2"
        >
          <Input.TextArea rows={2} placeholder="可选" />
        </Form.Item>

        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" loading={loading} onClick={handleOk}>
            确定
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
