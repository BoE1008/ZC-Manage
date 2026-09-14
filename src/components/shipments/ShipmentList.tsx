import { useState, useEffect } from "react";
import Table from "@/components/ResizeTable";
import { Button, Select, Space, Modal, message, Tooltip } from "antd";
import SearchInput from "@/components/SearchInput";
import { ContainerDetailModal } from "@/components/containers/ContainerDetailModal";
import { ShipmentDetailModal } from "./ShipmentDetailModal";
import type { ColumnsType } from "antd/es/table";
import { Container, ContainerTracking, ContainerStatus } from "@/types";
import { StatusBadge } from "@/components/ui/Badge";
import { ShipmentModal } from "./ShipmentModal";
import {
  getTrackingList,
  deleteTracking,
  getTrackingProjectSummary,
} from "@/restApi/tracking";
import { getAllProjectList } from "@/restApi/project";
import { getDictOptions, getDictOptionsSync } from "@/restApi/dictCache";
import type { DictOption } from "@/types/dict";
import { useRouter } from "next/router";

export const ShipmentList = () => {
  const router = useRouter();
  const [shipments, setShipments] = useState<ContainerTracking[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [saleFilter, setSaleFilter] = useState("");
  const [keyword, setKeyword] = useState("");
  const [projectFilter, setProjectFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [editId, setEditId] = useState<string | null | undefined>(undefined);
  const [viewId, setViewId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [statusOptions, setStatusOptions] = useState<DictOption[]>(
    getDictOptionsSync("container_status"),
  );
  // 项目维度运踪汇总
  const [projectSummaries, setProjectSummaries] = useState<any[]>([]);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryProjects, setSummaryProjects] = useState<
    { id: string; name: string; num: string }[]
  >([]);

  const loadShipments = (
    pageNo = page,
    extra?: {
      status?: string;
      keyword?: string;
      projectId?: string;
      saleStatus?: string;
    },
  ) => {
    const status = extra?.status ?? statusFilter;
    const kw = extra?.keyword ?? keyword;
    const pid =
      extra?.projectId !== undefined ? extra.projectId : projectFilter;
    const sale = extra?.saleStatus ?? saleFilter;
    setLoading(true);
    getTrackingList({
      pageNo,
      pageSize: 20,
      status: status || undefined,
      containerNo: kw || undefined,
      projectId: pid || undefined,
      saleStatus: sale || undefined,
    })
      .then((r) => {
        setShipments(r.entity?.data ?? []);
        setTotal(r.entity?.total ?? 0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getDictOptions("container_status").then(setStatusOptions);
  }, []);

  // 加载项目下拉选项（汇总筛选用）
  useEffect(() => {
    getAllProjectList().then((r: any) => {
      const list = (r?.entity?.data ?? []) as any[];
      setSummaryProjects(
        list.map((p) => ({
          id: p.id,
          name: p.name ?? "",
          num: p.num ?? p.projectNum ?? "",
        })),
      );
    });
  }, []);

  // 加载项目维度运踪汇总
  const loadProjectSummary = async (projectId?: string) => {
    setSummaryLoading(true);
    try {
      const res: any = await getTrackingProjectSummary(projectId);
      const raw = res?.entity ?? {};
      // 兼容两种返回结构：数组 或 { list: [] } 或 { records: [] } 或 { data: [] }
      const arr = Array.isArray(raw)
        ? raw
        : Array.isArray(raw.list)
          ? raw.list
          : Array.isArray(raw.records)
            ? raw.records
            : Array.isArray(raw.data)
              ? raw.data
              : [];
      setProjectSummaries(arr);
    } catch (e) {
      console.error("[ShipmentList] projectSummary error:", e);
      setProjectSummaries([]);
    } finally {
      setSummaryLoading(false);
    }
  };

  // 项目汇总：始终展示全部项目汇总（不随 projectFilter 联动）
  useEffect(() => {
    loadProjectSummary(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // URL 单一数据源：URL 变化 → 同步状态 → 加载数据
  useEffect(() => {
    if (!router.isReady) return;
    const q = router.query;
    const ns = typeof q.status === "string" ? q.status : "";
    const nk = typeof q.keyword === "string" ? q.keyword : "";
    const np = typeof q.page === "string" ? Number(q.page) : 1;
    const npid = typeof q.projectId === "string" ? q.projectId : "";
    const nsale = typeof q.sale === "string" ? q.sale : "";
    setStatusFilter(ns);
    setKeyword(nk);
    setPage(np);
    setProjectFilter(npid);
    setSaleFilter(nsale);
    loadShipments(np, {
      status: ns,
      keyword: nk,
      projectId: npid,
      saleStatus: nsale,
    });
  }, [router.isReady, router.query]);

  const columns: ColumnsType<ContainerTracking> = [
    {
      title: "箱号",
      dataIndex: "containerNo",
      render: (v, r) => (
        <Tooltip title={<span>查看集装箱信息</span>}>
          <span
            className="text-[#198348] hover:underline cursor-pointer"
            onClick={() => setViewId(r.containerId)}
          >
            {v}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "项目名称",
      dataIndex: "projectName",
      ellipsis: true,
    },
    {
      title: "项目编号",
      dataIndex: "projectNum",
      ellipsis: true,
    },
    { title: "批次号", dataIndex: "batchNo" },
    { title: "提单号", dataIndex: "billOfLadingNo" },
    { title: "发运站", dataIndex: "departureStation" },
    { title: "目的站", dataIndex: "arrivalStation" },
    { title: "口岸", dataIndex: "port" },
    {
      title: "提箱时间",
      dataIndex: "liftingTime",
      render: (v) => v || "-",
    },
    {
      title: "提箱令",
      dataIndex: "liftingOrderNo",
      ellipsis: true,
      render: (v) => v || "-",
    },
    {
      title: "发运时间",
      dataIndex: "sendTime",
      render: (v) => v || "-",
    },
    {
      title: "预计到达",
      dataIndex: "eta",
      render: (v) => v || "-",
    },
    {
      title: "实际到达",
      dataIndex: "ata",
      render: (v) => v || "-",
    },
    {
      title: "状态",
      dataIndex: "status",
      render: (v) => <StatusBadge status={v as ContainerStatus} />,
    },
    {
      title: "状态备注",
      dataIndex: "statusRemark",
      ellipsis: true,
      render: (v) => v || "-",
    },
    {
      title: "还箱时间",
      dataIndex: "returnTime",
      render: (v) => v || "-",
    },
    {
      title: "还箱令",
      dataIndex: "returnOrderNo",
      ellipsis: true,
      render: (v) => v || "-",
    },
    {
      title: "售卖状态",
      dataIndex: "saleStatus",
      width: 110,
      align: "center",
      render: (v) =>
        v === "sold_delivered" ? (
          <span className="px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">
            卖出已交付
          </span>
        ) : v === "sold_pending" ? (
          <span className="px-2 py-0.5 rounded text-xs bg-amber-100 text-amber-700">
            卖出未交付
          </span>
        ) : v === "unsold" ? (
          <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
            未卖出
          </span>
        ) : (
          "-"
        ),
    },
    {
      title: "操作",
      align: "center",
      fixed: "right",
      render: (_, r) => (
        <Space size={2}>
          <Tooltip title={<span>查看运踪详细信息</span>}>
            <Button
              type="text"
              size="small"
              className="!px-1 !py-0.5 !text-xs"
              onClick={() => setDetailId(r.id)}
            >
              👁
            </Button>
          </Tooltip>
          <Tooltip title={<span>编辑</span>}>
            <Button
              type="text"
              size="small"
              className="!px-1 !py-0.5 !text-xs"
              onClick={() => setEditId(r.id)}
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
              onClick={() => handleDelete(r.id)}
            >
              🗑
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleDelete = (id: string) => {
    Modal.confirm({
      okText: "删除",
      okButtonProps: { className: "!bg-[#198348] !border-[#198348]" },
      cancelText: "取消",
      title: "确认删除",
      content: "确定删除此运踪记录吗？",
      onOk: async () => {
        await deleteTracking(id);
        message.warning("运踪已删除");
        loadShipments();
        loadProjectSummary();
      },
    });
  };

  const handleSave = () => {
    setEditId(undefined);
    loadProjectSummary();
    loadShipments(page);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap px-4">
        <Button type="primary" onClick={() => setEditId(null)}>
          + 新增运踪
        </Button>

        <div className="ml-auto flex items-center gap-2">
          <Select
            size="small"
            allowClear
            showSearch
            placeholder="项目编号"
            className="!w-44"
            value={projectFilter || undefined}
            onChange={(v) => {
              const q: any = { ...router.query, page: "1" };
              if (v) q.projectId = v;
              else delete q.projectId;
              router.push({ pathname: router.pathname, query: q }, undefined, {
                shallow: true,
              });
            }}
            filterOption={(i, o) =>
              ((o?.label as string) || "")
                .toLowerCase()
                .includes(i.toLowerCase())
            }
            options={summaryProjects.map((p) => ({
              label: p.num || p.name,
              value: p.id,
            }))}
          />
          <Select
            size="small"
            allowClear
            showSearch
            placeholder="项目名称"
            className="!w-48"
            value={projectFilter || undefined}
            onChange={(v) => {
              const q: any = { ...router.query, page: "1" };
              if (v) q.projectId = v;
              else delete q.projectId;
              router.push({ pathname: router.pathname, query: q }, undefined, {
                shallow: true,
              });
            }}
            filterOption={(i, o) =>
              ((o?.label as string) || "")
                .toLowerCase()
                .includes(i.toLowerCase())
            }
            options={summaryProjects.map((p) => ({
              label: p.name,
              value: p.id,
            }))}
          />
          <Select
            placeholder="全部状态"
            allowClear
            value={statusFilter || undefined}
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
            className="w-32"
            size="small"
            options={statusOptions}
          />
          <Select
            placeholder="全部售卖状态"
            allowClear
            value={saleFilter || undefined}
            onChange={(v) => {
              const q: Record<string, string | string[] | undefined> = {
                ...router.query,
                sale: v || undefined,
                page: "1",
              };
              if (!v) delete q.sale;
              router.push({ pathname: router.pathname, query: q }, undefined, {
                shallow: true,
              });
            }}
            className="w-32"
            size="small"
            options={[
              { label: "未卖出", value: "unsold" },
              { label: "卖出未交付", value: "sold_pending" },
              { label: "卖出已交付", value: "sold_delivered" },
            ]}
          />
          <div className="!w-48">
            <SearchInput
              placeholder="箱号"
              onSearch={(v) => {
                const q: Record<string, string | string[] | undefined> = {
                  ...router.query,
                  keyword: v || undefined,
                  page: "1",
                };
                if (!v) delete q.keyword;
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

      {/* 项目运踪汇总 */}
      <div className="bg-white rounded shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center text-sm font-bold text-gray-800">
            <div className="w-1 h-4 bg-[#198348] rounded mr-2 flex-shrink-0" />
            项目运踪汇总
          </div>
        </div>
        <Table
          size="small"
          loading={summaryLoading}
          dataSource={projectSummaries.map((s, i) => ({
            key: s.projectId ?? s.id ?? i,
            ...s,
          }))}
          pagination={false}
          rowClassName={(r: any) =>
            r.key === projectFilter
              ? "bg-[#EAF6EF]"
              : "cursor-pointer hover:bg-gray-50"
          }
          onRow={(r: any) => ({
            onClick: () => {
              const pid = r.key as string;
              const q: any = { ...router.query, page: "1" };
              if (pid === projectFilter) delete q.projectId;
              else q.projectId = pid;
              router.push({ pathname: router.pathname, query: q }, undefined, {
                shallow: true,
              });
            },
          })}
          columns={[
            {
              title: "项目名称",
              dataIndex: "projectName",
              render: (v: any, r: any) => v ?? r.name ?? "-",
            },
            {
              title: "项目编号",
              dataIndex: "projectNum",
              render: (v: any, r: any) => v ?? r.num ?? "-",
            },
            {
              title: "总箱数",
              dataIndex: "totalCount",
              align: "center",
              render: (v: any, r: any) => v ?? r.total ?? r.count ?? 0,
            },
            {
              title: "已到达",
              dataIndex: "arrivedCount",
              align: "center",
              render: (v: any, r: any) => (
                <span className="text-[#198348] font-medium">
                  {v ?? r.arrived ?? 0}
                </span>
              ),
            },
            {
              title: "在途",
              dataIndex: "inTransitCount",
              align: "center",
              render: (v: any, r: any) => (
                <span className="text-blue-600 font-medium">
                  {v ?? r.inTransit ?? 0}
                </span>
              ),
            },
            {
              title: "已还箱",
              dataIndex: "returnedCount",
              align: "center",
              render: (v: any, r: any) => (
                <span className="text-orange-600 font-medium">
                  {v ?? r.returned ?? 0}
                </span>
              ),
            },
            {
              title: "已卖出",
              dataIndex: "soldCount",
              align: "center",
              render: (v: any, r: any) => (
                <span className="text-purple-600 font-medium">
                  {v ?? r.sold ?? 0}
                </span>
              ),
            },
            {
              title: "到达进度",
              dataIndex: "progress",
              width: 220,
              render: (_: any, r: any) => {
                const total = r.totalCount ?? r.total ?? r.count ?? 0;
                const arrived = r.arrivedCount ?? r.arrived ?? 0;
                const pct = total > 0 ? Math.round((arrived / total) * 100) : 0;
                return (
                  <div className="space-y-1">
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#198348] rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-gray-500 text-right">
                      已到达/总 {pct}%
                    </div>
                  </div>
                );
              },
            },
          ]}
        />
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 px-3 py-2 text-xs text-yellow-800 rounded">
        <b>📌 说明：</b>
        运踪以「项目+箱号」为维度，每次发运记录一段运踪。同一集装箱多次复用时，按发运顺序记录多段。点击箱号查看该集装箱完整运生命周期。已录入集装箱号的箱子可直接新增运踪（箱号支持输入搜索）。
      </div>

      <div className="bg-white rounded shadow-sm overflow-hidden">
        <Table
          columns={columns}
          dataSource={shipments}
          loading={loading}
          rowKey="id"
          size="small"
          pagination={{
            current: page,
            total,
            pageSize: 20,
            showTotal: (t) => `共 ${t} 条`,
            onChange: (p) => {
              const q: Record<string, string | string[] | undefined> = {
                ...router.query,
                page: String(p),
              };
              delete q.keyword;
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
          }}
          scroll={{ x: 1700 }}
        />
      </div>

      {editId !== undefined && (
        <ShipmentModal
          id={editId ?? null}
          onSave={handleSave}
          onClose={() => setEditId(undefined)}
        />
      )}
      {detailId && (
        <ShipmentDetailModal id={detailId} onClose={() => setDetailId(null)} />
      )}
      {viewId && (
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
