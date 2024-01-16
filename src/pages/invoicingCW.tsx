import {
  getinvoicingCWList,
  addInvoicing,
  updateInvoicing,
  approveOne,
  rejectOne,
  logsOne,
  getInvoicingDetailById,
} from "@/restApi/invoicing";
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
  notification,
  List,
  Avatar,
  Tooltip,
  Popconfirm,
} from "antd";
import { Operation } from "@/types";
import dayjs from "dayjs";
import { getProjectsSubmitList } from "@/restApi/project";
import {
  EditTwoTone,
  DeleteTwoTone,
  CheckCircleTwoTone,
  StopTwoTone,
  CalendarTwoTone,
} from "@ant-design/icons";
import { getCustomersYSList, getCustomersList } from "@/restApi/customer";
import RejectModal from "@/components/RejectModal";
import InvoicingSubmitModal from "@/components/InvoicingSubmitModal";
import InvoicingDetailModal from "@/components/InvoicingDetailModal";
import { formatNumber } from "@/utils";

const InvoicingSubmit = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState();
  const [customer, setCustomer] = useState();
  const [project, setProject] = useState();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState("");
  const [userName, setUserName] = useState("");

  const [logs, setLogs] = useState();

  const [modalOpen, setModalOpen] = useState(false);
  const [operation, setOperation] = useState<Operation>(Operation.Add);
  const [editId, setEditId] = useState("");
  const [loading, setLoading] = useState(true);

  const [rejectId, setRejectId] = useState();

  const [detail, setDetail] = useState();
  const [check, setCheck] = useState();

  const [customerId, setCustomerId] = useState();
  const [projectState, setProjectState] = useState();

  useEffect(() => {
    (async () => {
      const customer = await getCustomersList(1, 1000);
      setCustomer(customer.entity.data);
      const projectData = await getProjectsSubmitList(1, 10000);
      setProject(projectData.entity.data);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const res = await getinvoicingCWList(
        page,
        pageSize,
        searchValue,
        customerId,
        projectState,
        userName
      );
      setData(res);
    })();
  }, [page, pageSize, searchValue, customerId, projectState, userName]);

  const handleLogsOne = async (id: string) => {
    const res = await logsOne(id);
    setLogs(res.entity.data);
  };

  const handleOk = async () => {
    form.validateFields();
    const values = form.getFieldsValue();
    const params = {
      ...values,
      projectId: values.projectName.value,
      projectName: values.projectName.label,
      customId: values.customName.value,
      customName: values.customName.label,
    };
    setLoading(true);
    const { code } = await updateInvoicing(editId, params);
    if (code === 200) {
      setModalOpen(false);
      const data = await getinvoicingCWList(page, pageSize);
      setLoading(false);
      setData(data);
      notification.success({
        message: operation === Operation.Add ? "添加成功" : "编辑成功",
        duration: 3,
      });
    }
  };

  const handleDetail = async (id) => {
    const res = await getInvoicingDetailById(id);
    setDetail(res.entity.data);
  };

  const handleCheck = async (id) => {
    const res = await getInvoicingDetailById(id);
    setCheck(res.entity.data);
  };

  const handleApprove = async () => {
    await approveOne(detail.id);
    notification.success({ message: "审核完成" });
    setDetail(undefined);
    const data = await getinvoicingCWList(page, pageSize);
    setLoading(false);
    setData(data);
  };

  const handleReject = async (invoicingId: string, remark: string) => {
    await rejectOne(invoicingId, remark, 3);
    notification.success({ message: "申请已退回" });
    setRejectId(undefined);
    const data = await getinvoicingCWList(page, pageSize);
    setLoading(false);
    setData(data);
  };

  const handleProjectChanged = async (param) => {
    const projectCustom = await getCustomersYSList(param.value);
    setCustomer(projectCustom.entity.data);
  };

  const customerFilterOption = (
    input: string,
    option?: { label: string; value: string }
  ) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  const customerFilters = useMemo(() => {
    return customer?.map((item) => ({
      text: item.name,
      value: item.id,
    }));
  }, [customer]);

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
      title: "客戶名称",
      dataIndex: "customName",
      align: "center",
      key: "customName",
      ellipsis: {
        showTitle: false,
      },
      render: (customName) => (
        <Tooltip placement="topLeft" title={customName}>
          {customName}
        </Tooltip>
      ),
      filterMultiple: false,
      filters: customerFilters,
      filterSearch: true,
      onFilter: (value: string, record) => record.customId === value,
    },
    {
      title: "开票票种",
      dataIndex: "invoicingType",
      align: "center",
      key: "invoicingType",
    },
    {
      title: "开票内容",
      dataIndex: "content",
      align: "center",
      key: "content",
    },
    {
      title: "开票币种",
      dataIndex: "moneyType",
      align: "center",
      key: "moneyType",
    },
    {
      title: "开票金额",
      align: "center",
      // dataIndex: "fee",
      key: "fee",
      render: (record) => formatNumber(record?.fee),
    },

    {
      title: "税号",
      dataIndex: "taxationNumber",
      align: "center",
      key: "taxationNumber",
    },
    {
      title: "开户行",
      dataIndex: "bank",
      align: "center",
      key: "bank",
    },
    {
      title: "卡号",
      dataIndex: "bankCard",
      align: "center",
      key: "bankCard",
    },
    {
      title: "地址",
      dataIndex: "address",
      align: "center",
      key: "address",
    },
    {
      title: "联系电话",
      dataIndex: "phone",
      align: "center",
      key: "phone",
    },
    {
      title: "申请人",
      dataIndex: "userName",
      align: "center",
      key: "userName",
    },
    {
      title: "申请时间",
      dataIndex: "createTime",
      align: "center",
      key: "createTime",
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
        const isSubmit = record.state === "待财务审批";
        return (
          <Space size="middle" className="flex flex-row !gap-x-1">
            {isSubmit && (
              <Tooltip title="申请通过">
                <Popconfirm
                  title="是否通过申请？"
                  getPopupContainer={(node) => node.parentElement}
                  okButtonProps={{ style: { backgroundColor: "#198348" } }}
                  onConfirm={() => {
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
            {
              <Tooltip title="退回申请">
                <Popconfirm
                  title="是否退回申请？"
                  okButtonProps={{ style: { backgroundColor: "#198348" } }}
                  getPopupContainer={(node) => node.parentElement}
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
            }
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
    setCustomerId(filters.customName?.[0]);
  };

  return (
    <div className="p-2">
      <div className="flex flex-row gap-y-3 justify-between mb-4">
        <Space>
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
        </Space>
      </div>
      <Table
        bordered
        // loading={loading}
        dataSource={data?.entity.data}
        columns={columns}
        scroll={{ scrollToFirstRowOnChange: true, y: "800px" }}
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
              showSearch
              placeholder="选择项目"
              optionFilterProp="children"
              filterOption={customerFilterOption}
              options={project?.map((con) => ({
                label: con.name,
                value: con.id,
              }))}
              onChange={handleProjectChanged}
            />
          </Form.Item>
          <Form.Item
            label="客户"
            name="customName"
            rules={[{ required: true, message: "客户名称不能为空" }]}
          >
            <Select
              showSearch
              placeholder="选择客户"
              optionFilterProp="children"
              filterOption={customerFilterOption}
              options={customer?.map((con) => ({
                label: con.name,
                value: con.id,
              }))}
            />
          </Form.Item>
          <Form.Item required label="票种" name="invoicingType">
            <Input placeholder="票种" />
          </Form.Item>
          <Form.Item required label="内容" name="content">
            <Input placeholder="内容" />
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
          <Form.Item label="地址" name="address">
            <Input placeholder="地址" />
          </Form.Item>
          <Form.Item label="联系电话" name="phone">
            <Input placeholder="联系电话" />
          </Form.Item>
          <Form.Item required label="申请人" name="createBy">
            <Input placeholder="申请人" />
          </Form.Item>
          <Form.Item
            label="申请时间"
            name="projectDate"
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
        <InvoicingDetailModal
          data={check}
          onClose={() => setCheck(undefined)}
        />
      )}

      {!!detail && (
        <InvoicingSubmitModal
          data={detail}
          onConfirm={handleApprove}
          onClose={() => {
            setDetail(undefined);
          }}
        />
      )}

      {!!rejectId && (
        <RejectModal
          open={!!rejectId}
          onClose={() => setRejectId(undefined)}
          onReject={(value) => handleReject(rejectId, value)}
        />
      )}
    </div>
  );
};

export default InvoicingSubmit;
