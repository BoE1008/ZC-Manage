import { useState, useEffect, useCallback, type ReactNode } from "react";
import { useRouter } from "next/router";
import { Button, Dropdown, Tooltip, Select, Space, Modal, message } from "antd";
import {
  PlusCircle,
  TrendUp,
  MinusCircle,
  TrendDown,
  FileText,
  Download,
  Eye,
  Edit,
  Trash,
  More,
} from "reicon-react";
import Table from "@/components/ResizeTable";
import type { ColumnsType } from "antd/es/table";
import { Container } from "@/types";
import {
  StatusBadge,
  UsageTag,
  CondTag,
  SaleStatusTag,
} from "@/components/ui/Badge";
import { ContainerModal } from "./ContainerModal";
import { ContainerDetailModal } from "./ContainerDetailModal";
import { DetailFormModal } from "./CostIncomeDetail";
import {
  getContainerList,
  deleteContainer,
  batchDeleteContainers,
  importContainer,
} from "@/restApi/container";
import { getDictOptions, getDictOptionsSync } from "@/restApi/dictCache";
import type { DictOption } from "@/types/dict";
import SearchInput from "../SearchInput";
import ImportButton from "../ImportButton";

const PAGE_SIZE = 20;

/** 操作列图标按钮：Tooltip + text Button 的统一封装 */
const ActionButton = ({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: () => void;
  children: ReactNode;
}) => (
  <Tooltip title={<span>{title}</span>}>
    <Button
      type="text"
      size="small"
      className="!px-1 !py-0.5 !text-xs"
      onClick={onClick}
      title={title}
    >
      {children}
    </Button>
  </Tooltip>
);

