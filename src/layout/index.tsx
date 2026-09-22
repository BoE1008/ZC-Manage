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
  const [userName, setUserName] = useState("");

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
      const userName = sessionStorage.getItem("username");
      if (!!userName) {
        const menuStr = sessionStorage.getItem("menu");
        const menu = menuStr ? JSON.parse(menuStr) : [];
        setUserName(userName);
        setMenu(menu);
      }
    })();
  }, [asPath]);

  // 当前路径不在菜单顶级时，自动展开其父级子菜单
  useEffect(() => {
    const m = menu as any;
    if (!Array.isArray(m) || m.length === 0) return;
    const currentKey = asPath.split("?")[0].slice(1);
    if (!currentKey) return;
    const findParentKey = (items: any[], childKey: string): string | null => {
      for (const item of items || []) {
        if (item?.children?.some((c: any) => c?.key === childKey)) return item.key;
        if (item?.children) {
          const found = findParentKey(item.children, childKey);
          if (found !== null) return found;
        }
      }
      return null;
    };
    const parentKey = findParentKey(m, currentKey);
    if (parentKey && !(openKeys as any[]).includes(parentKey)) {
      (setOpenKeys as any)([parentKey]);
    }
  }, [menu, asPath]);

  const handleClick: MenuProps["onClick"] = (props) => {
    router.push(`/${props.key}`);
  };

  return (
    <Layout className="h-full" style={{ minHeight: "100vh" }}>
      <Watermark
        content={`甄察供应链（${userName}）`}
        inherit={false}
        zIndex={101}
        gap={[150, 150]}
      >
        <Header
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 101,
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
            <Image
              src={logo}
              alt="logo"
              width={200}
              height={60}
              priority={false}
            />
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
              selectedKeys={[asPath.split("?")[0].slice(1)]}
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
            className="h-screen overflow-y-auto overflow-x-auto"
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
  );
};

export default AppLayout;
