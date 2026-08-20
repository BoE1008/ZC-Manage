import { useState, useEffect } from 'react';
import Table from "@/components/ResizeTable";
import { Button, Select, Input, Space, Modal, message } from 'antd';
import { ContainerDetailModal } from '@/components/containers/ContainerDetailModal';
import type { ColumnsType } from 'antd/es/table';
import { Container, ContainerTracking, ContainerStatus } from '@/types';
import { StatusBadge } from '@/components/ui/Badge';
import { ShipmentModal } from './ShipmentModal';
import { getTrackingList, deleteTracking } from '@/restApi/tracking';
import { getContainerList } from '@/restApi/container';
import { getProjectList } from "@/restApi/project";

export const ShipmentList = () => {
  const [shipments, setShipments] = useState<ContainerTracking[]>([]);
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [editId, setEditId] = useState<string | null | undefined>(undefined);
  const [viewId, setViewId] = useState<string | null>(null);
  const [projects, setProjects] = useState<any[]>([]);

  const loadShipments = (pageNo = page) => {
    setLoading(true);
    getTrackingList({
      pageNo,
      pageSize: 20,
      status: statusFilter || undefined,
      containerNo: keyword || undefined,
      returnOrderNo: keyword || undefined,
    })
      .then(r => {
        setShipments(r.entity?.data ?? []);
        setTotal(r.entity?.total ?? 0);
      })
      .finally(() => setLoading(false));
  };

  const loadContainers = () => {
    getContainerList({ pageNo: 1, pageSize: 500 })
      .then(r => setContainers(r.entity?.data ?? []));
  };

  useEffect(() => {
    loadShipments(1);
    loadContainers();
  }, []);

  useEffect(() => {
    getProjectList(1, 1000).then((r: any) => setProjects(r?.entity?.data ?? []));
  }, []);

  const handleViewBox = (containerNo: string) => {
    const c = containers.find(x => x.containerNo === containerNo);
    if (c) setViewId(c.id);
  };

  const columns: ColumnsType<ContainerTracking> = [
    {
      title: '箱号',
      dataIndex: 'containerNo',
      width: 140,
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
      title: '项目名称',
      dataIndex: 'projectName',
      width: 130,
      ellipsis: true,
      render: (v, r) => projects.find(x => x.id === r.projectId)?.name || v,
    },
    {
      title: '项目ID',
      dataIndex: 'projectId',
      width: 130,
      ellipsis: true,
      render: (v) => projects.find(x => x.id === v)?.num || v,
    },
    { title: '发运站', dataIndex: 'departureStation', width: 100 },
    { title: '目的站', dataIndex: 'arrivalStation', width: 100 },
    {
      title: '船名/班列',
      dataIndex: 'shipName',
      width: 100,
      ellipsis: true,
      render: v => v || '-',
    },
    {
      title: '发运时间',
      dataIndex: 'sendTime',
      width: 100,
      render: (v) => v || '-',
    },
    {
      title: '预计到达',
      dataIndex: 'eta',
      width: 100,
      render: (v) => v || '-',
    },
    {
      title: '实际到达',
      dataIndex: 'ata',
      width: 100,
      render: (v) => v || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (v) => <StatusBadge status={v as ContainerStatus} />,
    },
    {
      title: '状态备注',
      dataIndex: 'statusRemark',
      width: 120,
      ellipsis: true,
      render: v => v || '-',
    },
    {
      title: '落箱时间',
      dataIndex: 'dropTime',
      width: 100,
      render: v => v || '-',
    },
    {
      title: '还箱时间',
      dataIndex: 'returnTime',
      width: 100,
      render: (v) => v || '-',
    },
    {
      title: '还箱令',
      dataIndex: 'returnOrderNo',
      width: 120,
      ellipsis: true,
      render: v => v || '-',
    },
    {
      title: '操作',
      width: 80,
      align: 'center',
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
      okText: '删除',
      okButtonProps: { className: '!bg-[#198348] !border-[#198348]' },
      cancelText: '取消',
      title: '确认删除',
      content: '确定删除此运踪记录吗？',
      onOk: async () => {
        await deleteTracking(id);
        message.warning('运踪已删除');
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
      <div className="flex items-center gap-2 flex-wrap">
        <Button type="primary" onClick={() => setEditId(null)}>
          + 新增运踪
        </Button>
        <Button onClick={() => message.success('运踪数据已导出')}>📤 导出</Button>
        <div className="ml-auto flex items-center gap-2">
          <Select
            placeholder="全部状态"
            allowClear
            value={statusFilter || undefined}
            onChange={(v) => { setStatusFilter(v || ''); setPage(1); loadShipments(1); }}
            className="w-32"
            size="small"
            options={[
              { label: '去程在途', value: 'in_transit' },
              { label: '落箱', value: 'dropped' },
              { label: '堆存中', value: 'storage' },
              { label: '已还箱', value: 'returned' },
            ]}
          />
          <Input.Search
            placeholder="箱号 / 还箱令（回车搜索）"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onSearch={(v) => { setKeyword(v); setPage(1); loadShipments(1); }}
            className="!w-48"
            size="small"
            allowClear
          />
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
                  onChange: (p) => { setPage(p); loadShipments(p); },
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
