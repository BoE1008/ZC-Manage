import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { Modal, Table, Input, Select, message } from "antd";
import {
  getReturnOrderDetail,
  confirmReturnOrderApi,
} from "@/restApi/returnOrder";
import { getYardList } from "@/restApi/yard";

interface Props {
  id: string;
  onSave: () => void;
  onClose: () => void;
}

interface BoxItem {
  boxNo: string;
  returnTime?: string;
  actualYardId?: string;
}

const ReturnOrderConfirmModal: React.FC<Props> = ({ id, onSave, onClose }) => {
  const [r, setR] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [yards, setYards] = useState<any[]>([]);
  const [boxes, setBoxes] = useState<BoxItem[]>([]);
  const [unifiedDate, setUnifiedDate] = useState("");

  useEffect(() => {
    Promise.all([
      getReturnOrderDetail(id),
      getYardList({ pageNo: 1, pageSize: 1000 }),
    ])
      .then(([res, yardRes]: any[]) => {
        const d = res?.entity?.data ?? res?.entity ?? res ?? {};
        setR(d);
        const bs: BoxItem[] = (d.boxes ?? []).map((b: any) => ({
          boxNo: b.boxNo,
          returnTime: b.returnTime && b.returnTime !== "-" ? b.returnTime : "",
          actualYardId: b.actualYardId || "",
        }));
        setBoxes(bs);
        // 如已有部分箱子设置过还箱时间，预填到统一日期
        const filled = bs.find((b) => b.returnTime);
        if (filled) setUnifiedDate(filled.returnTime!);
        setYards(yardRes?.entity?.data ?? []);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const updateBox = (i: number, field: keyof BoxItem, val: string) => {
    setBoxes((prev) =>
      prev.map((b, idx) => (idx === i ? { ...b, [field]: val } : b)),
    );
  };

  const applyUnifiedDate = () => {
    if (!unifiedDate) return;
    setBoxes((prev) => prev.map((b) => ({ ...b, returnTime: unifiedDate })));
  };

  const handleOk = async () => {
    setSubmitting(true);
    try {
      const finalBoxes = boxes.map((b) => ({
        boxNo: b.boxNo,
        returnTime: b.returnTime || unifiedDate || "",
        actualYardId: b.actualYardId || "",
      }));
      await confirmReturnOrderApi(id, { boxes: finalBoxes });
      const allSet = finalBoxes.every((b) => b.returnTime && b.actualYardId);
      message.success(
        allSet ? "还箱确认完成" : "部分箱子未选择堆场，已保存其余信息",
      );
      onSave();
    } catch {
      message.error("确认失败");
    } finally {
      setSubmitting(false);
    }
  };

  const columns: any[] = [
    {
      title: "箱号",
      dataIndex: "boxNo",
      width: 180,
      render: (v: string) => <span className="font-mono">{v}</span>,
    },
    {
      title: "还箱时间",
      dataIndex: "returnTime",
      width: 160,
      render: (_: any, __: any, i: number) => (
        <Input
          type="date"
          size="small"
          value={boxes[i]?.returnTime ?? ""}
          onChange={(e) => updateBox(i, "returnTime", e.target.value)}
        />
      ),
    },
    {
      title: "实际还箱堆场",
      dataIndex: "actualYardId",
      render: (_: any, __: any, i: number) => (
        <Select
          size="small"
          style={{ width: "100%" }}
          placeholder="请选择实际还箱堆场"
          allowClear
          showSearch
          filterOption={(input, option) =>
            ((option?.label as string) ?? "")
              .toLowerCase()
              .includes(input.toLowerCase())
          }
          value={boxes[i]?.actualYardId || undefined}
          onChange={(v) => updateBox(i, "actualYardId", v ?? "")}
          options={yards.map((y: any) => ({
            label: `${y.name}（${y.city ?? ""}）`,
            value: y.id,
          }))}
        />
      ),
    },
  ];

  return (
    <Modal
      open
      title={`确认还箱 - ${r?.orderNo ?? ""}`}
      onCancel={onClose}
      onOk={handleOk}
      destroyOnClose
      width={720}
      okText="确认还箱"
      cancelText="取消"
      confirmLoading={submitting}
    >
      <div className="bg-amber-50 border-l-4 border-amber-400 rounded p-2.5 text-xs text-amber-800 mb-3 leading-relaxed">
        <b className="text-amber-900">📌 提示：</b>
        逐箱确认还箱时间与实际还到哪个堆场。确认后箱子状态变为"堆存"，状态备注自动显示堆场名称，堆存费用计入该堆场关联供应商。
      </div>

      <div className="mb-3 flex items-center gap-3">
        <label className="text-sm text-gray-700 whitespace-nowrap">
          统一还箱时间
        </label>
        <Input
          type="date"
          size="small"
          style={{ width: 200 }}
          value={unifiedDate}
          onChange={(e) => setUnifiedDate(e.target.value)}
          onBlur={applyUnifiedDate}
          placeholder="设置后应用到所有未填的箱子"
        />
        <span className="text-xs text-gray-400">
          （失焦后应用到所有未单独填写的箱子）
        </span>
      </div>

      <Table
        columns={columns}
        dataSource={boxes.map((b, i) => ({ ...b, key: i }))}
        size="small"
        pagination={false}
        scroll={{ x: 600 }}
        loading={loading}
        bordered
      />
    </Modal>
  );
};

export default ReturnOrderConfirmModal;
