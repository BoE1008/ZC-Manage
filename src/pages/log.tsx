import { getLogs } from "@/restApi/log";
import { useEffect, useState } from "react";
import { Table, Space, Input } from "antd";
import SearchInput from "@/components/SearchInput";

const Log = () => {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    (async () => {
      const logs = await getLogs(page, pageSize, userName);
      setData(logs);
      setLoading(false);
    })();
  }, [pageSize, page, userName]);

  const columns = [
    {
      title: "用户名",
      dataIndex: "userName",
      align: "center",
      key: "userName",
    },
    {
      title: "登录名",
      dataIndex: "loginName",
      align: "center",
      key: "loginName",
    },
    {
      title: "操作类型",
      dataIndex: "logName",
      align: "center",
      key: "logName",
    },
    {
      title: "操作时间",
      dataIndex: "createTime",
      align: "center",
      key: "createTime",
    },
  ];

  return (
    <div>
      <Space className="my-4 ml-4">
        <SearchInput placeholder="按用户名搜索" onSearch={setUserName} />
      </Space>
      <Table
        bordered
        loading={loading}
        dataSource={data?.entity.data}
        columns={columns}
        pagination={{
          // 设置总条数
          total: data?.entity.total,
          // 显示总条数
          showTotal: (total) => `共 ${total} 条`,
          // 是否可以改变 pageSize
          showSizeChanger: true,
          pageSize: pageSize,

          // 改变页码时
          onChange: async (page) => {
            setPage(page);
          },
          // pageSize 变化的回调
          onShowSizeChange: async (page, size) => {
            setPage(page);
            setPageSize(size);
          },
        }}
      />
    </div>
  );
};

export default Log;
