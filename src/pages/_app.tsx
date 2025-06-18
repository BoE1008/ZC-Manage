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
import { StyleProvider } from "@ant-design/cssinjs";
import { AntdRegistry } from "@ant-design/nextjs-registry";
// import { Monitoring } from "react-scan/monitoring";

// if (typeof window !== "undefined") {
//   scan({
//     enabled: true,
//     log: true, // logs render info to console (default: false)
//   });
// }

export default function App({ Component, pageProps, router }: AppProps) {
  return (
    <AntdRegistry>
      <StyleProvider hashPriority="high">
        <ConfigProvider
          locale={locale}
          theme={{
            algorithm: theme.compactAlgorithm,
            token: {
              fontSize: 16,
              colorTextBase: "#000",
              colorBgBase: "#fff",
              colorPrimary: "#198348",
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
            <AppLayout>
              <Component {...pageProps} />
            </AppLayout>
          </AntdApp>
        </ConfigProvider>
      </StyleProvider>
    </AntdRegistry>
  );
}
