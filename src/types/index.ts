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

/**
 * API 接口类型定义
 * 基于后端 Java 实体类自动生成
 * Container.java / ContainerTracking.java / ReleaseOrder.java / Yard.java
 * 生成时间: 2026-08-19
 */

// ============================================================
// 通用响应结构
// ============================================================

/** 通用分页响应 */
export interface PageResult<T> {
  /** 数据列表 */
  records: T[];
  /** 当前页码 */
  current: number;
  /** 每页条数 */
  size: number;
  /** 总记录数 */
  total: number;
  /** 总页数 */
  pages: number;
}

/** 通用响应结构 */
export interface ApiResponse<T = void> {
  /** 状态码，200=成功 */
  code: number;
  /** 响应消息 */
  msg: string;
  /** 数据体 */
  data?: T;
}

// ============================================================
// 字典枚举
// ============================================================

/** 箱型 */
export type ContainerType = "20GP" | "40GP" | "40HC" | "45HC" | string;

/** 使用情况 */
export type UsageType = "purchase" | "long_rental" | string;

/** 箱况 */
export type ConditionType = "new" | "sub_new" | "cargo_worthy" | string;

/** 集装箱状态 */
export type ContainerStatus =
  | "pending" // 待提箱
  | "lifting" // 提箱中
  | "in_transit" // 在途
  | "dropped" // 已落箱
  | "storage" // 堆存中
  | "released" // 已放箱
  | "picked_up" // 已提箱
  | "returned" // 已还箱
  | string;

/** 运踪运输段 */
export type TrackingSegment = "outbound" | "inbound" | string;

/** 放箱类型 */
export type OrderType = "sale" | "return" | "rent" | string;

/** 放箱令状态 */
export type ReleaseStatus = "pending" | "picked_up" | string;

// ============================================================
// Container 集装箱
// table: sys_container
// ============================================================

/** 集装箱实体（完整字段） */
export interface Container {
  /** 主键ID */
  id: string;

  // ---------- 基础信息 ----------
  /** 箱号 */
  containerNo: string;
  /** 是否箱号待定（0否 1是） */
  isTemp: "0" | "1" | string;
  /** 临时编号 */
  tempNo: string;
  /** 箱型 */
  containerType: ContainerType;
  /** 使用情况（purchase买箱 long_rental长租） */
  usageType: UsageType;
  /** 箱况（new新箱 sub_new次新箱 cargo_worthy适货箱） */
  conditionType: ConditionType;

  // ---------- 采购信息 ----------
  /** 卖方/出租方ID */
  supplierId: string;
  /** 成本（提箱费），单位：USD */
  cost: number;
  /** 提箱令编号 */
  liftingOrderNo: string;
  /** 提箱堆场ID */
  liftingYardId: string;
  /** 提箱时间，格式：yyyy-MM-dd */
  liftingTime: string;

  // ---------- 当前状态 ----------
  /** 状态 */
  status: ContainerStatus;
  /** 状态备注 */
  statusRemark: string;
  /** 项目ID */
  projectId: string;
  /** 项目名称 */
  projectName: string;
  /** 船名/班列号 */
  shipName: string;

  // ---------- 运输信息 ----------
  /** 发运时间 */
  sendTime: string;
  /** 预计到达时间 */
  eta: string;
  /** 实际到达时间 */
  ata: string;
  /** 落箱堆场ID */
  dropYardId: string;
  /** 落箱时间 */
  dropTime: string;

  // ---------- 费用 ----------
  /** 堆存成本，单位：USD */
  storageCost: number;
  /** 堆存收入，单位：USD */
  storageIncome: number;

  // ---------- 销售/客户 ----------
  /** 买方/租方客户ID */
  buyerId: string;
  /** 放箱收入，单位：USD */
  saleIncome: number;
  /** 客户提箱时间 */
  pickupTime: string;
  /** 还箱城市 */
  returnCity: string;
  /** 还箱费，单位：USD */
  returnFee: number;

  // ---------- 备注 ----------
  /** 备注 */
  remark: string;

  // ---------- 关联查询（@Transient） ----------
  /** 供应商名称 */
  supplierName?: string;
  /** 买方名称 */
  buyerName?: string;
  /** 提箱堆场名称 */
  liftingYardName?: string;
  /** 落箱堆场名称 */
  dropYardName?: string;

