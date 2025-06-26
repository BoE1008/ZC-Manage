import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  message,
  Tag,
  Select,
} from "antd";
import { EditTwoTone, DeleteTwoTone } from "@ant-design/icons";
import {
  getDictList,
  addDict,
  addDictData,
  updateDict,
  updateDictData,
  getDictDetail,
  deleteDict,
  deleteDictData,
} from "@/restApi/dict";
import { Company, Operation } from "@/types";
import { useRouter } from "next/router";

const initialValues = {
  name: "",
  address: "",
  contactsName: "",
  contactsMobile: "",
  remark: "",
};

const Dict = () => {
  const router = useRouter();
  const [data, setData] = useState();
  const [editId, setEditId] = useState("");
  const [dataEditId, setDataEditId] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchValue, setSearchValue] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [operation, setOperation] = useState<Operation>(Operation.Add);
  const [loading, setLoading] = useState(true);

  const [dictDetail, setDictDetail] = useState();
  const [typeId, setTypeId] = useState();
  const [dataModalOpen, setDataModalOpen] = useState(false);
  const [dataOperation, setDataOperation] = useState(Operation.Add);

  const [form] = Form.useForm();
  const [form1] = Form.useForm();

  useEffect(() => {
    (async () => {
      const data = await getDictList(page, pageSize);
      setLoading(false);
      setData(data);
    })();
  }, [page, pageSize, searchValue, router]);

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
    setLoading(true);
    const { code } =
      operation === Operation.Add
        ? await addDict(values)
        : await updateDict(editId, values);
    if (code === 200) {
      setModalOpen(false);
      const data = await getDictList(page, pageSize);
      setLoading(false);
      setData(data);
      message.success({
        content: operation === Operation.Add ? "添加成功" : "编辑成功",
      });
    }
  };

  const handleDataOk = async () => {
    form1.validateFields().then(async () => {
      const values = form1.getFieldsValue();
      setLoading(true);
      const { code } =
        dataOperation === Operation.Add
          ? await addDictData({ ...values, dictTypeId: typeId })
          : await updateDictData(dataEditId, { ...values, dictTypeId: typeId });
      if (code === 200) {
        setDataModalOpen(false);
        const data = await getDictDetail(typeId, 1, 20);
        setLoading(false);
        setDictDetail(data.entity.data);
        message.success({
          content: dataOperation === Operation.Add ? "添加成功" : "编辑成功",
        });
      }
    });
  };

  const handleDetail = async (id) => {
    const res = await getDictDetail(id, 1, 20);
    setTypeId(id);
    setDictDetail(res.entity.data);
  };

  const handleDataAdd = () => {
    form1.setFieldsValue(initialValues);
    setDataModalOpen(true);
    setDataOperation(Operation.Add);
  };

  const handleDataEdit = (record) => {
    setDataOperation(Operation.Edit);
    setDataEditId(record.id);
    form1.setFieldsValue(record);
    setDataModalOpen(true);
  };

  const handleDeleteOne = async (id) => {
    await deleteDict(id);
    const data = await getDictList(page, pageSize);
    setData(data);
  };

  const handleDeleteDataOne = async (id) => {
    await deleteDictData(id);
    const data = await getDictDetail(typeId, 1, 20);
    setDictDetail(data.entity.data);
  };

  const columns = [
    {
      title: "字典名称",
      align: "center",
      key: "dictName",
      render: (_, record) => {
        return (
          <span
            className="cursor-pointer text-[#198348]"
            onClick={() => handleDetail(record.id)}
          >
            {record.dictName}
          </span>
        );
      },
    },
    {
      title: "状态",
      align: "center",
      key: "status",
      render: (_, record) => {
        if (record.status === "0") {
          return <Tag color="#87d068">正常</Tag>;
        } else {
          return <Tag color="#cd201f">停用</Tag>;
        }
      },
    },
    {
      title: "CODE",
      dataIndex: "code",
      align: "center",
      key: "code",
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
        return (
          <Space size="middle" className="flex flex-row !gap-x-1">
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
            <Button
              style={{
                display: "flex",
                alignItems: "center",
                padding: "3px 5px",
              }}
              onClick={() => handleDeleteOne(record.id)}
            >
              <DeleteTwoTone twoToneColor="#198348" />
            </Button>
          </Space>
        );
      },
    },
  ];

  const tableColumns = [
    {
      title: "字典编码",
      key: "id",
      align: "center",
      dataIndex: "id",
    },
    {
      title: "字典code",
      key: "dictValue",
      align: "center",
      dataIndex: "dictValue",
    },
    {
      title: "字典标签",
      key: "dictLabel",
      align: "center",
      dataIndex: "dictLabel",
    },
    {
      title: "字典排序",
      key: "dictSort",
      align: "center",
      dataIndex: "dictSort",
    },
    {
      title: "状态",
      align: "center",
      key: "status",
      render: (_, record) => {
        if (record.status === "0") {
          return <Tag color="#87d068">正常</Tag>;
        } else {
          return <Tag color="#cd201f">停用</Tag>;
        }
      },
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
        return (
          <Space size="middle" className="flex flex-row !gap-x-1">
            <Button
              style={{
                display: "flex",
                alignItems: "center",
                padding: "3px 5px",
              }}
              onClick={() => handleDataEdit(record)}
            >
              <EditTwoTone twoToneColor="#198348" />
            </Button>
            <Button
              style={{
                display: "flex",
                alignItems: "center",
                padding: "3px 5px",
              }}
              onClick={() => handleDeleteDataOne(record.id)}
            >
              <DeleteTwoTone twoToneColor="#198348" />
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="w-full p-2" style={{ color: "#000" }}>
      <div className="flex flex-row gap-y-3 justify-between">
        <Button
          onClick={handleAdd}
          type="primary"
          style={{ marginBottom: 16, background: "#198348", width: "100px" }}
        >
          添加
        </Button>
      </div>
      <Table
        bordered
        loading={loading}
        dataSource={data?.entity.data}
        columns={columns}
        pagination={{
          total: data?.entity.total,
          showTotal: (total) => `共 ${total} 条`,
          showSizeChanger: true,
          pageSize: pageSize,
          onChange: async (page) => {
            setPage(page);
          },
          onShowSizeChange: async (page, size) => {
            setPage(page);
            setPageSize(size);
          },
        }}
      />
      <Modal
        centered
        destroyOnClose
        title={operation === Operation.Add ? "添加字典类型" : "编辑字典类型"}
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
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 20 }}
          layout={"horizontal"}
          form={form}
          initialValues={initialValues}
          style={{ minWidth: 600, color: "#000" }}
        >
          <Form.Item
            required
            label="字典名称"
            name="dictName"
            validateTrigger="onBlur"
            rules={[{ required: true, message: "字典名称不能为空" }]}
            hasFeedback
          >
            <Input placeholder="请输入字典名称" />
          </Form.Item>
          <Form.Item
            label="code"
            name="code"
            validateTrigger="onBlur"
            rules={[{ required: true, message: "字典编码不能为空" }]}
          >
            <Input placeholder="请输入编码" />
          </Form.Item>
          <Form.Item label="状态" name="status">
            <Select
              showSearch
              placeholder="选择项目"
              optionFilterProp="children"
              // filterOption={customerFilterOption}
              options={[
                { label: "正常", value: "0" },
                {
                  label: "停用",
                  value: "1",
                },
              ]}
            />
          </Form.Item>
          <Form.Item label="备注" name="remark">
            <Input.TextArea placeholder="备注信息" maxLength={100} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        centered
        destroyOnClose
        title={"字典数据"}
        open={!!dictDetail}
        onOk={handleOk}
        okButtonProps={{ style: { background: "#198348" } }}
        // confirmLoading={confirmLoading}
        onCancel={() => setDictDetail(undefined)}
        afterClose={() => form.resetFields()}
        style={{ minWidth: "80%" }}
        footer={null}
        maskClosable={false}
      >
        <Button
          onClick={handleDataAdd}
          type="primary"
          style={{ marginBottom: 16, background: "#198348", width: "100px" }}
        >
          添加
        </Button>
        <Table
          bordered
          loading={loading}
          dataSource={dictDetail}
          columns={tableColumns}
          pagination={false}
          // pagination={{
          //   // 设置总条数
          //   total: data?.entity.total,
          //   // 显示总条数
          //   showTotal: (total) => `共 ${total} 条`,
          //   // 是否可以改变 pageSize
          //   showSizeChanger: true,

          //   // 改变页码时
          //   onChange: async (page) => {
          //     setPage(page);
          //   },
          //   // pageSize 变化的回调
          //   onShowSizeChange: async (page, size) => {
          //     setPage(page);
          //     setPageSize(size);
          //   },
          // }}
        />
      </Modal>

      <Modal
        centered
        destroyOnClose
        title={
          dataOperation === Operation.Add ? "添加字典数据" : "编辑字典数据"
        }
        open={dataModalOpen}
        onOk={handleDataOk}
        okButtonProps={{ style: { background: "#198348" } }}
        // confirmLoading={confirmLoading}
        onCancel={() => setDataModalOpen(false)}
        afterClose={() => form1.resetFields()}
        style={{ minWidth: "650px" }}
        maskClosable={false}
      >
        <Form
          labelCol={{ span: 5 }}
          wrapperCol={{ span: 20 }}
          layout={"horizontal"}
          form={form1}
          style={{ minWidth: 600, color: "#000" }}
        >
          <Form.Item
            required
            label="数据标签"
            name="dictLabel"
            validateTrigger="onBlur"
            rules={[{ required: true, message: "数据标签不能为空" }]}
            hasFeedback
          >
            <Input placeholder="请输入数据标签" />
          </Form.Item>
          <Form.Item
            required
            label="数据code"
            name="dictValue"
            validateTrigger="onBlur"
            rules={[{ required: true, message: "数据code不能为空" }]}
            hasFeedback
          >
            <Input placeholder="请输入数据code" />
          </Form.Item>
          <Form.Item label="状态" name="status">
            <Select
              showSearch
              placeholder="选择状态"
              optionFilterProp="children"
              //   filterOption={customerFilterOption}
              options={[
                { label: "正常", value: "0" },
                {
                  label: "停用",
                  value: "1",
                },
              ]}
            />
          </Form.Item>
          <Form.Item label="备注" name="remark">
            <Input.TextArea placeholder="备注信息" maxLength={100} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Dict;
