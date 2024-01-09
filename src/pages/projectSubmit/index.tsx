import { useEffect, useMemo, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Select,
  DatePicker,
  notification,
  List,
  Avatar,
  Popconfirm,
  Tooltip,
  Popover,
  Checkbox,
} from "antd";
import {
  EditTwoTone,
  ProfileTwoTone,
  DeleteTwoTone,
  InteractionTwoTone,
  CalendarTwoTone,
  AppstoreTwoTone,
} from "@ant-design/icons";
import {
  getProjectsSubmitList,
  addProject,
  updateProject,
  deleteProject,
  exportMyProject,
  submitOne,
  logsOne,
} from "@/restApi/project";
import { Company, ModalType, Operation } from "@/types";
import dayjs from "dayjs";
import { getDictById } from "@/restApi/dict";
import { getCustomersList } from "@/restApi/customer";
import YSYFModal from "@/components/YSYFModal";
import { formatNumber } from "@/utils";

const initialValues = {
  name: "",
  address: "",
  contactsName: "",
  contactsMobile: "",
  remark: "",
};

const Project = () => {
  const [data, setData] = useState();
  const [editId, setEditId] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [operation, setOperation] = useState<Operation>(Operation.Add);
  const [logs, setLogs] = useState();

  const [customer, setCustomer] = useState();

  const [loading, setLoading] = useState(true);

  const [dict, setDict] = useState();

  const [form] = Form.useForm();

  const [projectId, setProjectId] = useState();

  useEffect(() => {
    (async () => {
      const data = await getProjectsSubmitList(page, pageSize, searchValue);
      setData(data);
      setLoading(false);
    })();
  }, [page, pageSize, searchValue]);

  const handleAdd = async () => {
    form.setFieldsValue(initialValues);
    setOperation(Operation.Add);
    setModalOpen(true);
    const customer = await getCustomersList(1, 1000);
    const res = await getDictById();
    setDict(res.entity);
    setCustomer(customer.entity.data);
  };

  const handleEditOne = async (record: Company) => {
    setOperation(Operation.Edit);
    setEditId(record.id);
    form.setFieldsValue(record);
    setModalOpen(true);
    const customer = await getCustomersList(1, 1000);
    const res = await getDictById();
    setDict(res.entity);
    setCustomer(customer.entity.data);
  };

  const handleOk = async () => {
    form.validateFields();
    const values = form.getFieldsValue();
    const params = {
      ...values,
      projectDate: dayjs(values.projectDate).format("YYYY-MM-DD"),
    };
    const { code } =
      operation === Operation.Add
        ? await addProject(params)
        : await updateProject(editId, params);
    if (code === 200) {
      setModalOpen(false);
      const data = await getProjectsSubmitList(page, pageSize, searchValue);
      setData(data);
      notification.success({
        message: operation === Operation.Add ? "添加成功" : "编辑成功",
        duration: 3,
      });
    }
  };

  const handleDeleteOne = async (id: string) => {
    await deleteProject(id);
    const data = await getProjectsSubmitList(page, pageSize, searchValue);
    setData(data);
    setLoading(false);
  };

  const handleLogs = async (id: string) => {
    const res = await logsOne(id);
    setLogs(res.entity.data);
  };

  const handleSubmitOne = async (id: string) => {
    await submitOne(id);
    notification.success({ message: "提交成功" });
  };

  const handleExport = async () => {
    const file = await exportMyProject();
    window.open(
      `http://123.60.88.8/zc/common/download?fileName=${file.msg}&delete=false`
    );
  };

  const columns = [
    {
      title: "项目编号",
      label: "项目编号",
      value: "项目编号",
      dataIndex: "projectNum",
      align: "center",
      key: "projectNum",
    },
    {
      title: "项目名称",
      label: "项目名称",
      value: "项目名称",
      dataIndex: "name",
      align: "center",
      key: "name",
    },
    {
      title: "产品",
      label: "产品",
      value: "产品",
      dataIndex: "typeName",
      align: "center",
      key: "typeName",
    },
    {
      title: "客户",
      label: "客户",
      value: "客户",
      dataIndex: "customName",
      align: "center",
      key: "customName",
    },
    {
      title: "品牌",
      label: "品牌",
      value: "品牌",
      dataIndex: "brandName",
      align: "center",
      key: "brandName",
    },
    {
      title: "货物",
      label: "货物",
      value: "货物",
      dataIndex: "productName",
      align: "center",
      key: "productName",
    },
    {
      title: "发运日期",
      label: "发运日期",
      value: "发运日期",
      dataIndex: "projectDate",
      align: "center",
      key: "projectDate",
    },
    {
      title: "服务内容",
      label: "服务内容",
      value: "服务内容",
      dataIndex: "serviceName",
      align: "center",
      key: "serviceName",
    },
    {
      title: "班列号/船名",
      label: "班列号/船名",
      value: "班列号/船名",
      dataIndex: "trainNumName",
      align: "center",
      key: "trainNumName",
    },
    {
      title: "数量",
      label: "数量",
      value: "数量",
      dataIndex: "num",
      align: "center",
      key: "num",
    },
    {
      title: "收入小计",
      label: "收入小计",
      value: "收入小计",
      // dataIndex: "proIncome",
      align: "center",
      key: "proIncome",
      render: (record) => formatNumber(record?.proIncome),
    },
    {
      title: "成本小计",
      label: "成本小计",
      value: "成本小计",
      // dataIndex: "proCost",
      align: "center",
      key: "proCost",
      render: (record) => formatNumber(record?.proCost),
    },
    {
      title: "利润",
      label: "利润",
      value: "利润",
      // dataIndex: "profit",
      align: "center",
      key: "profit",
      render: (record) => formatNumber(record?.profit),
    },
    {
      title: "扣除后利润",
      label: "扣除后利润",
      value: "扣除后利润",
      // dataIndex: "deductProfit",
      align: "center",
      key: "deductProfit",
      render: (record) => formatNumber(record?.deductProfit),
    },
    {
      title: "项目状态",
      label: "项目状态",
      value: "项目状态",
      // dataIndex: "state",
      align: "center",
      key: "state",
      render: (record) => `${record?.state}(${record?.waitApproveNum})`,
    },
    {
      title: "备注",
      label: "备注",
      value: "备注",
      dataIndex: "remark",
      align: "center",
      key: "remark",
    },
    {
      title: "操作",
      label: "操作",
      value: "操作",
      align: "center",
      key: "action",
      render: (_, record) => {
        const unFinished = record.state === "未完结";
        return (
          <Space size="middle" className="flex flex-row !gap-x-1">
            {unFinished && (
              <Tooltip title={<span>编辑</span>}>
                <Button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "3px 5px",
                  }}
                  onClick={() => handleEditOne(record)}
                >
                  <EditTwoTone twoToneColor="#198348" />
                </Button>
              </Tooltip>
            )}
            <Tooltip title={<span>查看应收应付</span>}>
              <Button
                onClick={() => setProjectId(record.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "3px 5px",
                }}
              >
                <ProfileTwoTone twoToneColor="#198348" />
              </Button>
            </Tooltip>

            {unFinished && (
              <Tooltip title={<span>提交业务审核</span>}>
                <Popconfirm
                  title="是否提交审核？"
                  getPopupContainer={(node) => node.parentElement}
                  okButtonProps={{ style: { backgroundColor: "#198348" } }}
                  onConfirm={() => handleSubmitOne(record.id)}
                >
                  <Button
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "3px 5px",
                    }}
                  >
                    <InteractionTwoTone twoToneColor="#198348" />
                  </Button>
                </Popconfirm>
              </Tooltip>
            )}
            {unFinished && (
              <Tooltip title={<span>删除</span>}>
                <Popconfirm
                  title="是否删除？"
                  okButtonProps={{ style: { backgroundColor: "#198348" } }}
                  getPopupContainer={(node) => node.parentElement}
                  onConfirm={() => handleDeleteOne(record.id)}
                >
                  <Button
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "3px 5px",
                    }}
                  >
                    <DeleteTwoTone twoToneColor="#198348" />
                  </Button>
                </Popconfirm>
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

  const [options, setOptions] = useState(columns.map((c) => c.value));

  const filterOption = (
    input: string,
    option?: { label: string; value: string }
  ) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  const validateName = () => {
    return {
      validator: (_, value) => {
        if (value.trim() !== "") {
          return Promise.resolve();
        }
        return Promise.reject(new Error("请输入供应商名称"));
      },
    };
  };

  const onOptionChange = (con) => {
    setOptions(con);
  };

  const displayColumn = useMemo(() => {
    return options.map((con) => {
      return columns.find((item) => {
        return con === item.value;
      });
    });
  }, [options]);

  return (
    <div className="w-full p-2" style={{ color: "#000" }}>
      <div className="flex flex-row gap-y-3 justify-between">
        <Space>
          <Button
            onClick={handleAdd}
            type="primary"
            style={{ marginBottom: 16, background: "#198348", width: "100px" }}
          >
            添加
          </Button>
          <Button
            onClick={handleExport}
            type="primary"
            style={{ marginBottom: 16, background: "#198348", width: "100px" }}
          >
            导出
          </Button>
        </Space>

        <Space>
          <Popover
            content={
              <Checkbox.Group
                style={{ display: "flex", flexDirection: "column" }}
                options={columns?.map((c) => ({
                  label: c.label,
                  value: c.value,
                }))}
                defaultValue={columns.map((c) => c.value)}
                onChange={onOptionChange}
              ></Checkbox.Group>
            }
            title="显隐列"
            trigger="click"
          >
            <AppstoreTwoTone twoToneColor="#198348" />
          </Popover>
          <Input
            placeholder="名称"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </Space>
      </div>

      <Table
        bordered
        loading={loading}
        dataSource={data?.entity.data}
        columns={displayColumn?.length > 0 ? displayColumn : columns}
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
        onRow={(record) => {
          return {
            onDoubleClick: () => setProjectId(record.id),
          };
        }}
      />
      <Modal
        centered
        destroyOnClose
        title={operation === Operation.Add ? "添加项目" : "编辑项目"}
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
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
          layout={"horizontal"}
          form={form}
          initialValues={initialValues}
          style={{ minWidth: 600, color: "#000" }}
        >
          <Form.Item
            required
            label="名称"
            name="name"
            validateTrigger="onBlur"
            rules={[validateName]}
            hasFeedback
          >
            <Input placeholder="请输入项目名称" />
          </Form.Item>
          <Form.Item label="客户" name="customId">
            <Select
              showSearch
              placeholder="选择客户"
              optionFilterProp="children"
              filterOption={filterOption}
              options={customer?.map((con) => ({
                value: con.id,
                label: con.name,
              }))}
            />
          </Form.Item>
          <Form.Item
            label="产品"
            name="typeId"
            validateTrigger="onBlur"
            rules={[{ required: true, message: "请选择产品" }]}
            hasFeedback
          >
            <Select
              showSearch
              placeholder="选择产品"
              optionFilterProp="children"
              filterOption={filterOption}
              options={dict
                ?.find((con) => con.code === "sys_project_type")
                .childList?.map((con) => ({
                  value: con.id,
                  label: con.dictLabel,
                }))}
            />
          </Form.Item>
          <Form.Item label="品牌" name="brandId">
            <Select
              showSearch
              placeholder="选择品牌"
              optionFilterProp="children"
              filterOption={filterOption}
              options={dict
                ?.find((con) => con.code === "sys_project_brand")
                ?.childList?.map((con) => ({
                  value: con.id,
                  label: con.dictLabel,
                }))}
            />
          </Form.Item>
          <Form.Item label="货物" name="productId">
            <Select
              showSearch
              placeholder="选择货物"
              optionFilterProp="children"
              filterOption={filterOption}
              options={dict
                ?.find((con) => con.code === "sys_product_type")
                ?.childList?.map((con) => ({
                  value: con.id,
                  label: con.dictLabel,
                }))}
            />
          </Form.Item>
          <Form.Item label="服务内容" name="serviceId">
            <Select
              showSearch
              placeholder="选择服务内容"
              optionFilterProp="children"
              filterOption={filterOption}
              options={dict
                ?.find((con) => con.code === "sys_service_content")
                ?.childList?.map((con) => ({
                  value: con.id,
                  label: con.dictLabel,
                }))}
            />
          </Form.Item>
          <Form.Item label="班列号/船名" name="trainNumName">
            <Input placeholder="数量" />
          </Form.Item>
          <Form.Item label="数量" name="num">
            <Input placeholder="数量" />
          </Form.Item>
          <Form.Item
            label="发运日期"
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

      {!!projectId && (
        <YSYFModal
          modalType={ModalType.Submit}
          projectId={projectId}
          onClose={() => setProjectId(undefined)}
        />
      )}
    </div>
  );
};

export default Project;
