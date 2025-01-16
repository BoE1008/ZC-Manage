// import { scan } from "react-scan";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import AppLayout from "@/layout";
import { ConfigProvider } from "antd";
import locale from "antd/locale/zh_CN";
import Head from "next/head";
import "dayjs/locale/zh-cn";
import NextNProgress from "nextjs-progressbar";
import Loading from "@/components/Loading";
// import { Monitoring } from "react-scan/monitoring";

// if (typeof window !== "undefined") {
//   scan({
//     enabled: true,
//     log: true, // logs render info to console (default: false)
//   });
// }

export default function App({ Component, pageProps, router }: AppProps) {
  return (
    <>
      <Head>
        <link rel="ico" type="image" href="/favicon.ico" />
      </Head>
      <Loading />
      <NextNProgress color="#198348" height={4} />
      <ConfigProvider
        locale={locale}
        theme={{
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
        <AppLayout>
          <Component {...pageProps} />
        </AppLayout>
      </ConfigProvider>
      {/* <Monitoring
        apiKey="demo"
        url="https://monitoring.react-scan.com/api/v1/ingest"
      /> */}
    </>
  );
}
