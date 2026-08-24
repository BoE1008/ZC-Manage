import { useState, useEffect } from "react";
import Table from "@/components/ResizeTable";
import { Button, Select, Space, Modal, message } from "antd";
import SearchInput from "@/components/SearchInput";
import { ContainerDetailModal } from "@/components/containers/ContainerDetailModal";
import type { ColumnsType } from "antd/es/table";
import { Container, ContainerTracking, ContainerStatus } from "@/types";
import { StatusBadge } from "@/components/ui/Badge";
import { ShipmentModal } from "./ShipmentModal";
import { getTrackingList, deleteTracking } from "@/restApi/tracking";
import { getContainerList } from "@/restApi/container";
import { getAllProjectList } from "@/restApi/project";
import { getDictOptions, getDictOptionsSync } from "@/restApi/dictCache";
import type { DictOption } from "@/types/dict";

export const ShipmentList = () => {
  const [shipments, setShipments] = useState<ContainerTracking[]>([]);
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [editId, setEditId] = useState<string | null | undefined>(undefined);
  const [viewId, setViewId] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [statusOptions, setStatusOptions] = useState<DictOption[]>(
    getDictOptionsSync("container_status"),
  );

  const loadShipments = (pageNo = page) => {
    setLoading(true);
    getTrackingList({
      pageNo,
      pageSize: 20,
      status: statusFilter || undefined,
      containerNo: keyword || undefined,
      returnOrderNo: keyword || undefined,
    })
      .then((r) => {
        setShipments(r.entity?.data ?? []);
        setTotal(r.entity?.total ?? 0);
      })
      .finally(() => setLoading(false));
  };

  const loadContainers = () => {
    getContainerList({ pageNo: 1, pageSize: 500 }).then((r) =>
      setContainers(r.entity?.data ?? []),
    );
  };

  useEffect(() => {
    loadShipments(1);
    loadContainers();
  }, []);

  useEffect(() => {
    getAllProjectList().then((r: any) => setProjects(r?.entity?.data ?? []));
    getDictOptions("container_status").then(setStatusOptions);
  }, []);

  const handleViewBox = (containerNo: string) => {
    const c = containers.find((x) => x.containerNo === containerNo);
    if (c) setViewId(c.id);
  };

  const columns: ColumnsType<ContainerTracking> = [
    {
      title: "箱号",
      dataIndex: "containerNo",
      render: (v) => (
        <span
          className="text-[#198348] hover:underline cursor-pointer"
          onClick={() => handleViewBox(v)}
        >
          {v}
        </span>
      ),
    },
    {
      title: "项目名称",
      dataIndex: "projectName",
      ellipsis: true,
      render: (v, r) => projects.find((x) => x.id === r.projectId)?.name || v,
    },
    {
      title: "项目编号",
      dataIndex: "projectId",
      ellipsis: true,
      render: (v) => projects.find((x) => x.id === v)?.num || v,
    },
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
      title: "操作",
      align: "center",
      render: (_, r) => (
        <Space size={2}>
          <Button
            type="text"
            size="small"
            className="!px-1 !py-0.5 !text-xs"
            onClick={() => setEditId(r.id)}
          >
            ✎
          </Button>
          <Button
            type="text"
            size="small"
            danger
            className="!px-1 !py-0.5 !text-xs"
            onClick={() => handleDelete(r.id)}
          >
            🗑
          </Button>
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
      },
    });
  };

  const handleSave = () => {
    setEditId(undefined);
    loadShipments(page);
    loadContainers();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap px-4">
        <Button type="primary" onClick={() => setEditId(null)}>
          + 新增运踪
        </Button>
        <Button onClick={() => message.success("运踪数据已导出")}>
          📤 导出
        </Button>
        <div className="ml-auto flex items-center gap-2">
          <Select
            placeholder="全部状态"
            allowClear
            value={statusFilter || undefined}
            onChange={(v) => {
              setStatusFilter(v || "");
              setPage(1);
              loadShipments(1);
            }}
            className="w-32"
            size="small"
            options={statusOptions}
          />
          <div className="!w-48">
            <SearchInput
              placeholder="箱号"
              onSearch={(v) => {
                setKeyword(v);
                setPage(1);
                loadShipments(1);
              }}
            />
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 px-3 py-2 text-xs text-yellow-800 rounded">
        <b>📌 说明：</b>
        运踪以"项目+箱号"为维度，每次发运记录一段运踪。同一集装箱多次复用时，按发运顺序记录多段。
      </div>

      <div className="bg-white rounded shadow-sm overflow-hidden">
        <Table
          columns={columns}
          dataSource={shipments}
          loading={loading}
          rowKey="id"
          size="small"
          pagination={
            total > 20
              ? {
                  current: page,
                  total,
                  pageSize: 20,
                  showTotal: (t) => `共 ${t} 条`,
                  onChange: (p) => {
                    setPage(p);
                    loadShipments(p);
                  },
                }
              : false
          }
          scroll={{ x: 1900 }}
        />
      </div>

      {editId !== undefined && (
        <ShipmentModal
          id={editId ?? null}
          containers={containers}
          shipments={shipments}
          onSave={handleSave}
          onClose={() => setEditId(undefined)}
        />
      )}
      {viewId && (
        <ContainerDetailModal
          id={viewId}
          onClose={() => setViewId(null)}
          onEdit={() => setViewId(null)}
        />
      )}
    </div>
  );
};
