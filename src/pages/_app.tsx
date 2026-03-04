// import { scan } from "react-scan";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import AppLayout from "@/layout";
import { ConfigProvider, theme, App as AntdApp } from "antd";
import locale from "antd/locale/zh_CN";
import Head from "next/head";
import "dayjs/locale/zh-cn";
import NextNProgress from "nextjs-progressbar";
import Loading from "@/components/Loading";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { isLogged } from "@/utils";
// import { Monitoring } from "react-scan/monitoring";

let buildInfo: { version: string; buildTime: string } | null = null;
try {
  buildInfo = require("@/build-info.json");
} catch (e) {
  buildInfo = null;
}

// if (typeof window !== "undefined") {
//   scan({
//     enabled: true,
//     log: true,
//   });
// }

const NO_LAYOUT_ROUTES = ["/login"];

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isNoLayout = NO_LAYOUT_ROUTES.includes(router.pathname);

  // 统一登录校验
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkLogin = () => {
      const authed = isLogged();

      if (!isNoLayout && !authed) {
        router.replace("/login");
      } else {
        setIsReady(true);
      }
    };

    checkLogin();
  }, [router.pathname, isNoLayout, router]);

  useEffect(() => {
    console.log('%c🚀 上海甄察供应链业务管理系统', 'font-size: 20px; font-weight: bold; color: #198348;');
    if (buildInfo) {
      console.log('%c版本: ' + buildInfo.version, 'font-size: 14px; color: #333;');
      console.log('%c构建时间: ' + buildInfo.buildTime, 'font-size: 12px; color: #666;');
    } else {
      console.log('%c版本: 0.1.0', 'font-size: 14px; color: #333;');
      console.log('%c构建时间: 开发模式', 'font-size: 12px; color: #666;');
    }
    console.log('%c----------------------------------------', 'color: #198348;');
  }, []);

  // 防止未授权时组件提前渲染
  if (!isNoLayout && !isReady) return null;

  const page = <Component {...pageProps} />;
  const content = isNoLayout ? page : <AppLayout>{page}</AppLayout>;

  return (
    <ConfigProvider
      locale={locale}
      theme={{
        algorithm: theme.compactAlgorithm,
        token: {
          fontSize: 16,
          colorTextBase: "#000",
          colorBgBase: "#fff",
          colorPrimary: "#198348",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", "PingFang SC", "Noto Sans CJK SC", "Microsoft YaHei", sans-serif',
        },
        components: {
          Menu: {
            itemHoverBg: "#106b39",
            itemSelectedBg: "#fff",
            itemColor: "#fff",
            itemHoverColor: "#fff",
            popupBg: "#198348",
            subMenuItemBg: "#198348",
            itemSelectedColor: "#198348",
          },
          Table: {
            colorText: "#000",
            colorTextHeading: "#000",
          },
          Modal: {
            colorBgBase: "#198348",
            colorBgContainer: "#198348",
          },
          Switch: {},
          Layout: { triggerBg: "#198348", siderBg: "#198348" },
        },
      }}
    >
      <AntdApp>
        <Head>
          <link rel="ico" type="image" href="/favicon.ico" />
          <title>上海甄察供应链业务管理系统</title>
        </Head>
        <Loading />
        <NextNProgress color="#198348" height={4} />
        {content}
      </AntdApp>
    </ConfigProvider>
  );
}
