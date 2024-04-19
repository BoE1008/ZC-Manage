import { Project } from "@/types";
import axios from "axios";
import axiosInstance from "./axiosInstance";

export const getProjectsSubmitList = async (
  pageNo: number,
  pageSize: number,
  name?: string,
  projectNum?: string,
  projectDateSort?: string,
  productId?: string,
  projectType?: string,
  projectBrand?: string,
  state?: string,
  customId?: string,
  date?: string
) => {
  const res = await axiosInstance.get("/zc/project/submit/list", {
    params: {
      pageNo,
      pageSize,
      name,
      projectNum,
      projectDateSort,
      productId,
      typeId: projectType,
      brandId: projectBrand,
      state,
      customId,
      projectDate: date,
    },
  });

  return res.data;
};

export const getProjectsApproveList = async (
  pageNo: number,
  pageSize: number,
  name?: string,
  projectNum?: string,
  projectDateSort?: string,
  productId?: string,
  projectType?: string,
  projectBrand?: string,
  state?: string,
  customId?: string,
  date?: string
) => {
  const res = await axiosInstance.get("/zc/project/approve/list", {
    params: {
      pageNo,
      pageSize,
      name,
      projectNum,
      projectDateSort,
      productId,
      typeId: projectType,
      brandId: projectBrand,
      state,
      customId,
      projectDate: date,
    },
  });

  return res.data;
};

export const getProjectType = async () => {
  const res = await axiosInstance.get("/zc/project/type/list");
  return res.data;
};

export const addProject = async (info: Project) => {
  const res = await axiosInstance.post("/zc/project/add", {
    ...info,
  });

  return res.data;
};

export const updateProject = async (id: string, info: Project) => {
  const res = await axiosInstance.post(`/zc/project/update`, {
    id,
    ...info,
  });

  return res.data;
};

export const deleteProject = async (id: string) => {
  const res = await axiosInstance.get(`/zc/project/del`, { params: { id } });
  return res.data;
};

export const getProjectYSList = async (
  projectId: string,
  pageNo: number,
  pageSize: number
) => {
  const res = await axiosInstance.get(`/zc/project/ys/list`, {
    params: {
      projectId,
      pageNo,
      pageSize,
    },
  });

  return res.data;
};

export const addProjectYS = async (info) => {
  const res = await axiosInstance.post(`/zc/project/ys/add`, {
    ...info,
  });

  return res.data;
};

export const updateProjectYS = async (id: string, info) => {
  const res = await axiosInstance.post(`/zc/project/ys/update`, {
    id,
    ...info,
  });

  return res.data;
};

export const addProjectYf = async (info) => {
  const res = await axiosInstance.post(`/zc/project/yf/add`, {
    ...info,
  });

  return res.data;
};

export const updateProjectYf = async (id: string, info) => {
  const res = await axiosInstance.post(`/zc/project/yf/update`, {
    id,
    ...info,
  });

  return res.data;
};

export const exportMyProject = async () => {
  const res = await axios.get(`/zc/project/exportMy`);
  return res.data;
};

export const exportProject = async () => {
  const res = await axios.get(`/zc/project/export`);
  return res.data;
};

export const submitOne = async (projectId: string) => {
  const res = await axiosInstance.post(`/zc/project/submit`, {
    projectId,
  });

  return res.data;
};

export const approveOne = async (projectId: string) => {
  const res = await axiosInstance.post(`/zc/project/approve`, {
    projectId,
  });

  return res.data;
};

export const rejectOne = async (projectId: string, remark: string) => {
  const res = await axiosInstance.post(`/zc/project/reject`, {
    projectId,
    remark,
  });

  return res.data;
};

export const logsOne = async (projectYsfId: string) => {
  const res = await axiosInstance.get(
    `/zc/project/log/list?projectYsfId=${projectYsfId}`
  );

  return res.data;
};

export const getProjectDetailById = async (id) => {
  const res = await axiosInstance.get("/zc/project/detail", { params: { id } });

  return res.data;
};

export const approveYS = async (projectId, projectYsfId) => {
  const res = await axiosInstance.post(`/zc/project/ys/approve`, {
    projectId,
    projectYsfId,
  });

  return res.data;
};

export const rejectYS = async (projectId, projectYsfId, remark) => {
  const res = await axiosInstance.post(`/zc/project/ys/reject`, {
    projectId,
    projectYsfId,
    remark,
  });

  return res.data;
};

export const submitYS = async (projectId, projectYsfId) => {
  const res = await axiosInstance.post(`/zc/project/ys/submit`, {
    projectId,
    projectYsfId,
  });

  return res.data;
};

export const submitYF = async (projectId, projectYsfId) => {
  const res = await axiosInstance.post(`/zc/project/yf/submit`, {
    projectId,
    projectYsfId,
  });

  return res.data;
};

export const approveYF = async (projectId, projectYsfId) => {
  const res = await axiosInstance.post(`/zc/project/yf/approve`, {
    projectId,
    projectYsfId,
  });

  return res.data;
};

export const rejectYF = async (projectId, projectYsfId, remark) => {
  const res = await axiosInstance.post(`/zc/project/yf/reject`, {
    projectId,
    projectYsfId,
    remark,
  });

  return res.data;
};

export const deleteYS = async (id: string, projectId: string) => {
  const res = await axiosInstance.get(`/zc/project/ys/del`, {
    params: { id, projectId },
  });
  return res.data;
};

export const deleteYF = async (id: string, projectId: string) => {
  const res = await axiosInstance.get(`/zc/project/yf/del`, {
    params: { id, projectId },
  });
  return res.data;
};

// /zc/project/yf/status/change
export const updateYFThreeStatus = async (info) => {
  const res = await axiosInstance.post("/zc/project/yf/status/change", info);

  return res.data;
};

export const updateYSThreeStatus = async (info) => {
  const res = await axiosInstance.post("/zc/project/ys/status/change", info);
  return res.data;
};

export const getProjectCWStatic = async () => {
  const res = await axiosInstance.get("/zc/reports/project/bar/income");
  return res.data;
};
