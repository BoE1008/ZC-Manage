import { useRouter } from "next/router";
import { useState, useEffect, useRef, useMemo } from "react";
import clsx from "clsx";
import {
  Boombox,
  ChevronDown,
  Key,
  Logout3,
  Profile,
  Sound,
} from "reicon-react";
import { logout } from "@/restApi/user";
import { Modal, Form, Input, message, Badge, Col, Row } from "antd";
import { updatePassword } from "@/restApi/user";
import { sm2 } from "sm-crypto";
import { SM_PUBLIC_KEY } from "@/utils/const";
import { getBadge } from "@/restApi/menu";
import { useClickAway } from "ahooks";
import NoticeCard from "./NoticeCard";

const User = () => {
  const router = useRouter();
  const [form] = Form.useForm();

  const [hovered, setHovered] = useState(false);

  const [username, setUsername] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [session, setSession] = useState();
  const [passModal, setPassModal] = useState(false);
  const [badges, setBadges] = useState();
  const [noticeModal, setNoticeModal] = useState(false);

  const noticeContainerRef = useRef();

  const closeNotice = () => setNoticeModal(false);

  useEffect(() => {
    setUsername(sessionStorage.getItem("username")!);
    const res = JSON.parse(sessionStorage.getItem("userInfo") || "");
    setSession(res);
  }, []);

  useEffect(() => {
    const func = async () => {
      const badges = await getBadge();
      setBadges(badges?.entity);
    };
    const timer = setInterval(func, 60000);
    func();

    return () => {
      clearInterval(timer);
    };
  }, []);

  useClickAway(() => {
    setNoticeModal(false);
  }, [noticeContainerRef]);

  const count = useMemo(() => {
    if (badges) {
      return Object.values(badges).reduce((a, pre) => pre + a, 0);
    } else {
      return 0;
    }
  }, [badges]);

  const handleConfirmPass = async () => {
    const values = form.getFieldsValue();
    const { oldPassword, newPassword } = values;

    const sm_old = sm2.doEncrypt(oldPassword, SM_PUBLIC_KEY, 0);
    const sm_new = sm2.doEncrypt(newPassword, SM_PUBLIC_KEY, 0);

    const params = {
      oldPassword: `04${sm_old}`,
      newPassword: `04${sm_new}`,
      id: session?.id,
    };
    await updatePassword(params);
    setPassModal(false);
    message.success("修改密码成功");
  };

  return (
    <div className="pr-5 text-[#198348] flex flex-row items-center gap-x-10 z-[101]">
      {count > 0 && (
        <div
          ref={noticeContainerRef}
          className="relative w-[25px] h-[50px] cursor-pointer"
        >
          <div
            className="absolute inset-0 w-full h-full"
            onClick={() => setNoticeModal(true)}
          >
            <Badge size="small" color="red" count={badges ? count : 0}>
              <Sound
                size={22}
                color="#198348"
                style={{ fontSize: "25px", cursor: "pointer" }}
              />
            </Badge>
          </div>

          <section
            className={clsx(
              "absolute top-10 right-0 z-10 border-[1px] px-5 py-2 bg-[#fff] w-max  flex flex-col gap-y-4",
              !noticeModal && "hidden",
            )}
          >
            <Row gutter={[16, 16]}>
              {!!badges?.projectNum && (
                <Col>
                  <NoticeCard
                    title="项目业务审核"
                    value={badges?.projectNum}
                    href="/projectYW"
                    onClose={closeNotice}
                    accent="#198348"
                  />
                </Col>
              )}
              {!!badges?.projectThNum && (
                <Col>
                  <NoticeCard
                    title="项目退回代办数"
                    value={badges?.projectThNum}
                    href="/projectSubmit"
                    onClose={closeNotice}
                    accent="#fa8c16"
                  />
                </Col>
              )}
            </Row>
            <Row gutter={[16, 16]}>
              {!!badges?.iywNum && (
                <Col>
                  <NoticeCard
                    title="开票业务审核"
                    value={badges?.iywNum}
                    href="/invoicingYW"
                    onClose={closeNotice}
                    accent="#198348"
                  />
                </Col>
              )}
              {!!badges?.icwNum && (
                <Col>
                  <NoticeCard
                    title="开票财务审核"
                    value={badges?.icwNum}
                    href="/invoicingCW"
                    onClose={closeNotice}
                    accent="#fa541c"
                  />
                </Col>
              )}
              {!!badges?.ithNum && (
                <Col>
                  <NoticeCard
                    title="开票退回代办数"
                    value={badges?.ithNum}
                    href="/invoicingSubmit"
                    onClose={closeNotice}
                    accent="#fa8c16"
                  />
                </Col>
              )}
            </Row>
            <Row gutter={[16, 16]}>
              {!!badges?.pywNum && (
                <Col>
                  <NoticeCard
                    title="付款业务审核"
                    value={badges?.pywNum}
                    href="/paymentYW"
                    onClose={closeNotice}
                    accent="#198348"
                  />
                </Col>
              )}
              {!!badges?.pldNum && (
                <Col>
                  <NoticeCard
                    title="付款领导审核"
                    value={badges?.pldNum}
                    href="/paymentLD"
                    onClose={closeNotice}
                    accent="#fa541c"
                  />
                </Col>
              )}
              {!!badges?.pcwNum && (
                <Col>
                  <NoticeCard
                    title="付款财务审核"
                    value={badges?.pcwNum}
                    href="/paymentCW"
                    onClose={closeNotice}
                    accent="#fa541c"
                  />
                </Col>
              )}
              {!!badges?.pthNum && (
                <Col>
                  <NoticeCard
                    title="付款退回代办数"
                    value={badges?.pthNum}
                    href="/paymentSubmit"
                    onClose={closeNotice}
                    accent="#fa8c16"
                  />
                </Col>
              )}
            </Row>
          </section>
        </div>
      )}

      <div
        className="flex font-medium tracking-wider w-full py-2.5 px-3.5 relative justify-center items-center"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="flex flex-row gap-x-3 items-center">
          <span className="text-[#198348] flex flex-row items-center gap-x-2">
            <Boombox />
            {username}
          </span>
          <ChevronDown
            size={16}
            className={clsx(
              "w-5 stroke-white transform transition-transform",
              hovered && "rotate-180",
            )}
          />
        </div>
        <ul
          className={clsx(
            "font-medium tracking-wider leading-8 <md:w-full min-w-20 w-max top-12 md:top-16 z-[102] absolute border-[1px] px-5 py-2 bg-[#fff] flex flex-col gap-y-2",
            !hovered && "hidden",
          )}
        >
          <li
            onClick={() => setModalOpen(true)}
            className="cursor-pointer px-7.5 transform transition-all hover:scale-110 text-center flex flex-row items-center gap-x-2"
          >
            <Profile size={16} />
            {"个人中心"}
          </li>
          <li
            onClick={() => setPassModal(true)}
            className="cursor-pointer px-7.5 transform transition-all hover:scale-110 text-center flex flex-row items-center gap-x-2"
          >
            <Key size={16} />
            {"修改密码"}
          </li>
          <li
            onClick={async () => {
              await logout();
              sessionStorage.removeItem("username");
              sessionStorage.removeItem("userInfo");
              sessionStorage.removeItem("menu");
              setHovered(false);
              router.push("/login");
            }}
            className="cursor-pointer px-7.5 transform transition-all hover:scale-110 text-center flex flex-row items-center gap-x-2"
          >
            <Logout3 size={16} />
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
            validateTrigger="onChange"
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
                    (item: any) => oNumber.indexOf(item) !== -1,
                  );
                  const oLetterItem = oSpeArr.find(
                    (item: any) => oLetter.indexOf(item) !== -1,
                  );
                  const oSpeItem = oSpeArr.find(
                    (item: any) => oSpecial.indexOf(item) !== -1,
                  );
                  const oTherItem = oSpeArr.find(
                    (item: any) => oTher.indexOf(item) === -1,
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
            <Input.Password
              size="large"
              placeholder="请输入新密码，不能小于六位，为字母、数字、特殊字符的组合！"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default User;
