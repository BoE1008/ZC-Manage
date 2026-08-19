import {
  ContainerStatus,
  ReleaseType,
  ReleaseStatus,
  ContainerCondition,
} from "@/types";
import { cn } from "@/utils";

// 状态徽章
const statusBadgeClass: Record<ContainerStatus, string> = {
  国内堆存: "bg-gray-100 text-gray-600",
  去程在途: "bg-blue-100 text-blue-700",
  国外堆存: "bg-yellow-100 text-yellow-700",
  卖出: "bg-green-100 text-green-700",
  回程在途: "bg-purple-100 text-purple-700",
  已还箱: "bg-gray-200 text-gray-700",
};

export const StatusBadge = ({
  status,
}: {
  status: ContainerStatus | ReleaseStatus;
}) => {
  return (
    <span
      className={cn(
        "inline-block px-2 py-0.5 rounded-full text-xs font-medium",
        statusBadgeClass[status as ContainerStatus] ||
          "bg-gray-100 text-gray-600",
      )}
    >
      {status}
    </span>
  );
};

// 使用情况标签
export const UsageTag = ({ usage }: { usage: "买箱" | "租箱" }) => {
  return (
    <span
      className={cn(
        "inline-block px-1.5 py-0.5 rounded text-xs mr-0.5",
        usage === "买箱"
          ? "bg-yellow-100 text-yellow-700"
          : "bg-blue-100 text-blue-700",
      )}
    >
      {usage}
    </span>
  );
};

// 箱况标签
const condClass: Record<ContainerCondition, string> = {
  新箱: "bg-green-100 text-green-700",
  次新箱: "bg-yellow-100 text-yellow-700",
  适货箱: "bg-blue-100 text-blue-700",
};

export const CondTag = ({ cond }: { cond: ContainerCondition }) => {
  return (
    <span
      className={cn(
        "inline-block px-1.5 py-0.5 rounded text-xs mr-0.5",
        condClass[cond],
      )}
    >
      {cond}
    </span>
  );
};

// 放箱类型徽章
const releaseTypeClass: Record<ReleaseType, string> = {
  卖出放箱: "bg-green-100 text-green-700",
  回程放箱: "bg-purple-100 text-purple-700",
  租给客户: "bg-cyan-100 text-cyan-700",
};

export const ReleaseTypeBadge = ({ type }: { type: ReleaseType }) => {
  return (
    <span
      className={cn(
        "inline-block px-2 py-0.5 rounded-full text-xs font-medium",
        releaseTypeClass[type],
      )}
    >
      {type}
    </span>
  );
};

// 卖方类型徽章
const supplierTypeClass = {
  卖方: "bg-orange-100 text-orange-700",
  出租方: "bg-blue-100 text-blue-700",
  堆场: "bg-cyan-100 text-cyan-700",
};

export const SupplierTypeBadge = ({
  type,
}: {
  type: "卖方" | "出租方" | "堆场";
}) => {
  return (
    <span
      className={cn(
        "inline-block px-2 py-0.5 rounded-full text-xs font-medium",
        supplierTypeClass[type],
      )}
    >
      {type}
    </span>
  );
};

// 买方类型徽章
const buyerTypeClass = {
  买方: "bg-green-100 text-green-700",
  租方: "bg-purple-100 text-purple-700",
};
export const BuyerTypeBadge = ({ type }: { type: "买方" | "租方" }) => {
  return (
    <span
      className={cn(
        "inline-block px-2 py-0.5 rounded-full text-xs font-medium",
        buyerTypeClass[type],
      )}
    >
      {type}
    </span>
  );
};
