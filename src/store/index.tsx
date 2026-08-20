import { create } from 'zustand';
import { message } from 'antd';
import {
  Container,
  ContainerTracking,
  ReleaseOrder,
  ContainerPageQuery,
  Yard,
  YardForm,
} from '@/types';
import {
  getContainerList,
  deleteContainer as apiDeleteContainer,
} from '@/restApi/container';
import {
  getTrackingList,
  deleteTracking as apiDeleteTracking,
} from '@/restApi/tracking';
import {
  Supplier,
  SupplierForm,
  getSupplierList,
  deleteSupplier as apiDeleteSupplier,
  addSupplier as apiAddSupplier,
  editSupplier as apiEditSupplier,
} from '@/restApi/supplier';
import {
  ContainerBuyer,
  ContainerBuyerForm,
  getContainerBuyerList,
  deleteContainerBuyer as apiDeleteBuyer,
  addContainerBuyer as apiAddBuyer,
  editContainerBuyer as apiEditBuyer,
} from '@/restApi/containerBuyer';
import {
  getYardList,
  deleteYard as apiDeleteYard,
  addYard as apiAddYard,
  editYard as apiEditYard,
} from '@/restApi/yard';
import { getDictById } from '@/restApi/dict';

interface StoreState {
  // 数据
  containers: Container[];
  shipments: ContainerTracking[];
  releases: ReleaseOrder[];
  suppliers: Supplier[];
  buyers: ContainerBuyer[];
  yards: Yard[];
  dictTree: any[];

  // 加载状态
  containersLoading: boolean;
  shipmentsLoading: boolean;
  releasesLoading: boolean;
  suppliersLoading: boolean;
  buyersLoading: boolean;
  yardsLoading: boolean;

  // 列表加载（分页）
  loadContainers: (params?: Partial<ContainerPageQuery>) => Promise<void>;
  loadShipments: (params?: Record<string, any>) => Promise<void>;
  loadReleases: (params?: Record<string, any>) => Promise<void>;
  loadSuppliers: (params?: Record<string, any>) => Promise<void>;
  loadBuyers: (params?: Record<string, any>) => Promise<void>;
  loadYards: (params?: Record<string, any>) => Promise<void>;
  loadDictTree: () => Promise<void>;

  // CRUD
  addSupplier: (data: SupplierForm) => Promise<void>;
  editSupplier: (data: SupplierForm & { id: string }) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;

  addBuyer: (data: ContainerBuyerForm) => Promise<void>;
  editBuyer: (data: ContainerBuyerForm & { id: string }) => Promise<void>;
  deleteBuyer: (id: string) => Promise<void>;

  addYard: (data: YardForm) => Promise<void>;
  editYard: (data: YardForm & { id: string }) => Promise<void>;
  deleteYard: (id: string) => Promise<void>;

  deleteContainer: (id: string) => Promise<void>;
  deleteTracking: (id: string) => Promise<void>;
}

export const useStore = create<StoreState>((set, get) => ({
  containers: [],
  shipments: [],
  releases: [],
  suppliers: [],
  buyers: [],
  yards: [],
  dictTree: [],

  containersLoading: false,
  shipmentsLoading: false,
  releasesLoading: false,
  suppliersLoading: false,
  buyersLoading: false,
  yardsLoading: false,

  loadContainers: async (params = {}) => {
    set({ containersLoading: true });
    try {
      const res = await getContainerList({ pageNo: 1, pageSize: 500, ...params });
      set({ containers: res.entity?.data ?? [] });
    } catch {
      message.error('加载集装箱列表失败');
    } finally {
      set({ containersLoading: false });
    }
  },

  loadShipments: async (params = {}) => {
    set({ shipmentsLoading: true });
    try {
      const res = await getTrackingList({ pageNo: 1, pageSize: 500, ...params });
      set({ shipments: res.entity?.data ?? [] });
    } catch {
      message.error('加载运踪列表失败');
    } finally {
      set({ shipmentsLoading: false });
    }
  },

  loadReleases: async () => {
    // ReleaseOrder 相关 API 暂未完全迁移，先保留
    set({ releasesLoading: false });
  },

  loadSuppliers: async (params = {}) => {
    set({ suppliersLoading: true });
    try {
      const res = await getSupplierList({ current: 1, size: 500, ...params });
      set({ suppliers: res.entity?.data ?? [] });
    } catch {
      message.error('加载供应商列表失败');
    } finally {
      set({ suppliersLoading: false });
    }
  },

  loadBuyers: async (params = {}) => {
    set({ buyersLoading: true });
    try {
      const res = await getContainerBuyerList({ current: 1, size: 500, ...params });
      set({ buyers: res.entity?.data ?? [] });
    } catch {
      message.error('加载买方列表失败');
    } finally {
      set({ buyersLoading: false });
    }
  },

  loadYards: async (params = {}) => {
    set({ yardsLoading: true });
    try {
      const res = await getYardList({ pageNo: 1, pageSize: 500, ...params });
      set({ yards: res.entity?.data ?? [] });
    } catch {
      message.error('加载堆场列表失败');
    } finally {
      set({ yardsLoading: false });
    }
  },

  loadDictTree: async () => {
    try {
      const res = await getDictById();
      // getDictById 返回拆壳后的响应体 {code, entity}
      set({ dictTree: res?.entity ?? [] });
    } catch {
      message.error('加载字典失败');
    }
  },

  addSupplier: async (data: SupplierForm) => {
    await apiAddSupplier(data);
    message.success('供应商已添加');
    get().loadSuppliers();
  },
  editSupplier: async (data: SupplierForm & { id: string }) => {
    await apiEditSupplier(data);
    message.success('供应商已更新');
    get().loadSuppliers();
  },
  deleteSupplier: async (id) => {
    await apiDeleteSupplier(id);
    message.warning('供应商已删除');
    set((s) => ({ suppliers: s.suppliers.filter((x) => x.id !== id) }));
  },

  addBuyer: async (data: ContainerBuyerForm) => {
    await apiAddBuyer(data);
    message.success('买方已添加');
    get().loadBuyers();
  },
  editBuyer: async (data: ContainerBuyerForm & { id: string }) => {
    await apiEditBuyer(data);
    message.success('买方已更新');
    get().loadBuyers();
  },
  deleteBuyer: async (id) => {
    await apiDeleteBuyer(id);
    message.warning('买方已删除');
    set((s) => ({ buyers: s.buyers.filter((x) => x.id !== id) }));
  },

  addYard: async (data: YardForm) => {
    await apiAddYard(data);
    message.success('堆场已添加');
    get().loadYards();
  },
  editYard: async (data: YardForm & { id: string }) => {
    await apiEditYard(data);
    message.success('堆场已更新');
    get().loadYards();
  },
  deleteYard: async (id) => {
    await apiDeleteYard(id);
    message.warning('堆场已删除');
    set((s) => ({ yards: s.yards.filter((x) => x.id !== id) }));
  },

  deleteContainer: async (id) => {
    await apiDeleteContainer(id);
    message.warning('集装箱已删除');
    set((s) => ({ containers: s.containers.filter((x) => x.id !== id) }));
  },
  deleteTracking: async (id) => {
    await apiDeleteTracking(id);
    message.warning('运踪已删除');
    set((s) => ({ shipments: s.shipments.filter((x) => x.id !== id) }));
  },
}));
