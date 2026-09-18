import { useEffect, useRef, useState, type ReactNode } from "react";
import { Modal, Form, Input, Select, Button, message, DatePicker } from "antd";
import dayjs from "dayjs";

import { ContainerForm } from "@/types";
import { getDictOptions, getDictOptionsSync } from "@/restApi/dictCache";
import { getDictByCode } from "@/restApi/dict";
import type { DictOption } from "@/types/dict";
import { unwrapEntity, unwrapList, normalizeDictOptions } from "@/utils";
import {
  getContainerDetail,
  addContainer,
  editContainer,
} from "@/restApi/container";

import { getSuppliersList } from "@/restApi/supplyer";
import { getYardList } from "@/restApi/yard";
import { getAllProjectList } from "@/restApi/project";
import { getPickupOrderList } from "@/restApi/pickupOrder";

interface Props {
  id: string | null;
  onSave: () => void;
  onClose: () => void;
}

type Option = { label: string; value: string };

/** 需要 dayjs 转换的日期字段 */
const DATE_FIELDS = ["liftingTime", "expectReturnTime"] as const;

/** 下拉搜索：按 label 模糊匹配 */
const filterByLabel = (input: string, option?: { label?: ReactNode }) =>
  String(option?.label ?? "")
    .toLowerCase()
    .includes(input.toLowerCase());

/**
 * 归一化日期字段：
 * - mode="dayjs"：转成 dayjs 对象（表单回填用）
 * - mode="string"：转成 "YYYY-MM-DD" 字符串（提交用）
 * 空值 / "0000-00-00" / 非法日期一律删除该字段
 */
const normalizeDates = (
  vals: Record<string, any>,
  mode: "dayjs" | "string",
) => {
  DATE_FIELDS.forEach((f) => {
    const raw = vals[f];
    if (!raw || raw === "0000-00-00") {
      delete vals[f];
      return;
    }
    const d = dayjs.isDayjs(raw) ? raw : dayjs(raw);
    if (d.isValid()) vals[f] = mode === "dayjs" ? d : d.format("YYYY-MM-DD");
    else delete vals[f];
  });
};