  // ---------- 系统字段 ----------
  /** 创建人 */
  createBy: string;
  /** 创建时间 */
  createTime: string;
  /** 最后修改人 */
  updateBy: string;
  /** 修改时间 */
  updateTime: string;
}

/** Container 新增/编辑请求参数（id/createBy/createTime/updateBy/updateTime 由后端管理） */
export type ContainerForm = Omit<
  Container,
  "id" | "createBy" | "createTime" | "updateBy" | "updateTime"
>;

/** Container 分页查询参数 */
export interface ContainerPageQuery {
  /** 页码，默认 1 */
  current?: number;
  /** 每页条数，默认 20 */
  size?: number;
  /** 箱号（模糊匹配） */
  containerNo?: string;
  /** 状态，精确匹配 */
  status?: ContainerStatus;
  /** 使用情况，精确匹配 */
  usageType?: UsageType;
  /** 箱况，精确匹配 */
  conditionType?: ConditionType;
  /** 项目ID */
  projectId?: string;
  /** 供应商ID */
  supplierId?: string;
  /** 买方ID */
  buyerId?: string;
  /** 发运时间起（yyyy-MM-dd） */
  sendTimeStart?: string;
  /** 发运时间止（yyyy-MM-dd） */
  sendTimeEnd?: string;
  /** 提箱时间起 */
  liftingTimeStart?: string;
  /** 提箱时间止 */
  liftingTimeEnd?: string;
  /** 落箱时间起 */
  dropTimeStart?: string;
  /** 落箱时间止 */
  dropTimeEnd?: string;
  /** 实际到达时间起 */
  ataStart?: string;
  /** 实际到达时间止 */
  ataEnd?: string;
}

// ============================================================
// ContainerTracking 运踪记录
// table: sys_container_tracking
// ============================================================

/** 运踪记录实体 */
export interface ContainerTracking {
  /** 主键ID */
  id: string;

  // ---------- 关联信息 ----------
  /** 集装箱ID */
  containerId: string;
  /** 箱号 */
  containerNo: string;
  /** 项目ID */
  projectId: string;
  /** 项目名称 */
  projectName: string;

  // ---------- 运输信息 ----------
  /** 运输段（outbound去程 inbound回程） */
  segment: TrackingSegment;
  /** 船名/班列号 */
  shipName: string;
  /** 发运时间 */
  sendTime: string;
  /** 预计到达时间 */
  eta: string;
  /** 实际到达时间 */
  ata: string;
  /** 发运站 */
  departureStation: string;
  /** 目的站 */
  arrivalStation: string;

  // ---------- 落箱信息 ----------
  /** 落箱堆场ID */
  dropYardId: string;
  /** 落箱时间 */
  dropTime: string;
  /** 堆场供应商ID */
  dropSupplierId: string;

  // ---------- 费用 ----------
  /** 堆存成本，单位：USD */
  storageCost: number;
  /** 堆存收入，单位：USD */
  storageIncome: number;

  // ---------- 状态 ----------
  /** 状态 */
  status: ContainerStatus;
  /** 状态备注 */
  statusRemark: string;

  // ---------- 还箱 ----------
  /** 还箱令编号 */
  returnOrderNo: string;
  /** 还箱时间 */
  returnTime: string;

  // ---------- 备注 ----------
  /** 备注 */
  remark: string;

  // ---------- 关联查询 ----------
  /** 落箱堆场名称 */
  dropYardName?: string;

  // ---------- 系统字段 ----------
  /** 创建人 */
  createBy: string;
  /** 创建时间 */
  createTime: string;
  /** 最后修改人 */
  updateBy: string;
  /** 修改时间 */
  updateTime: string;
}

/** ContainerTracking 新增/编辑请求参数 */
export type ContainerTrackingForm = Omit<
  ContainerTracking,
  "id" | "createBy" | "createTime" | "updateBy" | "updateTime"
>;

