import axiosInstance from "./axiosInstance";

export const getinvoicingList = async (
  pageNo: number,
  pageSize: number,
  projectName?: string,
  customId?: string,
  state?: string,
  userName?: string,
  projectNum?: string,
  date?: string,
  updateTimeSort?: string
) => {
  const res = await axiosInstance.get(`/zc/invoicing/list`, {
    params: {
      pageNo,
      pageSize,
      projectNum,
      projectName,
      customId,
      state,
      userName,
      // createTime: date,
      updateTimeSort,
    },
  });
  return res.data;
};

export const addInvoicing = async info => {
  const res = await axiosInstance.post("/zc/invoicing/add", info, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

export const addAndSubmitInvoicing = async info => {
  const res = await axiosInstance.post("/zc/invoicing/addSubmit", info, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

export const updateInvoicing = async (id: string, info: Project) => {
  const res = await axiosInstance.post(`/zc/invoicing/update`, {
    id,
    ...info,
  });

  return res.data;
};

export const getinvoicingYWList = async (
  pageNo: number,
  pageSize: number,
  projectName?: string,
  customId?: string,
  state?: string,
  userName?: string,
  projectNum?: string,
  date?: string,
  updateTimeSort?: string
) => {
  const res = await axiosInstance.get(`/zc/invoicing/yw/list`, {
    params: {
      pageNo,
      pageSize,
      projectName,
      customId,
      state,
      userName,
      projectNum,
      // createTime: date,
      updateTimeSort,
    },
  });
  return res.data;
};

export const getinvoicingCWList = async (
  pageNo: number,
  pageSize: number,
  projectName?: string,
  customId?: string,
  state?: string,
  userName?: string,
  projectNum?: string,
  date?: string,
  updateTimeSort?: string
) => {
  const res = await axiosInstance.get(`/zc/invoicing/cw/list`, {
    params: {
      pageNo,
      pageSize,
      projectName,
      customId,
      state,
      userName,
      projectNum,
      // createTime: date,
      updateTimeSort,
    },
  });
  return res.data;
};

export const submitToYw = async (invoicingId: string) => {
  const res = await axiosInstance.post(`/zc/invoicing/submitYW`, {
    invoicingId,
  });

  return res.data;
};

export const submitToCw = async (invoicingId: string) => {
  const res = await axiosInstance.post(`/zc/invoicing/submitCW`, {
    invoicingId,
  });

  return res.data;
};

export const approveOne = async (invoicingId: string) => {
  const res = await axiosInstance.post(`/zc/invoicing/approve`, {
    invoicingId,
  });

  return res.data;
};

export const rejectOne = async (invoicingId: string, remark: string, approveState: number) => {
  const res = await axiosInstance.post(`/zc/invoicing/reject`, {
    invoicingId,
    remark,
    approveState,
  });

  return res.data;
};

export const deleteOne = async (id: string) => {
  const res = await axiosInstance.get(`/zc/invoicing/del`, {
    params: {
      id,
    },
  });
  return res.data;
};

export const logsOne = async (invoicingId: string) => {
  const res = await axiosInstance.get(`/zc/invoicing/log/list?invoicingId=${invoicingId}`);
  return res.data;
};

export const getInvoicingDetailById = async id => {
  const res = await axiosInstance.get("/zc/invoicing/detail", {
    params: { id },
  });

  return res.data;
};

export const getFilesById = async id => {
  const res = await axiosInstance.get("/zc/invoicing/file/list", {
    params: { id },
  });

  return res.data;
};

export const updateFileById = async info => {
  const res = await axiosInstance.post(`/zc/invoicing/file/update`, info, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

export const deleteFileById = async id => {
  const formData = new FormData();
  formData.append("id", id);
  const res = await axiosInstance.post(`/zc/invoicing/file/del`, formData);

  return res.data;
};

export const withDrawInvoicing = async (invoicingId: string) => {
  const res = await axiosInstance.post("/zc/invoicing/withdraw", {
    invoicingId,
  });
  return res.data;
};
