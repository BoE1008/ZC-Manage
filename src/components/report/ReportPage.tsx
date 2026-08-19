import { useMemo } from 'react';
import { useRouter } from 'next/router';
import { Table } from 'antd';
import { useStore } from '@/store';

export const ReportPage = () => {
  const { containers } = useStore();
  const router = useRouter();

  // 按项目维度统计
  const projectStats = useMemo(() => {
    const map: Record<string, any> = {};
    containers.forEach((c) => {
      if (!c.project || c.project === '-') return;
      if (!map[c.project]) {
        map[c.project] = {
          name: c.project,
          no: c.projectNo,
          total: 0,
          inTransit: 0,
          landed: 0,
          returned: 0,
          sold: 0,
        };
      }
      map[c.project].total++;
      if (c.status === '去程在途' || c.status === '回程在途') map[c.project].inTransit++;
      if (c.status === '国外堆存' || c.status === '国内堆存') map[c.project].landed++;
      if (c.status === '已还箱') map[c.project].returned++;
      if (c.status === '卖出') map[c.project].sold++;
    });
    return Object.values(map);
  }, [containers]);

  const condStats = useMemo(() => {
    const total = containers.length || 1;
    const groups = { 新箱: 0, 次新箱: 0, 适货箱: 0 };
    containers.forEach((c) => {
      if (groups[c.cond] !== undefined) groups[c.cond]++;
    });
    return [
      {
        cond: '新箱',
        count: groups['新箱'],
        pct: ((groups['新箱'] / total) * 100).toFixed(1),
        color: 'text-green-600',
        border: 'border-green-400',
      },
      {
        cond: '次新箱',
        count: groups['次新箱'],
        pct: ((groups['次新箱'] / total) * 100).toFixed(1),
        color: 'text-yellow-600',
        border: 'border-yellow-400',
      },
      {
        cond: '适货箱',
        count: groups['适货箱'],
        pct: ((groups['适货箱'] / total) * 100).toFixed(1),
        color: 'text-blue-600',
        border: 'border-blue-400',
      },
    ];
  }, [containers]);

  return (
    <div className="space-y-3">
      {/* 统计卡片 */}
      <div className="grid grid-cols-6 gap-2.5">
        {[
          {
            cls: 'border-l-blue-500',
            val: 68,
            label: '本月提箱数',
            sub: '较上月 +12',
            color: 'text-blue-500',
            to: '/containers',
          },
          {
            cls: 'border-l-yellow-500',
            val: 64,
            label: '本月发运数',
            sub: '较上月 +8',
            color: 'text-yellow-500',
            to: '/containers',
          },
          {
            cls: 'border-l-green-500',
            val: 42,
            label: '本月卖出数',
            sub: '较上月 +6',
            color: 'text-green-500',
            to: `/containers?status=${encodeURIComponent('卖出')}`,
          },
          {
            cls: 'border-l-teal-500',
            val: 18,
            label: '本月回程数',
            sub: '较上月 +3',
            color: 'text-teal-500',
            to: `/containers?status=${encodeURIComponent('回程在途')}`,
          },
          {
            cls: 'border-l-purple-500',
            val: 12,
            label: '本月还箱数',
            sub: '长租箱归还',
            color: 'text-purple-500',
            to: `/containers?status=${encodeURIComponent('已还箱')}`,
          },
          {
            cls: 'border-l-gray-500',
            val: containers.length,
            label: '在管总数',
            sub: '含买箱+租箱',
            color: 'text-gray-500',
            to: '/containers',
          },
        ].map((s, i) => (
          <div
            key={i}
            className={`bg-white rounded-md p-3 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all border-l-4 ${s.cls}`}
            onClick={() => router.push(s.to)}
          >
            <div className="text-xs text-gray-500 mb-1">{s.label}</div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.val}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* 按项目维度 */}
      <div className="bg-white rounded-md p-4 shadow-sm">
        <div className="flex items-center text-sm font-bold mb-3 text-gray-800">
          <div className="w-1 h-4 bg-[#198348] rounded mr-2 flex-shrink-0" />
          按项目维度统计
          <span className="ml-auto text-xs font-normal text-gray-500">点击查看项目详情</span>
        </div>
        <Table
          onRow={(record) => ({
            onClick: () => router.push(`/containers?project=${encodeURIComponent(record.name)}`),
            className: 'cursor-pointer',
          })}
          columns={[
            { title: '项目编号', dataIndex: 'no', width: 140, ellipsis: true },
            {
              title: '项目名称',
              dataIndex: 'name',
              width: 140,
              ellipsis: true,
            },
            {
              title: '集装箱数',
              dataIndex: 'total',
              width: 90,
              align: 'center',
            },
            {
              title: '发运站',
              dataIndex: 'from',
              width: 80,
              render: () => '-',
            },
            { title: '目的站', dataIndex: 'to', width: 80, render: () => '-' },
            {
              title: '在途数',
              dataIndex: 'inTransit',
              width: 80,
              align: 'center',
            },
            {
              title: '已落地',
              dataIndex: 'landed',
              width: 80,
              align: 'center',
            },
            {
              title: '已还箱',
              dataIndex: 'returned',
              width: 80,
              align: 'center',
            },
            { title: '已卖出', dataIndex: 'sold', width: 80, align: 'center' },
            {
              title: '操作',
              width: 60,
              align: 'center',
              render: () => <button className="text-[#198348] hover:underline text-xs">👁</button>,
            },
          ]}
          dataSource={projectStats}
          rowKey="name"
          size="small"
          pagination={false}
        />
      </div>

      {/* 按箱况维度 */}
      <div className="bg-white rounded-md p-4 shadow-sm">
        <div className="flex items-center text-sm font-bold mb-3 text-gray-800">
          <div className="w-1 h-4 bg-[#198348] rounded mr-2 flex-shrink-0" />
          按箱况维度统计
        </div>
        <div className="grid grid-cols-3 gap-3">
          {condStats.map((s) => (
            <div
              key={s.cond}
              className="p-4 border rounded text-center bg-gray-50 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all"
              onClick={() => router.push(`/containers?cond=${encodeURIComponent(s.cond)}`)}
            >
              <div
                className={`text-xs font-medium mb-2 ${s.cond === '新箱' ? 'bg-green-100 text-green-700' : s.cond === '次新箱' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'} inline-block px-2 py-0.5 rounded text-[11px]`}
              >
                {s.cond}
              </div>
              <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
              <div className="text-[11px] text-gray-400 mt-1">占总数 {s.pct}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
