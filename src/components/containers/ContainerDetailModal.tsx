import { useState, useEffect, type ReactNode } from "react";
import { Modal, Tabs, Button, Space, Spin, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  Container,
  ContainerStatus,
  LifecycleNode,
  PickupOrder,
} from "@/types";
import {
  StatusBadge,
  UsageTag,
  CondTag,
  SaleStatusTag,
} from "@/components/ui/Badge";
import { InfoItem, SectionTitle } from "@/components/ui/InfoItem";
import { getContainerDetail } from "@/restApi/container";
import CostIncomeDetail from "./CostIncomeDetail";

interface Props {
  id: string;
  onClose: () => void;
  onEdit?: () => void;
  initialTab?: string;
}

/** 分区标题 */

export const ContainerDetailModal = ({
  id,
  onClose,
  onEdit,
  initialTab,
}: Props) => {
  const [container, setContainer] = useState<Container | null>(null);
  const [shipments, setShipments] = useState<any[]>([]);
  const [releases, setReleases] = useState<PickupOrder[]>([]);
  const [lifecycle, setLifecycle] = useState<LifecycleNode[]>([]);
  const [tab, setTab] = useState(initialTab ?? "info");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getContainerDetail(id)
      .then((r: any) => {
        setContainer(r?.entity?.data);
        setLifecycle(
          Array.isArray(r?.entity?.lifecycle) ? r?.entity?.lifecycle : [],
        );
        // 运踪直接从 container.trackings 取
        setShipments(
          Array.isArray(r?.entity?.trackings) ? r?.entity?.trackings : [],
        );
        setReleases(
          Array.isArray(r?.entity?.releases) ? r?.entity?.releases : [],
        );
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Modal
        title="集装箱详情"
        open
        onCancel={onClose}
        width={900}
        footer={null}
      >
        <div className="flex justify-center py-16">
          <Spin />
        </div>
      </Modal>
    );
  }

  if (!container) return null;

  const tabItems = [
    { key: "info", label: "基本信息" },
    { key: "timeline", label: "生命周期轨迹" },
    { key: "shipments", label: `运踪记录 (${shipments.length})` },
    { key: "releases", label: `提箱记录 (${releases.length})` },
    { key: "costIncome", label: `成本/收入明细` },
  ];

  const releaseColumns: ColumnsType<any> = [
    { title: "提箱令编号", dataIndex: "orderNo", key: "orderNo", width: 160 },
    { title: "提箱类型", dataIndex: "orderType", key: "orderType", width: 120 },
    { title: "买方/租方", dataIndex: "buyerName", key: "buyerName" },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (v: string) => <StatusBadge status={v as ContainerStatus} />,
    },
  ];

  const shipmentColumns: ColumnsType<any> = [
    { title: "项目", dataIndex: "projectName" },
    {
      title: "发运→目的",
      render: (_, r: any) =>
        `${r.departureStation || "-"} → ${r.arrivalStation || "-"}`,
    },
    { title: "ATD", dataIndex: "sendTime", render: (v) => v || "-" },
    { title: "ETA", dataIndex: "eta", render: (v) => v || "-" },
    { title: "ATA", dataIndex: "ata", render: (v) => v || "-" },
    {
      title: "状态",
      dataIndex: "status",
      render: (v) => <StatusBadge status={v} />,
    },
    { title: "备注", dataIndex: "remark", render: (v) => v || "-" },
  ];

  const saleStatus = (container as any).saleStatus;

  return (
    <Modal
      title={`集装箱详情 - ${container.containerNo}`}
      open
      onCancel={onClose}
      width={900}
      destroyOnClose
      footer={
        <Space>
          <Button onClick={onClose}>关闭</Button>
          {onEdit && (
            <Button type="primary" onClick={onEdit}>
              编辑
            </Button>
          )}
        </Space>
      }
    >
      <Tabs
        activeKey={tab}
        onChange={setTab}
        items={tabItems}
        className="mt-2"
      />

      {tab === "info" && (
        <div className="grid grid-cols-2 gap-y-3 gap-x-5 text-sm">
          <SectionTitle className="col-span-2 pb-1 -mt-2">基础信息</SectionTitle>
          <InfoItem label="箱号" value={container.containerNo || "-"} />
          <InfoItem label="箱型" value={container.containerType || "-"} />
          <InfoItem label="使用情况" value={ <UsageTag usage={container.usageType} /> } />
          <InfoItem label="箱况" value={ <CondTag cond={container.conditionType} /> } />
          <InfoItem label="卖方/出租方" value={container.supplierName || "-"} />
          <InfoItem label="成本 (USD)" value={container.cost != null ? `$${container.cost}` : "-"} />
          <InfoItem label="收入 (USD)" value={container.income != null ? `$${container.income}` : "-"} />

          <SectionTitle className="col-span-2 py-1">提箱信息</SectionTitle>
          <InfoItem label="提箱堆场" value={container.liftingYardName || "-"} />
          <InfoItem label="提箱时间" value={container.liftingTime || "-"} />
          <InfoItem label="提箱令" value={container.liftingOrderNo || "-"} />

          <SectionTitle className="col-span-2 py-1">当前状态</SectionTitle>
          <InfoItem label="状态" value={ <StatusBadge status={container.status} /> } />
          <InfoItem label="当前售卖状态" value={ <SaleStatusTag saleStatus={saleStatus} /> } />
          <InfoItem label="状态备注" value={container.statusRemark || "-"} />

          {/* 还箱信息 */}
          {(container.dropYardName ||
            container.expectReturnTime ||
            container.expectReturnLocation ||
            container.returnCity) && (
            <SectionTitle className="col-span-2 py-1">还箱信息</SectionTitle>
          )}
          <InfoItem label="当前堆场" value={container.dropYardName || "-"} />

          {(container.sendTime ||
            container.eta ||
            container.ata ||
            container.storageCost != null ||
            container.storageIncome != null) && (
            <>
              <SectionTitle className="col-span-2 py-1">运输 &amp; 费用</SectionTitle>
              <InfoItem label="发运时间" value={container.sendTime || "-"} />
              <InfoItem label="预计到达" value={container.eta || "-"} />
              <InfoItem label="实际到达" value={container.ata || "-"} />
              <InfoItem label="堆存成本" value={container.storageCost != null ? `$${container.storageCost}` : "-"} />
              <InfoItem label="堆存收入" value={container.storageIncome != null ? `$${container.storageIncome}` : "-"} />
            </>
          )}
        </div>
      )}

      {tab === "timeline" && (
        <div className="relative pl-6 space-y-4 py-2">
          <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-200" />
          {lifecycle.map((node, i) => (
            <div key={i} className="relative pl-2">
              <div
                className={`absolute -left-[22px] top-1 w-3 h-3 rounded-full border-2 border-white ${
                  i === 0 ? "bg-gray-400" : "bg-[#198348]"
                }`}
              />
              <div className="text-[11px] text-gray-400">
                {node.time || "-"}
              </div>
              <div className="text-sm font-medium">📍 {node.title}</div>
              <div className="text-xs text-gray-500">{node.detail}</div>
            </div>
          ))}
          {lifecycle.length === 0 && (
            <div className="text-xs text-gray-400 py-4 text-center">
              暂无轨迹
            </div>
          )}
        </div>
      )}

      {tab === "shipments" && (
        <Table
          className="mt-2"
          size="small"
          rowKey="id"
          pagination={false}
          dataSource={shipments}
          columns={shipmentColumns}
          locale={{ emptyText: "暂无运踪记录" }}
        />
      )}

      {tab === "releases" && (
        <div className="mt-2">
          {releases.length === 0 ? (
            <div className="text-xs text-gray-400 text-center py-8">
              暂无提箱记录
            </div>
          ) : (
            <Table
              rowKey="id"
              columns={releaseColumns}
              dataSource={releases}
              pagination={false}
              size="small"
              scroll={{ x: 600 }}
            />
          )}
        </div>
      )}

      {tab === "costIncome" && (
        <CostIncomeDetail
          containerId={container.id ?? id}
          containerNo={container.containerNo ?? ""}
        />
      )}
    </Modal>
  );
};
