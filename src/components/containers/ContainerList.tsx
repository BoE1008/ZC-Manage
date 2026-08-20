import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button, Input, Select, Space, Modal, message } from "antd";
import Table from "@/components/ResizeTable";
import type { ColumnsType } from "antd/es/table";
import { Container, ContainerStatus, ConditionType, UsageType } from "@/types";
import { StatusBadge, UsageTag, CondTag } from "@/components/ui/Badge";
import { ContainerModal } from "./ContainerModal";
import { ContainerDetailModal } from "./ContainerDetailModal";
import { getContainerList, deleteContainer } from "@/restApi/container";
import { getProjectList } from "@/restApi/project";

// 状态枚举值（后端）
const STATUS_OPTIONS = [
  { label: "待提箱", value: "pending" },
  { label: "提箱中", value: "lifting" },
  { label: "在途", value: "in_transit" },
  { label: "已落箱", value: "dropped" },
  { label: "堆存中", value: "storage" },
  { label: "已放箱", value: "released" },
  { label: "已提箱", value: "picked_up" },
  { label: "已还箱", value: "returned" },
];

// 箱况枚举值（后端）
const COND_OPTIONS = [
  { label: "新箱", value: "new" },
  { label: "次新箱", value: "sub_new" },
  { label: "适货箱", value: "cargo_worthy" },
];

// 使用情况枚举值（后端）
const USAGE_OPTIONS = [
  { label: "买箱", value: "purchase" },
  { label: "长租", value: "long_rental" },
];

export const ContainerList = () => {
  const router = useRouter();

  // 分页
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);

  // 数据 & loading
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(false);

  // 筛选（URL query 同步 + 本地 state）
  const [statusFilter, setStatusFilter] = useState("");
  const [usageFilter, setUsageFilter] = useState("");
  const [condFilter, setCondFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [keyword, setKeyword] = useState("");

  // 项目列表（用于下拉 & 名称反查）
  const [projects, setProjects] = useState<any[]>([]);

  // 编辑 & 预览
  const [editId, setEditId] = useState<string | null | undefined>(undefined);
  const [viewId, setViewId] = useState<string | null>(null);

  // 从 URL query 同步筛选（支持从 dashboard/report 跳转带入）
  // URL query 同步筛选
  useEffect(() => {
    const q = router.query;
    if (q.status) setStatusFilter(String(q.status));
    if (q.usage) setUsageFilter(String(q.usage));
    if (q.cond) setCondFilter(String(q.cond));
    if (q.project) setProjectFilter(String(q.project));
    if (q.q) setKeyword(String(q.q));
  }, [router.query]);

  // 一次性加载项目列表
  useEffect(() => {
    getProjectList(1, 1000).then((r: any) => setProjects(r?.entity?.data ?? []));
  }, []);

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getContainerList({
        pageNo: page,
        pageSize: pageSize,
        status: statusFilter || undefined,
        usageType: usageFilter || undefined,
        conditionType: condFilter || undefined,
        projectId: projectFilter || undefined,
        containerNo: keyword || undefined,
      });
      const records = res.entity?.data ?? [];
      setContainers(records);
      setTotal(res.entity?.total ?? 0);
    } catch {
      message.error("获取集装箱列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [
    page,
    pageSize,
    statusFilter,
    usageFilter,
    condFilter,
    projectFilter,
    keyword,
  ]);

  // 重置页码
  const handleFilterChange = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    setPage(1);
  };

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
          loadData();
        } catch {
          message.error("删除失败");
        }
      },
    });
  };

  // 保存后刷新
  const handleSave = () => {
    setEditId(undefined);
    loadData();
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
      render: (v) => projects.find((x) => x.id === v)?.name || v || "-",
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
      <div className="flex items-center gap-2 flex-wrap">
        <Button type="primary" onClick={() => setEditId(null)}>
          + 新增集装箱
        </Button>
        <div className="ml-auto flex items-center gap-2">
          <Select
            placeholder="全部状态"
            allowClear
            value={statusFilter || undefined}
            onChange={handleFilterChange(setStatusFilter)}
            className="w-32"
            size="small"
            options={STATUS_OPTIONS}
          />
          <Select
            placeholder="全部使用情况"
            allowClear
            value={usageFilter || undefined}
            onChange={handleFilterChange(setUsageFilter)}
            className="w-32"
            size="small"
            options={USAGE_OPTIONS}
          />
          <Select
            placeholder="全部箱况"
            allowClear
            value={condFilter || undefined}
            onChange={handleFilterChange(setCondFilter)}
            className="w-32"
            size="small"
            options={COND_OPTIONS}
          />
          <Select
            placeholder="全部项目"
            allowClear
            value={projectFilter || undefined}
            onChange={handleFilterChange(setProjectFilter)}
            className="w-40"
            size="small"
            
            options={projects.map((p) => ({ label: p.name, value: p.id }))}
          />
          <Input
            placeholder="箱号 / 项目"
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(1);
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
            setPage(p);
            setPageSize(ps);
          },
          // pageSize 变化的回调
          onShowSizeChange: async (page, size) => {
            setPage(page);
            setPageSize(size);
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
