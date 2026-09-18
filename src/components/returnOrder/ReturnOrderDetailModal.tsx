import React, { useState, useEffect } from "react";
import { Modal, Spin, Button, Table, message } from "antd";
import { getReturnOrderDetail, downloadReturnOrderDoc } from "@/restApi/returnOrder";
import { getDictByCode } from "@/restApi/dict";
import { unwrapList, unwrapEntity, normalizeDictOptions, formatDate } from "@/utils";
import { InfoItem, SectionTitle } from "@/components/ui/InfoItem";

interface Props {
  id: string;
  onClose: () => void;
  onEdit?: () => void;
  onConfirm?: () => void;
}

const STATUS_MAP: Record<string, string> = {
  pending: "待还箱",
  returned: "已还箱",
};

const ReturnOrderDetailModal: React.FC<Props> = ({ id, onClose, onEdit, onConfirm }) => {
  const [loading, setLoading] = useState(true);
  const [r, setR] = useState<any>(null);
  const [typeOptions, setTypeOptions] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    getDictByCode("return_order_type")
      .then((res) => setTypeOptions(normalizeDictOptions(unwrapList(res))))
      .catch(() => setTypeOptions([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    getReturnOrderDetail(id)
      .then((res: any) => {
        const entity = unwrapEntity(res);
        setR(entity);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const typeLabel = (v?: string) =>
    typeOptions.find((o) => o.value === v)?.label ?? v ?? "-";

  const handleDownload = async () => {
    try {
      const blob = await downloadReturnOrderDoc(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `还箱单-${r?.orderNo || id}.doc`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      message.error("下载失败");
    }
  };

  if (loading) {
    return (
      <Modal
        title="还箱令详情"
        open
        onCancel={onClose}
        footer={null}
        width={640}
      >
        <div className="flex justify-center py-10">
          <Spin size="large" />
        </div>
      </Modal>
    );
  }

  if (!r) return null;

  const isPending = r.status === "pending";
  const boxes = r.boxes ?? [];
  const boxCount = boxes.length;

  const columns: any[] = [
    {
      title: "箱号",
      dataIndex: "containerNo",
      key: "containerNo",
      render: (v: any) => <span className="font-mono">{v ?? "-"}</span>,
    },
    {
      title: "还箱时间",
      dataIndex: "returnTime",
      key: "returnTime",
      render: (v: any) => formatDate(v),
    },
    {
      title: "实际还箱堆场",
      dataIndex: "actualYardName",
      key: "actualYardName",
      render: (v: any) =>
        v ? (
          <span className="text-[#198348] font-medium">{v}</span>
        ) : (
          <span className="text-gray-400">待确认</span>
        ),
    },
  ];

  return (
    <Modal
      title={
        <span className="text-[#198348] font-bold">还箱令详情 - {r.orderNo}</span>
      }
      open
      onCancel={onClose}
      width={640}
      destroyOnClose
      footer={[
        <Button key="close" onClick={onClose}>
          关闭
        </Button>,
        <Button key="download" onClick={handleDownload}>
          下载 Word 还箱单
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
        isPending && onConfirm ? (
          <Button
            key="confirm"
            type="primary"
            style={{ background: "#8B5CF6", borderColor: "#8B5CF6" }}
            onClick={() => {
              onClose();
              onConfirm();
            }}
          >
            确认还箱
          </Button>
        ) : null,
      ]}
    >
      <SectionTitle>还箱令信息</SectionTitle>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-1">
        <InfoItem label="还箱令编号" value={r.orderNo} />
        <InfoItem
          label="还箱类型"
          value={
            r.orderType ? (
              <span
                className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                  r.orderType === "rent_return"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {typeLabel(r.orderType)}
              </span>
            ) : undefined
          }
        />
        <InfoItem label="还箱城市" value={r.city} />
        <InfoItem
          label="堆场"
          value={r.yardName ?? (r.yardId ? `ID: ${r.yardId}` : undefined) ?? "未指定"}
        />
        <InfoItem
          label="状态"
          value={
            <span
              className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                isPending
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {STATUS_MAP[r.status] ?? r.status ?? "-"}
            </span>
          }
        />
        <InfoItem label="还箱时间" value={formatDate(r.returnTime)} />
        <InfoItem label="创建时间" value={formatDate(r.createTime, r.createTime || "-")} />
        <InfoItem label="备注" value={r.remark} colSpan="col-span-2" />
      </div>

      <div className="text-xs font-bold text-[#198348] py-1 border-b border-dashed border-gray-200 my-3">
        还箱明细（{boxCount} 个箱子）
      </div>
      <Table
        columns={columns}
        dataSource={boxes}
        rowKey="containerNo"
        size="small"
        pagination={false}
        scroll={{ x: 400 }}
        locale={{ emptyText: "暂无明细" }}
      />
    </Modal>
  );
};

export default ReturnOrderDetailModal;
