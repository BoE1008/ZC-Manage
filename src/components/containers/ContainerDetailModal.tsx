import { useState } from 'react';
import { Modal, Tabs, Button, Space } from 'antd';
import { Container, Shipment, Release, ContainerStatus } from '@/types';
import { StatusBadge, UsageTag, CondTag, ReleaseTypeBadge } from '@/components/ui/Badge';

interface Props {
  id: number;
  containers: Container[];
  onClose: () => void;
  onEdit: () => void;
}

export const ContainerDetailModal = ({ id, containers, onClose, onEdit }: Props) => {
  const c = containers.find((x) => x.id === id);
  const [tab, setTab] = useState('info');
  if (!c) return null;

  const shipments = (c as any)._shipments || [];
  const releases = (c as any)._releases || [];

  const tabItems = [
    { key: 'info', label: '基本信息' },
    { key: 'timeline', label: '生命周期轨迹' },
    { key: 'shipments', label: `运踪记录 (${shipments.length})` },
    { key: 'releases', label: `放箱记录 (${releases.length})` },
  ];

  return (
    <Modal
      title={`集装箱详情 - ${c.no}`}
      open
      onCancel={onClose}
      width={900}
      destroyOnClose
      footer={
        <Space>
          <Button onClick={onClose}>关闭</Button>
          <Button type="primary" onClick={onEdit}>
            编辑
          </Button>
        </Space>
      }
    >
      <Tabs activeKey={tab} onChange={setTab} items={tabItems} className="mt-2" />

      {tab === 'info' && (
        <div className="grid grid-cols-2 gap-y-3 gap-x-5 text-sm">
          <div className="col-span-2 text-xs font-bold text-[#198348] pb-1 border-b border-dashed border-gray-200 -mt-2">
            基础信息
          </div>
          <div>
            <span className="text-xs text-gray-400 block">箱号</span>
            <span className="font-medium">{c.no}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block">箱型</span>
            <span className="font-medium">{c.type}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block">使用情况</span>
            <UsageTag usage={c.usage} />
          </div>
          <div>
            <span className="text-xs text-gray-400 block">箱况</span>
            <CondTag cond={c.cond} />
          </div>
          <div>
            <span className="text-xs text-gray-400 block">卖方/出租方</span>
            <span className="font-medium">{c.supplier}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block">成本 (USD)</span>
            <span className="font-medium">{c.cost}</span>
          </div>
          <div className="col-span-2 text-xs font-bold text-[#198348] py-1 border-b border-dashed border-gray-200">
            提箱信息
          </div>
          <div>
            <span className="text-xs text-gray-400 block">提箱时间</span>
            <span className="font-medium">{c.pickupDate}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block">提箱堆场</span>
            <span className="font-medium">{c.PickupYard}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block">提箱令</span>
            <span className="font-medium">{c.pickupOrder}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block">当前项目</span>
            <span className="font-medium">{c.project}</span>
          </div>
          <div className="col-span-2 text-xs font-bold text-[#198348] py-1 border-b border-dashed border-gray-200">
            当前状态
          </div>
          <div>
            <span className="text-xs text-gray-400 block">状态</span>
            <StatusBadge status={c.status as ContainerStatus} />
          </div>
          <div>
            <span className="text-xs text-gray-400 block">状态备注</span>
            <span className="font-medium">{c.remark}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block">买方/租方</span>
            <span className="font-medium">{c.buyer}</span>
          </div>
        </div>
      )}

      {tab === 'timeline' && (
        <div className="relative pl-6 space-y-4">
          <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-200" />
          {[
            {
              date: c.pickupDate,
              icon: '📦',
              title: '提箱',
              desc: `提箱堆场：${c.PickupYard} | 提箱令：${c.pickupOrder}`,
              done: true,
            },
            {
              date: new Date().toISOString().slice(0, 10),
              icon: '📍',
              title: '当前状态',
              desc: c.remark,
              done: c.status === '卖出',
            },
          ].map((item, i) => (
            <div key={i} className="relative pl-2">
              <div
                className={`absolute -left-[22px] top-1 w-3 h-3 rounded-full border-2 border-white ${item.done ? 'bg-gray-400' : 'bg-[#198348]'}`}
              />
              <div className="text-[11px] text-gray-400">{item.date}</div>
              <div className="text-sm font-medium">
                {item.icon} {item.title}
              </div>
              <div className="text-xs text-gray-500">{item.desc}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'shipments' && (
        <div className="text-xs text-gray-400 text-center py-8">
          {shipments.length === 0 ? (
            '暂无运踪记录'
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 font-medium">
                  <th className="p-2 text-left">项目</th>
                  <th className="p-2 text-left">发运→目的</th>
                  <th className="p-2 text-left">状态</th>
                  <th className="p-2 text-left">备注</th>
                </tr>
              </thead>
              <tbody>
                {shipments.map((s: Shipment, i: number) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="p-2">{s.project}</td>
                    <td className="p-2">
                      {s.from} → {s.to}
                    </td>
                    <td className="p-2">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="p-2">{s.remark}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'releases' && (
        <div className="text-xs text-gray-400 text-center py-8">
          {releases.length === 0 ? (
            '暂无放箱记录'
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 font-medium">
                  <th className="p-2 text-left">放箱令编号</th>
                  <th className="p-2 text-left">类型</th>
                  <th className="p-2 text-left">买方</th>
                  <th className="p-2 text-left">状态</th>
                </tr>
              </thead>
              <tbody>
                {releases.map((r: Release, i: number) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="p-2">{r.no}</td>
                    <td className="p-2">
                      <ReleaseTypeBadge type={r.type} />
                    </td>
                    <td className="p-2">{r.buyer}</td>
                    <td className="p-2">
                      <StatusBadge status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </Modal>
  );
}
