import {
  Drawer,
  Form,
  Select,
  InputNumber,
  Input,
  Upload,
  Button,
  Typography,
  Space,
  message,
  DatePicker,
} from "antd";
import { memo, useEffect, useState } from "react";
import { UploadOutlined } from "@ant-design/icons";
import { getDictByCode } from "@/restApi/dict";
import { deleteFileById, addAndSubmitPayment } from "@/restApi/payment";
import { getProjectDetailById } from "@/restApi/project";
import { getSupplierDetailById } from "@/restApi/supplyer";
import dayjs from "dayjs";

const YFDrawer = ({ yfRecord, onClose }) => {
  const [form] = Form.useForm();

  const [dict, setDict] = useState();
  const [bank, setBank] = useState();
  const [bankcards, setBankcards] = useState();
  const [files, setFiles] = useState([]);
  const [project, setProject] = useState(undefined);
  const [supplier, setSupplier] = useState(undefined);

  useEffect(() => {
    (async () => {
      const project = await getProjectDetailById(yfRecord?.projectId);
      setProject(project.entity.data);
      const supplier = await getSupplierDetailById(yfRecord?.supplierId);
      setSupplier(supplier.entity.data);
      const res = await getDictByCode("sys_money_type");
      setDict(res.entity);
    })();
  }, [yfRecord]);

  const customerFilterOption = (
    input: string,
    option?: { label: string; value: string }
  ) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  const handleMoneyTypeChnage = (value) => {
    form.setFieldValue("bankCard", {});
    form.setFieldValue("bank", {});
    const res = supplier?.accountList?.filter(
      (c) => c.moneyType === value.value
    );
    setBankcards(res);
  };

  const handleBankCardChange = (value) => {
    form.setFieldValue("bank", {});
    const res = bankcards?.filter((c) => c.bankCard === value.value);
    setBank(res);
  };

  const uploadProps = {
    accept: ".pdf,.png,.jpg,.jpeg,.xls,.xlsx,.doc,.docx,.rar,.zip",
    name: "file",
    multiple: true,
    fileList: files,
    withCredentials: true,
    listType: "picture-card",
    headers: {
      "Content-Type": "multipart/form-data",
    },
    showUploadList: {
      showDownloadIcon: true,
      showPreviewIcon: true,
    },
    onRemove: async (file) => {
      await deleteFileById(file?.id);
      const index = files.indexOf(file);
      const newFiles = files.slice();
      newFiles.splice(index, 1);
      setFiles(newFiles);
    },
    beforeUpload: (file) => {
      setFiles([...files, file]);
      return false;
    },
    onChange: (info) => {
      setFiles([...info.fileList]);
    },
    onDownload: async (file) => {
      window.open(
        `http://115.175.21.89/zc/common/download/resource?resource=${file?.url}`
      );
    },
  };

  const handleOk = async () => {
    form.validateFields().then(async () => {
      const values = form.getFieldsValue();

      const params = {
        ...values,
        moneyType: values.moneyType.value || "",
        projectNum: project?.projectNum || "",
        projectId: project?.id || "",
        projectName: project?.name || "",
        supplierName: yfRecord?.supplierName || "",
        supplierId: yfRecord?.supplierId || "",
        bank: values.bank.value || "",
        bankCard: values.bankCard.value || "",
        taxationNumber: supplier?.taxationNumber || "",
        fee: values.fee || 0,
        remark: values.remark || "",
        yfDate: dayjs(values.yfDate).format("YYYY-MM-DD"),
        yfId: yfRecord?.id,
      };

      const formData = new FormData();
      for (const name in params) {
        formData.append(name, params[name]);
      }
      files.forEach((file) => {
        formData.append("files", file?.originFileObj);
      });
      await addAndSubmitPayment(formData);

      setFiles([]);
      message.success({
        content: "添加并已提交业务审核",
        type: "success",
      });
      onClose();
    });
  };

  return (
    <Drawer
      width="60%"
      open={!!yfRecord}
      destroyOnClose
      mask={false}
      placement="right"
      title="付款申请"
      closeIcon={false}
      extra={
        <Space>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" onClick={handleOk}>
            保存并提交至业务审核
          </Button>
        </Space>
      }
    >
      <Form
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        layout={"horizontal"}
        form={form}
        style={{ minWidth: 600, color: "#000" }}
      >
        <Form.Item
          label="金额"
          name="fee"
          validateTrigger="onBlur"
          rules={[{ required: true, message: "金额不能为空" }]}
        >
          <InputNumber placeholder="金额" className="w-full" />
        </Form.Item>
        <Form.Item label="税号" name="taxationNumber">
          {/* <Input placeholder="税号" /> */}
          <Typography>
            <code
              style={{
                display: "inline-block",
                width: "100%",
                padding: "5px 4px",
                fontSize: "16px",
              }}
            >
              {supplier?.taxationNumber}
            </code>
          </Typography>
        </Form.Item>

        <Form.Item
          label="币种"
          name="moneyType"
          validateTrigger="onBlur"
          rules={[{ required: true, message: "币种不能为空" }]}
        >
          <Select
            showSearch
            labelInValue
            placeholder="选择币种"
            optionFilterProp="children"
            filterOption={customerFilterOption}
            onChange={handleMoneyTypeChnage}
            options={dict?.map((con) => ({
              label: con.dictLabel,
              value: con.dictLabel,
            }))}
          ></Select>
        </Form.Item>
        <Form.Item label="卡号" name="bankCard">
          <Select
            showSearch
            labelInValue
            placeholder="选择银行卡"
            optionFilterProp="children"
            filterOption={customerFilterOption}
            onChange={handleBankCardChange}
            options={bankcards?.map((con) => ({
              label: con.bankCard,
              value: con.bankCard,
            }))}
          ></Select>
        </Form.Item>
        <Form.Item label="开户行" name="bank">
          <Select
            showSearch
            labelInValue
            placeholder="选择开户行"
            optionFilterProp="children"
            filterOption={customerFilterOption}
            defaultActiveFirstOption
            defaultValue={{ label: bank?.[0].bank, value: bank?.[0].bank }}
            options={bank?.map((con) => ({
              label: con.bank,
              value: con.bank,
            }))}
          ></Select>
        </Form.Item>

        <Form.Item
          label="应付日期"
          name="yfDate"
          getValueProps={(i) => ({ value: dayjs(i) })}
        >
          <DatePicker allowClear={false} />
        </Form.Item>
        <Form.Item label="备注" name="remark">
          <Input.TextArea placeholder="备注" maxLength={100} />
        </Form.Item>

        <Form.Item
          label="附件"
          // name="files"
          getValueFromEvent={({ file }) => file.originFileObj}
        >
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}>点击上传</Button>
          </Upload>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default memo(YFDrawer);
