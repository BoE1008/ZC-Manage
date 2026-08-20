import { useState, useEffect, useMemo } from "react";
import Table from "@/components/ResizeTable";
import { Button, Select, Input, Space, Modal, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ReleaseOrder } from "@/restApi/releaseOrder";
import { ReleaseTypeBadge, StatusBadge } from "@/components/ui/Badge";
import { ReleaseModal } from "./ReleaseModal";
import { ReleaseDetailModal } from "./ReleaseDetailModal";
import {
  getReleaseOrderList,
  deleteReleaseOrder,
} from "@/restApi/releaseOrder";

const ORDER_TYPE_OPTIONS = [
  { label: "卖出放箱", value: "卖出放箱" },
  { label: "租箱", value: "租箱" },
];

const STATUS_OPTIONS = [
  { label: "待确认", value: "pending" },
  { label: "已放箱", value: "released" },
  { label: "已提箱", value: "picked_up" },
  { label: "已作废", value: "cancelled" },
];

export const ReleaseList = () => {
  const [releases, setReleases] = useState<ReleaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [editId, setEditId] = useState<string | null | undefined>(undefined);
  const [viewId, setViewId] = useState<string | null>(null);

  const load = (pageNo = page) => {
    setLoading(true);
    getReleaseOrderList({
      pageNo,
      pageSize: 20,
      orderType: typeFilter || undefined,
      status: statusFilter || undefined,
      orderNo: keyword || undefined,
      containerNo: keyword || undefined,
    })
      .then((r) => {
        setReleases(r.entity?.data ?? []);
        setTotal(r.entity?.total ?? 0);
      })
      .catch(() => message.error("加载放箱令列表失败"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(1);
  }, [typeFilter, statusFilter]);

  const filtered = useMemo(
    () =>
      releases.filter((r) => {
        if (keyword) {
          const k = keyword.toLowerCase();
          if (
            !(r.orderNo ?? "").toLowerCase().includes(k) &&
            !(r.containerNo ?? "").toLowerCase().includes(k)
          )
            return false;
        }
        return true;
      }),
    [releases, keyword],
  );

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "确认删除",
      content: "删除后无法恢复，确定删除这条放箱令？",
      okText: "删除",
      okButtonProps: { danger: true },
      cancelText: "取消",
      onOk: async () => {
        await deleteReleaseOrder(id);
        message.warning("放箱令已删除");
        load(page);
      },
    });
  };

  const columns: ColumnsType<ReleaseOrder> = [
    {
      title: "放箱令编号",
      dataIndex: "orderNo",
      width: 180,
      render: (v, r) => (
        <span
          className="text-[#198348] hover:underline cursor-pointer"
          onClick={() => setViewId(r.id ?? null)}
        >
          {v}
        </span>
      ),
    },
    {
      title: "类型",
      dataIndex: "orderType",
      width: 100,
      render: (v) => <ReleaseTypeBadge type={v} />,
    },
    { title: "集装箱编号", dataIndex: "containerNo", width: 130 },
    { title: "买方/租方", dataIndex: "buyerName", width: 140 },
    { title: "放箱堆场", dataIndex: "yardName", width: 140 },
    { title: "提箱时间", dataIndex: "pickupTime", width: 120 },
    {
      title: "收入",
      dataIndex: "income",
      width: 100,
      render: (v) => (v ? `¥${v.toLocaleString()}` : "-"),
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 100,
      render: (v) => <StatusBadge status={v} />,
    },
    { title: "备注", dataIndex: "remark", ellipsis: true },
    {
      title: "操作",
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            size="small"
            className="!px-1 !py-0.5 !text-xs"
            onClick={() => setViewId(record.id ?? null)}
            title="查看"
          >
            👁
          </Button>
          <Button
            type="text"
            size="small"
            className="!px-1 !py-0.5 !text-xs"
            onClick={() => setEditId(record.id ?? null)}
            title="编辑"
          >
            ✎
          </Button>
          <Button
            type="text"
            size="small"
            danger
            className="!px-1 !py-0.5 !text-xs"
            onClick={() => handleDelete(record.id!)}
            title="删除"
          >
            🗑
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-4 flex flex-wrap gap-3">
        <Input.Search
          placeholder="搜索放箱令编号 / 集装箱编号"
          className="w-64"
          onSearch={(v) => {
            setKeyword(v);
            setTimeout(() => load(1), 0);
          }}
          allowClear
        />
        <Select
          allowClear
          className="w-36"
          placeholder="类型"
          options={ORDER_TYPE_OPTIONS}
          onChange={(v) => setTypeFilter(v ?? "")}
        />
        <Select
          allowClear
          className="w-36"
          placeholder="状态"
          options={STATUS_OPTIONS}
          onChange={(v) => setStatusFilter(v ?? "")}
        />
        <Button type="primary" onClick={() => setEditId(null)}>
          + 新增放箱令
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filtered}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1400 }}
        pagination={
          total > 20
            ? {
                current: page,
                total,
                pageSize: 20,
                onChange: (p) => {
                  setPage(p);
                  load(p);
                },
                showSizeChanger: false,
              }
            : false
        }
      />

      {editId !== undefined && (
        <ReleaseModal
          id={editId}
          onSave={() => {
            setEditId(undefined);
            load(page);
          }}
          onClose={() => setEditId(undefined)}
        />
      )}
      {viewId && (
        <ReleaseDetailModal id={viewId} onClose={() => setViewId(null)} />
      )}
    </div>
  );
};