export const ContainerList = () => {
  const router = useRouter();

  // 分页
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // 数据 & loading
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(false);

  // 筛选 state（由 URL sync effect 写入，供 Select value 绑定）
  const [statusFilter, setStatusFilter] = useState("");
  const [usageFilter, setUsageFilter] = useState("");
  const [condFilter, setCondFilter] = useState("");
  const [saleFilter, setSaleFilter] = useState("");

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
  const [saleOptions, setSaleOptions] = useState<DictOption[]>(
    getDictOptionsSync("container_sale_status"),
  );

  // 编辑 & 预览
  const [editId, setEditId] = useState<string | null | undefined>(undefined);
  const [viewId, setViewId] = useState<string | null>(null);

  // 批量选中
  const [selectedRows, setSelectedRows] = useState<Container[]>([]);

  // 成本/收入明细快捷新增
  const [detailForm, setDetailForm] = useState<{
    type: "cost" | "income";
    id: string | null;
    containerId: string;
    containerNo: string;
  } | null>(null);

  // 查看明细时详情 tab 切换
  const [viewInitialTab, setViewInitialTab] = useState<string | undefined>(
    undefined,
  );

  // 加载字典
  useEffect(() => {
    Promise.all([
      getDictOptions("container_status"),
      getDictOptions("container_usage"),
      getDictOptions("container_cond"),
      getDictOptions("container_sale_status"),
    ]).then(([s, u, c, sa]) => {
      setStatusOptions(s);
      setUsageOptions(u);
      setCondOptions(c);
      setSaleOptions(sa);
    });
  }, []);

  // 加载数据（URL 是唯一数据源）
  const loadData = useCallback(
    (qs: Record<string, string | string[] | undefined>, p: number) => {
      const pick = (key: string) =>
        typeof qs[key] === "string" ? (qs[key] as string) : "";
      const s = pick("status");
      const u = pick("usage");
      const c = pick("cond");
      const k = pick("q");
      const sa = pick("sale");
      setStatusFilter(s);
      setUsageFilter(u);
      setCondFilter(c);
      setSaleFilter(sa);
      setLoading(true);
      getContainerList({
        pageNo: p,
        pageSize: PAGE_SIZE,
        status: s || undefined,
        usageType: u || undefined,
        conditionType: c || undefined,
        containerNo: k || undefined,
        saleStatus: sa || undefined,
      })
        .then((res) => {
          setContainers(res.entity?.data ?? []);
          setTotal(res.entity?.total ?? 0);
        })
        .catch(() => message.error("获取集装箱列表失败"))
        .finally(() => setLoading(false));
    },
    [],
  );

  // 统一的 URL 写入入口，避免各处手写 shallow push
  const pushQuery = useCallback(
    (patch: Record<string, string | undefined>) => {
      const q = { ...router.query } as Record<
        string,
        string | string[] | undefined
      >;
      Object.entries(patch).forEach(([key, value]) => {
        if (value === undefined) delete q[key];
        else q[key] = value;
      });
      router.push({ pathname: router.pathname, query: q }, undefined, {
        shallow: true,
      });
    },
    [router],
  );

  // URL sync effect（唯一数据加载入口）
  useEffect(() => {
    if (!router.isReady) return;
    const p =
      typeof router.query.page === "string" ? Number(router.query.page) : 1;
    setPage(p);
    // loadData 内部已同步各筛选项 state
    loadData(router.query, p);
  }, [router.isReady, router.query, loadData]);

  // 工具栏筛选 / 关键词回车 → 更新 URL
  const handleFilterChange = (field: string) => (value: string) =>
    pushQuery({ [field]: value || undefined, page: undefined });

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

  // 批量删除
  const handleBatchDelete = () => {
    if (selectedRows.length === 0) return;
    const list = [...selectedRows];
    const preview = list
      .slice(0, 3)
      .map((x) => x.containerNo)
      .join("、");
    const more = list.length > 3 ? ` 等 ${list.length} 个` : "";
    Modal.confirm({
      okText: "删除",
      okButtonProps: { className: "!bg-[#198348] !border-[#198348]" },
      cancelText: "取消",
      title: "确认批量删除",
      content: `确定删除集装箱 ${preview}${more} 吗？`,
      onOk: async () => {
        try {
          await batchDeleteContainers(list.map((x) => x.id));
          message.warning(`已批量删除 ${list.length} 个集装箱`);
          setSelectedRows([]);
          loadData(router.query, page);
        } catch {
          message.error("批量删除失败");
        }
      },
    });
  };

  // 保存后刷新
  const handleSave = () => {
    setEditId(undefined);
    loadData(router.query, page);
  };

  const openDetail = (id: string, tab?: string) => {
    setViewInitialTab(tab);
    setViewId(id);
  };

  const columns: ColumnsType<Container> = [
    {
      title: "箱号",
      dataIndex: "containerNo",
      align: "center",
      render: (v, r) => (
        <Tooltip title={<span>查看集装箱信息</span>}>
          <a
            className="text-[#198348] hover:underline cursor-pointer"
            onClick={() => openDetail(r.id)}
          >
            {v}
          </a>
        </Tooltip>
      ),
    },
    {
      title: "箱型",
      dataIndex: "containerType",
      align: "center",
      render: (v) => v || "-",
    },
    {
      title: "当前状态",
      dataIndex: "status",
      align: "center",
      render: (v) => <StatusBadge status={v} />,
    },
    {
      title: "使用情况",
      dataIndex: "usageType",
      align: "center",
      render: (v) => <UsageTag usage={v} />,
    },
    {
      title: "售卖状态",
      dataIndex: "saleStatus",
      align: "center",
      render: (v) => <SaleStatusTag saleStatus={v} />,
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
      title: "当前堆场",
      dataIndex: "dropYardName",
      align: "center",
      render: (v) => v || "-",
    },

    {
      title: "操作",
      align: "center",
      width: 120,
      fixed: "right",
      render: (_, r) => (
        <Space size={4} className="justify-center">
          <ActionButton title="查看" onClick={() => openDetail(r.id)}>
            <Eye size={16} />
          </ActionButton>
          <ActionButton title="编辑" onClick={() => setEditId(r.id)}>
            <Edit size={16} />
          </ActionButton>
          <Dropdown
            trigger={["click"]}
            menu={{
              items: [
                {
                  key: "cost",
                  label: "新增成本明细",
                  icon: <MinusCircle size={16} />,
                  onClick: () =>
                    setDetailForm({
                      type: "cost",
                      id: null,
                      containerId: r.id,
                      containerNo: r.containerNo ?? "",
                    }),
                },
                {
                  key: "income",
                  label: "新增收入明细",
                  icon: <PlusCircle size={16} />,
                  onClick: () =>
                    setDetailForm({
                      type: "income",
                      id: null,
                      containerId: r.id,
                      containerNo: r.containerNo ?? "",
                    }),
                },
                {
                  key: "viewCI",
                  label: "查看成本/收入明细",
                  icon: <FileText size={16} />,
                  onClick: () => openDetail(r.id, "costIncome"),
                },
                { type: "divider" },
                {
                  key: "delete",
                  label: "删除",
                  icon: <Trash size={16} color="#ff4d4f" />,
                  danger: true,
                  onClick: () => handleDelete(r.id),
                },
              ],
            }}
          >
            <Button type="text" size="small" className="!px-1 !py-0.5 !text-xs">
              <More size={16} />
            </Button>
          </Dropdown>
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

        <Button>
          <a
            href="/templates/container.xlsx"
            download
            className="flex items-center gap-1"
          >
            <Download size={16} />
            下载模板
          </a>
        </Button>
        <ImportButton
          importFn={importContainer}
          onSuccess={() => loadData(router.query, page)}
          label="批量导入"
        />
        {selectedRows.length > 0 && (
          <Button
            danger
            onClick={handleBatchDelete}
            className="!border-[#ff4d4f] !text-[#ff4d4f]"
          >
            批量删除 ({selectedRows.length})
          </Button>
        )}
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
            placeholder="全部售卖状态"
            allowClear
            value={saleFilter || undefined}
            onChange={handleFilterChange("sale")}
            className="w-32"
            size="small"
            options={saleOptions}
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
          <SearchInput
            placeholder="箱号"
            onSearch={(v) => pushQuery({ q: v || undefined, page: undefined })}
          />
        </div>
      </div>

      {/* 表格 */}
      <Table
        bordered
        rowKey="id"
        columns={columns}
        dataSource={containers}
        loading={loading}
        rowSelection={{
          selectedRowKeys: selectedRows.map((r) => r.id),
          onChange: (_keys, rows) => setSelectedRows(rows),
        }}
        pagination={{
          current: page,
          pageSize: PAGE_SIZE,
          total,
          onChange: (p, ps) =>
            pushQuery({
              page: String(p),
              pageSize: ps !== PAGE_SIZE ? String(ps) : undefined,
            }),
          onShowSizeChange: (_p, ps) =>
            pushQuery({ page: "1", pageSize: String(ps) }),
          showTotal: (t) => `共 ${t} 条`,
        }}
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
          initialTab={viewInitialTab}
          onClose={() => {
            setViewId(null);
            setViewInitialTab(undefined);
          }}
          onEdit={() => {
            const current = viewId;
            setViewId(null);
            setViewInitialTab(undefined);
            setEditId(current);
          }}
        />
      )}

      {/* 成本/收入明细快捷新增弹窗 */}
      {detailForm && (
        <DetailFormModal
          type={detailForm.type}
          id={detailForm.id}
          containerId={detailForm.containerId}
          containerNo={detailForm.containerNo}
          onClose={() => setDetailForm(null)}
          onSaved={() => setDetailForm(null)}
        />
      )}
    </div>
  );
};
