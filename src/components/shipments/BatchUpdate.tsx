import { useState, useEffect } from "react";
import Table from "@/components/ResizeTable";
import { Button, Select, Input, Space, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Container, ContainerStatus } from "@/types";
import { StatusBadge, UsageTag } from "@/components/ui/Badge";
import { getContainerList, batchUpdateContainer } from "@/restApi/container";
import { getAllProjectList } from "@/restApi/project";
import { getDictOptions, getDictOptionsSync } from "@/restApi/dictCache";
import { getYardList } from "@/restApi/yard";
import { getSuppliersList } from "@/restApi/supplyer";
import type { DictOption } from "@/types/dict";

export const BatchUpdatePage = () => {
  const [containers, setContainers] = useState<Container[]>([]);
  const [step, setStep] = useState(1);
  const [tabMode, setTabMode] = useState<"manual" | "template">("manual");
  const [projectFilter, setProjectFilter] = useState("");
  const [keyword, setKeyword] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [updates, setUpdates] = useState<Record<string, any>>({});
  const [projects, setProjects] = useState<any[]>([]);
  const [yards, setYards] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [projectLoading, setProjectLoading] = useState(false);
  const [statusOptions, setStatusOptions] = useState<DictOption[]>(
    getDictOptionsSync("container_status"),
  );

  useEffect(() => {
    getContainerList({ pageNo: 1, pageSize: 1000 }).then((r) => {
      setContainers(r.entity?.data ?? []);
    });
  }, []);

  useEffect(() => {
    setProjectLoading(true);
    Promise.all([
      getAllProjectList(),
      getYardList({ pageNo: 1, pageSize: 1000 }),
      getSuppliersList(1, 1000),
      getDictOptions("container_status"),
    ])
      .then(([projRes, yardRes, supRes]: any[]) => {
        setProjects(projRes?.entity?.data ?? []);
        setYards(yardRes?.entity?.data ?? []);
        setSuppliers(supRes?.entity?.data ?? []);
      })
      .finally(() => {
        setProjectLoading(false);
      });
    getDictOptions("container_status").then(setStatusOptions);
  }, []);

  const filtered = containers.filter((c) => {
    if (projectFilter && c.projectId !== projectFilter) return false;
    if (keyword && !c.containerNo.toLowerCase().includes(keyword.toLowerCase()))
      return false;
    return true;
  });

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
      align: "center" as const,
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

  // Step 2 所有字段
  const step2Fields = [
    { key: "sendTime", label: "发运时间 (ATD)", type: "date" as const },
    { key: "eta", label: "预计到达 (ETA)", type: "date" as const },
    { key: "ata", label: "实际到达", type: "date" as const },
    {
      key: "status",
      label: "更新状态",
      type: "select" as const,
      opts: statusOptions,
    },
    { key: "remark", label: "状态备注", type: "text" as const },
    {
      key: "dropYardId",
      label: "落箱堆场",
      type: "select" as const,
      opts: yards.map((y: any) => ({
        label: `${y.yardName}（${y.city ?? ""}）`,
        value: y.id,
      })),
    },
    {
      key: "dropSupplierId",
      label: "堆场供应商",
      type: "select" as const,
      opts: suppliers.map((s: any) => ({ label: s.name, value: s.id })),
    },
    { key: "returnTime", label: "还箱时间", type: "date" as const },
  ];

  // 费用字段
  const feeFields = [
    { key: "storageCost", label: "堆存费 (USD)", placeholder: "如：420" },
    { key: "liftCost", label: "吊装费 (USD)", placeholder: "如：35" },
    {
      key: "returnCost",
      label: "还箱费 (USD)",
      placeholder: "长租箱还到别处时",
    },
    { key: "overdueIncome", label: "超期收入 (USD)", placeholder: "如有" },
  ];

  const selectedContainers = containers.filter((c) =>
    selectedIds.includes(c.id),
  );

  const fieldLabels: Record<string, string> = {
    sendTime: "发运时间 (ATD)",
    eta: "预计到达 (ETA)",
    ata: "实际到达",
    status: "状态",
    remark: "状态备注",
    dropYardId: "落箱堆场",
    dropSupplierId: "堆场供应商",
    returnTime: "还箱时间",
    storageCost: "堆存费",
    liftCost: "吊装费",
    returnCost: "还箱费",
    overdueIncome: "超期收入",
  };

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
        适用于两种场景——①<b>统一变更</b>
        ：按项目筛选后勾选集装箱，统一更新"发运时间/到达时间/状态/堆场"等字段（如集体到达）；②
        <b>模板更新</b>：同一项目 200 个箱子只更新其中 100
        个、且每个箱子状态各不相同时，用模板下载→编辑→上传的方式按行更新。
      </div>

      {/* Tab 栏 */}
      <div className="flex border-b border-gray-200 bg-white rounded-t">
        <div
          className={`px-5 py-2.5 cursor-pointer text-sm font-medium border-b-2 transition-colors ${
            tabMode === "manual"
              ? "text-[#198348] border-[#198348]"
              : "text-gray-500 border-transparent hover:text-gray-700"
          }`}
          onClick={() => setTabMode("manual")}
        >
          ① 勾选批量更新（统一变更）
        </div>
        <div
          className={`px-5 py-2.5 cursor-pointer text-sm font-medium border-b-2 transition-colors ${
            tabMode === "template"
              ? "text-[#198348] border-[#198348]"
              : "text-gray-500 border-transparent hover:text-gray-700"
          }`}
          onClick={() => setTabMode("template")}
        >
          ② 模板更新（每箱不同状态）
        </div>
      </div>

      {/* === 勾选批量更新模式 === */}
      {tabMode === "manual" && (
        <>
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

          {/* 工具栏：项目筛选 + 箱号搜索 + 全选/取消 + 已选计数 */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {/* 项目编号 */}
            <Select
              showSearch
              allowClear
              placeholder="项目编号"
              loading={projectLoading}
              value={projectFilter || undefined}
              onChange={(v) => setProjectFilter(v || "")}
              className="!w-40"
              size="small"
              filterOption={(i, o) =>
                ((o?.label as string) || "")
                  .toLowerCase()
                  .includes(i.toLowerCase())
              }
              options={projects.map((p: any) => ({
                label: p.projectNum || p.num || "",
                value: p.id,
              }))}
            />
            {/* 项目名称 */}
            <Select
              showSearch
              allowClear
              placeholder="项目名称"
              loading={projectLoading}
              value={projectFilter || undefined}
              onChange={(v) => setProjectFilter(v || "")}
              className="!w-48"
              size="small"
              filterOption={(i, o) =>
                ((o?.label as string) || "")
                  .toLowerCase()
                  .includes(i.toLowerCase())
              }
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
            <Button size="small" onClick={() => toggleAll(true)}>
              全选
            </Button>
            <Button size="small" onClick={() => toggleAll(false)}>
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
            scroll={{ x: 900, y: 300 }}
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
          {/* 已选箱号摘要 */}
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
              <div className="text-[11px] text-gray-500 mt-0.5 max-w-2xl truncate">
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

            {/* 运踪信息更新 */}
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
                      <Input
                        type="date"
                        size="small"
                        className="w-full"
                        onChange={(e) =>
                          setUpdates((u) => ({
                            ...u,
                            [f.key]: e.target.value || undefined,
                          }))
                        }
                      />
                    ) : f.type === "select" ? (
                      <Select
                        size="small"
                        className="w-full"
                        allowClear
                        placeholder="不更新"
                        showSearch
                        filterOption={(i, o) =>
                          ((o?.label as string) || "")
                            .toLowerCase()
                            .includes(i.toLowerCase())
                        }
                        options={f.opts}
                        onChange={(v) =>
                          setUpdates((u) => ({ ...u, [f.key]: v || undefined }))
                        }
                      />
                    ) : (
                      <Input
                        size="small"
                        className="w-full"
                        placeholder="不更新"
                        onChange={(e) =>
                          setUpdates((u) => ({
                            ...u,
                            [f.key]: e.target.value || undefined,
                          }))
                        }
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 费用信息更新 */}
            <div className="bg-green-50 border border-green-200 rounded p-4">
              <div className="text-xs font-bold text-green-700 mb-3">
                费用信息更新（可选）
              </div>
              <div className="grid grid-cols-4 gap-3">
                {feeFields.map((f) => (
                  <div key={f.key}>
                    <label className="text-xs text-gray-600 block mb-1">
                      {f.label}
                    </label>
                    <Input
                      type="number"
                      size="small"
                      className="w-full"
                      placeholder={f.placeholder}
                      onChange={(e) =>
                        setUpdates((u) => ({
                          ...u,
                          [f.key]: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button onClick={() => setStep(1)}>← 上一步</Button>
            <Space>
              <Button onClick={previewChanges}>仅预览变更</Button>
              <Button type="primary" onClick={previewChanges}>
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
                {fieldLabels[k] || k}
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
                width: 220,
                render: () =>
                  Object.keys(updates).map((k) => (
                    <span
                      key={k}
                      className="inline-block mr-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px]"
                    >
                      {fieldLabels[k] || k}
                    </span>
                  )),
              },
              {
                title: "原值",
                width: 120,
                render: (_, r) => {
                  const keys = Object.keys(updates);
                  if (keys.length === 0)
                    return <span className="text-gray-400">-</span>;
                  return keys.map((k) =>
                    k === "status" ? (
                      <StatusBadge
                        key={k}
                        status={r.status as ContainerStatus}
                      />
                    ) : (
                      <span
                        key={k}
                        className="inline-block mr-1 text-xs text-gray-600"
                      >
                        {k === "dropYardId"
                          ? yards.find((y: any) => y.id === r.dropYardId)
                              ?.name || "-"
                          : k === "dropSupplierId"
                            ? suppliers.find(
                                (s: any) => s.id === r.dropSupplierId,
                              )?.name || "-"
                            : (r as any)[k] || "-"}
                      </span>
                    ),
                  );
                },
              },
              { title: "→", width: 40, align: "center" as const },
              {
                title: "新值",
                width: 120,
                render: (_, r) => {
                  const keys = Object.keys(updates);
                  if (keys.length === 0)
                    return <span className="text-gray-400">-</span>;
                  return keys.map((k) =>
                    k === "status" ? (
                      <StatusBadge
                        key={k}
                        status={updates[k] as ContainerStatus}
                      />
                    ) : (
                      <span
                        key={k}
                        className="inline-block mr-1 text-xs text-[#198348] font-medium"
                      >
                        {k === "dropYardId"
                          ? yards.find((y: any) => y.id === updates[k])?.name ||
                            "-"
                          : k === "dropSupplierId"
                            ? suppliers.find((s: any) => s.id === updates[k])
                                ?.name || "-"
                            : updates[k] || "-"}
                      </span>
                    ),
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
        </>
      )}

      {/* === 模板更新模式 === */}
      {tabMode === "template" && (
        <div className="space-y-3">
          <div className="bg-white rounded shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center text-sm font-bold text-gray-800">
                <div className="w-1 h-4 bg-[#198348] rounded mr-2 flex-shrink-0" />
                模板更新运踪
                <span className="ml-3 text-xs font-normal text-gray-500">
                  下载含当前数据的模板 → Excel 中修改需要更新的行 → 上传回传
                </span>
              </div>
            </div>

            {/* 步骤指示 */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#198348] text-white flex items-center justify-center text-sm font-bold">1</div>
                <span className="text-xs text-[#198348] font-medium">选择项目并下载模板</span>
              </div>
              <div className="w-12 h-0.5 bg-[#198348]" />
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#198348] text-white flex items-center justify-center text-sm font-bold">2</div>
                <span className="text-xs text-gray-700">Excel 编辑后上传</span>
              </div>
              <div className="w-12 h-0.5 bg-[#198348]" />
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#198348] text-white flex items-center justify-center text-sm font-bold">3</div>
                <span className="text-xs text-gray-700">预览差异并应用</span>
              </div>
            </div>

            {/* 工具栏 */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {/* 项目编号 */}
              <Select
                showSearch
                allowClear
                placeholder="项目编号"
                loading={projectLoading}
                value={projectFilter || undefined}
                onChange={(v) => setProjectFilter(v || "")}
                className="!w-40"
                size="middle"
                filterOption={(i, o) =>
                  ((o?.label as string) || "").toLowerCase().includes(i.toLowerCase())
                }
                options={projects.map((p: any) => ({
                  label: p.projectNum || p.num || "",
                  value: p.id,
                }))}
              />
              {/* 项目名称 */}
              <Select
                showSearch
                allowClear
                placeholder="项目名称"
                loading={projectLoading}
                value={projectFilter || undefined}
                onChange={(v) => setProjectFilter(v || "")}
                className="!w-48"
                size="middle"
                filterOption={(i, o) =>
                  ((o?.label as string) || "").toLowerCase().includes(i.toLowerCase())
                }
                options={projects.map((p: any) => ({
                  label: p.name,
                  value: p.id,
                }))}
              />
              <Button
                type="primary"
                onClick={() => message.info("下载模板功能待对接 CSV 导出接口")}
              >
                📥 下载模板（含当前运踪数据）
              </Button>
              <Button
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = ".csv,.txt,.xlsx";
                  input.onchange = (e: any) => {
                    const f = e.target.files?.[0];
                    if (f) message.info(`已选择文件：${f.name}（解析逻辑待对接）`);
                  };
                  input.click();
                }}
              >
                📤 上传更新后的模板
              </Button>
            </div>

            {/* 模板字段说明 */}
            <div className="bg-amber-50 border-l-4 border-amber-400 rounded p-2.5 text-xs text-amber-800 leading-relaxed">
              <b>模板字段：</b>
              箱号(必填、不可改) | 项目名称 | 发运站 | 目的站 | 口岸 | 运单号 | 发运时间 | 预计到达 | 实际到达 | 状态 | 状态备注 | 落箱堆场 | 还箱时间 | 还箱令
              —— 留空的单元格不更新，状态可按行各不相同（如：30 行"国外堆存"、70 行"去程在途"）。
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
