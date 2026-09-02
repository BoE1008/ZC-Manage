// ============================================================
// 容器字典枚举与展示映射（与后端 sys_dict_type.code / sys_dict_data.dict_value 对齐）
// 来源 SQL：container_type / container_cond / container_usage / container_status
// ============================================================

// ========================
// 1. 字典 code 与 value 枚举
// ========================

/** 箱型字典类型编码（后端 sys_dict_type.code） */
export type ContainerTypeCode = "container_type";

/** 箱况字典类型编码 */
export type ContainerCondCode = "container_cond";

/** 使用情况字典类型编码 */
export type ContainerUsageCode = "container_usage";

/** 集装箱状态字典类型编码 */
export type ContainerStatusCode = "container_status";

/** 箱型枚举值（container_type.sys_dict_data.dict_value） */
export type ContainerTypeValue =
  | "20GP"
  | "40GP"
  | "40HQ"
  | "45HQ"
  | string;

/** 箱况枚举值（container_cond.sys_dict_data.dict_value） */
export type ContainerCondValue =
  | "new"
  | "sub_new"
  | "cargo_worthy"
  | string;

/** 使用情况枚举值（container_usage.sys_dict_data.dict_value） */
export type ContainerUsageValue = "purchase" | "long_rental" | string;

/** 集装箱状态枚举值（container_status.sys_dict_data.dict_value） */
export type ContainerStatusValue =
  | "domestic_storage"
  | "outbound"
  | "overseas_storage"
  | "sold"
  | "inbound"
  | string;

/** 4 个容器字典 code 集合 */
export type ContainerDictCode =
  | ContainerTypeCode
  | ContainerCondCode
  | ContainerUsageCode
  | ContainerStatusCode;

/** 运踪运输段（去程 outbound / 回程 inbound） */
export type TrackingSegmentValue = "outbound" | "inbound" | string;

/** 放箱类型（sale 卖出 / return 回程 / rent 租给客户） */
export type OrderTypeValue = "sale" | "return" | "rent" | string;

/** 放箱令状态（pending 待提箱 / picked_up 已提箱） */
export type ReleaseStatusValue =
  | "pending"
  | "picked_up"
  | "released"
  | "cancelled"
  | string;

/** 放箱方式（designated 指定箱号 / undesignated 不指定箱号） */
export type ReleaseMethodValue =
  | "designated"
  | "undesignated"
  | string;

/** 卖方/供应商类型（seller 卖方 / rental_provider 出租方 / yard 堆场） */
export type SupplierTypeValue =
  | "seller"
  | "rental_provider"
  | "yard"
  | string;

/** 买方/客户类型（buyer 买方 / rental 租方） */
export type BuyerTypeValue = "buyer" | "rental" | string;

// ========================
// 2. 字典数据结构
// ========================

/** 字典项通用结构（来自 sys_dict_data 表） */
export interface DictItem {
  id?: string;
  dictTypeId?: string;
  /** SQL dict_value 字段，对应枚举值 */
  dictValue: string;
  /** SQL dict_label 字段，对应中文标签 */
  dictLabel: string;
  /** SQL dict_sort 字段 */
  dictSort?: number;
  /** SQL status 字段（0 正常 / 1 停用） */
  status?: string;
  remark?: string;
  createBy?: string;
  createTime?: string;
  updateBy?: string;
  updateTime?: string;
}

/** Select 通用 Option 结构（{label, value}） */
export interface DictOption {
  label: string;
  value: string;
}

// ========================
// 3. Badge 展示元数据
// ========================

/** Badge 展示元数据：label 显示文本 + cls Tailwind 样式类 */
export interface DictBadgeMeta {
  label: string;
  cls: string;
}

/** 展示映射通用类型：value → BadgeMeta */
export type DictBadgeMap = Record<string, DictBadgeMeta>;

// ========================
// 4. 容器相关展示映射（前端硬编码兜底，对齐后端字典）
// ========================

/** 集装箱状态 → 中文标签 + 配色（来源 sys_dict_type.code = 'container_status'） */
export const CONTAINER_STATUS_MAP: DictBadgeMap = {
  domestic_storage: { label: "国内堆存", cls: "bg-cyan-50 text-cyan-700 border border-cyan-200" },
  outbound: { label: "去程在途", cls: "bg-blue-100 text-blue-700" },
  overseas_storage: { label: "国外堆存", cls: "bg-amber-100 text-amber-700" },
  sold: { label: "已卖出", cls: "bg-green-100 text-green-700" },
  inbound: { label: "回程在途", cls: "bg-purple-100 text-purple-700" },
  wait_pickup: { label: "待提箱", cls: "bg-yellow-100 text-yellow-700" },
  lifted: { label: "已提箱", cls: "bg-green-100 text-green-700" },
};

/** 使用情况 → 中文标签 + 配色（来源 sys_dict_type.code = 'container_usage'） */
export const USAGE_TYPE_MAP: DictBadgeMap = {
  purchase: { label: "买箱", cls: "bg-yellow-100 text-yellow-700" },
  long_rental: { label: "长租", cls: "bg-blue-100 text-blue-700" },
};

/** 箱况 → 中文标签 + 配色（来源 sys_dict_type.code = 'container_cond'） */
export const CONTAINER_COND_MAP: DictBadgeMap = {
  new: { label: "新箱", cls: "bg-green-100 text-green-700" },
  sub_new: { label: "次新箱", cls: "bg-yellow-100 text-yellow-700" },
  cargo_worthy: { label: "适货箱", cls: "bg-blue-100 text-blue-700" },
};

