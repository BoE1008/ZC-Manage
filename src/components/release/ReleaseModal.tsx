import { Modal, Form, Select, Input, InputNumber, DatePicker, Space, Button } from 'antd';
import { Release, Container, Buyer } from '@/types';

interface Props {
  id: number | null;
  containers: Container[];
  buyers: Buyer[];
  releases: Release[];
  onSave: (id: number | null, data: Partial<Release>) => void;
  onClose: () => void;
}

export const ReleaseModal = ({ id, containers, buyers, releases, onSave, onClose }: Props) => {
  const [form] = Form.useForm();
  const editing = id ? releases.find((r) => r.id === id) : null;

  const handleOk = () => {
    return form.validateFields().then((values) => {
      const boxNo = values.boxNo.split(' ')[0];
      onSave(id, {
        ...editing,
        ...values,
        boxNo,
        buyer: values.buyer || '-',
        yard: values.yard || '-',
        pickupDate: values.pickupDate || '-',
        income: values.income || 0,
      } as Release);
    });
  };

  return (
    <Modal
      title={editing ? `编辑放箱令 - ${editing.no}` : '生成放箱令'}
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
          放箱信息
        </div>
        <Form
          form={form}
          layout="vertical"
          initialValues={
            editing || {
              buyer: undefined,
              yard: undefined,
              income: undefined,
              pickupDate: undefined,
              type: '卖出放箱',
              boxNo: undefined,
            }
          }
        >
          <div className="grid grid-cols-2 gap-x-4">
            <Form.Item
              name="type"
              label={
                <span className="text-xs">
                  放箱类型 <span className="text-red-500">*</span>
                </span>
              }
              rules={[{ required: true }]}
            >
              <Select
                options={[
                  { label: '卖出放箱', value: '卖出放箱' },
                  { label: '回程放箱', value: '回程放箱' },
                  { label: '租给客户', value: '租给客户' },
                ]}
              />
            </Form.Item>
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
                options={containers
                  .filter((c) => c.status === '国外堆存' || c.status === '国内堆存')
                  .map((c) => ({
                    label: `${c.no} (${c.status})`,
                    value: `${c.no} (${c.status})`,
                  }))}
              />
            </Form.Item>
            <Form.Item name="buyer" label={<span className="text-xs">买方/租方</span>}>
              <Select
                allowClear
                placeholder="-"
                options={buyers.map((b) => ({ label: b.name, value: b.name }))}
              />
            </Form.Item>
            <Form.Item name="yard" label={<span className="text-xs">放箱堆场</span>}>
              <Select
                allowClear
                placeholder="请选择"
                options={[
                  { label: '宁波陆联堆场', value: '宁波陆联堆场' },
                  { label: '海参崴 MYC', value: '海参崴 MYC' },
                  { label: 'MINSK 堆场', value: 'MINSK 堆场' },
                  { label: '莫斯科堆场', value: '莫斯科堆场' },
                ]}
              />
            </Form.Item>
            <Form.Item name="income" label={<span className="text-xs">收入 (USD)</span>}>
              <InputNumber min={0} placeholder="卖出/出租收入" style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="pickupDate" label={<span className="text-xs">客户提箱时间</span>}>
              <Input type="date" />
            </Form.Item>
          </div>
        </Form>
      </div>
    </Modal>
  );
}
