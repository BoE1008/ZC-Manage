# zc-manage REST API 封装汇总

生成时间: 2026-08-19

## 文件清单

| 文件 | 路径 | 说明 |
|---|---|---|
| `container.ts` | `src/restApi/container.ts` | 集装箱 CRUD + 统计 |
| `tracking.ts` | `src/restApi/tracking.ts` | 运踪记录 CRUD |
| `releaseOrder.ts` | `src/restApi/releaseOrder.ts` | 放箱令 CRUD + 状态操作 |
| `yard.ts` | `src/restApi/yard.ts` | 堆场 CRUD + all |
| `supplier.ts` | `src/restApi/supplier.ts` | 供应商 CRUD + all |
| `containerBuyer.ts` | `src/restApi/containerBuyer.ts` | 集装箱买方/租方 CRUD + all |

> ⚠️ 注意：`customer.ts`（旧，项目客户 /zc/custom/*）已存在未动，新建 `containerBuyer.ts` 避免冲突。

## 路由前缀对照

| 模块 | base path |
|---|---|
| 集装箱 | `/zc/container` |
| 运踪记录 | `/zc/tracking` |
| 放箱令 | `/zc/release` |
| 堆场 | `/zc/yard` |
| 供应商 | `/zc/supplier` |
| 集装箱买方 | `/zc/container/buyer` |

## 类型文件

`src/types/index.ts` 已补全所有缺失类型：
- `Supplier` / `Buyer`（前端推断）
- `Shipment`（= ContainerTracking 别名）
- `Release`（= ReleaseOrder 别名）
- `ReleaseType`（= OrderType 别名）
- `ContainerCondition`（= ConditionType 别名）
- `DictType` / `DictCond`（字典项）
- `BatchUpdate` / `FormValues`（批量操作）
- `Activity`（活动记录）

## 新增接口一览

### container.ts
- `getContainerList` — 分页列表（接收 PageQuery）
- `getContainerDetail` — 详情
- `addContainer` — 新增
- `editContainer` — 编辑
- `deleteContainer` — 删除
- `getContainerDashboardStats` — Dashboard 统计
- `batchUpdateContainer` — 批量更新
- `batchDeleteContainer` — 批量删除

### tracking.ts
- `getTrackingList` — 分页列表
- `getTrackingDetail` — 详情
- `addTracking` — 新增
- `editTracking` — 编辑
- `deleteTracking` — 删除
- `getTrackingByContainerNo` — 按箱号查运踪

### releaseOrder.ts
- `getReleaseOrderList` — 分页列表
- `getReleaseOrderDetail` — 详情
- `addReleaseOrder` — 新增
- `editReleaseOrder` — 编辑
- `deleteReleaseOrder` — 删除
- `confirmPickup` — 确认已提箱
- `cancelReleaseOrder` — 放箱令作废
- `getPendingReleaseOrderCount` — 待确认统计

### yard.ts
- `getYardList` — 分页列表
- `getYardDetail` — 详情
- `addYard` — 新增
- `editYard` — 编辑
- `deleteYard` — 删除
- `getAllYards` — 所有堆场（下拉框）

### supplier.ts
- `getSupplierList` — 分页列表
- `getSupplierDetail` — 详情
- `addSupplier` — 新增
- `editSupplier` — 编辑
- `deleteSupplier` — 删除
- `getAllSuppliers` — 所有供应商（下拉框）

### containerBuyer.ts
- `getContainerBuyerList` — 分页列表
- `getContainerBuyerDetail` — 详情
- `addContainerBuyer` — 新增
- `editContainerBuyer` — 编辑
- `deleteContainerBuyer` — 删除
- `getAllContainerBuyers` — 所有买方（下拉框）
