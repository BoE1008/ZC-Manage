/**
 * 堆场 API
 * base path: /zc/yard
 */
import axiosInstance from "./axiosInstance";
import { Yard, YardForm, YardPageQuery, PageResult, ApiResponse } from "@/types";

// ========================
// 堆场 CRUD
// ========================

/**
 * 堆场分页列表
 */
export const getYardList = (params: YardPageQuery) =>
  axiosInstance.get<ApiResponse<PageResult<Yard>>>("/zc/yard/list", { params });

/**
 * 获取堆场详情
 */
export const getYardDetail = (id: string) =>
  axiosInstance.get<ApiResponse<Yard>>(`/zc/yard/detail/${id}`);

/**
 * 新增堆场
 */
export const addYard = (data: YardForm) =>
  axiosInstance.post<ApiResponse>("/zc/yard/add", data);

/**
 * 编辑堆场
 */
export const editYard = (data: YardForm & { id: string }) =>
  axiosInstance.put<ApiResponse>("/zc/yard/edit", data);

/**
 * 删除堆场
 */
export const deleteYard = (id: string) =>
  axiosInstance.delete<ApiResponse>(`/zc/yard/delete/${id}`);

// ========================
// 堆场辅助接口
// ========================

/**
 * 获取所有堆场（下拉框用，不分页）
 */
export const getAllYards = () =>
  axiosInstance.get<ApiResponse<Yard[]>>("/zc/yard/all");
