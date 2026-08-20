/**
 * 集装箱供应商 API
 * base path: /zc/supplier
 */
import axiosInstance from "./axiosInstance";
import { PageResult, ApiResponse } from "@/types";

// ========================
// 供应商数据模型（后端定义）
// ========================

export interface Supplier {
  id: string;
  name: string;
  contactsName?: string;
  contactsMobile?: string;
  city?: string;
  address?: string;
  bank?: string;
  bankCard?: string;
  taxationNumber?: string;
  moneyType?: string;
  remark?: string;
  createBy?: string;
  createTime?: string;
  updateBy?: string;
  updateTime?: string;
}

export type SupplierForm = Omit<
  Supplier,
  "id" | "createBy" | "createTime" | "updateBy" | "updateTime"
>;

// ========================
// 供应商 CRUD
// ========================

/**
 * 供应商分页列表
 * GET /zc/supplier/list
 */
export const getSupplierList = async (params: {
  pageNo?: number;
  pageSize?: number;
  current?: number;
  size?: number;
  name?: string;
  city?: string;
  address?: string;
  contactsName?: string;
  contactsMobile?: string;
  bank?: string;
  bankCard?: string;
  taxationNumber?: string;
  moneyType?: string;
}) => {
  const res = await axiosInstance.get<ApiResponse<PageResult<Supplier>>>(
    "/zc/supplier/list",
    { params },
  );
  return res.data;
};

/**
 * 获取供应商详情
 * GET /zc/supplier/detail?id=xxx
 */
export const getSupplierDetail = async (id: string) => {
  const res = await axiosInstance.get<ApiResponse<Supplier>>("/zc/supplier/detail", {
    params: { id },
  });
  return res.data;
};

/**
 * 新增供应商
 * POST /zc/supplier/add
 */
export const addSupplier = async (data: SupplierForm) => {
  const res = await axiosInstance.post<ApiResponse>("/zc/supplier/add", data);
  return res.data;
};

/**
 * 编辑供应商
 * POST /zc/supplier/update（注意不是 PUT）
 */
export const editSupplier = async (data: SupplierForm & { id: string }) => {
  const res = await axiosInstance.post<ApiResponse>("/zc/supplier/update", data);
  return res.data;
};

/**
 * 删除供应商
 * GET /zc/supplier/del?id=xxx（注意不是 DELETE）
 */
export const deleteSupplier = async (id: string) => {
  const res = await axiosInstance.delete<ApiResponse>("/zc/supplier/del", {
    params: { id },
  });
  return res.data;
};

// ========================
// 供应商辅助接口
// ========================

/**
 * 获取所有供应商（下拉框用，不分页）
 * GET /zc/supplier/all
 */
export const getAllSuppliers = async () => {
  const res = await axiosInstance.get<ApiResponse<Supplier[]>>("/zc/supplier/all");
  return res.data;
};

/**
 * 按项目获取供应商（运费结算用）
 * GET /zc/supplier/listYfSupplier?projectId=xxx
 */
export const listYfSupplier = async (projectId: string) => {
  const res = await axiosInstance.get<ApiResponse<Supplier[]>>(
    "/zc/supplier/listYfSupplier",
    { params: { projectId } },
  );
  return res.data;
};
