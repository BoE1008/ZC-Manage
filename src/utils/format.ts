import dayjs from "dayjs";

/**
 * 安全格式化日期：dayjs 校验失败或空值时返回 fallback
 * 用法：formatDate(v) → "2026-09-17" 或 "-"
 */
export const formatDate = (
  v: string | number | Date | null | undefined,
  fallback: string = "-",
  pattern: string = "YYYY-MM-DD",
): string => {
  if (v === null || v === undefined || v === "") return fallback;
  const d = dayjs(v);
  return d.isValid() ? d.format(pattern) : fallback;
};

/**
 * 空值兜底显示：空字符串/null/undefined 返回 fallback，否则原值
 * 用法：displayValue(name) → name || "-"
 */
export const displayValue = <T>(
  v: T | null | undefined,
  fallback: string = "-",
): T | string => {
  if (v === null || v === undefined || v === "") return fallback;
  return v;
};

/**
 * 空值判断（用于条件渲染）
 */
export const isEmpty = (v: unknown): boolean =>
  v === null || v === undefined || v === "";