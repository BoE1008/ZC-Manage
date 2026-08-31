/**
 * 堆场 API
 * base path: /zc/yard
 */
import axiosInstance from "./axiosInstance";
import {
  Yard,
  YardForm,
  YardPageQuery,
  PageResult,
  ApiResponse,
} from "@/types";

// ========================
// 堆场 CRUD
// ========================

/**
 * 堆场分页列表
 * GET /zc/yard/list
 */
export const getYardList = async (params: YardPageQuery) => {
  const res = await axiosInstance.get<ApiResponse<PageResult<Yard>>>(
    "/zc/yard/list",
    {
      params,
    },
  );
  return res.data;
};

/**
 * 获取堆场详情
 * GET /zc/yard/detail?id=xxx
 */
export const getYardDetail = async (id: string) => {
  const res = await axiosInstance.get<ApiResponse<Yard>>("/zc/yard/detail", {
    params: { id },
  });
  return res.data;
};

/**
 * 新增堆场
 * POST /zc/yard/add
 */
export const addYard = async (data: YardForm) => {
  const res = await axiosInstance.post<ApiResponse>("/zc/yard/add", data);
  return res.data;
};

/**
 * 编辑堆场
 * POST /zc/yard/update（注意不是 PUT）
 */
export const editYard = async (data: YardForm & { id: string }) => {
  const res = await axiosInstance.post<ApiResponse>("/zc/yard/update", data);
  return res.data;
};

/**
 * 删除堆场
 * GET /zc/yard/del?id=xxx（注意不是 DELETE）
 */
export const deleteYard = async (id: string) => {
  const res = await axiosInstance.get<ApiResponse>("/zc/yard/del", {
    params: { id },
  });
  return res.data;
};

/**
 * 全量堆场列表（下拉用）
 * GET /zc/yard/listAll
 */
export const getAllYards = async () => {
  const res = await axiosInstance.get<ApiResponse<Yard[]>>("/zc/yard/listAll");
  return res.data;
};

// ========================
// 堆场辅助接口
// ========================
