import { Modal } from "antd";
import { memo, useRef, useMemo, useEffect, useState, FC } from "react";
import * as echarts from "echarts";
import { getProjectCWStatic } from "@/restApi/project";

const StaticModal: FC<{ open: boolean; onCancel: () => void }> = ({
  open,
  onCancel,
}) => {
  const chartRef = useRef();

  const [data, setData] = useState([]);

  useEffect(() => {
    (async () => {
      const data = await getProjectCWStatic();
      setData(data?.entity?.data);
    })();
  }, []);

  const option = useMemo(() => {
    return {
      title: { text: "月份统计图", left: "center", top: "0" },
      tooltip: {
        trigger: "axis",
      },
      legend: {
        data: ["收入小计", "成本小计", "利润", "扣除后利润"],
        show: true,
        right: "20px",
        orient: "vertical",
      },
      xAxis: {
        type: "category",
        data: data?.map((c) => c.projectDate),
        axisPointer: {
          type: "shadow",
        },
        axisLabel: {
          rotate: 45,
        },
      },
      yAxis: {
        type: "value",
      },
      series: [
        {
          data: data?.map((c) => c.proIncome),
          type: "bar",
          name: "收入小计",
        },
        {
          data: data?.map((c) => c.proCost),
          type: "bar",
          name: "成本小计",
        },
        {
          data: data?.map((c) => c.profit),
          type: "line",
          name: "利润",
        },
        {
          data: data?.map((c) => c.deductProfit),
          type: "line",
          name: "扣除后利润",
        },
      ],
    };
  }, [data]);

  useEffect(() => {
    const chart = echarts.init(chartRef.current);

    chart.setOption(option);

    return () => {
      chart.dispose();
    };
  }, [option]);

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      style={{ minWidth: "80%", height: "80%" }}
    >
      <div
        style={{ width: "100%", marginTop: "50px" }}
        className="md:h-[600px] lg:h-[700px]"
        ref={chartRef}
      ></div>
    </Modal>
  );
};

export default memo(StaticModal);
