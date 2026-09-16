/**
 * 提箱令 API
 * base path: /zc/pickupOrder
 */
import axiosInstance from "./axiosInstance";
import { PageResult, ApiResponse } from "@/types";

// ========================
// 提箱令数据模型
// ========================

export interface PickupOrder {
  id?: string;
  orderNo?: string; // 提箱令编号
  orderType?: string; // 提箱令类型
  containerId?: string; // 集装箱ID
  containerNo?: string; // 集装箱编号
  buyerId?: string; // 买方/租方客户ID
  buyerName?: string; // 买方/租方名称
  yardId?: string; // 提箱堆场ID
  yardName?: string; // 提箱堆场名称
  pickupTime?: string; // 客户提箱时间
  income?: number; // 提箱收入
  deadlineStart?: string; // 指令期限 起始日期
  deadlineEnd?: string; // 指令期限 截止日期
  status?: string; // 状态
  remark?: string; // 备注
  createBy?: string;
  createTime?: string;
  updateBy?: string;
  updateTime?: string;
}

export type PickupOrderForm = Omit<
  PickupOrder,
  "id" | "createBy" | "createTime" | "updateBy" | "updateTime"
>;

// ========================
// 提箱令 CRUD
// ========================

/**
 * 提箱令分页列表
 * GET /zc/pickupOrder/list
 */
export const getPickupOrderList = async (params: {
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
  const res = await axiosInstance.get<ApiResponse<PageResult<PickupOrder>>>(
    "/zc/pickupOrder/list",
    { params },
  );
  return res.data;
};

/**
 * 获取提箱令详情
 * GET /zc/pickupOrder/detail?id=xxx
 */
export const getPickupOrderDetail = async (id: string) => {
  const res = await axiosInstance.get<ApiResponse<PickupOrder>>(
    "/zc/pickupOrder/detail",
    { params: { id } },
  );
  return res.data;
};

/**
 * 新增提箱令
 * POST /zc/pickupOrder/add
 */
export const addPickupOrder = async (data: PickupOrderForm) => {
  const res = await axiosInstance.post<ApiResponse>(
    "/zc/pickupOrder/add",
    data,
  );
  return res.data;
};

/**
 * 编辑提箱令
 * POST /zc/pickupOrder/update
 */
export const editPickupOrder = async (
  data: PickupOrderForm & { id: string },
) => {
  const res = await axiosInstance.post<ApiResponse>(
    "/zc/pickupOrder/update",
    data,
  );
  return res.data;
};

/**
 * 删除提箱令
 * GET /zc/pickupOrder/del?id=xxx
 */
export const deletePickupOrder = async (id: string) => {
  const res = await axiosInstance.get<ApiResponse>("/zc/pickupOrder/del", {
    params: { id },
  });
  return res.data;
};

/**
 * 下载提箱令 Word 提箱单
 * GET /zc/pickupOrder/doc?id=xxx
 */
export const downloadPickupOrderDoc = async (id: string) => {
  const res = await axiosInstance.get("/zc/pickupOrder/doc", {
    params: { id },
    responseType: "blob",
  });
  return res;
};

/**
 * 批量导入提箱令（Excel）
 * POST /zc/pickupOrder/import
 * 表单字段 file
 */
export const importPickupOrder = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await axiosInstance.post<ApiResponse>(
    "/zc/pickupOrder/import",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return res.data;
};
