import React, { useState, useEffect } from "react";
import { Button, Space, Input, Select, message, Modal } from "antd";
import ResizeTable from "@/components/ResizeTable";
import YardModal from "./YardModal";
import YardDetailModal from "./YardDetailModal";
import { getYardList, deleteYard } from "@/restApi/yard";

const YardList: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [regionFilter, setRegionFilter] = useState("");
  const [keyword, setKeyword] = useState("");
  const [editId, setEditId] = useState<string | null | undefined>(undefined);
  const [viewId, setViewId] = useState<string | null>(null);

  const load = (p = page) => {
    setLoading(true);
    getYardList({ pageNo: p, pageSize })
      .then((r: any) => {
        setData(r.entity?.data ?? []);
        setTotal(r.entity?.total ?? 0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(page);
  }, [page]);

  const filteredData = data.filter((y: any) => {
    if (regionFilter && y.region !== regionFilter) return false;
    if (keyword) {
      const kw = keyword.toLowerCase();
      if (
        !(y.name ?? "").toLowerCase().includes(kw) &&
        !(y.city ?? "").toLowerCase().includes(kw) &&
        !(y.supplierName ?? "").toLowerCase().includes(kw) &&
        !(y.contactsName ?? "").toLowerCase().includes(kw)
      )
        return false;
    }
    return true;
  });

  const handleDelete = (r: any) => {
    Modal.confirm({
      title: "确认删除",
      content: `确定删除堆场「${r.name}」吗？`,
      okText: "删除",
      okButtonProps: { className: "!bg-red-500 !border-red-500" },
      cancelText: "取消",
      onOk: async () => {
        await deleteYard(r.id);
        message.warning("堆场已删除");
        load();
      },
    });
  };

  const columns: any[] = [
    {
      title: "堆场名称",
      dataIndex: "yardName",
      render: (v: string, r: any) => (
        <a className="text-[#198348]" onClick={() => setViewId(r.id)}>
          {v || "-"}
        </a>
      ),
    },
    {
      title: "区域",
      dataIndex: "region",
      render: (v: string) => {
        if (!v) return "-";
        const isDomestic = v === "国内";
        return (
          <span
            className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
              isDomestic
                ? "bg-gray-100 text-gray-600"
                : "bg-orange-100 text-orange-600"
            }`}
          >
            {v}
          </span>
        );
      },
    },
    { title: "所在城市", dataIndex: "city" },
    {
      title: "关联供应商(付款)",
      dataIndex: "supplierName",
      render: (v: string) => v || <span className="text-gray-400">未关联</span>,
    },
    { title: "堆存费率", dataIndex: "storageRate" },
    { title: "吊装费率", dataIndex: "liftRate" },
    {
      title: "当前堆存",
      dataIndex: "boxCount",
      align: "center" as const,
      render: (v: number) =>
        v ? (
          <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
            {v}
          </span>
        ) : (
          "0"
        ),
    },
    { title: "对接人", dataIndex: "contactName" },
    { title: "电话", dataIndex: "boxMgrPhone" },
    { title: "作业时间", dataIndex: "workingTime" },
    {
      title: "操作",
      fixed: "right" as const,
      render: (_: any, r: any) => (
        <Space size={4}>
          <Button
            type="text"
            size="small"
            className="!px-1"
            onClick={() => setViewId(r.id)}
          >
            👁
          </Button>
          <Button
            type="text"
            size="small"
            className="!px-1"
            onClick={() => setEditId(r.id)}
          >
            ✎
          </Button>
          <Button
            type="text"
            size="small"
            className="!px-1"
            onClick={() => handleDelete(r)}
          >
            🗑
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 space-y-3">
      <div className="grid grid-cols-4 gap-2.5">
        <div className="bg-white rounded-md p-3 shadow-sm border-l-4 border-l-gray-400">
          <div className="text-xs text-gray-500 mb-1">国内堆场</div>
          <div className="text-2xl font-bold text-gray-700">
            {data.filter((y: any) => y.region === "国内").length}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">CN Yard</div>
        </div>
        <div className="bg-white rounded-md p-3 shadow-sm border-l-4 border-l-orange-400">
          <div className="text-xs text-gray-500 mb-1">国外堆场</div>
          <div className="text-2xl font-bold text-orange-600">
            {data.filter((y: any) => y.region === "国外").length}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">OVS Yard</div>
        </div>
        <div className="bg-white rounded-md p-3 shadow-sm border-l-4 border-l-[#198348]">
          <div className="text-xs text-gray-500 mb-1">堆场总数</div>
          <div className="text-2xl font-bold text-[#198348]">{data.length}</div>
          <div className="text-xs text-gray-400 mt-0.5">Total Yard</div>
        </div>
        <div className="bg-white rounded-md p-3 shadow-sm border-l-4 border-l-blue-400">
          <div className="text-xs text-gray-500 mb-1">当前堆存</div>
          <div className="text-2xl font-bold text-blue-600">
            {data.reduce((s: number, y: any) => s + (y.boxCount ?? 0), 0)}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">Boxes in yard</div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Button type="primary" size="small" onClick={() => setEditId(null)}>
          + 新增堆场
        </Button>
        <Button size="small" onClick={() => message.info("导出功能开发中")}>
          导出
        </Button>
        <div className="ml-auto flex items-center gap-2">
          <Select
            size="small"
            allowClear
            placeholder="区域"
            style={{ width: 100 }}
            value={regionFilter || undefined}
            onChange={(v) => setRegionFilter(v ?? "")}
            options={[
              { label: "国内", value: "国内" },
              { label: "国外", value: "国外" },
            ]}
          />
          <Input
            size="small"
            placeholder="堆场名称"
            style={{ width: 200 }}
            allowClear
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-amber-50 border-l-4 border-amber-400 rounded p-3 text-xs text-amber-800">
        <b className="text-amber-900">堆场管理说明：</b>
        堆场为集装箱存放/归还的物理场所，每个堆场
        <strong>关联系统内的供应商</strong>
        （付款对象），后续堆存费、吊装费、还箱费等按此供应商走付款流程。
      </div>

      <div className="bg-white rounded shadow-sm overflow-hidden">
        <ResizeTable
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          rowKey="id"
          size="small"
          scroll={{ x: 1300, y: 500 }}
          pagination={{
            current: page,
            pageSize,
            total,
            onChange: (p, ps) => {
              setPage(p);
              if (ps) setPageSize(ps);
            },
            showSizeChanger: true,
            showTotal: (t) => `共 ${t} 条`,
            pageSizeOptions: ["20", "50", "100"],
          }}
        />
      </div>

      {editId !== undefined && (
        <YardModal
          id={editId}
          onSave={() => {
            setEditId(undefined as any);
            load();
          }}
          onClose={() => setEditId(undefined as any)}
        />
      )}

      {viewId && (
        <YardDetailModal
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

export default YardList;
