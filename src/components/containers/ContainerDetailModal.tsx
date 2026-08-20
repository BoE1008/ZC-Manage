import { useState, useEffect } from "react";
import { Modal, Tabs, Button, Space, Spin, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Container, ContainerStatus } from "@/types";
import { StatusBadge, UsageTag, CondTag } from "@/components/ui/Badge";
import { getContainerDetail } from "@/restApi/container";

import { getProjectList } from "@/restApi/project";
import { ReleaseOrder } from "@/types";

interface Props {
  id: string;
  onClose: () => void;
  onEdit: () => void;
}

export const ContainerDetailModal = ({ id, onClose, onEdit }: Props) => {
  const [container, setContainer] = useState<Container | null>(null);
  const [shipments, setShipments] = useState<any[]>([]);
  const [releases, setReleases] = useState<ReleaseOrder[]>([]);
  const [tab, setTab] = useState("info");
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    getContainerDetail(id)
      .then((r: any) => {
        // 兼容：{code, entity: {data}} / {code, entity} / 直接实体
        const c = r?.entity?.data ?? r?.entity ?? r;
        setContainer(c ?? null);
        // 运踪直接从 container.tracking 取
        setShipments(
          Array.isArray(r?.entity?.trackings) ? r?.entity?.trackings : [],
        );
        setReleases([]);
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

  const c = container;

  const tabItems = [
    { key: "info", label: "基本信息" },
    { key: "timeline", label: "生命周期轨迹" },
    { key: "shipments", label: `运踪记录 (${shipments.length})` },
    { key: "releases", label: `放箱记录 (${releases.length})` },
  ];

  return (
    <Modal
      title={`集装箱详情 - ${c.containerNo}`}
      open
      onCancel={onClose}
      width={900}
      destroyOnClose
      footer={
        <Space>
          <Button onClick={onClose}>关闭</Button>
          <Button type="primary" onClick={onEdit}>
            编辑
          </Button>
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
            <span className="font-medium">{c.containerNo || "-"}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block">箱型</span>
            <span className="font-medium">{c.containerType || "-"}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block">使用情况</span>
            <UsageTag usage={c.usageType} />
          </div>
          <div>
            <span className="text-xs text-gray-400 block">箱况</span>
            <CondTag cond={c.conditionType} />
          </div>
          <div>
            <span className="text-xs text-gray-400 block">卖方/出租方</span>
            <span className="font-medium">{c.supplierName || "-"}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block">成本 (USD)</span>
            <span className="font-medium">
              {c.cost != null ? `$${c.cost}` : "-"}
            </span>
          </div>

          <div className="col-span-2 text-xs font-bold text-[#198348] py-1 border-b border-dashed border-gray-200">
            提箱信息
          </div>
          <div>
            <span className="text-xs text-gray-400 block">提箱堆场</span>
            <span className="font-medium">{c.liftingYardName || "-"}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block">提箱时间</span>
            <span className="font-medium">{c.liftingTime || "-"}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block">提箱令</span>
            <span className="font-medium">{c.liftingOrderNo || "-"}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block">当前项目</span>
            <span className="font-medium">{c.projectName || "-"}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block">船名/班列号</span>
            <span className="font-medium">{c.shipName || "-"}</span>
          </div>

          <div className="col-span-2 text-xs font-bold text-[#198348] py-1 border-b border-dashed border-gray-200">
            当前状态
          </div>
          <div>
            <span className="text-xs text-gray-400 block">状态</span>
            <StatusBadge status={c.status} />
          </div>
          <div>
            <span className="text-xs text-gray-400 block">状态备注</span>
            <span className="font-medium">{c.statusRemark || "-"}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block">买方/租方</span>
            <span className="font-medium">{c.buyerName || "-"}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block">是否箱号待定</span>
            <span className="font-medium">
              {c.isTemp === "1" ? "是" : "否"}
            </span>
          </div>

          {(c.sendTime ||
            c.eta ||
            c.ata ||
            c.storageCost != null ||
            c.storageIncome != null) && (
            <>
              <div className="col-span-2 text-xs font-bold text-[#198348] py-1 border-b border-dashed border-gray-200">
                运输 &amp; 费用
              </div>
              <div>
                <span className="text-xs text-gray-400 block">发运时间</span>
                <span className="font-medium">{c.sendTime || "-"}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">预计到达</span>
                <span className="font-medium">{c.eta || "-"}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">实际到达</span>
                <span className="font-medium">{c.ata || "-"}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">堆存成本</span>
                <span className="font-medium">
                  {c.storageCost != null ? `$${c.storageCost}` : "-"}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">堆存收入</span>
                <span className="font-medium">
                  {c.storageIncome != null ? `$${c.storageIncome}` : "-"}
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {tab === "timeline" && (
        <div className="relative pl-6 space-y-4 py-2">
          <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gray-200" />
          {[
            {
              date: c.liftingTime,
              icon: "📦",
              title: "提箱",
              desc: `提箱堆场：${c.dropYardId || "-"} | 提箱令：${c.liftingOrderNo || "-"}`,
            },
            c.sendTime && {
              date: c.sendTime,
              icon: "🚢",
              title: "发运",
              desc: `船名：${c.shipName || "-"}`,
            },
            c.eta && {
              date: c.eta,
              icon: "📍",
              title: "预计到达",
              desc: "待确认",
            },
            c.ata && {
              date: c.ata,
              icon: "✅",
              title: "实际到达",
              desc: c.storageCost != null ? `堆存成本 $${c.storageCost}` : "-",
            },
            {
              date: new Date().toISOString().slice(0, 10),
              icon: "📊",
              title: "当前状态",
              desc: c.statusRemark || `状态：${c.status}`,
            },
          ]
            .filter(Boolean)
            .map((item: any, i: number) => (
              <div key={i} className="relative pl-2">
                <div
                  className={`absolute -left-[22px] top-1 w-3 h-3 rounded-full border-2 border-white ${
                    i === 0 ? "bg-gray-400" : "bg-[#198348]"
                  }`}
                />
                <div className="text-[11px] text-gray-400">
                  {item.date || "-"}
                </div>
                <div className="text-sm font-medium">
                  {item.icon} {item.title}
                </div>
                <div className="text-xs text-gray-500">{item.desc}</div>
              </div>
            ))}
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
              render: (v, r: any) =>
                projects.find((x: any) => x.id === r.projectId)?.name ||
                v ||
                "-",
            },
            {
              title: "发运→目的",
              render: (_, r: any) =>
                `${r.fromStation || "-"} → ${r.toStation || "-"}`,
            },
            { title: "ATD", dataIndex: "atd", render: (v) => v || "-" },
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
        <div className="mt-2 text-xs text-gray-400 text-center py-8">
          {releases.length === 0 ? "暂无放箱记录" : null}
        </div>
      )}
    </Modal>
  );
};
