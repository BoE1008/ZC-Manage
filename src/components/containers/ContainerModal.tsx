import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Space,
  Button,
} from "antd";
import { Container, DictType, DictCond, Supplier, Yard, Buyer } from "@/types";

interface Props {
  id: number | null;
  containers: Container[];
  dictTypes: DictType[];
  dictConds: DictCond[];
  suppliers: Supplier[];
  yards: Yard[];
  buyers: Buyer[];
  onSave: (id: number | null, data: Partial<Container>) => void;
  onClose: () => void;
}

export const ContainerModal = ({
  id,
  containers,
  dictTypes,
  dictConds,
  suppliers,
  yards,
  buyers,
  onSave,
  onClose,
}: Props) => {
  const [form] = Form.useForm();
  const editing = id ? containers.find((c) => c.id === id) : null;

  const handleOk = () => {
    return form.validateFields().then((values) => {
      onSave(id, {
        ...editing,
        ...values,
        buyer: values.buyer || "-",
        pickupOrder: values.pickupOrder || "-",
        project: values.project || "-",
        projectNo: values.projectNo || "-",
        remark: values.remark || "-",
      } as Container);
    });
  };

  return (
    <Modal
      title={editing ? `编辑集装箱 - ${editing.no}` : "新增集装箱"}
      open
      onOk={handleOk}
      onCancel={onClose}
      width={760}
      destroyOnClose
      footer={
        <Space>
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" onClick={handleOk}>
            保存
          </Button>
        </Space>
      }
    >
      <div className="py-2">
        <div className="text-xs font-bold text-[#198348] pb-1 mb-3 border-b border-dashed border-gray-200">
          基础信息
        </div>
        <Form
          form={form}
          layout="vertical"
          initialValues={
            editing || {
              usage: "买箱",
              cond: "适货箱",
              type: "40HC",
              status: "国内堆存",
              buyer: "-",
              pickupOrder: "-",
              project: "-",
              projectNo: "-",
              remark: "-",
            }
          }
        >
          <div className="grid grid-cols-2 gap-x-4">
            <Form.Item
              name="containerNo"
              label={
                <span className="text-xs">
                  箱号 <span className="text-red-500">*</span>
                </span>
              }
              rules={[{ required: true, message: "请输入箱号" }]}
            >
              <Input placeholder="如：UETU5115323" />
            </Form.Item>
            <Form.Item
              name="containerType"
              label={
                <span className="text-xs">
                  箱型 <span className="text-red-500">*</span>
                </span>
              }
              rules={[{ required: true }]}
            >
              <Select
                options={dictTypes.map((t) => ({
                  label: t.code,
                  value: t.code,
                }))}
              />
            </Form.Item>
            <Form.Item
              name="usage"
              label={
                <span className="text-xs">
                  使用情况 <span className="text-red-500">*</span>
                </span>
              }
            >
              <Select
                options={[
                  { label: "买箱", value: "买箱" },
                  { label: "租箱", value: "租箱" },
                ]}
              />
            </Form.Item>
            <Form.Item
              name="cond"
              label={
                <span className="text-xs">
                  箱况 <span className="text-red-500">*</span>
                </span>
              }
            >
              <Select
                options={dictConds.map((d) => ({
                  label: d.code,
                  value: d.code,
                }))}
              />
            </Form.Item>
            <Form.Item
              name="supplier"
              label={<span className="text-xs">卖方/出租方</span>}
            >
              <Select
                allowClear
                placeholder="请选择"
                options={suppliers.map((s) => ({
                  label: s.name,
                  value: s.name,
                }))}
              />
            </Form.Item>
            <Form.Item
              name="cost"
              label={<span className="text-xs">成本 (USD)</span>}
            >
              <InputNumber
                min={0}
                placeholder="如：1880"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </div>

          <div className="text-xs font-bold text-[#198348] py-2 border-b border-dashed border-gray-200 mt-2">
            提箱信息
          </div>
          <div className="grid grid-cols-2 gap-x-4">
            <Form.Item
              name="PickupYard"
              label={<span className="text-xs">提箱堆场</span>}
            >
              <Select
                allowClear
                placeholder="请选择"
                options={yards.map((y) => ({ label: y.name, value: y.name }))}
              />
            </Form.Item>
            <Form.Item
              name="pickupDate"
              label={<span className="text-xs">提箱时间</span>}
            >
              <Input type="date" />
            </Form.Item>
            <Form.Item
              name="pickupOrder"
              label={<span className="text-xs">提箱令编号</span>}
            >
              <Input placeholder="如：S225142" />
            </Form.Item>
            <Form.Item
              name="project"
              label={<span className="text-xs">当前项目</span>}
            >
              <Input placeholder="如：吉速166/167" />
            </Form.Item>
            <Form.Item
              name="projectNo"
              label={<span className="text-xs">项目编号</span>}
              className="col-span-1"
            >
              <Input placeholder="如：ZCL0082026022" />
            </Form.Item>
          </div>

          <div className="text-xs font-bold text-[#198348] py-2 border-b border-dashed border-gray-200 mt-2">
            状态信息
          </div>
          <div className="grid grid-cols-2 gap-x-4">
            <Form.Item
              name="status"
              label={<span className="text-xs">当前状态</span>}
            >
              <Select
                options={[
                  "国内堆存",
                  "去程在途",
                  "国外堆存",
                  "卖出",
                  "回程在途",
                  "已还箱",
                ].map((s) => ({ label: s, value: s }))}
              />
            </Form.Item>
            <Form.Item
              name="buyer"
              label={<span className="text-xs">买方/租方</span>}
            >
              <Select
                allowClear
                placeholder="-"
                options={buyers.map((b) => ({ label: b.name, value: b.name }))}
              />
            </Form.Item>
            <Form.Item
              name="remark"
              label={<span className="text-xs">状态备注</span>}
              className="col-span-2"
            >
              <Input.TextArea placeholder="如：Vladivostok 港口中转" rows={2} />
            </Form.Item>
          </div>
        </Form>
      </div>
    </Modal>
  );
};
