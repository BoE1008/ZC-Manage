import {
  ConditionType,
  UsageType,
  OrderType,
  ReleaseStatus,
  SupplierTypeValue,
  BuyerTypeValue,
  CONTAINER_STATUS_MAP,
  USAGE_TYPE_MAP,
  CONTAINER_COND_MAP,
  ORDER_TYPE_MAP,
  SUPPLIER_TYPE_MAP,
  BUYER_TYPE_MAP,
} from "@/types";
import { cn } from "@/utils";

// 状态枚举 → 中文显示 + 颜色（数据来源：types/dict.ts CONTAINER_STATUS_MAP）

export const StatusBadge = ({ status }: { status: string }) => {
  const info =
    CONTAINER_STATUS_MAP[status] ??
    { label: status || "-", cls: "bg-gray-100 text-gray-600" };
  return (
    <span
      className={cn(
        "inline-block px-2 py-0.5 rounded-full text-xs font-medium",
        info.cls,
      )}
    >
      {info.label}
    </span>
  );
};

// 使用情况（数据来源：types/dict.ts USAGE_TYPE_MAP）
export const UsageTag = ({ usage }: { usage: UsageType | string }) => {
  const info =
    USAGE_TYPE_MAP[usage] ?? { label: usage || "-", cls: "bg-gray-100 text-gray-600" };
  return (
    <span
      className={cn(
        "inline-block px-1.5 py-0.5 rounded text-xs mr-0.5",
        info.cls,
      )}
    >
      {info.label}
    </span>
  );
};

// 箱况（数据来源：types/dict.ts CONTAINER_COND_MAP）
export const CondTag = ({ cond }: { cond: ConditionType | string }) => {
  const info =
    CONTAINER_COND_MAP[cond] ?? { label: cond || "-", cls: "bg-gray-100 text-gray-600" };
  return (
    <span
      className={cn(
        "inline-block px-1.5 py-0.5 rounded text-xs mr-0.5",
        info.cls,
      )}
    >
      {info.label}
    </span>
  );
};

// 放箱类型（数据来源：types/dict.ts ORDER_TYPE_MAP）
export const ReleaseTypeBadge = ({ type }: { type: OrderType | string }) => {
  const info =
    ORDER_TYPE_MAP[type] ?? { label: type || "-", cls: "bg-gray-100 text-gray-600" };
  return (
    <span
      className={cn(
        "inline-block px-2 py-0.5 rounded-full text-xs font-medium",
        info.cls,
      )}
    >
      {info.label}
    </span>
  );
};

// 放箱令状态 badge（兼容旧 props，status 同时涵盖 container 与 release 两套）
export const ReleaseStatusBadge = ({ status }: { status: ReleaseStatus | string }) => {
  return <StatusBadge status={status} />;
};

// 卖方类型（数据来源：types/dict.ts SUPPLIER_TYPE_MAP）
export const SupplierTypeBadge = ({
  type,
}: {
  type: SupplierTypeValue;
}) => {
  const info =
    SUPPLIER_TYPE_MAP[type] ?? { label: type || "-", cls: "bg-gray-100 text-gray-600" };
  return (
    <span
      className={cn(
        "inline-block px-2 py-0.5 rounded-full text-xs font-medium",
        info.cls,
      )}
    >
      {info.label}
    </span>
  );
};

// 买方类型（数据来源：types/dict.ts BUYER_TYPE_MAP）
export const BuyerTypeBadge = ({
  type,
}: {
  type: BuyerTypeValue;
}) => {
  const info =
    BUYER_TYPE_MAP[type] ?? { label: type || "-", cls: "bg-gray-100 text-gray-600" };
  return (
    <span
      className={cn(
        "inline-block px-2 py-0.5 rounded-full text-xs font-medium",
        info.cls,
      )}
    >
      {info.label}
    </span>
  );
};