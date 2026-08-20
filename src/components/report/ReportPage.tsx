import { useEffect, useMemo, useState } from 'react';
import Table from "@/components/ResizeTable";
import { useRouter } from 'next/router';
import { getContainerList } from '@/restApi/container';
import { getProjectList } from "@/restApi/project";
import type { Container } from '@/types';

const COND_LABEL: Record<string, string> = {
  new: '新箱',
  sub_new: '次新箱',
  cargo_worthy: '适货箱',
};

const getCurrentMonthPrefix = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

export const ReportPage = () => {
  const router = useRouter();
  const [containers, setContainers] = useState<Container[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getContainerList({ pageNo: 1, pageSize: 1000 })
      .then((r) => {
        setContainers(r.entity?.data ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    getProjectList(1, 1000).then((r: any) => {
      setProjects(r?.entity?.data ?? []);
    });
  }, []);

  const currentMonth = getCurrentMonthPrefix();

  // 本月提箱数：liftingTime
  const monthLift = useMemo(
    () => containers.filter((c) => c.liftingTime?.startsWith(currentMonth)).length,
    [containers, currentMonth],
  );

  // 本月发运数：sendTime
  const monthSend = useMemo(
    () => containers.filter((c) => c.sendTime?.startsWith(currentMonth)).length,
    [containers, currentMonth],
  );

  // 本月卖出数：status === 'released'
  const monthSold = useMemo(
    () => containers.filter((c) => c.status === 'released').length,
    [containers],
  );

  // 本月回程数：status === 'in_transit'（去程/回程都在途）
  const monthReturn = useMemo(
    () => containers.filter((c) => c.status === 'in_transit').length,
    [containers],
  );

  // 本月还箱数：status === 'returned'
  const monthReturnBox = useMemo(
    () => containers.filter((c) => c.status === 'returned').length,
    [containers],
  );

  // 按项目维度统计
  const projectStats = useMemo(() => {
    const map: Record<string, any> = {};
    containers.forEach((c) => {
      if (!c.projectId) return;
      if (!map[c.projectId]) {
        const proj = projects.find((x: any) => x.id === c.projectId);
        map[c.projectId] = {
          projectId: c.projectId,
          projectName: proj?.name || c.projectName || '-',
          projectNo: proj?.num || '-',
          total: 0,
          inTransit: 0,
          landed: 0,
          returned: 0,
          sold: 0,
        };
      }
      map[c.projectId].total++;
      if (c.status === 'in_transit') map[c.projectId].inTransit++;
      if (c.status === 'dropped' || c.status === 'storage') map[c.projectId].landed++;
      if (c.status === 'returned') map[c.projectId].returned++;
      if (c.status === 'released') map[c.projectId].sold++;
    });
    return Object.values(map);
  }, [containers, projects]);

  // 按箱况维度统计
  const condStats = useMemo(() => {
    const total = containers.length || 1;
    const groups: Record<string, number> = { new: 0, sub_new: 0, cargo_worthy: 0 };
    containers.forEach((c) => {
      if (groups[c.conditionType] !== undefined) groups[c.conditionType]++;
    });

    const colorMap: Record<string, string> = {
      new: 'text-green-600',
      sub_new: 'text-yellow-600',
      cargo_worthy: 'text-blue-600',
    };
    const borderMap: Record<string, string> = {
      new: 'border-green-400',
      sub_new: 'border-yellow-400',
      cargo_worthy: 'border-blue-400',
    };
    const labelMap: Record<string, string> = {
      new: '新箱',
      sub_new: '次新箱',
      cargo_worthy: '适货箱',
    };

    return (Object.keys(groups) as Array<keyof typeof groups>).map((key) => ({
      condKey: key,
      cond: labelMap[key] ?? key,
      count: groups[key],
      pct: ((groups[key] / total) * 100).toFixed(1),
      color: colorMap[key] ?? 'text-gray-600',
      border: borderMap[key] ?? 'border-gray-300',
    }));
  }, [containers]);

  if (loading) return null;

  return (
    <div className="space-y-3">
      {/* 统计卡片 */}
      <div className="grid grid-cols-6 gap-2.5">
        {[
          {
            cls: 'border-l-blue-500',
            val: monthLift,
            label: '本月提箱数',
            sub: '本月累计',
            color: 'text-blue-500',
            to: '/containers',
          },
          {
            cls: 'border-l-yellow-500',
            val: monthSend,
            label: '本月发运数',
            sub: '本月累计',
            color: 'text-yellow-500',
            to: '/containers',
          },
          {
            cls: 'border-l-green-500',
            val: monthSold,
            label: '本月卖出数',
            sub: '已卖出',
            color: 'text-green-500',
            to: '/containers?status=released',
          },
          {
            cls: 'border-l-teal-500',
            val: monthReturn,
            label: '本月回程数',
            sub: '在途状态',
            color: 'text-teal-500',
            to: '/containers?status=in_transit',
          },
          {
            cls: 'border-l-purple-500',
            val: monthReturnBox,
            label: '本月还箱数',
            sub: '长租箱归还',
            color: 'text-purple-500',
            to: '/containers?status=returned',
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
            onClick: () => router.push(`/containers?projectId=${record.projectId}`),
            className: 'cursor-pointer',
          })}
          columns={[
            {
              title: '项目编号',
              dataIndex: 'projectNo',
              width: 140,
              ellipsis: true,
              render: (v: string) => v || '-',
            },
            {
              title: '项目名称',
              dataIndex: 'projectName',
              width: 160,
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
              render: () => (
                <button className="text-[#198348] hover:underline text-xs">👁</button>
              ),
            },
          ]}
          dataSource={projectStats}
          rowKey="projectName"
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
              key={s.condKey}
              className="p-4 border rounded text-center bg-gray-50 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all"
              onClick={() => router.push(`/containers?conditionType=${s.condKey}`)}
            >
              <div
                className={`text-xs font-medium mb-2 inline-block px-2 py-0.5 rounded text-[11px] ${
                  s.condKey === 'new'
                    ? 'bg-green-100 text-green-700'
                    : s.condKey === 'sub_new'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-blue-100 text-blue-700'
                }`}
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
};
