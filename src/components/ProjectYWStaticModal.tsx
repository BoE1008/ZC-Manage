import { Modal } from "antd";
import { memo, useRef, useMemo, useEffect, useState, FC } from "react";
import * as echarts from "echarts";
import { getProjectsApproveList } from "@/restApi/project";
import { group } from "radash";

const StaticModal: FC<{ open: boolean; onCancel: () => void }> = ({
  open,
  onCancel,
}) => {
  const typeChartRef = useRef(null);
  const productChartRef = useRef(null);
  const brandChartRef = useRef(null);

  const [data, setData] = useState([]);

  useEffect(() => {
    (async () => {
      const data = await getProjectsApproveList(1, 1000, "", "", "1");
      setData(data?.entity.data);
    })();
  }, []);

  const typeChartOption = useMemo(() => {
    return {
      title: { text: "按产品分类统计", left: "center", top: "0" },
      tooltip: {
        trigger: "item",
        formatter: "{a} <br/>{b}: {c} ({d}%)",
      },
      series: [
        {
          name: "产品分类",
          type: "pie",
          radius: "55%",
          center: ["50%", "50%"],
          data: Object.entries(group(data, (item) => item.typeName)).map(
            (i) => ({
              name: i[0],
              value: i[1].length,
            }),
          ),
          itemStyle: {
            normal: {
              label: {
                show: true,
                formatter: "{b} : {c} ({d}%)", //展示的文字   类型+百分比
              },
              labelLine: { show: true },
            },
          },
        },
      ],
    };
  }, [data]);

  const productChartOption = useMemo(() => {
    return {
      title: { text: "按货物分类统计", left: "center", top: "0" },
      tooltip: {
        trigger: "item",
        formatter: "{a} <br/>{b}: {c} ({d}%)",
      },
      series: [
        {
          name: "货物分类",
          type: "pie",
          radius: "55%",
          center: ["50%", "50%"],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
          data: Object.entries(group(data, (item) => item.productName)).map(
            (i) => ({
              name: i[0],
              value: i[1].length,
            }),
          ),
          itemStyle: {
            normal: {
              label: {
                show: true,
                formatter: "{b} : {c} ({d}%)", //展示的文字   类型+百分比
              },
              labelLine: { show: true },
            },
          },
        },
      ],
    };
  }, [data]);

  const brandChartOption = useMemo(() => {
    return {
      title: { text: "按品牌分类统计", left: "center", top: "0" },
      tooltip: {
        trigger: "item",
        formatter: "{a} <br/>{b}: {c} ({d}%)",
      },
      series: [
        {
          name: "品牌分类",
          type: "pie",
          radius: "55%",
          center: ["50%", "50%"],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
          data: Object.entries(group(data, (item) => item.brandName)).map(
            (i) => ({
              name: i[0],
              value: i[1].length,
            }),
          ),
          itemStyle: {
            normal: {
              label: {
                show: true,
                formatter: "{b} : {c} ({d}%)", //展示的文字   类型+百分比
              },
              labelLine: { show: true },
            },
          },
        },
      ],
    };
  }, [data]);

  useEffect(() => {
    const typeChart = echarts.init(typeChartRef.current);
    const productChart = echarts.init(productChartRef.current);
    const brandChart = echarts.init(brandChartRef.current);

    typeChart.setOption(typeChartOption);
    productChart.setOption(productChartOption);
    brandChart.setOption(brandChartOption);

    return () => {
      typeChart.dispose();
      productChart.dispose();
      brandChart.dispose();
    };
  }, [typeChartOption, productChartOption, brandChartOption]);

  return (
    <Modal
      title={"近1000个项目业务分类数据"}
      open={open}
      onCancel={onCancel}
      footer={null}
      style={{
        minWidth: "80%",
        height: "80%",
      }}
    >
      <div className="w-full flex flex-row mt-20">
        <div ref={typeChartRef} style={{ width: "33%", height: "500px" }}></div>
        <div
          ref={productChartRef}
          style={{ width: "33%", height: "500px" }}
        ></div>
        <div
          ref={brandChartRef}
          style={{ width: "33%", height: "500px" }}
        ></div>
      </div>
    </Modal>
  );
};

export default memo(StaticModal);