/** 放箱类型 → 中文标签 + 配色 */
export const ORDER_TYPE_MAP: DictBadgeMap = {
  sale: { label: "卖出放箱", cls: "bg-green-100 text-green-700" },
  return: { label: "回程放箱", cls: "bg-purple-100 text-purple-700" },
  rent: { label: "租给客户", cls: "bg-cyan-100 text-cyan-700" },
};

/** 放箱令状态 → 中文标签 + 配色 */
export const RELEASE_STATUS_MAP: DictBadgeMap = {
  pending: { label: "待确认", cls: "bg-yellow-100 text-yellow-700" },
  picked_up: { label: "已提箱", cls: "bg-green-100 text-green-700" },
  released: { label: "已放箱", cls: "bg-blue-100 text-blue-700" },
  cancelled: { label: "已作废", cls: "bg-gray-100 text-gray-600" },
};

/** 放箱方式 → 中文标签 + 配色 */
export const RELEASE_METHOD_MAP: DictBadgeMap = {
  designated: { label: "指定箱号", cls: "bg-blue-50 text-blue-700 border border-blue-200" },
  undesignated: { label: "不指定箱号", cls: "bg-gray-100 text-gray-600 border border-gray-200" },
};

/** 还箱令状态 → 中文标签 + 配色 */
export const RETURN_ORDER_STATUS_MAP: DictBadgeMap = {
  pending: { label: "待还箱", cls: "bg-yellow-100 text-yellow-700" },
  returned: { label: "已还箱", cls: "bg-green-100 text-green-700" },
};

/** 还箱类型 → 中文标签 + 配色 */
export const RETURN_ORDER_TYPE_MAP: DictBadgeMap = {
  customer_return: { label: "客户还箱", cls: "bg-cyan-100 text-cyan-700" },
  rent_return: { label: "租箱归还", cls: "bg-purple-100 text-purple-700" },
};

/** 运踪运输段 → 中文标签 + 配色 */
export const TRACKING_SEGMENT_MAP: DictBadgeMap = {
  outbound: { label: "去程", cls: "bg-blue-100 text-blue-700" },
  inbound: { label: "回程", cls: "bg-purple-100 text-purple-700" },
};

/** 卖方/供应商类型 → 中文标签 + 配色 */
export const SUPPLIER_TYPE_MAP: DictBadgeMap = {
  seller: { label: "卖方", cls: "bg-orange-100 text-orange-700" },
  rental_provider: { label: "出租方", cls: "bg-blue-100 text-blue-700" },
  yard: { label: "堆场", cls: "bg-cyan-100 text-cyan-700" },
};

/** 买方/客户类型 → 中文标签 + 配色 */
export const BUYER_TYPE_MAP: DictBadgeMap = {
  buyer: { label: "买方", cls: "bg-green-100 text-green-700" },
  rental: { label: "租方", cls: "bg-purple-100 text-purple-700" },
};

// ========================
// 5. 容器相关 Select 选项（硬编码兜底，运行时由字典接口覆盖）
// ========================

/** 箱型 Select 选项（与 sys_dict_data.container_type 对齐） */
export const CONTAINER_TYPE_OPTIONS: DictOption[] = [
  { label: "20GP", value: "20GP" },
  { label: "40GP", value: "40GP" },
  { label: "40HQ", value: "40HQ" },
  { label: "45HQ", value: "45HQ" },
];

/** 使用情况 Select 选项（与 sys_dict_data.container_usage 对齐） */
export const USAGE_TYPE_OPTIONS: DictOption[] = [
  { label: "买箱", value: "purchase" },
  { label: "长租", value: "long_rental" },
];

/** 箱况 Select 选项（与 sys_dict_data.container_cond 对齐） */
export const CONTAINER_COND_OPTIONS: DictOption[] = [
  { label: "新箱", value: "new" },
  { label: "次新箱", value: "sub_new" },
  { label: "适货箱", value: "cargo_worthy" },
];

/** 集装箱状态 Select 选项（与 sys_dict_data.container_status 对齐） */
export const CONTAINER_STATUS_OPTIONS: DictOption[] = [
  { label: "国内堆存", value: "domestic_storage" },
  { label: "去程在途", value: "outbound" },
  { label: "国外堆存", value: "overseas_storage" },
  { label: "已卖出", value: "sold" },
  { label: "回程在途", value: "inbound" },
];

/** 运踪运输段 Select 选项 */
export const TRACKING_SEGMENT_OPTIONS: DictOption[] = [
  { label: "去程", value: "outbound" },
  { label: "回程", value: "inbound" },
];

/** 放箱类型 Select 选项（与 sys_dict_data 对齐） */
export const ORDER_TYPE_OPTIONS: DictOption[] = [
  { label: "卖出放箱", value: "sale" },
  { label: "回程放箱", value: "return" },
  { label: "租给客户", value: "rent" },
];

/** 放箱令状态 Select 选项 */
export const RELEASE_STATUS_OPTIONS: DictOption[] = [
  { label: "待提箱", value: "pending" },
  { label: "已提箱", value: "picked_up" },
  { label: "已作废", value: "cancelled" },
];

/** 放箱方式 Select 选项 */
export const RELEASE_METHOD_OPTIONS: DictOption[] = [
  { label: "指定箱号", value: "designated" },
  { label: "不指定箱号", value: "undesignated" },
];

/** 还箱类型 Select 选项 */
export const RETURN_ORDER_TYPE_OPTIONS: DictOption[] = [
  { label: "客户还箱", value: "customer_return" },
  { label: "租箱归还", value: "rent_return" },
];

/** 还箱令状态 Select 选项 */
export const RETURN_ORDER_STATUS_OPTIONS: DictOption[] = [
  { label: "待还箱", value: "pending" },
  { label: "已还箱", value: "returned" },
];