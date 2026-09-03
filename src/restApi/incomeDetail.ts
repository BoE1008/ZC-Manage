/**
 * 集装箱-收入明细 API
 * base path: /zc/container/incomeDetail
 * 表：sys_container_income_detail
 */
import axiosInstance from "./axiosInstance";
import { ApiResponse } from "@/types";

/** 收入明细 实体 */
export interface ContainerIncomeDetail {
  id: string;
  /** 集装箱ID */
  containerId?: string;
  /** 箱号（冗余） */
  containerNo?: string;
  /** 明细名称（超期堆存费/放箱收入/堆存收入/改单费等） */
  itemName?: string;
  /** 金额（美元） */
  amount?: number;
  /** 币种 USD */
  currency?: string;
  /** 费用发生日期 */
  occurDate?: string;
  /** 来源类型：manual 手工录入 / overdue 动态超期累计 */
  sourceType?: string;
  /** 备注 */
  remark?: string;
  createBy?: string;
  createTime?: string;
  updateBy?: string;
  updateTime?: string;
}

// ==================== CRUD ====================

/** 查询某集装箱的收入明细列表 GET /zc/container/incomeDetail/list?containerId=xxx */
export const getIncomeDetailList = async (containerId: string) => {
  const res = await axiosInstance.get<ApiResponse<ContainerIncomeDetail[]>>(
    "/zc/container/incomeDetail/list",
    { params: { containerId } },
  );
  return res.data;
};

/** 新增收入明细 POST /zc/container/incomeDetail/add */
export const addIncomeDetail = async (
  data: Partial<ContainerIncomeDetail>,
) => {
  const res = await axiosInstance.post<ApiResponse>(
    "/zc/container/incomeDetail/add",
    data,
  );
  return res.data;
};

/** 修改收入明细 POST /zc/container/incomeDetail/update */
export const editIncomeDetail = async (
  data: Partial<ContainerIncomeDetail> & { id: string },
) => {
  const res = await axiosInstance.post<ApiResponse>(
    "/zc/container/incomeDetail/update",
    data,
  );
  return res.data;
};

/** 删除收入明细 GET /zc/container/incomeDetail/del?id=xxx */
export const deleteIncomeDetail = async (id: string) => {
  const res = await axiosInstance.get<ApiResponse>(
    "/zc/container/incomeDetail/del",
    { params: { id } },
  );
  return res.data;
};