import { getUserList } from "@/restApi/user";
import { Drawer, Radio, Space, Button } from "antd";
import { memo, useEffect, useState } from "react";

const TransModal = ({ transId, onClose, onConfirm }) => {
  const [users, setUsers] = useState();
  const [value, setValue] = useState();

  const onChange = (e) => {
    setValue(e.target.value);
  };

  useEffect(() => {
    (async () => {
      const res = await getUserList(1, 1000, "100", "");
      setUsers(
        res.entity.data.map((i) => ({ value: i.id, label: i.userName }))
      );
    })();
  }, []);

  return (
    <Drawer
      width="20%"
      mask={false}
      placement="right"
      title="转移项目给"
      closeIcon={false}
      extra={
        <Space>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" onClick={() => onConfirm(value)}>
            确定
          </Button>
        </Space>
      }
      open={!!transId}
      //   onCancel={onClose}
      footer={null}
      destroyOnClose
      style={{ minWidth: "90%" }}
      styles={{ body: { height: "800px", overflowY: "auto" } }}
      maskClosable={false}
    >
      <Radio.Group
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
        onChange={onChange}
        value={value}
        options={users}
      ></Radio.Group>
    </Drawer>
  );
};

export default memo(TransModal);