/** ContainerTracking 分页查询参数 */
export interface ContainerTrackingPageQuery {
  /** 页码，默认 1 */
  current?: number;
  /** 每页条数，默认 20 */
  size?: number;
  /** 箱号 */
  containerNo?: string;
  /** 集装箱ID */
  containerId?: string;
  /** 项目ID */
  projectId?: string;
  /** 运输段 */
  segment?: TrackingSegment;
  /** 状态 */
  status?: ContainerStatus;
  /** 发运时间起 */
  sendTimeStart?: string;
  /** 发运时间止 */
  sendTimeEnd?: string;
  /** 预计到达时间起 */
  etaStart?: string;
  /** 预计到达时间止 */
  etaEnd?: string;
  /** 实际到达时间起 */
  ataStart?: string;
  /** 实际到达时间止 */
  ataEnd?: string;
  /** 落箱堆场ID */
  dropYardId?: string;
  /** 落箱时间起 */
  dropTimeStart?: string;
  /** 落箱时间止 */
  dropTimeEnd?: string;
  /** 还箱时间起 */
  returnTimeStart?: string;
  /** 还箱时间止 */
  returnTimeEnd?: string;
}

// ============================================================
// ReleaseOrder 放箱令
// table: sys_release_order
// ============================================================

/** 放箱令实体 */
export interface ReleaseOrder {
  /** 主键ID */
  id: string;

  // ---------- 单据信息 ----------
  /** 放箱令编号 */
  orderNo: string;
  /** 集装箱ID */
  containerId: string;
  /** 箱号 */
  containerNo: string;

  // ---------- 业务信息 ----------
  /** 放箱类型（sale卖出 return回程 rent租给客户） */
  orderType: OrderType;
  /** 客户ID */
  buyerId: string;
  /** 收入，单位：USD */
  income: number;
  /** 客户提箱时间 */
  pickupTime: string;
  /** 放箱堆场ID */
  yardId: string;

  // ---------- 状态 ----------
  /** 状态（pending待提箱 picked_up已提箱） */
  status: ReleaseStatus;

  // ---------- 备注 ----------
  /** 备注 */
  remark: string;

  // ---------- 关联查询 ----------
  /** 客户名称 */
  buyerName?: string;
  /** 堆场名称 */
  yardName?: string;

  // ---------- 系统字段 ----------
  /** 创建人 */
  createBy: string;
  /** 创建时间 */
  createTime: string;
  /** 最后修改人 */
  updateBy: string;
  /** 修改时间 */
  updateTime: string;
}

/** ReleaseOrder 新增/编辑请求参数 */
export type ReleaseOrderForm = Omit<
  ReleaseOrder,
  "id" | "orderNo" | "createBy" | "createTime" | "updateBy" | "updateTime"
>;

/** ReleaseOrder 分页查询参数 */
export interface ReleaseOrderPageQuery {
  /** 页码，默认 1 */
  current?: number;
  /** 每页条数，默认 20 */
  size?: number;
  /** 放箱令编号 */
  orderNo?: string;
  /** 箱号 */
  containerNo?: string;
  /** 放箱类型 */
  orderType?: OrderType;
  /** 客户ID */
  buyerId?: string;
  /** 放箱堆场ID */
  yardId?: string;
  /** 状态 */
  status?: ReleaseStatus;
  /** 创建时间起（yyyy-MM-dd） */
  createTimeStart?: string;
  /** 创建时间止（yyyy-MM-dd） */
  createTimeEnd?: string;
}

// ============================================================
// Yard 堆场
// table: sys_yard
// ============================================================

/** 堆场实体 */
export interface Yard {
  /** 主键ID */
  id: string;

  // ---------- 基本信息 ----------
  /** 堆场名称 */
  name: string;
  /** 所在城市 */
  city: string;
  /** 堆场地址 */
  address: string;

  // ---------- 联系方式 ----------
  /** 联系人 */
  contactsName: string;
  /** 联系人电话 */
  contactsMobile: string;

  // ---------- 备注 ----------
  /** 备注 */
  remark: string;

  // ---------- 系统字段 ----------
  /** 创建人 */
  createBy: string;
  /** 创建时间 */
  createTime: string;
  /** 最后修改人 */
  updateBy: string;
  /** 修改时间 */
  updateTime: string;
}

/** Yard 新增/编辑请求参数 */
export type YardForm = Omit<
  Yard,
  "id" | "createBy" | "createTime" | "updateBy" | "updateTime"
>;

/** Yard 分页查询参数 */
export interface YardPageQuery {
  /** 页码，默认 1 */
  current?: number;
  /** 每页条数，默认 20 */
  size?: number;
  /** 堆场名称（模糊匹配） */
  name?: string;
  /** 所在城市 */
  city?: string;
}
