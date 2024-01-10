import { useEffect, useState, useMemo } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  notification,
  Tooltip,
  Popconfirm,
  Tree,
  Select,
} from "antd";
import { EditTwoTone, DeleteTwoTone, DownOutlined } from "@ant-design/icons";
import { getUserList, updateUser, addUser, deleteUser } from "@/restApi/user";
import { Company, Operation } from "@/types";
import { useRouter } from "next/router";
import { getDeptList, getDeptTree } from "@/restApi/dept";
import { getRoleList } from "@/restApi/role";
import { formatMenu } from "@/utils/index";

const initialValues = {
  name: "",
  address: "",
  contactsName: "",
  contactsMobile: "",
  remark: "",
};

const User = () => {
  const router = useRouter();
  const [data, setData] = useState();
  const [depts, setDepts] = useState([]);
  const [editId, setEditId] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchValue, setSearchValue] = useState("");
  const [selectDeptId, setSelectDeptId] = useState("100");

  const [modalOpen, setModalOpen] = useState(false);
  const [operation, setOperation] = useState<Operation>(Operation.Add);
  const [loading, setLoading] = useState(true);

  const [allDept, setAllDept] = useState([]);
  const [allRole, setAllRole] = useState([]);
  const [roleIds, setRoleIds] = useState([]);

  const [form] = Form.useForm();

  useEffect(() => {
    (async () => {
      if (!!sessionStorage.getItem("username")) {
        const res = await getDeptTree();
        setDepts(res.entity.data);
        const allDept = await getDeptList(1, 1000);
        setAllDept(allDept?.entity.data);
        const allRole = await getRoleList(1, 100);
        setAllRole(allRole?.entity.data);
        const data = await getUserList(
          page,
          pageSize,
          searchValue,
          selectDeptId
        );
        setLoading(false);
        setData(data);
      } else {
        router.push("/login");
      }
    })();
  }, [page, pageSize, searchValue, router, selectDeptId]);

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
    // setLoading(true);
    operation === Operation.Add
      ? await addUser({ ...values, deptId: selectDeptId, roleIds })
      : await updateUser({ ...values, deptId: selectDeptId, roleIds }, editId);
    setModalOpen(false);
    const data = await getUserList(page, pageSize, searchValue, selectDeptId);
    setLoading(false);
    setData(data);
    notification.success({
      message: operation === Operation.Add ? "添加成功" : "编辑成功",
      duration: 3,
    });
  };

  const handleDelete = async (id) => {
    await deleteUser(id);
    const data = await getUserList(page, pageSize, searchValue, selectDeptId);
    setData(data);
  };

  const columns = [
    {
      title: "用户编号",
      dataIndex: "userNum",
      align: "center",
      key: "userNum",
    },
    {
      title: "用户名",
      align: "center",
      dataIndex: "userName",
      key: "userName",
    },
    {
      title: "登录名",
      dataIndex: "loginName",
      align: "center",
      key: "loginName",
    },
    {
      title: "所属部门",
      // dataIndex: "loginName",
      align: "center",
      key: "dept",
      render: (record) => {
        return allDept.find((c) => c.id === record.deptId)?.name;
      },
    },
    {
      title: "邮箱",
      dataIndex: "email",
      align: "center",
      key: "email",
    },
    {
      title: "联系电话",
      dataIndex: "mobile",
      align: "center",
      key: "mobile",
    },
    {
      title: "操作",
      align: "center",
      key: "action",
      render: (_, record: Company) => {
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
                onConfirm={() => handleDelete(record.id)}
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

  // const onSelect = (selectedKeys) => {
  //   setSelectDeptId(selectedKeys[0]);
  // };

  const onSelect = (keys, e) => {
    if (!e.selected) {
      setSelectDeptId([e.node.key]);
      return;
    }
    setSelectDeptId(keys);
  };

  const defaultCheckedKeys = useMemo(() => {
    return data?.entity.data.find((c) => c.id === editId)?.roleIds;
  }, [data, editId]);

  useEffect(() => {
    setRoleIds(defaultCheckedKeys);
  }, [defaultCheckedKeys]);

  const onCheck = (checkedKeys, info) => {
    const list = checkedKeys.concat(info.halfCheckedKeys);
    setRoleIds(list);
  };

  return (
    <div className="w-full p-2" style={{ color: "#000" }}>
      <div className="w-full flex flex-row gap-x-10">
        <div className="min-w-[150px]">
          {depts.length > 0 && (
            <Tree
              defaultExpandAll={true}
              // defaultExpandedKeys={["100"]}
              defaultSelectedKeys={["100"]}
              switcherIcon={<DownOutlined />}
              onSelect={onSelect}
              treeData={depts}
            />
          )}
        </div>
        <div className="flex-1">
          <div className="flex flex-row justify-between gap-y-3">
            <Button
              onClick={handleAdd}
              type="primary"
              style={{
                marginBottom: 16,
                background: "#198348",
                width: "100px",
              }}
            >
              添加
            </Button>
            <Space>
              <Input
                placeholder="用户名"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              {/* <Button onClick={handleSearch}>查询</Button> */}
            </Space>
          </div>
          <Table
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
        </div>
      </div>
      <Modal
        centered
        destroyOnClose
        title={operation === Operation.Add ? "添加用户" : "编辑用户"}
        open={modalOpen}
        onOk={handleOk}
        okButtonProps={{ style: { background: "#198348" } }}
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
          <Form.Item required label="用户名" name="userName">
            <Input placeholder="请输入用户名" />
          </Form.Item>
          {operation === Operation.Add && (
            <Form.Item label="登录名" name="loginName">
              <Input placeholder="请输入登录名" />
            </Form.Item>
          )}
          <Form.Item required label="用户编号" name="userNum">
            <Input placeholder="请输入用户编号" />
          </Form.Item>
          <Form.Item label="用户角色" name="userRole">
            <Tree
              style={{ marginTop: "5px" }}
              checkable
              selectable={false}
              onCheck={onCheck}
              defaultCheckedKeys={defaultCheckedKeys}
              treeData={formatMenu(allRole)}
            />
          </Form.Item>
          <Form.Item label="邮箱" name="email">
            <Input placeholder="请输入邮箱地址" />
          </Form.Item>
          <Form.Item label="电话" name="mobile">
            <Input placeholder="请输入电话" />
          </Form.Item>
          {/* <Form.Item label="备注" name="remark">
            <Input placeholder="备注信息" />
          </Form.Item> */}
        </Form>
      </Modal>
    </div>
  );
};

export default User;
