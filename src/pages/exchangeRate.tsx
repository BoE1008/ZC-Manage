import { useEffect, useMemo, useState } from "react";
import {
  Table,
  Space,
  Button,
  Input,
  Modal,
  Form,
  message,
  TreeSelect,
  Tooltip,
  Popconfirm,
  Select,
  DatePicker,
  InputNumber,
} from "antd";
import { Operation } from "@/types";
import { EditTwoTone, DeleteTwoTone } from "@ant-design/icons";
import {
  addExchangeRate,
  updateExchangeRate,
  deleteExchangeRate,
  getExchangeRateList,
} from "@/restApi/exchangeRate";
import ResizeTable from "@/components/ResizeTable";
import { getDictByCode } from "@/restApi/dict";
import dayjs from "dayjs";

const ExchangeRate = () => {
  const [data, setData] = useState();
  const [moneyTypes, setMoneyTypes] = useState();
  const [editId, setEditId] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [form] = Form.useForm();

  const [modalOpen, setModalOpen] = useState(false);
  const [operation, setOperation] = useState<Operation>(Operation.Add);

  const [loading, setLoading] = useState(false);

  const [searchDate, setSearchDate] = useState(dayjs().format("YYYY-MM"));

  const [date, setDate] = useState(dayjs().format("YYYY-MM"));

  useEffect(() => {
    (async () => {
      const data = await getExchangeRateList(searchDate, page, pageSize);
      setData(data);
      const res = await getDictByCode("sys_money_type");
      setMoneyTypes(res.entity);
    })();
  }, [page, pageSize, searchDate]);

  const handleAdd = async () => {
    setOperation(Operation.Add);
    setModalOpen(true);
  };

  const handleEditOne = (record) => {
    setOperation(Operation.Edit);
    setEditId(record.id);

    const findM = moneyTypes?.find(
      (item) => item.dictLabel === record.moneyType
    );

    const formData = {
      ...record,
      date: dayjs(record.date, "YYYY-MM"),
      moneyType: { label: findM?.dictLabel, value: findM?.id },
    };

    form.setFieldsValue(formData);
    setModalOpen(true);
  };

  const handleOk = async () => {
    form.validateFields().then(async () => {
      const values = form.getFieldsValue();
      const params = {
        ...values,
        moneyType: values.moneyType.label,
        date: date,
      };
      setLoading(true);
      const { code } =
        operation === Operation.Add
          ? await addExchangeRate(params)
          : await updateExchangeRate(editId, params);
      if (code === 200) {
        setModalOpen(false);
        const data = await getExchangeRateList(searchDate, page, pageSize);
        setLoading(false);
        setData(data);
        message.success({
          content: operation === Operation.Add ? "添加成功" : "编辑成功",
        });
      }
    });
  };

  const handleDeleteOne = async (id: string) => {
    await deleteExchangeRate(id);
    const data = await getExchangeRateList(searchDate, page, pageSize);
    setLoading(false);
    setData(data);
  };

  const customerFilterOption = (
    input: string,
    option?: { label: string; value: string }
  ) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  const handleSearchDateChange = (date, dateString) => {
    setSearchDate(dateString);
  };

  const handleDateChange = (date, dateString) => {
    setDate(dateString);
  };

  const columns = [
    {
      title: "币种",
      dataIndex: "moneyType",
      align: "center",
      key: "moneyType",
    },
    {
      title: "归属年月",
      dataIndex: "date",
      align: "center",
      key: "date",
    },
    {
      title: "汇率",
      dataIndex: "exchangeRate",
      align: "center",
      key: "exchangeRate",
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
          <Space size="middle" className="flex flex-row justify-center">
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

            <Tooltip title="删除">
              <Popconfirm
                title="是否删除？"
                getPopupContainer={(node) => node.parentElement}
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
          </Space>
        );
      },
    },
  ];

  return (
    <div className="p-2">
      <div className="flex flex-row gap-y-3 justify-between items-center mb-4">
        <Space>
          <DatePicker
            allowClear={false}
            defaultValue={dayjs()}
            style={{ minWidth: "180px" }}
            picker="month"
            placeholder="按发运日期搜索"
            onChange={handleSearchDateChange}
          />
          <Button
            onClick={handleAdd}
            type="primary"
            style={{ background: "#198348", width: "100px" }}
          >
            添加
          </Button>
        </Space>
      </div>
      <ResizeTable
        bordered
        loading={loading}
        dataSource={data?.entity.data}
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
      />

      <Modal
        centered
        destroyOnClose
        title={operation === Operation.Add ? "添加汇率" : "编辑汇率"}
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
          style={{ minWidth: 600, color: "#000" }}
        >
          <Form.Item
            label="币种"
            name="moneyType"
            validateTrigger="onBlur"
            rules={[{ required: true, message: "币种不能为空" }]}
          >
            <Select
              labelInValue
              placeholder="币种"
              optionFilterProp="children"
              filterOption={customerFilterOption}
              options={moneyTypes?.map((con) => ({
                label: con.dictLabel,
                value: con.id,
              }))}
            ></Select>
          </Form.Item>

          <Form.Item
            required
            label="归属年月"
            name="date"
            validateTrigger="onBlur"
            rules={[{ required: true, message: "归属年月不能为空" }]}
          >
            <DatePicker
              style={{ minWidth: "180px" }}
              picker="month"
              format="YYYY-MM"
              onChange={handleDateChange}
            />
          </Form.Item>
          {/* <Form.Item
            required
            label="归属年月"
            name="date"
            validateTrigger="onBlur"
            rules={[{ required: true, message: "归属年月不能为空" }]}
            getValueProps={(i) => ({ value: dayjs(i).format("YYYY-MM") })}
          >
            <DatePicker allowClear={false} picker="month" />
          </Form.Item> */}
          <Form.Item
            label="汇率"
            name="exchangeRate"
            rules={[{ required: true, message: "汇率不能为空" }]}
          >
            <InputNumber
              defaultValue={0}
              placeholder="请输入汇率"
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item label="备注" name="remark">
            <Input.TextArea placeholder="备注" maxLength={100} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ExchangeRate;
