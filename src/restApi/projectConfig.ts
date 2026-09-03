/**
 * 项目-集装箱配置 API
 * base path: /zc/projectContainerConfig
 * 表：sys_project_container_config
 *
 * Swagger 接口（用户提供截图）：
 * - POST /zc/projectContainerConfig/save          保存配置（新增/编辑统一入口，带 id 即编辑，否则新增）
 * - GET  /zc/projectContainerConfig/getByProjectId?projectId=xxx  按项目ID获取配置
 */
import axiosInstance from "./axiosInstance";
import { ApiResponse } from "@/types";

/** 项目-集装箱配置 实体 */
export interface ProjectContainerConfig {
  id?: string;
  /** 项目ID（关联sys_project） */
  projectId?: string;
  /** 项目名称（冗余） */
  projectName?: string;
  /** 项目编号（关联回显用） */
  projectNum?: string;
  /** 堆存超期提醒天数：超过 ata + 该天数则待办提醒 */
  overdueAlertDays?: number;
  /** 到站提醒天数：eta - 当前时间 <= 该天数 则提醒快到站 */
  etaAlertDays?: number;
  /** 到站后免费天数（到达ata起算，超过该天数才计超期费） */
  arrivalOverdueDays?: number;
  /** 超期单价：超出免费期后每天每柜美元（默认 10 美金/天/柜） */
  arrivalOverdueUnitPrice?: number;
  /** 备注 */
  remark?: string;
  createBy?: string;
  createTime?: string;
  updateBy?: string;
  updateTime?: string;
}

/** 列表查询参数 */
export interface ProjectConfigPageQuery {
  pageNo?: number;
  pageSize?: number;
  projectId?: string;
  projectNum?: string;
  keyword?: string;
}

/** 列表分页结果 */
export interface ProjectConfigListResp {
  data: ProjectContainerConfig[];
  total: number;
  current: number;
  size: number;
  pages: number;
}

// ==================== CRUD ====================

/** 查询配置列表 GET /zc/projectContainerConfig/list */
export const getProjectConfigList = async (
  params: ProjectConfigPageQuery = {},
) => {
  const res = await axiosInstance.get<ApiResponse<ProjectConfigListResp>>(
    "/zc/projectContainerConfig/list",
    { params: { pageNo: 1, pageSize: 500, ...params } },
  );
  return res.data;
};

/** 按项目ID获取配置 GET /zc/projectContainerConfig/getByProjectId?projectId=xxx */
export const getProjectConfigByProjectId = async (projectId: string) => {
  const res = await axiosInstance.get<ApiResponse<ProjectContainerConfig>>(
    "/zc/projectContainerConfig/getByProjectId",
    { params: { projectId } },
  );
  return res.data;
};

/**
 * 保存配置（新增/编辑统一入口）
 * POST /zc/projectContainerConfig/save
 * body: 完整实体，id 为空字符串或缺省时新增，带 id 则编辑
 */
export const saveProjectConfig = async (
  data: Partial<ProjectContainerConfig>,
) => {
  const res = await axiosInstance.post<ApiResponse>(
    "/zc/projectContainerConfig/save",
    data,
  );
  return res.data;
};

/** 删除配置 GET /zc/projectContainerConfig/del?id=xxx */
export const deleteProjectConfig = async (id: string) => {
  const res = await axiosInstance.get<ApiResponse>(
    "/zc/projectContainerConfig/del",
    { params: { id } },
  );
  return res.data;
};