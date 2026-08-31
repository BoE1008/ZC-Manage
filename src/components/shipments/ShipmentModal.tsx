import { useState, useEffect, useRef } from "react";
import {
  Modal,
  Form,
  Select,
  Input,
  Space,
  Button,
  message,
  DatePicker,
} from "antd";
import dayjs from "dayjs";

import { Container, ContainerTracking, ContainerTrackingForm } from "@/types";
import {
  addTracking,
  editTracking,
  getTrackingDetail,
} from "@/restApi/tracking";
import { getSuppliersList } from "@/restApi/supplyer";
import { getAllProjectList } from "@/restApi/project";
import { getDictOptions, getDictOptionsSync } from "@/restApi/dictCache";
import type { DictOption } from "@/types/dict";
import { getContainerList } from "@/restApi/container";
import { getYardList } from "@/restApi/yard";

interface Props {
  id: string | null;
  onSave: (id: string | null, data: Partial<ContainerTracking>) => void;
  onClose: () => void;
}

const SEGMENT_OPTIONS = [
  { label: "去程 outbound", value: "outbound" },
  { label: "回程 inbound", value: "inbound" },
];

export const ShipmentModal = ({ id, onSave, onClose }: Props) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<
    { label: string; value: string }[]
  >([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [containers, setContainers] = useState<any[]>([]);
  const [yards, setYards] = useState<any[]>([]);
  const [projectLoading, setProjectLoading] = useState(false);
  const [statusOptions, setStatusOptions] = useState<DictOption[]>(
    getDictOptionsSync("container_status"),
  );
  const [editingRecord, setEditingRecord] = useState<ContainerTracking | null>(
    null,
  );
  // 同一挂载周期内防重复请求（每次打开编辑框都重新拉 detail）
  const requestedIdRef = useRef<string | null>(null);
  const [selectProject, setSelectProject] = useState<
    | {
        id: string;
        name: string;
        num: string;
      }
    | undefined
  >();
  // 缓存拉到的原始数据，之后 suppliers/projects 变化不重复触发日期回填
  const rawDataRef = useRef<any>(null);

  // 独立加载下拉选项，互不等待
  useEffect(() => {
    getSuppliersList(1, 1000).then((r: any) => {
      setSuppliers(
        ((r.entity?.data ?? []) as any[]).map((s: any) => ({
          label: s.name,
          value: s.id,
        })),
      );
    });
    getContainerList({ pageNo: 1, pageSize: 1000 }).then((r: any) => {
      setContainers(
        ((r.entity?.data ?? []) as any[]).map((s: any) => ({
          label: s.containerNo,
          value: s.containerNo,
        })),
      );
    });
    getYardList({ pageNo: 1, pageSize: 1000 }).then((r: any) => {
      setYards(
        ((r.entity?.data ?? []) as any[]).map((y: any) => ({
          label: y.yardName,
          value: y.id,
        })),
      );
    });
    setProjectLoading(true);
    getAllProjectList()
      .then((r: any) => {
        setProjects(r.entity?.data ?? []);
      })
      .finally(() => setProjectLoading(false));
    getDictOptions("container_status").then(setStatusOptions);
  }, []);

  // 打开编辑框：调 getTrackingDetail 重新获取回显数据（按 containerId 查该箱全部运踪，再匹配当前记录）
  useEffect(() => {
    if (!id) {
      requestedIdRef.current = null;
      rawDataRef.current = null;
      setEditingRecord(null);
      form.resetFields();
      return;
    }
    // 同一挂载周期内已请求过，跳过
    if (requestedIdRef.current === id) return;
    requestedIdRef.current = id;
    // getTrackingDetail 直接传点击那条记录的 id
    getTrackingDetail(id).then((r: any) => {
      // 兼容返回：单条记录 / 数组 / entity.data 包装
      const entity = r?.entity;
      const editing = Array.isArray(entity)
        ? (entity.find((x: any) => x.id === id) ?? entity[0] ?? null)
        : (entity?.data ?? entity ?? null);
      if (!editing) return;
      setEditingRecord(editing);
      const vals: any = { ...editing };
      // 日期 dayjs 化
      (["sendTime", "eta", "ata", "dropTime", "returnTime"] as const).forEach(
        (f) => {
          const raw = vals[f] as string;
          if (!raw || raw === "0000-00-00") return;
          const d = dayjs(raw);
          if (d.isValid()) vals[f] = d;
        },
      );
      // 项目：根据 projectName 反查，把 id 写到 projectNum（Select value），并设置 selectProject
      if (vals.projectName) {
        const proj = projects.find((x: any) => x.name === vals.projectName);
        if (proj) {
          vals.projectNum = proj.id;
          setSelectProject(proj);
        }
      }
      rawDataRef.current = vals;
      form.setFieldsValue(vals);
    });
  }, [id]);

  // suppliers/projects 变化时，只更新下拉和项目，不碰日期
  useEffect(() => {
    if (!rawDataRef.current) return;
    const vals = { ...rawDataRef.current };
    // 下拉重新查 id
    // 项目：根据 projectName 反查（options 就绪后补上）
    if (!vals.projectNum && vals.projectName && projects.length) {
      const proj = projects.find((x: any) => x.name === vals.projectName);
      if (proj) {
        vals.projectNum = proj.id;
        setSelectProject(proj);
      }
    }
    form.setFieldsValue(vals);
  }, [suppliers, projects]);

  // 项目编号变化：回填项目名称到 selectProject
  const handleProjectChanged = (param: any) => {
    const proj = projects.find((p: any) => p.id === param);
    setSelectProject(proj);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const derived = form.getFieldsValue(["dropYardName", "dropSupplierName"]);
      // 日期字段：dayjs -> 字符串（YYYY-MM-DD），供后端接收
      (
        ["sendTime", "eta", "ata", "dropTime", "returnTime"] as string[]
      ).forEach((f) => {
        const v = (values as any)[f];
        if (v && v.format) (values as any)[f] = v.format("YYYY-MM-DD");
      });
      const payload = { ...values, ...derived };
      // 项目：projectNum 是真实 id，selectProject 持有完整对象
      payload.projectId = values.projectNum || "";
      payload.projectName = selectProject?.name || "";
      delete payload.projectNum;
      setLoading(true);
      if (id) {
        await editTracking({ ...payload, id });
        message.success("运踪已更新");
      } else {
        await addTracking(payload as ContainerTrackingForm);
        message.success("运踪已添加");
      }
      onSave(id, payload);
      onClose();
    } catch {
      message.error("保存失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        editingRecord ? `编辑运踪 - ${editingRecord.containerNo}` : "新增运踪"
      }
      open
      onOk={handleOk}
      onCancel={onClose}
      width={760}
      destroyOnClose
      confirmLoading={loading}
      footer={
        <Space>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" onClick={handleOk} loading={loading}>
            保存
          </Button>
        </Space>
      }
    >
      <div className="py-2">
        <div className="text-xs font-bold text-[#198348] pb-1 mb-3 border-b border-dashed border-gray-200">
          集装箱与项目
        </div>
        <Form form={form} layout="vertical" initialValues={editingRecord || {}}>
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
              <Select
                showSearch
                filterOption={(i, o) =>
                  ((o?.label as string) || "")
                    .toLowerCase()
                    .includes(i.toLowerCase())
                }
                options={containers}
              />
            </Form.Item>
            <Form.Item
              name="projectNum"
              label={
                <span className="text-xs">
                  项目编号 <span className="text-red-500">*</span>
                </span>
              }
              rules={[{ required: true, message: "请选择项目" }]}
              validateTrigger="onBlur"
            >
              <Select
                allowClear
                showSearch
                placeholder="选择项目"
                loading={projectLoading}
                optionFilterProp="label"
                options={projects.map((p: any) => ({
                  label: p.projectNum,
                  value: p.id,
                }))}
                onChange={handleProjectChanged}
              />
            </Form.Item>
            <Form.Item
              label={
                <span className="text-xs">
                  项目名称 <span className="text-red-500">*</span>
                </span>
              }
            >
              <div className="px-3 py-1 text-sm text-gray-700 bg-gray-50 rounded border border-gray-200 min-h-[32px]">
                {selectProject?.name || "-"}
              </div>
            </Form.Item>
            <Form.Item
              name="port"
              label={<span className="text-xs">口岸</span>}
            >
              <Input placeholder="如：海参崴" />
            </Form.Item>
          </div>

          <div className="text-xs font-bold text-[#198348] py-2 border-b border-dashed border-gray-200 mt-2">
            发运信息
          </div>
          <div className="grid grid-cols-2 gap-x-4">
            <Form.Item
              name="departureStation"
              label={<span className="text-xs">发运站</span>}
            >
              <Input placeholder="如：宁波" />
            </Form.Item>
            <Form.Item
              name="arrivalStation"
              label={<span className="text-xs">目的站</span>}
            >
              <Input placeholder="如：若季诺" />
            </Form.Item>
            <Form.Item
              name="liftingTime"
              label={<span className="text-xs">提箱时间</span>}
              getValueProps={(v: any) => ({ value: v ? dayjs(v) : undefined })}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              name="liftingOrderNo"
              label={<span className="text-xs">提箱令</span>}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="sendTime"
              label={<span className="text-xs">发运时间 (ATD)</span>}
              getValueProps={(v: any) => ({ value: v ? dayjs(v) : undefined })}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              name="eta"
              label={<span className="text-xs">预计到达 (ETA)</span>}
              getValueProps={(v: any) => ({ value: v ? dayjs(v) : undefined })}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              name="ata"
              label={<span className="text-xs">实际到达</span>}
              getValueProps={(v: any) => ({ value: v ? dayjs(v) : undefined })}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </div>

          <div className="text-xs font-bold text-[#198348] py-2 border-b border-dashed border-gray-200 mt-2">
            状态与还箱
          </div>
          <div className="grid grid-cols-2 gap-x-4">
            <Form.Item
              name="status"
              label={<span className="text-xs">状态</span>}
            >
              <Select options={statusOptions} />
            </Form.Item>
            <Form.Item
              name="statusRemark"
              label={<span className="text-xs">状态备注</span>}
            >
              <Input placeholder="如：MYC堆场" />
            </Form.Item>
            <Form.Item
              name="returnTime"
              label={<span className="text-xs">还箱时间</span>}
              getValueProps={(v: any) => ({ value: v ? dayjs(v) : undefined })}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              name="returnOrderNo"
              label={<span className="text-xs">还箱令</span>}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="dropYardId"
              label={<span className="text-xs">落箱堆场</span>}
            >
              <Select
                allowClear
                showSearch
                placeholder="选择落箱堆场"
                filterOption={(i, o) =>
                  ((o?.label as string) || "")
                    .toLowerCase()
                    .includes(i.toLowerCase())
                }
                options={yards}
                onChange={(val) => {
                  const y = yards.find((x: any) => x.value === val);
                  form.setFieldValue("dropYardName", y?.label ?? "");
                }}
              />
            </Form.Item>
            <Form.Item name="dropYardName" hidden>
              <Input />
            </Form.Item>
          </div>
        </Form>
      </div>
    </Modal>
  );
};
