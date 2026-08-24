import { getDictByCode } from "./dict";
import type {
  ContainerDictCode,
  DictOption,
  DictItem,
} from "@/types/dict";

export type { ContainerDictCode, DictOption, DictItem };

// 单例缓存：{ code -> DictOption[] }
const cache: Record<string, DictOption[]> = {};
const pending: Record<string, Promise<DictOption[]> | undefined> = {};

const labelMap: Record<string, string> = {
  container_status: "集装箱状态",
  container_type: "箱型",
  container_cond: "箱况",
  container_usage: "使用情况",
};

/**
 * 把后端字典数据 DictItem[] 规范化为 {label,value}[]
 */
const normalize = (rows: DictItem[] | any[]): DictOption[] =>
  (rows || []).map((r) => ({
    label: r.dictLabel ?? r.label ?? r.dictValue ?? r.value ?? "",
    value: r.dictValue ?? r.value ?? r.dictLabel ?? "",
  }));

/**
 * 同步读取缓存（可能为空数组，未加载过）
 */
export const getDictOptionsSync = (code: ContainerDictCode): DictOption[] =>
  cache[code] ?? [];

/**
 * 异步获取字典选项，优先用缓存
 */
export const getDictOptions = async (
  code: ContainerDictCode
): Promise<DictOption[]> => {
  if (cache[code]) return cache[code];
  if (pending[code]) return pending[code]!;

  const promise = (async () => {
    const res = await getDictByCode(code);
    // 后端响应：{ code, entity: { data: [...] } | [...] }
    const entity = (res as any)?.entity ?? res;
    const list = Array.isArray(entity) ? entity : entity?.data ?? [];
    const opts = normalize(list);
    cache[code] = opts;
    return opts;
  })();

  pending[code] = promise;
  try {
    return await promise;
  } finally {
    pending[code] = undefined;
  }
};

/**
 * 预加载多个字典（页面初始化时一次性拉完）
 */
export const preloadDictOptions = async (codes: ContainerDictCode[]) => {
  await Promise.all(codes.map(getDictOptions));
};

/**
 * 调试用：清缓存
 */
export const clearDictCache = () => {
  Object.keys(cache).forEach((k) => delete cache[k]);
};

export const DICT_LABEL_MAP: Record<ContainerDictCode, string> = {
  container_status: "集装箱状态",
  container_type: "箱型",
  container_cond: "箱况",
  container_usage: "使用情况",
};

// 保留一份 labelMap 引用供调试日志使用
void labelMap;