export interface Company {
  name: string;
  address?: string;
  contactsName?: string;
  contactsMobile?: string;
  remark?: string;
}

export enum Operation {
  Add,
  Edit,
}

export interface Project {
  name: string;
  num: string;
  date: string;
}

export interface User {
  email: string;
  id?: string;
  loginName: string;
  mobile: string;
  password?: string;
  sex?: string;
  status?: string;
  userName: string;
}

export enum ModalType {
  Submit, //项目管理中项目填报
  Approve, //项目管理中业务审核
  CW, //项目管理中财务审核
  PAYMENTCW, //付款管理下财务审核
  OTHERS, // 其他管理模块
}

export enum InvoicingType {
  NORMAL = "普票",
  SPECIAL = "专票",
}

export enum PaymentOthersType {
  ZH = "ZH",
  ESW = "ESW",
  FESW = "FESW",
}
