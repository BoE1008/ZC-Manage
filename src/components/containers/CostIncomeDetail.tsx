import React, { useEffect, useState } from "react";
import { Button, Space, Modal, Form, Input, InputNumber, Select, DatePicker, message, Table } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import {
  ContainerCostDetail,
  getCostDetailList,
  addCostDetail,
  editCostDetail,
  deleteCostDetail,
} from "@/restApi/costDetail";
import {
  ContainerIncomeDetail,
  getIncomeDetailList,
  addIncomeDetail,
  editIncomeDetail,
  deleteIncomeDetail,
} from "@/restApi/incomeDetail";

interface Props {
  containerId: string;
  containerNo: string;
  /** 初始子 Tab：cost 成本 / income 收入（外部按钮触发查看时可指定） */
  defaultSubTab?: "cost" | "income";
}

const fmtDate = (v?: string) =>
  v && v !== "-" && dayjs(v).isValid()
    ? dayjs(v).format("YYYY-MM-DD")
    : v || "-";

/** 成本明细子组件 */
const CostPanel: React.FC<Props> = ({ containerId, containerNo }) => {
  const [list, setList] = useState<ContainerCostDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<string | null | undefined>(undefined);

  const load = async () => {
    if (!containerId) return;
    setLoading(true);
    try {
      const r: any = await getCostDetailList(containerId);
      const data = (r?.entity?.data ?? r?.entity ?? []) as ContainerCostDetail[];
      setList(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerId]);

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "确认删除",
      content: "确定删除该成本明细吗？",
      okText: "删除",
      okButtonProps: {
        style: { background: "#198348", borderColor: "#198348" },
      },
      cancelText: "取消",
      onOk: async () => {
        await deleteCostDetail(id);
        message.success("已删除");
        load();
      },
    });
  };

  const columns: ColumnsType<ContainerCostDetail> = [
    { title: "明细名称", dataIndex: "itemName", width: 140 },
    {
      title: "金额",
      dataIndex: "amount",
      width: 120,
      align: "right",
      render: (v, r) =>
        v != null ? `${r.currency || "USD"} ${Number(v).toFixed(2)}` : "-",
    },
    { title: "币种", dataIndex: "currency", width: 80, align: "center" },
    {
      title: "发生日期",
      dataIndex: "occurDate",
      width: 110,
      align: "center",
      render: (v) => fmtDate(v),
    },
    { title: "备注", dataIndex: "remark", ellipsis: true },
    {
      title: "操作",
      width: 110,
      align: "center",
      fixed: "right",
      render: (_, r) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => setEditId(r.id)}
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(r.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="mt-2">
      <div className="flex items-center mb-2">
        <span className="text-xs font-bold text-[#198348]">成本明细</span>
        <span className="ml-2 text-xs text-gray-500">
          （共 {list.length} 条，合计 USD {list.reduce((s, x) => s + (Number(x.amount) || 0), 0).toFixed(2)}）
        </span>
        <Button
          type="primary"
          size="small"
          icon={<PlusOutlined />}
          className="ml-auto"
          style={{ background: "#198348", borderColor: "#198348" }}
          onClick={() => setEditId(null)}
        >
          新增明细
        </Button>
      </div>
      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={list}
        pagination={false}
        size="small"
        scroll={{ x: 700 }}
      />
      {editId !== undefined && (
        <DetailFormModal
          type="cost"
          id={editId}
          containerId={containerId}
          containerNo={containerNo}
          onClose={() => setEditId(undefined)}
          onSaved={() => {
            setEditId(undefined);
            load();
          }}
        />
      )}
    </div>
  );
};

