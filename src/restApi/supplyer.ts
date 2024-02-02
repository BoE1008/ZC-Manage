import { Company } from "@/types";
import axiosInstance from "./axiosInstance";

export const getSuppliersList = async (
  pageNo: number,
  pageSize: number,
  name?: string
) => {
  const res = await axiosInstance.get(`/zc/supplier/list`, {
    params: {
      pageNo,
      pageSize,
      name,
    },
  });

  return res.data;
};

export const addSupplyer = async (info: Company) => {
  const res = await axiosInstance.post(`/zc/supplier/add`, {
    ...info,
  });

  return res.data;
};

export const updateSupplyer = async (id: string, info: Company) => {
  const res = await axiosInstance.post(`/zc/supplier/update`, {
    ...info,
    id,
  });

  return res.data;
};

export const deleteSupplyer = async (id: string) => {
  const res = await axiosInstance.get(`/zc/supplier/del`, {
    params: {
      id,
    },
  });

  return res.data;
};

export const getSuppliersYFList = async (projectId: string) => {
  const res = await axiosInstance.get(
    `/zc/supplier/listYfSupplier?projectId=${projectId}`
  );

  return res.data;
};

export const getSupplierDetailById = async (id) => {
  const res = await axiosInstance.get("/zc/supplier/detail", {
    params: { id },
  });

  return res.data;
};
