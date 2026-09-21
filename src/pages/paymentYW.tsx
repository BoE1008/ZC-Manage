import { useEffect, useState, useMemo } from "react";
import {
  Space,
  Button,
  Input,
  Modal,
  message,
  Tooltip,
  DatePicker,
} from "antd";
import { CheckCircle, Calendar, Stop, Card, Eye, More } from "reicon-react";
import {
  getPaymentYWList,
  submitToLD,
  submitYWToCW,
  logsOne,
  rejectOne,
  getPaymentDetailById,
} from "@/restApi/payment";
import { getSuppliersList } from "@/restApi/supplyer";
import RejectModal from "@/components/RejectModal";
import MoreButton from "@/components/MoreButton";
import AuditLogModal from "@/components/AuditLogModal";
import PaymentSubmitModal from "@/components/PaymentSubmitModal";
import { formatNumber } from "@/utils";
import PaymentDetailModal from "@/components/PaymentDetailModal";
import { ModalType, AUDIT_STATE_FILTERS } from "@/types";
import YSYFModal from "@/components/YSYFModal";
import ResizeTable from "@/components/ResizeTable";
import SearchInput from "@/components/SearchInput";

const PaymentYW = () => {
  const [data, setData] = useState();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchValue, setSearchValue] = useState("");
  const [userName, setUserName] = useState("");
  const [projectNum, setProjectNum] = useState("");
  const [date, setDate] = useState("");

  const [supplier, setSupplier] = useState();

  const [logs, setLogs] = useState();

  const [loading, setLoading] = useState(true);

  const [rejectId, setRejectId] = useState();

  const [detail, setDetail] = useState();
  const [check, setCheck] = useState();

  const [submitType, setSubmitType] = useState();

  const [supplierId, setSupplierId] = useState();
  const [projectState, setProjectState] = useState();

  const [projectId, setProjectId] = useState();

  const [updateTimeSort, setUpdateTimeSort] = useState();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const supplierData = await getSuppliersList(1, 10000);
        setSupplier(supplierData.entity.data);
        setLoading(false);
      } catch (ex) {}
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getPaymentYWList(
          page,
          pageSize,
          searchValue,
          supplierId,
          projectState,
          userName,
          projectNum,
          date,
          updateTimeSort,
        );
        setData(res);
        setLoading(false);
      } catch {}
    })();
  }, [
    page,
    pageSize,
    searchValue,
    supplierId,
    projectState,
    userName,
    projectNum,
    date,
    updateTimeSort,
  ]);

  const handleDetail = async (id) => {
    const res = await getPaymentDetailById(id);
    setDetail(res.entity.data);
  };

  const handleCheck = async (id) => {
    const res = await getPaymentDetailById(id);
    setCheck(res.entity.data);
  };

  const handleSubmitToLD = async () => {
    await submitToLD(detail.id);
    message.success({ content: "已提交至领导审核", type: "success" });
    setDetail(undefined);
    const res = await getPaymentYWList(
      page,
      pageSize,
      searchValue,
      supplierId,
      projectState,
      userName,
      projectNum,
      date,
    );
    setData(res);
  };

  const handleSubmitToCW = async () => {
    await submitYWToCW(detail.id);
    message.success({ content: "已提交至财务审核", type: "success" });
    setDetail(undefined);
    const res = await getPaymentYWList(
      page,
      pageSize,
      searchValue,
      supplierId,
      projectState,
      userName,
      projectNum,
      date,
    );
    setData(res);
  };

  const handleRejectOne = async (id: string, remark: string) => {
    await rejectOne(id, remark, 1);
    setRejectId(undefined);
    message.success({ content: "申请已退回", type: "success" });
    const res = await getPaymentYWList(
      page,
      pageSize,
      searchValue,
      supplierId,
      projectState,
      userName,
      projectNum,
      date,
    );
    setData(res);
  };

  const handleLogsOne = async (id: string) => {
    const res = await logsOne(id);
    setLogs(res.entity.data);
  };

  const supplierFilters = useMemo(() => {
    return supplier?.map((item) => ({
      text: item.name,
      value: item.id,
    }));
  }, [supplier]);

  const stateFilters = AUDIT_STATE_FILTERS;

  const columns = [
    {
      title: "项目编号",
      dataIndex: "projectNum",
      align: "center",
      key: "projectNum",
    },
    {
      title: "项目名称",
      // dataIndex: "projectName",
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
      title: "供应商",
      dataIndex: "supplierName",
      align: "center",
      key: "supplierName",
      filterMultiple: false,
      filters: supplierFilters,
      filterSearch: true,
      onFilter: (value: string, record) => record.supplierId === value,
      ellipsis: {
        showTitle: false,
      },
      render: (supplierName) => (
        <Tooltip placement="topLeft" title={supplierName}>
          {supplierName}
        </Tooltip>
      ),
    },
    {
      title: "币种",
      dataIndex: "moneyType",
      align: "center",
      key: "moneyType",
    },
    {
      title: "金额",
      // dataIndex: "fee",
      align: "center",
      key: "fee",
      render: (record) => formatNumber(record?.fee),
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
      title: "税号",
      dataIndex: "taxationNumber",
      align: "center",
      key: "taxationNumber",
    },
    {
      title: "银行卡号",
      dataIndex: "bankCard",
      align: "center",
      key: "bankCard",
    },
    {
      title: "开户行",
      dataIndex: "bank",
      align: "center",
      key: "bank",
      ellipsis: {
        showTitle: false,
      },
      render: (bank) => (
        <Tooltip placement="topLeft" title={bank}>
          {bank}
        </Tooltip>
      ),
    },
    {
      title: "班列号/船名",
      label: "班列号/船名",
      value: "班列号/船名",
      dataIndex: "trainNumName",
      align: "center",
      key: "trainNumName",
    },
    {
      title: "申请人",
      dataIndex: "userName",
      align: "center",
      key: "userName",
    },
    {
      title: "应付日期",
      dataIndex: "yfDate",
      align: "center",
      key: "yfDate",
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
      title: "备注",
      dataIndex: "remark",
      align: "center",
      key: "remark",
      ellipsis: {
        showTitle: false,
      },
      render: (remark) => (
        <Tooltip placement="topLeft" title={remark}>
          {remark}
        </Tooltip>
      ),
    },
    {
      title: "操作",
      align: "center",
      width: 120,
      fixed: "right",
      key: "action",
      render: (_, record) => {
        const isSubmit = record.state === "待业务审批";
        const moreItems: any[] = [
          ...(isSubmit
            ? [
                {
                  key: "submitLD",
                  label: "提交至领导审核",
                  icon: <Card size={16} />,
                  onClick: () =>
                    Modal.confirm({
                      title: "是否提交？",
                      okButtonProps: { style: { backgroundColor: "#198348" } },
                      onOk: () => {
                        setSubmitType(0);
                        handleDetail(record.id);
                      },
                    }),
                },
              ]
            : []),
          ...(isSubmit
            ? [
                {
                  key: "submitCW",
                  label: "提交至财务审核",
                  icon: <CheckCircle size={16} />,
                  onClick: () =>
                    Modal.confirm({
                      title: "是否提交？",
                      okButtonProps: { style: { backgroundColor: "#198348" } },
                      onOk: () => {
                        setSubmitType(1);
                        handleDetail(record.id);
                      },
                    }),
                },
              ]
            : []),
          ...(isSubmit
            ? [
                {
                  key: "reject",
                  label: "退回申请",
                  icon: <Stop size={16} />,
                  danger: true,
                  onClick: () =>
                    Modal.confirm({
                      title: "是否退回？",
                      okButtonProps: { style: { backgroundColor: "#198348" } },
                      onOk: () => setRejectId(record.id),
                    }),
                },
              ]
            : []),
          {
            key: "logs",
            label: "查看审核日志",
            icon: <Calendar size={16} />,
            onClick: () => handleLogsOne(record.id),
          },
        ];
        return (
          <Space size={4} className="justify-center">
            <Tooltip title={<span>查看应收应付</span>}>
              <Button
                type="text"
                size="small"
                className="!px-1 !py-0.5 !text-xs"
                onClick={() => setProjectId(record.projectId)}
              >
                <Eye size={16} />
              </Button>
            </Tooltip>
            {moreItems.length > 0 && (
              <Tooltip title="更多">
                <MoreButton items={moreItems} />
              </Tooltip>
            )}
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
    setSupplierId(filters.supplierName?.[0]);
  };

  const handleDateChange = (date, dateString) => {
    setDate(dateString);
  };

  return (
    <div className="p-2">
      <div className="flex flex-row gap-y-3 justify-between mb-4 sticky top-[0px] z-[100] bg-[#fff]">
        <div className="flex flex-row gap-x-4">
          <SearchInput placeholder="按项目编号搜索" onSearch={setProjectNum} />
          <SearchInput placeholder="按项目名称搜索" onSearch={setSearchValue} />
          <SearchInput placeholder="按申请人搜索" onSearch={setUserName} />
          <DatePicker
            style={{ minWidth: "180px" }}
            picker="month"
            placeholder="按应付日期搜索"
            onChange={handleDateChange}
          />
        </div>
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

      <AuditLogModal logs={logs} onClose={() => setLogs(undefined)} />

      {!!check && (
        <PaymentDetailModal data={check} onClose={() => setCheck(undefined)} />
      )}

      {!!detail && (
        <PaymentSubmitModal
          data={detail}
          onConfirm={() => {
            submitType === 0 ? handleSubmitToLD() : handleSubmitToCW();
          }}
          onClose={() => setDetail(undefined)}
        />
      )}

      {!!rejectId && (
        <RejectModal
          open={!!rejectId}
          onClose={() => setRejectId(undefined)}
          onReject={(value) => handleRejectOne(rejectId, value)}
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

export default PaymentYW;