/** 收入明细子组件 */
const IncomePanel: React.FC<Props> = ({ containerId, containerNo }) => {
  const [list, setList] = useState<ContainerIncomeDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<string | null | undefined>(undefined);

  const load = async () => {
    if (!containerId) return;
    setLoading(true);
    try {
      const r: any = await getIncomeDetailList(containerId);
      const data = (r?.entity?.data ?? r?.entity ?? []) as ContainerIncomeDetail[];
      setList(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerId]);

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "确认删除",
      content: "确定删除该收入明细吗？",
      okText: "删除",
      okButtonProps: {
        style: { background: "#198348", borderColor: "#198348" },
      },
      cancelText: "取消",
      onOk: async () => {
        await deleteIncomeDetail(id);
        message.success("已删除");
        load();
      },
    });
  };

  const columns: ColumnsType<ContainerIncomeDetail> = [
    { title: "明细名称", dataIndex: "itemName", width: 140 },
    {
      title: "金额",
      dataIndex: "amount",
      width: 120,
      align: "right",
      render: (v, r) =>
        v != null ? `${r.currency || "USD"} ${Number(v).toFixed(2)}` : "-",
    },
    { title: "币种", dataIndex: "currency", width: 80, align: "center" },
    {
      title: "发生日期",
      dataIndex: "occurDate",
      width: 110,
      align: "center",
      render: (v) => fmtDate(v),
    },
    {
      title: "来源",
      dataIndex: "sourceType",
      width: 90,
      align: "center",
      render: (v) =>
        v === "overdue" ? (
          <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-700 text-xs">
            超期累计
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs">
            手工录入
          </span>
        ),
    },
    { title: "备注", dataIndex: "remark", ellipsis: true },
    {
      title: "操作",
      width: 110,
      align: "center",
      fixed: "right",
      render: (_, r) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => setEditId(r.id)}
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(r.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="mt-2">
      <div className="flex items-center mb-2">
        <span className="text-xs font-bold text-[#198348]">收入明细</span>
        <span className="ml-2 text-xs text-gray-500">
          （共 {list.length} 条，合计 USD {list.reduce((s, x) => s + (Number(x.amount) || 0), 0).toFixed(2)}）
        </span>
        <Button
          type="primary"
          size="small"
          icon={<PlusOutlined />}
          className="ml-auto"
          style={{ background: "#198348", borderColor: "#198348" }}
          onClick={() => setEditId(null)}
        >
          新增明细
        </Button>
      </div>
      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={list}
        pagination={false}
        size="small"
        scroll={{ x: 760 }}
      />
      {editId !== undefined && (
        <DetailFormModal
          type="income"
          id={editId}
          containerId={containerId}
          containerNo={containerNo}
          onClose={() => setEditId(undefined)}
          onSaved={() => {
            setEditId(undefined);
            load();
          }}
        />
      )}
    </div>
  );
};

