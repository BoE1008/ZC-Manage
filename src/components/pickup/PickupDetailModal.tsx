import { useState, useEffect } from "react";
import { Modal, Space, Button, Spin, message } from "antd";
import {
  getPickupOrderDetail,
  downloadPickupOrderDoc,
} from "@/restApi/pickupOrder";
import { StatusBadge } from "@/components/ui/Badge";
import { getDictByCode } from "@/restApi/dict";
import { unwrapList, normalizeDictOptions, formatDate } from "@/utils";
import { InfoItem, SectionTitle } from "@/components/ui/InfoItem";

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
  city?: string;
  buyerId?: string;
  buyerName?: string;
  yardId?: string;
  yardName?: string;
  containerId?: string;
  containerNo?: string;
  deadlineStart?: string;
  deadlineEnd?: string;
  maker?: string;
  status?: string;
  pickupTime?: string;
  income?: number;
  remark?: string;
  pickupMethod?: string;
  containerType?: string;
  quantity?: number;
  releaseDate?: string;
  createBy?: string;
  createTime?: string;
}

export const PickupDetailModal = ({
  id,
  onClose,
  onEdit,
  onConfirmPickup,
}: Props) => {
  const [r, setR] = useState<ReleaseData | null>(null);
  const [boxes, setBoxes] = useState<BoxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeOptions, setTypeOptions] = useState<
    { label: string; value: string }[]
  >([]);

  // 加载提箱类型字典
  useEffect(() => {
    getDictByCode("pickup_order_type")
      .then((res: any) => {
        const list = unwrapList(res);
        setTypeOptions(
          normalizeDictOptions(list),
        );
      })
      .catch(() => setTypeOptions([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    getPickupOrderDetail(id)
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
        title="提箱令详情"
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
      message.error("提箱令 id 缺失");
      return;
    }
    try {
      message.loading({ content: "正在下载提箱单...", key: "doc" });
      const res: any = await downloadPickupOrderDoc(id);
      const blob = res.data as Blob;

      // 优先解析服务端 Content-Disposition 的文件名
      let filename = `提箱单_${r?.orderNo ?? id}.docx`;
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
          提箱令详情 - {r.orderNo}
        </span>
      }
      open
      onCancel={onClose}
      width={720}
      destroyOnClose
      footer={
        <Space>
          <Button onClick={onClose}>关闭</Button>
          <Button onClick={downloadWord}>📄 下载 Word 提箱单</Button>
          {onEdit && (
            <Button type="primary" onClick={onEdit}>
              编辑
            </Button>
          )}
        </Space>
      }
    >
      <div className="text-xs text-gray-400 mb-2">
        <span className="text-[#198348]">📋</span> 提箱令基本信息 + Word
        模板中同款明细表
      </div>

      {/* 提箱令信息 9 项栅格 */}
      <div className="grid grid-cols-3 gap-y-2.5 gap-x-4 text-sm bg-white">
        <SectionTitle className="col-span-3">提箱令信息</SectionTitle>

        <InfoItem
          label="提箱令编号"
          value={r.orderNo}
          valueClassName="text-[#198348] font-medium"
        />
        <InfoItem
          label="类型"
          value={
            (typeOptions.find((o) => o.value === (r.orderType as string))?.label) ||
            r.orderType
          }
        />
        <InfoItem label="箱数" value={boxes.length} />
        <InfoItem
          label="提箱方式"
          value={
            r.pickupMethod === "designated"
              ? "指定箱号"
              : r.pickupMethod === "undesignated"
                ? "不指定箱号"
                : undefined
          }
        />
        <InfoItem label="箱型" value={r.containerType} />
        <InfoItem
          label="提箱数量"
          value={r.quantity != null ? r.quantity : undefined}
        />
        <InfoItem label="提箱城市" value={r.city} />
        <InfoItem
          label="提箱堆场"
          value={
            r.yardName && r.yardName !== "-"
              ? r.yardName
              : r.yardId
                ? `堆场ID: ${r.yardId}`
                : "未指定"
          }
        />
        <InfoItem label="指令期限-起" value={formatDate(r.deadlineStart)} />
        <InfoItem label="指令期限-止" value={formatDate(r.deadlineEnd)} />
        <InfoItem label="生成时间" value={formatDate(r.createTime)} valueClassName="text-xs font-medium" />
        <InfoItem
          label="状态"
          value={<StatusBadge status={(r.status as string) || ""} />}
        />
        {r.remark && (
          <InfoItem label="备注" value={r.remark} colSpan="col-span-3" valueClassName="text-xs" />
        )}
      </div>

      {/* 提箱指令明细表 */}
      <div className="mt-4">
        <div className="text-xs font-bold text-[#198348] pb-1 border-b border-dashed border-gray-200 mb-2">
          提箱指令明细（Word 模板中同款表格）—{" "}
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
                      {formatDate(b.pickupTime, b.pickupTime || "-")}
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
                    暂无提箱指令
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
