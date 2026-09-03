import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { Modal, Space, Button, Spin, Table, message } from "antd";
import {
  getReturnOrderDetail,
  downloadReturnOrderDoc,
} from "@/restApi/returnOrder";

interface Props {
  id: string;
  onClose: () => void;
  onEdit: () => void;
  onConfirm: () => void;
}

const TYPE_MAP: Record<string, string> = {
  customer_return: "客户还箱",
  rent_return: "租箱归还",
};
const STATUS_MAP: Record<string, string> = {
  pending: "待还箱",
  returned: "已还箱",
};

const ReturnOrderDetailModal: React.FC<Props> = ({
  id,
  onClose,
  onEdit,
  onConfirm,
}) => {
  const [r, setR] = useState<any>(null);
  const [boxes, setBoxes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getReturnOrderDetail(id)
      .then((res: any) => {
        const entity = res?.entity ?? {};
        setR(entity?.data ?? null);
        setBoxes(Array.isArray(entity?.boxes) ? entity.boxes : []);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const blob = (await downloadReturnOrderDoc(id)) as Blob;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `还箱单-${r?.orderNo ?? id}.doc`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      message.error("下载失败");
    } finally {
      setDownloading(false);
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
        <div className="flex justify-center py-8">
          <Spin />
        </div>
      </Modal>
    );
  }

  if (!r) return null;

  const isPending = r.status === "pending";
  const boxCount = boxes.length;

  const detailColumns: any[] = [
    { title: "箱号", dataIndex: "containerNo", width: 150 },
    {
      title: "还箱时间",
      dataIndex: "returnTime",
      width: 120,
      render: (v: string) =>
        v && v !== "-" && dayjs(v).isValid()
          ? dayjs(v).format("YYYY-MM-DD")
          : "-",
    },
    {
      title: "实际还箱堆场",
      dataIndex: "actualYardName",
      render: (v: string) =>
        v && v !== "-" ? (
          <span className="text-[#198348] font-medium">{v}</span>
        ) : (
          <span className="text-gray-400">待确认</span>
        ),
    },
  ];

  return (
    <Modal
      title={`还箱令详情 - ${r.orderNo ?? ""}`}
      open
      onCancel={onClose}
      width={640}
      destroyOnClose
      footer={
        <Space>
          <Button onClick={onClose}>关闭</Button>
          <Button onClick={handleDownload} loading={downloading}>
            📄 下载 Word 还箱单
          </Button>
          <Button
            type="primary"
            onClick={() => {
              onClose();
              onEdit();
            }}
          >
            编辑
          </Button>
          {isPending && (
            <Button
              onClick={() => {
                onClose();
                onConfirm();
              }}
              style={{
                background: "#8B5CF6",
                borderColor: "#8B5CF6",
                color: "#fff",
              }}
            >
              确认还箱
            </Button>
          )}
        </Space>
      }
    >
      <div className="space-y-3">
        <div>
          <div className="text-xs font-bold text-[#198348] pb-1 border-b border-dashed border-gray-200 mb-2">
            还箱令信息
          </div>
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <div>
              <div className="text-xs text-gray-400">还箱令编号</div>
              <div className="text-gray-800 font-medium">
                {r.orderNo ?? "-"}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400">类型</div>
              <div>
                <span
                  className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                    r.orderType === "rent_return"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {TYPE_MAP[r.orderType] ?? r.orderType ?? "-"}
                </span>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400">还箱堆场（计划）</div>
              <div className="text-gray-800">
                {r.yardName ? (
                  <span className="text-[#198348]">{r.yardName}</span>
                ) : r.yardId ? (
                  <span className="text-[#198348]">ID: {r.yardId}</span>
                ) : (
                  <span className="text-gray-400">未指定</span>
                )}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400">状态</div>
              <div>
                <span
                  className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                    r.status === "pending"
                      ? "bg-amber-100 text-amber-700"
                      : r.status === "returned"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {STATUS_MAP[r.status] ?? r.status ?? "-"}
                </span>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400">制单人</div>
              <div className="text-gray-800">
                {r.maker || r.createBy || "-"}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400">实际还箱时间</div>
              <div className="text-gray-800">
                {r.returnTime &&
                r.returnTime !== "-" &&
                dayjs(r.returnTime).isValid()
                  ? dayjs(r.returnTime).format("YYYY-MM-DD")
                  : "-"}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400">创建时间</div>
              <div className="text-gray-800">
                {r.createTime && dayjs(r.createTime).isValid()
                  ? dayjs(r.createTime).format("YYYY-MM-DD")
                  : r.createTime || "-"}
              </div>
            </div>
            <div className="col-span-2">
              <div className="text-xs text-gray-400">备注</div>
              <div className="text-gray-800">{r.remark || "-"}</div>
            </div>
          </div>
        </div>

        <div>
          <div className="text-xs font-bold text-[#198348] pb-1 border-b border-dashed border-gray-200 mb-2">
            还箱明细（{boxCount} 个箱子）
          </div>
          <Table
            columns={detailColumns}
            dataSource={boxes.map((b: any, i: number) => ({
              ...b,
              key: i,
            }))}
            size="small"
            pagination={false}
            scroll={{ x: 400 }}
            locale={{ emptyText: "暂无明细" }}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ReturnOrderDetailModal;