export const ContainerModal = ({ id, onSave, onClose }: Props) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<Option[]>([]);
  const [yards, setYards] = useState<Option[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [pickupOrders, setPickupOrders] = useState<Option[]>([]);
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
  const [saleStatusOptions, setSaleStatusOptions] = useState<Option[]>([]);

  // 加载下拉选项
  useEffect(() => {
    getSuppliersList(1, 1000).then((r: any) => {
      setSuppliers(
        unwrapList(r).map((s: any) => ({
          label: s.name,
          value: s.id,
        })),
      );
    });
    getYardList({ pageNo: 1, pageSize: 1000 }).then((r: any) => {
      setYards(
        unwrapList(r).map((y: any) => ({
          label: y.name ?? y.yardName,
          value: y.id,
        })),
      );
    });
    getPickupOrderList({ pageNo: 1, pageSize: 1000 }).then((r: any) => {
      setPickupOrders(
        unwrapList(r).map((o: any) => {
          const v = o.orderNo || o.id;
          return { label: v, value: v };
        }),
      );
    });

    getDictByCode("container_sale_status")
      .then((res: any) => {
        setSaleStatusOptions(normalizeDictOptions(unwrapList(res)));
      })
      .catch(() => setSaleStatusOptions([]));

    getAllProjectList()
      .then((r: any) => setProjects(unwrapList(r)))
      .catch(() => setProjects([]));

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
    if (!suppliers.length || !projects.length || !yards.length) return;
    // 同一挂载周期内已请求过该 id（options 变化导致的重复触发），跳过
    if (requestedIdRef.current === id) return;
    requestedIdRef.current = id;
    getContainerDetail(id).then((r: any) => {
      const d = unwrapEntity(r);
      if (!d) return;
      const vals: any = { ...d };
      // 供应商/提箱堆场/当前堆场 id 反查（缺少 id 时按名称匹配）
      const backfillId = (
        idKey: string,
        nameKey: string,
        options: Option[],
      ) => {
        if (vals[idKey] || !vals[nameKey]) return;
        const o = options.find((x) => x.label === vals[nameKey]);
        if (o) vals[idKey] = o.value;
      };
      backfillId("supplierId", "supplierName", suppliers);
      backfillId("liftingYardId", "liftingYardName", yards);
      backfillId("dropYardId", "dropYardName", yards);
      // 项目：根据 projectName 找到 selectProject，把 id 写到 projectNum（Select value）
      if (vals.projectName) {
        const proj = projects.find((p) => p.name === vals.projectName);
        if (proj) {
          vals.projectNum = proj.id;
          setSelectProject(proj);
        }
      }
      normalizeDates(vals, "dayjs");
      form.setFieldsValue(vals);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, projects, suppliers, yards]);

  const handleOk = async () => {
    let values: any;
    try {
      setLoading(true);
      values = await form.validateFields();
    } catch (e: any) {
      // antd 校验失败：errorFields 存在
      if (e?.errorFields?.length) {
        message.error(
          "请检查表单：" +
            e.errorFields.map((x: any) => x.name?.join(".")).join("、") +
            " 等必填项",
        );
      } else {
        message.error("表单校验异常：" + (e?.message || "未知错误"));
      }
      setLoading(false);
      return;
    }
    try {
      normalizeDates(values, "string");
      // id → name 回填（后端需要名称快照）
      const withName = (idKey: string, nameKey: string, options: Option[]) => {
        const o = options.find((x) => x.value === values[idKey]);
        if (o) values[nameKey] = o.label;
      };
      withName("supplierId", "supplierName", suppliers);
      withName("liftingYardId", "liftingYardName", yards);
      withName("dropYardId", "dropYardName", yards);
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
    } catch (e: any) {
      console.error("[ContainerModal] save error:", e);
      message.error(
        (id ? "编辑失败：" : "新增失败：") + (e?.message || "未知错误"),
      );
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
            <Select
              allowClear
              showSearch
              placeholder="请选择"
              options={suppliers}
              filterOption={filterByLabel}
            />
          </Form.Item>
        </div>

        {/* 提箱信息 */}
        <div className="text-xs font-bold text-[#198348] py-2 border-b border-dashed border-gray-200 mt-2">
          初始提箱信息
        </div>
        <div className="grid grid-cols-2 gap-x-4">
          <Form.Item
            name="liftingYardId"
            label={<span className="text-xs">初始提箱堆场</span>}
          >
            <Select
              allowClear
              showSearch
              placeholder="请选择"
              options={yards}
              filterOption={filterByLabel}
            />
          </Form.Item>
          <Form.Item
            name="liftingTime"
            label={<span className="text-xs">初始提箱时间</span>}
            getValueProps={(v) => ({ value: v ? dayjs(v) : undefined })}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="liftingOrderNo"
            label={<span className="text-xs">初始提箱令编号</span>}
          >
            <Select
              allowClear
              showSearch
              placeholder="选择提箱令"
              options={pickupOrders}
              filterOption={filterByLabel}
            />
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
            name="saleStatus"
            label={<span className="text-xs">当前售卖状态</span>}
          >
            <Select
              allowClear
              showSearch
              placeholder="请选择"
              options={saleStatusOptions}
              filterOption={filterByLabel}
            />
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-x-4">
          <Form.Item
            name="dropYardId"
            label={<span className="text-xs">当前堆场</span>}
          >
            <Select
              allowClear
              showSearch
              placeholder="选择当前堆场"
              options={yards}
              filterOption={filterByLabel}
            />
          </Form.Item>
        </div>

        <Form.Item
          name="statusRemark"
          label={<span className="text-xs">状态备注</span>}
          className="mt-2"
        >
          <Input.TextArea rows={2} />
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
