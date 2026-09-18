import React, { useEffect, useState } from "react";
import { Modal, Spin, Button } from "antd";
import { getProjectConfigByProjectId } from "@/restApi/projectConfig";
import { unwrapEntity, formatDate } from "@/utils";
import { InfoItem, SectionTitle } from "@/components/ui/InfoItem";

interface Props {
  id: string | null | undefined;
  onClose: () => void;
  onEdit?: () => void;
}

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
        setData(unwrapEntity(res));
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
          <SectionTitle className="col-span-2">项目信息</SectionTitle>
          <InfoItem label="项目编号" value={d.projectNum} />
          <InfoItem label="项目名称" value={d.projectName} />

          <SectionTitle className="col-span-2">提醒规则</SectionTitle>
          <InfoItem
            label="堆存超期提醒天数"
            value={d.overdueAlertDays != null ? `${d.overdueAlertDays} 天` : undefined}
          />
          <InfoItem
            label="到站提醒天数"
            value={d.etaAlertDays != null ? `${d.etaAlertDays} 天` : undefined}
          />

          <SectionTitle className="col-span-2">超期计费规则</SectionTitle>
          <InfoItem
            label="到站后免费天数"
            value={d.arrivalOverdueDays != null ? `${d.arrivalOverdueDays} 天` : undefined}
          />
          <InfoItem
            label="超期单价"
            value={
              d.arrivalOverdueUnitPrice != null
                ? `USD ${Number(d.arrivalOverdueUnitPrice).toFixed(2)} / 天 / 柜`
                : undefined
            }
          />

          <SectionTitle className="col-span-2">备注</SectionTitle>
          <InfoItem label="备注" value={d.remark} colSpan="col-span-2" />

          <SectionTitle className="col-span-2">系统信息</SectionTitle>
          <InfoItem label="创建人" value={d.createBy} />
          <InfoItem label="更新人" value={d.updateBy} />
          <InfoItem label="创建时间" value={formatDate(d.createTime, "-", "YYYY-MM-DD HH:mm:ss")} />
          <InfoItem label="更新时间" value={formatDate(d.updateTime, "-", "YYYY-MM-DD HH:mm:ss")} />
        </div>
      </Spin>
    </Modal>
  );
};

export default ProjectConfigDetailModal;
