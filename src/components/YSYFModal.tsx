import {
  getProjectYSList,
  addProjectYS,
  updateProjectYS,
  addProjectYf,
  updateProjectYf,
  approveYF,
  rejectYF,
  rejectYS,
  approveYS,
  logsOne,
  getProjectDetailById,
  submitYF,
  submitYS,
  deleteYF,
  deleteYS,
  updateYFThreeStatus,
  updateYSThreeStatus,
} from "@/restApi/project";
import { useEffect, useState } from "react";
import {
  Form,
  Table,
  Modal,
  Input,
  Button,
  Space,
  Select,
  InputNumber,
  notification,
  Tooltip,
  Popconfirm,
  List,
  Avatar,
  Switch,
} from "antd";
import {
  EditTwoTone,
  PlusSquareTwoTone,
  DeleteTwoTone,
  CheckCircleTwoTone,
  StopTwoTone,
  CalendarTwoTone,
  InteractionTwoTone,
} from "@ant-design/icons";
import { Operation, ModalType } from "@/types";
import { getCustomersList } from "@/restApi/customer";
import { getSuppliersList } from "@/restApi/supplyer";
import dayjs from "dayjs";
import { BooltypeArr } from "@/utils/const";
import RejectModal from "@/components/RejectModal";
import { formatNumber } from "@/utils";

