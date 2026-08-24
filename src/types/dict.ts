// ============================================================
// 容器字典枚举（与后端 sys_dict_type.code / sys_dict_data.dict_value 对齐）
// 来源 SQL：container_type / container_cond / container_usage / container_status
// ============================================================

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