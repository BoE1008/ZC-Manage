import axiosInstance from "./axiosInstance";

export const getExchangeRateList = async (
  date: string,
  pageNo: number,
  pageSize: number
) => {
  const res = await axiosInstance.get(`/zc/exchangeRate/list`, {
    params: {
      date,
      pageNo,
      pageSize,
    },
  });
  return res.data;
};

export const addExchangeRate = async (info) => {
  const res = await axiosInstance.post("/zc/exchangeRate/add", {
    ...info,
  });

  return res.data;
};

export const updateExchangeRate = async (id: string, info) => {
  const res = await axiosInstance.post(`/zc/exchangeRate/update`, {
    id,
    ...info,
  });

  return res.data;
};

export const deleteExchangeRate = async (id) => {
  const res = await axiosInstance.get(`/zc/exchangeRate/del`, {
    params: { id },
  });

  return res.data;
};
