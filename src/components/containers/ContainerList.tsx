import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { Table, Button, Input, Select, Space, Modal, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Container, ContainerStatus } from "@/types";
import { StatusBadge, UsageTag, CondTag } from "@/components/ui/Badge";
import { ContainerModal } from "./ContainerModal";
import { ContainerDetailModal } from "./ContainerDetailModal";
import {
  dictTypes,
  dictConds,
  suppliers,
  yards,
  buyers,
} from "@/data/mockData";
import { getContainerList } from "@/restApi/container";

export const ContainerList = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [containers, setContainers] = useState<Container[]>([]);
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("");
  const [usageFilter, setUsageFilter] = useState("");
  const [condFilter, setCondFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [keyword, setKeyword] = useState("");
  const [editId, setEditId] = useState<number | null | undefined>(undefined);
  const [viewId, setViewId] = useState<number | null>(null);

  // 从 URL query 同步筛选（支持从 dashboard/report 卡片跳转带入筛选；也处理浏览器前进/后退）
  useEffect(() => {
    const q = router.query;
    if (q.status) setStatusFilter(String(q.status));
    if (q.usage) setUsageFilter(String(q.usage));
    if (q.cond) setCondFilter(String(q.cond));
    if (q.project) setProjectFilter(String(q.project));
    if (q.q) setKeyword(String(q.q));
  }, [router.query]);

  useEffect(() => {
    (async () => {
      const res = await getContainerList(page, pageSize);
      setContainers(res.entity.data);
    })();
  }, [page, pageSize]);

  const filtered = useMemo(
    () =>
      containers.filter((c) => {
        if (statusFilter && c.status !== statusFilter) return false;
        if (usageFilter && c.usage !== usageFilter) return false;
        if (condFilter && c.cond !== condFilter) return false;
        if (projectFilter && c.project !== projectFilter) return false;
        if (keyword) {
          const k = keyword.toLowerCase();
          if (
            !c.no.toLowerCase().includes(k) &&
            !c.project.toLowerCase().includes(k) &&
            !c.pickupOrder.toLowerCase().includes(k)
          )
            return false;
        }
        return true;
      }),
    [containers, statusFilter, usageFilter, condFilter, keyword],
  );

  const columns: ColumnsType<Container> = [
    {
      title: "箱号",
      dataIndex: "no",
      width: 140,
      render: (v, r) => (
        <a
          className="text-[#198348] hover:underline cursor-pointer"
          onClick={() => setViewId(r.id)}
        >
          {v}
        </a>
      ),
    },
    { title: "箱型", dataIndex: "type", width: 70 },
    {
      title: "使用情况",
      dataIndex: "usage",
      width: 80,
      render: (v) => <UsageTag usage={v} />,
    },
    {
      title: "箱况",
      dataIndex: "cond",
      width: 80,
      render: (v) => <CondTag cond={v as any} />,
    },
    { title: "卖方/出租方", dataIndex: "supplier", width: 160, ellipsis: true },
    { title: "成本(USD)", dataIndex: "cost", width: 90, align: "center" },
    { title: "提箱堆场", dataIndex: "PickupYard", width: 120, ellipsis: true },
    { title: "提箱时间", dataIndex: "pickupDate", width: 110 },
    { title: "提箱令", dataIndex: "pickupOrder", width: 100, ellipsis: true },
    { title: "当前项目", dataIndex: "project", width: 120, ellipsis: true },
    {
      title: "当前状态",
      dataIndex: "status",
      width: 100,
      render: (v) => <StatusBadge status={v as ContainerStatus} />,
    },
    { title: "状态备注", dataIndex: "remark", width: 150, ellipsis: true },
    { title: "买方", dataIndex: "buyer", width: 100 },
    {
      title: "操作",
      width: 90,
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

  const handleDelete = (id: number) => {
    const c = containers.find((x) => x.id === id);
    Modal.confirm({
      okText: "删除",
      okButtonProps: { className: "!bg-[#198348] !border-[#198348]" },
      cancelText: "取消",
      title: "确认删除",
      content: `确定删除集装箱 ${c?.no} 吗？`,
      onOk() {
        setContainers((prev) => prev.filter((x) => x.id !== id));
        message.warning(`集装箱 ${c?.no} 已删除`);
      },
    });
  };

  const handleSave = (id: number | null, data: Partial<Container>) => {
    if (id) {
      setContainers((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...data } : c)),
      );
      message.success(`集装箱 ${data.no} 已更新`);
    } else {
      const newId = Math.max(0, ...containers.map((c) => c.id)) + 1;
      setContainers((prev) => [{ ...data, id: newId } as Container, ...prev]);
      message.success(`集装箱 ${data.no} 已添加`);
    }
    setEditId(undefined);
  };

  return (
    <div className="space-y-3">
      {/* 工具栏 */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button type="primary" onClick={() => setEditId(null)}>
          + 新增集装箱
        </Button>
        {/* <Button onClick={() => message.success("导入模板已下载")}>
          📥 批量导入
        </Button>
        <Button
          onClick={() =>
            message.success(`集装箱数据已导出（${containers?.length} 条）`)
          }
        >
          📤 导出
        </Button> */}
        <div className="ml-auto flex items-center gap-2">
          <Select
            placeholder="全部状态"
            allowClear
            value={statusFilter || undefined}
            onChange={(v) => setStatusFilter(v || "")}
            className="w-32"
            size="small"
            options={[
              "国内堆存",
              "去程在途",
              "国外堆存",
              "卖出",
              "回程在途",
              "已还箱",
            ].map((s) => ({ label: s, value: s }))}
          />
          <Select
            placeholder="全部使用情况"
            allowClear
            value={usageFilter || undefined}
            onChange={(v) => setUsageFilter(v || "")}
            className="w-32"
            size="small"
            options={[
              { label: "买箱", value: "买箱" },
              { label: "租箱", value: "租箱" },
            ]}
          />
          <Select
            placeholder="全部箱况"
            allowClear
            value={condFilter || undefined}
            onChange={(v) => setCondFilter(v || "")}
            className="w-32"
            size="small"
            options={dictConds.map((d) => ({ label: d.code, value: d.code }))}
          />
          <Input
            placeholder="箱号 / 项目 / 提箱令"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="!w-44"
            size="small"
            allowClear
          />
        </div>
      </div>

      {/* 表格 */}
      <div className="bg-white rounded shadow-sm overflow-hidden">
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          size="small"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            pageSizeOptions: ["20", "50"],
            showTotal: (t) => `共 ${t} 条`,
          }}
          scroll={{ x: 1600 }}
        />
      </div>

      {/* 新增/编辑弹窗 */}
      {editId !== undefined && (
        <ContainerModal
          id={editId ?? null}
          containers={containers}
          dictTypes={dictTypes}
          dictConds={dictConds}
          suppliers={suppliers}
          yards={yards}
          buyers={buyers}
          onSave={handleSave}
          onClose={() => setEditId(undefined)}
        />
      )}

      {/* 详情弹窗 */}
      {viewId !== null && (
        <ContainerDetailModal
          id={viewId}
          containers={containers}
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
