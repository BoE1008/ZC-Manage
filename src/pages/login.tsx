import { Input, Button, Form, Space, Modal } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Background from "@/assets/images/bg.jpg";
import Background2 from "@/assets/images/bg2.jpg";
import { login, getCodeImage, updatePassword } from "@/restApi/user";
import { message } from "antd";
import { menuHandler } from "@/utils";
import { getMenu } from "@/restApi/menu";
import logo from "@/assets/images/logo.png";
import Image from "next/image";
import * as SM from "sm-crypto";
import { SM_PUBLIC_KEY } from "@/utils/const";
import styles from "./styles.module.scss";

import Particles, { initParticlesEngine } from "@tsparticles/react";
import type { Container, Engine } from "@tsparticles/engine";
// import { loadAll } from "@/tsparticles/all"; // if you are going to use `loadAll`, install the "@tsparticles/all" package too.
// import { loadFull } from "tsparticles"; // if you are going to use `loadFull`, install the "tsparticles" package too.
import { loadSlim } from "@tsparticles/slim"; // if you are going to use `loadSlim`, install the "@tsparticles/slim" package too.
import clsx from "clsx";
// import { loadBasic } from "@tsparticles/basic";
import ShinyText from "@/components/ShinyText";

const CIPHER_MODE = 0;

