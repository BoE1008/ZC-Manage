import { useEffect, useMemo, useState } from "react";
import {
  Table,
  Space,
  Button,
  Input,
  Modal,
  Form,
  message,
  Tag,
  Tree,
  Tooltip,
  Popconfirm,
  Switch,
} from "antd";
import { Operation } from "@/types";
import { EditTwoTone, DeleteTwoTone } from "@ant-design/icons";
import { getRoleList, addRole, updateRole, deleteRole } from "@/restApi/role";
import { getMenu } from "@/restApi/menu";
import { formatMenu } from "@/utils";

const Role = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [operation, setOperation] = useState<Operation>(Operation.Add);
  const [editId, setEditId] = useState("");
  const [loading, setLoading] = useState(true);

  const [allMenu, setAllMenu] = useState([]);
  const [menuIds, setMenuIds] = useState([]);

  const [status, setStatus] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await getRoleList(page, pageSize);
      setData(res);
    })();
  }, [page, pageSize]);

  const handleAdd = async () => {
    const res = await getMenu();
    setAllMenu(formatMenu(res.entity.data));
    setOperation(Operation.Add);
    setModalOpen(true);
  };

  const handleEditOne = async (record) => {
    const res = await getMenu();
    setAllMenu(formatMenu(res.entity.data));
    setOperation(Operation.Edit);
    setEditId(record.id);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  // 处理半选回传问题
  const handleMenuIds = (arr) => {
    const menuIdsParams = [];
    arr.forEach((con) => {
      if (con.length > 1) {
        menuIdsParams.push(con);
        menuIdsParams.push(con[0]);
      } else {
        menuIdsParams.push(con);
      }
    });
    return menuIdsParams;
  };

  const handleOk = async () => {
    form.validateFields().then(async () => {
      const values = form.getFieldsValue();

      const menuIdsParams = Array.from(new Set(handleMenuIds(menuIds)));

      setLoading(true);
      const { code } =
        operation === Operation.Add
          ? await addRole({ ...values, menuIds, status: status ? "0" : "1" })
          : await updateRole(editId, {
              ...values,
              menuIds: menuIdsParams,
              status: status ? "0" : "1",
            });
      if (code === 200) {
        setModalOpen(false);
        const data = await getRoleList(page, pageSize);
        setLoading(false);
        setData(data);
        message.success({
          content: operation === Operation.Add ? "添加成功" : "编辑成功",
          type: "success",
        });
      }
    });
  };

  const handleDeleteOne = async (id: string) => {
    await deleteRole(id);
    const res = await getRoleList(page, pageSize);
    setData(res);
  };

  const columns = [
    {
      title: "名称",
      dataIndex: "name",
      align: "center",
      key: "name",
    },
    {
      title: "id",
      dataIndex: "id",
      align: "center",
      key: "id",
    },
    {
      title: "roleKey",
      dataIndex: "roleKey",
      align: "center",
      key: "roleKey",
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
                okButtonProps={{
                  style: { backgroundColor: "#198348" },
                }}
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
          </Space>
        );
      },
    },
  ];

  let test = [];

  const requestList = (data) => {
    data &&
      data.forEach((item) => {
        if (item.children && item.children.length > 0) {
          requestList(item.children);
        } else {
          test.push(item.id);
        }
        return null;
      });

    return test;
  };

  const testData = useMemo(() => {
    return requestList(allMenu);
  }, [allMenu]);

  const uniqueTree = (uniqueArr, Arr) => {
    let uniqueChild = [];
    for (var i in Arr) {
      for (var k in uniqueArr) {
        if (uniqueArr[k] === Arr[i]) {
          uniqueChild.push(uniqueArr[k]);
        }
      }
    }
    return uniqueChild;
  };

  const defaultCheckedKeys = useMemo(() => {
    const listData = data?.entity.data.find((c) => c.id === editId)?.menuIds;

    return uniqueTree(listData, testData);
  }, [data, editId, testData]);

  useEffect(() => {
    setMenuIds(defaultCheckedKeys);
  }, [defaultCheckedKeys]);

  const onCheck = (checkedKeys, info) => {
    const list = checkedKeys?.concat(info.halfCheckedKeys);
    setMenuIds(list);
  };

  const onChange = (checked: boolean) => {
    setStatus(checked);
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
        // loading={loading}
        dataSource={data?.entity.data}
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
      />

      <Modal
        centered
        destroyOnClose
        title={operation === Operation.Add ? "添加角色" : "编辑角色"}
        open={modalOpen}
        onOk={handleOk}
        okButtonProps={{ style: { background: "#198348" } }}
        // confirmLoading={confirmLoading}
        onCancel={() => setModalOpen(false)}
        afterClose={() => {
          form.resetFields();
          setMenuIds([]);
          setEditId("");
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
            label="名称"
            name="name"
            validateTrigger="onBlur"
            rules={[{ required: true, message: "角色名称不能为空" }]}
          >
            <Input placeholder="名称" />
          </Form.Item>
          <Form.Item label="roleKey" name="roleKey">
            <Input placeholder="roleKey" />
          </Form.Item>
          <Form.Item label="状态" name="state">
            <Switch defaultChecked checked={status} onChange={onChange} />
          </Form.Item>
          <Form.Item label="菜单权限" name="menu">
            <Tree
              style={{ marginTop: "5px" }}
              checkable
              selectable={false}
              onCheck={onCheck}
              defaultCheckedKeys={defaultCheckedKeys}
              treeData={allMenu}
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

export default Role;
