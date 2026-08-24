import { useState, useMemo, useEffect } from "react";
import Table from "@/components/ResizeTable";
import { Button, Select, Input, Space, message, DatePicker } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Container, ContainerStatus } from "@/types";
import { StatusBadge, UsageTag } from "@/components/ui/Badge";
import { getContainerList, batchUpdateContainer } from "@/restApi/container";
import { getAllProjectList } from "@/restApi/project";
import { getDictOptions, getDictOptionsSync } from "@/restApi/dictCache";
import type { DictOption } from "@/types/dict";

export const BatchUpdatePage = () => {
  const [containers, setContainers] = useState<Container[]>([]);
  const [step, setStep] = useState(1);
  const [projectFilter, setProjectFilter] = useState("");
  const [keyword, setKeyword] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [updates, setUpdates] = useState<Record<string, any>>({});
  const [projects, setProjects] = useState<any[]>([]);
  const [projectLoading, setProjectLoading] = useState(false);
  const [statusOptions, setStatusOptions] = useState<DictOption[]>(getDictOptionsSync("container_status"));

  // 加载集装箱列表
  useEffect(() => {
    getContainerList({ pageNo: 1, pageSize: 1000 }).then((r) => {
      setContainers(r.entity?.data ?? []);
    });
  }, []);

  // 加载项目列表
  useEffect(() => {
    setProjectLoading(true);
    getAllProjectList()
      .then((r: any) => setProjects(r?.entity?.data ?? []))
      .finally(() => setProjectLoading(false));
    getDictOptions("container_status").then(setStatusOptions);
  }, []);

  // 筛选后的集装箱
  const filtered = useMemo(
    () =>
      containers.filter((c) => {
        if (projectFilter && c.projectId !== projectFilter) return false;
        if (
          keyword &&
          !c.containerNo.toLowerCase().includes(keyword.toLowerCase())
        )
          return false;
        return true;
      }),
    [containers, projectFilter, keyword],
  );

  const toggleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id),
    );
  };

  const toggleAll = (checked: boolean) => {
    setSelectedIds(checked ? filtered.map((c) => c.id) : []);
  };

  const columns: ColumnsType<Container> = [
    {
      title: (
        <input
          type="checkbox"
          className="w-4 h-4 accent-[#198348]"
          checked={
            selectedIds.length === filtered.length && filtered.length > 0
          }
          onChange={(e) => toggleAll(e.target.checked)}
        />
      ),
      width: 40,
      align: "center",
      render: (_, r) => (
        <input
          type="checkbox"
          className="w-4 h-4 accent-[#198348]"
          checked={selectedIds.includes(r.id)}
          onChange={(e) => toggleSelect(r.id, e.target.checked)}
        />
      ),
    },
    { title: "箱号", dataIndex: "containerNo", width: 140 },
    { title: "箱型", dataIndex: "containerType", width: 70 },
    {
      title: "使用情况",
      dataIndex: "usageType",
      width: 80,
      render: (v) => <UsageTag usage={v} />,
    },
    {
      title: "当前状态",
      dataIndex: "status",
      width: 100,
      render: (v) => <StatusBadge status={v as ContainerStatus} />,
    },
    { title: "状态备注", dataIndex: "remark", width: 150, ellipsis: true },
    {
      title: "提箱令",
      dataIndex: "liftingOrderNo",
      width: 100,
      ellipsis: true,
    },
  ];

  const stepTitles = ["选择集装箱", "填写更新内容", "预览确认"];
  const fieldNames: Record<string, string> = {
    status: "状态",
    eta: "预计到达 (ETA)",
    ata: "实际到达 (ATA)",
    remark: "状态备注",
    storageCost: "堆存成本 (USD)",
  };

  // 状态可选项（字典）
  const opts = statusOptions;

  const step2Fields = [
    {
      key: "status",
      label: fieldNames.status,
      type: "select" as const,
      opts: statusOptions,
    },
    { key: "eta", label: fieldNames.eta, type: "date" as const },
    { key: "ata", label: fieldNames.ata, type: "date" as const },
    { key: "remark", label: fieldNames.remark, type: "text" as const },
  ];

  const selectedContainers = containers.filter((c) =>
    selectedIds.includes(c.id),
  );

  const previewChanges = () => {
    const keys = Object.keys(updates);
    if (keys.length === 0) {
      message.error("请至少填写一个需要更新的字段");
      return;
    }
    setStep(3);
  };

  const applyBatch = async () => {
    const keys = Object.keys(updates);
    if (keys.length === 0) {
      message.error("请至少填写一个需要更新的字段");
      return;
    }
    try {
      await batchUpdateContainer(selectedIds, updates as Partial<Container>);
      message.success(`已成功更新 ${selectedIds.length} 个集装箱`);
      // 重新加载列表
      getContainerList({ pageNo: 1, pageSize: 1000 }).then((r) => {
        setContainers(r.entity?.data ?? []);
      });
      setSelectedIds([]);
      setStep(1);
      setUpdates({});
    } catch {
      message.error("批量更新失败");
    }
  };

  return (
    <div className="space-y-3">
      {/* 说明 */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 px-3 py-2 text-xs text-yellow-800 rounded">
        <b>📌 批量更新说明：</b>
        按项目筛选后勾选集装箱，统一更新"状态 / 预计到达 / 实际到达 / 状态备注 /
        堆存成本"等字段，适用于同一项目下所有箱子状态统一变更（如：集体到达、集体落箱）。
      </div>

      {/* 步骤条 */}
      <div className="flex items-center gap-2 bg-white rounded p-3 shadow-sm">
        {stepTitles.map((title, i) => (
          <div key={i} className="flex items-center gap-2">
            {i > 0 && (
              <div
                className={`w-8 h-0.5 ${i < step ? "bg-[#198348]" : "bg-gray-200"}`}
              />
            )}
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${i + 1 < step ? "bg-green-100 text-green-700" : i + 1 === step ? "bg-[#198348] text-white" : "bg-gray-200 text-gray-500"}`}
              >
                {i + 1 < step ? "✓" : i + 1}
              </div>
              <span
                className={`text-xs ${i + 1 === step ? "text-[#198348] font-medium" : "text-gray-500"}`}
              >
                {title}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Step 1: 选择集装箱 */}
      {step === 1 && (
        <div className="bg-white rounded shadow-sm p-4">
          <div className="flex items-center text-sm font-bold mb-3 text-gray-800">
            <div className="w-1 h-4 bg-[#198348] rounded mr-2 flex-shrink-0" />
            第 1 步：选择集装箱
          </div>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Select
              placeholder="请选择项目..."
              allowClear
              loading={projectLoading}
              value={projectFilter || undefined}
              onChange={(v) => setProjectFilter(v || "")}
              className="w-48"
              size="small"
              options={projects.map((p: any) => ({
                label: p.name,
                value: p.id,
              }))}
            />
            <Input
              placeholder="或输入箱号"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="!w-36"
              size="small"
              allowClear
            />
            <Button
              size="small"
              onClick={() => setSelectedIds(filtered.map((c) => c.id))}
            >
              全选
            </Button>
            <Button size="small" onClick={() => setSelectedIds([])}>
              取消全选
            </Button>
            <span className="ml-auto text-xs text-gray-500">
              已选 <b className="text-[#198348]">{selectedIds.length}</b> 个
            </span>
          </div>
          <Table
            columns={columns}
            dataSource={filtered}
            rowKey="id"
            size="small"
            pagination={false}
            scroll={{ y: 300 }}
          />
          <div className="flex justify-end mt-3">
            <Button
              type="primary"
              disabled={selectedIds.length === 0}
              onClick={() => setStep(2)}
            >
              下一步 →
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: 填写更新内容 */}
      {step === 2 && (
        <div className="space-y-3">
          {/* 已选箱号摘要 — 带入下一步告知用户影响范围 */}
          <div className="bg-[#198348]/5 border border-[#198348]/20 rounded p-3 flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-[#198348] flex items-center justify-center text-white font-bold text-sm">
                {selectedIds.length}
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-[#198348]">
                已选 {selectedIds.length} 个集装箱
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">
                {selectedContainers.map((c) => c.containerNo).join("、")}
              </div>
            </div>
          </div>
          <div className="bg-white rounded shadow-sm p-4">
            <div className="flex items-center text-sm font-bold mb-3 text-gray-800">
              <div className="w-1 h-4 bg-[#198348] rounded mr-2 flex-shrink-0" />
              第 2 步：填写批量更新字段
              <span className="ml-auto text-xs font-normal text-gray-500">
                仅填写需要更新的项，留空的不更新
              </span>
            </div>
            <div className="bg-green-50 border border-green-200 rounded p-4 mb-3">
              <div className="text-xs font-bold text-green-700 mb-3">
                运踪信息更新
              </div>
              <div className="grid grid-cols-4 gap-3">
                {step2Fields.map((f) => (
                  <div key={f.key}>
                    <label className="text-xs text-gray-600 block mb-1">
                      {f.label}
                    </label>
                    {f.type === "date" ? (
                      <DatePicker
                        size="small"
                        style={{ width: "100%" }}
                        onChange={(d) =>
                          setUpdates((u) => ({
                            ...u,
                            [f.key]: d ? d.format("YYYY-MM-DD") : undefined,
                          }))
                        }
                      />
                    ) : f.type === "select" ? (
                      <Select
                        size="small"
                        className="w-full"
                        allowClear
                        placeholder="不更新"
                        options={f.opts}
                        onChange={(v) =>
                          setUpdates((u) => ({ ...u, [f.key]: v }))
                        }
                      />
                    ) : (
                      <Input
                        size="small"
                        className="w-full"
                        placeholder="不更新"
                        onChange={(e) =>
                          setUpdates((u) => ({ ...u, [f.key]: e.target.value }))
                        }
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded p-4">
              <div className="text-xs font-bold text-green-700 mb-3">
                费用信息更新（可选）
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-gray-600 block mb-1">
                    {fieldNames.storageCost}
                  </label>
                  <Input
                    type="number"
                    size="small"
                    className="w-full"
                    placeholder="如：420"
                    onChange={(e) =>
                      setUpdates((u) => ({
                        ...u,
                        storageCost: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-between">
            <Button onClick={() => setStep(1)}>← 上一步</Button>
            <Space>
              <Button onClick={previewChanges}>仅预览变更</Button>
              <Button
                type="primary"
                onClick={() => {
                  previewChanges();
                }}
              >
                下一步 →
              </Button>
            </Space>
          </div>
        </div>
      )}

      {/* Step 3: 预览确认 */}
      {step === 3 && (
        <div className="bg-white rounded shadow-sm p-4">
          <div className="flex items-center text-sm font-bold mb-3 text-gray-800">
            <div className="w-1 h-4 bg-[#198348] rounded mr-2 flex-shrink-0" />
            第 3 步：变更预览（确认后应用）
          </div>
          <div className="mb-3 px-3 py-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
            将对 <b>{selectedIds.length}</b> 个集装箱应用以下变更：
            {Object.keys(updates).map((k) => (
              <span
                key={k}
                className="inline-block ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px]"
              >
                {fieldNames[k] || k}
              </span>
            ))}
          </div>
          <Table
            columns={[
              { title: "箱号", dataIndex: "containerNo", width: 140 },
              {
                title: "项目",
                dataIndex: "projectName",
                width: 120,
                ellipsis: true,
              },
              {
                title: "更新字段",
                render: (_, r) =>
                  Object.keys(updates).map((k) => (
                    <span
                      key={k}
                      className="inline-block mr-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px]"
                    >
                      {fieldNames[k] || k}
                    </span>
                  )),
              },
              {
                title: "原值",
                render: (_, r) => {
                  const keys = Object.keys(updates);
                  return keys.length === 0 ? (
                    <span className="text-gray-400">-</span>
                  ) : (
                    keys.map((k) => {
                      const oldVal =
                        k === "status"
                          ? r.status
                          : k === "remark"
                            ? r.remark || "-"
                            : "-";
                      return k === "status" ? (
                        <StatusBadge
                          key={k}
                          status={oldVal as ContainerStatus}
                        />
                      ) : (
                        <span
                          key={k}
                          className="inline-block mr-1 text-xs text-gray-600"
                        >
                          {oldVal}
                        </span>
                      );
                    })
                  );
                },
              },
              { title: "→", width: 40, align: "center" },
              {
                title: "新值",
                render: (_, r) => {
                  const keys = Object.keys(updates);
                  return keys.length === 0 ? (
                    <span className="text-gray-400">-</span>
                  ) : (
                    keys.map((k) => {
                      const newVal = updates[k] as string;
                      return k === "status" ? (
                        <StatusBadge
                          key={k}
                          status={newVal as ContainerStatus}
                        />
                      ) : (
                        <span
                          key={k}
                          className="inline-block mr-1 text-xs text-[#198348] font-medium"
                        >
                          {newVal}
                        </span>
                      );
                    })
                  );
                },
              },
            ]}
            dataSource={selectedContainers}
            rowKey="id"
            size="small"
            pagination={false}
            scroll={{ x: 900, y: 300 }}
          />
          <div className="flex justify-between items-center mt-4">
            <div className="text-xs text-yellow-600">
              ⚠ 变更不可撤销，建议先导出当前数据备份
            </div>
            <Space>
              <Button onClick={() => setStep(2)}>← 上一步</Button>
              <Button type="primary" onClick={applyBatch}>
                ✓ 确认应用
              </Button>
            </Space>
          </div>
        </div>
      )}
    </div>
  );
};
