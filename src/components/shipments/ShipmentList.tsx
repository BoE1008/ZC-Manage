import { useState, useMemo } from 'react';
import { Table, Button, Select, Input, Space, Modal, message } from 'antd';
import { ContainerDetailModal } from '@/components/containers/ContainerDetailModal';
import type { ColumnsType } from 'antd/es/table';
import { Shipment, ContainerStatus } from '@/types';
import { useCallback } from 'react';
import { StatusBadge } from '@/components/ui/Badge';
import { ShipmentModal } from './ShipmentModal';
import { useStore } from '@/store';

export const ShipmentList = () => {
  const { shipments, setShipments, containers, setContainers } = useStore();
  const [statusFilter, setStatusFilter] = useState('');
  const [keyword, setKeyword] = useState('');
  const [editId, setEditId] = useState<number | null | undefined>(undefined);
  const [viewBoxNo, setViewBoxNo] = useState<string | null>(null);
  const viewContainerId = viewBoxNo ? containers.find((c) => c.no === viewBoxNo)?.id : null;

  const handleViewBox = useCallback((boxNo: string) => {
    setViewBoxNo(boxNo);
  }, []);

  const handleCloseView = useCallback(() => {
    setViewBoxNo(null);
  }, []);

  const filtered = useMemo(
    () =>
      shipments.filter((s) => {
        if (statusFilter && s.status !== statusFilter) return false;
        if (keyword) {
          const k = keyword.toLowerCase();
          if (
            !s.boxNo.toLowerCase().includes(k) &&
            !s.project.toLowerCase().includes(k) &&
            !s.pickupOrder.toLowerCase().includes(k)
          )
            return false;
        }
        return true;
      }),
    [shipments, statusFilter, keyword]
  );

  const columns: ColumnsType<Shipment> = [
    { title: '序号', dataIndex: 'no', width: 60, align: 'center' },
    {
      title: '箱号',
      dataIndex: 'boxNo',
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
    { title: '项目名称', dataIndex: 'project', width: 120, ellipsis: true },
    { title: '项目编号', dataIndex: 'projectNo', width: 130, ellipsis: true },
    { title: '发运站', dataIndex: 'from', width: 80 },
    { title: '目的站', dataIndex: 'to', width: 80 },
    { title: '口岸', dataIndex: 'port', width: 80 },
    { title: '提箱时间', dataIndex: 'pickupDate', width: 110 },
    { title: '提箱令', dataIndex: 'pickupOrder', width: 100, ellipsis: true },
    {
      title: '发运时间',
      dataIndex: 'atd',
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
      width: 100,
      render: (v) => <StatusBadge status={v as ContainerStatus} />,
    },
    { title: '状态备注', dataIndex: 'remark', width: 120, ellipsis: true },
    {
      title: '还箱时间',
      dataIndex: 'returnDate',
      width: 100,
      render: (v) => v || '-',
    },
    {
      title: '还箱令',
      dataIndex: 'returnOrder',
      width: 120,
      render: (v) => v || '-',
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

  const handleDelete = (id: number) => {
    Modal.confirm({
      okText: '删除',
      okButtonProps: { className: '!bg-[#198348] !border-[#198348]' },
      cancelText: '取消',
      title: '确认删除',
      content: '确定删除此运踪记录吗？',
      onOk() {
        setShipments((prev) => prev.filter((s) => s.id !== id));
        message.warning('运踪已删除');
      },
    });
  };

  const handleSave = (id: number | null, data: Partial<Shipment>) => {
    if (id) {
      setShipments((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
      message.success('运踪已更新');
    } else {
      const newId = Math.max(0, ...shipments.map((s) => s.id)) + 1;
      const newNo = Math.max(0, ...shipments.map((s) => s.no)) + 1;
      setShipments((prev) => [{ ...data, id: newId, no: newNo } as Shipment, ...prev]);
      // 同步更新集装箱状态
      if (data.boxNo && data.status) {
        setContainers((prev) =>
          prev.map((c) =>
            c.no === data.boxNo
              ? {
                  ...c,
                  status: data.status as ContainerStatus,
                  remark: data.remark || c.remark,
                }
              : c
          )
        );
      }
      message.success('运踪已添加，集装箱状态已同步');
    }
    setEditId(undefined);
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
            onChange={(v) => setStatusFilter(v || '')}
            className="w-32"
            size="small"
            options={['去程在途', '国外堆存', '回程在途', '已还箱'].map((s) => ({
              label: s,
              value: s,
            }))}
          />
          <Input
            placeholder="项目 / 箱号 / 提箱令"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="!w-44"
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
          dataSource={filtered}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 20, showTotal: (t) => `共 ${t} 条` }}
          scroll={{ x: 1800 }}
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
      {viewBoxNo && viewContainerId && (
        <ContainerDetailModal
          id={viewContainerId}
          containers={containers}
          onClose={handleCloseView}
          onEdit={handleCloseView}
        />
      )}
    </div>
  );
}
