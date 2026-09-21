import { Dropdown, Button, type MenuProps } from "antd";
import { More } from "reicon-react";

interface Props {
  items: MenuProps["items"];
}

/** 「更多」下拉按钮 — Dropdown + More 图标 + 统一样式 */
const MoreButton = ({ items }: Props) => (
  <Dropdown trigger={["click"]} menu={{ items }}>
    <Button type="text" size="small" className="!px-1 !py-0.5 !text-xs">
      <More size={16} />
    </Button>
  </Dropdown>
);

export default MoreButton;