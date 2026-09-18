/**
 * 统一解构后端响应，兼容多种返回形态：
 *   1) res.entity.data        — 主要形态
 *   2) res.entity              — 当 data 已直接挂在 entity
 *   3) res.data                — 部分接口直通
 *   4) res                     — 直通原始对象
 */
export const unwrapEntity = <T = any>(
  res: any,
  fallback: T | null = null,
): T | null => {
  if (!res) return fallback;
  return (
    res?.entity?.data ??
    res?.entity ??
    res?.data ??
    res ??
    fallback
  );
};

/**
 * 解构列表/数组响应
 */
export const unwrapList = <T = any>(res: any): T[] => {
  const data = unwrapEntity<any>(res, []);
  return Array.isArray(data) ? data : [];
};