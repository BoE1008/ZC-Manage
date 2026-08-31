/**
 * 还箱令 API
 * base path: /zc/returnOrder
 */
import axiosInstance from "./axiosInstance";
import { ApiResponse } from "@/types";

/** 箱子明细（box 关联字段名待定，按实际返回兼容） */
export interface ReturnOrderBox {
  boxNo?: string;
  containerId?: string;
  returnTime?: string;
  actualYardId?: string;
  actualYardName?: string;
}

/** 还箱令实体 */
export interface ReturnOrder {
  id: string;
  /** 还箱令编号 */
  orderNo?: string;
  /** 还箱类型 customer_return 客户还箱 / rent_return 租箱归还 */
  orderType?: string;
  /** 指定归还堆场ID（关联sys_yard，可不指定） */
  yardId?: string;
  /** 堆场名称（list 接口回填） */
  yardName?: string;
  /** 箱子明细 */
  boxes?: ReturnOrderBox[];
  /** 实际还箱时间 */
  returnTime?: string;
  /** 状态 pending 待还箱 / returned 已还箱 */
  status?: string;
  /** 制单人 */
  maker?: string;
  /** 备注 */
  remark?: string;
  /** 箱数（list 字段） */
  boxCount?: number;
  /** 确认进度（list 字段，如 2/3） */
  confirmProgress?: string;
  createBy?: string;
  createTime?: string;
  updateBy?: string;
  updateTime?: string;
}

/** 列表查询参数 */
export interface ReturnOrderPageQuery {
  pageNo?: number;
  pageSize?: number;
  orderNo?: string;
  status?: string;
  yardId?: string;
  keyword?: string;
}

/** 列表分页结果 */
export interface ReturnOrderListResp {
  data: ReturnOrder[];
  total: number;
  current: number;
  size: number;
  pages: number;
}

// ==================== CRUD ====================

/** 查询还箱令列表 GET /zc/returnOrder/list */
export const getReturnOrderList = async (params: ReturnOrderPageQuery = {}) => {
  const res = await axiosInstance.get<ApiResponse<ReturnOrderListResp>>(
    "/zc/returnOrder/list",
    { params: { pageNo: 1, pageSize: 500, ...params } }
  );
  return res.data;
};

/** 查询还箱令详情 GET /zc/returnOrder/detail?id=xxx */
export const getReturnOrderDetail = async (id: string) => {
  const res = await axiosInstance.get<ApiResponse<ReturnOrder>>(
    "/zc/returnOrder/detail",
    { params: { id } }
  );
  return res.data;
};

/** 生成还箱令（支持批量多箱） POST /zc/returnOrder/add */
export const addReturnOrder = async (data: Partial<ReturnOrder>) => {
  const res = await axiosInstance.post<ApiResponse>("/zc/returnOrder/add", data);
  return res.data;
};

/** 修改还箱令 POST /zc/returnOrder/update */
export const editReturnOrder = async (data: Partial<ReturnOrder> & { id: string }) => {
  const res = await axiosInstance.post<ApiResponse>("/zc/returnOrder/update", data);
  return res.data;
};

/** 删除还箱令 GET /zc/returnOrder/del?id=xxx */
export const deleteReturnOrder = async (id: string) => {
  const res = await axiosInstance.get<ApiResponse>("/zc/returnOrder/del", {
    params: { id },
  });
  return res.data;
};

/** 确认还箱：逐箱记录还箱时间与实际归还堆场 POST /zc/returnOrder/confirm */
export const confirmReturnOrderApi = async (id: string, data: Partial<ReturnOrder>) => {
  const res = await axiosInstance.post<ApiResponse>("/zc/returnOrder/confirm", {
    id,
    ...data,
  });
  return res.data;
};

/** 下载 Word 还箱单 GET /zc/returnOrder/doc?id=xxx （返回 blob） */
export const downloadReturnOrderDoc = async (id: string) => {
  const res = await axiosInstance.get("/zc/returnOrder/doc", {
    params: { id },
    responseType: "blob",
  });
  return res.data;
};
