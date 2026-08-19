/**
 * 集装箱运踪记录 API
 * base path: /zc/tracking
 */
import axiosInstance from "./axiosInstance";
import {
  ContainerTracking,
  ContainerTrackingForm,
  ContainerTrackingPageQuery,
  PageResult,
  ApiResponse,
} from "@/types";

// ========================
// 运踪记录 CRUD
// ========================

/**
 * 运踪记录分页列表
 */
export const getTrackingList = (params: ContainerTrackingPageQuery) =>
  axiosInstance.get<ApiResponse<PageResult<ContainerTracking>>>(
    "/zc/tracking/list",
    { params }
  );

/**
 * 获取运踪记录详情
 */
export const getTrackingDetail = (id: string) =>
  axiosInstance.get<ApiResponse<ContainerTracking>>(
    `/zc/tracking/detail/${id}`
  );

/**
 * 新增运踪记录
 */
export const addTracking = (data: ContainerTrackingForm) =>
  axiosInstance.post<ApiResponse>("/zc/tracking/add", data);

/**
 * 编辑运踪记录
 */
export const editTracking = (data: ContainerTrackingForm & { id: string }) =>
  axiosInstance.put<ApiResponse>("/zc/tracking/edit", data);

/**
 * 删除运踪记录
 */
export const deleteTracking = (id: string) =>
  axiosInstance.delete<ApiResponse>(`/zc/tracking/delete/${id}`);

/**
 * 根据箱号获取运踪记录列表
 */
export const getTrackingByContainerNo = (containerNo: string) =>
  axiosInstance.get<ApiResponse<ContainerTracking[]>>(
    "/zc/tracking/listByContainer",
    { params: { containerNo } }
  );
