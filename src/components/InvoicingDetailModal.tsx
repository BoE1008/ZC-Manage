import { memo, useEffect, useState } from "react";
import { Modal, Upload } from "antd";
import { getFilesById, deleteFileById } from "@/restApi/invoicing";
import { formatNumber } from "@/utils";
import Image from "next/image";

const InvoicingDetailModal = ({ onClose, data }) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
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
        // `http://123.60.88.8/zc/common/download/resource?resource=${file?.url}`
      );
    },
  };

  const handleCancel = () => setPreviewOpen(false);

  return (
    <>
      <Modal
        width={"80%"}
        open={!!data}
        onCancel={onClose}
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
              开票申请
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
              客户名称
            </td>
            <td
              style={{
                paddingTop: "20px",
                paddingBottom: "20px",
                border: "1px solid #333333",
                textAlign: "center",
              }}
            >
              {data?.customName}
            </td>
            <td
              style={{
                paddingTop: "20px",
                paddingBottom: "20px",
                border: "1px solid #333333",
              }}
            >
              开票内容
            </td>
            <td
              style={{
                paddingTop: "20px",
                paddingBottom: "20px",
                border: "1px solid #333333",
                textAlign: "center",
              }}
            >
              {data?.content}
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
              style={{
                paddingTop: "20px",
                paddingBottom: "20px",
                border: "1px solid #333333",
                textAlign: "center",
              }}
            >
              {data?.taxationNumber}
            </td>
            <td
              style={{
                paddingTop: "20px",
                paddingBottom: "20px",
                border: "1px solid #333333",
              }}
            >
              开票票种
            </td>
            <td
              style={{
                paddingTop: "20px",
                paddingBottom: "20px",
                border: "1px solid #333333",
                textAlign: "center",
              }}
            >
              {data?.invoicingType}
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
              开票币种
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
              开票金额
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

      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={handleCancel}
      >
        <Image
          alt="file"
          style={{ width: "100%", padding: "40px" }}
          src={previewImage}
        />
      </Modal>
    </>
  );
};

export default memo(InvoicingDetailModal);
