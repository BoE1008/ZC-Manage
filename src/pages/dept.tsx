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
} from "antd";
import { Operation } from "@/types";
import { EditTwoTone, DeleteTwoTone } from "@ant-design/icons";
import { addDept, updateDept, deleteDept, getDeptList } from "@/restApi/dept";
import { arrayToTree, formatDept } from "@/utils";

const Dept = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState();

  const [modalOpen, setModalOpen] = useState(false);
  const [operation, setOperation] = useState<Operation>(Operation.Add);

  const [editId, setEditId] = useState("");
  const [parentId, setParentId] = useState("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await getDeptList(1, 1000);
      setData(arrayToTree(res?.entity.data, "0"));
    })();
  }, []);

  const allDepts = useMemo(() => data && formatDept(data), [data]);

  const handleAdd = async () => {
    setOperation(Operation.Add);
    setModalOpen(true);
  };

  const handleEditOne = (record) => {
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
        ? await addDept(values)
        : await updateDept(editId, values);
    if (code === 200) {
      setModalOpen(false);
      const data = await getDeptList(1, 1000);
      setLoading(false);
      setData(arrayToTree(data?.entity.data, "0"));
      message.success({
        content: operation === Operation.Add ? "添加成功" : "编辑成功",
      });
    }
  };

  const handleDeleteOne = async (id: string) => {
    await deleteDept(id);
    const data = await getDeptList(1, 1000);
    setLoading(false);
    setData(arrayToTree(data?.entity.data, "0"));
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

  const columns = [
    {
      title: "部门名称",
      dataIndex: "name",
      align: "center",
      key: "name",
    },
    {
      title: "部门排序",
      dataIndex: "orderSort",
      align: "center",
      key: "orderSort",
    },
    {
      title: "创建时间",
      dataIndex: "createTime",
      align: "center",
      key: "createTime",
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

  const onSelect = (value) => {
    setParentId(value);
  };

  return (
    <div className="p-2">
      <div className="flex flex-row gap-y-3 justify-between">
        <Space>
          <Button
            onClick={handleAdd}
            type="primary"
            style={{ marginBottom: 16, background: "#198348", width: "100px" }}
          >
            添加
          </Button>
        </Space>
      </div>
      <Table
        bordered
        pagination={false}
        dataSource={data}
        columns={columns}
        // expandable={{
        //   expandedRowRender: (record) => expandedRowRender(record),
        //   defaultExpandedRowKeys: ["0"],
        //   expandRowByClick: true,
        //   indentSize: 300,
        // }}
      />

      <Modal
        centered
        destroyOnClose
        title={operation === Operation.Add ? "添加部门" : "编辑部门"}
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
          <Form.Item required label="部门名称" name="name">
            <Input placeholder="部门名称" />
          </Form.Item>

          <Form.Item required label="上级部门" name="parentId">
            <TreeSelect
              style={{ width: "60%" }}
              // value={allDepts?.find((c) => c.id === parentId)}
              dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
              treeData={allDepts}
              placeholder="请选择上级部门"
              treeDefaultExpandAll
              onSelect={onSelect}
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

export default Dept;
