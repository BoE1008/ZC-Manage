import axiosInstance from "./axiosInstance";

export const getDeptList = async (pageNo: number, pageSize: number) => {
  const res = await axiosInstance.get(`/zc/dept/list`, {
    params: {
      pageNo,
      pageSize,
    },
  });
  return res.data;
};

export const addDept = async (info) => {
  const res = await axiosInstance.post("/zc/dept/add", {
    ...info,
  });

  return res.data;
};

export const updateDept = async (id: string, info) => {
  const res = await axiosInstance.post(`/zc/dept/update`, {
    id,
    ...info,
  });

  return res.data;
};

export const deleteDept = async (id: string) => {
  const res = await axiosInstance.get(`/zc/dept/del`, {
    params: { id },
  });

  return res.data;
};

export const getDeptTree = async () => {
  const res = await axiosInstance.get(`/zc/dept/tree`);
  return res.data;
};
