import {
  ConditionType,
  UsageType,
  OrderType,
  ReleaseStatus,
} from "@/types";
import { cn } from "@/utils";

// 状态枚举 → 中文显示 + 颜色
// 来源：sys_dict_type.code = 'container_status' 后端字典
const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  // 集装箱状态
  domestic_storage: { label: "国内堆存", cls: "bg-cyan-50 text-cyan-700 border border-cyan-200" },
  outbound: { label: "去程在途", cls: "bg-blue-100 text-blue-700" },
  overseas_storage: { label: "国外堆存", cls: "bg-amber-100 text-amber-700" },
  sold: { label: "已卖出", cls: "bg-green-100 text-green-700" },
  inbound: { label: "回程在途", cls: "bg-purple-100 text-purple-700" },
  // 放箱令状态
  pending: { label: "待确认", cls: "bg-yellow-100 text-yellow-700" },
  picked_up: { label: "已提箱", cls: "bg-green-100 text-green-700" },
  cancelled: { label: "已作废", cls: "bg-gray-100 text-gray-600" },
  released: { label: "已放箱", cls: "bg-blue-100 text-blue-700" },
};

export const StatusBadge = ({
  status,
}: {
  status: string;
}) => {
  const info = STATUS_MAP[status] ?? { label: status || "-", cls: "bg-gray-100 text-gray-600" };
  return (
    <span className={cn("inline-block px-2 py-0.5 rounded-full text-xs font-medium", info.cls)}>
      {info.label}
    </span>
  );
};

// 使用情况
const USAGE_MAP: Record<string, { label: string; cls: string }> = {
  purchase: { label: "买箱", cls: "bg-yellow-100 text-yellow-700" },
  long_rental: { label: "长租", cls: "bg-blue-100 text-blue-700" },
};

export const UsageTag = ({ usage }: { usage: UsageType | string }) => {
  const info = USAGE_MAP[usage] ?? { label: usage || "-", cls: "bg-gray-100 text-gray-600" };
  return (
    <span className={cn("inline-block px-1.5 py-0.5 rounded text-xs mr-0.5", info.cls)}>
      {info.label}
    </span>
  );
};

// 箱况
const COND_MAP: Record<string, { label: string; cls: string }> = {
  new: { label: "新箱", cls: "bg-green-100 text-green-700" },
  sub_new: { label: "次新箱", cls: "bg-yellow-100 text-yellow-700" },
  cargo_worthy: { label: "适货箱", cls: "bg-blue-100 text-blue-700" },
};

export const CondTag = ({ cond }: { cond: ConditionType | string }) => {
  const info = COND_MAP[cond] ?? { label: cond || "-", cls: "bg-gray-100 text-gray-600" };
  return (
    <span className={cn("inline-block px-1.5 py-0.5 rounded text-xs mr-0.5", info.cls)}>
      {info.label}
    </span>
  );
};

// 放箱类型
const ORDER_TYPE_MAP: Record<string, { label: string; cls: string }> = {
  sale: { label: "卖出放箱", cls: "bg-green-100 text-green-700" },
  return: { label: "回程放箱", cls: "bg-purple-100 text-purple-700" },
  rent: { label: "租给客户", cls: "bg-cyan-100 text-cyan-700" },
};

export const ReleaseTypeBadge = ({ type }: { type: OrderType | string }) => {
  const info = ORDER_TYPE_MAP[type] ?? { label: type || "-", cls: "bg-gray-100 text-gray-600" };
  return (
    <span className={cn("inline-block px-2 py-0.5 rounded-full text-xs font-medium", info.cls)}>
      {info.label}
    </span>
  );
};

// 卖方类型
export const SupplierTypeBadge = ({
  type,
}: {
  type: "seller" | "rental_provider" | "yard" | string;
}) => {
  const MAP: Record<string, { label: string; cls: string }> = {
    seller: { label: "卖方", cls: "bg-orange-100 text-orange-700" },
    rental_provider: { label: "出租方", cls: "bg-blue-100 text-blue-700" },
    yard: { label: "堆场", cls: "bg-cyan-100 text-cyan-700" },
  };
  const info = MAP[type] ?? { label: type || "-", cls: "bg-gray-100 text-gray-600" };
  return (
    <span className={cn("inline-block px-2 py-0.5 rounded-full text-xs font-medium", info.cls)}>
      {info.label}
    </span>
  );
};

// 买方类型
export const BuyerTypeBadge = ({
  type,
}: {
  type: "buyer" | "rental" | string;
}) => {
  const MAP: Record<string, { label: string; cls: string }> = {
    buyer: { label: "买方", cls: "bg-green-100 text-green-700" },
    rental: { label: "租方", cls: "bg-purple-100 text-purple-700" },
  };
  const info = MAP[type] ?? { label: type || "-", cls: "bg-gray-100 text-gray-600" };
  return (
    <span className={cn("inline-block px-2 py-0.5 rounded-full text-xs font-medium", info.cls)}>
      {info.label}
    </span>
  );
};
