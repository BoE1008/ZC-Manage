import { useState, useEffect } from "react";
import { Modal, Button, Space, Spin, Descriptions } from "antd";
import { ContainerTracking, ContainerStatus } from "@/types";
import { StatusBadge } from "@/components/ui/Badge";
import { getTrackingDetail } from "@/restApi/tracking";
import { getAllProjectList } from "@/restApi/project";

interface Props {
  /** 运踪记录 id（点击那条的 id） */
  id: string;
  onClose: () => void;
}

export const ShipmentDetailModal = ({ id, onClose }: Props) => {
  const [record, setRecord] = useState<ContainerTracking | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getAllProjectList().then((r: any) => setProjects(r?.entity?.data ?? []));
    // getTrackingDetail 直接传运踪记录 id，兼容单条/数组/entity.data 包装返回
    getTrackingDetail(id)
      .then((r: any) => {
        const entity = r?.entity;
        const rec = Array.isArray(entity)
          ? (entity.find((x: any) => x.id === id) ?? entity[0] ?? null)
          : (entity?.data ?? entity ?? null);
        setRecord(rec ?? null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Modal title="运踪详情" open onCancel={onClose} width={760} footer={null}>
        <div className="flex justify-center py-16">
          <Spin />
        </div>
      </Modal>
    );
  }

  if (!record) return null;

  // 部分字段（projectNum/port/liftingTime/liftingOrderNo）后端会返回但类型未定义
  const r = record as any;

  return (
    <Modal
      title={`运踪详情 - ${r.containerNo || "-"}`}
      open
      onCancel={onClose}
      width={760}
      destroyOnClose
      footer={
        <Space>
          <Button onClick={onClose}>关闭</Button>
        </Space>
      }
    >
      <div className="py-2">
        <div className="text-xs font-bold text-[#198348] pb-1 mb-3 border-b border-dashed border-gray-200">
          集装箱与项目
        </div>
        <Descriptions
          column={2}
          size="small"
          labelStyle={{ width: 110, color: "#9ca3af", fontSize: 12 }}
          contentStyle={{ fontSize: 13 }}
          items={[
            {
              key: "containerNo",
              label: "箱号",
              children: r.containerNo || "-",
            },
            {
              key: "projectName",
              label: "项目名称",
              children: r.projectName || "-",
            },
            {
              key: "projectNum",
              label: "项目编号",
              children:
                projects.find((x: any) => x.id === r.projectId)?.projectNum ||
                r.projectNum ||
                "-",
            },
            { key: "port", label: "口岸", children: r.port || "-" },
          ]}
        />

        <div className="text-xs font-bold text-[#198348] pb-1 mb-3 mt-4 border-b border-dashed border-gray-200">
          发运信息
        </div>
        <Descriptions
          column={2}
          size="small"
          labelStyle={{ width: 110, color: "#9ca3af", fontSize: 12 }}
          contentStyle={{ fontSize: 13 }}
          items={[
            {
              key: "departureStation",
              label: "发运站",
              children: r.departureStation || "-",
            },
            {
              key: "arrivalStation",
              label: "目的站",
              children: r.arrivalStation || "-",
            },
            {
              key: "liftingTime",
              label: "提箱时间",
              children: r.liftingTime || "-",
            },
            {
              key: "liftingOrderNo",
              label: "提箱令",
              children: r.liftingOrderNo || "-",
            },
            {
              key: "sendTime",
              label: "发运时间(ATD)",
              children: r.sendTime || "-",
            },
            { key: "eta", label: "预计到达(ETA)", children: r.eta || "-" },
            { key: "ata", label: "实际到达", children: r.ata || "-" },
          ]}
        />

        <div className="text-xs font-bold text-[#198348] pb-1 mb-3 mt-4 border-b border-dashed border-gray-200">
          状态与还箱
        </div>
        <Descriptions
          column={2}
          size="small"
          labelStyle={{ width: 110, color: "#9ca3af", fontSize: 12 }}
          contentStyle={{ fontSize: 13 }}
          items={[
            {
              key: "status",
              label: "状态",
              children: <StatusBadge status={r.status as ContainerStatus} />,
            },
            {
              key: "statusRemark",
              label: "状态备注",
              children: r.statusRemark || "-",
            },
            {
              key: "returnTime",
              label: "还箱时间",
              children: r.returnTime || "-",
            },
            {
              key: "returnOrderNo",
              label: "还箱令",
              children: r.returnOrderNo || "-",
            },
          ]}
        />
      </div>
    </Modal>
  );
};
