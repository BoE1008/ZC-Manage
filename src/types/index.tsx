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
  Submit,
  Approve,
  CW,
  OTHERS
}

enum DictRecord {}
