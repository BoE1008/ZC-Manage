import { useState, useEffect } from 'react';
import Table from "@/components/ResizeTable";
import { Button, Space, Input, Modal, Form, message, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  addSupplier, editSupplier, deleteSupplier,
} from '@/restApi/supplier';
import { getSuppliersList } from '@/restApi/supplyer';
import {
  getContainerBuyerList, addContainerBuyer, editContainerBuyer, deleteContainerBuyer,
} from '@/restApi/containerBuyer';
import {
  getYardList, addYard, editYard, deleteYard,
} from '@/restApi/yard';
import {
  getDictById, addDict, updateDict, deleteDict,
  addDictData, updateDictData, deleteDictData, getDictDetail,
} from '@/restApi/dict';

// ===== SupplierList =====
export const SupplierList = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [editId, setEditId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);

  const load = () => {
    setLoading(true);
    // getSuppliersList 返回响应体本身，列表在 .entity.data（与弹框一致）
    getSuppliersList(page, pageSize).then(r => {
      setData(r.entity?.data ?? []);
      setTotal(r.entity?.total ?? (r.entity?.data ?? []).length);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, pageSize]);

  const handleSave = async () => {
    const vals = await form.validateFields();
    try {
      if (editId) {
        await editSupplier({ ...vals, id: editId });
        message.success('供应商已更新');
      } else {
        await addSupplier(vals);
        message.success('供应商已添加');
      }
      setOpen(false);
      load();
    } catch { message.error('保存失败'); }
  };

  const columns: ColumnsType<any> = [
    { title: '名称', dataIndex: 'name', width: 160 },
    { title: '联系人', dataIndex: 'contactsName', width: 100 },
    { title: '联系电话', dataIndex: 'contactsMobile', width: 120 },
    { title: '城市', dataIndex: 'city', width: 100 },
    { title: '地址', dataIndex: 'address', width: 200, ellipsis: true },
    { title: '备注', dataIndex: 'remark', width: 150, ellipsis: true },
    {
      title: '操作', width: 100,
      render: (_, r) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => { setEditId(r.id); form.setFieldsValue(r); setOpen(true); }}>编辑</Button>
          <Button type="link" size="small" danger onClick={() => {
            Modal.confirm({ title: '确认删除', content: '确定删除吗？', okText: '删除', okButtonProps: { className: '!bg-[#198348] !border-[#198348]' }, cancelText: '取消',
              onOk: async () => { await deleteSupplier(r.id); message.warning('供应商已删除'); load(); } });
          }}>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <span className="font-bold text-gray-800 flex items-center">
          <div className="w-1 h-4 bg-[#198348] rounded mr-2" />供应商管理
        </span>
        <Button type="primary" size="small" onClick={() => { setEditId(null); form.resetFields(); setOpen(true); }}>+ 新增供应商</Button>
      </div>
      <Table
        columns={columns} dataSource={data} loading={loading} rowKey="id"
        pagination={{ current: page, pageSize, total, onChange: (p, ps) => { setPage(p); if (ps) setPageSize(ps); }, showSizeChanger: true, showTotal: (t) => `共 ${t} 条` }}
        size="small" scroll={{ x: 900 }}
      />
      <Modal open={open} title="供应商" onCancel={() => setOpen(false)} onOk={handleSave} destroyOnClose>
        <Form form={form} layout="vertical">
          <Form.Item label="名称" name="name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="联系人" name="contactsName"><Input /></Form.Item>
          <Form.Item label="联系电话" name="contactsMobile"><Input /></Form.Item>
          <Form.Item label="城市" name="city"><Input /></Form.Item>
          <Form.Item label="地址" name="address"><Input /></Form.Item>
          <Form.Item label="备注" name="remark"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// ===== BuyerList =====
export const BuyerList = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [editId, setEditId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);

  const load = () => {
    setLoading(true);
    getContainerBuyerList({ current: page, size: pageSize }).then(r => {
      setData(r.entity?.data ?? []);
      setTotal(r.entity?.total ?? 0);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, pageSize]);

  const handleSave = async () => {
    const vals = await form.validateFields();
    try {
      if (editId) {
        await editContainerBuyer({ ...vals, id: editId });
        message.success('买方已更新');
      } else {
        await addContainerBuyer(vals);
        message.success('买方已添加');
      }
      setOpen(false);
      load();
    } catch { message.error('保存失败'); }
  };

  const columns: ColumnsType<any> = [
    { title: '名称', dataIndex: 'name', width: 160 },
    { title: '类型', dataIndex: 'type', width: 80,
      render: (v: string) => v === '买方' ? <span className="text-green-600">买方</span> : <span className="text-blue-600">租方</span> },
    { title: '联系人', dataIndex: 'contactsName', width: 100 },
    { title: '联系电话', dataIndex: 'contactsMobile', width: 120 },
    { title: '城市', dataIndex: 'city', width: 100 },
    { title: '地址', dataIndex: 'address', width: 200, ellipsis: true },
    { title: '备注', dataIndex: 'remark', width: 150, ellipsis: true },
    {
      title: '操作', width: 100,
      render: (_, r) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => { setEditId(r.id); form.setFieldsValue(r); setOpen(true); }}>编辑</Button>
          <Button type="link" size="small" danger onClick={() => {
            Modal.confirm({ title: '确认删除', content: '确定删除吗？', okText: '删除', okButtonProps: { className: '!bg-[#198348] !border-[#198348]' }, cancelText: '取消',
              onOk: async () => { await deleteContainerBuyer(r.id); message.warning('买方已删除'); load(); } });
          }}>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <span className="font-bold text-gray-800 flex items-center">
          <div className="w-1 h-4 bg-[#198348] rounded mr-2" />买方/租方管理
        </span>
        <Button type="primary" size="small" onClick={() => { setEditId(null); form.resetFields(); setOpen(true); }}>+ 新增</Button>
      </div>
      <Table
        columns={columns} dataSource={data} loading={loading} rowKey="id"
        pagination={{ current: page, pageSize, total, onChange: (p, ps) => { setPage(p); if (ps) setPageSize(ps); }, showSizeChanger: true, showTotal: (t) => `共 ${t} 条` }}
        size="small" scroll={{ x: 1000 }}
      />
      <Modal open={open} title="买方/租方" onCancel={() => setOpen(false)} onOk={handleSave} destroyOnClose>
        <Form form={form} layout="vertical">
          <Form.Item label="名称" name="name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="类型" name="type" rules={[{ required: true }]}>
            <Select options={[{ label: '买方', value: '买方' }, { label: '租方', value: '租方' }]} />
          </Form.Item>
          <Form.Item label="联系人" name="contactsName"><Input /></Form.Item>
          <Form.Item label="联系电话" name="contactsMobile"><Input /></Form.Item>
          <Form.Item label="城市" name="city"><Input /></Form.Item>
          <Form.Item label="地址" name="address"><Input /></Form.Item>
          <Form.Item label="备注" name="remark"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// ===== YardList =====
export const YardList = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [editId, setEditId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);

  const load = () => {
    setLoading(true);
    getYardList({ pageNo: page, pageSize }).then(r => {
      setData(r.entity?.data ?? []);
      setTotal(r.entity?.total ?? 0);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, pageSize]);

  const handleSave = async () => {
    const vals = await form.validateFields();
    try {
      if (editId) {
        await editYard({ ...vals, id: editId });
        message.success('堆场已更新');
      } else {
        await addYard(vals);
        message.success('堆场已添加');
      }
      setOpen(false);
      load();
    } catch { message.error('保存失败'); }
  };

  const columns: ColumnsType<any> = [
    { title: '名称', dataIndex: 'name', width: 160 },
    { title: '城市', dataIndex: 'city', width: 100 },
    { title: '联系人', dataIndex: 'contactsName', width: 100 },
    { title: '联系电话', dataIndex: 'contactsMobile', width: 120 },
    { title: '地址', dataIndex: 'address', width: 200, ellipsis: true },
    { title: '备注', dataIndex: 'remark', width: 150, ellipsis: true },
    {
      title: '操作', width: 100,
      render: (_, r) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => { setEditId(r.id); form.setFieldsValue(r); setOpen(true); }}>编辑</Button>
          <Button type="link" size="small" danger onClick={() => {
            Modal.confirm({ title: '确认删除', content: '确定删除吗？', okText: '删除', okButtonProps: { className: '!bg-[#198348] !border-[#198348]' }, cancelText: '取消',
              onOk: async () => { await deleteYard(r.id); message.warning('堆场已删除'); load(); } });
          }}>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <span className="font-bold text-gray-800 flex items-center">
          <div className="w-1 h-4 bg-[#198348] rounded mr-2" />堆场管理
        </span>
        <Button type="primary" size="small" onClick={() => { setEditId(null); form.resetFields(); setOpen(true); }}>+ 新增堆场</Button>
      </div>
      <Table
        columns={columns} dataSource={data} loading={loading} rowKey="id"
        pagination={{ current: page, pageSize, total, onChange: (p, ps) => { setPage(p); if (ps) setPageSize(ps); }, showSizeChanger: true, showTotal: (t) => `共 ${t} 条` }}
        size="small" scroll={{ x: 950 }}
      />
      <Modal open={open} title="堆场" onCancel={() => setOpen(false)} onOk={handleSave} destroyOnClose>
        <Form form={form} layout="vertical">
          <Form.Item label="名称" name="name" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="城市" name="city"><Input /></Form.Item>
          <Form.Item label="联系人" name="contactsName"><Input /></Form.Item>
          <Form.Item label="联系电话" name="contactsMobile"><Input /></Form.Item>
          <Form.Item label="地址" name="address"><Input /></Form.Item>
          <Form.Item label="备注" name="remark"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// ===== DictPage =====
export const DictPage = () => {
  const [dictTree, setDictTree] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<any>(null);
  const [dictData, setDictData] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [typeModalOpen, setTypeModalOpen] = useState(false);
  const [dataModalOpen, setDataModalOpen] = useState(false);
  const [editTypeId, setEditTypeId] = useState<string | null>(null);
  const [editDataId, setEditDataId] = useState<string | null>(null);
  const [typeForm] = Form.useForm();
  const [dataForm] = Form.useForm();

  const loadTree = () => {
    getDictById().then(r => {
      setDictTree(r.entity ?? []);
    });
  };

  useEffect(() => { loadTree(); }, []);

  const loadData = (dictTypeId: string) => {
    setDataLoading(true);
    getDictDetail(dictTypeId, page, pageSize).then(r => {
      setDictData(r.entity?.data ?? []);
      setTotal(r.entity?.total ?? 0);
    }).finally(() => setDataLoading(false));
  };

  useEffect(() => {
    if (selectedType) loadData(selectedType.dictId);
  }, [selectedType, page, pageSize]);

  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <span className="font-bold text-gray-800 flex items-center">
          <div className="w-1 h-4 bg-[#198348] rounded mr-2" />字典管理
        </span>
        <Button type="primary" size="small" onClick={() => { setEditTypeId(null); typeForm.resetFields(); setTypeModalOpen(true); }}>+ 新增字典类型</Button>
      </div>
      <div className="bg-white rounded p-4 shadow-sm">
        <div className="flex gap-4">
          <div className="w-64 border-r pr-4">
            <div className="text-xs font-medium text-gray-500 mb-2">字典类型</div>
            <div className="space-y-1">
              {dictTree.map(t => (
                <div key={t.dictId} onClick={() => setSelectedType(t)} className={`px-2 py-1 rounded cursor-pointer text-sm ${selectedType?.dictId === t.dictId ? 'bg-[#198348]/10 text-[#198348] font-medium' : 'hover:bg-gray-50'}`}>
                  {t.dictName}
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1">
            {selectedType ? (
              <>
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500">{selectedType.dictName} — 字典数据</span>
                  <Button type="primary" size="small" onClick={() => { setEditDataId(null); dataForm.resetFields(); setDataModalOpen(true); }}>+ 新增数据项</Button>
                </div>
                <Table
                  columns={[
                    { title: '数据值', dataIndex: 'itemValue', width: 120 },
                    { title: '标签', dataIndex: 'itemText', width: 160 },
                    { title: '排序', dataIndex: 'sortOrder', width: 60 },
                    { title: '备注', dataIndex: 'remark', ellipsis: true },
                    {
                      title: '操作', width: 100,
                      render: (_, r: any) => (
                        <Space size="small">
                          <Button type="link" size="small" onClick={() => { setEditDataId(r.itemId); dataForm.setFieldsValue(r); setDataModalOpen(true); }}>编辑</Button>
                          <Button type="link" size="small" danger onClick={() => {
                            Modal.confirm({ title: '确认删除', content: '确定删除吗？', okText: '删除', okButtonProps: { className: '!bg-[#198348] !border-[#198348]' }, cancelText: '取消',
                              onOk: async () => { await deleteDictData(r.itemId); message.warning('已删除'); loadData(selectedType.dictId); } });
                          }}>删除</Button>
                        </Space>
                      ),
                    },
                  ]}
                  dataSource={dictData} loading={dataLoading} rowKey="itemId"
                  pagination={{ current: page, pageSize, total, onChange: (p, ps) => { setPage(p); if (ps) setPageSize(ps); }, showSizeChanger: true, showTotal: (t) => `共 ${t} 条` }}
                  size="small"
                />
              </>
            ) : (
              <div className="text-center text-gray-400 py-10">← 请选择左侧字典类型</div>
            )}
          </div>
        </div>
      </div>

      {/* 字典类型 Modal */}
      <Modal open={typeModalOpen} title="字典类型" onCancel={() => setTypeModalOpen(false)} onOk={async () => {
        const vals = await typeForm.validateFields();
        try {
          if (editTypeId) { await updateDict(editTypeId, vals); message.success('已更新'); }
          else { await addDict(vals); message.success('已添加'); }
          setTypeModalOpen(false);
          loadTree();
        } catch { message.error('保存失败'); }
      }} destroyOnClose>
        <Form form={typeForm} layout="vertical">
          <Form.Item label="字典名称" name="dictName" rules={[{ required: true }]}><Input /></Form.Item>
        </Form>
      </Modal>

      {/* 字典数据 Modal */}
      <Modal open={dataModalOpen} title="字典数据项" onCancel={() => setDataModalOpen(false)} onOk={async () => {
        const vals = await dataForm.validateFields();
        try {
          if (editDataId) { await updateDictData(editDataId, { ...vals, dictTypeId: selectedType?.dictId }); message.success('已更新'); }
          else { await addDictData({ ...vals, dictTypeId: selectedType?.dictId }); message.success('已添加'); }
          setDataModalOpen(false);
          loadData(selectedType?.dictId);
        } catch { message.error('保存失败'); }
      }} destroyOnClose>
        <Form form={dataForm} layout="vertical">
          <Form.Item label="数据值" name="itemValue" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="标签" name="itemText" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="排序" name="sortOrder"><Input type="number" /></Form.Item>
          <Form.Item label="备注" name="remark"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