const Login = () => {
  const router = useRouter();

  const [form] = Form.useForm();

  const [imgSrc, setImgSrc] = useState("");
  const [clickTimes, setClickTimes] = useState(0);

  const [passModal, setPassModal] = useState(false);

  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      // you can initiate the tsParticles instance (engine) here, adding custom shapes or presets
      // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
      // starting from v2 you can add only the features you need reducing the bundle size
      //await loadAll(engine);
      //await loadFull(engine);
      await loadSlim(engine);
      //await loadBasic(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = (container: Container) => {};

  const userLogin = async () => {
    const values = form.getFieldsValue();

    const { username, password, validateCode } = values;

    const sm_username = SM.sm2.doEncrypt(username, SM_PUBLIC_KEY, CIPHER_MODE);
    const sm_password = SM.sm2.doEncrypt(password, SM_PUBLIC_KEY, CIPHER_MODE);

    await login(`04${sm_username}`, `04${sm_password}`, validateCode)
      .catch(async () => {
        const codeData = await getCodeImage();
        const url = URL.createObjectURL(codeData);
        setImgSrc(url);
      })
      .then(async (res) => {
        if (res) {
          sessionStorage.setItem("username", res.entity?.userName);
          sessionStorage.setItem("userInfo", JSON.stringify(res.entity));
          const data = await getMenu();
          sessionStorage.setItem(
            "menu",
            JSON.stringify(menuHandler(data.entity.data))
          );

          if (res.entity?.changePassword === "0") {
            setPassModal(true);
          } else {
            router.push("/");
          }
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

  const handleConfirmPass = async () => {
    const values = form.getFieldsValue();
    const { oldPassword, newPassword } = values;

    const sm_old = SM.sm2.doEncrypt(oldPassword, SM_PUBLIC_KEY, 0);
    const sm_new = SM.sm2.doEncrypt(newPassword, SM_PUBLIC_KEY, 0);

    const params = {
      oldPassword: `04${sm_old}`,
      newPassword: `04${sm_new}`,
      id: JSON.parse(sessionStorage.getItem("userInfo"))?.id,
    };
    await updatePassword(params);
    setPassModal(false);
    message.success({ content: "修改密码成功" });
    const codeData = await getCodeImage();
    const url = URL.createObjectURL(codeData);
    setImgSrc(url);
  };

  return (
    init && (
      <>
        {/* <Particles
          id="tsparticles"
          particlesLoaded={particlesLoaded}
          options={{
            fullScreen: true,
            background: {
              image: `url(${Background2.src})`,
              position: "center",
              size: "100% 100%",
              repeat: "no-repeat",
            },
            fpsLimit: 120,
            interactivity: {
              events: {
                onClick: {
                  enable: true,
                  mode: "push",
                },
                onHover: {
                  enable: true,
                  mode: "repulse",
                },
                resize: true,
              },
              modes: {
                push: {
                  quantity: 4,
                },
                repulse: {
                  distance: 200,
                  duration: 0.4,
                },
              },
            },
            particles: {
              color: {
                value: "#ffffff",
              },
              links: {
                color: "#ffffff",
                distance: 150,
                enable: true,
                opacity: 0.5,
                width: 1,
              },
              move: {
                direction: "none",
                enable: true,
                outModes: {
                  default: "bounce",
                },
                random: false,
                speed: 2,
                straight: false,
              },
              number: {
                density: {
                  enable: true,
                  area: 800,
                },
                value: 100,
              },
              opacity: {
                value: 0.8,
              },
              shape: {
                type: "circle",
              },
              size: {
                value: { min: 1, max: 5 },
              },
            },
            detectRetina: true,
          }}
        /> */}

        <div className="w-screen h-screen relative flex items-center justify-center">
          <div className="relative w-full h-full">
            <Image src={Background2} alt="" layout="fill" />
          </div>
          <div
            className={clsx(
              "flex flex-col gap-y-20 px-10 py-[60px] rounded-[10px]  backdrop-blur-[4px] shadow-lg shadow-light-500 border-slate-100 bg-white-500/10 items-center justify-center absolute md:right-[1%] lg:right-[5%] xl:right-[8%] 2xl:right-[12%]",
              styles.loginContainer
            )}
          >
            <section className="w-[300px] h-[80px]">
              <Image
                src={logo}
                alt="logo"
                className="object-contain"
                priority
              />
            </section>

            <section className="absolute bottom-2 text-[12px]">{`CopyRight © 2023 上海甄察供应链管理有限公司 版权所有`}</section>

            <Form form={form} className="min-w-40 text-center w-2/3">
              <Form.Item name="username">
                <Input
                  size="large"
                  placeholder="请输入用户名"
                  prefix={<UserOutlined />}
                  className="h-[45px]"
                />
              </Form.Item>
              <Form.Item name="password">
                <Input.Password
                  size="large"
                  placeholder="请输入密码"
                  className="h-[45px]"
                />
              </Form.Item>
              <Form.Item name="validateCode">
                <div className="flex flex-row gap-x-2">
                  <Input
                    size="middle"
                    placeholder="验证码"
                    className="flex-1 h-[45px]"
                  />
                  <Image
                    src={imgSrc}
                    width={100}
                    height={40}
                    onClick={() => setClickTimes((pre) => pre + 1)}
                    style={{ cursor: "pointer" }}
                    alt="code"
                  />
                </div>
              </Form.Item>
              <Form.Item style={{ marginTop: "40px" }}>
                <Button
                  size="large"
                  className={clsx(
                    "!bg-[#198348] !text-white w-full",
                    styles.loginbutton
                  )}
                  onClick={userLogin}
                >
                  <ShinyText text="登录" speed={1} />
                </Button>
              </Form.Item>
            </Form>
          </div>

          <Modal
            centered
            closable={false}
            cancelButtonProps={{ style: { display: "none" } }}
            title="修改初始密码"
            open={passModal}
            onOk={handleConfirmPass}
            onCancel={() => setPassModal(false)}
            afterClose={() => form.resetFields()}
            maskClosable={false}
          >
            <div style={{ color: "red", marginBottom: "20px" }}>
              注：须修改初始密码
            </div>
            <Form form={form} className="w-full min-w-40 text-center">
              <Form.Item name="oldPassword">
                <Input.Password size="large" placeholder="请输入初始密码" />
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
                <Input.Password
                  size="large"
                  placeholder="不能小于六位，为字母、数字、特殊字符的组合！"
                />
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </>
    )
  );
};

export default Login;
