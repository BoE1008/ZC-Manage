import { Modal, Form, Select, Input, DatePicker, Space, Button } from 'antd';
import { Shipment, Container } from '@/types';

interface Props {
  id: number | null;
  containers: Container[];
  shipments: Shipment[];
  onSave: (id: number | null, data: Partial<Shipment>) => void;
  onClose: () => void;
}

const PROJECT_OPTIONS = ['吉速166/167', '吉速168', '海铁联运7月'];

export const ShipmentModal = ({ id, containers, shipments, onSave, onClose }: Props) => {
  const [form] = Form.useForm();
  const editing = id ? shipments.find((s) => s.id === id) : null;

  const handleOk = () => {
    return form.validateFields().then((values) => {
      onSave(id, {
        ...editing,
        ...values,
        projectNo: values.projectNo || '-',
        port: values.port || '-',
        from: values.from || '-',
        to: values.to || '-',
        pickupDate: values.pickupDate || '-',
        pickupOrder: values.pickupOrder || '-',
        atd: values.atd || '-',
        eta: values.eta || '-',
        ata: values.ata || '-',
        remark: values.remark || '-',
        returnDate: values.returnDate || '-',
        returnOrder: values.returnOrder || '-',
      } as Shipment);
    });
  };

  return (
    <Modal
      title={editing ? `编辑运踪 - ${editing.boxNo}` : '新增运踪'}
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
          集装箱与项目
        </div>
        <Form
          form={form}
          layout="vertical"
          initialValues={
            editing || {
              status: '去程在途',
              port: '-',
              projectNo: '-',
              from: '-',
              to: '-',
              pickupDate: undefined,
              pickupOrder: '-',
              atd: undefined,
              eta: undefined,
              ata: undefined,
              remark: '-',
              returnDate: undefined,
              returnOrder: '-',
            }
          }
        >
          <div className="grid grid-cols-2 gap-x-4">
            <Form.Item
              name="boxNo"
              label={
                <span className="text-xs">
                  箱号 <span className="text-red-500">*</span>
                </span>
              }
              rules={[{ required: true }]}
            >
              <Select
                showSearch
                filterOption={(i, o) =>
                  ((o?.label as string) || '').toLowerCase().includes(i.toLowerCase())
                }
                options={containers.map((c) => ({
                  label: `${c.no} (${c.status})`,
                  value: c.no,
                }))}
              />
            </Form.Item>
            <Form.Item
              name="project"
              label={
                <span className="text-xs">
                  项目名称 <span className="text-red-500">*</span>
                </span>
              }
              rules={[{ required: true }]}
            >
              <Select options={PROJECT_OPTIONS.map((p) => ({ label: p, value: p }))} />
            </Form.Item>
            <Form.Item name="projectNo" label={<span className="text-xs">项目编号</span>}>
              <Input />
            </Form.Item>
            <Form.Item name="port" label={<span className="text-xs">口岸</span>}>
              <Input placeholder="如：海参崴" />
            </Form.Item>
          </div>

          <div className="text-xs font-bold text-[#198348] py-2 border-b border-dashed border-gray-200 mt-2">
            发运信息
          </div>
          <div className="grid grid-cols-2 gap-x-4">
            <Form.Item name="from" label={<span className="text-xs">发运站</span>}>
              <Input placeholder="如：宁波" />
            </Form.Item>
            <Form.Item name="to" label={<span className="text-xs">目的站</span>}>
              <Input placeholder="如：若季诺" />
            </Form.Item>
            <Form.Item name="pickupDate" label={<span className="text-xs">提箱时间</span>}>
              <Input type="date" />
            </Form.Item>
            <Form.Item name="pickupOrder" label={<span className="text-xs">提箱令</span>}>
              <Input />
            </Form.Item>
            <Form.Item name="atd" label={<span className="text-xs">发运时间 (ATD)</span>}>
              <Input type="date" />
            </Form.Item>
            <Form.Item name="eta" label={<span className="text-xs">预计到达 (ETA)</span>}>
              <Input type="date" />
            </Form.Item>
            <Form.Item name="ata" label={<span className="text-xs">实际到达</span>}>
              <Input type="date" />
            </Form.Item>
          </div>

          <div className="text-xs font-bold text-[#198348] py-2 border-b border-dashed border-gray-200 mt-2">
            状态与还箱
          </div>
          <div className="grid grid-cols-2 gap-x-4">
            <Form.Item name="status" label={<span className="text-xs">状态</span>}>
              <Select
                options={['去程在途', '国外堆存', '回程在途', '国内堆存', '已还箱'].map((s) => ({
                  label: s,
                  value: s,
                }))}
              />
            </Form.Item>
            <Form.Item name="remark" label={<span className="text-xs">状态备注</span>}>
              <Input placeholder="如：MYC堆场" />
            </Form.Item>
            <Form.Item name="returnDate" label={<span className="text-xs">还箱时间</span>}>
              <Input type="date" />
            </Form.Item>
            <Form.Item name="returnOrder" label={<span className="text-xs">还箱令</span>}>
              <Input />
            </Form.Item>
          </div>
        </Form>
      </div>
    </Modal>
  );
}
