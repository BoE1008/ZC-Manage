import { Modal, List, Avatar } from "antd";

export interface AuditLogItem {
  state: string;
  userName: string;
  createTime: string;
  remark?: string;
}

interface Props {
  logs: AuditLogItem[] | undefined;
  onClose: () => void;
}

/** 审核日志 Modal — invoicingCW/YW + paymentCW/YW 共用 */
const AuditLogModal = ({ logs, onClose }: Props) => (
  <Modal
    centered
    destroyOnClose
    footer={null}
    title="审核日志"
    open={!!logs}
    style={{ minWidth: "650px" }}
    onCancel={onClose}
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
);

export default AuditLogModal;