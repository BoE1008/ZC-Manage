import axiosInstance from "./axiosInstance";

export const getLogs = async (
  pageNo: number,
  pageSize: number,
  userName?: string
) => {
  const res = await axiosInstance.get(
    `/zc/log/list?pageNo=${pageNo}&pageSize=${pageSize}&userName=${userName}`
  );
  return res.data;
};
