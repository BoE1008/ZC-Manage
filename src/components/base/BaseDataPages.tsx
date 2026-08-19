import { useState, useMemo } from 'react';
import { Table, Button, Input, Select, Space, Modal, Form } from 'antd';
import { Supplier, Buyer, Yard } from '@/types';
import { SupplierTypeBadge, BuyerTypeBadge } from '@/components/ui/Badge';
import { message } from 'antd';
import { useStore } from '@/store';

// ==================== 卖方/出租方/堆场 ====================
export const SupplierList = () => {
  const { suppliers, setSuppliers } = useStore();
  const [typeFilter, setTypeFilter] = useState('');
  const [keyword, setKeyword] = useState('');
  const [editId, setEditId] = useState<number | null | undefined>(undefined);

  const filtered = useMemo(
    () =>
      suppliers.filter((s) => {
        if (typeFilter && s.type !== typeFilter) return false;
        if (keyword && !s.name.toLowerCase().includes(keyword.toLowerCase())) return false;
        return true;
      }),
    [suppliers, typeFilter, keyword]
  );

  const handleSave = (id: number | null, data: Partial<Supplier>) => {
    if (id) {
      setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
      message.success('已更新');
    } else {
      const newId = Math.max(0, ...suppliers.map((s) => s.id)) + 1;
      setSuppliers((prev) => [...prev, { ...data, id: newId } as Supplier]);
      message.success('已添加');
    }
    setEditId(undefined);
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      okText: '删除',
      okButtonProps: { className: '!bg-[#198348] !border-[#198348]' },
      cancelText: '取消',
      title: '确认删除',
      content: '确定删除此卖方/出租方/堆场吗？',
      onOk() {
        setSuppliers((prev) => prev.filter((s) => s.id !== id));
        message.warning('已删除');
      },
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button type="primary" size="small" onClick={() => setEditId(null)}>
          + 添加
        </Button>
        <div className="ml-auto flex gap-2">
          <Select
            size="small"
            className="w-28"
            placeholder="全部类型"
            allowClear
            value={typeFilter || undefined}
            onChange={(v) => setTypeFilter(v || '')}
            options={['卖方', '出租方', '堆场'].map((t) => ({
              label: t,
              value: t,
            }))}
          />
          <Input
            size="small"
            placeholder="名称"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="!w-36"
            allowClear
          />
        </div>
      </div>
      <div className="bg-white rounded shadow-sm overflow-hidden">
        <Table
          columns={[
            { title: '名称', dataIndex: 'name', ellipsis: true },
            {
              title: '类型',
              dataIndex: 'type',
              width: 80,
              render: (v) => <SupplierTypeBadge type={v} />,
            },
            { title: '城市', dataIndex: 'city', width: 90 },
            { title: '联系人', dataIndex: 'contact', width: 80 },
            { title: '电话', dataIndex: 'phone', width: 120 },
            { title: '税号', dataIndex: 'tax', width: 130 },
            { title: '备注', dataIndex: 'remark', ellipsis: true },
            {
              title: '操作',
              width: 80,
              align: 'center',
              render: (_, r) => (
                <Space size={1}>
                  <Button
                    type="text"
                    size="small"
                    className="!px-1 !py-0.5 !text-xs"
                    onClick={() => setEditId(r.id)}
                  >
                    ✎
                  </Button>
                  <Button
                    type="text"
                    size="small"
                    danger
                    className="!px-1 !py-0.5 !text-xs"
                    onClick={() => handleDelete(r.id)}
                  >
                    🗑
                  </Button>
                </Space>
              ),
            },
          ]}
          dataSource={filtered}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 20, showTotal: (t) => `共 ${t} 条` }}
        />
      </div>
      {editId !== undefined && (
        <SupplierModal
          id={editId ?? null}
          suppliers={suppliers}
          onSave={handleSave}
          onClose={() => setEditId(undefined)}
        />
      )}
    </div>
  );
}

