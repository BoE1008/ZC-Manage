import { Modal, Space, Button } from 'antd';
import { Release } from '@/types';
import { ReleaseTypeBadge, StatusBadge } from '@/components/ui/Badge';

interface Props {
  id: number;
  releases: Release[];
  onClose: () => void;
  onEdit: () => void;
  onConfirmPickup: () => void;
}

export const ReleaseDetailModal = ({ id, releases, onClose, onEdit, onConfirmPickup }: Props) => {
  const r = releases.find((x) => x.id === id);
  if (!r) return null;

  return (
    <Modal
      title={`放箱令详情 - ${r.no}`}
      open
      onCancel={onClose}
      width={560}
      destroyOnClose
      footer={
        <Space>
          <Button onClick={onClose}>关闭</Button>
          <Button type="primary" onClick={onEdit}>
            编辑
          </Button>
          {r.status === '待提箱' && (
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
          <span className="font-medium">{r.no}</span>
        </div>
        <div>
          <span className="text-xs text-gray-400 block">类型</span>
          <ReleaseTypeBadge type={r.type} />
        </div>
        <div>
          <span className="text-xs text-gray-400 block">箱号</span>
          <span className="font-medium text-[#198348]">{r.boxNo}</span>
        </div>
        <div>
          <span className="text-xs text-gray-400 block">买方/租方</span>
          <span className="font-medium">{r.buyer}</span>
        </div>
        <div>
          <span className="text-xs text-gray-400 block">放箱堆场</span>
          <span className="font-medium">{r.yard}</span>
        </div>
        <div>
          <span className="text-xs text-gray-400 block">收入 (USD)</span>
          <span className="font-medium">{r.income || '-'}</span>
        </div>
        <div>
          <span className="text-xs text-gray-400 block">生成时间</span>
          <span className="font-medium">{r.genDate}</span>
        </div>
        <div>
          <span className="text-xs text-gray-400 block">客户提箱时间</span>
          <span className="font-medium">{r.pickupDate || '-'}</span>
        </div>
        <div>
          <span className="text-xs text-gray-400 block">状态</span>
          <StatusBadge status={r.status} />
        </div>
      </div>
    </Modal>
  );
}
