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
 * GET /zc/container/list
 */
export const getContainerList = async (params: ContainerPageQuery) => {
  const res = await axiosInstance.get<ApiResponse<PageResult<Container>>>(
    "/zc/container/list",
    { params },
  );
  return res.data;
};

/**
 * 获取集装箱详情
 * GET /zc/container/detail?id=xxx
 */
export const getContainerDetail = async (id: string) => {
  const res = await axiosInstance.get<ApiResponse<Container>>(
    "/zc/container/detail",
    { params: { id } },
  );
  return res.data;
};

/**
 * 新增集装箱
 * POST /zc/container/add
 */
export const addContainer = async (data: ContainerForm) => {
  const res = await axiosInstance.post<ApiResponse>("/zc/container/add", data);
  return res.data;
};

/**
 * 编辑集装箱
 * POST /zc/container/update（注意不是 PUT）
 */
export const editContainer = async (data: ContainerForm & { id: string }) => {
  const res = await axiosInstance.post<ApiResponse>(
    "/zc/container/update",
    data,
  );
  return res.data;
};

/**
 * 删除集装箱
 * GET /zc/container/del?id=xxx（注意不是 DELETE）
 */
export const deleteContainer = async (id: string) => {
  const res = await axiosInstance.get<ApiResponse>("/zc/container/del", {
    params: { id },
  });
  return res.data;
};

// ========================
// Dashboard 统计
// ========================

/**
 * 集装箱工作台（各状态数量）
 * GET /zc/container/dashboardStats
 */
export const getContainerDashboardStats = async () => {
  const res = await axiosInstance.get<ApiResponse>(
    "/zc/container/dashboardStats",
  );
  return res.data;
};

/**
 * 集装箱报表统计（各状态数量）
 * GET /zc/container/reportStats
 */
export const getContainerReportStats = async () => {
  const res = await axiosInstance.get<ApiResponse>("/zc/container/reportStats");
  return res.data;
};

/**
 * 工作台待办统计
 * GET /zc/container/todoStats（无参数）
 * 返回：Record<string, number>，键如 pendingReleaseCount/overdueStorageCount/inTransitCount/etaAlertCount 等
 */
export const getContainerTodoStats = async () => {
  const res = await axiosInstance.get<ApiResponse>("/zc/container/todoStats");
  return res.data;
};

// ========================
// 批量操作
// ========================

/**
 * 批量更新集装箱（状态/备注/发运时间/ETA）
 * POST /zc/container/batchUpdate
 * 注意：status/statusRemark/sendTime/eta 为 query 参数，containerIds 数组
 */
export const batchUpdateContainer = async (
  containerIds: string[],
  data: {
    status?: string;
    statusRemark?: string;
    sendTime?: string;
    eta?: string;
  },
) => {
  const res = await axiosInstance.post<ApiResponse>(
    "/zc/container/batchUpdate",
    null,
    {
      params: { containerIds, ...data },
    },
  );
  return res.data;
};

/**
 * 绑定临时箱号
 * POST /zc/container/bindContainerNo
 */
export const bindContainerNo = async (id: string, containerNo: string) => {
  const res = await axiosInstance.post<ApiResponse>(
    "/zc/container/bindContainerNo",
    null,
    {
      params: { id, containerNo },
    },
  );
  return res.data;
};
