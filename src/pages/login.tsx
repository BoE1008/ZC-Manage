import { Input, Button, Form, Space } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Background from "@/assets/images/bg.jpg";
import { login, getCodeImage } from "@/restApi/user";
import { notification } from "antd";
import { menuHandler } from "@/utils";
import { getMenu } from "@/restApi/menu";
import logo from "@/assets/images/loginLogo.png";
import Image from "next/image";

const Login = () => {
  const router = useRouter();

  const [form] = Form.useForm();

  const [imgSrc, setImgSrc] = useState("");
  const [clickTimes, setClickTimes] = useState(0);

  const userLogin = async () => {
    const values = form.getFieldsValue();

    await login(values.username, values.password, values.validateCode)
      .catch(async () => {
        const codeData = await getCodeImage();
        const url = URL.createObjectURL(codeData);
        setImgSrc(url);
      })
      .then(async (res) => {
        if (res) {
          sessionStorage.setItem("username", res.entity?.userName);
          sessionStorage.setItem("userInfo", JSON.stringify(res.entity));
          sessionStorage.setItem;
          const data = await getMenu();
          sessionStorage.setItem(
            "menu",
            JSON.stringify(menuHandler(data.entity.data))
          );

          router.push("/");
        }
      });
  };

  const handleEnter = async (e) => {
    if (e.key === "Enter") {
      userLogin();
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleEnter);

    return () => {
      document.removeEventListener("keydown", handleEnter);
    };
  }, []);

  useEffect(() => {
    (async () => {
      const res = await getCodeImage();
      const url = URL.createObjectURL(res);
      setImgSrc(url);
    })();
  }, [clickTimes]);

  return (
    <div
      className="p-20 w-full h-screen flex flex-col items-center justify-center gap-y-20"
      style={{
        background: `url(${Background.src})`,
        backgroundPosition: "center",
        backgroundSize: "100% 100%",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Image src={logo} alt="logo" width={400} height={60} />
      <Form form={form} className="w-1/4 min-w-40 text-center">
        <Form.Item name="username">
          <Input
            size="large"
            placeholder="请输入用户名"
            prefix={<UserOutlined />}
          />
        </Form.Item>
        <Form.Item name="password">
          <Input.Password size="large" placeholder="请输入密码" />
        </Form.Item>
        <Form.Item name="validateCode">
          <Space style={{ display: "flex", flexDirection: "row" }}>
            <Input size="middle" placeholder="验证码" />
            <Image
              src={imgSrc}
              width={100}
              height={40}
              onClick={() => setClickTimes((pre) => pre + 1)}
              style={{ cursor: "pointer" }}
              alt="code"
            />
          </Space>
        </Form.Item>
        <Form.Item>
          <Button
            size="large"
            className="!bg-[#198348] !text-white w-1/3"
            onClick={userLogin}
          >
            {"登录"}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
