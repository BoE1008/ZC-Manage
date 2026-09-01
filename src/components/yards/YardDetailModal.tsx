import React, { useState, useEffect } from "react";
import { Modal, Space, Button, Spin } from "antd";
import { getYardDetail } from "@/restApi/yard";

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
        const d = res?.entity?.data ?? res?.entity ?? null;
        setR(d);
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

  console.log(r);

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
        {/* 基本信息 */}
        <div>
          <div className="text-xs font-bold text-[#198348] pb-1 border-b border-dashed border-gray-200 mb-2">
            基本信息
          </div>
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <div>
              <div className="text-xs text-gray-400">堆场名称</div>
              <div className="text-gray-800 font-medium">
                {r.yardName || "-"}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400">区域</div>
              <div className="text-gray-800">
                {r.region ? (
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      r.region === "国内"
                        ? "bg-gray-100 text-gray-600"
                        : "bg-orange-100 text-orange-600"
                    }`}
                  >
                    {r.region}
                  </span>
                ) : (
                  "-"
                )}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400">所在城市</div>
              <div className="text-gray-800">{r.city || "-"}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">堆场地址</div>
              <div className="text-gray-800">{r.address || "-"}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">作业时间</div>
              <div className="text-gray-800">{r.workingTime || "-"}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">箱管电话</div>
              <div className="text-gray-800">{r.boxMgrPhone || "-"}</div>
            </div>
          </div>
        </div>

        {/* 联系方式 */}
        <div>
          <div className="text-xs font-bold text-[#198348] pb-1 border-b border-dashed border-gray-200 mb-2">
            联系方式
          </div>
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <div>
              <div className="text-xs text-gray-400">对接人</div>
              <div className="text-gray-800">{r.contactName || "-"}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">联系电话</div>
              <div className="text-gray-800">{r.contactPhone || "-"}</div>
            </div>
          </div>
        </div>

        {/* 关联供应商 */}
        <div>
          <div className="text-xs font-bold text-[#198348] pb-1 border-b border-dashed border-gray-200 mb-2">
            关联供应商（付款对象）
          </div>
          <div className="text-sm">
            <div className="text-xs text-gray-400">供应商</div>
            <div className="text-gray-800 font-medium">
              {r.supplierName || <span className="text-gray-400">未关联</span>}
            </div>
          </div>
        </div>

        {/* 备注 */}
        {(r.remark || r.remark === "") && (
          <div>
            <div className="text-xs font-bold text-[#198348] pb-1 border-b border-dashed border-gray-200 mb-2">
              备注
            </div>
            <div className="text-sm text-gray-600">{r.remark || "-"}</div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default YardDetailModal;
