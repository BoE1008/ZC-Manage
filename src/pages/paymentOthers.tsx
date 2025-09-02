import { useEffect, useState, useMemo } from "react";
import {
  Space,
  Button,
  Input,
  Modal,
  Form,
  Select,
  DatePicker,
  message,
  Tooltip,
  Popconfirm,
  List,
  Avatar,
  Typography,
  Upload,
  InputNumber,
} from "antd";
import { Operation } from "@/types";
import dayjs from "dayjs";
import {
  EditTwoTone,
  DeleteTwoTone,
  CalendarTwoTone,
  InteractionTwoTone,
  UploadOutlined,
  ProfileTwoTone,
  StopTwoTone,
} from "@ant-design/icons";
import {
  getPaymentOthersList,
  addPayment,
  updatePayment,
  logsOne,
  getPaymentDetailById,
  deleteOne,
  getFilesById,
  updateFileById,
  deleteFileById,
  withDrawPayment,
  submitOthers,
} from "@/restApi/payment";
import { getProjectsSubmitList, getYSFByProjectId } from "@/restApi/project";
import { getSuppliersYFList, getSuppliersList } from "@/restApi/supplyer";
import { getDictByCode } from "@/restApi/dict";
import PaymentSubmitModal from "@/components/PaymentSubmitModal";
import { formatNumber } from "@/utils";
import PaymentDetailModal from "@/components/PaymentDetailModal";
import { ModalType } from "@/types";
import YSYFModal from "@/components/YSYFModal";
import ResizeTable from "@/components/ResizeTable";
import { PaymentOthersType } from "@/types";
import SearchInput from "@/components/SearchInput";

const PaymentType = [
  { label: "商务(俄线)", value: PaymentOthersType.ESW },
  { label: "商务(非俄线)", value: PaymentOthersType.FESW },
  { label: "综合", value: PaymentOthersType.ZH },
];

