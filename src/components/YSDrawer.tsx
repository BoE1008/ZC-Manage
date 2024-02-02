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
} from "antd";
import { memo, useEffect, useState } from "react";
import { UploadOutlined } from "@ant-design/icons";
import { InvoicingTypeArr } from "@/utils/const";
import { getDictByCode } from "@/restApi/dict";
import { deleteFileById, addAndSubmitInvoicing } from "@/restApi/invoicing";
import { getProjectDetailById } from "@/restApi/project";
import { getCustomerDetailById } from "@/restApi/customer";

const YSDrawer = ({ ysRecord, onClose }) => {
  const [form] = Form.useForm();

  console.log(ysRecord);

  const [invoicingContent, setinvoicingContent] = useState();
  const [dict, setDict] = useState();
  const [bank, setBank] = useState();
  const [bankcards, setBankcards] = useState();
  const [files, setFiles] = useState([]);
  const [project, setProject] = useState(undefined);
  const [customer, setCustomer] = useState(undefined);

  useEffect(() => {
    (async () => {
      const project = await getProjectDetailById(ysRecord?.projectId);
      setProject(project.entity.data);
      const customer = await getCustomerDetailById(ysRecord?.customId);
      setCustomer(customer.entity.data);
      const data = await getDictByCode("sys_invoicing_content");
      setinvoicingContent(data.entity);
      const res = await getDictByCode("sys_money_type");
      setDict(res.entity);
    })();
  }, [ysRecord]);

  const customerFilterOption = (
    input: string,
    option?: { label: string; value: string }
  ) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  const handleMoneyTypeChnage = (value) => {
    form.setFieldValue("bankCard", {});
    form.setFieldValue("bank", {});
    const res = customer?.accountList?.filter(
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
      console.log("onchange", info);
      setFiles([...info.fileList]);
    },
    onDownload: async (file) => {
      window.open(
        `http://123.60.88.8/zc/common/download/resource?resource=${file?.url}`
      );
    },
  };

  const handleOk = async () => {
    form.validateFields().then(async () => {
      const values = form.getFieldsValue();
      console.log(values, "values");

      const params = {
        ...values,
        invoicingType: values.invoicingType?.value || "",
        moneyType: values.moneyType?.value || "",
        projectNum: project?.projectNum,
        projectId: ysRecord?.projectId,
        projectName: project?.name,
        customId: ysRecord?.customId,
        customName: ysRecord?.customName,
        bankCard: values.bankCard.value || "",
        bank: values.bank.value || "",
        taxationNumber: customer?.taxationNumber || "",
        content: values.content?.value || "",
        fee: values.fee || 0,
        remark: values.remark || "",
      };

      const formData = new FormData();
      for (const name in params) {
        formData.append(name, params[name]);
      }
      files.forEach((file) => {
        formData.append("files", file?.originFileObj);
      });
      await addAndSubmitInvoicing(formData);
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
      open={!!ysRecord}
      destroyOnClose
      mask={false}
      placement="right"
      title="开票申请"
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
          label="票种"
          name="invoicingType"
          validateTrigger="onBlur"
          rules={[{ required: true, message: "票种不能为空" }]}
        >
          <Select
            showSearch
            labelInValue
            placeholder="选择票种"
            optionFilterProp="children"
            filterOption={customerFilterOption}
            options={InvoicingTypeArr?.map((con) => ({
              label: con,
              value: con,
            }))}
          ></Select>
        </Form.Item>

        <Form.Item
          label="开票内容"
          name="content"
          validateTrigger="onBlur"
          rules={[{ required: true, message: "开票内容不能为空" }]}
        >
          <Select
            showSearch
            labelInValue
            placeholder="选择开票内容"
            optionFilterProp="children"
            filterOption={customerFilterOption}
            options={invoicingContent?.map((con) => ({
              label: con.dictLabel,
              value: con.dictLabel,
            }))}
          ></Select>
        </Form.Item>
        <Form.Item
          label="金额"
          name="fee"
          validateTrigger="onBlur"
          rules={[{ required: true, message: "金额不能为空" }]}
        >
          <InputNumber placeholder="金额" className="w-full" />
        </Form.Item>
        <Form.Item label="税号" name="taxationNumber">
          <Typography>
            <code
              style={{
                display: "inline-block",
                width: "100%",
                padding: "5px 4px",
                fontSize: "16px",
              }}
            >
              {customer?.taxationNumber}
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

export default memo(YSDrawer);
