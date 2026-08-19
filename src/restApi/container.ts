import axiosInstance from "./axiosInstance";
import { Container } from "@/types";

//集装箱工作台状态
export const getContainerDashboardStatus = async () => {
  const res = await axiosInstance.get("/zc/container/dashboardStats");
  return res.data;
};

//集装箱列表
export const getContainerList = async (pageNo: number, pageSize: number) => {
  const res = await axiosInstance.get("/zc/container/list", {
    params: {
      pageNo,
      pageSize,
    },
  });
  return res.data;
};

//新增单个集装箱
export const addContainer = async (container: Container) => {
  const res = await axiosInstance.post("/zc/container/add", {
    params: container,
  });
  return res.data;
};

//编辑单个集装箱
export const editContainer = async (container: Container) => {
  const res = await axiosInstance.put("/zc/container/edit", {
    params: container,
  });
  return res.data;
};

//删除单个集装箱
export const deleteContainer = async (id: string) => {
  const res = await axiosInstance.delete(`/zc/container/delete/${id}`);
  return res.data;
};

//获取单个集装箱详情
export const getContainerDetail = async (id: string) => {
  const res = await axiosInstance.get(`/zc/container/detail/${id}`);
  return res.data;
};
