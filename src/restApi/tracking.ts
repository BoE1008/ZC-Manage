/**
 * 集装箱运踪记录 API
 * base path: /zc/containerTracking
 */
import axiosInstance from "./axiosInstance";
import {
  ContainerTracking,
  ContainerTrackingForm,
  PageResult,
  ApiResponse,
} from "@/types";

// ========================
// 运踪记录 CRUD
// ========================

/**
 * 运踪记录分页列表
 * GET /zc/containerTracking/list
 */
export const getTrackingList = async (params: {
  pageNo?: number;
  pageSize?: number;
  containerNo?: string;
  containerId?: string;
  projectId?: string;
  segment?: string;
  status?: string;
  sendTimeStart?: string;
  sendTimeEnd?: string;
  etaStart?: string;
  etaEnd?: string;
  ataStart?: string;
  ataEnd?: string;
  dropYardId?: string;
  dropTimeStart?: string;
  dropTimeEnd?: string;
  returnTimeStart?: string;
  returnTimeEnd?: string;
  departureStation?: string;
  arrivalStation?: string;
  shipName?: string;
  remark?: string;
  statusRemark?: string;
  returnOrderNo?: string;
  dropSupplierId?: string;
  storageCost?: number;
  storageIncome?: number;
}) => {
  const res = await axiosInstance.get<
    ApiResponse<PageResult<ContainerTracking>>
  >("/zc/containerTracking/list", { params: params });
  return res.data;
};

/**
 * 获取集装箱的全部运踪记录
 * GET /zc/containerTracking/detail?id=containerId
 * 返回该集装箱所有运踪（按创建时间正序）
 */
export const getTrackingDetail = async (containerId: string) => {
  const res = await axiosInstance.get<ApiResponse<ContainerTracking[]>>(
    "/zc/containerTracking/detail",
    { params: { id: containerId } },
  );
  return res.data;
};

/**
 * 新增运踪记录
 * POST /zc/containerTracking/add
 */
export const addTracking = async (data: ContainerTrackingForm) => {
  const res = await axiosInstance.post<ApiResponse>(
    "/zc/containerTracking/add",
    data,
  );
  return res.data;
};

/**
 * 编辑运踪记录
 * POST /zc/containerTracking/update（注意不是 PUT）
 */
export const editTracking = async (
  data: ContainerTrackingForm & { id: string },
) => {
  const res = await axiosInstance.post<ApiResponse>(
    "/zc/containerTracking/update",
    data,
  );
  return res.data;
};

/**
 * 删除运踪记录
 * GET /zc/containerTracking/del?id=xxx（注意不是 DELETE）
 */
export const deleteTracking = async (id: string) => {
  const res = await axiosInstance.delete<ApiResponse>(
    `/zc/containerTracking/del?id=${id}`,
  );
  return res.data;
};
