import { useRef, useState } from "react";
import { Button, message, Upload } from "antd";
import type { UploadProps } from "antd";
import { UploadOutlined } from "@ant-design/icons";

interface Props {
  /** 后端导入接口 */
  importFn: (file: File) => Promise<any>;
  /** 成功后刷新回调 */
  onSuccess?: () => void;
  /** 按钮文字 */
  label?: string;
  /** 按钮主题样式 */
  type?: "default" | "primary";
  /** 按钮尺寸 */
  size?: "small" | "middle" | "large";
}

/**
 * 批量导入按钮：点击触发文件选择 → 调用导入 API → 刷新列表
 * 仅接受 .xls / .xlsx 文件
 */
const ImportButton = ({
  importFn,
  onSuccess,
  label = "批量导入",
  type = "default",
  size,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const handleImport = async (file: File) => {
    setLoading(true);
    try {
      const res: any = await importFn(file);
      const data = res?.entity ?? res?.data ?? res;
      const msg =
        data?.msg ?? res?.msg ?? data?.message ?? res?.message ?? "导入成功";
      message.success(msg);
      onSuccess?.();
    } catch (e: any) {
      message.error("导入失败：" + (e?.message ?? "未知错误"));
    } finally {
      setLoading(false);
    }
    return false; // 阻止 antd 默认上传
  };

  const uploadProps: UploadProps = {
    showUploadList: false,
    accept: ".xls,.xlsx",
    beforeUpload: handleImport,
  };

  return (
    <Upload {...uploadProps}>
      <Button type={type} size={size} loading={loading} icon={<UploadOutlined />}>
        {label}
      </Button>
    </Upload>
  );
};

export default ImportButton;