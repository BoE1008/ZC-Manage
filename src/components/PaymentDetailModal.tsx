import { memo, useEffect, useState } from "react";
import { Modal, Upload } from "antd";
import { getFilesById, deleteFileById } from "@/restApi/payment";
import { formatNumber } from "@/utils";

const PaymentDetailModal = ({ onClose, data }) => {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    (async () => {
      const rawFilelist = await getFilesById(data?.id);
      const fileList = rawFilelist?.entity.data.map((item) => ({
        name: item.originalFileName,
        url: item.url,
        id: item.id,
        uid: item.id,
        status: "done",
      }));

      setFiles(fileList);
    })();
  }, [data?.id]);

  const uploadProps = {
    accept: ".pdf,.png,.jpg,.jpeg,.xls,.xlsx,.doc,.docx,.rar,.zip",
    name: "file",
    multiple: true,
    fileList: files,
    listType: "picture-card",
    withCredentials: true,
    headers: {
      "Content-Type": "multipart/form-data",
    },
    showUploadList: {
      showDownloadIcon: true,
      showRemoveIcon: true,
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
  return (
    <Modal
      width={"80%"}
      open={!!data}
      onCancel={onClose}
      okButtonProps={{ style: { background: "#198348" } }}
      footer={null}
      maskClosable={false}
    >
      <table style={{ width: "100%", marginBottom: "20px" }}>
        <tr
          style={{
            textAlign: "center",
            fontSize: "20px",
            fontWeight: "700",
            marginTop: "20px",
            marginBottom: "20px",
          }}
        >
          <td
            colSpan={20}
            style={{
              paddingTop: "20px",
              paddingBottom: "20px",
            }}
          >
            付款申请
          </td>
        </tr>

        <tr>
          <td
            style={{
              paddingTop: "20px",
              paddingBottom: "20px",
              border: "1px solid #333333",
            }}
          >
            申请时间
          </td>
          <td
            style={{
              paddingTop: "20px",
              paddingBottom: "20px",
              border: "1px solid #333333",
              textAlign: "center",
            }}
          >
            {data?.createTime}
          </td>
          <td
            style={{
              paddingTop: "20px",
              paddingBottom: "20px",
              border: "1px solid #333333",
            }}
          >
            申请人
          </td>
          <td
            style={{
              paddingTop: "20px",
              paddingBottom: "20px",
              border: "1px solid #333333",
              textAlign: "center",
            }}
          >
            {data?.userName}
          </td>
        </tr>

        <tr
          style={{
            paddingTop: "20px",
            paddingBottom: "20px",
            border: "1px solid #333333",
          }}
        >
          <td
            style={{
              paddingTop: "20px",
              paddingBottom: "20px",
              border: "1px solid #333333",
            }}
          >
            项目名称
          </td>
          <td
            style={{
              paddingTop: "20px",
              paddingBottom: "20px",
              textAlign: "center",
            }}
          >
            {data?.projectName}
          </td>
          <td
            style={{
              paddingTop: "20px",
              paddingBottom: "20px",
              border: "1px solid #333333",
            }}
          >
            项目编号
          </td>
          <td
            style={{
              paddingTop: "20px",
              paddingBottom: "20px",
              textAlign: "center",
            }}
          >
            {data?.projectNum}
          </td>
        </tr>

        <tr>
          <td
            style={{
              paddingTop: "20px",
              paddingBottom: "20px",
              border: "1px solid #333333",
            }}
          >
            供应商名称
          </td>
          <td
            colSpan={20}
            style={{
              paddingTop: "20px",
              paddingBottom: "20px",
              border: "1px solid #333333",
              textAlign: "center",
            }}
          >
            {data?.supplierName}
          </td>
        </tr>

        <tr>
          <td
            style={{
              paddingTop: "20px",
              paddingBottom: "20px",
              border: "1px solid #333333",
            }}
          >
            税号
          </td>
          <td
            colSpan={20}
            style={{
              paddingTop: "20px",
              paddingBottom: "20px",
              border: "1px solid #333333",
              textAlign: "center",
            }}
          >
            {data?.taxationNumber}
          </td>
        </tr>

        <tr>
          <td
            style={{
              paddingTop: "20px",
              paddingBottom: "20px",
              border: "1px solid #333333",
            }}
          >
            地址电话
          </td>
          <td
            style={{
              paddingTop: "20px",
              paddingBottom: "20px",
              border: "1px solid #333333",
              textAlign: "center",
            }}
          >
            xxx
          </td>
          <td
            style={{
              paddingTop: "20px",
              paddingBottom: "20px",
              border: "1px solid #333333",
            }}
          >
            付款币种
          </td>
          <td
            style={{
              paddingTop: "20px",
              paddingBottom: "20px",
              border: "1px solid #333333",
              textAlign: "center",
            }}
          >
            {data?.moneyType}
          </td>
        </tr>

        <tr>
          <td
            style={{
              paddingTop: "20px",
              paddingBottom: "20px",
              border: "1px solid #333333",
            }}
          >
            银行账户
          </td>
          <td
            style={{
              paddingTop: "20px",
              paddingBottom: "20px",
              border: "1px solid #333333",
              textAlign: "center",
            }}
          >
            {data?.bankCard}
          </td>
          <td
            style={{
              paddingTop: "20px",
              paddingBottom: "20px",
              border: "1px solid #333333",
            }}
          >
            付款金额
          </td>
          <td
            style={{
              paddingTop: "20px",
              paddingBottom: "20px",
              border: "1px solid #333333",
              textAlign: "center",
            }}
          >
            {formatNumber(data?.fee)}
          </td>
        </tr>

        <tr>
          <td
            style={{
              paddingTop: "20px",
              paddingBottom: "20px",
              border: "1px solid #333333",
            }}
          >
            备注：
          </td>
          <td
            colSpan={20}
            style={{
              paddingTop: "20px",
              paddingBottom: "20px",
              border: "1px solid #333333",
              textAlign: "center",
            }}
          >
            {data?.remark}
          </td>
        </tr>
      </table>

      <Upload {...uploadProps}></Upload>
    </Modal>
  );
};

export default memo(PaymentDetailModal);
