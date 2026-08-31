import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import dayjs from "dayjs";
import { Table, Button, Space, Input, Select, message, Modal } from "antd";
import ResizeTable from "@/components/ResizeTable";
import ReturnOrderModal from "./ReturnOrderModal";
import ReturnOrderDetailModal from "./ReturnOrderDetailModal";
import ReturnOrderConfirmModal from "./ReturnOrderConfirmModal";
import { getReturnOrderList, deleteReturnOrder } from "@/restApi/returnOrder";

const TYPE_MAP: Record<string, string> = {
  customer_return: "客户还箱",
  rent_return: "租箱归还",
};
const STATUS_MAP: Record<string, string> = {
  pending: "待还箱",
  returned: "已还箱",
};

const ReturnOrderList: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const router = useRouter();
  const [editId, setEditId] = useState<string | null | undefined>(undefined);
  const [viewId, setViewId] = useState<string | null | undefined>(null);
  const [confirmId, setConfirmId] = useState<string | null | undefined>(null);

  const load = (p = 1, extra?: { status?: string; keyword?: string }) => {
    const q = router.query;
    const s = extra?.status ?? (typeof q.status === "string" ? q.status : "");
    const k = extra?.keyword ?? (typeof q.keyword === "string" ? q.keyword : "");
    const pn = typeof q.page === "string" ? Number(q.page) : p;
    setLoading(true);
    setPage(pn);
    getReturnOrderList({
      pageNo: pn,
      pageSize: 20,
      status: s || undefined,
      orderNo: k || undefined,
    })
      .then((r: any) => {
        const list = r?.entity?.data ?? [];
        setData(list);
        setTotal(r?.entity?.total ?? list.length);
      })
      .finally(() => setLoading(false));
  };

  // URL 同步唯一入口
  useEffect(() => {
    if (!router.isReady) return;
    load(1, {});
  }, [router.isReady, router.query]);

  const handleDelete = (r: any) => {
    Modal.confirm({
      title: "确认删除",
      content: `确定删除还箱令「${r.orderNo}」吗？`,
      okText: "删除",
      okButtonProps: { className: "!bg-red-500 !border-red-500" },
      cancelText: "取消",
      onOk: async () => {
        await deleteReturnOrder(r.id);
        message.warning("还箱令已删除");
        load();
      },
    });
  };

  const columns: any[] = [
    {
      title: "还箱令编号",
      dataIndex: "orderNo",
      width: 180,
      render: (v: string, r: any) => (
        <a className="text-[#198348]" onClick={() => setViewId(r.id)}>
          {v || "-"}
        </a>
      ),
    },
    {
      title: "类型",
      dataIndex: "orderType",
      width: 100,
      render: (v: string) => {
        const label = TYPE_MAP[v] ?? v;
        return (
          <span
            className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
              v === "rent_return"
                ? "bg-purple-100 text-purple-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {label}
          </span>
        );
      },
    },
    {
      title: "箱数",
      dataIndex: "boxCount",
      width: 70,
      align: "center" as const,
      render: (v: number, r: any) => {
        const n = v ?? r.boxes?.length ?? 0;
        return n ? (
          <span
            className="inline-block px-2 py-0.5 rounded text-xs font-bold text-white"
            style={{ background: "#8B5CF6" }}
          >
            {n}
          </span>
        ) : (
          "0"
        );
      },
    },
    {
      title: "箱号",
      dataIndex: "boxes",
      width: 220,
      render: (v: any[]) =>
        v?.length
          ? v.map((b: any, i: number) => (
              <span key={i} className="inline-block mr-1">
                <span className="font-mono text-xs text-gray-700">
                  {b.boxNo}
                </span>
                {i < v.length - 1 && (
                  <span className="text-gray-300 mx-0.5">、</span>
                )}
              </span>
            ))
          : "-",
    },
    {
      title: "还箱堆场",
      dataIndex: "yardName",
      width: 150,
      render: (v: string) =>
        v && v !== "-" ? (
          <span className="text-[#198348]">{v}</span>
        ) : (
          <span className="text-gray-400">未指定</span>
        ),
    },
    {
      title: "确认进度",
      dataIndex: "confirmProgress",
      width: 90,
      align: "center" as const,
      render: (v: string) =>
        v ? (
          <span className="text-xs font-medium text-gray-700">{v}</span>
        ) : (
          "-"
        ),
    },
    {
      title: "实际还箱时间",
      dataIndex: "returnTime",
      width: 120,
      render: (v: string) =>
        v && v !== "-" && dayjs(v).isValid()
          ? dayjs(v).format("YYYY-MM-DD")
          : "-",
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 90,
      render: (v: string) => (
        <span
          className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
            v === "pending"
              ? "bg-amber-100 text-amber-700"
              : v === "returned"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
          }`}
        >
          {STATUS_MAP[v] ?? v ?? "-"}
        </span>
      ),
    },
    {
      title: "操作",
      width: 140,
      fixed: "right" as const,
      render: (_: any, r: any) => (
        <Space size={4}>
          <Button
            type="link"
            size="small"
            className="!px-1"
            onClick={() => setViewId(r.id)}
          >
            详情
          </Button>
          {r.status === "pending" && (
            <Button
              type="link"
              size="small"
              className="!px-1 !text-purple-600"
              onClick={() => {
                setConfirmId(r.id);
              }}
            >
              确认
            </Button>
          )}
          <Button
            type="link"
            size="small"
            className="!px-1"
            onClick={() => setEditId(r.id)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            danger
            className="!px-1"
            onClick={() => handleDelete(r)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 space-y-3">
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-white rounded-md p-3 shadow-sm border-l-4 border-l-purple-500">
          <div className="text-xs text-gray-500 mb-1">待还箱</div>
          <div className="text-2xl font-bold text-purple-600">
            {data.filter((t: any) => t.status === "pending").length}
          </div>
        </div>
        <div className="bg-white rounded-md p-3 shadow-sm border-l-4 border-l-green-500">
          <div className="text-xs text-gray-500 mb-1">已还箱</div>
          <div className="text-2xl font-bold text-green-600">
            {data.filter((t: any) => t.status === "returned").length}
          </div>
        </div>
        <div className="bg-white rounded-md p-3 shadow-sm border-l-4 border-l-[#198348]">
          <div className="text-xs text-gray-500 mb-1">还箱令总数</div>
          <div className="text-2xl font-bold text-[#198348]">{total}</div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Button type="primary" size="small" onClick={() => setEditId(null)}>
          + 生成还箱令
        </Button>
        <Button size="small" onClick={() => message.info("导出功能开发中")}>
          导出
        </Button>
        <div className="ml-auto flex items-center gap-2">
          <Select
            size="small"
            allowClear
            placeholder="状态"
            style={{ width: 100 }}
            value={typeof router.query.status === "string" ? router.query.status : undefined}
            onChange={(v) => {
              const q: Record<string, string | string[] | undefined> = { ...router.query, status: v || undefined };
              if (!v) delete q.status;
              q.page = "1";
              router.push({ pathname: router.pathname, query: q }, undefined, { shallow: true });
            }}
            options={[
              { label: "待还箱", value: "pending" },
              { label: "已还箱", value: "returned" },
            ]}
          />
          <Input
            size="small"
            placeholder="还箱令编号"
            style={{ width: 220 }}
            allowClear
            onChange={(e) => {
              const q: Record<string, string | string[] | undefined> = { ...router.query, keyword: e.target.value || undefined };
              if (!e.target.value) delete q.keyword;
              q.page = "1";
              router.push({ pathname: router.pathname, query: q }, undefined, { shallow: true });
            }}
            onPressEnter={(e) => {
              const q: Record<string, string | string[] | undefined> = { ...router.query, keyword: (e.target as any).value || undefined };
              if (!(e.target as any).value) delete q.keyword;
              q.page = "1";
              router.push({ pathname: router.pathname, query: q }, undefined, { shallow: true });
            }}
          />
        </div>
      </div>

      <div className="bg-amber-50 border-l-4 border-amber-400 rounded p-3 text-xs text-amber-800">
        <b className="text-amber-900">还箱令说明：</b>
        还箱令用于通知归还集装箱至指定堆场（可不指定，由还箱人自行送达）。
        <strong>确认还箱后</strong>
        需记录箱子实际还到哪个堆场，箱子状态变为"堆存"，状态备注自动显示具体堆场名称。支持批量还箱与
        Word 下载。
      </div>

      <div className="bg-white rounded shadow-sm overflow-hidden">
        <ResizeTable
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="id"
          size="small"
          scroll={{ x: 1300, y: 500 }}
          pagination={{
            current: page,
            pageSize,
            total,
            onChange: (p, ps) => {
              router.push(
                { pathname: router.pathname, query: { ...router.query, page: String(p) } },
                undefined,
                { shallow: true },
              );
            },
            showSizeChanger: false,
            showTotal: (t) => `共 ${t} 条`,
            pageSizeOptions: ["20", "50", "100"],
          }}
        />
      </div>

      {editId !== undefined && (
        <ReturnOrderModal
          id={editId}
          onSave={() => {
            setEditId(undefined);
            load();
          }}
          onClose={() => setEditId(undefined as any)}
        />
      )}

      {viewId && (
        <ReturnOrderDetailModal
          id={viewId}
          onClose={() => setViewId(null)}
          onEdit={() => {
            setViewId(null);
            setEditId(viewId);
          }}
          onConfirm={() => {
            setViewId(null);
            setConfirmId(viewId);
          }}
        />
      )}

      {confirmId && (
        <ReturnOrderConfirmModal
          id={confirmId}
          onSave={() => {
            setConfirmId(null);
            load();
          }}
          onClose={() => setConfirmId(null)}
        />
      )}
    </div>
  );
};

export default ReturnOrderList;