const Payment = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchValue, setSearchValue] = useState("");
  const [userName, setUserName] = useState("");
  const [projectNum, setProjectNum] = useState("");
  const [date, setDate] = useState("");

  const [project, setProject] = useState();
  const [supplier, setSupplier] = useState();

  const [modalOpen, setModalOpen] = useState(false);
  const [operation, setOperation] = useState<Operation>(Operation.Add);
  const [editId, setEditId] = useState("");
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState();

  const [bank, setBank] = useState();
  const [dict, setDict] = useState();

  const [selectProject, setSelectProject] = useState();
  const [selectSupplier, setSelectSupplier] = useState();
  const [bankcards, setBankcards] = useState();

  const [detail, setDetail] = useState();
  const [check, setCheck] = useState();

  const [files, setFiles] = useState([]);
  const [oldFiles, setOldFiles] = useState([]);

  const [supplierId, setSupplierId] = useState();
  const [projectState, setProjectState] = useState();

  const [projectId, setProjectId] = useState();

  const [updateTimeSort, setUpdateTimeSort] = useState();

  const [paymentType, setPaymentType] = useState();

  useEffect(() => {
    (async () => {
      const projectCustom = await getSuppliersList(1, 1000);
      setSupplier(projectCustom.entity.data);
      const projectData = await getProjectsSubmitList(1, 10000);
      setProject(projectData.entity.data);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getPaymentOthersList(
          page,
          pageSize,
          searchValue,
          supplierId,
          projectState,
          userName,
          projectNum,
          date,
          updateTimeSort
        );
        setData(res);
        setLoading(false);
      } catch {}
    })();
  }, [
    page,
    pageSize,
    searchValue,
    supplierId,
    projectState,
    userName,
    projectNum,
    date,
    updateTimeSort,
  ]);

  const handleAdd = async () => {
    setOperation(Operation.Add);
    const res = await getDictByCode("sys_money_type");
    setDict(res.entity);
    setModalOpen(true);
  };

  const handleEditOne = async (record) => {
    setOperation(Operation.Edit);
    setEditId(record.id);
    const res = await getDictByCode("sys_money_type");
    setDict(res.entity);
    const rawFilelist = await getFilesById(record.id);
    const fileList = rawFilelist?.entity.data.map((item) => ({
      name: item.originalFileName,
      url: item.url,
      uid: item.uid,
      id: item.id,
      status: "done",
    }));

    setFiles(fileList);
    setOldFiles(fileList);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleOk = async () => {
    form.validateFields().then(async () => {
      const values = form.getFieldsValue();

      const params =
        operation === Operation.Add
          ? {
              ...values,
              paymentType: values.paymentType.value || "",
              moneyType: values.moneyType.value || "",
              projectId: values.projectNum?.value || "",
              supplierName: values.supplierName.label || "",
              supplierId: values.supplierName.value || "",
              bank: values.bank.value || "",
              bankCard: values.bankCard.value || "",
              fee: values.fee || "",
              remark: values.remark || "",
              yfDate: dayjs(values.yfDate).format("YYYY-MM-DD"),
            }
          : {
              ...values,
              paymentType:
                values.paymentType.value ||
                (JSON.stringify(values.paymentType) === "{}"
                  ? ""
                  : values.paymentType) ||
                "",
              moneyType:
                values.moneyType.value ||
                (JSON.stringify(values.moneyType) === "{}"
                  ? ""
                  : values.moneyType) ||
                "",
              projectId:
                project?.find((c) => c.id === selectProject?.id)?.id || "",
              supplierName:
                values.supplierName?.label || values.supplierName || "",
              supplierId:
                values.supplierName?.value ||
                supplier?.find((a) => a.name === values.supplierName)?.id ||
                "",
              bank:
                values.bank?.value ||
                (JSON.stringify(values.bank) === "{}" ? "" : values.bank) ||
                "",
              bankCard:
                values.bankCard?.value ||
                (JSON.stringify(values.bankCard) === "{}"
                  ? ""
                  : values.bankCard) ||
                "",
              fee: values.fee || "",
              remark: values.remark || "",
              yfDate: dayjs(values.yfDate).format("YYYY-MM-DD"),
              // files,
            };

      if (operation === Operation.Add) {
        const formData = new FormData();
        for (const name in params) {
          formData.append(name, params[name]);
        }
        files.forEach((file) => {
          formData.append("files", file?.originFileObj);
        });
        await addPayment(formData);
      } else {
        await updatePayment(editId, params);

        const formData = new FormData();
        formData.append("paymentId", editId);

        const fileList = files.filter(
          (itemA) => !oldFiles.some((itemB) => itemA.name === itemB.name)
        );

        if (fileList.length > 0) {
          fileList.forEach((file) => {
            formData.append("files", file?.originFileObj);
          });

          await updateFileById(formData);
        }
      }
      setOldFiles([]);
      setFiles([]);
      setModalOpen(false);
      const data = await getPaymentOthersList(
        page,
        pageSize,
        searchValue,
        supplierId,
        projectState,
        userName,
        projectNum,
        date
      );
      setLoading(false);
      setData(data);
      message.success({
        content: operation === Operation.Add ? "添加成功" : "编辑成功",
        type: "success",
      });
    });
  };

  const handleDetail = async (record) => {
    console.log(record);
    const res = await getPaymentDetailById(record.id);
    setDetail(res.entity.data);
    setPaymentType(record.paymentType);
  };

  const handleCheck = async (id) => {
    const res = await getPaymentDetailById(id);
    setCheck(res.entity.data);
  };

  const handleLogsOne = async (id: string) => {
    const res = await logsOne(id);
    setLogs(res.entity.data);
  };

  const handleDeleteOne = async (id: string) => {
    await deleteOne(id);
    const data = await getPaymentOthersList(
      page,
      pageSize,
      searchValue,
      supplierId,
      projectState,
      userName,
      projectNum,
      date
    );
    setData(data);
  };

  const handleWithdraw = async (id: string) => {
    await withDrawPayment(id);
    message.success({ content: "撤回成功", type: "success" });
    const data = await getPaymentOthersList(
      page,
      pageSize,
      searchValue,
      supplierId,
      projectState,
      userName,
      projectNum,
      date
    );
    setData(data);
  };

  const handleSubmitOne = async () => {
    await submitOthers(detail.id, paymentType);
    message.success({ content: "提交成功", type: "success" });
    setDetail(undefined);
    const data = await getPaymentOthersList(
      page,
      pageSize,
      searchValue,
      supplierId,
      projectState,
      userName,
      projectNum,
      date
    );
    setData(data);
  };

  const handleSupplierChange = async (value) => {
    form.setFieldValue("moneyType", {});
    form.setFieldValue("bankCard", {});
    form.setFieldValue("bank", {});
    setSelectSupplier(supplier?.find((c) => c.id === value.value));
  };

  const onSearch = () => {};

  const handleMoneyTypeChnage = (value) => {
    form.setFieldValue("bankCard", {});
    form.setFieldValue("bank", {});
    const res = selectSupplier?.accountList?.filter(
      (c) => c.moneyType === value.value
    );
    setBankcards(res);
  };

  const handleBankCardChange = (value) => {
    form.setFieldValue("bank", {});
    const res = bankcards?.filter((c) => c.bankCard === value.value);
    setBank(res);
  };

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
    {
      text: "已退回",
      value: "-1",
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
      title: "付款事由",
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
      title: "付款类型",
      dataIndex: "paymentType",
      align: "center",
      key: "paymentType",
      render: (value) => {
        return (
          <span>
            {value === PaymentOthersType.FESW
              ? "非俄商务"
              : value === PaymentOthersType.ESW
              ? "俄商务"
              : value === "ZH"
              ? "综合"
              : ""}
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
      ellipsis: {
        showTitle: false,
      },
      render: (supplierName) => (
        <Tooltip placement="topLeft" title={supplierName}>
          {supplierName}
        </Tooltip>
      ),
    },
    {
      title: "币种",
      dataIndex: "moneyType",
      align: "center",
      key: "moneyType",
    },
    {
      title: "金额",
      // dataIndex: "fee",
      align: "center",
      key: "fee",
      render: (record) => formatNumber(record?.fee),
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
      ellipsis: {
        showTitle: false,
      },
      render: (bank) => (
        <Tooltip placement="topLeft" title={bank}>
          {bank}
        </Tooltip>
      ),
    },
    {
      title: "申请人",
      dataIndex: "userName",
      align: "userName",
      key: "userName",
    },
    {
      title: "应付日期",
      dataIndex: "yfDate",
      align: "center",
      key: "yfDate",
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
      title: "最后操作时间",
      dataIndex: "updateTime",
      align: "center",
      key: "updateTime",
      sortDirections: ["ascend", "descend"],
      sorter: true,
    },
    {
      title: "备注",
      dataIndex: "remark",
      align: "center",
      key: "remark",
      ellipsis: {
        showTitle: false,
      },
      render: (remark) => (
        <Tooltip placement="topLeft" title={remark}>
          {remark}
        </Tooltip>
      ),
    },
    {
      title: "操作",
      align: "center",
      key: "action",
      render: (_, record) => {
        const isFinished =
          record.state !== "未提交" && record.state !== "已退回";
        return (
          <Space size="middle" className="flex flex-row !gap-x-1">
            <Tooltip title={<span>查看应收应付</span>}>
              <Button
                onClick={() => setProjectId(record.projectId)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "3px 5px",
                }}
              >
                <ProfileTwoTone twoToneColor="#198348" />
              </Button>
            </Tooltip>
            {!isFinished && (
              <Tooltip title={<span>提交审核</span>}>
                <Popconfirm
                  title="是否提交审核？"
                  placement="bottom"
                  getPopupContainer={() => document.body}
                  okButtonProps={{ style: { backgroundColor: "#198348" } }}
                  onConfirm={() => handleDetail(record)}
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
            {!isFinished && (
              <Tooltip title="编辑">
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
            {record.state === "待业务审批" && (
              <Tooltip title="撤回">
                <Popconfirm
                  title="是否撤回？"
                  placement="bottom"
                  getPopupContainer={() => document.body}
                  okButtonProps={{ style: { backgroundColor: "#198348" } }}
                  onConfirm={() => handleWithdraw(record.id)}
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
            {!isFinished && (
              <Tooltip title="删除">
                <Popconfirm
                  title="是否删除？"
                  placement="bottom"
                  getPopupContainer={() => document.body}
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
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

  const uploadProps = {
    accept: ".pdf,.png,.jpg,.jpeg,.xls,.xlsx,.doc,.docx,.rar,.zip",
    name: "file",
    multiple: true,
    fileList: files,
    listType: "picture-card",
    withCredentials: true,
    headers: {
      "Content-Type": "multipart/form-data",
    },
    showUploadList: {
      showDownloadIcon: true,
      showPreviewIcon: true,
    },
    onRemove: async (file) => {
      await deleteFileById(file?.id);
      const index = files.indexOf(file);
      const newFiles = files.slice();
      newFiles.splice(index, 1);
      setFiles(newFiles);
    },
    beforeUpload: (file) => {
      setFiles([...files, file]);
      return false;
    },
    onChange: (info) => {
      setFiles([...info.fileList]);
    },
    onDownload: async (file) => {
      window.open(
        `http://115.175.21.89/zc/common/download/resource?resource=${file?.url}`
      );
    },
  };

  const handleTableChange = (pagination, filters, sorter) => {
    if (sorter.order === "ascend") {
      setUpdateTimeSort("0");
    } else if (sorter.order === "descend") {
      setUpdateTimeSort("1");
    } else {
      setUpdateTimeSort("");
    }

    setProjectState(filters.state?.[0]);
    setSupplierId(filters.supplierName?.[0]);
  };

  const handleDateChange = (date, dateString) => {
    setDate(dateString);
  };

  return (
    <div className="p-2">
      <div className="flex flex-row gap-3 items-center mb-4 sticky top-[0px] z-[100] bg-[#fff]">
        <Space>
          <Button
            onClick={handleAdd}
            type="primary"
            style={{ background: "#198348", width: "100px" }}
          >
            添加
          </Button>
        </Space>

        <div className="flex flex-row gap-x-4">
          <SearchInput placeholder="按项目编号搜索" onSearch={setProjectNum} />
          <SearchInput placeholder="按项目名称搜索" onSearch={setSearchValue} />
          <SearchInput placeholder="按申请人搜索" onSearch={setUserName} />
          <DatePicker
            style={{ minWidth: "180px" }}
            picker="month"
            placeholder="按应付日期搜索"
            onChange={handleDateChange}
          />
        </div>
      </div>
      <ResizeTable
        bordered
        loading={loading}
        dataSource={data?.entity.data}
        // scroll={{ scrollToFirstRowOnChange: true, y: "800px" }}
        columns={columns}
        pagination={{
          // 设置总条数
          total: data?.entity.total,
          // 显示总条数
          showTotal: (total) => `共 ${total} 条`,
          // 是否可以改变 pageSize
          showSizeChanger: true,
          pageSize: pageSize,

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
        afterClose={() => {
          form.resetFields();
          setSelectSupplier(undefined);
          setSelectProject(undefined);
        }}
        style={{ minWidth: "650px" }}
        maskClosable={false}
      >
        <Form
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
          layout={"horizontal"}
          form={form}
          style={{ minWidth: 600, color: "#000" }}
        >
          <Form.Item
            label="付款类型"
            name="paymentType"
            validateTrigger="onBlur"
            rules={[{ required: true, message: "付款类型不能为空" }]}
          >
            <Select
              showSearch
              labelInValue
              placeholder="选择付款类型"
              optionFilterProp="children"
              filterOption={customerFilterOption}
              onSearch={onSearch}
              optionLabelProp="label"
              options={PaymentType?.map((con) => ({
                label: con.label,
                value: con.value,
              }))}
            />
          </Form.Item>
          <Form.Item
            label="付款事由"
            name="projectName"
            rules={[{ required: true, message: "付款事由不能为空" }]}
          >
            <Input.TextArea placeholder="付款事由" maxLength={100} />
          </Form.Item>
          <Form.Item
            label="供应商"
            name="supplierName"
            validateTrigger="onBlur"
            rules={[{ required: true, message: "供应商不能为空" }]}
          >
            <Select
              showSearch
              onSearch={onSearch}
              labelInValue
              placeholder="选择供应商"
              optionFilterProp="children"
              filterOption={customerFilterOption}
              onChange={handleSupplierChange}
              options={supplier?.map((con) => ({
                label: con.name,
                value: con.id,
              }))}
            />
          </Form.Item>
          <Form.Item
            label="金额"
            name="fee"
            validateTrigger="onBlur"
            rules={[{ required: true, message: "金额不能为空" }]}
          >
            <InputNumber placeholder="金额" className="w-full" />
          </Form.Item>
          <Form.Item
            label="币种"
            name="moneyType"
            validateTrigger="onBlur"
            rules={[{ required: true, message: "币种不能为空" }]}
          >
            <Select
              showSearch
              labelInValue
              placeholder="选择币种"
              optionFilterProp="children"
              filterOption={customerFilterOption}
              onChange={handleMoneyTypeChnage}
              options={dict?.map((con) => ({
                label: con.dictLabel,
                value: con.dictLabel,
              }))}
            ></Select>
          </Form.Item>
          <Form.Item label="卡号" name="bankCard">
            <Select
              showSearch
              labelInValue
              placeholder="选择银行卡"
              optionFilterProp="children"
              filterOption={customerFilterOption}
              onChange={handleBankCardChange}
              options={bankcards?.map((con) => ({
                label: con.bankCard,
                value: con.bankCard,
              }))}
            ></Select>
          </Form.Item>
          <Form.Item label="开户行" name="bank">
            <Select
              showSearch
              labelInValue
              placeholder="选择开户行"
              optionFilterProp="children"
              filterOption={customerFilterOption}
              defaultActiveFirstOption
              defaultValue={{ label: bank?.[0].bank, value: bank?.[0].bank }}
              options={bank?.map((con) => ({
                label: con.bank,
                value: con.bank,
              }))}
            ></Select>
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

          <Form.Item
            label="附件"
            // name="files"
            getValueFromEvent={({ file }) => file.originFileObj}
          >
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>点击上传</Button>
            </Upload>
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
          onConfirm={handleSubmitOne}
          onClose={() => setDetail(undefined)}
        />
      )}

      {!!projectId && (
        <YSYFModal
          modalType={ModalType.OTHERS}
          projectId={projectId}
          onClose={() => setProjectId(undefined)}
        />
      )}
    </div>
  );
};

export default Payment;
