import {
  getinvoicingYWList,
  submitToCw,
  rejectOne,
  logsOne,
  getInvoicingDetailById,
} from "@/restApi/invoicing";
import { useEffect, useState, useMemo } from "react";
import {
  Space,
  Button,
  Input,
  Modal,
  message,
  List,
  Avatar,
  Tooltip,
  Popconfirm,
  DatePicker,
} from "antd";
import {
  CheckCircleTwoTone,
  CalendarTwoTone,
  StopTwoTone,
  ProfileTwoTone,
} from "@ant-design/icons";
import { getCustomersList } from "@/restApi/customer";
import RejectModal from "@/components/RejectModal";
import InvoicingSubmitModal from "@/components/InvoicingSubmitModal";
import InvoicingDetailModal from "@/components/InvoicingDetailModal";
import { formatNumber } from "@/utils";
import { ModalType } from "@/types";
import YSYFModal from "@/components/YSYFModal";
import ResizeTable from "@/components/ResizeTable";

const InvoicingYW = () => {
  const [data, setData] = useState();
  const [customer, setCustomer] = useState();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchValue, setSearchValue] = useState("");
  const [userName, setUserName] = useState("");
  const [projectNum, setProjectNum] = useState("");

  const [logs, setLogs] = useState();

  const [loading, setLoading] = useState(true);

  const [rejectId, setRejectId] = useState();

  const [detail, setDetail] = useState();
  const [check, setCheck] = useState();

  const [customerId, setCustomerId] = useState();
  const [projectState, setProjectState] = useState();

  const [projectId, setProjectId] = useState();

  const [updateTimeSort, setUpdateTimeSort] = useState();

  useEffect(() => {
    (async () => {
      const customer = await getCustomersList(1, 1000);
      setCustomer(customer.entity.data);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getinvoicingYWList(
          page,
          pageSize,
          searchValue,
          customerId,
          projectState,
          userName,
          projectNum,
          updateTimeSort
        );
        setData(res);
        setLoading(false);
      } catch {}
    })();
  }, [
    page,
    pageSize,
    searchValue,
    customerId,
    projectState,
    userName,
    projectNum,
    updateTimeSort,
  ]);

  const handleLogsOne = async (id: string) => {
    const res = await logsOne(id);
    setLogs(res.entity.data);
  };

  const handleReject = async (invoicingId: string, remark: string) => {
    await rejectOne(invoicingId, remark, 1);
    setRejectId(undefined);
    message.success({ content: "申请已退回" });
    const data = await getinvoicingYWList(
      page,
      pageSize,
      searchValue,
      customerId,
      projectState,
      userName,
      projectNum
    );
    setLoading(false);
    setData(data);
  };

  const handleDetail = async (id) => {
    const res = await getInvoicingDetailById(id);
    setDetail(res.entity.data);
  };

  const handleCheck = async (id) => {
    const res = await getInvoicingDetailById(id);
    setCheck(res.entity.data);
  };

  const handleSubmitToCW = async () => {
    await submitToCw(detail.id);
    message.success({ content: "已提交至财务审核" });
    setDetail(undefined);
    const res = await getinvoicingYWList(
      page,
      pageSize,
      searchValue,
      customerId,
      projectState,
      userName,
      projectNum
    );
    setData(res);
  };

  const customerFilters = useMemo(() => {
    return customer?.map((item) => ({
      text: item.name,
      value: item.id,
    }));
  }, [customer]);

  const stateFilters = [
    {
      text: "未提交",
      value: "0",
    },
    {
      text: "待业务审批",
      value: "1",
    },
    {
      text: "待财务审批",
      value: "3",
    },
    {
      text: "审批通过",
      value: "4",
    },
    {
      text: "已退回",
      value: "-1",
    },
  ];

  const columns = [
    {
      title: "项目编号",
      dataIndex: "projectNum",
      align: "center",
      key: "projectNum",
    },
    {
      title: "项目名称",
      align: "center",
      key: "projectName",
      render: (record) => {
        return (
          <span
            className="cursor-pointer text-[#198348]"
            onClick={() => handleCheck(record.id)}
          >
            {record.projectName}
          </span>
        );
      },
    },
    {
      title: "客戶名称",
      dataIndex: "customName",
      align: "center",
      key: "customName",
      ellipsis: {
        showTitle: false,
      },
      render: (customName) => (
        <Tooltip placement="topLeft" title={customName}>
          {customName}
        </Tooltip>
      ),
      filterMultiple: false,
      filters: customerFilters,
      filterSearch: true,
      onFilter: (value: string, record) => record.customId === value,
    },
    {
      title: "开票票种",
      dataIndex: "invoicingType",
      align: "center",
      key: "invoicingType",
    },
    {
      title: "开票内容",
      dataIndex: "content",
      align: "center",
      key: "content",
    },
    {
      title: "开票币种",
      dataIndex: "moneyType",
      align: "center",
      key: "moneyType",
    },
    {
      title: "开票金额",
      // dataIndex: "fee",
      align: "center",
      key: "fee",
      render: (record) => formatNumber(record?.fee),
    },

    {
      title: "税号",
      dataIndex: "taxationNumber",
      align: "center",
      key: "taxationNumber",
    },
    {
      title: "开户行",
      dataIndex: "bank",
      align: "center",
      key: "bank",
    },
    {
      title: "卡号",
      dataIndex: "bankCard",
      align: "center",
      key: "bankCard",
    },
    {
      title: "地址",
      dataIndex: "address",
      align: "center",
      key: "address",
    },
    {
      title: "联系电话",
      dataIndex: "phone",
      align: "center",
      key: "phone",
    },
    {
      title: "申请人",
      dataIndex: "userName",
      align: "center",
      key: "userName",
    },
    {
      title: "申请时间",
      dataIndex: "createTime",
      align: "center",
      key: "createTime",
    },
    {
      title: "最后操作时间",
      dataIndex: "updateTime",
      align: "center",
      key: "updateTime",
      sortDirections: ["ascend", "descend"],
      sorter: true,
    },
    {
      title: "审核状态",
      dataIndex: "state",
      align: "center",
      key: "state",
      filterMultiple: false,
      filters: stateFilters,
      filterSearch: true,
      onFilter: (value: string, record) =>
        record.state ===
        stateFilters.find((item) => value === item.value)?.text,
    },
    {
      title: "备注",
      dataIndex: "remark",
      align: "center",
      key: "remark",
    },
    {
      title: "操作",
      align: "center",
      key: "action",
      render: (_, record) => {
        const isSubmit = record.state === "待业务审批";

        return (
          <Space size="middle" className="flex flex-row !gap-x-1">
            <Tooltip title={<span>查看应收应付</span>}>
              <Button
                onClick={() => setProjectId(record.projectId)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "3px 5px",
                }}
              >
                <ProfileTwoTone twoToneColor="#198348" />
              </Button>
            </Tooltip>
            {isSubmit && (
              <Tooltip title="提交至财务审核">
                <Popconfirm
                  title="提交至财务审核？"
                  getPopupContainer={(node) => node.parentElement}
                  okButtonProps={{ style: { backgroundColor: "#198348" } }}
                  // onConfirm={() => handleSubmitToCW(record.id)}
                  onConfirm={() => handleDetail(record.id)}
                >
                  <Button
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "3px 5px",
                    }}
                  >
                    <CheckCircleTwoTone twoToneColor="#198348" />
                  </Button>
                </Popconfirm>
              </Tooltip>
            )}
            {isSubmit && (
              <Tooltip title="退回申请">
                <Popconfirm
                  title="是否退回申请？"
                  getPopupContainer={(node) => node.parentElement}
                  okButtonProps={{ style: { backgroundColor: "#198348" } }}
                  onConfirm={() => setRejectId(record.id)}
                >
                  <Button
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "3px 5px",
                    }}
                  >
                    <StopTwoTone twoToneColor="#198348" />
                  </Button>
                </Popconfirm>
              </Tooltip>
            )}
            <Tooltip title="查看审核日志">
              <Button
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "3px 5px",
                }}
                onClick={() => handleLogsOne(record.id)}
              >
                <CalendarTwoTone twoToneColor="#198348" />
              </Button>
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  const handleTableChange = (pagination, filters, sorter) => {
    if (sorter.order === "ascend") {
      setUpdateTimeSort("0");
    } else if (sorter.order === "descend") {
      setUpdateTimeSort("1");
    } else {
      setUpdateTimeSort("");
    }

    setProjectState(filters.state?.[0]);
    setCustomerId(filters.customName?.[0]);
  };

  return (
    <div className="p-2">
      <div className="flex flex-row gap-y-3 justify-between mb-4">
        <Space>
          <Input
            placeholder="按项目名称搜索"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <Input
            placeholder="按项目编号搜索"
            value={projectNum}
            onChange={(e) => setProjectNum(e.target.value)}
          />
          <Input
            placeholder="按申请人搜索"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </Space>
      </div>
      <ResizeTable
        bordered
        loading={loading}
        dataSource={data?.entity.data}
        // scroll={{ scrollToFirstRowOnChange: true, y: "800px" }}
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
        onChange={handleTableChange}
      />

      <Modal
        centered
        destroyOnClose
        footer={null}
        title={"审核日志"}
        open={!!logs}
        style={{ minWidth: "650px" }}
        onCancel={() => setLogs(undefined)}
        maskClosable={false}
      >
        <List
          pagination={{ position: "bottom", align: "end" }}
          dataSource={logs}
          renderItem={(item, index) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar
                    src={`https://xsgames.co/randomusers/avatar.php?g=pixel&key=${index}`}
                  />
                }
                title={item.state}
                description={`${item.userName} ${item.createTime} 备注：${
                  item.remark || ""
                } `}
              />
            </List.Item>
          )}
        />
      </Modal>

      {!!check && (
        <InvoicingDetailModal
          data={check}
          onClose={() => setCheck(undefined)}
        />
      )}

      {!!detail && (
        <InvoicingSubmitModal
          data={detail}
          onConfirm={handleSubmitToCW}
          onClose={() => setDetail(undefined)}
        />
      )}

      {!!rejectId && (
        <RejectModal
          open={!!rejectId}
          onClose={() => setRejectId(undefined)}
          onReject={(value) => handleReject(rejectId, value)}
        />
      )}

      {!!projectId && (
        <YSYFModal
          modalType={ModalType.OTHERS}
          projectId={projectId}
          onClose={() => setProjectId(undefined)}
        />
      )}
    </div>
  );
};

export default InvoicingYW;
