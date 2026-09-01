import { useState, useEffect } from "react";
import { Modal, Space, Button, Spin, message } from "antd";
import dayjs from "dayjs";
import {
  getReleaseOrderDetail,
  downloadReleaseOrderDoc,
} from "@/restApi/releaseOrder";
import { ReleaseTypeBadge, StatusBadge } from "@/components/ui/Badge";

interface Props {
  id: string;
  onClose: () => void;
  onEdit?: () => void;
  onConfirmPickup?: () => void;
}

interface BoxItem {
  containerNo?: string;
  pickupTime?: string;
  specialDescr?: string;
  matched?: string;
  plateNo?: string;
  driverName?: string;
  driverPhone?: string;
  releaseId?: string;
  containerId?: string;
}

interface ReleaseData {
  id?: string;
  orderNo?: string;
  orderType?: string;
  region?: string;
  buyerId?: string;
  buyerName?: string;
  yardId?: string;
  yardName?: string;
  containerId?: string;
  containerNo?: string;
  deadline?: string;
  maker?: string;
  status?: string;
  pickupTime?: string;
  income?: number;
  remark?: string;
  releaseMethod?: string;
  containerType?: string;
  quantity?: number;
  releaseDate?: string;
  createBy?: string;
  createTime?: string;
}

export const ReleaseDetailModal = ({
  id,
  onClose,
  onEdit,
  onConfirmPickup,
}: Props) => {
  const [r, setR] = useState<ReleaseData | null>(null);
  const [boxes, setBoxes] = useState<BoxItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getReleaseOrderDetail(id)
      .then((res: any) => {
        const entity = res?.entity ?? {};
        setR(entity.data ?? null);
        setBoxes(Array.isArray(entity.boxes) ? entity.boxes : []);
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
        width={720}
      >
        <div className="flex justify-center py-8">
          <Spin />
        </div>
      </Modal>
    );
  }

  if (!r) return null;

  const downloadWord = async () => {
    if (!id) {
      message.error("放箱令 id 缺失");
      return;
    }
    try {
      message.loading({ content: "正在下载放箱单...", key: "doc" });
      const res: any = await downloadReleaseOrderDoc(id);
      const blob = res.data as Blob;

      // 优先解析服务端 Content-Disposition 的文件名
      let filename = `放箱单_${r?.orderNo ?? id}.docx`;
      const cd =
        res.headers?.["content-disposition"] ??
        res.headers?.["Content-Disposition"] ??
        "";
      const match = /filename\*?=(?:UTF-8''|")?([^;"]+)/i.exec(cd);
      if (match && match[1]) {
        try {
          filename = decodeURIComponent(match[1].trim().replace(/\\"/g, ""));
        } catch {
          filename = match[1].trim().replace(/\\"/g, "");
        }
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      message.error({ content: "下载失败", key: "doc" });
    }
  };

  return (
    <Modal
      title={
        <span className="text-[#198348] font-bold">
          放箱令详情 - {r.orderNo}
        </span>
      }
      open
      onCancel={onClose}
      width={720}
      destroyOnClose
      footer={
        <Space>
          <Button onClick={onClose}>关闭</Button>
          <Button onClick={downloadWord}>📄 下载 Word 放箱单</Button>
          {onEdit && (
            <Button type="primary" onClick={onEdit}>
              编辑
            </Button>
          )}
        </Space>
      }
    >
      <div className="text-xs text-gray-400 mb-2">
        <span className="text-[#198348]">📋</span> 放箱令基本信息 + Word
        模板中同款明细表
      </div>

      {/* 放箱令信息 9 项栅格 */}
      <div className="grid grid-cols-3 gap-y-2.5 gap-x-4 text-sm bg-white">
        <div className="col-span-3 text-xs font-bold text-[#198348] pb-1 border-b border-dashed border-gray-200 mb-1">
          放箱令信息
        </div>

        <div>
          <div className="text-xs text-gray-400">放箱令编号</div>
          <div className="font-medium text-[#198348]">{r.orderNo || "-"}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">类型</div>
          <div className="font-medium">
            <ReleaseTypeBadge type={(r.orderType as string) || ""} />
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400">箱数</div>
          <div className="font-medium">{boxes.length || "-"}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">放箱方式</div>
          <div className="font-medium">
            {r.releaseMethod === "designated"
              ? "指定箱号"
              : r.releaseMethod === "undesignated"
                ? "不指定箱号"
                : "-"}
          </div>
        </div>

        <div>
          <div className="text-xs text-gray-400">箱型</div>
          <div className="font-medium">{r.containerType || "-"}</div>
        </div>

        <div>
          <div className="text-xs text-gray-400">放箱数量</div>
          <div className="font-medium">
            {r.quantity != null ? r.quantity : "-"}
          </div>
        </div>

        <div>
          <div className="text-xs text-gray-400">放箱地区</div>
          <div className="font-medium">{r.region || "-"}</div>
        </div>

        <div>
          <div className="text-xs text-gray-400">买方/租方</div>
          <div className="font-medium">{r.buyerName || "-"}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">放箱堆场</div>
          <div className="font-medium">
            {r.yardName && r.yardName !== "-" ? (
              r.yardName
            ) : r.yardId ? (
              <span className="text-xs text-gray-500">堆场ID: {r.yardId}</span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-500 text-xs">
                未指定
              </span>
            )}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400">指令期限</div>
          <div className="font-medium">{r.deadline || "-"}</div>
        </div>

        <div>
          <div className="text-xs text-gray-400">收入 (USD)</div>
          <div className="font-medium">
            {r.income != null
              ? `USD ${Number(r.income).toLocaleString()}`
              : "-"}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400">生成时间 / 制单</div>
          <div className="font-medium text-xs">
            {r.createTime && dayjs(r.createTime).isValid()
              ? dayjs(r.createTime).format("YYYY-MM-DD")
              : "-"}{" "}
            / {r.maker || r.createBy || "-"}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-400">状态</div>
          <div className="font-medium">
            <StatusBadge status={(r.status as string) || ""} />
          </div>
        </div>

        {r.remark && (
          <div className="col-span-3">
            <div className="text-xs text-gray-400">备注</div>
            <div className="text-xs">{r.remark}</div>
          </div>
        )}
      </div>

      {/* 放箱指令明细表 */}
      <div className="mt-4">
        <div className="text-xs font-bold text-[#198348] pb-1 border-b border-dashed border-gray-200 mb-2">
          放箱指令明细（Word 模板中同款表格）—{" "}
          <span className="font-normal text-gray-500">
            {boxes.length} 个箱子
          </span>
        </div>
        <div className="border border-gray-200 rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#198348]/5 text-xs text-gray-700">
                <th className="py-2 px-2 text-left font-medium">提箱箱号</th>
                <th className="py-2 px-2 text-left font-medium">提箱日期</th>
                <th className="py-2 px-2 text-left font-medium">特别描述</th>
                <th className="py-2 px-2 text-left font-medium">车号</th>
                <th className="py-2 px-2 text-left font-medium">司机姓名</th>
                <th className="py-2 px-2 text-left font-medium">联系方式</th>
              </tr>
            </thead>
            <tbody>
              {boxes.length > 0 ? (
                boxes.map((b, i) => (
                  <tr
                    key={b.releaseId || i}
                    className="border-t border-gray-100"
                  >
                    <td className="py-2 px-2 text-[#198348] font-medium">
                      {b.containerNo || "-"}
                    </td>
                    <td className="py-2 px-2">
                      {b.pickupTime && dayjs(b.pickupTime).isValid()
                        ? dayjs(b.pickupTime).format("YYYY-MM-DD")
                        : b.pickupTime || "-"}
                    </td>
                    <td className="py-2 px-2 text-gray-600">
                      {b.specialDescr || "-"}
                    </td>
                    <td
                      className={`py-2 px-2 ${b.plateNo ? "" : "text-gray-400"}`}
                    >
                      {b.plateNo || "-"}
                    </td>
                    <td
                      className={`py-2 px-2 ${b.driverName ? "" : "text-gray-400"}`}
                    >
                      {b.driverName || "-"}
                    </td>
                    <td
                      className={`py-2 px-2 ${b.driverPhone ? "" : "text-gray-400"}`}
                    >
                      {b.driverPhone || "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-gray-400">
                    暂无放箱指令
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="text-[11px] text-gray-400 mt-1">
          {boxes.some((b) => !b.matched || b.matched === "0")
            ? "存在未匹配提箱的箱子 — 状态：待提箱"
            : "所有箱子已匹配提箱信息"}
        </div>
      </div>
    </Modal>
  );
};
