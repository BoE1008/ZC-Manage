import { useRouter } from "next/router";
import { useMemo, useEffect, useState } from "react";
import { getContainerDashboardStatus } from "@/restApi/container";
import { Container, Activity } from "@/types";

export const Dashboard = () => {
  const [containers, setContainers] = useState<Container[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const router = useRouter();

  const counts = useMemo(() => {
    const c: Record<string, number> = {
      国内堆存: 0,
      去程在途: 0,
      国外堆存: 0,
      卖出: 0,
      回程在途: 0,
      已还箱: 0,
    };
    containers.forEach((x) => {
      if (c[x.status] !== undefined) c[x.status]++;
    });
    return c;
  }, [containers]);

  const statCards = [
    {
      cls: "border-l-blue-500",
      val: counts["去程在途"],
      label: "去程在途",
      sub: "海运/铁路中",
      color: "text-blue-500",
      filter: "去程在途",
    },
    {
      cls: "border-l-yellow-500",
      val: counts["国外堆存"],
      label: "国外堆存",
      sub: "等待处理",
      color: "text-yellow-500",
      filter: "国外堆存",
    },
    {
      cls: "border-l-gray-500",
      val: counts["国内堆存"],
      label: "国内堆存",
      sub: "待发运",
      color: "text-gray-500",
      filter: "国内堆存",
    },
    {
      cls: "border-l-purple-500",
      val: counts["回程在途"],
      label: "回程在途",
      sub: "回国内中",
      color: "text-purple-500",
      filter: "回程在途",
    },
    {
      cls: "border-l-green-500",
      val: counts["卖出"],
      label: "已卖出",
      sub: "业务结束",
      color: "text-green-500",
      filter: "卖出",
    },
    {
      cls: "border-l-teal-500",
      val: containers.length,
      label: "集装箱总数",
      sub: "在管总量",
      color: "text-teal-500",
      filter: null,
    },
  ];

  const goFilter = (status: string | null) => {
    router.push(
      status
        ? `/containers?status=${encodeURIComponent(status)}`
        : "/containers",
    );
  };
  useEffect(() => {
    (async () => {
      const res = await getContainerDashboardStatus();
      console.log(res);
    })();
  }, []);

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
            <div className={`text-2xl font-bold ${s.color}`}>{s.val}</div>
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
              cnt: counts["国内堆存"],
              color: "text-gray-500",
              filter: "国内堆存",
            },
            {
              label: "去程在途",
              cnt: counts["去程在途"],
              color: "text-blue-500",
              filter: "去程在途",
            },
            {
              label: "国外堆存",
              cnt: counts["国外堆存"],
              color: "text-yellow-500",
              filter: "国外堆存",
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
                  {f.cnt}
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
              cnt: counts["回程在途"],
              color: "text-purple-500",
              filter: "回程在途",
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
                  {f.cnt}
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
            onClick={() => goFilter("卖出")}
          >
            <div className="text-xs font-bold text-green-600">已卖出</div>
            <div className="text-base font-bold text-green-600 mt-0.5">
              {counts["卖出"]}
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
            {activities.map((a, i) => (
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
            ))}
          </div>
        </div>

        <div className="bg-white rounded-md p-4 shadow-sm">
          <div className="flex items-center text-sm font-bold mb-3 text-gray-800">
            <div className="w-1 h-4 bg-[#198348] rounded mr-2 flex-shrink-0" />
            本月财务概览
          </div>
          <div className="space-y-2">
            {[
              { label: "采购支出", val: "USD 326,800" },
              { label: "提箱费支出", val: "USD 12,460" },
              { label: "堆存成本", val: "USD 8,920" },
              { label: "还箱费", val: "USD 3,200" },
              {
                label: "卖出/出租收入",
                val: "USD 78,500",
                color: "text-green-600 font-bold",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex justify-between items-center py-2 border-b border-dashed border-gray-100 last:border-0"
              >
                <span className="text-xs text-gray-500">{item.label}</span>
                <span
                  className={`text-xs font-bold ${item.color || "text-gray-800"}`}
                >
                  {item.val}
                </span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-gray-500">本月净支出</span>
              <span className="text-base font-bold text-red-500">
                USD 272,880
              </span>
            </div>
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
            onClick={() => router.push("/release")}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">🚪</span>
              <div>
                <div className="text-sm font-bold text-red-500">
                  3 笔放箱令待确认
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  客户等待提箱中
                </div>
              </div>
            </div>
          </div>
          <div
            className="p-3 border border-yellow-200 rounded bg-yellow-50 cursor-pointer hover:shadow transition-all"
            onClick={() => goFilter("国外堆存")}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">⏰</span>
              <div>
                <div className="text-sm font-bold text-yellow-600">
                  5 个箱子堆存超30天
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">
                  建议尽快处理
                </div>
              </div>
            </div>
          </div>
          <div
            className="p-3 border border-blue-200 rounded bg-blue-50 cursor-pointer hover:shadow transition-all"
            onClick={() => goFilter("去程在途")}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">🚢</span>
              <div>
                <div className="text-sm font-bold text-blue-600">
                  32 个箱子在途中
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