/** 成本/收入 新增/编辑弹框（共用） */
const DetailFormModal: React.FC<{
  type: "cost" | "income";
  id: string | null | undefined;
  containerId: string;
  containerNo: string;
  onClose: () => void;
  onSaved: () => void;
}> = ({ type, id, containerId, containerNo, onClose, onSaved }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [initLoading, setInitLoading] = useState(false);
  const isEdit = !!id;

  useEffect(() => {
    if (!id) {
      form.resetFields();
      form.setFieldsValue({ currency: "USD" });
      return;
    }
    setInitLoading(true);
    const api = type === "cost" ? getCostDetailList : getIncomeDetailList;
    api(containerId)
      .then((r: any) => {
        const list = (r?.entity?.data ?? r?.entity ?? []) as any[];
        const arr = Array.isArray(list) ? list : [];
        const d = arr.find((x) => x.id === id);
        if (d) {
          form.setFieldsValue({
            itemName: d.itemName,
            amount: d.amount,
            currency: d.currency || "USD",
            occurDate: d.occurDate && dayjs(d.occurDate).isValid()
              ? dayjs(d.occurDate)
              : null,
            remark: d.remark,
          });
        }
      })
      .finally(() => setInitLoading(false));
  }, [id, containerId, type, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);
      const payload: any = {
        containerId,
        containerNo,
        itemName: values.itemName,
        amount: values.amount,
        currency: values.currency || "USD",
        occurDate: values.occurDate
          ? values.occurDate.format("YYYY-MM-DD")
          : "",
        remark: values.remark ?? "",
      };
      if (type === "cost") {
        if (isEdit) payload.id = id;
        await (isEdit ? editCostDetail(payload) : addCostDetail(payload));
      } else {
        if (isEdit) payload.id = id;
        await (isEdit ? editIncomeDetail(payload) : addIncomeDetail(payload));
      }
      message.success(isEdit ? "已更新" : "已新增");
      onSaved();
    } catch (e: any) {
      if (e?.errorFields) return;
      message.error((isEdit ? "更新" : "新增") + "失败：" + (e?.message ?? ""));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={
        <span className="text-[#198348] font-bold">
          {isEdit ? "编辑" : "新增"}
          {type === "cost" ? "成本" : "收入"}明细 - {containerNo}
        </span>
      }
      open
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={submitting || initLoading}
      okText={isEdit ? "保存" : "新增"}
      cancelText="取消"
      okButtonProps={{ style: { background: "#198348", borderColor: "#198348" } }}
      width={520}
      destroyOnClose
    >
      <Form form={form} layout="vertical" className="mt-2">
        <Form.Item
          name="itemName"
          label={<span className="text-xs">明细名称 *</span>}
          rules={[{ required: true, message: "请填写明细名称" }]}
        >
          <Input
            placeholder={
              type === "cost"
                ? "如：提箱费 / 堆存费 / 吊装费 / 改单费"
                : "如：超期堆存费 / 放箱收入 / 堆存收入"
            }
            maxLength={200}
          />
        </Form.Item>
        <div className="grid grid-cols-3 gap-x-3">
          <Form.Item
            name="amount"
            label={<span className="text-xs">金额 *</span>}
            className="col-span-2"
            rules={[{ required: true, message: "请填写金额" }]}
          >
            <InputNumber
              min={0}
              step={0.5}
              precision={2}
              className="w-full"
              placeholder="0.00"
            />
          </Form.Item>
          <Form.Item
            name="currency"
            label={<span className="text-xs">币种</span>}
          >
            <Select
              options={[
                { label: "USD", value: "USD" },
                { label: "CNY", value: "CNY" },
                { label: "EUR", value: "EUR" },
              ]}
            />
          </Form.Item>
        </div>
        <Form.Item
          name="occurDate"
          label={<span className="text-xs">发生日期</span>}
          getValueProps={(v) => ({ value: v ? dayjs(v) : undefined })}
          normalize={(v) => (v ? v.format("YYYY-MM-DD") : "")}
        >
          <DatePicker style={{ width: "100%" }} placeholder="选择发生日期" />
        </Form.Item>
        <Form.Item name="remark" label={<span className="text-xs">备注</span>}>
          <Input.TextArea rows={2} maxLength={500} showCount />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export { DetailFormModal };

export const CostIncomeDetail: React.FC<Props> = ({ containerId, containerNo, defaultSubTab }) => {
  const [subTab, setSubTab] = useState<"cost" | "income">(defaultSubTab ?? "cost");
  return (
    <div className="mt-2">
      <div className="flex items-center gap-1 mb-2 border-b border-gray-200">
        <div
          className={`px-3 py-1.5 text-xs cursor-pointer border-b-2 ${
            subTab === "cost"
              ? "border-[#198348] text-[#198348] font-bold"
              : "border-transparent text-gray-500"
          }`}
          onClick={() => setSubTab("cost")}
        >
          成本明细
        </div>
        <div
          className={`px-3 py-1.5 text-xs cursor-pointer border-b-2 ${
            subTab === "income"
              ? "border-[#198348] text-[#198348] font-bold"
              : "border-transparent text-gray-500"
          }`}
          onClick={() => setSubTab("income")}
        >
          收入明细
        </div>
      </div>
      {subTab === "cost" ? (
        <CostPanel containerId={containerId} containerNo={containerNo} />
      ) : (
        <IncomePanel containerId={containerId} containerNo={containerNo} />
      )}
    </div>
  );
};

export default CostIncomeDetail;