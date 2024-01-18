import { useEffect, useState, useMemo } from "react";
import {
  Table,
  Space,
  Button,
  Input,
  Modal,
  Form,
  Select,
  DatePicker,
  message,
  List,
  Avatar,
  Tooltip,
  Popconfirm,
} from "antd";
import { Operation } from "@/types";
import dayjs from "dayjs";
import {
  CheckCircleTwoTone,
  CalendarTwoTone,
  StopTwoTone,
  IdcardTwoTone,
} from "@ant-design/icons";
import {
  getPaymentYWList,
  addPayment,
  updatePayment,
  submitToLD,
  submitYWToCW,
  logsOne,
  rejectOne,
  getPaymentDetailById,
} from "@/restApi/payment";
import { getProjectsSubmitList } from "@/restApi/project";
import { getSuppliersList } from "@/restApi/supplyer";
import RejectModal from "@/components/RejectModal";
import PaymentSubmitModal from "@/components/PaymentSubmitModal";
import { formatNumber } from "@/utils";
import PaymentDetailModal from "@/components/PaymentDetailModal";

const Role = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState("");
  const [userName, setUserName] = useState("");

  const [project, setProject] = useState();
  const [supplier, setSupplier] = useState();

  const [logs, setLogs] = useState();

  const [modalOpen, setModalOpen] = useState(false);
  const [operation, setOperation] = useState<Operation>(Operation.Add);
  const [editId, setEditId] = useState("");
  const [loading, setLoading] = useState(true);

  const [rejectId, setRejectId] = useState();

  const [detail, setDetail] = useState();
  const [check, setCheck] = useState();

  const [submitType, setSubmitType] = useState();

  const [supplierId, setSupplierId] = useState();
  const [projectState, setProjectState] = useState();

  useEffect(() => {
    (async () => {
      const projectData = await getProjectsSubmitList(1, 10000);
      const supplierData = await getSuppliersList(1, 10000);
      setSupplier(supplierData.entity.data);
      setProject(
        projectData.entity.data.filter((item) => item.state === "审批通过")
      );
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const res = await getPaymentYWList(
        page,
        pageSize,
        searchValue,
        supplierId,
        projectState,
        userName
      );
      setData(res);
    })();
  }, [page, pageSize, searchValue, supplierId, projectState, userName]);

  const handleDetail = async (id) => {
    const res = await getPaymentDetailById(id);
    setDetail(res.entity.data);
  };

  const handleCheck = async (id) => {
    const res = await getPaymentDetailById(id);
    setCheck(res.entity.data);
  };

  const handleSubmitToLD = async () => {
    await submitToLD(detail.id);
    message.success({ content: "已提交至领导审核", type: 'success' });
    setDetail(undefined);
    const res = await getPaymentYWList(page, pageSize);
    setData(res);
  };

  const handleSubmitToCW = async () => {
    await submitYWToCW(detail.id);
    message.success({ content: "已提交至财务审核", type: 'success' });
    setDetail(undefined);
    const res = await getPaymentYWList(page, pageSize);
    setData(res);
  };

  const handleRejectOne = async (id: string, remark: string) => {
    await rejectOne(id, remark, 1);
    setRejectId(undefined);
    message.success({ content: "申请已退回" , type: 'success'});
    const res = await getPaymentYWList(page, pageSize);
    setData(res);
  };

  const handleLogsOne = async (id: string) => {
    const res = await logsOne(id);
    setLogs(res.entity.data);
  };

  const handleOk = async () => {
    form.validateFields();
    const values = form.getFieldsValue();
    setLoading(true);
    const { code } =
      operation === Operation.Add
        ? await addPayment(values)
        : await updatePayment(editId, values);
    if (code === 200) {
      setModalOpen(false);
      const data = await getPaymentYWList(page, pageSize);
      setLoading(false);
      setData(data);
      message.success({
        content: operation === Operation.Add ? "添加成功" : "编辑成功",
        type: 'success',
      });
    }
  };

  const handleDeleteOne = async (id: string) => {};

  const validateName = () => {
    return {
      validator: (_, value) => {
        if (value.trim() !== "") {
          return Promise.resolve();
        }
        return Promise.reject(new Error("请输入客户名称"));
      },
    };
  };

  const customerFilterOption = (
    input: string,
    option?: { label: string; value: string }
  ) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  const supplierFilters = useMemo(() => {
    return supplier?.map((item) => ({
      text: item.name,
      value: item.id,
    }));
  }, [supplier]);

  const stateFilters = [
    {
      text: "未提交",
      value: "0",
    },
    {
      text: "待业务审批",
      value: "1",
    },
    {
      text: "待领导审批",
      value: "2",
    },
    {
      text: "待财务审批",
      value: "3",
    },
    {
      text: "审批通过",
      value: "4",
    },
  ];

  const columns = [
    {
      title: "项目编号",
      dataIndex: "projectNum",
      align: "center",
      key: "projectNum",
    },
    {
      title: "项目名称",
      // dataIndex: "projectName",
      align: "center",
      key: "projectName",
      render: (record) => {
        return (
          <span
            className="cursor-pointer text-[#198348]"
            onClick={() => handleCheck(record.id)}
          >
            {record.projectName}
          </span>
        );
      },
    },
    {
      title: "供应商",
      dataIndex: "supplierName",
      align: "center",
      key: "supplierName",
      filterMultiple: false,
      filters: supplierFilters,
      filterSearch: true,
      onFilter: (value: string, record) => record.supplierId === value,
    },
    {
      title: "金额",
      // dataIndex: "fee",
      align: "center",
      key: "fee",
      render: (record) => formatNumber(record?.fee),
    },
    {
      title: "币种",
      dataIndex: "moneyType",
      align: "center",
      key: "moneyType",
    },
    {
      title: "审核状态",
      dataIndex: "state",
      align: "center",
      key: "state",
      filterMultiple: false,
      filters: stateFilters,
      filterSearch: true,
      onFilter: (value: string, record) =>
        record.state ===
        stateFilters.find((item) => value === item.value)?.text,
    },
    {
      title: "税号",
      dataIndex: "taxationNumber",
      align: "center",
      key: "taxationNumber",
    },
    {
      title: "银行卡号",
      dataIndex: "bankCard",
      align: "center",
      key: "bankCard",
    },
    {
      title: "开户行",
      dataIndex: "bank",
      align: "center",
      key: "bank",
    },
    {
      title: "申请人",
      dataIndex: "userName",
      align: "center",
      key: "userName",
    },
    {
      title: "应付日期",
      dataIndex: "yfDate",
      align: "center",
      key: "yfDate",
    },
    {
      title: "备注",
      dataIndex: "remark",
      align: "center",
      key: "remark",
    },
    {
      title: "操作",
      align: "center",
      key: "action",
      render: (_, record) => {
        const isFinished = record.state === "审批通过";
        const isSubmit = record.state === "待业务审批";

        return (
          <Space size="middle" className="flex flex-row !gap-x-1">
            {isSubmit && (
              <Tooltip title="提交至领导审核">
                <Popconfirm
                  title="是否提交？"
                  getPopupContainer={(node) => node.parentElement}
                  okButtonProps={{ style: { backgroundColor: "#198348" } }}
                  onConfirm={() => {
                    setSubmitType(0);
                    handleDetail(record.id);
                  }}
                >
                  <Button
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "3px 5px",
                    }}
                  >
                    <IdcardTwoTone twoToneColor="#198348" />
                  </Button>
                </Popconfirm>
              </Tooltip>
            )}
            {isSubmit && (
              <Tooltip title="提交至财务审核">
                <Popconfirm
                  title="是否提交？"
                  getPopupContainer={(node) => node.parentElement}
                  okButtonProps={{ style: { backgroundColor: "#198348" } }}
                  onConfirm={() => {
                    setSubmitType(1);
                    handleDetail(record.id);
                  }}
                >
                  <Button
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "3px 5px",
                    }}
                  >
                    <CheckCircleTwoTone twoToneColor="#198348" />
                  </Button>
                </Popconfirm>
              </Tooltip>
            )}

            {isSubmit && (
              <Tooltip title="退回申请">
                <Popconfirm
                  title="是否退回？"
                  getPopupContainer={(node) => node.parentElement}
                  okButtonProps={{ style: { backgroundColor: "#198348" } }}
                  onConfirm={() => setRejectId(record.id)}
                >
                  <Button
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "3px 5px",
                    }}
                  >
                    <StopTwoTone twoToneColor="#198348" />
                  </Button>
                </Popconfirm>
              </Tooltip>
            )}
            <Tooltip title="查看审核日志">
              <Button
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "3px 5px",
                }}
                onClick={() => handleLogsOne(record.id)}
              >
                <CalendarTwoTone twoToneColor="#198348" />
              </Button>
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  const handleTableChange = (pagination, filters, sorter) => {
    // setProductId(filters.productName?.[0]);
    // setProjectType(filters.typeName?.[0]);
    // setProjectBrand(filters.brandName?.[0]);
    setProjectState(filters.state?.[0]);
    setSupplierId(filters.supplierName?.[0]);
  };

  return (
    <div className="p-2">
      <div className="flex flex-row gap-y-3 justify-between mb-4">
        <div className="flex flex-row gap-x-4">
          <Input
            placeholder="按项目名称搜索"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <Input
            placeholder="按申请人搜索"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>
      </div>
      <Table
        bordered
        // loading={loading}
        dataSource={data?.entity.data}
        scroll={{ scrollToFirstRowOnChange: true, y: "800px" }}
        columns={columns}
        pagination={{
          // 设置总条数
          total: data?.entity.total,
          // 显示总条数
          showTotal: (total) => `共 ${total} 条`,
          // 是否可以改变 pageSize
          showSizeChanger: true,

          // 改变页码时
          onChange: async (page) => {
            setPage(page);
          },
          // pageSize 变化的回调
          onShowSizeChange: async (page, size) => {
            setPage(page);
            setPageSize(size);
          },
        }}
        onChange={handleTableChange}
      />

      <Modal
        centered
        destroyOnClose
        title={operation === Operation.Add ? "添加申请" : "编辑申请"}
        open={modalOpen}
        onOk={handleOk}
        okButtonProps={{ style: { background: "#198348" } }}
        // confirmLoading={confirmLoading}
        onCancel={() => setModalOpen(false)}
        afterClose={() => form.resetFields()}
        style={{ minWidth: "650px" }}
        maskClosable={false}
      >
        <Form
          labelCol={{ span: 3 }}
          wrapperCol={{ span: 20 }}
          layout={"horizontal"}
          form={form}
          style={{ minWidth: 600, color: "#000" }}
        >
          <Form.Item
            label="项目"
            name="projectName"
            rules={[{ required: true, message: "项目名称不能为空" }]}
          >
            <Select
              placeholder="选择项目"
              optionFilterProp="children"
              filterOption={customerFilterOption}
              options={project?.map((con) => ({
                label: con.name,
                value: con.id,
              }))}
            />
          </Form.Item>
          <Form.Item
            label="供应商"
            name="supplierName"
            rules={[{ required: true, message: "客户名称不能为空" }]}
          >
            <Select
              placeholder="选择供应商"
              optionFilterProp="children"
              filterOption={customerFilterOption}
              options={supplier?.map((con) => ({
                label: con.name,
                value: con.id,
              }))}
            />
          </Form.Item>
          <Form.Item required label="币种" name="moneyType">
            <Input placeholder="币种" />
          </Form.Item>
          <Form.Item required label="金额" name="fee">
            <Input placeholder="金额" />
          </Form.Item>
          <Form.Item label="税号" name="taxationNumber">
            <Input placeholder="税号" />
          </Form.Item>
          <Form.Item label="开户行" name="bank">
            <Input placeholder="开户行" />
          </Form.Item>
          <Form.Item label="卡号" name="bankCard">
            <Input placeholder="卡号" />
          </Form.Item>
          <Form.Item
            label="应付日期"
            name="yfDate"
            getValueProps={(i) => ({ value: dayjs(i) })}
          >
            <DatePicker allowClear={false} />
          </Form.Item>
          <Form.Item label="备注" name="remark">
            <Input.TextArea placeholder="备注" maxLength={100} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        centered
        destroyOnClose
        footer={null}
        title={"审核日志"}
        open={!!logs}
        style={{ minWidth: "650px" }}
        onCancel={() => setLogs(undefined)}
        maskClosable={false}
      >
        <List
          pagination={{ position: "bottom", align: "end" }}
          dataSource={logs}
          renderItem={(item, index) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar
                    src={`https://xsgames.co/randomusers/avatar.php?g=pixel&key=${index}`}
                  />
                }
                title={item.state}
                description={`${item.userName} ${item.createTime} 备注：${
                  item.remark || ""
                } `}
              />
            </List.Item>
          )}
        />
      </Modal>

      {!!check && (
        <PaymentDetailModal data={check} onClose={() => setCheck(undefined)} />
      )}

      {!!detail && (
        <PaymentSubmitModal
          data={detail}
          onConfirm={() => {
            submitType === 0 ? handleSubmitToLD() : handleSubmitToCW();
          }}
          onClose={() => setDetail(undefined)}
        />
      )}

      {!!rejectId && (
        <RejectModal
          open={!!rejectId}
          onClose={() => setRejectId(undefined)}
          onReject={(value) => handleRejectOne(rejectId, value)}
        />
      )}
    </div>
  );
};

export default Role;
