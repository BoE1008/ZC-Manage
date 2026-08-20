import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  getContainerDashboardStats,
  getContainerList,
} from "@/restApi/container";
import { ContainerStatus } from "@/types";

/** 本地操作记录类型 */
interface Activity {
  time: string;
  text: string;
}

export const Dashboard = () => {
  const router = useRouter();
  const [stats, setStats] = useState<Record<string, number>>({});
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  // 待办数据
  const [pendingReleaseCount, setPendingReleaseCount] = useState(0);
  const [overdueStorageCount, setOverdueStorageCount] = useState(0);
  const [inTransitCount, setInTransitCount] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await getContainerDashboardStats();
        const raw = (res.entity ?? {}) as Record<string, number>;

        // 尝试从 API 字段取值；若为空则降级用容器列表
        const apiStats: Record<string, number> = {
          pending: Number(raw.pending ?? 0),
          lifting: Number(raw.lifting ?? 0),
          in_transit: Number(raw.in_transit ?? 0),
          dropped: Number(raw.dropped ?? 0),
          storage: Number(raw.storage ?? 0),
          released: Number(raw.released ?? 0),
          picked_up: Number(raw.picked_up ?? 0),
          returned: Number(raw.returned ?? 0),
        };

        const hasData = Object.values(apiStats).some((v) => v > 0);

        if (hasData) {
          setStats(apiStats);
        } else {
          // 降级：拿总数
          const totalRes = await getContainerList({ pageNo: 1, pageSize: 1 });
          const total = totalRes.entity?.total ?? 0;

          // 拉全部列表算各状态数量（最多 1000）
          const allRes = await getContainerList({ pageNo: 1, pageSize: 1000 });
          const records: { status: ContainerStatus }[] =
            allRes.entity?.data ?? [];
          const counts: Record<string, number> = {};
          records.forEach((r) => {
            counts[r.status] = (counts[r.status] ?? 0) + 1;
          });

          setStats({ ...counts, total });
        }

        // 动态待办数据
        await loadTodoData();
      } catch (e) {
        console.error("Dashboard 加载失败", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /** 加载待办数据 */
  async function loadTodoData() {
    try {
      // 待确认放箱令数量（pending 状态）
      // 待确认放箱令数量：通过 ReleaseOrder API 查询（暂无接口，暂时用 released 计数占位）
      // 注意：getContainerList 没有 status=released 直接过滤；
      // 这里用已放箱(released)状态模拟待办，后续有 ReleaseOrder API 再替换
      const releasedCount = stats["released"] ?? 0;
      setPendingReleaseCount(releasedCount);

      // 超 30 天堆存箱数量（storage 且 dropTime 超过 30 天）
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const allRes = await getContainerList({ pageNo: 1, pageSize: 1000 });
      const records: { status: ContainerStatus; dropTime?: string }[] =
        allRes.entity?.data ?? [];
      const overdue = records.filter((r) => {
        if (r.status !== "storage" || !r.dropTime) return false;
        const dropDate = new Date(r.dropTime);
        return dropDate < thirtyDaysAgo;
      });
      setOverdueStorageCount(overdue.length);

      // 在途箱数量
      const transitCount = stats["in_transit"] ?? 0;
      setInTransitCount(transitCount);
    } catch {
      // 待办数据加载失败不影响主流程
    }
  }

  const goFilter = (status: string | null) => {
    router.push(
      status
        ? `/containerList?status=${encodeURIComponent(status)}`
        : "/containerList",
    );
  };

  const statCards = [
    {
      cls: "border-l-blue-500",
      val: stats["in_transit"] ?? 0,
      label: "去程在途",
      sub: "海运/铁路中",
      color: "text-blue-500",
      filter: "in_transit",
    },
    {
      cls: "border-l-yellow-500",
      val: stats["dropped"] ?? 0,
      label: "国外堆存",
      sub: "等待处理",
      color: "text-yellow-500",
      filter: "dropped",
    },
    {
      cls: "border-l-gray-500",
      val: stats["storage"] ?? 0,
      label: "国内堆存",
      sub: "待发运",
      color: "text-gray-500",
      filter: "storage",
    },
    {
      cls: "border-l-purple-500",
      val: stats["pending"] ?? 0,
      label: "回程在途",
      sub: "回国内中",
      color: "text-purple-500",
      filter: "pending",
    },
    {
      cls: "border-l-green-500",
      val: stats["released"] ?? 0,
      label: "已卖出",
      sub: "业务结束",
      color: "text-green-500",
      filter: "released",
    },
    {
      cls: "border-l-teal-500",
      val: stats["total"] ?? 0,
      label: "集装箱总数",
      sub: "在管总量",
      color: "text-teal-500",
      filter: null,
    },
  ];

  return (
    <div className="space-y-3">
      {/* 统计卡片 */}
      <div className="grid grid-cols-6 gap-2.5">
        {statCards.map((s, i) => (
          <div
            key={i}
            className={`bg-white rounded-md p-3 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all border-l-4 ${s.cls}`}
            onClick={() => goFilter(s.filter)}
          >
            <div className="text-xs text-gray-500 mb-1">{s.label}</div>
            <div className={`text-2xl font-bold ${s.color}`}>
              {loading ? "—" : s.val}
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* 流转全景 */}
      <div className="bg-white rounded-md p-4 shadow-sm">
        <div className="flex items-center text-sm font-bold mb-3 text-gray-800">
          <div className="w-1 h-4 bg-[#198348] rounded mr-2 flex-shrink-0" />
          集装箱流转全景
          <span className="ml-auto text-xs font-normal text-gray-500">
            点击节点查看对应状态集装箱
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap mb-2">
          {[
            {
              label: "国内堆存",
              cnt: stats["storage"] ?? 0,
              color: "text-gray-500",
              filter: "storage",
            },
            {
              label: "去程在途",
              cnt: stats["in_transit"] ?? 0,
              color: "text-blue-500",
              filter: "in_transit",
            },
            {
              label: "国外堆存",
              cnt: stats["dropped"] ?? 0,
              color: "text-yellow-500",
              filter: "dropped",
            },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-gray-400">→</span>}
              <div
                className="bg-white border border-gray-200 rounded-md px-3 py-1.5 text-center cursor-pointer hover:shadow-md transition-all"
                onClick={() => goFilter(f.filter)}
              >
                <div className={`text-xs font-bold ${f.color}`}>{f.label}</div>
                <div className="text-base font-bold text-gray-900 mt-0.5">
                  {loading ? "—" : f.cnt}
                </div>
              </div>
            </div>
          ))}
          <span className="text-xs text-gray-400 ml-1">⤴ 卖出 / ⤵ 回程</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap mb-2">
          {[
            {
              label: "回程在途",
              cnt: stats["pending"] ?? 0,
              color: "text-purple-500",
              filter: "pending",
            },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-1.5">
              {i === 0 && <span className="text-gray-400">→</span>}
              <div
                className="bg-white border border-gray-200 rounded-md px-3 py-1.5 text-center cursor-pointer hover:shadow-md transition-all"
                onClick={() => goFilter(f.filter)}
              >
                <div className={`text-xs font-bold ${f.color}`}>{f.label}</div>
                <div className="text-base font-bold text-gray-900 mt-0.5">
                  {loading ? "—" : f.cnt}
                </div>
              </div>
            </div>
          ))}
          <span className="text-gray-400 text-xs">→</span>
          <div className="bg-white border border-gray-200 rounded-md px-3 py-1.5 text-center">
            <div className="text-xs font-bold text-gray-500">国内堆存</div>
            <div className="text-base font-bold text-gray-900 mt-0.5">→</div>
          </div>
          <span className="text-gray-400 text-xs">→</span>
          <div className="bg-white border border-gray-200 rounded-md px-3 py-1.5 text-center">
            <div className="text-xs font-bold text-blue-500">再次去程</div>
            <div className="text-base font-bold text-gray-900 mt-0.5">循环</div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <div
            className="bg-green-50 border border-green-400 rounded-md px-3 py-1.5 text-center cursor-pointer hover:shadow transition-all"
            onClick={() => goFilter("released")}
          >
            <div className="text-xs font-bold text-green-600">已卖出</div>
            <div className="text-base font-bold text-green-600 mt-0.5">
              {loading ? "—" : stats["released"] ?? 0}
            </div>
          </div>
          <span className="text-[11px] text-gray-400 ml-2">
            买箱发运到国外后卖出，业务结束
          </span>
        </div>
      </div>

      {/* 最近操作 + 财务概览 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2 bg-white rounded-md p-4 shadow-sm">
          <div className="flex items-center text-sm font-bold mb-3 text-gray-800">
            <div className="w-1 h-4 bg-[#198348] rounded mr-2 flex-shrink-0" />
            最近操作记录
          </div>
          <div className="space-y-2">
            {activities.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">
                暂无操作记录
              </p>
            ) : (
              activities.map((a, i) => (
                <div
                  key={i}
                  className="flex gap-3 py-1.5 border-b border-dashed border-gray-100 last:border-0"
                >
                  <span className="text-[11px] text-gray-400 min-w-[60px]">
                    {a.time}
                  </span>
                  <span
                    className="text-xs text-gray-600"
                    dangerouslySetInnerHTML={{ __html: a.text }}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-md p-4 shadow-sm">
          <div className="flex items-center text-sm font-bold mb-3 text-gray-800">
            <div className="w-1 h-4 bg-[#198348] rounded mr-2 flex-shrink-0" />
            本月财务概览
          </div>
          <div className="flex flex-col items-center justify-center py-6">
            <span className="text-xs text-gray-400">暂无数据</span>
            <span className="text-[11px] text-gray-300 mt-1">
              财务 API 接入后显示
            </span>
          </div>
        </div>
      </div>

      {/* 待办事项 */}
      <div className="bg-white rounded-md p-4 shadow-sm">
        <div className="flex items-center text-sm font-bold mb-3 text-gray-800">
          <div className="w-1 h-4 bg-[#198348] rounded mr-2 flex-shrink-0" />
          待办事项
          <span className="ml-auto text-xs font-normal text-gray-500">
            需要您关注的事项
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          <div
            className="p-3 border border-red-200 rounded bg-red-50 cursor-pointer hover:shadow transition-all"
            onClick={() => router.push("/releaseOrder")}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">🚪</span>
              <div>
                <div className="text-sm font-bold text-red-500">
                  {loading
                    ? "—"
                    : `${pendingReleaseCount} 笔放箱令待确认`}
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  客户等待提箱中
                </div>
              </div>
            </div>
          </div>
          <div
            className="p-3 border border-yellow-200 rounded bg-yellow-50 cursor-pointer hover:shadow transition-all"
            onClick={() => goFilter("storage")}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">⏰</span>
              <div>
                <div className="text-sm font-bold text-yellow-600">
                  {loading
                    ? "—"
                    : `${overdueStorageCount} 个箱子堆存超30天`}
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  建议尽快处理
                </div>
              </div>
            </div>
          </div>
          <div
            className="p-3 border border-blue-200 rounded bg-blue-50 cursor-pointer hover:shadow transition-all"
            onClick={() => goFilter("in_transit")}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">🚢</span>
              <div>
                <div className="text-sm font-bold text-blue-600">
                  {loading
                    ? "—"
                    : `${inTransitCount} 个箱子在途中`}
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  预计本周到达12个
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
