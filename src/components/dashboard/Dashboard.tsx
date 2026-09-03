import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  getContainerDashboardStats,
  getContainerTodoStats,
} from "@/restApi/container";

/** 后端 dashboardStats 响应结构 */
/** 待办项单条结构（接口 /zc/container/todoStats 返回） */
interface TodoItem {
  /** 提示文案 */
  hint: string;
  /** 数量 */
  count: number;
  /** 待办标题 */
  title: string;
}
/** todoStats 响应结构：items 是按 key 分组的待办列表，totalTodo 是总待办数 */
interface TodoStats {
  items: Record<string, TodoItem>;
  totalTodo: number;
}

interface DashboardStats {
  statusStats: Record<string, number> & { total?: number };
  typeStats: { containerType: string; num: number }[];
  usageStats: { usageType: string; num: number }[];
  monthlyFinance: {
    liftingCost: number;
    purchaseCost: number;
    liftingIncome: number;
    netExpense: number;
    returnCost: number;
    saleIncome: number;
    storageCost: number;
  };
  recentActivities: { time: string; text: string }[];
}

export const Dashboard = () => {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [todoStats, setTodoStats] = useState<TodoStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [res, todoRes] = await Promise.all([
          getContainerDashboardStats(),
          getContainerTodoStats().catch(() => null),
        ]);
        const raw = (res?.entity ?? {}) as Partial<DashboardStats>;
        const todoRaw = (todoRes?.entity ?? {
          items: {},
          totalTodo: 0,
        }) as TodoStats;
        setTodoStats({
          items: todoRaw.items ?? {},
          totalTodo: todoRaw.totalTodo ?? 0,
        });
        setStats({
          statusStats: raw.statusStats ?? {},
          typeStats: raw.typeStats ?? [],
          usageStats: raw.usageStats ?? [],
          monthlyFinance: raw.monthlyFinance ?? {
            liftingCost: 0,
            purchaseCost: 0,
            liftingIncome: 0,
            netExpense: 0,
            returnCost: 0,
            saleIncome: 0,
            storageCost: 0,
          },
          recentActivities: raw.recentActivities ?? [],
        });
      } catch (e) {
        console.error("Dashboard 加载失败", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const statusOf = (k: string) => stats?.statusStats?.[k] ?? 0;
  const totalCount = stats?.statusStats?.total ?? 0;

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
      val: statusOf("outbound"),
      label: "去程在途",
      sub: "海运/铁路中",
      color: "text-blue-500",
      filter: "outbound",
    },
    {
      cls: "border-l-orange-500",
      val: statusOf("overseas_storage"),
      label: "国外堆存",
      sub: "等待处理",
      color: "text-orange-500",
      filter: "overseas_storage",
    },
    {
      cls: "border-l-cyan-500",
      val: statusOf("domestic_storage"),
      label: "国内堆存",
      sub: "待发运",
      color: "text-cyan-700",
      filter: "domestic_storage",
    },
    {
      cls: "border-l-purple-500",
      val: statusOf("inbound"),
      label: "回程在途",
      sub: "回国内中",
      color: "text-purple-500",
      filter: "inbound",
    },
    {
      cls: "border-l-green-500",
      val: statusOf("sold"),
      label: "已卖出",
      sub: "业务结束",
      color: "text-green-500",
      filter: "sold",
    },
    {
      cls: "border-l-red-500",
      val: statusOf("lost"),
      label: "灭失",
      sub: "已灭失/丢失",
      color: "text-red-500",
      filter: "lost",
    },
    {
      cls: "border-l-[#198348]",
      val: totalCount,
      label: "集装箱总数",
      sub: "在管总量",
      color: "text-[#198348]",
      filter: null,
    },
  ];

  // 待办数据：完全数据驱动渲染，按 todoStats.items 的 key 顺序输出
  const todoKeyAction: Record<string, () => void> = {
    releasePending: () => router.push("/releaseOrder"),
    inTransit: () => goFilter("outbound"),
    arrivalImminent: () => goFilter("inbound"),
    arrivalOverdue: () => goFilter("domestic_storage"),
    dayRule: () => goFilter("domestic_storage"),
    storageOverdue: () => goFilter("domestic_storage"),
  };
  const todoKeyStyle: Record<
    string,
    { emoji: string; color: string; bg: string; border: string }
  > = {
    releasePending: {
      emoji: "🚪",
      color: "text-red-500",
      bg: "bg-red-50",
      border: "border-red-200",
    },
    inTransit: {
      emoji: "🚢",
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
    arrivalImminent: {
      emoji: "📍",
      color: "text-orange-600",
      bg: "bg-orange-50",
      border: "border-orange-200",
    },
    arrivalOverdue: {
      emoji: "⚠️",
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-300",
    },
    dayRule: {
      emoji: "⏰",
      color: "text-yellow-600",
      bg: "bg-yellow-50",
      border: "border-yellow-200",
    },
    storageOverdue: {
      emoji: "📦",
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-200",
    },
  };
  const todoEntries = Object.entries(todoStats?.items ?? {}).map(
    ([key, item]) => ({
      key,
      label: `${item.count} ${item.title}`,
      sub: item.hint,
      val: item.count,
      ...(todoKeyStyle[key] ?? {
        emoji: "📌",
        color: "text-gray-600",
        bg: "bg-gray-50",
        border: "border-gray-200",
      }),
      onClick: () => {
        const act = todoKeyAction[key];
        if (act) act();
        else if (key.toLowerCase().includes("release"))
          router.push("/releaseOrder");
        else goFilter(null);
      },
    }),
  );

  return (
    <div className="space-y-3">
      {/* 统计卡片 */}
      <div className="grid grid-cols-7 gap-2.5">
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
              cnt: statusOf("domestic_storage"),
              color: "text-cyan-700",
              filter: "domestic_storage",
            },
            {
              label: "去程在途",
              cnt: statusOf("outbound"),
              color: "text-blue-500",
              filter: "outbound",
            },
            {
              label: "国外堆存",
              cnt: statusOf("overseas_storage"),
              color: "text-yellow-500",
              filter: "overseas_storage",
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
          <div className="flex items-center gap-1.5">
            <div
              className="bg-white border border-gray-200 rounded-md px-3 py-1.5 text-center cursor-pointer hover:shadow-md transition-all"
              onClick={() => goFilter("inbound")}
            >
              <div className="text-xs font-bold text-purple-500">回程在途</div>
              <div className="text-base font-bold text-gray-900 mt-0.5">
                {loading ? "—" : statusOf("inbound")}
              </div>
            </div>
          </div>
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
            onClick={() => goFilter("sold")}
          >
            <div className="text-xs font-bold text-green-600">已卖出</div>
            <div className="text-base font-bold text-green-600 mt-0.5">
              {loading ? "—" : statusOf("sold")}
            </div>
          </div>
          <span className="text-[11px] text-gray-400 ml-2">
            买箱发运到国外后卖出，业务结束
          </span>
        </div>
      </div>

      {/* 最近操作记录 + 本月财务概览 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2 bg-white rounded-md p-4 shadow-sm">
          <div className="flex items-center text-sm font-bold mb-3 text-gray-800">
            <div className="w-1 h-4 bg-[#198348] rounded mr-2 flex-shrink-0" />
            最近操作记录
          </div>
          {loading ? (
            <div className="text-xs text-gray-400 py-4 text-center">
              加载中…
            </div>
          ) : (stats?.recentActivities ?? []).length === 0 ? (
            <div className="text-xs text-gray-400 py-4 text-center">
              暂无动态
            </div>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto">
              {stats!.recentActivities.map((a, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 text-[13px] leading-relaxed pb-2 border-b border-gray-100 last:border-0"
                >
                  <span className="text-gray-400 flex-shrink-0 font-mono w-28 text-xs pt-0.5">
                    {a.time}
                  </span>
                  <span
                    className="text-gray-700"
                    dangerouslySetInnerHTML={{
                      __html: a.text.replace(
                        /<b>(.*?)<\/b>/g,
                        '<b style="color:#198348">$1</b>',
                      ),
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-md p-4 shadow-sm">
          <div className="flex items-center text-sm font-bold mb-3 text-gray-800">
            <div className="w-1 h-4 bg-[#198348] rounded mr-2 flex-shrink-0" />
            本月财务概览
          </div>
          {(() => {
            const f = stats?.monthlyFinance;
            if (!f) {
              return (
                <div className="flex flex-col items-center justify-center py-6">
                  <span className="text-xs text-gray-400">暂无数据</span>
                </div>
              );
            }
            const items = [
              { label: "采购支出", val: f.purchaseCost, color: "text-red-500" },
              {
                label: "提箱费支出",
                val: f.liftingCost,
                color: "text-red-500",
              },
              { label: "堆存成本", val: f.storageCost, color: "text-red-500" },
              { label: "还箱费", val: f.returnCost, color: "text-red-500" },
              {
                label: "卖出/出租收入",
                val: f.saleIncome,
                color: "text-green-600",
              },
              {
                label: "本月净支出",
                val: f.netExpense,
                color: "text-red-500",
                bold: true,
              },
            ];
            return (
              <div className="divide-y divide-gray-100">
                {items.map((it, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between py-2.5 ${
                      it.bold ? "font-bold text-base" : "text-[13px]"
                    }`}
                  >
                    <span className="text-gray-600">{it.label}</span>
                    <span className={it.color}>
                      {loading ? "—" : `USD ${it.val.toLocaleString()}`}
                    </span>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>

      {/* 箱型分布 + 使用情况分布 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-md p-4 shadow-sm">
          <div className="flex items-center text-sm font-bold mb-3 text-gray-800">
            <div className="w-1 h-4 bg-[#198348] rounded mr-2 flex-shrink-0" />
            箱型分布
          </div>
          <div className="flex flex-wrap gap-3">
            {loading ? (
              <span className="text-xs text-gray-400">加载中…</span>
            ) : (stats?.typeStats ?? []).length === 0 ? (
              <span className="text-xs text-gray-400">暂无数据</span>
            ) : (
              stats!.typeStats.map((t, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[13px] text-gray-600">
                    {t.containerType}
                  </span>
                  <span className="text-[13px] font-bold text-[#198348]">
                    {t.num}
                  </span>
                  {i < stats!.typeStats.length - 1 && (
                    <span className="text-gray-300 text-xs">|</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-md p-4 shadow-sm">
          <div className="flex items-center text-sm font-bold mb-3 text-gray-800">
            <div className="w-1 h-4 bg-[#198348] rounded mr-2 flex-shrink-0" />
            使用情况分布
          </div>
          <div className="flex flex-wrap gap-3">
            {loading ? (
              <span className="text-xs text-gray-400">加载中…</span>
            ) : (stats?.usageStats ?? []).length === 0 ? (
              <span className="text-xs text-gray-400">暂无数据</span>
            ) : (
              stats!.usageStats.map((u, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[13px] text-gray-600">
                    {u.usageType === "purchase"
                      ? "买箱"
                      : u.usageType === "long_rental"
                        ? "长租"
                        : u.usageType}
                  </span>
                  <span className="text-[13px] font-bold text-[#198348]">
                    {u.num}
                  </span>
                  {i < stats!.usageStats.length - 1 && (
                    <span className="text-gray-300 text-xs">|</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 待办事项 */}
      <div className="bg-white rounded-md p-4 shadow-sm">
        <div className="flex items-center text-sm font-bold mb-3 text-gray-800">
          <div className="w-1 h-4 bg-[#198348] rounded mr-2 flex-shrink-0" />
          待办事项
        </div>
        <div className="grid grid-cols-5 gap-2.5">
          {todoEntries.map((t) => (
            <div
              key={t.key}
              className={`p-3 border ${t.border} rounded ${t.bg} cursor-pointer hover:shadow transition-all`}
              onClick={t.onClick}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{t.emoji}</span>
                <div>
                  <div className={`text-base font-bold ${t.color}`}>
                    {loading ? "—" : t.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{t.sub}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
