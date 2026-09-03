/**
 * 集装箱-成本明细 API
 * base path: /zc/container/costDetail
 * 表：sys_container_cost_detail
 */
import axiosInstance from "./axiosInstance";
import { ApiResponse } from "@/types";

/** 成本明细 实体 */
export interface ContainerCostDetail {
  id: string;
  /** 集装箱ID（关联sys_container） */
  containerId?: string;
  /** 箱号（冗余） */
  containerNo?: string;
  /** 明细名称（提箱费/堆存费/吊装费/改单费等） */
  itemName?: string;
  /** 金额（美元） */
  amount?: number;
  /** 币种 USD */
  currency?: string;
  /** 费用发生日期 */
  occurDate?: string;
  /** 备注 */
  remark?: string;
  createBy?: string;
  createTime?: string;
  updateBy?: string;
  updateTime?: string;
}

// ==================== CRUD ====================

/** 查询某集装箱的成本明细列表 GET /zc/container/costDetail/list?containerId=xxx */
export const getCostDetailList = async (containerId: string) => {
  const res = await axiosInstance.get<ApiResponse<ContainerCostDetail[]>>(
    "/zc/container/costDetail/list",
    { params: { containerId } },
  );
  return res.data;
};

/** 新增成本明细 POST /zc/container/costDetail/add */
export const addCostDetail = async (
  data: Partial<ContainerCostDetail>,
) => {
  const res = await axiosInstance.post<ApiResponse>(
    "/zc/container/costDetail/add",
    data,
  );
  return res.data;
};

/** 修改成本明细 POST /zc/container/costDetail/update */
export const editCostDetail = async (
  data: Partial<ContainerCostDetail> & { id: string },
) => {
  const res = await axiosInstance.post<ApiResponse>(
    "/zc/container/costDetail/update",
    data,
  );
  return res.data;
};

/** 删除成本明细 GET /zc/container/costDetail/del?id=xxx */
export const deleteCostDetail = async (id: string) => {
  const res = await axiosInstance.get<ApiResponse>(
    "/zc/container/costDetail/del",
    { params: { id } },
  );
  return res.data;
};