const SupplierModal = ({
  id,
  suppliers,
  onSave,
  onClose,
}: {
  id: number | null;
  suppliers: Supplier[];
  onSave: (id: number | null, d: Partial<Supplier>) => void;
  onClose: () => void;
}) => {
  const [form] = Form.useForm();
  const editing = id ? suppliers.find((s) => s.id === id) : null;
  return (
    <Modal
      title={editing ? `编辑 - ${editing.name}` : '添加卖方/出租方/堆场'}
      open
      onCancel={onClose}
      width={560}
      destroyOnClose
      footer={
        <Space>
          <Button onClick={onClose}>取消</Button>
          <Button
            type="primary"
            onClick={() => form.validateFields().then((v) => onSave(id, v as Supplier))}
          >
            保存
          </Button>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={editing || { type: '卖方' }}
        className="mt-3"
      >
        <div className="grid grid-cols-2 gap-3">
          <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true }]}>
            <Select
              options={['卖方', '出租方', '堆场'].map((t) => ({
                label: t,
                value: t,
              }))}
            />
          </Form.Item>
          <Form.Item name="city" label="所在城市">
            <Input />
          </Form.Item>
          <Form.Item name="contact" label="联系人">
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="联系电话">
            <Input />
          </Form.Item>
          <Form.Item name="tax" label="税号">
            <Input />
          </Form.Item>
          <Form.Item name="remark" label="备注" className="col-span-2">
            <Input />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}

// ==================== 买方/租方 ====================
export const BuyerList = () => {
  const { buyers, setBuyers } = useStore();
  const [keyword, setKeyword] = useState('');
  const [editId, setEditId] = useState<number | null | undefined>(undefined);

  const filtered = useMemo(
    () => buyers.filter((b) => !keyword || b.name.toLowerCase().includes(keyword.toLowerCase())),
    [buyers, keyword]
  );

  const handleSave = (id: number | null, data: Partial<Buyer>) => {
    if (id) {
      setBuyers((prev) => prev.map((b) => (b.id === id ? { ...b, ...data } : b)));
      message.success('已更新');
    } else {
      const newId = Math.max(0, ...buyers.map((b) => b.id)) + 1;
      setBuyers((prev) => [...prev, { ...data, id: newId, count: 0 } as Buyer]);
      message.success('已添加');
    }
    setEditId(undefined);
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      okText: '删除',
      okButtonProps: { className: '!bg-[#198348] !border-[#198348]' },
      cancelText: '取消',
      title: '确认删除',
      content: '确定删除此买方/租方吗？',
      onOk() {
        setBuyers((prev) => prev.filter((b) => b.id !== id));
        message.warning('已删除');
      },
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button type="primary" size="small" onClick={() => setEditId(null)}>
          + 添加
        </Button>
        <div className="ml-auto">
          <Input
            size="small"
            placeholder="名称"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="!w-36"
            allowClear
          />
        </div>
      </div>
      <div className="bg-white rounded shadow-sm overflow-hidden">
        <Table
          columns={[
            { title: '名称', dataIndex: 'name', ellipsis: true },
            {
              title: '类型',
              dataIndex: 'type',
              width: 80,
              render: (v) => <BuyerTypeBadge type={v} />,
            },
            { title: '联系方式', dataIndex: 'contact', ellipsis: true },
            { title: '主要采购箱况', dataIndex: 'cond', width: 110 },
            {
              title: '历史交易',
              dataIndex: 'count',
              width: 90,
              align: 'center',
            },
            { title: '备注', dataIndex: 'remark', ellipsis: true },
            {
              title: '操作',
              width: 80,
              align: 'center',
              render: (_, r) => (
                <Space size={1}>
                  <Button
                    type="text"
                    size="small"
                    className="!px-1 !py-0.5 !text-xs"
                    onClick={() => setEditId(r.id)}
                  >
                    ✎
                  </Button>
                  <Button
                    type="text"
                    size="small"
                    danger
                    className="!px-1 !py-0.5 !text-xs"
                    onClick={() => handleDelete(r.id)}
                  >
                    🗑
                  </Button>
                </Space>
              ),
            },
          ]}
          dataSource={filtered}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 20, showTotal: (t) => `共 ${t} 条` }}
        />
      </div>
      {editId !== undefined && (
        <BuyerModal
          id={editId ?? null}
          buyers={buyers}
          onSave={handleSave}
          onClose={() => setEditId(undefined)}
        />
      )}
    </div>
  );
}

