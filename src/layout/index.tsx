import React, { ReactNode, useEffect, useState } from "react";
import { Layout, Menu, Watermark } from "antd";
import User from "@/components/User";
import { useRouter } from "next/router";
import type { MenuProps } from "antd";
import Link from "next/link";
import logo from "@/assets/images/logo.png";
import Image from "next/image";

const { Header, Content, Sider } = Layout;

const AppLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const router = useRouter();
  const { asPath } = router;

  const [menu, setMenu] = useState();
  const [userName, setUserName] = useState('');
  // const [badges, setBadges] = useState();

  const [openKeys, setOpenKeys] = useState([]);
  const [collapsed, setCollapsed] = useState(false);

  const onOpenChange = (keys) => {
    const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
    if (openKeys.indexOf(latestOpenKey) === -1) {
      setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    } else {
      setOpenKeys([]);
    }
  };

  useEffect(() => {
    (async () => {
      const userName = sessionStorage.getItem("username")
      if (!!userName) {
        const menu = JSON.parse(sessionStorage.getItem("menu"));
        setUserName(userName)
        setMenu(menu);
      }
    })();
  }, [asPath]);

  const handleClick: MenuProps["onClick"] = (props) => {
    router.push(`/${props.key}`);
  };

  return asPath !== "/login" ? (
    <Layout className="h-full" style={{ minHeight: "100vh" }}>
      <Watermark
        content={`甄察供应链（${userName}）`}
        inherit={false}
        zIndex={0}
        gap={[150, 150]}
      >
        <Header
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "80px",
            padding: 0,
            background: "#fff",
          }}
          className="w-full h-[50px]"
        >
          <Link href="/" className="flex flex-row items-center">
            <Image src={logo} alt="logo" width={200} height={60} />
            <h2
              style={{
                color: "#198348",
                fontSize: "18px",
                fontWeight: "bold",
                marginLeft: "20px",
              }}
            >
              专业版
            </h2>
          </Link>
          <User />
        </Header>
        <Layout className="h-screen w-screen" style={{ display: "flex" }}>
          <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={(value) => setCollapsed(value)}
            style={{
              // position: "fixed",
              // top: 80,
              // left: 0,
              height: "100vh",
              paddingTop: "80px",
              maxWidth: "160px",
              // zIndex: 5,
              // height: "calc(100vh - 80px)",
            }}
            className="overflow-y-auto"
          >
            <Menu
              mode="inline"
              openKeys={openKeys}
              onOpenChange={onOpenChange}
              defaultSelectedKeys={["custom"]}
              selectedKeys={[asPath.slice(1, asPath.length)]}
              style={{
                height: "100%",
                borderRight: 0,
                background: "#198348",
                color: "#fff",
              }}
              items={menu}
              onClick={(props) => handleClick(props)}
            />
          </Sider>
          <Layout
            style={{
              // paddingLeft: "180px",
              paddingTop: "90px",
              minHeight: "100%",
              flex: 1,
            }}
            className="h-screen overflow-y-auto"
          >
            <Content
              style={{
                marginLeft: 5,
                marginTop: 0,
                minHeight: 280,
                background: "#FFF",
              }}
            >
              {children}
            </Content>
          </Layout>
        </Layout>
      </Watermark>
    </Layout>
  ) : (
    <Layout>{children}</Layout>
  );
};

export default AppLayout;
