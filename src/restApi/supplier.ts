/**
 * 供应商/卖方 API
 * base path: /zc/supplier
 * 注：供应商ID 关联 sys_container.supplier_id
 */
import axiosInstance from "./axiosInstance";
import { PageResult, ApiResponse } from "@/types";

// ========================
// 供应商数据结构（推断自 Container.supplierId 关联）
// ========================

export interface Supplier {
  /** 主键ID */
  id: string;
  /** 供应商名称 */
  name: string;
  /** 联系人 */
  contactsName?: string;
  /** 联系人电话 */
  contactsMobile?: string;
  /** 所在城市 */
  city?: string;
  /** 地址 */
  address?: string;
  /** 备注 */
  remark?: string;
  /** 创建人 */
  createBy?: string;
  /** 创建时间 */
  createTime?: string;
  /** 修改人 */
  updateBy?: string;
  /** 修改时间 */
  updateTime?: string;
}

export interface SupplierForm
  extends Omit<
    Supplier,
    "id" | "createBy" | "createTime" | "updateBy" | "updateTime"
  > {}

export interface SupplierPageQuery {
  current?: number;
  size?: number;
  /** 供应商名称（模糊匹配） */
  name?: string;
  /** 所在城市 */
  city?: string;
}

// ========================
// 供应商 CRUD
// ========================

/**
 * 供应商分页列表
 */
export const getSupplierList = (params: SupplierPageQuery) =>
  axiosInstance.get<ApiResponse<PageResult<Supplier>>>("/zc/supplier/list", {
    params,
  });

/**
 * 获取供应商详情
 */
export const getSupplierDetail = (id: string) =>
  axiosInstance.get<ApiResponse<Supplier>>(`/zc/supplier/detail/${id}`);

/**
 * 新增供应商
 */
export const addSupplier = (data: SupplierForm) =>
  axiosInstance.post<ApiResponse>("/zc/supplier/add", data);

/**
 * 编辑供应商
 */
export const editSupplier = (data: SupplierForm & { id: string }) =>
  axiosInstance.put<ApiResponse>("/zc/supplier/edit", data);

/**
 * 删除供应商
 */
export const deleteSupplier = (id: string) =>
  axiosInstance.delete<ApiResponse>(`/zc/supplier/delete/${id}`);

// ========================
// 供应商辅助接口
// ========================

/**
 * 获取所有供应商（下拉框用，不分页）
 */
export const getAllSuppliers = () =>
  axiosInstance.get<ApiResponse<Supplier[]>>("/zc/supplier/all");