const BuyerModal = ({
  id,
  buyers,
  onSave,
  onClose,
}: {
  id: number | null;
  buyers: Buyer[];
  onSave: (id: number | null, d: Partial<Buyer>) => void;
  onClose: () => void;
}) => {
  const [form] = Form.useForm();
  const editing = id ? buyers.find((b) => b.id === id) : null;
  return (
    <Modal
      title={editing ? '编辑' : '添加'}
      open
      onCancel={onClose}
      width={560}
      destroyOnClose
      footer={
        <Space>
          <Button onClick={onClose}>取消</Button>
          <Button
            type="primary"
            onClick={() => form.validateFields().then((v) => onSave(id, v as Buyer))}
          >
            保存
          </Button>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={editing || { type: '买方' }}
        className="mt-3"
      >
        <div className="grid grid-cols-2 gap-3">
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label="类型">
            <Select options={['买方', '租方'].map((t) => ({ label: t, value: t }))} />
          </Form.Item>
          <Form.Item name="contact" label="联系方式">
            <Input />
          </Form.Item>
          <Form.Item name="cond" label="主要采购箱况">
            <Input placeholder="如：适货箱" />
          </Form.Item>
          <Form.Item name="remark" label="备注" className="col-span-2">
            <Input />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}

// ==================== 堆场 ====================
export const YardList = () => {
  const { yards, setYards } = useStore();
  const [keyword, setKeyword] = useState('');
  const [editId, setEditId] = useState<number | null | undefined>(undefined);

  const filtered = useMemo(
    () =>
      yards.filter(
        (y) =>
          !keyword ||
          y.name.toLowerCase().includes(keyword.toLowerCase()) ||
          y.city.toLowerCase().includes(keyword.toLowerCase())
      ),
    [yards, keyword]
  );

  const handleSave = (id: number | null, data: Partial<Yard>) => {
    if (id) {
      setYards((prev) => prev.map((y) => (y.id === id ? { ...y, ...data } : y)));
      message.success('已更新');
    } else {
      const newId = Math.max(0, ...yards.map((y) => y.id)) + 1;
      setYards((prev) => [...prev, { ...data, id: newId } as Yard]);
      message.success('已添加');
    }
    setEditId(undefined);
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      okText: '删除',
      okButtonProps: { className: '!bg-[#198348] !border-[#198348]' },
      cancelText: '取消',
      title: '确认删除',
      content: '确定删除此堆场吗？',
      onOk() {
        setYards((prev) => prev.filter((y) => y.id !== id));
        message.warning('已删除');
      },
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button type="primary" size="small" onClick={() => setEditId(null)}>
          + 添加堆场
        </Button>
        <div className="ml-auto">
          <Input
            size="small"
            placeholder="堆场名称 / 城市"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="!w-44"
            allowClear
          />
        </div>
      </div>
      <div className="bg-white rounded shadow-sm overflow-hidden">
        <Table
          columns={[
            { title: '堆场名称', dataIndex: 'name', ellipsis: true },
            { title: '城市', dataIndex: 'city', width: 100 },
            { title: '地址', dataIndex: 'addr', width: 110, ellipsis: true },
            { title: '堆存费率', dataIndex: 'storageRate', width: 100 },
            { title: '吊装费率', dataIndex: 'liftRate', width: 100 },
            { title: '对接人', dataIndex: 'contact', width: 80 },
            { title: '电话', dataIndex: 'phone', width: 110 },
            {
              title: '操作',
              width: 80,
              align: 'center',
              render: (_, r) => (
                <Space size={1}>
                  <Button
                    type="text"
                    size="small"
                    className="!px-1 !py-0.5 !text-xs"
                    onClick={() => setEditId(r.id)}
                  >
                    ✎
                  </Button>
                  <Button
                    type="text"
                    size="small"
                    danger
                    className="!px-1 !py-0.5 !text-xs"
                    onClick={() => handleDelete(r.id)}
                  >
                    🗑
                  </Button>
                </Space>
              ),
            },
          ]}
          dataSource={filtered}
          rowKey="id"
          size="small"
          pagination={{ pageSize: 20, showTotal: (t) => `共 ${t} 条` }}
        />
      </div>
      {editId !== undefined && (
        <YardModal
          id={editId ?? null}
          yards={yards}
          onSave={handleSave}
          onClose={() => setEditId(undefined)}
        />
      )}
    </div>
  );
}

const YardModal = ({
  id,
  yards,
  onSave,
  onClose,
}: {
  id: number | null;
  yards: Yard[];
  onSave: (id: number | null, d: Partial<Yard>) => void;
  onClose: () => void;
}) => {
  const [form] = Form.useForm();
  const editing = id ? yards.find((y) => y.id === id) : null;
  return (
    <Modal
      title={editing ? '编辑' : '添加堆场'}
      open
      onCancel={onClose}
      width={560}
      destroyOnClose
      footer={
        <Space>
          <Button onClick={onClose}>取消</Button>
          <Button
            type="primary"
            onClick={() => form.validateFields().then((v) => onSave(id, v as Yard))}
          >
            保存
          </Button>
        </Space>
      }
    >
      <Form form={form} layout="vertical" initialValues={editing || {}} className="mt-3">
        <div className="grid grid-cols-2 gap-3">
          <Form.Item name="name" label="堆场名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="city" label="所在城市">
            <Input />
          </Form.Item>
          <Form.Item name="addr" label="地址">
            <Input />
          </Form.Item>
          <Form.Item name="storageRate" label="堆存费率">
            <Input placeholder="如：USD 2/天" />
          </Form.Item>
          <Form.Item name="liftRate" label="吊装费率">
            <Input placeholder="如：USD 30" />
          </Form.Item>
          <Form.Item name="contact" label="对接人">
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="电话">
            <Input />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  );
}

// ==================== 字典 ====================
import { dictTypes as dt, dictConds as dc } from '@/data/mockData';

const STATUS_DATA = [
  {
    status: '国内堆存',
    color: '灰色',
    desc: '集装箱在国内堆场存放',
    flow: '→ 去程在途',
  },
  {
    status: '去程在途',
    color: '蓝色',
    desc: '集装箱正在发往国外途中',
    flow: '→ 国外堆存',
  },
  {
    status: '国外堆存',
    color: '橙色',
    desc: '集装箱已到达国外堆场',
    flow: '→ 卖出 / 回程在途',
  },
  { status: '卖出', color: '绿色', desc: '买箱已卖出，业务结束', flow: '终态' },
  {
    status: '回程在途',
    color: '紫色',
    desc: '集装箱正在回国内途中',
    flow: '→ 国内堆存',
  },
  {
    status: '已还箱',
    color: '深灰',
    desc: '长租箱已归还至指定堆场',
    flow: '终态',
  },
];

const COND_COLORS: Record<string, string> = {
  新箱: 'bg-green-100 text-green-700',
  次新箱: 'bg-yellow-100 text-yellow-700',
  适货箱: 'bg-blue-100 text-blue-700',
};

const STATUS_COLORS: Record<string, string> = {
  国内堆存: 'bg-gray-100 text-gray-600',
  去程在途: 'bg-blue-100 text-blue-700',
  国外堆存: 'bg-yellow-100 text-yellow-700',
  卖出: 'bg-green-100 text-green-700',
  回程在途: 'bg-purple-100 text-purple-700',
  已还箱: 'bg-gray-200 text-gray-700',
};

export const DictPage = () => {
  const [tList, setTList] = useState(dt);
  const [cList, setCList] = useState(dc);

  const handleDeleteType = (code: string) => {
    Modal.confirm({
      okText: '删除',
      okButtonProps: { className: '!bg-[#198348] !border-[#198348]' },
      cancelText: '取消',
      title: '确认删除',
      content: `确定删除箱型 ${code} 吗？`,
      onOk() {
        setTList((prev) => prev.filter((t) => t.code !== code));
      },
    });
  };
  const handleDeleteCond = (code: string) => {
    Modal.confirm({
      okText: '删除',
      okButtonProps: { className: '!bg-[#198348] !border-[#198348]' },
      cancelText: '取消',
      title: '确认删除',
      content: `确定删除箱况 ${code} 吗？`,
      onOk() {
        setCList((prev) => prev.filter((c) => c.code !== code));
      },
    });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {/* 箱型字典 */}
        <div className="bg-white rounded shadow-sm p-4">
          <div className="flex items-center text-sm font-bold mb-3 text-gray-800">
            <div className="w-1 h-4 bg-[#198348] rounded mr-2 flex-shrink-0" />
            箱型字典
            <span className="ml-auto text-xs text-[#198348] cursor-pointer hover:underline">
              + 添加
            </span>
          </div>
          <Table
            columns={[
              { title: '箱型代码', dataIndex: 'code', width: 90 },
              { title: '描述', dataIndex: 'desc', ellipsis: true },
              {
                title: '操作',
                width: 70,
                align: 'center',
                render: (_, r) => (
                  <Button
                    type="text"
                    size="small"
                    danger
                    className="!px-1 !py-0.5 !text-xs"
                    onClick={() => handleDeleteType(r.code)}
                  >
                    🗑
                  </Button>
                ),
              },
            ]}
            dataSource={tList}
            rowKey="code"
            size="small"
            pagination={false}
          />
        </div>

        {/* 箱况字典 */}
        <div className="bg-white rounded shadow-sm p-4">
          <div className="flex items-center text-sm font-bold mb-3 text-gray-800">
            <div className="w-1 h-4 bg-[#198348] rounded mr-2 flex-shrink-0" />
            箱况字典
            <span className="ml-auto text-xs text-[#198348] cursor-pointer hover:underline">
              + 添加
            </span>
          </div>
          <Table
            columns={[
              {
                title: '箱况',
                dataIndex: 'code',
                width: 80,
                render: (v) => (
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded text-xs ${COND_COLORS[v] || ''}`}
                  >
                    {v}
                  </span>
                ),
              },
              { title: '说明', dataIndex: 'desc', ellipsis: true },
              {
                title: '操作',
                width: 70,
                align: 'center',
                render: (_, r) => (
                  <Button
                    type="text"
                    size="small"
                    danger
                    className="!px-1 !py-0.5 !text-xs"
                    onClick={() => handleDeleteCond(r.code)}
                  >
                    🗑
                  </Button>
                ),
              },
            ]}
            dataSource={cList}
            rowKey="code"
            size="small"
            pagination={false}
          />
        </div>
      </div>

      {/* 状态字典 */}
      <div className="bg-white rounded shadow-sm p-4">
        <div className="flex items-center text-sm font-bold mb-3 text-gray-800">
          <div className="w-1 h-4 bg-[#198348] rounded mr-2 flex-shrink-0" />
          集装箱状态字典
        </div>
        <Table
          columns={[
            {
              title: '状态名称',
              dataIndex: 'status',
              render: (v) => (
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[v] || ''}`}
                >
                  {v}
                </span>
              ),
            },
            { title: '颜色标识', dataIndex: 'color' },
            { title: '说明', dataIndex: 'desc' },
            { title: '流转方向', dataIndex: 'flow' },
          ]}
          dataSource={STATUS_DATA}
          rowKey="status"
          size="small"
          pagination={false}
        />
      </div>
    </div>
  );
}
