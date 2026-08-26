import { useEffect, useRef, useState } from "react";
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
import { getDictOptions, getDictOptionsSync } from "@/restApi/dictCache";
import type { DictOption } from "@/types/dict";
import {
  getContainerDetail,
  addContainer,
  editContainer,
} from "@/restApi/container";

import { getSuppliersList } from "@/restApi/supplyer";
import { getCustomersList } from "@/restApi/customer";
import { getAllProjectList } from "@/restApi/project";

interface Props {
  id: string | null;
  onSave: () => void;
  onClose: () => void;
}

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
  const [projectLoading, setProjectLoading] = useState(false);
  const [selectProject, setSelectProject] = useState<
    { id: string; name: string; num: string } | undefined
  >();
  const [statusOptions, setStatusOptions] = useState<DictOption[]>(
    getDictOptionsSync("container_status"),
  );
  const [typeOptions, setTypeOptions] = useState<DictOption[]>(
    getDictOptionsSync("container_type"),
  );
  const [usageOptions, setUsageOptions] = useState<DictOption[]>(
    getDictOptionsSync("container_usage"),
  );
  const [condOptions, setCondOptions] = useState<DictOption[]>(
    getDictOptionsSync("container_cond"),
  );

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
    setProjectLoading(true);
    getAllProjectList()
      .then((r: any) => {
        const list = r?.entity?.data ?? [];
        setProjects(list);
      })
      .finally(() => setProjectLoading(false));
    // 字典加载（状态/箱型/使用情况/箱况）
    Promise.all([
      getDictOptions("container_status"),
      getDictOptions("container_type"),
      getDictOptions("container_usage"),
      getDictOptions("container_cond"),
    ]).then(([s, t, u, c]) => {
      setStatusOptions(s);
      setTypeOptions(t);
      setUsageOptions(u);
      setCondOptions(c);
    });
  }, []);

  // 编辑时回填：每次打开编辑框都重新请求 detail（同一挂载周期内防重复）
  const requestedIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!id) return;
    // 下拉任一未就绪，等下一次触发
    if (!suppliers.length || !buyers.length || !projects.length) return;
    // 同一挂载周期内已请求过该 id（options 变化导致的重复触发），跳过
    if (requestedIdRef.current === id) return;
    requestedIdRef.current = id;
    getContainerDetail(id).then((r: any) => {
      const d = r?.entity?.data ?? r?.entity ?? r;
      if (!d) return;
      const vals: any = { ...d };
      // 供应商/买方/提箱堆场 id 反查
      if (!vals.supplierId && vals.supplierName) {
        const o = suppliers.find((x) => x.label === vals.supplierName);
        if (o) vals.supplierId = o.value;
      }
      if (!vals.buyerId && vals.buyerName) {
        const o = buyers.find((x) => x.label === vals.buyerName);
        if (o) vals.buyerId = o.value;
      }
      if (!vals.liftingYardId && vals.liftingYardName) {
        const o = suppliers.find((x) => x.label === vals.liftingYardName);
        if (o) vals.liftingYardId = o.value;
      }
      // 项目：根据 projectName 找到 selectProject，把 id 写到 projectNum（Select value）
      if (vals.projectName) {
        const proj = projects.find((p) => p.name === vals.projectName);
        if (proj) {
          vals.projectNum = proj.id;
          setSelectProject(proj);
        }
      }
      // 日期 dayjs 化（处理 "0000-00-00"）
      ["liftingTime"].forEach((f) => {
        const raw = vals[f];
        if (!raw || raw === "0000-00-00") {
          delete vals[f];
          return;
        }
        const dd = dayjs(raw);
        if (dd.isValid()) vals[f] = dd;
        else delete vals[f];
      });
      form.setFieldsValue(vals);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, projects, suppliers, buyers]);

  // 项目编号变化：回填项目名称到 selectProject
  const handleProjectChanged = (param: any) => {
    const proj = projects.find((p) => p.id === param);
    setSelectProject(proj);
  };

  const handleOk = async () => {
    try {
      setLoading(true);
      await form.validateFields();
      const values = form.getFieldsValue();
      // 日期字段：dayjs -> 字符串
      (["liftingTime"] as const).forEach((f) => {
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
      // 项目：values.projectNum 是真实 id；selectProject 持有完整对象
      values.projectId = values.projectNum || "";
      values.projectName = selectProject?.name || "";
      delete values.projectNum;
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
        <div className="text-xs font-bold text-[#198348] py-2 border-b border-dashed border-gray-200">
          基础信息
        </div>
        <div className="grid grid-cols-2 gap-x-4">
          <Form.Item
            name="containerNo"
            label={
              <span className="text-xs">
                箱号 <span className="text-red-500">*</span>
              </span>
            }
            rules={[{ required: true }]}
          >
            <Input placeholder="如：UETU5115323" />
          </Form.Item>
          <Form.Item
            name="containerType"
            label={
              <span className="text-xs">
                箱型 <span className="text-red-500">*</span>
              </span>
            }
            rules={[{ required: true }]}
          >
            <Select allowClear placeholder="请选择" options={typeOptions} />
          </Form.Item>
          <Form.Item
            name="usageType"
            label={
              <span className="text-xs">
                使用情况 <span className="text-red-500">*</span>
              </span>
            }
            rules={[{ required: true }]}
          >
            <Select allowClear placeholder="请选择" options={usageOptions} />
          </Form.Item>
          <Form.Item
            name="conditionType"
            label={
              <span className="text-xs">
                箱况 <span className="text-red-500">*</span>
              </span>
            }
            rules={[{ required: true }]}
          >
            <Select allowClear placeholder="请选择" options={condOptions} />
          </Form.Item>
          <Form.Item
            name="supplierId"
            label={<span className="text-xs">卖方/出租方</span>}
          >
            <Select allowClear placeholder="请选择" options={suppliers} />
          </Form.Item>
          <Form.Item
            name="cost"
            label={<span className="text-xs">成本 (USD)</span>}
          >
            <InputNumber style={{ width: "100%" }} placeholder="如：1880" />
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
            name="projectNum"
            label={<span className="text-xs">项目编号</span>}
            validateTrigger="onBlur"
          >
            <Select
              allowClear
              showSearch
              placeholder="选择项目"
              optionFilterProp="label"
              loading={projectLoading}
              options={projects.map((p) => ({
                label: p.projectNum,
                value: p.id,
              }))}
              onChange={handleProjectChanged}
            />
          </Form.Item>
          <Form.Item label={<span className="text-xs">项目名称</span>}>
            <div className="px-3 py-1 text-sm text-gray-700 bg-gray-50 rounded border border-gray-200 min-h-[32px]">
              {selectProject?.name || "-"}
            </div>
          </Form.Item>
        </div>

        {/* 状态信息 */}
        <div className="text-xs font-bold text-[#198348] py-2 border-b border-dashed border-gray-200 mt-2">
          状态信息
        </div>
        <div className="grid grid-cols-2 gap-x-4">
          <Form.Item
            name="status"
            label={<span className="text-xs">当前状态</span>}
          >
            <Select allowClear placeholder="请选择" options={statusOptions} />
          </Form.Item>
          <Form.Item
            name="buyerId"
            label={<span className="text-xs">买方/租方</span>}
          >
            <Select allowClear placeholder="-" options={buyers} />
          </Form.Item>
        </div>

        <Form.Item
          name="statusRemark"
          label={<span className="text-xs">状态备注</span>}
          className="mt-2"
        >
          <Input.TextArea rows={2} placeholder="如：Vladivostok 港口中转" />
        </Form.Item>

        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" loading={loading} onClick={handleOk}>
            保存
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
