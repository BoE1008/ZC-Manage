import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { Button, Input, Select, Space, Modal, message } from "antd";
import Table from "@/components/ResizeTable";
import type { ColumnsType } from "antd/es/table";
import { Container, ContainerStatus, ConditionType, UsageType } from "@/types";
import { StatusBadge, UsageTag, CondTag } from "@/components/ui/Badge";
import { ContainerModal } from "./ContainerModal";
import { ContainerDetailModal } from "./ContainerDetailModal";
import { getContainerList, deleteContainer } from "@/restApi/container";
import { getProjectList } from "@/restApi/projectCache";
import { getDictOptions, getDictOptionsSync } from "@/restApi/dictCache";
import type { DictOption } from "@/types/dict";

export const ContainerList = () => {
  const router = useRouter();

  // 分页
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);

  // 数据 & loading
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(false);

  // 筛选 state（由 URL sync effect 写入，供 Select value 绑定）
  const [statusFilter, setStatusFilter] = useState("");
  const [usageFilter, setUsageFilter] = useState("");
  const [condFilter, setCondFilter] = useState("");
  const [keyword, setKeyword] = useState("");

  // 字典选项
  const [statusOptions, setStatusOptions] = useState<DictOption[]>(
    getDictOptionsSync("container_status"),
  );
  const [usageOptions, setUsageOptions] = useState<DictOption[]>(
    getDictOptionsSync("container_usage"),
  );
  const [condOptions, setCondOptions] = useState<DictOption[]>(
    getDictOptionsSync("container_cond"),
  );

  // 编辑 & 预览
  const [editId, setEditId] = useState<string | null | undefined>(undefined);
  const [viewId, setViewId] = useState<string | null>(null);

  // 加载字典
  useEffect(() => {
    Promise.all([
      getDictOptions("container_status"),
      getDictOptions("container_usage"),
      getDictOptions("container_cond"),
    ]).then(([s, u, c]) => {
      setStatusOptions(s);
      setUsageOptions(u);
      setCondOptions(c);
    });
  }, []);

  // 加载数据（URL 是唯一数据源）
  const loadData = useCallback(
    (qs: Record<string, string | string[] | undefined>, p: number) => {
      const s = typeof qs.status === "string" ? qs.status : "";
      const u = typeof qs.usage === "string" ? qs.usage : "";
      const c = typeof qs.cond === "string" ? qs.cond : "";
      const k = typeof qs.q === "string" ? qs.q : "";
      setLoading(true);
      getContainerList({
        pageNo: p,
        pageSize,
        status: s || undefined,
        usageType: u || undefined,
        conditionType: c || undefined,
        containerNo: k || undefined,
      })
        .then((res) => {
          setContainers(res.entity?.data ?? []);
          setTotal(res.entity?.total ?? 0);
        })
        .catch(() => message.error("获取集装箱列表失败"))
        .finally(() => setLoading(false));
    },
    [pageSize],
  );

  // URL sync effect（唯一数据加载入口）
  useEffect(() => {
    if (!router.isReady) return;
    const q = router.query;
    setStatusFilter(typeof q.status === "string" ? q.status : "");
    setUsageFilter(typeof q.usage === "string" ? q.usage : "");
    setCondFilter(typeof q.cond === "string" ? q.cond : "");
    setKeyword(typeof q.q === "string" ? q.q : "");
    const p = typeof q.page === "string" ? Number(q.page) : 1;
    setPage(p);
    loadData(router.query, p);
  }, [router.isReady, router.query, loadData]);

  // 工具栏筛选 / 关键词回车 → 更新 URL
  const updateUrl = (field: string, value: string) => {
    const q = { ...router.query } as Record<
      string,
      string | string[] | undefined
    >;
    if (value) q[field] = value;
    else delete q[field];
    delete q.page;
    router.push({ pathname: router.pathname, query: q }, undefined, {
      shallow: true,
    });
  };
  const handleFilterChange = (field: string) => (v: string) =>
    updateUrl(field, v);

  // 删除
  const handleDelete = (id: string) => {
    const c = containers.find((x) => x.id === id);
    Modal.confirm({
      okText: "删除",
      okButtonProps: { className: "!bg-[#198348] !border-[#198348]" },
      cancelText: "取消",
      title: "确认删除",
      content: `确定删除集装箱 ${c?.containerNo} 吗？`,
      onOk: async () => {
        try {
          await deleteContainer(id);
          message.warning(`集装箱 ${c?.containerNo} 已删除`);
          loadData(router.query, page);
        } catch {
          message.error("删除失败");
        }
      },
    });
  };

  // 保存后刷新
  const handleSave = () => {
    setEditId(undefined);
    loadData(router.query, page);
  };

  const columns: ColumnsType<Container> = [
    {
      title: "箱号",
      dataIndex: "containerNo",
      align: "center",
      render: (v, r) => (
        <a
          className="text-[#198348] hover:underline cursor-pointer"
          onClick={() => setViewId(r.id)}
        >
          {v}
        </a>
      ),
    },
    {
      title: "箱型",
      dataIndex: "containerType",
      align: "center",
      render: (v) => v || "-",
    },
    {
      title: "使用情况",
      dataIndex: "usageType",
      align: "center",
      render: (v) => <UsageTag usage={v} />,
    },
    {
      title: "箱况",
      dataIndex: "conditionType",
      align: "center",
      render: (v) => <CondTag cond={v} />,
    },
    {
      title: "卖方/出租方",
      dataIndex: "supplierName",
      align: "center",
      render: (v) => v || "-",
    },
    {
      title: "成本(USD)",
      dataIndex: "cost",
      align: "center",
      render: (v) => (v != null ? `$${v}` : "-"),
    },
    {
      title: "提箱堆场",
      dataIndex: "liftingYardName",
      align: "center",
      render: (v) => v || "-",
    },
    {
      title: "提箱时间",
      dataIndex: "liftingTime",
      align: "center",
      render: (v) => v || "-",
    },
    {
      title: "提箱令",
      dataIndex: "liftingOrderNo",
      align: "center",
      render: (v) => v || "-",
    },
    {
      title: "当前项目",
      dataIndex: "projectName",
      align: "center",
    },
    {
      title: "当前状态",
      dataIndex: "status",
      align: "center",
      render: (v) => <StatusBadge status={v} />,
    },
    {
      title: "状态备注",
      dataIndex: "statusRemark",
      align: "center",
      render: (v) => v || "-",
    },
    {
      title: "买方",
      dataIndex: "buyerName",
      align: "center",
      render: (v) => v || "-",
    },
    {
      title: "操作",
      align: "center",
      fixed: "right",
      render: (_, r) => (
        <Space size={2}>
          <Button
            type="text"
            size="small"
            className="!px-1 !py-0.5 !text-xs"
            onClick={() => setViewId(r.id)}
            title="查看"
          >
            👁
          </Button>
          <Button
            type="text"
            size="small"
            className="!px-1 !py-0.5 !text-xs"
            onClick={() => setEditId(r.id)}
            title="编辑"
          >
            ✎
          </Button>
          <Button
            type="text"
            size="small"
            danger
            className="!px-1 !py-0.5 !text-xs"
            onClick={() => handleDelete(r.id)}
            title="删除"
          >
            🗑
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      {/* 工具栏 */}
      <div className="flex items-center gap-2 flex-wrap px-4">
        <Button type="primary" onClick={() => setEditId(null)}>
          + 新增集装箱
        </Button>
        <div className="ml-auto flex items-center gap-2">
          <Select
            placeholder="全部状态"
            allowClear
            value={statusFilter || undefined}
            onChange={handleFilterChange("status")}
            className="w-32"
            size="small"
            options={statusOptions}
          />
          <Select
            placeholder="全部使用情况"
            allowClear
            value={usageFilter || undefined}
            onChange={handleFilterChange("usage")}
            className="w-32"
            size="small"
            options={usageOptions}
          />
          <Select
            placeholder="全部箱况"
            allowClear
            value={condFilter || undefined}
            onChange={handleFilterChange("cond")}
            className="w-32"
            size="small"
            options={condOptions}
          />
          <Input
            placeholder="箱号"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={() => {
              const q: Record<string, string | string[] | undefined> = {
                ...router.query,
              };
              if (keyword) q.keyword = keyword;
              else delete q.keyword;
              delete q.page;
              router.push({ pathname: router.pathname, query: q }, undefined, {
                shallow: true,
              });
            }}
            className="!w-44"
            size="small"
            allowClear
          />
        </div>
      </div>

      {/* 表格 */}
      <Table
        bordered
        columns={columns}
        dataSource={containers}
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          onChange: (p, ps) => {
            const q = { ...router.query } as Record<
              string,
              string | string[] | undefined
            >;
            q.page = String(p);
            if (ps !== 20) q.pageSize = String(ps);
            else delete q.pageSize;
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
        scroll={{ x: 1700 }}
      />

      {/* 新增/编辑弹窗 */}
      {editId !== undefined && (
        <ContainerModal
          id={editId ?? null}
          onSave={handleSave}
          onClose={() => setEditId(undefined)}
        />
      )}

      {/* 详情弹窗 */}
      {viewId !== null && (
        <ContainerDetailModal
          id={viewId}
          onClose={() => setViewId(null)}
          onEdit={() => {
            setViewId(null);
            setEditId(viewId);
          }}
        />
      )}
    </div>
  );
};
