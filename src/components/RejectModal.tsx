import { Modal, Input } from "antd";
import { useState, memo } from "react";

const RejectModal = ({ open, onReject, onClose }) => {
  const [value, setValue] = useState("");

  return (
    <Modal
      centered
      destroyOnClose
      title={"退回备注"}
      open={open}
      style={{ minWidth: "650px" }}
      okButtonProps={{ style: { background: "#198348" } }}
      onOk={() => onReject(value)}
      onCancel={onClose}
      maskClosable={false}
    >
      <Input.TextArea
        placeholder="备注"
        onChange={(e) => setValue(e.target.value)}
      ></Input.TextArea>
    </Modal>
  );
};

export default memo(RejectModal);
