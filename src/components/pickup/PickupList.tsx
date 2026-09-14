import { useState, useEffect } from "react";
import dayjs from "dayjs";
import Table from "@/components/ResizeTable";
import { Button, Tooltip, Select, Space, Modal, message } from "antd";
import SearchInput from "@/components/SearchInput";
import type { ColumnsType } from "antd/es/table";
import { editPickupOrder, PickupOrder } from "@/restApi/pickupOrder";
import { StatusBadge } from "@/components/ui/Badge";
import { useRouter } from "next/router";
import { PickupModal } from "./PickupModal";
import { PickupDetailModal } from "./PickupDetailModal";
import { ContainerDetailModal } from "@/components/containers/ContainerDetailModal";
import { getPickupOrderList, deletePickupOrder } from "@/restApi/pickupOrder";
import { getDictByCode } from "@/restApi/dict";

const STATUS_OPTIONS = [
  { label: "待提箱", value: "pending" },
  { label: "已提箱", value: "picked_up" },
  { label: "已作废", value: "cancelled" },
];

export const PickupList = () => {
  const router = useRouter();

  const [releases, setReleases] = useState<PickupOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [editId, setEditId] = useState<string | null | undefined>(undefined);
  const [viewId, setViewId] = useState<string | null>(null);
  const [viewContainerId, setViewContainerId] = useState<string | null>(null);
  const [typeOptions, setTypeOptions] = useState<
    { label: string; value: string }[]
  >([]);

  // 加载提箱类型字典
  useEffect(() => {
    getDictByCode("pickup_order_type")
      .then((res: any) => {
        const list = res?.entity?.data ?? res?.entity ?? [];
        setTypeOptions(
          (Array.isArray(list) ? list : []).map((d: any) => ({
            label: d.dictLabel ?? d.label ?? d.dictValue,
            value: d.dictValue ?? d.value,
          })),
        );
      })
      .catch(() => setTypeOptions([]));
  }, []);

  const load = (
    pageNo = page,
    extra?: { keyword?: string; type?: string; status?: string },
  ) => {
    const kw = extra?.keyword ?? keyword;
    const tp = extra?.type ?? typeFilter;
    const st = extra?.status ?? statusFilter;
    setLoading(true);
    getPickupOrderList({
      pageNo,
      pageSize: 20,
      orderType: tp || undefined,
      status: st || undefined,
      orderNo: kw || undefined,
    })
      .then((r) => {
        setReleases(r.entity?.data ?? []);
        setTotal(r.entity?.total ?? 0);
      })
      .catch(() => message.error("加载提箱令列表失败"))
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

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "确认删除",
      content: "删除后无法恢复，确定删除这条提箱令？",
      okText: "删除",
      okButtonProps: { danger: true },
      cancelText: "取消",
      onOk: async () => {
        await deletePickupOrder(id);
        message.warning("提箱令已删除");
        load(page);
      },
    });
  };

  const handleConfirmPickup = async () => {
    await editPickupOrder({ id: viewId as string, status: "picked_up" });
    message.success("已确认提箱");
    setViewId(null);
    load(page);
  };

  const columns: ColumnsType<PickupOrder> = [
    {
      title: "提箱令编号",
      dataIndex: "orderNo",
      render: (v, r) => (
        <Tooltip title={<span>查看提箱令信息</span>}>
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
      render: (v) => {
        const found = typeOptions.find((o) => o.value === v);
        const label = found?.label ?? v;
        return (
          <span
            className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
              v === "rent"
                ? "bg-purple-100 text-purple-700"
                : v === "return"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-green-100 text-green-700"
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
      align: "center",
      render: (v, r: any) => v ?? r.containers?.length ?? "-",
    },
    { title: "提箱堆场", dataIndex: "yardName", width: 140 },
    {
      title: "生成时间",
      dataIndex: "createTime",
      width: 120,
      render: (v: string) =>
        v && v !== "-" && dayjs(v).isValid()
          ? dayjs(v).format("YYYY-MM-DD")
          : "-",
    },
    {
      title: "客户提箱时间",
      dataIndex: "pickupDate",
      width: 130,
      render: (v: string) =>
        v && v !== "-" && dayjs(v).isValid()
          ? dayjs(v).format("YYYY-MM-DD")
          : "-",
    },
    {
      title: "提箱方式",
      dataIndex: "pickupMethod",
      width: 110,
      align: "center",
      render: (v: any) =>
        v === "designated" ? (
          <span className="text-xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
            指定箱号
          </span>
        ) : v === "undesignated" ? (
          <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
            不指定箱号
          </span>
        ) : (
          "-"
        ),
    },
    {
      title: "箱型",
      dataIndex: "containerType",
      width: 90,
      align: "center",
      render: (v: any) => v || "-",
    },
    {
      title: "提箱数量",
      dataIndex: "quantity",
      width: 100,
      align: "center",
      render: (v: any) => (v != null ? `${v} 个` : "-"),
    },
    {
      title: "提箱城市",
      dataIndex: "city",
      width: 100,
      render: (v: any) => v || "-",
    },
    {
      title: "状态",
      dataIndex: "status",
      width: 100,
      render: (v) => <StatusBadge status={v} />,
    },
    {
      title: "操作",
      width: 120,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Tooltip title={<span>查看提箱令信息</span>}>
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
      <div className="mb-3 px-4">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 px-3 py-2 text-xs text-yellow-800 rounded">
          <b>📌 提箱令说明：</b>
          箱子必须处于<b>堆存状态</b>（国内堆存/国外堆存）才能提箱；提箱堆场
          <b>可指定也可不指定</b>
          ——不指定时客户提箱后再由操作员回填"箱号+提箱时间"完成匹配。支持一次勾选多个箱子批量生成提箱令，Word
          模板中自动生成多行提箱指令。
        </div>
      </div>
      <div className="mb-4 flex flex-wrap gap-3 justify-between px-4">
        <div className="flex gap-2">
          <Button type="primary" onClick={() => setEditId(null)}>
            + 生成提箱令(支持批量)
          </Button>
          <Button onClick={() => message.info("导出功能待对接")}>
            📤 导出
          </Button>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Select
            allowClear
            className="w-36"
            placeholder="类型"
            options={typeOptions}
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
              placeholder="提箱令编号"
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
        dataSource={releases}
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
        <PickupModal
          id={editId}
          onSave={() => {
            setEditId(undefined);
            load(page);
          }}
          onClose={() => setEditId(undefined)}
        />
      )}
      {viewId && (
        <PickupDetailModal id={viewId} onClose={() => setViewId(null)} />
      )}

      {/* 集装箱详情弹窗（点击箱号打开） */}
      {viewContainerId && (
        <ContainerDetailModal
          id={viewContainerId}
          onClose={() => setViewContainerId(null)}
        />
      )}
    </div>
  );
};
