import React from "react";
import { cn } from "@/utils";

/**
 * 详情弹窗的「标签 + 值」统一组件
 * - 默认 grid 中的一格（外部 grid 决定布局）
 * - value 为空时显示 fallback（默认 "-"），样式灰化
 * - valueClassName 可高亮（绿色 #198348 等）
 */
export interface InfoItemProps {
  label: string;
  value?: React.ReactNode;
  fallback?: string;
  valueClassName?: string;
  labelClassName?: string;
  emptyClassName?: string;
  /** 整格 col-span（如 "col-span-2"） */
  colSpan?: string;
}

export const InfoItem: React.FC<InfoItemProps> = ({
  label,
  value,
  fallback = "-",
  valueClassName = "text-gray-800 font-medium",
  labelClassName = "text-xs text-gray-400",
  emptyClassName = "text-gray-400",
  colSpan,
}) => {
  const isEmpty = value === null || value === undefined || value === "";
  const display = isEmpty ? fallback : value;
  return (
    <div className={cn(colSpan)}>
      <div className={labelClassName}>{label}</div>
      <div
        className={cn(
          "text-sm",
          isEmpty ? emptyClassName : valueClassName,
        )}
      >
        {display}
      </div>
    </div>
  );
};

/**
 * 详情弹窗中的分节标题（绿色加粗 + 虚线下划线）
 */
export const SectionTitle: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div
    className={cn(
      "text-xs font-bold text-[#198348] pb-1 border-b border-dashed border-gray-200 mb-2",
      className,
    )}
  >
    {children}
  </div>
);