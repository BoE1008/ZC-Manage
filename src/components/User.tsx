import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import clsx from "clsx";
import { DownOutlined } from "@ant-design/icons";
import { logout } from "@/restApi/user";
import { Modal, Form, Input, notification } from "antd";
import { updatePassword } from "@/restApi/user";

const User = () => {
  const router = useRouter();
  const [form] = Form.useForm();

  const [hovered, setHovered] = useState(false);

  const [username, setUsername] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [session, setSession] = useState();
  const [passModal, setPassModal] = useState(false);

  useEffect(() => {
    setUsername(sessionStorage.getItem("username")!);
    const res = JSON.parse(sessionStorage.getItem("userInfo"));
    setSession(res);
  }, []);

  const handleConfirmPass = async () => {
    const values = form.getFieldsValue();
    const params = {
      ...values,
      id: session?.id,
    };
    await updatePassword(params);
    setPassModal(false);
    notification.success({ message: "修改密码成功" });
  };

  return (
    <div className="pr-5 text-[#198348]">
      <div
        className="flex font-medium tracking-wider w-full py-2.5 px-3.5 relative justify-center items-center"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="flex flex-row gap-x-3">
          <span className="text-[#198348]">{username}</span>
          <DownOutlined
            className={clsx(
              "w-5 stroke-white transform transition-transform",
              hovered && "rotate-180"
            )}
          />
        </div>
        <ul
          className={clsx(
            "font-medium tracking-wider leading-8 <md:w-full min-w-20 w-max top-12 md:top-16 z-30 absolute border-[1px] px-5 py-2 bg-[#fff] flex flex-col gap-y-2",
            !hovered && "hidden"
          )}
        >
          <li
            onClick={() => setModalOpen(true)}
            className="cursor-pointer px-7.5 transform transition-all hover:scale-110 text-center"
          >
            {"个人中心"}
          </li>
          <li
            onClick={() => setPassModal(true)}
            className="cursor-pointer px-7.5 transform transition-all hover:scale-110 text-center"
          >
            {"修改密码"}
          </li>
          <li
            onClick={async () => {
              await logout();
              sessionStorage.removeItem("username");
              sessionStorage.removeItem("menu");
              setHovered(false);
              router.push("/login");
            }}
            className="cursor-pointer px-7.5 transform transition-all hover:scale-110 text-center"
          >
            {"退出登录"}
          </li>
        </ul>
      </div>
      <Modal
        centered
        title="个人中心"
        // width={"100%"}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        maskClosable={false}
      >
        <Form>
          <Form.Item label="用户名" labelCol={{ span: 6 }}>
            {session?.userName}
          </Form.Item>
          <Form.Item label="登录名" labelCol={{ span: 6 }}>
            {session?.loginName}
          </Form.Item>
          <Form.Item label="邮箱" labelCol={{ span: 6 }}>
            {session?.email}
          </Form.Item>
          <Form.Item label="手机" labelCol={{ span: 6 }}>
            {session?.mobile}
          </Form.Item>
          <Form.Item label="性别" labelCol={{ span: 6 }}>
            {session?.sex === "1" ? "女" : "男"}
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        centered
        title="修改密码"
        open={passModal}
        onOk={handleConfirmPass}
        onCancel={() => setPassModal(false)}
        afterClose={() => form.resetFields()}
        maskClosable={false}
      >
        <Form form={form} className="w-full min-w-40 text-center">
          <Form.Item name="oldPassword">
            <Input.Password size="large" placeholder="请输入旧密码" />
          </Form.Item>
          <Form.Item
            name="newPassword"
            validateTrigger="onBlur"
            rules={[
              {
                validator: (rule, value) => {
                  if (!value.trim()) {
                    rule.message = "密码必填！";
                    return Promise.reject();
                  }
                  const oNumber = "0123456789";
                  const oLetter =
                    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
                  const oSpecial = "!@#$%&*";
                  const oTher = oNumber + oLetter + oSpecial;
                  let total = 0;
                  const oSpeArr = value.split("");
                  const oNumberItem = oSpeArr.find(
                    (item: any) => oNumber.indexOf(item) !== -1
                  );
                  const oLetterItem = oSpeArr.find(
                    (item: any) => oLetter.indexOf(item) !== -1
                  );
                  const oSpeItem = oSpeArr.find(
                    (item: any) => oSpecial.indexOf(item) !== -1
                  );
                  const oTherItem = oSpeArr.find(
                    (item: any) => oTher.indexOf(item) === -1
                  );

                  if (value.length < 6 || oTherItem !== undefined) {
                    rule.message =
                      "密码不能小于六位，为字母（不区分大小写）、数字、特殊字符（!@#$%&*）的组合！";
                    return Promise.reject();
                  }
                  if (oNumberItem !== undefined) {
                    total += 1;
                  }
                  if (oLetterItem !== undefined) {
                    total += 1;
                  }
                  if (oSpeItem !== undefined) {
                    total += 1;
                  }
                  if (total >= 3) {
                    return Promise.resolve();
                  }
                  rule.message =
                    "密码不能小于六位，为字母（不区分大小写）、数字、特殊字符（!@#$%&*）的组合！";
                  return Promise.reject();
                },
              },
            ]}
          >
            <Input.Password size="large" placeholder="请输入新密码" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default User;
