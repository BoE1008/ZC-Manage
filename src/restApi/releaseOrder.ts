/**
 * 放箱令 API
 * base path: /zc/release
 */
import axiosInstance from "./axiosInstance";
import {
  ReleaseOrder,
  ReleaseOrderForm,
  ReleaseOrderPageQuery,
  PageResult,
  ApiResponse,
} from "@/types";

// ========================
// 放箱令 CRUD
// ========================

/**
 * 放箱令分页列表
 */
export const getReleaseOrderList = (params: ReleaseOrderPageQuery) =>
  axiosInstance.get<ApiResponse<PageResult<ReleaseOrder>>>(
    "/zc/release/list",
    { params }
  );

/**
 * 获取放箱令详情
 */
export const getReleaseOrderDetail = (id: string) =>
  axiosInstance.get<ApiResponse<ReleaseOrder>>(`/zc/release/detail/${id}`);

/**
 * 新增放箱令
 */
export const addReleaseOrder = (data: ReleaseOrderForm) =>
  axiosInstance.post<ApiResponse>("/zc/release/add", data);

/**
 * 编辑放箱令
 */
export const editReleaseOrder = (data: ReleaseOrderForm & { id: string }) =>
  axiosInstance.put<ApiResponse>("/zc/release/edit", data);

/**
 * 删除放箱令
 */
export const deleteReleaseOrder = (id: string) =>
  axiosInstance.delete<ApiResponse>(`/zc/release/delete/${id}`);

// ========================
// 放箱令状态操作
// ========================

/**
 * 确认客户已提箱（状态 → picked_up）
 * @param id 放箱令ID
 * @param pickupTime 实际提箱时间
 */
export const confirmPickup = (id: string, pickupTime: string) =>
  axiosInstance.post<ApiResponse>("/zc/release/confirmPickup", {
    id,
    pickupTime,
  });

/**
 * 放箱令作废
 */
export const cancelReleaseOrder = (id: string, remark?: string) =>
  axiosInstance.post<ApiResponse>("/zc/release/cancel", { id, remark });

// ========================
// Dashboard 待确认放箱令
// ========================

/**
 * 待确认放箱令统计（状态为 pending 的数量）
 */
export const getPendingReleaseOrderCount = () =>
  axiosInstance.get<ApiResponse<{ count: number }>>(
    "/zc/release/pendingCount"
  );
