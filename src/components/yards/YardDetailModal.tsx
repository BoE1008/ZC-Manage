import React, { useState, useEffect } from "react";
import { Modal, Space, Button, Spin } from "antd";
import { getYardDetail } from "@/restApi/yard";
import { unwrapEntity } from "@/utils";
import { InfoItem, SectionTitle } from "@/components/ui/InfoItem";

interface Props {
  id: string;
  onClose: () => void;
  onEdit: () => void;
}

interface YardInfo {
  id?: string;
  yardName?: string;
  region?: string;
  city?: string;
  address?: string;
  contactName?: string;
  contactPhone?: string;
  workingTime?: string;
  boxMgrPhone?: string;
  supplierName?: string;
  remark?: string;
}

const YardDetailModal: React.FC<Props> = ({ id, onClose, onEdit }) => {
  const [r, setR] = useState<YardInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getYardDetail(id)
      .then((res: any) => {
        setR(unwrapEntity(res));
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Modal title="堆场详情" open onCancel={onClose} footer={null} width={560}>
        <div className="flex justify-center py-8">
          <Spin />
        </div>
      </Modal>
    );
  }

  if (!r) return null;

  return (
    <Modal
      title={`堆场详情 - ${r.yardName}`}
      open
      onCancel={onClose}
      width={560}
      destroyOnClose
      footer={
        <Space>
          <Button onClick={onClose}>关闭</Button>
          <Button
            type="primary"
            onClick={() => {
              onClose();
              onEdit();
            }}
          >
            编辑
          </Button>
        </Space>
      }
    >
      <div className="space-y-3">
        <SectionTitle>基本信息</SectionTitle>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <InfoItem label="堆场名称" value={r.yardName} />
          <InfoItem
            label="区域"
            value={
              r.region ? (
                <span
                  className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                    r.region === "国内"
                      ? "bg-gray-100 text-gray-600"
                      : "bg-orange-100 text-orange-600"
                  }`}
                >
                  {r.region}
                </span>
              ) : undefined
            }
          />
          <InfoItem label="所在城市" value={r.city} />
          <InfoItem label="堆场地址" value={r.address} />
          <InfoItem label="作业时间" value={r.workingTime} />
          <InfoItem label="箱管电话" value={r.boxMgrPhone} />
        </div>

        <SectionTitle>联系方式</SectionTitle>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <InfoItem label="对接人" value={r.contactName} />
          <InfoItem label="联系电话" value={r.contactPhone} />
        </div>

        <SectionTitle>关联供应商（付款对象）</SectionTitle>
        <div className="grid grid-cols-1 gap-y-3">
          <InfoItem
            label="供应商"
            value={r.supplierName || undefined}
            emptyClassName="text-gray-400"
          />
        </div>

        {(r.remark || r.remark === "") && (
          <>
            <SectionTitle>备注</SectionTitle>
            <div className="text-sm text-gray-600">{r.remark || "-"}</div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default YardDetailModal;
