import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { Modal, Tabs, Button, Space, Spin, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Container, ContainerStatus, LifecycleNode } from "@/types";
import { StatusBadge, UsageTag, CondTag } from "@/components/ui/Badge";
import { getContainerDetail } from "@/restApi/container";
import CostIncomeDetail, { DetailFormModal } from "./CostIncomeDetail";

import { ReleaseOrder } from "@/types";

interface Props {
  id: string;
  onClose: () => void;
  onEdit?: () => void;
}

export const ContainerDetailModal = ({ id, onClose, onEdit }: Props) => {
  const [container, setContainer] = useState<Container | null>(null);
  const [shipments, setShipments] = useState<any[]>([]);
  const [releases, setReleases] = useState<ReleaseOrder[]>([]);
  const [lifecycle, setLifecycle] = useState<LifecycleNode[]>([]);
  const [tab, setTab] = useState("info");
  const [costIncomeSubTab, setCostIncomeSubTab] = useState<"cost" | "income">("cost");
  const [addCostOpen, setAddCostOpen] = useState(false);
  const [addIncomeOpen, setAddIncomeOpen] = useState(false);
  const [costIncomeKey, setCostIncomeKey] = useState(0);
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
    { key: "releases", label: `放箱记录 (${releases.length})` },
    { key: "costIncome", label: `成本/收入明细` },
  ];

  const releaseColumns: ColumnsType<any> = [
    { title: "放箱令编号", dataIndex: "orderNo", key: "orderNo", width: 160 },
    { title: "放箱类型", dataIndex: "orderType", key: "orderType", width: 120 },
    { title: "买方/租方", dataIndex: "buyerName", key: "buyerName" },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (v: string) => <StatusBadge status={v as ContainerStatus} />,
    },
  ];

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
          <div className="col-span-2 text-xs font-bold text-[#198348] pb-1 border-b border-dashed border-gray-200 -mt-2">
            基础信息
          </div>
          <div>
            <span className="text-xs text-gray-400 block">箱号</span>
            <span className="font-medium">{container.containerNo || "-"}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block">箱型</span>
            <span className="font-medium">
              {container.containerType || "-"}
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block">使用情况</span>
            <UsageTag usage={container.usageType} />
          </div>
          <div>
            <span className="text-xs text-gray-400 block">箱况</span>
            <CondTag cond={container.conditionType} />
          </div>
          <div>
            <span className="text-xs text-gray-400 block">卖方/出租方</span>
            <span className="font-medium">{container.supplierName || "-"}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block">成本 (USD)</span>
            <span className="font-medium">
              {container.cost != null ? `$${container.cost}` : "-"}
            </span>
          </div>

          <div className="col-span-2 text-xs font-bold text-[#198348] py-1 border-b border-dashed border-gray-200">
            提箱信息
          </div>
          <div>
            <span className="text-xs text-gray-400 block">提箱堆场</span>
            <span className="font-medium">
              {container.liftingYardName || "-"}
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block">提箱时间</span>
            <span className="font-medium">{container.liftingTime || "-"}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block">提箱令</span>
            <span className="font-medium">
              {container.liftingOrderNo || "-"}
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block">当前项目</span>
            <span className="font-medium">{container.projectName || "-"}</span>
          </div>

          <div className="col-span-2 text-xs font-bold text-[#198348] py-1 border-b border-dashed border-gray-200">
            当前状态
          </div>
          <div>
            <span className="text-xs text-gray-400 block">状态</span>
            <StatusBadge status={container.status} />
          </div>
          <div>
            <span className="text-xs text-gray-400 block">状态备注</span>
            <span className="font-medium">{container.statusRemark || "-"}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block">买方/租方</span>
            <span className="font-medium">{container.buyerName || "-"}</span>
          </div>

          {/* 还箱信息 */}
          {(container.dropYardName ||
            container.expectReturnTime ||
            container.expectReturnLocation ||
            container.returnCity) && (
            <div className="col-span-2 text-xs font-bold text-[#198348] py-1 border-b border-dashed border-gray-200">
              还箱信息
            </div>
          )}
          <div>
            <span className="text-xs text-gray-400 block">当前堆场</span>
            <span className="font-medium">{container.dropYardName || "-"}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block">预计还箱时间</span>
            <span className="font-medium">
              {container.expectReturnTime &&
              container.expectReturnTime !== "-" &&
              dayjs(container.expectReturnTime).isValid()
                ? dayjs(container.expectReturnTime).format("YYYY-MM-DD")
                : container.expectReturnTime || "-"}
            </span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block">预计还箱地</span>
            <span className="font-medium">
              {container.expectReturnLocation || container.returnCity || "-"}
            </span>
          </div>

          <div>
            <span className="text-xs text-gray-400 block">是否箱号待定</span>
            <span className="font-medium">
              {container.isTemp === "1" ? "是" : "否"}
            </span>
          </div>

          {(container.sendTime ||
            container.eta ||
            container.ata ||
            container.storageCost != null ||
            container.storageIncome != null) && (
            <>
              <div className="col-span-2 text-xs font-bold text-[#198348] py-1 border-b border-dashed border-gray-200">
                运输 &amp; 费用
              </div>
              <div>
                <span className="text-xs text-gray-400 block">发运时间</span>
                <span className="font-medium">{container.sendTime || "-"}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">预计到达</span>
                <span className="font-medium">{container.eta || "-"}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">实际到达</span>
                <span className="font-medium">{container.ata || "-"}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">堆存成本</span>
                <span className="font-medium">
                  {container.storageCost != null
                    ? `$${container.storageCost}`
                    : "-"}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">堆存收入</span>
                <span className="font-medium">
                  {container.storageIncome != null
                    ? `$${container.storageIncome}`
                    : "-"}
                </span>
              </div>
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
          columns={[
            {
              title: "项目",
              dataIndex: "projectName",
            },
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
          ]}
          locale={{ emptyText: "暂无运踪记录" }}
        />
      )}

      {tab === "releases" && (
        <div className="mt-2">
          {releases.length === 0 ? (
            <div className="text-xs text-gray-400 text-center py-8">
              暂无放箱记录
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
      {tab === "costIncome" && container && (
        <CostIncomeDetail
          containerId={container.id ?? id}
          containerNo={container.containerNo ?? ""}
        />
      )}

      {/* 新增成本明细弹框 */}
      {addCostOpen && container && (
        <DetailFormModal
          type="cost"
          id={null}
          containerId={container.id ?? id ?? ""}
          containerNo={container.containerNo ?? ""}
          onClose={() => setAddCostOpen(false)}
          onSaved={() => {
            setAddCostOpen(false);
            setCostIncomeSubTab("cost");
            setCostIncomeKey((k) => k + 1);
            setTab("costIncome");
          }}
        />
      )}
      {/* 新增收入明细弹框 */}
      {addIncomeOpen && container && (
        <DetailFormModal
          type="income"
          id={null}
          containerId={container.id ?? id ?? ""}
          containerNo={container.containerNo ?? ""}
          onClose={() => setAddIncomeOpen(false)}
          onSaved={() => {
            setAddIncomeOpen(false);
            setCostIncomeSubTab("income");
            setCostIncomeKey((k) => k + 1);
            setTab("costIncome");
          }}
        />
      )}
    </Modal>
  );
};
