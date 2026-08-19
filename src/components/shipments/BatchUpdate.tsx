import { useState, useMemo } from 'react';
import { Table, Button, Select, Input, Space, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Container, ContainerStatus, BatchUpdate } from '@/types';
import { StatusBadge, UsageTag } from '@/components/ui/Badge';
import { useStore } from '@/store';

export const BatchUpdatePage = () => {
  const { containers, setContainers, shipments, setShipments } = useStore();
  const [step, setStep] = useState(1);
  const [projectFilter, setProjectFilter] = useState('');
  const [keyword, setKeyword] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [updates, setUpdates] = useState<BatchUpdate>({});

  // 提取项目列表
  const projects = useMemo(() => {
    const list: string[] = [];
    containers.forEach((c) => {
      if (c.project && c.project !== '-' && !list.includes(c.project)) list.push(c.project);
    });
    return list;
  }, [containers]);

  // 筛选后的集装箱
  const filtered = useMemo(
    () =>
      containers.filter((c) => {
        if (projectFilter && c.project !== projectFilter) return false;
        if (keyword && !c.no.toLowerCase().includes(keyword.toLowerCase())) return false;
        return true;
      }),
    [containers, projectFilter, keyword]
  );

  const toggleSelect = (id: number, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
  };

  const toggleAll = (checked: boolean) => {
    setSelectedIds(checked ? filtered.map((c) => c.id) : []);
  };

  const columns: ColumnsType<Container> = [
    {
      title: (
        <input
          type="checkbox"
          className="w-4 h-4 accent-[#198348]"
          checked={selectedIds.length === filtered.length && filtered.length > 0}
          onChange={(e) => toggleAll(e.target.checked)}
        />
      ),
      width: 40,
      align: 'center',
      render: (_, r) => (
        <input
          type="checkbox"
          className="w-4 h-4 accent-[#198348]"
          checked={selectedIds.includes(r.id)}
          onChange={(e) => toggleSelect(r.id, e.target.checked)}
        />
      ),
    },
    { title: '箱号', dataIndex: 'no', width: 140 },
    { title: '箱型', dataIndex: 'type', width: 70 },
    {
      title: '使用情况',
      dataIndex: 'usage',
      width: 80,
      render: (v) => <UsageTag usage={v} />,
    },
    {
      title: '当前状态',
      dataIndex: 'status',
      width: 100,
      render: (v) => <StatusBadge status={v as ContainerStatus} />,
    },
    { title: '状态备注', dataIndex: 'remark', width: 150, ellipsis: true },
    { title: '提箱令', dataIndex: 'pickupOrder', width: 100, ellipsis: true },
  ];

  const stepTitles = ['选择集装箱', '填写更新内容', '预览确认'];
  const fieldNames: Record<string, string> = {
    atd: '发运时间',
    eta: '预计到达',
    ata: '实际到达',
    status: '状态',
    remark: '状态备注',
    yard: '落箱堆场',
    yardSupplier: '堆场供应商',
    returnDate: '还箱时间',
    storageCost: '堆存费',
    liftCost: '吊装费',
    returnCost: '还箱费',
    overdueIncome: '超期收入',
  };

  const selectedContainers = containers.filter((c) => selectedIds.includes(c.id));

  const previewChanges = () => {
    const keys = Object.keys(updates);
    if (keys.length === 0) {
      message.error('请至少填写一个需要更新的字段');
      return;
    }
    setStep(3);
  };

  const applyBatch = () => {
    selectedIds.forEach((id) => {
      const c = containers.find((x) => x.id === id);
      if (!c) return;
      if (updates.status) {
        const newStatus = updates.status as ContainerStatus;
        setContainers((prev) =>
          prev.map((x) =>
            x.id === id ? { ...x, status: newStatus, remark: updates.remark || x.remark } : x
          )
        );
        const s = shipments.find((x) => x.boxNo === c.no);
        if (s)
          setShipments((prev) =>
            prev.map((x) =>
              x.boxNo === c.no ? { ...x, ...updates, status: updates.status || x.status } : x
            )
          );
      } else if (updates.remark) {
        setContainers((prev) =>
          prev.map((x) => (x.id === id ? { ...x, remark: updates.remark! } : x))
        );
      }
    });
    message.success(`已成功更新 ${selectedIds.length} 个集装箱`);
    setSelectedIds([]);
    setStep(1);
    setUpdates({});
  };

  return (
    <div className="space-y-3">
      {/* 说明 */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 px-3 py-2 text-xs text-yellow-800 rounded">
        <b>📌 批量更新说明：</b>
        按项目筛选后勾选集装箱，统一更新"发运时间/到达时间/状态/堆场"等字段，适用于同一项目下所有箱子状态统一变更（如：集体到达、集体落箱）。
      </div>

      {/* 步骤条 */}
      <div className="flex items-center gap-2 bg-white rounded p-3 shadow-sm">
        {stepTitles.map((title, i) => (
          <div key={i} className="flex items-center gap-2">
            {i > 0 && <div className={`w-8 h-0.5 ${i < step ? 'bg-[#198348]' : 'bg-gray-200'}`} />}
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${i + 1 < step ? 'bg-green-100 text-green-700' : i + 1 === step ? 'bg-[#198348] text-white' : 'bg-gray-200 text-gray-500'}`}
              >
                {i + 1 < step ? '✓' : i + 1}
              </div>
              <span
                className={`text-xs ${i + 1 === step ? 'text-[#198348] font-medium' : 'text-gray-500'}`}
              >
                {title}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Step 1: 选择集装箱 */}
      {step === 1 && (
        <div className="bg-white rounded shadow-sm p-4">
          <div className="flex items-center text-sm font-bold mb-3 text-gray-800">
            <div className="w-1 h-4 bg-[#198348] rounded mr-2 flex-shrink-0" />第 1 步：选择集装箱
          </div>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Select
              placeholder="请选择项目..."
              allowClear
              value={projectFilter || undefined}
              onChange={(v) => setProjectFilter(v || '')}
              className="w-48"
              size="small"
              options={projects.map((p) => ({ label: p, value: p }))}
            />
            <Input
              placeholder="或输入箱号"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="!w-36"
              size="small"
              allowClear
            />
            <Button size="small" onClick={() => setSelectedIds(filtered.map((c) => c.id))}>
              全选
            </Button>
            <Button size="small" onClick={() => setSelectedIds([])}>
              取消全选
            </Button>
            <span className="ml-auto text-xs text-gray-500">
              已选 <b className="text-[#198348]">{selectedIds.length}</b> 个
            </span>
          </div>
          <Table
            columns={columns}
            dataSource={filtered}
            rowKey="id"
            size="small"
            pagination={false}
            scroll={{ y: 300 }}
          />
          <div className="flex justify-end mt-3">
            <Button type="primary" disabled={selectedIds.length === 0} onClick={() => setStep(2)}>
              下一步 →
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: 填写更新内容 */}
      {step === 2 && (
        <div className="space-y-3">
          {/* 已选箱号摘要 — 带入下一步告知用户影响范围 */}
          <div className="bg-[#198348]/5 border border-[#198348]/20 rounded p-3 flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-[#198348] flex items-center justify-center text-white font-bold text-sm">
                {selectedIds.length}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-[#198348]">
                已选 {selectedIds.length} 个集装箱
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">
                {selectedContainers.map((c) => c.no).join('、')}
              </div>
            </div>
          </div>
          <div className="bg-white rounded shadow-sm p-4">
            <div className="flex items-center text-sm font-bold mb-3 text-gray-800">
              <div className="w-1 h-4 bg-[#198348] rounded mr-2 flex-shrink-0" />第 2
              步：填写批量更新字段
              <span className="ml-auto text-xs font-normal text-gray-500">
                仅填写需要更新的项，留空的不更新
              </span>
            </div>
            <div className="bg-green-50 border border-green-200 rounded p-4 mb-3">
              <div className="text-xs font-bold text-green-700 mb-3">运踪信息更新</div>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { key: 'atd', label: '发运时间 (ATD)', type: 'date' },
                  { key: 'eta', label: '预计到达 (ETA)', type: 'date' },
                  { key: 'ata', label: '实际到达', type: 'date' },
                  {
                    key: 'status',
                    label: '更新状态',
                    type: 'select',
                    opts: ['去程在途', '国外堆存', '回程在途', '国内堆存', '已还箱'],
                  },
                  { key: 'remark', label: '状态备注', type: 'text' },
                  {
                    key: 'yard',
                    label: '落箱堆场',
                    type: 'select',
                    opts: ['宁波陆联堆场', '海参崴 MYC', 'MINSK 堆场', '莫斯科堆场'],
                  },
                  { key: 'returnDate', label: '还箱时间', type: 'date' },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="text-xs text-gray-600 block mb-1">{f.label}</label>
                    {f.type === 'date' ? (
                      <Input
                        type="date"
                        size="small"
                        className="w-full"
                        onChange={(e) => setUpdates((u) => ({ ...u, [f.key]: e.target.value }))}
                      />
                    ) : f.type === 'select' ? (
                      <Select
                        size="small"
                        className="w-full"
                        allowClear
                        placeholder="不更新"
                        options={(f.opts || []).map((o) => ({
                          label: o,
                          value: o,
                        }))}
                        onChange={(v) => setUpdates((u) => ({ ...u, [f.key]: v }))}
                      />
                    ) : (
                      <Input
                        size="small"
                        className="w-full"
                        placeholder={`不更新`}
                        onChange={(e) => setUpdates((u) => ({ ...u, [f.key]: e.target.value }))}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded p-4">
              <div className="text-xs font-bold text-green-700 mb-3">费用信息更新（可选）</div>
              <div className="grid grid-cols-4 gap-3">
                {['storageCost', 'liftCost', 'returnCost', 'overdueIncome'].map((key) => (
                  <div key={key}>
                    <label className="text-xs text-gray-600 block mb-1">
                      {fieldNames[key] || key} (USD)
                    </label>
                    <Input
                      type="number"
                      size="small"
                      className="w-full"
                      placeholder="如：420"
                      onChange={(e) => setUpdates((u) => ({ ...u, [key]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-between">
            <Button onClick={() => setStep(1)}>← 上一步</Button>
            <Space>
              <Button onClick={previewChanges}>仅预览变更</Button>
              <Button
                type="primary"
                onClick={() => {
                  previewChanges();
                }}
              >
                下一步 →
              </Button>
            </Space>
          </div>
        </div>
      )}

      {/* Step 3: 预览确认 */}
      {step === 3 && (
        <div className="bg-white rounded shadow-sm p-4">
          <div className="flex items-center text-sm font-bold mb-3 text-gray-800">
            <div className="w-1 h-4 bg-[#198348] rounded mr-2 flex-shrink-0" />第 3
            步：变更预览（确认后应用）
          </div>
          <div className="mb-3 px-3 py-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
            将对 <b>{selectedIds.length}</b> 个集装箱应用以下变更：
            {Object.keys(updates).map((k) => (
              <span
                key={k}
                className="inline-block ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px]"
              >
                {fieldNames[k] || k}
              </span>
            ))}
          </div>
          <Table
            columns={[
              { title: '箱号', dataIndex: 'no', width: 140 },
              {
                title: '项目',
                dataIndex: 'project',
                width: 120,
                ellipsis: true,
              },
              {
                title: '更新字段',
                render: (_, r) =>
                  Object.keys(updates).map((k) => (
                    <span
                      key={k}
                      className="inline-block mr-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px]"
                    >
                      {fieldNames[k] || k}
                    </span>
                  )),
              },
              {
                title: '原值',
                render: (_, r) => {
                  const keys = Object.keys(updates);
                  return keys.length === 0 ? (
                    <span className="text-gray-400">-</span>
                  ) : (
                    keys.map((k) => {
                      const oldVal =
                        k === 'status' ? r.status : k === 'remark' ? r.remark || '-' : '-';
                      return k === 'status' ? (
                        <StatusBadge key={k} status={oldVal as ContainerStatus} />
                      ) : (
                        <span key={k} className="inline-block mr-1 text-xs text-gray-600">
                          {oldVal}
                        </span>
                      );
                    })
                  );
                },
              },
              { title: '→', width: 40, align: 'center' },
              {
                title: '新值',
                render: (_, r) => {
                  const keys = Object.keys(updates);
                  return keys.length === 0 ? (
                    <span className="text-gray-400">-</span>
                  ) : (
                    keys.map((k) => {
                      const newVal = updates[k as keyof BatchUpdate] as string;
                      return k === 'status' ? (
                        <StatusBadge key={k} status={newVal as ContainerStatus} />
                      ) : (
                        <span
                          key={k}
                          className="inline-block mr-1 text-xs text-[#198348] font-medium"
                        >
                          {newVal}
                        </span>
                      );
                    })
                  );
                },
              },
            ]}
            dataSource={selectedContainers}
            rowKey="id"
            size="small"
            pagination={false}
            scroll={{ x: 900, y: 300 }}
          />
          <div className="flex justify-between items-center mt-4">
            <div className="text-xs text-yellow-600">⚠ 变更不可撤销，建议先导出当前数据备份</div>
            <Space>
              <Button onClick={() => setStep(2)}>← 上一步</Button>
              <Button type="primary" onClick={applyBatch}>
                ✓ 确认应用
              </Button>
            </Space>
          </div>
        </div>
      )}
    </div>
  );
}
