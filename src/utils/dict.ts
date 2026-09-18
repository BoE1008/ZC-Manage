/**
 * 字典项结构（兼容后端多种返回字段命名）
 */
export interface DictItem {
  dictLabel?: string;
  dictValue?: string;
  label?: string;
  value?: string;
  [key: string]: unknown;
}

export interface DictOption {
  label: string;
  value: string;
}

/**
 * 把后端字典数组统一归一化为 {label, value}[]
 * 兼容 dictLabel/dictValue 与 label/value 两种字段命名
 */
export const normalizeDictOptions = (
  rows: unknown,
): DictOption[] => {
  if (!Array.isArray(rows)) return [];
  return rows
    .map((d: any) => ({
      label: d.dictLabel ?? d.label ?? d.dictValue ?? d.value ?? "",
      value: d.dictValue ?? d.value ?? "",
    }))
    .filter((o) => o.value !== "");
};