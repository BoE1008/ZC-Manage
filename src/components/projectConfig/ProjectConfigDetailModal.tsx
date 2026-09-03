import React, { useEffect, useState } from "react";
import { Modal, Spin, Button } from "antd";
import dayjs from "dayjs";
import { getProjectConfigByProjectId } from "@/restApi/projectConfig";

interface Props {
  id: string | null | undefined;
  onClose: () => void;
  onEdit?: () => void;
}

const Row: React.FC<{ label: string; children: React.ReactNode; span?: number }> = ({
  label,
  children,
  span = 1,
}) => (
  <div className={span === 2 ? "col-span-2" : ""}>
    <span className="text-xs text-gray-400 block">{label}</span>
    <span className="font-medium">{children || "-"}</span>
  </div>
);

export const ProjectConfigDetailModal: React.FC<Props> = ({
  id,
  onClose,
  onEdit,
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!id) {
      setData(null);
      return;
    }
    setLoading(true);
    getProjectConfigByProjectId(id as string)
      .then((res: any) => {
        setData(res?.entity?.data ?? res?.entity ?? null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const d = data ?? {};

  return (
    <Modal
      title={
        <span className="text-[#198348] font-bold">
          项目-集装箱配置详情 - {d.projectName || d.projectId || "-"}
        </span>
      }
      open={true}
      onCancel={onClose}
      width={680}
      footer={[
        <Button key="close" onClick={onClose}>
          关闭
        </Button>,
        onEdit ? (
          <Button
            key="edit"
            type="primary"
            style={{ background: "#198348", borderColor: "#198348" }}
            onClick={() => {
              onClose();
              onEdit();
            }}
          >
            编辑
          </Button>
        ) : null,
      ]}
    >
      <Spin spinning={loading}>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 mt-2">
          {/* 项目信息 */}
          <div className="col-span-2 text-xs font-bold text-[#198348] py-1 border-b border-dashed border-gray-200">
            项目信息
          </div>
          <Row label="项目编号">{d.projectNum ?? "-"}</Row>
          <Row label="项目名称">{d.projectName ?? "-"}</Row>
          <Row label="项目ID">{d.projectId ?? "-"}</Row>

          {/* 提醒规则 */}
          <div className="col-span-2 text-xs font-bold text-[#198348] py-1 border-b border-dashed border-gray-200 mt-2">
            提醒规则
          </div>
          <Row label="堆存超期提醒天数">
            {d.overdueAlertDays != null ? `${d.overdueAlertDays} 天` : "-"}
          </Row>
          <Row label="到站提醒天数">
            {d.etaAlertDays != null ? `${d.etaAlertDays} 天` : "-"}
          </Row>

          {/* 超期计费规则 */}
          <div className="col-span-2 text-xs font-bold text-[#198348] py-1 border-b border-dashed border-gray-200 mt-2">
            超期计费规则
          </div>
          <Row label="到站后免费天数">
            {d.arrivalOverdueDays != null ? `${d.arrivalOverdueDays} 天` : "-"}
          </Row>
          <Row label="超期单价">
            {d.arrivalOverdueUnitPrice != null
              ? `USD ${Number(d.arrivalOverdueUnitPrice).toFixed(2)} / 天 / 柜`
              : "-"}
          </Row>

          {/* 备注 */}
          <div className="col-span-2 text-xs font-bold text-[#198348] py-1 border-b border-dashed border-gray-200 mt-2">
            备注
          </div>
          <Row label="备注" span={2}>
            {d.remark || "-"}
          </Row>

          {/* 系统字段 */}
          <div className="col-span-2 text-xs font-bold text-[#198348] py-1 border-b border-dashed border-gray-200 mt-2">
            系统信息
          </div>
          <Row label="创建人">{d.createBy || "-"}</Row>
          <Row label="更新人">{d.updateBy || "-"}</Row>
          <Row label="创建时间">
            {d.createTime && dayjs(d.createTime).isValid()
              ? dayjs(d.createTime).format("YYYY-MM-DD HH:mm:ss")
              : "-"}
          </Row>
          <Row label="更新时间">
            {d.updateTime && dayjs(d.updateTime).isValid()
              ? dayjs(d.updateTime).format("YYYY-MM-DD HH:mm:ss")
              : "-"}
          </Row>
        </div>
      </Spin>
    </Modal>
  );
};

export default ProjectConfigDetailModal;