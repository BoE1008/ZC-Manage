import { useState, useEffect, useMemo } from "react";
import Table from "@/components/ResizeTable";
import { Button, Tooltip, Select, Space, Modal, message } from "antd";
import SearchInput from "@/components/SearchInput";
import type { ColumnsType } from "antd/es/table";
import { editReleaseOrder, ReleaseOrder } from "@/restApi/releaseOrder";
import { ReleaseTypeBadge, StatusBadge } from "@/components/ui/Badge";
import { useRouter } from "next/router";
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
  { label: "已提箱", value: "picked_up" },
  { label: "已作废", value: "cancelled" },
];

export const ReleaseList = () => {
  const router = useRouter();

  const [releases, setReleases] = useState<ReleaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [editId, setEditId] = useState<string | null | undefined>(undefined);
  const [viewId, setViewId] = useState<string | null>(null);

  const load = (
    pageNo = page,
    extra?: { keyword?: string; type?: string; status?: string },
  ) => {
    const kw = extra?.keyword ?? keyword;
    const tp = extra?.type ?? typeFilter;
    const st = extra?.status ?? statusFilter;
    setLoading(true);
    getReleaseOrderList({
      pageNo,
      pageSize: 20,
      orderType: typeFilter || undefined,
      status: statusFilter || undefined,
      orderNo: kw || undefined,
    })
      .then((r) => {
        setReleases(r.entity?.data ?? []);
        setTotal(r.entity?.total ?? 0);
      })
      .catch(() => message.error("加载放箱令列表失败"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!router.isReady) return;
    const q = router.query;
    const nt = typeof q.type === "string" ? q.type : "";
    const ns = typeof q.status === "string" ? q.status : "";
    const nk = typeof q.keyword === "string" ? q.keyword : "";
    const np = typeof q.page === "string" ? Number(q.page) : 1;
    setTypeFilter(nt);
    setStatusFilter(ns);
    setKeyword(nk);
    setPage(np);
    load(np, { type: nt, status: ns, keyword: nk });
  }, [router.isReady, router.query]);

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

  const handleConfirmPickup = async () => {
    await editReleaseOrder({ id: viewId as string, status: "picked_up" });
    message.success("已确认提箱");
    setViewId(null);
    load(page);
  };

  const columns: ColumnsType<ReleaseOrder> = [
    {
      title: "放箱令编号",
      dataIndex: "orderNo",
      render: (v, r) => (
        <Tooltip title={<span>查看放箱令信息</span>}>
          <span
            className="text-[#198348] hover:underline cursor-pointer"
            onClick={() => setViewId(r.id ?? null)}
          >
            {v}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "类型",
      dataIndex: "orderType",
      render: (v) => <ReleaseTypeBadge type={v} />,
    },
    { title: "集装箱编号", dataIndex: "containerNo", width: 130 },
    { title: "买方/租方", dataIndex: "buyerName", width: 140 },
    { title: "放箱堆场", dataIndex: "yardName", width: 140 },
    { title: "提箱时间", dataIndex: "pickupTime", width: 120 },
    {
      title: "收入",
      dataIndex: "income",
      render: (v) => (v ? `¥${v.toLocaleString()}` : "-"),
    },
    {
      title: "状态",
      dataIndex: "status",
      render: (v) => <StatusBadge status={v} />,
    },
    { title: "备注", dataIndex: "remark", ellipsis: true },
    {
      title: "操作",
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Tooltip title={<span>查看放箱令信息</span>}>
            <Button
              type="text"
              size="small"
              className="!px-1 !py-0.5 !text-xs"
              onClick={() => setViewId(record.id ?? null)}
              title="查看"
            >
              👁
            </Button>
          </Tooltip>
          <Tooltip title={<span>编辑</span>}>
            <Button
              type="text"
              size="small"
              className="!px-1 !py-0.5 !text-xs"
              onClick={() => setEditId(record.id ?? null)}
              title="编辑"
            >
              ✎
            </Button>
          </Tooltip>
          <Tooltip title={<span>删除</span>}>
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
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-3 justify-between px-4">
        <Button type="primary" onClick={() => setEditId(null)}>
          + 新增放箱令
        </Button>
        <div className="flex items-center gap-3 flex-wrap">
          <Select
            allowClear
            className="w-36"
            placeholder="类型"
            options={ORDER_TYPE_OPTIONS}
            onChange={(v) => {
              const q: Record<string, string | string[] | undefined> = {
                ...router.query,
                type: v || undefined,
                page: "1",
              };
              if (!v) delete q.type;
              delete q.keyword;
              router.push({ pathname: router.pathname, query: q }, undefined, {
                shallow: true,
              });
            }}
          />
          <Select
            allowClear
            className="w-36"
            placeholder="状态"
            options={STATUS_OPTIONS}
            onChange={(v) => {
              const q: Record<string, string | string[] | undefined> = {
                ...router.query,
                status: v || undefined,
                page: "1",
              };
              if (!v) delete q.status;
              delete q.keyword;
              router.push({ pathname: router.pathname, query: q }, undefined, {
                shallow: true,
              });
            }}
          />
          <div className="w-64">
            <SearchInput
              placeholder="放箱令编号"
              onSearch={(v) => {
                const q: Record<string, string | string[] | undefined> = {
                  ...router.query,
                  keyword: v || undefined,
                  page: "1",
                };
                if (!v) delete q.keyword;
                delete q.type;
                delete q.status;
                router.push(
                  { pathname: router.pathname, query: q },
                  undefined,
                  {
                    shallow: true,
                  },
                );
              }}
            />
          </div>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={filtered}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1400 }}
        pagination={{
          current: page,
          total,
          pageSize: 20,
          onChange: (p) => {
            const q: Record<string, string | string[] | undefined> = {
              ...router.query,
              page: String(p),
            };
            router.push({ pathname: router.pathname, query: q }, undefined, {
              shallow: true,
            });
          },
          onShowSizeChange: (_p, ps) => {
            const q = { ...router.query } as Record<
              string,
              string | string[] | undefined
            >;
            q.page = "1";
            q.pageSize = String(ps);
            router.push({ pathname: router.pathname, query: q }, undefined, {
              shallow: true,
            });
          },
          showTotal: (t) => `共 ${t} 条`,
        }}
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
        <ReleaseDetailModal
          id={viewId}
          onClose={() => setViewId(null)}
          onConfirmPickup={handleConfirmPickup}
        />
      )}
    </div>
  );
};
