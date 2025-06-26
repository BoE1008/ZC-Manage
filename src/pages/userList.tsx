import { useEffect, useState, useMemo } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  Space,
  message,
  Tooltip,
  Popconfirm,
  Tree,
  Select,
} from "antd";
import {
  EditTwoTone,
  DeleteTwoTone,
  DownOutlined,
  ThunderboltTwoTone,
} from "@ant-design/icons";
import {
  getUserList,
  updateUser,
  addUser,
  deleteUser,
  resetPassword,
} from "@/restApi/user";
import { Company, Operation } from "@/types";
import { useRouter } from "next/router";
import { getDeptList, getDeptTree } from "@/restApi/dept";
import { getRoleList } from "@/restApi/role";
import { formatMenu } from "@/utils/index";
import ResizeTable from "@/components/ResizeTable";
import { getDictById } from "@/restApi/dict";
import SearchInput from "@/components/SearchInput";

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
  const [pageSize, setPageSize] = useState(20);
  const [searchValue, setSearchValue] = useState("");
  const [selectDeptId, setSelectDeptId] = useState("100");

  const [modalOpen, setModalOpen] = useState(false);
  const [operation, setOperation] = useState<Operation>(Operation.Add);
  const [loading, setLoading] = useState(true);

  const [allDept, setAllDept] = useState([]);
  const [allRole, setAllRole] = useState([]);
  const [roleIds, setRoleIds] = useState([]);

  const [form] = Form.useForm();

  const [deptId, setDeptId] = useState("100");

  const [dict, setDict] = useState();

  useEffect(() => {
    (async () => {
      const res = await getDeptTree();
      setDepts(res.entity.data);
      const allDept = await getDeptList(1, 1000);
      setAllDept(allDept?.entity.data);
      const allRole = await getRoleList(1, 100);
      setAllRole(allRole?.entity.data);
      const data = await getUserList(page, pageSize, selectDeptId, searchValue);
      const dictRes = await getDictById();
      setLoading(false);
      setData(data);
      setDict(dictRes.entity);
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
    setDeptId(form.getFieldValue("deptId"));
  };

  const handleOk = async () => {
    form.validateFields().then(async () => {
      const values = form.getFieldsValue();
      // setLoading(true);
      operation === Operation.Add
        ? await addUser({ ...values, deptId, roleIds })
        : await updateUser({ ...values, deptId, roleIds }, editId);
      setModalOpen(false);
      const data = await getUserList(page, pageSize, selectDeptId, searchValue);
      setLoading(false);
      setData(data);
      message.success({
        content: operation === Operation.Add ? "添加成功" : "编辑成功",
        type: "success",
      });
    });
  };

  const handleDelete = async (id) => {
    await deleteUser(id);
    const data = await getUserList(page, pageSize, selectDeptId, searchValue);
    setData(data);
  };

  const handleResetPwd = async (id) => {
    await resetPassword(id);
    message.success("重置密码成功");
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
      title: "业务条线",
      dataIndex: "businessLine",
      align: "center",
      key: "businessLine",
    },
    {
      title: "业务组",
      dataIndex: "businessGroup",
      align: "center",
      key: "businessGroup",
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
            <Tooltip title="重置密码">
              <Popconfirm
                title="确定重置密码？"
                getPopupContainer={(node) => node.parentElement}
                okButtonProps={{ style: { backgroundColor: "#198348" } }}
                onConfirm={() => handleResetPwd(record.id)}
              >
                <Button
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "3px 5px",
                  }}
                >
                  <ThunderboltTwoTone twoToneColor="#198348" />
                </Button>
              </Popconfirm>
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

  const onDeptSelect = (keys, e) => {
    setDeptId(keys[0]);
  };

  const filterOption = (
    input: string,
    option?: { label: string; value: string }
  ) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

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
          <div className="flex flex-row items-center gap-3 mb-4">
            <Button
              onClick={handleAdd}
              type="primary"
              style={{
                background: "#198348",
                width: "100px",
              }}
            >
              添加
            </Button>
            <Space>
              <SearchInput placeholder="用户名" onSearch={setSearchValue} />
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
          <Form.Item
            label="用户名"
            name="userName"
            validateTrigger="onBlur"
            rules={[{ required: true, message: "用户名不能为空" }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          {operation === Operation.Add && (
            <Form.Item label="登录名" name="loginName">
              <Input placeholder="请输入登录名" />
            </Form.Item>
          )}
          <Form.Item
            label="用户编号"
            name="userNum"
            validateTrigger="onBlur"
            rules={[{ required: true, message: "用户编号不能为空" }]}
          >
            <Input placeholder="请输入用户编号" />
          </Form.Item>
          <Form.Item label="所属部门" name="deptId">
            <div className="min-w-[150px]">
              {depts.length > 0 && (
                <Tree
                  defaultExpandAll={true}
                  // defaultExpandedKeys={["100"]}
                  defaultSelectedKeys={
                    operation === Operation.Add
                      ? ["100"]
                      : [form.getFieldValue("deptId")]
                  }
                  switcherIcon={<DownOutlined />}
                  onSelect={onDeptSelect}
                  treeData={depts}
                />
              )}
            </div>
          </Form.Item>
          <Form.Item label="业务组" name="businessGroupId" hasFeedback>
            <Select
              showSearch
              placeholder="选择业务组"
              optionFilterProp="children"
              filterOption={filterOption}
              options={dict
                ?.find((con) => con.code === "sys_business_group")
                .childList?.map((con) => ({
                  value: con.id,
                  label: con.dictLabel,
                }))}
            />
          </Form.Item>
          <Form.Item label="业务条线" name="businessLineId" hasFeedback>
            <Select
              showSearch
              placeholder="选择业务条线"
              optionFilterProp="children"
              filterOption={filterOption}
              options={dict
                ?.find((con) => con.code === "sys_business_line")
                .childList?.map((con) => ({
                  value: con.id,
                  label: con.dictLabel,
                }))}
            />
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
