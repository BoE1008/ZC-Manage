import { useState, useEffect } from "react";
import { Modal, Space, Button, Spin } from "antd";
import { ReleaseOrder } from "@/restApi/releaseOrder";
import { ReleaseTypeBadge, StatusBadge } from "@/components/ui/Badge";
import { getReleaseOrderDetail } from "@/restApi/releaseOrder";

interface Props {
  id: string;
  onClose: () => void;
  onEdit?: () => void;
  onConfirmPickup?: () => void;
}

export const ReleaseDetailModal = ({
  id,
  onClose,
  onEdit,
  onConfirmPickup,
}: Props) => {
  const [r, setR] = useState<ReleaseOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([getReleaseOrderDetail(id)])
      .then(([res]: any[]) => {
        const d = res?.entity?.data ?? res?.entity ?? null;
        setR(d);
        // 后端详情可能只返回 id 无名称：按 id 反查名称显示
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Modal
        title="放箱令详情"
        open
        onCancel={onClose}
        footer={null}
        width={560}
      >
        <div className="flex justify-center py-8">
          <Spin />
        </div>
      </Modal>
    );
  }

  if (!r) return null;

  return (
    <Modal
      title={`放箱令详情 - ${r.orderNo}`}
      open
      onCancel={onClose}
      width={560}
      destroyOnClose
      footer={
        <Space>
          <Button onClick={onClose}>关闭</Button>
          {onEdit && (
            <Button type="primary" onClick={onEdit}>
              编辑
            </Button>
          )}
          {r.status === "pending" && (
            <Button type="primary" onClick={onConfirmPickup}>
              确认已提箱
            </Button>
          )}
        </Space>
      }
    >
      <div className="grid grid-cols-2 gap-y-3 gap-x-5 text-sm">
        <div className="col-span-2 text-xs font-bold text-[#198348] pb-1 border-b border-dashed border-gray-200 -mt-2">
          放箱令信息
        </div>
        <div>
          <span className="text-xs text-gray-400 block">放箱令编号</span>
          <span className="font-medium">{r.orderNo || "-"}</span>
        </div>
        <div>
          <span className="text-xs text-gray-400 block">类型</span>
          <ReleaseTypeBadge type={(r.orderType as string) || ""} />
        </div>
        <div>
          <span className="text-xs text-gray-400 block">集装箱编号</span>
          <span className="font-medium text-[#198348]">
            {r.containerNo || "-"}
          </span>
        </div>
        <div>
          <span className="text-xs text-gray-400 block">买方/租方</span>
          <span className="font-medium">{r.buyerName || "-"}</span>
        </div>
        <div>
          <span className="text-xs text-gray-400 block">放箱堆场</span>
          <span className="font-medium">{r.yardName || "-"}</span>
        </div>
        <div>
          <span className="text-xs text-gray-400 block">收入</span>
          <span className="font-medium">
            {r.income != null ? `¥${r.income.toLocaleString()}` : "-"}
          </span>
        </div>
        <div>
          <span className="text-xs text-gray-400 block">客户提箱时间</span>
          <span className="font-medium">{r.pickupTime || "-"}</span>
        </div>
        <div>
          <span className="text-xs text-gray-400 block">状态</span>
          <StatusBadge status={(r.status as string) || ""} />
        </div>
        <div className="col-span-2">
          <span className="text-xs text-gray-400 block">备注</span>
          <span className="font-medium">{r.remark || "-"}</span>
        </div>
      </div>
    </Modal>
  );
};