const Item = ({ projectId, onClose, modalType }) => {
  const [data, setData] = useState();
  const [ysModalOpen, setYsModalOpen] = useState(false);
  const [yfModalOpen, setYfModalOpen] = useState(false);
  const [operation, setOperation] = useState<Operation>(Operation.Add);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [ysEditId, setYsEditId] = useState("");
  const [yfEditId, setYfEditId] = useState("");

  const [loading, setLoading] = useState(true);

  const [form] = Form.useForm();
  const [form1] = Form.useForm();

  const [customer, setCustomer] = useState();
  const [suppliers, setSuppliers] = useState();

  const [logs, setLogs] = useState();
  const [projectState, setProjectState] = useState("");

  const [rejectId, setRejectId] = useState();
  const [rejectType, setRejectType] = useState();

  useEffect(() => {
    (async () => {
      const data = await getProjectYSList(projectId as string, page, pageSize);
      const customerData = await getCustomersList(1, 10000);
      const supplierData = await getSuppliersList(1, 10000);
      const state = await getProjectDetailById(projectId);
      setLoading(false);
      setData({
        ...data,
        entity: {
          ...data.entity,
          data: data.entity.data.map((item, index) => ({
            key: index,
            ...item,
          })),
        },
      });
      setCustomer(customerData.entity.data);
      setSuppliers(supplierData.entity.data);
      setProjectState(state.entity.data.state);
    })();
  }, [projectId, page, pageSize]);

  const handleYfAddClick = (record) => {
    setYsEditId(record.id);
    setOperation(Operation.Add);
    setYfModalOpen(true);
  };

  const handleEditYfOne = async (record) => {
    setOperation(Operation.Edit);
    setYfEditId(record.id);
    form1.setFieldsValue(record);
    setYfModalOpen(true);
  };

  const handleYfOk = async () => {
    form1.validateFields();
    const values = form1.getFieldsValue();
    const params = {
      ...values,
      yfDate: dayjs(values.yfDate).format("YYYY-MM-DD"),
      yfChecking: values.yfChecking?.value || "x",
      isPay: values.isPay?.value || "x",
      yfCollection: values.yfCollection?.value || "x",
      yfInvoice: values.yfInvoice?.value || "x",
    };

    const { code } =
      operation === Operation.Add
        ? await addProjectYf({ ...params, projectId, ysId: ysEditId })
        : await updateProjectYf(yfEditId, params);

    if (code === 200) {
      setYfModalOpen(false);
      const data = await getProjectYSList(projectId as string, page, pageSize);
      setData({
        ...data,
        entity: {
          ...data.entity,
          data: data.entity.data.map((item, index) => ({
            key: index,
            ...item,
          })),
        },
      });
      notification.success({
        message: operation === Operation.Add ? "添加成功" : "编辑成功",
        duration: 3,
      });
    }
  };

  const handleLogs = async (id: string) => {
    const res = await logsOne(id);
    setLogs(res.entity.data);
  };

  const handleApproveYF = async (id) => {
    await approveYF(projectId, id);
    const data = await getProjectYSList(projectId as string, page, pageSize);
    setData({
      ...data,
      entity: {
        ...data.entity,
        data: data.entity.data.map((item, index) => ({
          key: index,
          ...item,
        })),
      },
    });
  };

  const handleApproveYS = async (id) => {
    await approveYS(projectId, id);
    const data = await getProjectYSList(projectId as string, page, pageSize);
    setData({
      ...data,
      entity: {
        ...data.entity,
        data: data.entity.data.map((item, index) => ({
          key: index,
          ...item,
        })),
      },
    });
  };

  const handleRejectOne = async (id, value) => {
    rejectType === "YF"
      ? await rejectYF(projectId, id, value)
      : await rejectYS(projectId, id, value);
    setRejectId(undefined);
    const data = await getProjectYSList(projectId as string, page, pageSize);
    setData({
      ...data,
      entity: {
        ...data.entity,
        data: data.entity.data.map((item, index) => ({
          key: index,
          ...item,
        })),
      },
    });
  };

  const handleSubmitYF = async (record) => {
    await submitYF(projectId, record?.id);
    notification.success({ message: "已提交至业务审核" });
    const data = await getProjectYSList(projectId as string, page, pageSize);
    setData({
      ...data,
      entity: {
        ...data.entity,
        data: data.entity.data.map((item, index) => ({
          key: index,
          ...item,
        })),
      },
    });
  };

  const handleSubmitYS = async (record) => {
    await submitYS(projectId, record?.id);
    notification.success({ message: "已提交至业务审核" });
    const data = await getProjectYSList(projectId as string, page, pageSize);
    setData({
      ...data,
      entity: {
        ...data.entity,
        data: data.entity.data.map((item, index) => ({
          key: index,
          ...item,
        })),
      },
    });
  };

  const handleDeleteYF = async (id) => {
    await deleteYF(id, projectId);
    const data = await getProjectYSList(projectId as string, page, pageSize);
    setData({
      ...data,
      entity: {
        ...data.entity,
        data: data.entity.data.map((item, index) => ({
          key: index,
          ...item,
        })),
      },
    });
  };

  const handleDeleteYS = async (id) => {
    await deleteYS(id, projectId);
    const data = await getProjectYSList(projectId as string, page, pageSize);
    setData({
      ...data,
      entity: {
        ...data.entity,
        data: data.entity.data.map((item, index) => ({
          key: index,
          ...item,
        })),
      },
    });
  };

  const handleYFChecking = async (id, value) => {
    await updateYFThreeStatus({ id, yfChecking: value ? "0" : "1" });
    const data = await getProjectYSList(projectId as string, page, pageSize);
    setData({
      ...data,
      entity: {
        ...data.entity,
        data: data.entity.data.map((item, index) => ({
          key: index,
          ...item,
        })),
      },
    });
  };
  const handleYFInvoicing = async (id, value) => {
    await updateYFThreeStatus({ id, yfInvoice: value ? "0" : "1" });
    const data = await getProjectYSList(projectId as string, page, pageSize);
    setData({
      ...data,
      entity: {
        ...data.entity,
        data: data.entity.data.map((item, index) => ({
          key: index,
          ...item,
        })),
      },
    });
  };
  const handleYFCollection = async (id, value) => {
    await updateYFThreeStatus({ id, yfCollection: value ? "0" : "1" });
    const data = await getProjectYSList(projectId as string, page, pageSize);
    setData({
      ...data,
      entity: {
        ...data.entity,
        data: data.entity.data.map((item, index) => ({
          key: index,
          ...item,
        })),
      },
    });
  };

  const handleYSChecking = async (id, value) => {
    await updateYSThreeStatus({ id, ysChecking: value ? "0" : "1" });
    const data = await getProjectYSList(projectId as string, page, pageSize);
    setData({
      ...data,
      entity: {
        ...data.entity,
        data: data.entity.data.map((item, index) => ({
          key: index,
          ...item,
        })),
      },
    });
  };
  const handleYSInvoicing = async (id, value) => {
    await updateYSThreeStatus({ id, ysInvoice: value ? "0" : "1" });
    const data = await getProjectYSList(projectId as string, page, pageSize);
    setData({
      ...data,
      entity: {
        ...data.entity,
        data: data.entity.data.map((item, index) => ({
          key: index,
          ...item,
        })),
      },
    });
  };
  const handleYSCollection = async (id, value) => {
    await updateYSThreeStatus({ id, ysCollection: value ? "0" : "1" });
    const data = await getProjectYSList(projectId as string, page, pageSize);
    setData({
      ...data,
      entity: {
        ...data.entity,
        data: data.entity.data.map((item, index) => ({
          key: index,
          ...item,
        })),
      },
    });
  };

  const expandedRowRender = (record) => {
    const littleTableColumn = [
      {
        title: "",
        dataIndex: "",
        key: "",
        width: 60,
      },
      {
        title: "供应商",
        dataIndex: "supplierName",
        key: "supplierName",
        align: "center",
      },
      {
        title: "人民币",
        key: "yfRmb",
        align: "center",
        render: (record) => formatNumber(record?.yfRmb),
      },
      {
        title: "美金",
        key: "yfDollar",
        align: "center",
        render: (record) => formatNumber(record?.yfDollar),
      },
      {
        title: "明细",
        dataIndex: "yfPurpose",
        key: "yfPurpose",
        align: "center",
      },
      {
        title: "汇率",
        dataIndex: "yfExrate",
        key: "yfExrate",
        align: "center",
      },
      {
        title: "对账",
        // dataIndex: "yfChecking",
        key: "yfChecking",
        align: "center",
        render: (record) => {
          return modalType !== ModalType.Approve ? (
            record.ysChecking === "0" ? (
              "√"
            ) : (
              "×"
            )
          ) : (
            <Switch
              checked={record.yfChecking === "0"}
              onChange={(value) => handleYFChecking(record.id, value)}
            />
          );
        },
      },
      {
        key: "yfInvoice",
        title: "开票",
        // dataIndex: "yfInvoice",
        align: "center",
        render: (record) => {
          return modalType === ModalType.CW ? (
            <Switch
              checked={record.yfInvoice === "0"}
              onChange={(value) => handleYFInvoicing(record.id, value)}
            />
          ) : record.ysInvoice === "0" ? (
            "√"
          ) : (
            "×"
          );
        },
      },
      {
        title: "付款",
        // dataIndex: "yfCollection",
        key: "yfCollection",
        align: "center",
        render: (record) => {
          return modalType === ModalType.CW ? (
            <Switch
              checked={record.yfCollection === "0"}
              onChange={(value) => handleYFCollection(record.id, value)}
            />
          ) : record.ysInvoice === "0" ? (
            "√"
          ) : (
            "×"
          );
        },
      },
      {
        title: "预留利润名称",
        dataIndex: "ylProfitName",
        key: "ylProfitName",
        align: "center",
      },
      {
        title: "预留利润金额",
        dataIndex: "ylProfitMoney",
        key: "ylProfitMoney",
        align: "center",
        render: (record) => formatNumber(record?.ylProfitMoney),
      },
      {
        title: "是否支付",
        dataIndex: "isPay",
        key: "isPay",
        align: "center",
      },

      {
        title: "审核状态",
        dataIndex: "state",
        key: "state",
        align: "center",
      },
      {
        title: "备注",
        dataIndex: "remark",
        key: "remark",
        align: "center",
      },
      {
        title: "操作",
        key: "operation",
        align: "center",
        render: (_, record) => {
          return (
            <Space size="middle" className="flex flex-row !gap-x-1">
              {modalType === ModalType.Submit && projectState === "未完结" && (
                <>
                  {record?.state !== "审批通过" && (
                    <Tooltip title="编辑">
                      <Button
                        style={{
                          display: "flex",
                          alignItems: "center",
                          padding: "3px 5px",
                        }}
                        onClick={() => handleEditYfOne(record)}
                      >
                        <EditTwoTone twoToneColor="#198348" />
                      </Button>
                    </Tooltip>
                  )}
                  {record?.state === "未提交" && (
                    <Tooltip title="提交至业务审核">
                      <Button
                        style={{
                          display: "flex",
                          alignItems: "center",
                          padding: "3px 5px",
                        }}
                        onClick={() => handleSubmitYF(record)}
                      >
                        <InteractionTwoTone twoToneColor="#198348" />
                      </Button>
                    </Tooltip>
                  )}
                  {record?.state !== "审批通过" && (
                    <Tooltip title="删除">
                      <Popconfirm
                        title="是否删除？"
                        okButtonProps={{
                          style: { backgroundColor: "#198348" },
                        }}
                        getPopupContainer={(node) => node.parentElement}
                        onConfirm={() => handleDeleteYF(record.id)}
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
                </>
              )}
              {modalType === ModalType.Approve &&
                record.state !== "审批通过" && (
                  <>
                    {record?.state === "待业务审批" && (
                      <Tooltip title="批准">
                        <Popconfirm
                          title="是否通过审批？"
                          okButtonProps={{
                            style: { backgroundColor: "#198348" },
                          }}
                          getPopupContainer={(node) => node.parentElement}
                          onConfirm={() => handleApproveYF(record.id)}
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
                    <Tooltip title="退回">
                      <Popconfirm
                        title="是否退回申请？"
                        okButtonProps={{
                          style: { backgroundColor: "#198348" },
                        }}
                        getPopupContainer={(node) => node.parentElement}
                        onConfirm={() => {
                          setRejectId(record.id);
                          setRejectType("YF");
                        }}
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
                  </>
                )}

              <Tooltip title={<span>查看审核日志</span>}>
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
              </Tooltip>
            </Space>
          );
        },
      },
    ];

    return (
      <div>
        <Table
          bordered
          loading={loading}
          dataSource={
            modalType === ModalType.Approve
              ? record.yf_data
                  .map((item, index) => ({
                    ...item,
                    key: index,
                  }))
                  .filter((c) => c.state !== "未提交")
              : record.yf_data.map((item, index) => ({
                  ...item,
                  key: index,
                }))
          }
          columns={littleTableColumn}
          pagination={false}
        />
      </div>
    );
  };

  const columns = [
    {
      title: "客户",
      dataIndex: "customName",
      key: "customName",
      align: "center",
    },
    {
      title: "人民币",
      // dataIndex: "ysRmb",
      key: "ysRmb",
      align: "center",
      render: (record) => formatNumber(record?.ysRmb),
    },
    {
      title: "美金",
      // dataIndex: "ysDollar",
      key: "ysDollar",
      align: "center",
      render: (record) => formatNumber(record?.ysDollar),
    },
    {
      title: "明细",
      dataIndex: "ysPurpose",
      key: "ysPurpose",
      align: "center",
    },
    {
      title: "汇率",
      dataIndex: "ysExrate",
      key: "ysExrate",
      align: "center",
    },
    {
      title: "对账",
      // dataIndex: "ysChecking",
      key: "ysChecking",
      align: "center",
      render: (record) => {
        return modalType !== ModalType.Approve ? (
          record.ysChecking === "0" ? (
            "√"
          ) : (
            "×"
          )
        ) : (
          <Switch
            checked={record.ysChecking === "0"}
            onChange={(value) => handleYSChecking(record.id, value)}
          />
        );
      },
    },
    {
      title: "开票",
      // dataIndex: "ysInvoice",
      key: "ysInvoice",
      align: "center",
      render: (record) => {
        return modalType === ModalType.CW ? (
          <Switch
            checked={record.ysInvoice === "0"}
            onChange={(value) => handleYSInvoicing(record.id, value)}
          />
        ) : record.ysInvoice === "0" ? (
          "√"
        ) : (
          "×"
        );
      },
    },
    {
      title: "收款",
      // dataIndex: "ysCollection",
      align: "center",
      key: "ysCollection",
      render: (record) => {
        return modalType === ModalType.CW ? (
          <Switch
            checked={record.ysCollection === "0"}
            onChange={(value) => handleYSCollection(record.id, value)}
          />
        ) : record.ysCollection === "0" ? (
          "√"
        ) : (
          "×"
        );
      },
    },
    {
      title: "审核状态",
      dataIndex: "state",
      align: "center",
      key: "state",
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
        return (
          <Space size="middle" className="flex flex-row !gap-x-1">
            {modalType === ModalType.Submit && (
              <>
                {projectState === "未完结" && record?.state !== "审批通过" && (
                  <Tooltip title="编辑">
                    <Button
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "3px 5px",
                      }}
                      onClick={() => handleEditYsOne(record)}
                    >
                      <EditTwoTone twoToneColor="#198348" />
                    </Button>
                  </Tooltip>
                )}
                {projectState === "未完结" && record?.state !== "审批通过" && (
                  <Tooltip title="添加应付">
                    <Button
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "3px 5px",
                      }}
                      onClick={() => handleYfAddClick(record)}
                    >
                      <PlusSquareTwoTone twoToneColor="#198348" />
                    </Button>
                  </Tooltip>
                )}
                {projectState === "未完结" && record?.state === "未提交" && (
                  <Tooltip title="提交至业务审核">
                    <Button
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "3px 5px",
                      }}
                      onClick={() => handleSubmitYS(record)}
                    >
                      <InteractionTwoTone twoToneColor="#198348" />
                    </Button>
                  </Tooltip>
                )}
                {projectState === "未完结" && record?.state !== "审批通过" && (
                  <Tooltip title="删除">
                    <Popconfirm
                      title="是否删除？"
                      okButtonProps={{ style: { backgroundColor: "#198348" } }}
                      getPopupContainer={(node) => node.parentElement}
                      onConfirm={() => handleDeleteYS(record.id)}
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
              </>
            )}
            {modalType === ModalType.Approve && record.state !== "审批通过" && (
              <>
                {record?.state === "待业务审批" && (
                  <Tooltip title="批准">
                    <Popconfirm
                      title="是否通过审批？"
                      okButtonProps={{ style: { backgroundColor: "#198348" } }}
                      getPopupContainer={(node) => node.parentElement}
                      onConfirm={() => handleApproveYS(record.id)}
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
                <Tooltip title="退回">
                  <Popconfirm
                    title="是否退回申请？"
                    getPopupContainer={(node) => node.parentElement}
                    okButtonProps={{ style: { backgroundColor: "#198348" } }}
                    onConfirm={() => {
                      setRejectId(record.id);
                      setRejectType("YS");
                    }}
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
              </>
            )}

            <Tooltip title={<span>查看审核日志</span>}>
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
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  const handleYsAddClick = () => {
    setOperation(Operation.Add);
    setYsModalOpen(true);
  };

  const handleEditYsOne = async (record) => {
    setOperation(Operation.Edit);
    setYsEditId(record.id);
    form.setFieldsValue(record);
    setYsModalOpen(true);
  };

  const handleYsOk = async () => {
    form.validateFields();
    const values = form.getFieldsValue();
    const params = {
      ...values,
      ysDate: dayjs(values.ysDate).format("YYYY-MM-DD"),
      ysChecking: values.ysChecking?.value || "x",
      ysCollection: values.ysCollection?.value || "x",
      ysInvoice: values.ysInvoice?.value || "x",
    };
    const { code } =
      operation === Operation.Add
        ? await addProjectYS({ ...params, projectId: projectId })
        : await updateProjectYS(ysEditId, params);

    if (code === 200) {
      setYsModalOpen(false);
      const data = await getProjectYSList(projectId as string, page, pageSize);
      setData({
        ...data,
        entity: {
          ...data.entity,
          data: data.entity.data.map((item, index) => ({
            key: index,
            ...item,
          })),
        },
      });
      notification.success({
        message: operation === Operation.Add ? "添加成功" : "编辑成功",
        duration: 3,
      });
    }
  };

  const customerFilterOption = (
    input: string,
    option?: { label: string; value: string }
  ) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  const handleSupplierSelectChange = (value) => {};

  const handleSupplierSelectSearch = (value) => {};

  const supplierFilterOption = (
    input: string,
    option?: { label: string; value: string }
  ) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  return (
    <>
      <Modal
        open={!!projectId}
        onCancel={onClose}
        centered
        footer={null}
        destroyOnClose
        title="应收应付列表"
        style={{ minWidth: "90%" }}
        styles={{ body: { height: "800px", overflowY: "auto" } }}
        maskClosable={false}
      >
        {modalType === ModalType.Submit && projectState === "未完结" && (
          <>
            <Button
              onClick={handleYsAddClick}
              type="primary"
              style={{
                marginBottom: 16,
                marginTop: 16,
                background: "#198348",
                width: "100px",
              }}
            >
              添加应收
            </Button>
          </>
        )}

        <Table
          bordered
          loading={loading}
          dataSource={
            modalType === ModalType.Approve
              ? data?.entity?.data?.filter((c) => c.state !== "未提交")
              : data?.entity?.data
          }
          columns={columns}
          expandable={{
            expandedRowRender: (record) => expandedRowRender(record),
            defaultExpandedRowKeys: ["0"],
            // expandRowByClick: true,
            indentSize: 300,
          }}
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
        />

        {/* 应收弹窗 */}
        <Modal
          centered
          destroyOnClose
          open={ysModalOpen}
          title={operation === Operation.Add ? "添加应收" : "编辑应收"}
          onOk={handleYsOk}
          okButtonProps={{ style: { background: "#198348" } }}
          // confirmLoading={confirmLoading}
          onCancel={() => setYsModalOpen(false)}
          afterClose={() => form.resetFields()}
          style={{ minWidth: "650px" }}
          maskClosable={false}
        >
          <Form
            form={form}
            labelCol={{ span: 3 }}
            wrapperCol={{ span: 20 }}
            layout={"horizontal"}
          >
            <Form.Item
              label="客户"
              name="customId"
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
            <Form.Item label="人民币" name="ysRmb">
              <InputNumber placeholder="请输入金额" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item label="美金" name="ysDollar">
              <InputNumber placeholder="请输入金额" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item label="汇率" name="ysExrate">
              <InputNumber placeholder="请输入汇率" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item label="明细" name="ysPurpose">
              <Input.TextArea placeholder="明细" maxLength={100} />
            </Form.Item>

            {/* <Form.Item
            label="日期"
            name="ysDate"
            getValueProps={(i) => ({ value: dayjs(i) })}
          >
            <DatePicker allowClear={false} />
          </Form.Item> */}
            <Form.Item label="备注" name="remark">
              <Input.TextArea placeholder="备注" maxLength={100} />
            </Form.Item>
          </Form>
        </Modal>

        {/* 应付弹窗 */}
        <Modal
          centered
          destroyOnClose
          open={yfModalOpen}
          title={operation === Operation.Add ? "添加应付" : "编辑应付"}
          onOk={handleYfOk}
          okButtonProps={{ style: { background: "#198348" } }}
          // confirmLoading={confirmLoading}
          onCancel={() => setYfModalOpen(false)}
          afterClose={() => form1.resetFields()}
          style={{ minWidth: "650px" }}
          maskClosable={false}
        >
          <Form
            form={form1}
            labelCol={{ span: 3 }}
            wrapperCol={{ span: 20 }}
            layout={"horizontal"}
          >
            <Form.Item
              label="供应商"
              labelCol={{ span: 5 }}
              name="supplierId"
              rules={[{ required: true, message: "客户名称不能为空" }]}
            >
              <Select
                showSearch
                placeholder="选择供应商"
                optionFilterProp="children"
                onChange={handleSupplierSelectChange}
                onSearch={handleSupplierSelectSearch}
                filterOption={supplierFilterOption}
                options={suppliers?.map((con) => ({
                  label: con.name,
                  value: con.id,
                }))}
              />
            </Form.Item>
            <Form.Item label="人民币" labelCol={{ span: 5 }} name="yfRmb">
              <InputNumber placeholder="请输入金额" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item label="美金" labelCol={{ span: 5 }} name="yfDollar">
              <InputNumber placeholder="请输入金额" style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item label="明细" labelCol={{ span: 5 }} name="yfPurpose">
              <Input.TextArea placeholder="明细" maxLength={100} />
            </Form.Item>
            <Form.Item label="汇率" labelCol={{ span: 5 }} name="yfExrate">
              <InputNumber placeholder="请输入汇率" style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item
              label="预留利润名称"
              labelCol={{ span: 5 }}
              name="ylProfitName"
            >
              <Input placeholder="预留利润名称" />
            </Form.Item>
            <Form.Item
              label="预留利润金额"
              labelCol={{ span: 5 }}
              name="ylProfitMoney"
            >
              <Input placeholder="预留利润金额" />
            </Form.Item>
            <Form.Item label="是否支付" labelCol={{ span: 5 }} name="isPay">
              <Select
                showSearch
                labelInValue
                placeholder="是否支付"
                optionFilterProp="children"
                filterOption={customerFilterOption}
                options={BooltypeArr?.map((con) => ({
                  label: con,
                  value: con,
                }))}
              ></Select>
            </Form.Item>
            {/* <Form.Item
            label="日期"
            labelCol={{ span: 5 }}
            name="yfDate"
            getValueProps={(i) => ({ value: dayjs(i) })}
          >
            <DatePicker allowClear={false} />
          </Form.Item> */}
            <Form.Item label="备注" labelCol={{ span: 5 }} name="remark">
              <Input.TextArea placeholder="备注" maxLength={100} />
            </Form.Item>
          </Form>
        </Modal>
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

      {/* <ProjectDetailModal
        data={detail}
        onConfirm={handleApproveOne}
        onClose={() => setDetail(undefined)}
      /> */}

      {!!rejectId && (
        <RejectModal
          open={!!rejectId}
          onClose={() => setRejectId(undefined)}
          onReject={(value) => handleRejectOne(rejectId, value)}
        />
      )}
    </>
  );
};

export default Item;
