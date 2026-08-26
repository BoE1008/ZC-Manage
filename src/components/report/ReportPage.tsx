import { useEffect, useState } from "react";
import Table from "@/components/ResizeTable";
import { useRouter } from "next/router";
import { getContainerReportStats } from "@/restApi/container";

// 后端 /zc/container/reportStats 返回结构
interface CondStat {
  count: number;
  label: string;
  type: string;
  percent: string;
}
interface MonthCards {
  sub: string;
  trend: "up" | "down" | "flat";
  lastMonthValue: number;
  diff: number;
  label: string;
  value: number;
  key: string;
}
interface ProjectStat {
  sold: number;
  total: number;
  projectId: string;
  projectNo: string;
  projectName: string;
  inTransit: number;
  landed: number;
  returned: number;
}
interface ReportEntity {
  total: number;
  conditionStats: { total: number; list: CondStat[] };
  monthCards: MonthCards[];
  projectStats: ProjectStat[];
}

const TREND_COLOR: Record<string, string> = {
  up: "text-green-500",
  down: "text-red-500",
  flat: "text-gray-400",
};
const TREND_ICON: Record<string, string> = {
  up: "↗",
  down: "↘",
  flat: "→",
};

// 6 张月卡 key → 主题色（边框 + 数字）
const MONTH_THEME: Record<string, { border: string; text: string }> = {
  pickup: { border: "border-l-blue-500", text: "text-blue-500" },
  shipped: { border: "border-l-orange-500", text: "text-orange-500" },
  sold: { border: "border-l-green-600", text: "text-green-600" },
  inbound: { border: "border-l-amber-500", text: "text-amber-500" },
  returned: { border: "border-l-purple-500", text: "text-purple-500" },
  total: { border: "border-l-[#198348]", text: "text-[#198348]" },
};

export const ReportPage = () => {
  const router = useRouter();
  const [data, setData] = useState<ReportEntity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = (await getContainerReportStats()) as any;
        const entity = r?.entity ?? r;
        if (!cancelled) setData(entity as ReportEntity);
      } catch (e) {
        console.error("ReportPage 加载失败", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        加载中…
      </div>
    );
  }

  const { conditionStats, monthCards, projectStats } = data;

  // 趋势卡（按 key 跳转对应 status/全部）
  const monthFilterMap: Record<string, string> = {
    pickup: "picked_up",
    shipped: "outbound",
    sold: "sold",
    inbound: "inbound",
    returned: "returned",
    total: "",
  };

  // 按箱况卡片颜色
  const condColor: Record<
    string,
    { text: string; bg: string; border: string }
  > = {
    new: {
      text: "text-green-600",
      bg: "bg-green-100 text-green-700",
      border: "border-green-400",
    },
    sub_new: {
      text: "text-yellow-600",
      bg: "bg-yellow-100 text-yellow-700",
      border: "border-yellow-400",
    },
    cargo_worthy: {
      text: "text-blue-600",
      bg: "bg-blue-100 text-blue-700",
      border: "border-blue-400",
    },
  };

  return (
    <div className="space-y-3">
      {/* 6 张月度卡 */}
      <div className="grid grid-cols-6 gap-2.5">
        {monthCards.map((m) => {
          const theme = MONTH_THEME[m.key] ?? {
            border: "border-l-[#198348]",
            text: "text-[#198348]",
          };

          return (
            <div
              key={m.key}
              className={`bg-white rounded-md p-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all border-l-4 ${theme.border} relative`}
            >
              <div className="text-xs text-gray-500 mb-1">{m.label}</div>
              <div className={`text-2xl font-bold ${theme.text}`}>
                {m.value}
              </div>
              <div className="text-[11px] text-gray-400 mt-0.5">{m.sub}</div>
              {m.key !== "total" && (
                <div
                  className={`absolute top-2 right-2 text-[14px] ${TREND_COLOR[m.trend]}`}
                >
                  {TREND_ICON[m.trend]}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 按项目维度 */}
      <div className="bg-white rounded-md p-4 shadow-sm">
        <div className="flex items-center text-sm font-bold mb-3 text-gray-800">
          <div className="w-1 h-4 bg-[#198348] rounded mr-2 flex-shrink-0" />
          按项目维度统计
          <span className="ml-auto text-xs font-normal text-gray-500">
            点击查看项目详情
          </span>
        </div>
        <Table
          onRow={(record: ProjectStat) => ({
            className: "cursor-pointer",
          })}
          columns={[
            {
              title: "项目编号",
              dataIndex: "projectNo",
              width: 160,
              ellipsis: true,
            },
            {
              title: "项目名称",
              dataIndex: "projectName",
              width: 240,
              ellipsis: true,
            },
            {
              title: "集装箱数",
              dataIndex: "total",
              width: 90,
              align: "center",
            },
            {
              title: "在途数",
              dataIndex: "inTransit",
              width: 80,
              align: "center",
            },
            {
              title: "已落地",
              dataIndex: "landed",
              width: 80,
              align: "center",
            },
            {
              title: "已还箱",
              dataIndex: "returned",
              width: 80,
              align: "center",
            },
            {
              title: "已卖出",
              dataIndex: "sold",
              width: 80,
              align: "center",
            },
          ]}
          dataSource={projectStats}
          rowKey="projectId"
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
          {(
            [
              { type: "new", label: "新箱" },
              { type: "sub_new", label: "次新箱" },
              { type: "cargo_worthy", label: "适货箱" },
            ] as { type: string; label: string }[]
          ).map((def) => {
            // 后端可能不返 0 项，按 type 补全
            const s = conditionStats.list.find((x) => x.type === def.type) ?? {
              type: def.type,
              label: def.label,
              count: 0,
              percent: "0.0",
            };
            const c = condColor[s.type] ?? {
              text: "text-gray-600",
              bg: "bg-gray-100 text-gray-700",
            };
            return (
              <div
                key={s.type}
                className="p-4 border rounded text-center bg-white cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all"
                onClick={() =>
                  router.push(
                    `/containerList?cond=${encodeURIComponent(s.type)}`,
                  )
                }
              >
                <div
                  className={`text-xs font-medium mb-2 inline-block px-2 py-0.5 rounded text-[11px] ${c.bg}`}
                >
                  {s.label}
                </div>
                <div className={`text-3xl font-bold ${c.text}`}>{s.count}</div>
                <div className="text-[11px] text-gray-400 mt-2">
                  占总数 {s.percent}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
