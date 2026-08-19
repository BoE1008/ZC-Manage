import { useState, useMemo } from 'react';
import { Table, Button, Select, Input, Space, Modal, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Release, ReleaseType } from '@/types';
import { ReleaseTypeBadge, StatusBadge } from '@/components/ui/Badge';
import { ReleaseModal } from './ReleaseModal';
import { ReleaseDetailModal } from './ReleaseDetailModal';
import { useStore } from '@/store';

export const ReleaseList = () => {
  const { releases, setReleases, containers, setContainers } = useStore();
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [keyword, setKeyword] = useState('');
  const [editId, setEditId] = useState<number | null | undefined>(undefined);
  const [viewId, setViewId] = useState<number | null>(null);

  const filtered = useMemo(
    () =>
      releases.filter((r) => {
        if (typeFilter && r.type !== typeFilter) return false;
        if (statusFilter && r.status !== statusFilter) return false;
        if (keyword) {
          const k = keyword.toLowerCase();
          if (!r.no.toLowerCase().includes(k) && !r.boxNo.toLowerCase().includes(k)) return false;
        }
        return true;
      }),
    [releases, typeFilter, statusFilter, keyword]
  );

  const columns: ColumnsType<Release> = [
    {
      title: '放箱令编号',
      dataIndex: 'no',
      width: 160,
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
      title: '类型',
      dataIndex: 'type',
      width: 90,
      render: (v) => <ReleaseTypeBadge type={v as ReleaseType} />,
    },
    {
      title: '箱号',
      dataIndex: 'boxNo',
      width: 140,
      render: (v) => (
        <a
          className="text-[#198348] hover:underline cursor-pointer"
          onClick={() => message.info(`查看集装箱 ${v}`)}
        >
          {v}
        </a>
      ),
    },
    { title: '买方/租方', dataIndex: 'buyer', width: 110 },
    { title: '放箱堆场', dataIndex: 'yard', width: 130, ellipsis: true },
    { title: '生成时间', dataIndex: 'genDate', width: 100 },
    {
      title: '客户提箱时间',
      dataIndex: 'pickupDate',
      width: 120,
      render: (v) => v || '-',
    },
    {
      title: '收入(USD)',
      dataIndex: 'income',
      width: 90,
      align: 'center',
      render: (v) => v || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (v) => <StatusBadge status={v} />,
    },
    {
      title: '操作',
      width: 90,
      align: 'center',
      render: (_, r) => (
        <Space size={2}>
          <Button
            type="text"
            size="small"
            className="!px-1 !py-0.5 !text-xs"
            onClick={() => setViewId(r.id)}
          >
            👁
          </Button>
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
    const r = releases.find((x) => x.id === id);
    Modal.confirm({
      okText: '删除',
      okButtonProps: { className: '!bg-[#198348] !border-[#198348]' },
      cancelText: '取消',
      title: '确认删除',
      content: `确定删除放箱令 ${r?.no} 吗？`,
      onOk() {
        setReleases((prev) => prev.filter((x) => x.id !== id));
        message.warning('放箱令已删除');
      },
    });
  };

  const handleSave = (id: number | null, data: Partial<Release>) => {
    const today = new Date().toISOString().slice(0, 10);
    if (id) {
      setReleases((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)));
      message.success('放箱令已更新');
    } else {
      const newId = Math.max(0, ...releases.map((r) => r.id)) + 1;
      const no = `ZCSC2026-08-${String(releases.length + 1).padStart(3, '0')}`;
      const newRelease: Release = {
        ...data,
        id: newId,
        no,
        genDate: today,
        status: '待提箱',
      } as Release;
      setReleases((prev) => [newRelease, ...prev]);
      // 同步更新集装箱状态
      if (data.boxNo && data.type === '卖出放箱') {
        setContainers((prev) =>
          prev.map((c) =>
            c.no === data.boxNo
              ? {
                  ...c,
                  status: '卖出',
                  buyer: data.buyer || '-',
                  remark: `已放箱 ${no}`,
                }
              : c
          )
        );
      }
      message.success(`放箱令 ${no} 已生成`);
    }
    setEditId(undefined);
  };

  const confirmPickup = (id: number) => {
    const today = new Date().toISOString().slice(0, 10);
    setReleases((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: '已提箱', pickupDate: today } : r))
    );
    message.success('已确认提箱');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <Button type="primary" onClick={() => setEditId(null)}>
          + 生成放箱令
        </Button>
        <Button onClick={() => message.success('放箱令列表已导出')}>📤 导出</Button>
        <div className="ml-auto flex items-center gap-2">
          <Select
            placeholder="全部类型"
            allowClear
            value={typeFilter || undefined}
            onChange={(v) => setTypeFilter(v || '')}
            className="w-28"
            size="small"
            options={['卖出放箱', '回程放箱', '租给客户'].map((t) => ({
              label: t,
              value: t,
            }))}
          />
          <Select
            placeholder="全部状态"
            allowClear
            value={statusFilter || undefined}
            onChange={(v) => setStatusFilter(v || '')}
            className="w-28"
            size="small"
            options={['待提箱', '已提箱'].map((s) => ({ label: s, value: s }))}
          />
          <Input
            placeholder="放箱令编号 / 箱号"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="!w-44"
            size="small"
            allowClear
          />
        </div>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 px-3 py-2 text-xs text-yellow-800 rounded">
        <b>📌 放箱令说明：</b>箱子卖出或回程时，需生成放箱令通知堆场放行。
        <b>卖出放箱</b>—通知买方提箱，业务结束；<b>回程放箱</b>
        —通知承运方提箱回国内；<b>租给客户</b>—通知租方提箱。
      </div>

      <div className="bg-white rounded shadow-sm overflow-hidden">
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 20, showTotal: (t) => `共 ${t} 条` }}
        />
      </div>

      {editId !== undefined && (
        <ReleaseModal
          id={editId ?? null}
          containers={containers}
          buyers={[]}
          releases={releases}
          onSave={handleSave}
          onClose={() => setEditId(undefined)}
        />
      )}

      {viewId !== null && (
        <ReleaseDetailModal
          id={viewId}
          releases={releases}
          onClose={() => setViewId(null)}
          onEdit={() => {
            setViewId(null);
            setEditId(viewId);
          }}
          onConfirmPickup={() => {
            confirmPickup(viewId);
            setViewId(null);
          }}
        />
      )}
    </div>
  );
}
