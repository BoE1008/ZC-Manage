import { useEffect, useState, useRef, useMemo } from "react";
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
  Tooltip,
  Popconfirm,
} from "antd";
import {
  ProfileTwoTone,
  CalendarTwoTone,
  StopTwoTone,
  CheckCircleTwoTone,
} from "@ant-design/icons";
import {
  getProjectsApproveList,
  addProject,
  updateProject,
  deleteProject,
  exportProject,
  approveOne,
  rejectOne,
  logsOne,
  getProjectDetailById,
} from "@/restApi/project";
import { Company, ModalType, Operation } from "@/types";
import dayjs from "dayjs";
import { getDictById } from "@/restApi/dict";
import { getCustomersList } from "@/restApi/customer";
import YSYFModal from "@/components/YSYFModal";
import RejectModal from "@/components/RejectModal";
import { formatNumber } from "@/utils";
import * as echarts from "echarts";

const initialValues = {
  name: "",
  address: "",
  contactsName: "",
  contactsMobile: "",
  remark: "",
};

const Project = () => {
  const [data, setData] = useState([]);
  const [editId, setEditId] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [operation, setOperation] = useState<Operation>(Operation.Add);
  const [logs, setLogs] = useState();

  const [customer, setCustomer] = useState();

  const [fileName, setFileName] = useState();

  const [loading, setLoading] = useState(true);

  const [dict, setDict] = useState();

  const [form] = Form.useForm();

  const [projectId, setProjectId] = useState();

  const [rejectId, setRejectId] = useState();
  const [detail, setDetail] = useState();

  const chartRef = useRef(null);
  const [options, setOptions] = useState();

  useEffect(() => {
    (async () => {
      const data = await getProjectsApproveList(page, pageSize, searchValue);
      const customer = await getCustomersList(1, 1000);
      const res = await getDictById();
      setDict(res.entity);
      setDict;
      setCustomer(customer.entity.data);
      // const file = await exportProject();
      setLoading(false);
      setData(data);
      // setFileName(file.msg);
    })();
  }, [page, pageSize, searchValue]);

  const option = useMemo(() => {
    return {
      title: { text: "项目图", left: "center" },
      tooltip: {
        trigger: "axis",
      },
      legend: {
        data: ["收入小计", "成本小计", "利润", "扣除后利润"],
        show: true,
        right: "20px",
        orient: "vertical",
      },
      yAxis: {
        type: "category",
        data: data?.entity?.data?.map((c) => c.name),
        axisPointer: {
          type: "shadow",
        },
        axisLabel: {
          rotate: 45,
        },
      },
      xAxis: {
        type: "value",
      },
      series: [
        {
          data: data?.entity?.data?.map((c) => c.proIncome),
          type: "bar",
          name: "收入小计",
        },
        {
          data: data?.entity?.data?.map((c) => c.proCost),
          type: "bar",
          name: "成本小计",
        },
        {
          data: data?.entity?.data?.map((c) => c.profit),
          type: "bar",
          name: "利润",
        },
        {
          data: data?.entity?.data?.map((c) => c.deductProfit),
          type: "bar",
          name: "扣除后利润",
        },
      ],
    };
  }, [data]);

  // useEffect(() => {
  //   const chart = echarts.init(chartRef.current);

  //   chart.setOption(option);

  //   return () => {
  //     chart.dispose();
  //   };
  // }, [option]);

  const handleAdd = async () => {
    form.setFieldsValue(initialValues);
    setOperation(Operation.Add);
    setModalOpen(true);
  };

  const handleEditOne = (record: Company) => {
    setOperation(Operation.Edit);
    setEditId(record.id);
    form.setFieldsValue(record);
    setModalOpen(true);
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
      const data = await getProjectsApproveList(page, pageSize, searchValue);
      setData(data);
      notification.success({
        message: operation === Operation.Add ? "添加成功" : "编辑成功",
        duration: 3,
      });
    }
  };

  const handleDeleteOne = async (id: string) => {
    await deleteProject(id);
    const data = await getProjectsApproveList(page, pageSize, searchValue);
    setData(data);
    setLoading(false);
  };

  const handleDetail = async (id) => {
    const res = await getProjectDetailById(id);
    setDetail(res.entity.data);
  };

  const handleApproveOne = async (id) => {
    await approveOne(id);
    notification.success({ message: "审核完成" });
    setDetail(undefined);
    const data = await getProjectsApproveList(page, pageSize, searchValue);
    setData(data);
    setLoading(false);
  };

  const handleRejectOne = async (projectId: string, remark) => {
    await rejectOne(projectId, remark);
    notification.success({ message: "审核退回" });
    setRejectId(undefined);
    const data = await getProjectsApproveList(page, pageSize, searchValue);
    setData(data);
    setLoading(false);
  };

  const handleLogs = async (id: string) => {
    const res = await logsOne(id);
    setLogs(res.entity.data);
  };

  const handleExport = async () => {
    const file = await exportProject();
    window.open(
      `http://123.60.88.8/zc/common/download?fileName=${file.msg}&delete=false`
    );
  };

  const columns = [
    {
      title: "项目编号",
      dataIndex: "projectNum",
      align: "center",
      key: "projectNum",
    },
    {
      title: "项目名称",
      dataIndex: "name",
      align: "center",
      key: "name",
    },
    {
      title: "产品",
      dataIndex: "typeName",
      align: "center",
      key: "typeName",
    },
    {
      title: "客户",
      dataIndex: "customName",
      align: "center",
      key: "customName",
    },
    {
      title: "品牌",
      dataIndex: "brandName",
      align: "center",
      key: "brandName",
    },
    {
      title: "货物",
      dataIndex: "productName",
      align: "center",
      key: "productName",
    },
    {
      title: "发运日期",
      dataIndex: "projectDate",
      align: "center",
      key: "projectDate",
    },
    {
      title: "服务内容",
      dataIndex: "serviceName",
      align: "center",
      key: "serviceName",
    },
    {
      title: "班列号/船名",
      dataIndex: "trainNumName",
      align: "center",
      key: "trainNumName",
    },
    {
      title: "数量",
      dataIndex: "num",
      align: "center",
      key: "num",
    },
    {
      title: "收入小计",
      // dataIndex: "proIncome",
      align: "center",
      key: "proIncome",
      render: (record) => formatNumber(record?.proIncome),
    },
    {
      title: "成本小计",
      // dataIndex: "proCost",
      align: "center",
      key: "proCost",
      render: (record) => formatNumber(record?.proCost),
    },
    {
      title: "利润",
      // dataIndex: "profit",
      align: "center",
      key: "profit",
      render: (record) => formatNumber(record?.profit),
    },
    {
      title: "扣除后利润",
      // dataIndex: "deductProfit",
      align: "center",
      key: "deductProfit",
      render: (record) => formatNumber(record?.deductProfit),
    },
    {
      title: "项目状态",
      // dataIndex: "state",
      align: "center",
      key: "state",
      render: (record) => `${record?.state}(${record?.waitApproveNum})`,
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
      render: (_, record: Company) => {
        const unSubmit = record.state === "未完结";
        const isApprove = record.state === "待完结审批";
        // const isFinished = record.state === "已完结";
        return (
          <Space size="middle" className="flex flex-row !gap-x-1">
            <Tooltip title="查看应收应付">
              <Button
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "3px 5px",
                }}
                onClick={() => setProjectId(record.id)}
              >
                <ProfileTwoTone twoToneColor="#198348" />
              </Button>
            </Tooltip>

            {isApprove && (
              <Tooltip title="完成审核">
                <Popconfirm
                  title="是否通过审核？"
                  okButtonProps={{ style: { backgroundColor: "#198348" } }}
                  getPopupContainer={(node) => node.parentElement}
                  onConfirm={() => handleApproveOne(record?.id)}
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

            {!unSubmit && (
              <Tooltip title="退回">
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
            )}

            {/* <Tooltip title="查看审核日志">
              <Button
                onClick={() => handleLogs(record.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "3px 5px",
                }}
              >
                <CalendarTwoTone twoToneColor="#198348" />
              </Button>
            </Tooltip> */}

            {/* <Tooltip title="删除">
              <Popconfirm
                title="是否删除？"
                okButtonProps={{ style: { backgroundColor: "#198348" } }}
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
            </Tooltip> */}
          </Space>
        );
      },
    },
  ];

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

  return (
    <div className="w-full p-2" style={{ color: "#000" }}>
      <div className="flex flex-row gap-y-3 justify-between">
        <Space>
          <Button
            onClick={handleExport}
            type="primary"
            style={{ marginBottom: 16, background: "#198348", width: "100px" }}
          >
            导出
          </Button>
        </Space>

        <Space>
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
        dataSource={data?.entity?.data}
        scroll={{ scrollToFirstRowOnChange: true, y: "800px" }}
        columns={columns}
        pagination={{
          // 设置总条数
          total: data?.entity?.total,
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
          labelCol={{ span: 3 }}
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
              placeholder="选择客户"
              optionFilterProp="children"
              // filterOption={customerFilterOption}
              // options={project?.map((con) => ({
              //   label: con.name,
              //   value: con.id,
              // }))}
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
              placeholder="选择品牌"
              optionFilterProp="children"
              // filterOption={customerFilterOption}
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
              placeholder="选择货物"
              optionFilterProp="children"
              // filterOption={customerFilterOption}
              // options={project?.map((con) => ({
              //   label: con.name,
              //   value: con.id,
              // }))}
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
              placeholder="选择服务内容"
              optionFilterProp="children"
              options={dict
                ?.find((con) => con.code === "sys_service_content")
                ?.childList?.map((con) => ({
                  value: con.id,
                  label: con.dictLabel,
                }))}
              // filterOption={customerFilterOption}
              // options={project?.map((con) => ({
              //   label: con.name,
              //   value: con.id,
              // }))}
            />
          </Form.Item>
          <Form.Item label="班列号/船名" name="trainNumName">
            <Input placeholder="数量" />
          </Form.Item>
          <Form.Item label="数量" name="num">
            <Input placeholder="数量" />
          </Form.Item>
          <Form.Item
            label="日期"
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
          modalType={ModalType.Approve}
          projectId={projectId}
          onClose={() => setProjectId(undefined)}
        />
      )}

      {!!rejectId && (
        <RejectModal
          open={!!rejectId}
          onClose={() => setRejectId(undefined)}
          onReject={(value) => handleRejectOne(rejectId, value)}
        />
      )}

      {/* <div
        style={{ width: "100%", minHeight: "1000px", marginTop: "100px" }}
        ref={chartRef}
      ></div> */}
      {/* <div style={{ width: '100%', minHeight: "1000px", marginTop: '100px' }} ref={chartRef}></div> */}
    </div>
  );
};

export default Project;
