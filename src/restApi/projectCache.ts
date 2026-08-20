/**
 * 项目列表单例缓存 —— 全局只请求一次
 */
import { getProjectList as apiGetProjectList } from "./project";

interface Cached {
  list: any[];
  promise: ReturnType<typeof apiGetProjectList> | null;
  resolved: boolean;
}

const cache: Cached = { list: [], promise: null, resolved: false };

/** 同步获取（可能为空） */
export function getProjectListSync(): any[] {
  console.log('[cache] getProjectListSync called, returning cache.list length:', cache.list.length);
  return cache.list;
}

/** 异步获取 */
export async function getProjectList(): Promise<any[]> {
  console.log('[cache] getProjectList called, resolved:', cache.resolved, 'listLen:', cache.list.length, 'promise:', !!cache.promise);
  if (cache.resolved) {
    console.log('[cache] return cached list (resolved=true), length:', cache.list.length);
    return cache.list;
  }
  if (cache.promise) {
    console.log('[cache] waiting existing promise...');
    await cache.promise;
    console.log('[cache] promise resolved, returning list length:', cache.list.length);
    return cache.list;
  }
  console.log('[cache] start fetching /zc/project/submit/list');
  cache.promise = apiGetProjectList(1, 1000);
  try {
    const r: any = await cache.promise;
    console.log('[cache] API raw response:', JSON.stringify(r));
    cache.list = r?.entity?.data ?? [];
    console.log('[cache] cache.list set, length:', cache.list.length, 'data sample:', JSON.stringify(cache.list.slice(0, 2)));
    cache.resolved = true;
  } finally {
    cache.promise = null;
  }
  return cache.list;
}

export function clearProjectCache() {
  cache.list = [];
  cache.resolved = false;
}
