import React, { useState, useEffect } from "react";
import { Button, Space, Select, Modal, message, Tooltip } from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import Table from "@/components/ResizeTable";
import type { ColumnsType } from "antd/es/table";
import SearchInput from "../SearchInput";
import ProjectConfigModal from "./ProjectConfigModal";
import ProjectConfigDetailModal from "./ProjectConfigDetailModal";
import {
  getProjectConfigList,
  deleteProjectConfig,
  ProjectContainerConfig,
} from "@/restApi/projectConfig";
import { getAllProjectList } from "@/restApi/project";

const ProjectConfigList: React.FC = () => {
  const pageSize = 20;

  // 分页
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // 数据 & loading
  const [list, setList] = useState<ProjectContainerConfig[]>([]);
  const [loading, setLoading] = useState(false);

  // 编辑 & 预览
  const [editId, setEditId] = useState<string | null | undefined>(undefined);
  const [viewId, setViewId] = useState<string | null | undefined>(undefined);

  // 项目选项
  const [projects, setProjects] = useState<any[]>([]);
  const [projectLoading, setProjectLoading] = useState(false);

  // 筛选 state
  const [projectFilter, setProjectFilter] = useState("");

  // 加载数据
  const loadData = () => {
    setLoading(true);
    getProjectConfigList({
      pageNo: page,
      pageSize,
      projectId: projectFilter || undefined,
    })
      .then((r: any) => {
        const data = r?.entity;
        setList(data);
        setTotal(r?.entity?.total ?? data.length);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [page, projectFilter]);

  // 加载项目列表
  useEffect(() => {
    setProjectLoading(true);
    (async () => {
      try {
        const r: any = await getAllProjectList();
        setProjects(
          (r?.entity?.data ?? []).map((p: any) => ({
            id: p.id,
            name: p.name,
            num: p.num ?? p.projectNum ?? "",
          })),
        );
      } catch {
        setProjects([]);
      } finally {
        setProjectLoading(false);
      }
    })();
  }, []);

  const handleDelete = (r: ProjectContainerConfig) => {
    Modal.confirm({
      title: "确认删除",
      content: `确定删除项目「${r.projectName || r.projectId}」的配置吗？`,
      okText: "删除",
      okButtonProps: {
        style: { background: "#198348", borderColor: "#198348" },
      },
      cancelText: "取消",
      onOk: async () => {
        try {
          await deleteProjectConfig(r.id ?? "");
          message.success("已删除");
          loadData();
        } catch (e: any) {
          message.error("删除失败：" + (e?.message ?? "未知错误"));
        }
      },
    });
  };

  const columns: ColumnsType<ProjectContainerConfig> = [
    {
      title: "项目编号",
      dataIndex: "projectNum",
      width: 140,
      fixed: "left",
      render: (v) => (
        <span className="font-mono text-[#198348]">{v || "-"}</span>
      ),
    },
    {
      title: "项目名称",
      dataIndex: "projectName",
      width: 200,
      ellipsis: true,
      render: (v) => v || "-",
    },
    {
      title: "堆存超期提醒",
      dataIndex: "overdueAlertDays",
      width: 130,
      align: "center",
      render: (v) => (v != null ? `${v} 天` : "-"),
    },
    {
      title: "到站提醒",
      dataIndex: "etaAlertDays",
      width: 110,
      align: "center",
      render: (v) => (v != null ? `${v} 天` : "-"),
    },
    {
      title: "免费天数",
      dataIndex: "arrivalOverdueDays",
      width: 100,
      align: "center",
      render: (v) => (v != null ? `${v} 天` : "-"),
    },
    {
      title: "超期单价",
      dataIndex: "arrivalOverdueUnitPrice",
      width: 140,
      align: "right",
      render: (v) => (v != null ? `USD ${Number(v).toFixed(2)} / 天/柜` : "-"),
    },
    {
      title: "备注",
      dataIndex: "remark",
      ellipsis: true,
      render: (v) => v || "-",
    },
    {
      title: "操作",
      width: 130,
      align: "center",
      fixed: "right",
      render: (_, r) => (
        <Space size="small">
          <Tooltip title="详情">
            <Button
              type="text"
              size="small"
              onClick={() => setViewId(r.projectId)}
            >
              👁
            </Button>
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              size="small"
              onClick={() => setEditId(r.projectId)}
            >
              ✎
            </Button>
          </Tooltip>
          <Tooltip title="删除">
            <Button
              type="text"
              size="small"
              danger
              onClick={() => handleDelete(r)}
            >
              🗑
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  console.log(list);

  return (
    <div className="p-2">
      {/* 标题 */}
      <div className="flex items-center text-base font-bold mb-3 text-gray-800">
        <div className="w-1 h-4 bg-[#198348] rounded mr-2" />
        项目-集装箱配置
        <span className="ml-2 text-xs font-normal text-gray-500">
          （每项目一份配置：堆存超期提醒 / 到站提醒 / 超期计费规则）
        </span>
      </div>

      {/* 提示条 */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 text-xs px-3 py-2 mb-3 rounded">
        每个项目对应一份集装箱配置：
        <b>堆存超期提醒天数</b>（超过 ata + 该天数则提醒）；
        <b>到站提醒天数</b>（eta ≤ 该天数则提醒）；
        <b>到站后免费天数</b> + <b>超期单价</b> 用于动态计算超期堆存费收入。
      </div>

      {/* 工具栏 */}
      <div className="flex items-center gap-3 flex-wrap mb-3">
        <Button
          type="primary"
          style={{ background: "#198348", borderColor: "#198348" }}
          onClick={() => setEditId(null)}
        >
          + 新建项目配置
        </Button>

        {/* 项目编号 */}
        <Select
          allowClear
          showSearch
          loading={projectLoading}
          placeholder="项目编号"
          style={{ width: 160 }}
          value={projectFilter || undefined}
          onChange={(v) => {
            setPage(1);
            setProjectFilter(v || "");
          }}
          filterOption={(i, o) =>
            ((o?.label as string) || "").toLowerCase().includes(i.toLowerCase())
          }
          options={projects.map((p) => ({
            label: p.num || "",
            value: p.id,
          }))}
        />

        {/* 项目名称 */}
        <Select
          allowClear
          showSearch
          loading={projectLoading}
          placeholder="项目名称"
          style={{ width: 200 }}
          value={projectFilter || undefined}
          onChange={(v) => {
            setPage(1);
            setProjectFilter(v || "");
          }}
          filterOption={(i, o) =>
            ((o?.label as string) || "").toLowerCase().includes(i.toLowerCase())
          }
          options={projects.map((p) => ({
            label: p.name,
            value: p.id,
          }))}
        />
      </div>

      {/* 表格 */}
      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={list}
        scroll={{ x: 1200 }}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: false,
          onChange: (p) => setPage(p),
          showTotal: (t) => `共 ${t} 条`,
        }}
      />

      {/* 弹框 */}
      {editId !== undefined && (
        <ProjectConfigModal
          id={editId}
          onClose={() => setEditId(undefined)}
          onSaved={() => {
            setEditId(undefined);
            loadData();
          }}
        />
      )}
      {viewId !== null && viewId !== undefined && (
        <ProjectConfigDetailModal
          id={viewId}
          onClose={() => setViewId(undefined)}
          onEdit={() => {
            const target = viewId;
            setViewId(undefined);
            setEditId(target);
          }}
        />
      )}
    </div>
  );
};

export default ProjectConfigList;
