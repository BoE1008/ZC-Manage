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
import { addTracking, editTracking } from "@/restApi/tracking";
import { getSuppliersList } from "@/restApi/supplyer";
import { getAllProjectList } from "@/restApi/project";
import { getDictOptions, getDictOptionsSync } from "@/restApi/dictCache";
import type { DictOption } from "@/types/dict";

interface Props {
  id: string | null;
  containers: Container[];
  shipments: ContainerTracking[];
  onSave: (id: string | null, data: Partial<ContainerTracking>) => void;
  onClose: () => void;
}

const SEGMENT_OPTIONS = [
  { label: "去程 outbound", value: "outbound" },
  { label: "回程 inbound", value: "inbound" },
];

export const ShipmentModal = ({
  id,
  containers,
  shipments,
  onSave,
  onClose,
}: Props) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<
    { label: string; value: string }[]
  >([]);
  const editing = id ? shipments.find((s) => s.id === id) : null;
  const [projects, setProjects] = useState<any[]>([]);
  const [projectLoading, setProjectLoading] = useState(false);
  const [statusOptions, setStatusOptions] = useState<DictOption[]>(getDictOptionsSync("container_status"));
  // 缓存拉到的原始数据，只在 id 变化时更新，之后 suppliers/projects 变化不重复触发日期回填
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
    setProjectLoading(true);
    getAllProjectList()
      .then((r: any) => {
        setProjects(r.entity?.data ?? []);
      })
      .finally(() => setProjectLoading(false));
    getDictOptions("container_status").then(setStatusOptions);
  }, []);

  // 打开弹框时缓存原始数据，日期+下拉+项目一次性处理完毕
  useEffect(() => {
    if (!editing) {
      rawDataRef.current = null;
      form.resetFields();
      return;
    }
    const vals: any = { ...editing };
    // 下拉 id 反查
    // 日期 dayjs 化
    (["sendTime", "eta", "ata", "dropTime", "returnTime"] as const).forEach(
      (f) => {
        const raw = vals[f] as string;
        if (!raw || raw === "0000-00-00") return;
        const d = dayjs(raw);
        if (d.isValid()) vals[f] = d;
      },
    );
    // 项目
    if (!vals.projectId && vals.projectName && projects.length) {
      vals.projectId = projects.find(
        (x: any) => x.name === vals.projectName,
      )?.id;
    }
    rawDataRef.current = vals;
    form.setFieldsValue(vals);
  }, [editing]);

  // suppliers/projects 变化时，只更新下拉和项目，不碰日期
  useEffect(() => {
    if (!rawDataRef.current) return;
    const vals = { ...rawDataRef.current };
    // 下拉重新查 id
    // 项目
    if (!vals.projectId && vals.projectName && projects.length) {
      vals.projectId = projects.find(
        (x: any) => x.name === vals.projectName,
      )?.id;
    }
    form.setFieldsValue(vals);
  }, [suppliers, projects]);

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
      // 根据箱号补充集装箱 id
      const matched = containers.find(
        (c) => c.containerNo === values.containerNo,
      );
      if (matched) payload.containerId = matched.id;
      payload.projectName = projects.find(
        (x: any) => x.id === values.projectId,
      )?.name;
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
      title={editing ? `编辑运踪 - ${editing.containerNo}` : "新增运踪"}
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
        <Form form={form} layout="vertical" initialValues={editing || {}}>
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
                options={containers.map((c) => ({
                  label: `${c.containerNo}`,
                  value: c.containerNo,
                }))}
              />
            </Form.Item>
            <Form.Item
              name="projectId"
              label={
                <span className="text-xs">
                  项目名称 <span className="text-red-500">*</span>
                </span>
              }
              rules={[{ required: true }]}
            >
              <Select
                allowClear
                showSearch
                placeholder="请选择项目"
                loading={projectLoading}
                filterOption={(i, o) =>
                  ((o?.label as string) || "")
                    .toLowerCase()
                    .includes(i.toLowerCase())
                }
                options={projects.map((p: any) => ({
                  label: p.name,
                  value: p.id,
                }))}
              />
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
          </div>
        </Form>
      </div>
    </Modal>
  );
};
