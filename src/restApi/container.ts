/**
 * 集装箱 API
 * base path: /zc/container
 */
import axiosInstance from "./axiosInstance";
import {
  Container,
  ContainerForm,
  ContainerPageQuery,
  PageResult,
  ApiResponse,
} from "@/types";

// ========================
// 集装箱 CRUD
// ========================

/**
 * 集装箱分页列表
 */
export const getContainerList = (params: ContainerPageQuery) =>
  axiosInstance.get<ApiResponse<PageResult<Container>>>("/zc/container/list", {
    params,
  });

/**
 * 获取集装箱详情
 */
export const getContainerDetail = (id: string) =>
  axiosInstance.get<ApiResponse<Container>>(`/zc/container/detail/${id}`);

/**
 * 新增集装箱
 */
export const addContainer = (data: ContainerForm) =>
  axiosInstance.post<ApiResponse>("/zc/container/add", data);

/**
 * 编辑集装箱
 */
export const editContainer = (data: ContainerForm & { id: string }) =>
  axiosInstance.put<ApiResponse>("/zc/container/edit", data);

/**
 * 删除集装箱
 */
export const deleteContainer = (id: string) =>
  axiosInstance.delete<ApiResponse>(`/zc/container/delete/${id}`);

// ========================
// Dashboard 统计
// ========================

/**
 * 集装箱工作台统计（各状态数量）
 */
export const getContainerDashboardStats = () =>
  axiosInstance.get<ApiResponse>("/zc/container/dashboardStats");

// ========================
// 批量操作
// ========================

/**
 * 批量更新集装箱（状态/备注/费用等字段）
 * @param ids 集装箱ID数组
 * @param data 要更新的字段
 */
export const batchUpdateContainer = (ids: string[], data: Partial<Container>) =>
  axiosInstance.post<ApiResponse>("/zc/container/batchUpdate", {
    ids,
    ...data,
  });

/**
 * 批量删除集装箱
 */
export const batchDeleteContainer = (ids: string[]) =>
  axiosInstance.post<ApiResponse>("/zc/container/batchDelete", { ids });
