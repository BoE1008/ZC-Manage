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
  Divider,
  Popconfirm,
  Popover,
  Checkbox,
} from "antd";
import {
  ProfileTwoTone,
  CalendarTwoTone,
  StopTwoTone,
  CheckCircleTwoTone,
  AppstoreTwoTone,
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
  const [searchNumValue, setSearchNumValue] = useState("");

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

  const [projectDateSort, setProjectDateSort] = useState("1");
  const [productId, setProductId] = useState();
  const [projectType, setProjectType] = useState();
  const [projectBrand, setProjectBrand] = useState();
  const [projectState, setProjectState] = useState();
  const [customerId, setCustomerId] = useState();

  useEffect(() => {
    (async () => {
      const res = await getDictById();
      setDict(res.entity);
      const customer = await getCustomersList(1, 1000);
      setCustomer(customer.entity.data);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const data = await getProjectsApproveList(
        page,
        pageSize,
        searchValue,
        searchNumValue,
        projectDateSort,
        productId,
        projectType,
        projectBrand,
        projectState,
        customerId
      );
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
  }, [
    page,
    pageSize,
    searchValue,
    searchNumValue,
    projectDateSort,
    productId,
    projectType,
    projectBrand,
    projectState,
    customerId,
  ]);

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

  useEffect(() => {
    const chart = echarts.init(chartRef.current);

    chart.setOption(option);

    return () => {
      chart.dispose();
    };
  }, [option]);

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

  const stateFilters = [
    {
      text: "未完结",
      value: "0",
    },
    {
      text: "待完结审批",
      value: "1",
    },
    {
      text: "已完结",
      value: "2",
    },
  ];

  const customerFilters = useMemo(() => {
    return customer?.map((item) => ({
      text: item.name,
      value: item.id,
    }));
  }, [customer]);

  const columns = useMemo(() => {
    return [
      {
        label: "项目编号",
        value: "项目编号",
        title: "项目编号",
        dataIndex: "projectNum",
        align: "center",
        fixed: "left",
        key: "projectNum",
      },
      {
        label: "项目名称",
        value: "项目名称",
        title: "项目名称",
        dataIndex: "name",
        align: "center",
        fixed: "left",
        key: "name",
        ellipsis: {
          showTitle: false,
        },
        render: (name) => (
          <Tooltip placement="topLeft" title={name}>
            {name}
          </Tooltip>
        ),
      },
      {
        label: "产品",
        value: "产品",
        title: "产品",
        dataIndex: "typeName",
        align: "center",
        key: "typeName",
        filterMultiple: false,
        filters: dict
          ?.find((con) => con.code === "sys_project_type")
          .childList?.map((con) => ({
            value: con.id,
            text: con.dictLabel,
          })),
        filterSearch: true,
        onFilter: (value: string, record) => record.typeId === value,
      },
      {
        label: "客户",
        value: "客户",
        title: "客户",
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
        label: "品牌",
        value: "品牌",
        title: "品牌",
        dataIndex: "brandName",
        align: "center",
        key: "brandName",
        filterMultiple: false,
        filters: dict
          ?.find((con) => con.code === "sys_project_brand")
          .childList?.map((con) => ({
            value: con.id,
            text: con.dictLabel,
          })),
        filterSearch: true,
        onFilter: (value: string, record) => record.brandId === value,
      },
      {
        label: "货物",
        value: "货物",
        title: "货物",
        dataIndex: "productName",
        align: "center",
        key: "productName",
        filterMultiple: false,
        filters: dict
          ?.find((con) => con.code === "sys_product_type")
          .childList?.map((con) => ({
            value: con.id,
            text: con.dictLabel,
          })),
        filterSearch: true,
        onFilter: (value: string, record) => record.productId === value,
      },
      {
        label: "发运日期",
        value: "发运日期",
        title: "发运日期",
        dataIndex: "projectDate",
        align: "center",
        key: "projectDate",
        sortDirections: ["ascend", "descend"],
        sorter: true,
      },
      {
        label: "服务内容",
        value: "服务内容",
        title: "服务内容",
        dataIndex: "serviceName",
        align: "center",
        key: "serviceName",
      },
      {
        label: "班列号/船名",
        value: "班列号/船名",
        title: "班列号/船名",
        dataIndex: "trainNumName",
        align: "center",
        key: "trainNumName",
      },
      {
        label: "数量",
        value: "数量",
        title: "数量",
        dataIndex: "num",
        align: "center",
        key: "num",
      },
      {
        label: "收入小计",
        value: "收入小计",
        title: "收入小计",
        // dataIndex: "proIncome",
        align: "center",
        key: "proIncome",
        render: (record) => formatNumber(record?.proIncome),
      },
      {
        label: "成本小计",
        value: "成本小计",
        title: "成本小计",
        // dataIndex: "proCost",
        align: "center",
        key: "proCost",
        render: (record) => formatNumber(record?.proCost),
      },
      {
        label: "利润",
        value: "利润",
        title: "利润",
        // dataIndex: "profit",
        align: "center",
        key: "profit",
        render: (record) => formatNumber(record?.profit),
      },
      {
        label: "扣除后利润",
        value: "扣除后利润",
        title: "扣除后利润",
        // dataIndex: "deductProfit",
        align: "center",
        key: "deductProfit",
        render: (record) => formatNumber(record?.deductProfit),
      },
      {
        label: "项目状态",
        value: "项目状态",
        title: "项目状态",
        // dataIndex: "state",
        align: "center",
        key: "state",
        render: (record) => `${record?.state}(${record?.waitApproveNum})`,
        filterMultiple: false,
        filters: stateFilters,
        filterSearch: true,
        onFilter: (value: string, record) =>
          record.state ===
          stateFilters.find((item) => value === item.value)?.text,
      },
      {
        label: "备注",
        value: "备注",
        title: "备注",
        dataIndex: "remark",
        align: "center",
        key: "remark",
      },
      {
        label: "操作",
        value: "操作",
        title: "操作",
        align: "center",
        key: "action",
        fixed: "right",
        render: (_, record: Company) => {
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
            </Space>
          );
        },
      },
    ];
  }, [dict]);

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
  }, [options, dict]);

  const handleTableChange = (pagination, filters, sorter) => {
    if (sorter.order === "ascend") {
      setProjectDateSort("0");
    } else if (sorter.order === "descend") {
      setProjectDateSort("1");
    } else {
      setProjectDateSort("");
    }

    console.log(filters, "filters");
    setProductId(filters.productName?.[0]);
    setProjectType(filters.typeName?.[0]);
    setProjectBrand(filters.brandName?.[0]);
    setProjectState(filters.state?.[0]);
    setCustomerId(filters.customName?.[0]);
  };

  return (
    <div className="w-full p-2" style={{ color: "#000" }}>
      {/* <div className="flex flex-row gap-y-3 justify-between">
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
            placeholder="按项目名称搜索"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <Input
            placeholder="按项目编号搜索"
            value={searchNumValue}
            onChange={(e) => setSearchNumValue(e.target.value)}
          />
        </Space>
      </div> */}
      <div className="flex flex-row gap-y-3 justify-between my-4 pr-[100px]">
        <div className="flex flex-row gap-x-10">
          <div className="flex flex-row gap-x-4">
            <Button
              onClick={handleExport}
              type="primary"
              style={{
                // marginBottom: 16,
                background: "#198348",
                height: "40px",
                width: "100px",
              }}
            >
              导出
            </Button>
          </div>

          <div className="flex flex-row gap-x-4">
            <Input
              placeholder="按项目名称搜索"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <Input
              placeholder="按项目编号搜索"
              value={searchNumValue}
              onChange={(e) => setSearchNumValue(e.target.value)}
            />
          </div>
        </div>

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
            <AppstoreTwoTone
              style={{ fontSize: "30px" }}
              twoToneColor="#198348"
              className="mr-15"
            />
          </Popover>
        </Space>
      </div>

      <Table
        bordered
        loading={loading}
        dataSource={data?.entity?.data}
        scroll={{ scrollToFirstRowOnChange: true, y: "800px" }}
        columns={displayColumn}
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
        onChange={handleTableChange}
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
          modalType={ModalType.CW}
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

      <Divider />

      {/* <div
        style={{ width: "100%", minHeight: "1000px", marginTop: "100px" }}
        ref={chartRef}
      ></div> */}
      <div
        style={{ width: "100%", minHeight: "1000px", marginTop: "100px" }}
        ref={chartRef}
      ></div>
    </div>
  );
};

export default Project;
