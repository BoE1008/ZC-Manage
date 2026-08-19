/**
 * 集装箱买方/租方 API
 * base path: /zc/container/buyer
 * 注：买方ID 关联 sys_container.buyer_id / sys_release_order.buyer_id
 */
import axiosInstance from "./axiosInstance";
import { PageResult, ApiResponse } from "@/types";

// ========================
// 买方数据结构（推断自 Container.buyerId / ReleaseOrder.buyerId 关联）
// ========================

export interface ContainerBuyer {
  /** 主键ID */
  id: string;
  /** 客户名称 */
  name: string;
  /** 买方 / 租方 */
  type: "买方" | "租方";
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

export interface ContainerBuyerForm
  extends Omit<
    ContainerBuyer,
    "id" | "createBy" | "createTime" | "updateBy" | "updateTime"
  > {}

export interface ContainerBuyerPageQuery {
  current?: number;
  size?: number;
  /** 客户名称（模糊匹配） */
  name?: string;
  /** 所在城市 */
  city?: string;
}

// ========================
// 买方 CRUD
// ========================

/**
 * 买方分页列表
 */
export const getContainerBuyerList = (params: ContainerBuyerPageQuery) =>
  axiosInstance.get<ApiResponse<PageResult<ContainerBuyer>>>(
    "/zc/container/buyer/list",
    { params }
  );

/**
 * 获取买方详情
 */
export const getContainerBuyerDetail = (id: string) =>
  axiosInstance.get<ApiResponse<ContainerBuyer>>(
    `/zc/container/buyer/detail/${id}`
  );

/**
 * 新增买方
 */
export const addContainerBuyer = (data: ContainerBuyerForm) =>
  axiosInstance.post<ApiResponse>("/zc/container/buyer/add", data);

/**
 * 编辑买方
 */
export const editContainerBuyer = (data: ContainerBuyerForm & { id: string }) =>
  axiosInstance.put<ApiResponse>("/zc/container/buyer/edit", data);

/**
 * 删除买方
 */
export const deleteContainerBuyer = (id: string) =>
  axiosInstance.delete<ApiResponse>(`/zc/container/buyer/delete/${id}`);

// ========================
// 买方辅助接口
// ========================

/**
 * 获取所有买方（下拉框用，不分页）
 */
export const getAllContainerBuyers = () =>
  axiosInstance.get<ApiResponse<ContainerBuyer[]>>(
    "/zc/container/buyer/all"
  );
