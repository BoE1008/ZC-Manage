import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Select,
  Input,
  Checkbox,
  DatePicker,
  message,
  Divider,
} from "antd";
import { getContainerList } from "@/restApi/container";
import { getYardList } from "@/restApi/yard";
import {
  addReturnOrder,
  editReturnOrder,
  getReturnOrderDetail,
} from "@/restApi/returnOrder";

interface Props {
  id: string | null;
  onSave: () => void;
  onClose: () => void;
}

const ReturnOrderModal: React.FC<Props> = ({ id, onSave, onClose }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [yards, setYards] = useState<any[]>([]);
  const [returnable, setReturnable] = useState<any[]>([]);
  const [selectedBoxes, setSelectedBoxes] = useState<string[]>([]);
  const [initLoading, setInitLoading] = useState(true);

  // 加载堆场下拉
  useEffect(() => {
    getYardList({ pageNo: 1, pageSize: 1000 }).then((r: any) => {
      setYards(r?.entity.data ?? []);
    });
  }, []);

  // 加载可还箱的集装箱（国内堆存/在途/国外堆存/回程在途/待提箱）
  useEffect(() => {
    const statuses = [
      "domestic_storage",
      "outbound",
      "overseas_storage",
      "inbound",
      "pending",
    ];
    Promise.all(
      statuses.map((s) =>
        getContainerList({ status: s, pageNo: 1, pageSize: 500 }),
      ),
    )
      .then((results) => {
        const boxes: any[] = [];
        (results as any[]).forEach((r: any) => {
          (r?.entity?.data ?? []).forEach((c: any) => boxes.push(c));
        });
        setReturnable(boxes);
      })
      .finally(() => setInitLoading(false));
  }, []);

  // 编辑时加载详情
  useEffect(() => {
    if (!id) return;
    getReturnOrderDetail(id).then((res: any) => {
      // 兼容三种返回：r.entity.data / r.entity / r
      const entity = res?.entity ?? {};
      const d = entity?.data ?? entity ?? {};
      form.setFieldsValue({
        orderType: d.orderType,
        yardId: d.yardId,
        remark: d.remark,
      });
      // boxes 是 entity 的同级字段，不是 data 的子字段
      const selected = (Array.isArray(entity?.boxes) ? entity.boxes : [])
        .map((b: any) => b.containerNo)
        .filter(Boolean);
      setSelectedBoxes(selected);
    });
  }, [id]);

  const handleOk = async () => {
    try {
      const vals = await form.validateFields();
      if (!id && selectedBoxes.length === 0) {
        message.error("请至少勾选一个集装箱");
        return;
      }
      setLoading(true);

      // boxes 批量明细：containerNo + containerId
      const boxesPayload = selectedBoxes.map((boxNo) => {
        const box = returnable.find((b: any) => b.containerNo === boxNo);
        return {
          containerNo: boxNo,
          containerId: box?.id,
        };
      });

      const payload: any = {
        orderType: vals.orderType,
        yardId: vals.yardId || undefined,
        remark: vals.remark,
        boxes: boxesPayload,
      };
      if (id) {
        await editReturnOrder({ ...payload, id });
        message.success("还箱令已更新");
      } else {
        await addReturnOrder(payload);
        message.success(`还箱令已生成（${selectedBoxes.length} 个箱子）`);
      }
      onSave();
    } catch {
      // validateFields 抛错
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open
      title={id ? "编辑还箱令" : "生成还箱令（支持批量）"}
      onCancel={onClose}
      onOk={handleOk}
      destroyOnClose
      width={640}
      okText="保存"
      cancelText="取消"
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical" className="mt-2">
        <div className="grid grid-cols-2 gap-x-4">
          <Form.Item
            label="还箱类型"
            name="orderType"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="选择类型"
              options={[
                { label: "客户还箱", value: "customer_return" },
                { label: "租箱归还", value: "rent_return" },
              ]}
            />
          </Form.Item>
          <Form.Item label="还箱堆场" name="yardId">
            <Select
              allowClear
              placeholder="不指定（还箱时回填实际堆场）"
              showSearch
              filterOption={(i, o) =>
                ((o?.label as string) || "")
                  .toLowerCase()
                  .includes(i.toLowerCase())
              }
              options={yards.map((y: any) => ({
                label: `${y.yardName}（${y.city ?? ""}）`,
                value: y.id,
              }))}
            />
          </Form.Item>
        </div>
        <Form.Item label="还箱时间" name="pickupTime">
          <DatePicker
            className="w-full"
            format="YYYY-MM-DD"
            placeholder="选择时间"
          />
        </Form.Item>

        <Form.Item label="备注" name="remark">
          <Input.TextArea rows={2} placeholder="如有额外说明" />
        </Form.Item>
      </Form>

      <Divider className="!my-3" />

      <div className="text-xs font-bold text-[#198348] mb-2">
        勾选需要还箱的集装箱（可多选批量）
      </div>
      {initLoading ? (
        <div className="text-center text-gray-400 py-4">加载中...</div>
      ) : returnable.length === 0 ? (
        <div className="text-center text-gray-400 py-4">暂无可还箱的集装箱</div>
      ) : (
        <div
          className="border border-gray-200 rounded p-2 max-h-56 overflow-y-auto"
          style={{ minHeight: 80 }}
        >
          {returnable.map((c) => {
            const boxNo = c.containerNo ?? c.no;
            const checked = selectedBoxes.includes(boxNo);
            return (
              <label
                key={c.id}
                className="flex items-center gap-3 py-1.5 px-1 cursor-pointer hover:bg-gray-50 rounded"
              >
                <Checkbox
                  checked={checked}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedBoxes((prev) => [...prev, boxNo]);
                    } else {
                      setSelectedBoxes((prev) =>
                        prev.filter((b) => b !== boxNo),
                      );
                    }
                  }}
                />
                <span className="font-mono text-sm">{boxNo}</span>
                <span
                  className={`inline-block px-1.5 py-0.5 rounded text-xs ${
                    c.status === "outbound"
                      ? "bg-blue-100 text-blue-600"
                      : c.status === "overseas_storage"
                        ? "bg-orange-100 text-orange-600"
                        : c.status === "inbound"
                          ? "bg-purple-100 text-purple-600"
                          : "bg-cyan-100 text-cyan-600"
                  }`}
                >
                  {c.status === "outbound"
                    ? "去程在途"
                    : c.status === "overseas_storage"
                      ? "国外堆存"
                      : c.status === "inbound"
                        ? "回程在途"
                        : "待提箱"}
                </span>
                <span className="text-xs text-gray-400 truncate flex-1">
                  {c.projectName || "-"}
                </span>
              </label>
            );
          })}
        </div>
      )}
      <div className="text-xs text-gray-400 mt-1.5 text-right">
        已选 {selectedBoxes.length} 个集装箱
      </div>
    </Modal>
  );
};

export default ReturnOrderModal;
