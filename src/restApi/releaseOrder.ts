/**
 * 放箱令 API
 * base path: /zc/releaseOrder
 */
import axiosInstance from "./axiosInstance";
import { PageResult, ApiResponse } from "@/types";

// ========================
// 放箱令数据模型（后端定义）
// ========================

export interface ReleaseOrder {
  id?: string;
  orderNo?: string; // 放箱令编号
  orderType?: string; // 放箱令类型
  containerId?: string; // 集装箱ID
  containerNo?: string; // 集装箱编号
  buyerId?: string; // 买方/租方客户ID
  buyerName?: string; // 买方/租方名称
  yardId?: string; // 放箱堆场ID
  yardName?: string; // 放箱堆场名称
  pickupTime?: string; // 客户提箱时间
  income?: number; // 放箱收入
  status?: string; // 状态
  remark?: string; // 备注
  createBy?: string;
  createTime?: string;
  updateBy?: string;
  updateTime?: string;
}

export type ReleaseOrderForm = Omit<
  ReleaseOrder,
  "id" | "createBy" | "createTime" | "updateBy" | "updateTime"
>;

// ========================
// 放箱令 CRUD
// ========================

/**
 * 放箱令分页列表
 * GET /zc/releaseOrder/list
 */
export const getReleaseOrderList = async (params: {
  pageNo?: number;
  pageSize?: number;
  current?: number;
  size?: number;
  id?: string;
  orderNo?: string;
  orderType?: string;
  containerId?: string;
  containerNo?: string;
  buyerId?: string;
  buyerName?: string;
  yardId?: string;
  yardName?: string;
  pickupTime?: string;
  income?: number;
  status?: string;
  remark?: string;
}) => {
  const res = await axiosInstance.get<ApiResponse<PageResult<ReleaseOrder>>>(
    "/zc/releaseOrder/list",
    { params },
  );
  return res.data;
};

/**
 * 获取放箱令详情
 * GET /zc/releaseOrder/detail?id=xxx
 */
export const getReleaseOrderDetail = async (id: string) => {
  const res = await axiosInstance.get<ApiResponse<ReleaseOrder>>(
    "/zc/releaseOrder/detail",
    { params: { id } },
  );
  return res.data;
};

/**
 * 新增放箱令
 * POST /zc/releaseOrder/add
 */
export const addReleaseOrder = async (data: ReleaseOrderForm) => {
  const res = await axiosInstance.post<ApiResponse>(
    "/zc/releaseOrder/add",
    data,
  );
  return res.data;
};

/**
 * 编辑放箱令
 * POST /zc/releaseOrder/update
 */
export const editReleaseOrder = async (
  data: ReleaseOrderForm & { id: string },
) => {
  const res = await axiosInstance.post<ApiResponse>(
    "/zc/releaseOrder/update",
    data,
  );
  return res.data;
};

/**
 * 删除放箱令
 * GET /zc/releaseOrder/del?id=xxx（注意不是 DELETE）
 */
export const deleteReleaseOrder = async (id: string) => {
  const res = await axiosInstance.get<ApiResponse>("/zc/releaseOrder/del", {
    params: { id },
  });
  return res.data;
};
