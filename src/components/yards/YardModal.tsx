import React, { useState, useEffect, useRef } from "react";
import { Modal, Form, Input, Select, message } from "antd";
import { getSuppliersList } from "@/restApi/supplyer";
import { addYard, editYard, getYardDetail } from "@/restApi/yard";

interface Props {
  id: string | null;
  onSave: () => void;
  onClose: () => void;
}

const YardModal: React.FC<Props> = ({ id, onSave, onClose }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]); // { label, value, id, name }
  const supplierMapRef = useRef<Map<string, string>>(new Map()); // id → name

  useEffect(() => {
    getSuppliersList(1, 1000).then((r) => {
      const opts = (r.entity?.data ?? []).map((s: any) => {
        supplierMapRef.current.set(s.id, s.name);
        return { label: s.name, value: s.id, id: s.id, name: s.name };
      });
      setSuppliers(opts);
    });
  }, []);

  // 编辑时回填详情
  useEffect(() => {
    if (!id) return;
    getYardDetail(id).then((res: any) => {
      const d = res?.entity?.data ?? res?.entity ?? {};
      form.setFieldsValue({
        ...d,
        supplierName: d.supplierId ?? d.supplierName,
      });
    });
  }, [id]);

  const handleOk = async () => {
    try {
      const vals = await form.validateFields();
      setLoading(true);
      const payload: any = { ...vals };
      // 供应商：Select value=id，需补 supplierId 和 supplierName
      if (vals.supplierName) {
        payload.supplierId = vals.supplierName;
        payload.supplierName =
          supplierMapRef.current.get(vals.supplierName) ?? vals.supplierName;
      }
      if (id) {
        await editYard({ ...payload, id });
        message.success("堆场已更新");
      } else {
        await addYard(payload);
        message.success("堆场已添加");
      }
      onSave();
    } catch {
      message.error("保存失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open
      title={id ? "编辑堆场" : "新增堆场"}
      onCancel={onClose}
      onOk={handleOk}
      destroyOnClose
      width={680}
      okText="保存"
      cancelText="取消"
      confirmLoading={loading}
    >
      <Form
        form={form}
        layout="vertical"
        className="mt-2"
        initialValues={{
          workingTime: "8:00-17:30",
        }}
      >
        <div className="grid grid-cols-2 gap-x-4">
          <Form.Item
            label="堆场名称"
            name="yardName"
            rules={[{ required: true, message: "请输入堆场名称" }]}
          >
            <Input placeholder="如：宁波陆联堆场" />
          </Form.Item>
          <Form.Item label="区域" name="region">
            <Select
              placeholder="请选择区域"
              options={[
                { label: "国内", value: "国内" },
                { label: "国外", value: "国外" },
              ]}
            />
          </Form.Item>
          <Form.Item label="所在城市" name="city">
            <Input placeholder="如：宁波 / Vladivostok" />
          </Form.Item>
          <Form.Item label="堆场地址" name="address">
            <Input placeholder="详细地址" />
          </Form.Item>
          <Form.Item label="作业时间" name="workingTime">
            <Input placeholder="如：8:00-17:30" />
          </Form.Item>
          <Form.Item label="对接人" name="contactName">
            <Input placeholder="联系人姓名" />
          </Form.Item>
          <Form.Item label="联系电话" name="contactPhone">
            <Input placeholder="电话" />
          </Form.Item>
          <Form.Item label="箱管电话" name="boxMgrPhone">
            <Input placeholder="箱管联系电话" />
          </Form.Item>
        </div>

        <div className="border-t border-dashed border-gray-200 pt-3 mt-1">
          <div className="text-xs font-bold text-[#198348] mb-2">
            关联供应商（系统内付款对象）
          </div>
          <Form.Item
            label="关联供应商"
            name="supplierName"
            rules={[
              { required: false, message: "请选择关联供应商（付款流程需要）" },
            ]}
          >
            <Select
              showSearch
              placeholder="请选择供应商（付款对象）"
              filterOption={(i, o) =>
                ((o?.label as string) || "")
                  .toLowerCase()
                  .includes(i.toLowerCase())
              }
              options={suppliers}
            />
          </Form.Item>
        </div>

        <Form.Item label="备注" name="remark">
          <Input.TextArea rows={2} placeholder="备注信息" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default YardModal;
