import axiosInstance from "./axiosInstance";

export const getCustomBankList = async (customSupplierId: string) => {
  const res = await axiosInstance.get(`/zc/account/custom/list`, {
    params: {
      customSupplierId,
      pageNo: 1,
      pageSize: 10,
    },
  });

  return res.data;
};

export const addCustomBank = async (customSupplierId: string, info) => {
  const res = await axiosInstance.post(`/zc/account/custom/add`, {
    ...info,
    customSupplierId,
  });

  return res.data;
};

export const updateCustomBank = async (
  customSupplierId: string,
  id: string,
  info
) => {
  const res = await axiosInstance.post(`/zc/account/custom/update`, {
    ...info,
    id,
    customSupplierId,
  });

  return res.data;
};

export const getSupplierBankList = async (customSupplierId: string) => {
  const res = await axiosInstance.get(`/zc/account/supplier/list`, {
    params: {
      customSupplierId,
      pageNo: 1,
      pageSize: 10,
    },
  });

  return res.data;
};

export const addSupplierBank = async (customSupplierId: string, info) => {
  const res = await axiosInstance.post(`/zc/account/supplier/add`, {
    ...info,
    customSupplierId,
  });

  return res.data;
};

export const updateSupplierBank = async (
  customSupplierId: string,
  id: string,
  info
) => {
  const res = await axiosInstance.post(`/zc/account/supplier/update`, {
    ...info,
    id,
    customSupplierId,
  });

  return res.data;
};

export const deleteBank = async (id) => {
  const res = await axiosInstance.get("/zc/account/del", { params: { id } });
  return res.data;
};
