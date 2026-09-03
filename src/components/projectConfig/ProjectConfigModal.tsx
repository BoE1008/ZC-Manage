import React, { useEffect, useState } from "react";
import { Modal, Form, Select, InputNumber, Input, message, Spin } from "antd";
import {
  saveProjectConfig,
  getProjectConfigByProjectId,
  ProjectContainerConfig,
} from "@/restApi/projectConfig";
import { getAllProjectList } from "@/restApi/project";

interface Props {
  id: string | null | undefined;
  onClose: () => void;
  onSaved: () => void;
}

export const ProjectConfigModal: React.FC<Props> = ({ id, onClose, onSaved }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [initLoading, setInitLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectProject, setSelectProject] = useState<any>(null);

  const isEdit = !!id;

  // 加载项目列表（与 ContainerModal 一致）
  useEffect(() => {
    (async () => {
      try {
        const r: any = await getAllProjectList();
        const list = r?.entity?.data ?? [];
        setProjects(
          list.map((p: any) => ({
            id: p.id,
            name: p.name,
            num: p.num ?? p.projectNum ?? "",
          })),
        );
      } catch {
        setProjects([]);
      }
    })();
  }, []);

  // 编辑回显
  useEffect(() => {
    if (!id) {
      form.resetFields();
      setSelectProject(null);
      return;
    }
    setInitLoading(true);
    getProjectConfigByProjectId(id as string)
      .then((res: any) => {
        const d = res?.entity?.data ?? res?.entity ?? {};
        // 反查 selectProject：先用本地列表，匹配不到时用响应里的 name/num 兜底
        const proj = projects.find((p) => p.id === d.projectId);
        setSelectProject(
          proj ?? {
            id: d.projectId,
            name: d.projectName ?? "",
            num: d.projectNum ?? "",
          },
        );
        form.setFieldsValue({
          projectNum: d.projectId ?? "",
          overdueAlertDays: d.overdueAlertDays ?? 30,
          etaAlertDays: d.etaAlertDays ?? 3,
          arrivalOverdueDays: d.arrivalOverdueDays ?? 0,
          arrivalOverdueUnitPrice: d.arrivalOverdueUnitPrice ?? 10,
          remark: d.remark ?? "",
        });
      })
      .finally(() => setInitLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleProjectChanged = (v: any) => {
    const proj = projects.find((p) => p.id === v);
    setSelectProject(proj ?? null);
    form.setFieldValue("projectNum", v);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const payload: any = {
        projectId: values.projectNum,
        projectName: selectProject?.name ?? "",
        overdueAlertDays: values.overdueAlertDays,
        etaAlertDays: values.etaAlertDays,
        arrivalOverdueDays: values.arrivalOverdueDays,
        arrivalOverdueUnitPrice: values.arrivalOverdueUnitPrice,
        remark: values.remark,
      };
      // save 接口：id 缺省即新增，带 id 即编辑
      if (isEdit) payload.id = id;
      await saveProjectConfig(payload as any);
      message.success(isEdit ? "配置已更新" : "配置已新建");
      onSaved();
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error((isEdit ? "更新" : "新建") + "失败：" + (e?.message ?? "未知错误"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={
        <span className="text-[#198348] font-bold">
          {isEdit ? "编辑项目-集装箱配置" : "新建项目-集装箱配置"}
        </span>
      }
      open={true}
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={submitting}
      okText={isEdit ? "保存" : "新建"}
      cancelText="取消"
      okButtonProps={{ style: { background: "#198348", borderColor: "#198348" } }}
      width={640}
      destroyOnClose
    >
      <Spin spinning={initLoading}>
        <Form form={form} layout="vertical" className="mt-2">
          {/* 项目 */}
          <div className="text-xs font-bold text-[#198348] py-1 border-b border-dashed border-gray-200 mb-3">
            项目
          </div>
          <Form.Item
            name="projectNum"
            label={<span className="text-xs">项目编号 *</span>}
            rules={[{ required: true, message: "请选择项目" }]}
          >
            <Select
              showSearch
              placeholder="选择项目（按编号搜索）"
              disabled={isEdit}
              options={projects.map((p) => ({
                label: p.num || p.name,
                value: p.id,
              }))}
              filterOption={(i, o) =>
                ((o?.label as string) || "").toLowerCase().includes(i.toLowerCase())
              }
              onChange={handleProjectChanged}
            />
          </Form.Item>
          <Form.Item label={<span className="text-xs">项目名称</span>}>
            <div className="px-3 py-1 text-sm text-gray-700 bg-gray-50 rounded border border-gray-200 min-h-[32px]">
              {selectProject?.name || "-"}
            </div>
            {/* 响应里有 projectName 时优先用响应值显示 */}
            {selectProject && !selectProject.name && (
              <div className="text-xs text-gray-400 mt-1">
                （{selectProject.num}）
              </div>
            )}
          </Form.Item>

          {/* 提醒规则 */}
          <div className="text-xs font-bold text-[#198348] py-1 border-b border-dashed border-gray-200 mb-3 mt-2">
            提醒规则
          </div>
          <div className="grid grid-cols-2 gap-x-4">
            <Form.Item
              name="overdueAlertDays"
              label={
                <span className="text-xs">
                  堆存超期提醒天数（超过 ata + 该天数则提醒）
                </span>
              }
              rules={[{ required: true, message: "请填写" }]}
            >
              <InputNumber min={0} max={365} className="w-full" addonAfter="天" />
            </Form.Item>
            <Form.Item
              name="etaAlertDays"
              label={
                <span className="text-xs">
                  到站提醒天数（eta - 当前 ≤ 该天数则提醒）
                </span>
              }
              rules={[{ required: true, message: "请填写" }]}
            >
              <InputNumber min={0} max={60} className="w-full" addonAfter="天" />
            </Form.Item>
          </div>

          {/* 超期计费规则 */}
          <div className="text-xs font-bold text-[#198348] py-1 border-b border-dashed border-gray-200 mb-3 mt-2">
            超期计费规则
          </div>
          <div className="grid grid-cols-2 gap-x-4">
            <Form.Item
              name="arrivalOverdueDays"
              label={
                <span className="text-xs">
                  到站后免费天数（超出该天数才计超期费）
                </span>
              }
              rules={[{ required: true, message: "请填写" }]}
            >
              <InputNumber min={0} max={60} className="w-full" addonAfter="天" />
            </Form.Item>
            <Form.Item
              name="arrivalOverdueUnitPrice"
              label={
                <span className="text-xs">
                  超期单价（每天/柜，美元）
                </span>
              }
              rules={[{ required: true, message: "请填写" }]}
            >
              <InputNumber
                min={0}
                step={0.5}
                precision={2}
                className="w-full"
                addonAfter="USD/天/柜"
              />
            </Form.Item>
          </div>

          {/* 备注 */}
          <Form.Item
            name="remark"
            label={<span className="text-xs">备注</span>}
            className="mt-2"
          >
            <Input.TextArea
              rows={3}
              maxLength={500}
              placeholder="可填写本项目特殊计费/提醒说明"
              showCount
            />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default ProjectConfigModal;