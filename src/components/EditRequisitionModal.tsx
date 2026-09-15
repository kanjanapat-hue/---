import React, { useState, useMemo } from 'react';
import { RequisitionOrder, MaterialItem } from '../types';
import {
  FileEdit,
  X,
  Plus,
  Minus,
  Trash2,
  AlertCircle,
  Package,
  Save,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface EditRequisitionModalProps {
  order: RequisitionOrder;
  materials: MaterialItem[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (orderId: string, updatedData: {
    purpose: string;
    items: {
      materialId: string;
      name: string;
      category: string;
      unit: string;
      unitPrice: number;
      requestedQty: number;
      approvedQty?: number;
      totalAmount: number;
      remark?: string;
    }[];
    totalItems: number;
    totalAmount: number;
  }) => void;
}

export const EditRequisitionModal: React.FC<EditRequisitionModalProps> = ({
  order,
  materials,
  isOpen,
  onClose,
  onSave,
}) => {
  const [purpose, setPurpose] = useState(order.purpose);
  const [items, setItems] = useState(order.items);
  const [selectedNewMaterialId, setSelectedNewMaterialId] = useState('');
  const [error, setError] = useState('');

  // Sync when order changes
  React.useEffect(() => {
    setPurpose(order.purpose);
    setItems(order.items);
    setError('');
    setSelectedNewMaterialId('');
  }, [order, isOpen]);

  // Material map for looking up stock and info
  const materialMap = useMemo(() => {
    const map = new Map<string, MaterialItem>();
    materials.forEach(m => map.set(m.id, m));
    return map;
  }, [materials]);

  if (!isOpen) return null;

  // Handle Qty Change
  const handleQuantityChange = (materialId: string, newQty: number) => {
    if (newQty <= 0) return;
    setItems(prev =>
      prev.map(it => {
        if (it.materialId === materialId) {
          return {
            ...it,
            requestedQty: newQty,
            approvedQty: it.approvedQty !== undefined ? newQty : (order.status === 'เบิกจ่ายแล้ว' ? newQty : undefined),
            totalAmount: it.unitPrice * newQty
          };
        }
        return it;
      })
    );
  };

  // Handle Remove Item
  const handleRemoveItem = (materialId: string) => {
    if (items.length <= 1) {
      setError('ใบเบิกต้องมีรายการวัสดุอย่างน้อย 1 รายการ หากไม่ต้องการเบิกสามารถกดยกเลิกใบขอเบิกได้');
      return;
    }
    setError('');
    setItems(prev => prev.filter(it => it.materialId !== materialId));
  };

  // Handle Remark Change
  const handleRemarkChange = (materialId: string, remark: string) => {
    setItems(prev =>
      prev.map(it => (it.materialId === materialId ? { ...it, remark } : it))
    );
  };

  // Handle Add Item to Order
  const handleAddItem = () => {
    if (!selectedNewMaterialId) return;
    const mat = materialMap.get(selectedNewMaterialId);
    if (!mat) return;

    if (items.some(it => it.materialId === mat.id)) {
      setError(`รายการ "${mat.name}" มีอยู่ในใบเบิกแล้ว สามารถปรับเพิ่มจำนวนได้โดยตรง`);
      return;
    }

    setError('');
    setItems(prev => [
      ...prev,
      {
        materialId: mat.id,
        name: mat.name,
        category: mat.category,
        unit: mat.unit,
        unitPrice: mat.unitPrice,
        requestedQty: 1,
        approvedQty: order.status === 'เบิกจ่ายแล้ว' ? 1 : undefined,
        totalAmount: mat.unitPrice * 1,
        remark: ''
      }
    ]);
    setSelectedNewMaterialId('');
  };

  // Calculate totals
  const totalItems = items.length;
  const totalAmount = items.reduce((sum, it) => sum + it.totalAmount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!purpose.trim()) {
      setError('กรุณาระบุวัตถุประสงค์ในการขอเบิก');
      return;
    }

    if (items.length === 0) {
      setError('กรุณาเลือกรายการวัสดุอย่างน้อย 1 รายการ');
      return;
    }

    onSave(order.id, {
      purpose: purpose.trim(),
      items,
      totalItems,
      totalAmount
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-linear-to-r from-amber-600 to-amber-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shadow-inner">
              <FileEdit className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">แก้ไขรายการใบขอเบิกพัสดุ</h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-900/50 text-amber-100 font-semibold">
                  {order.docNo}
                </span>
              </div>
              <p className="text-xs text-amber-100">
                สถานะ: {order.status} (สามารถแก้ไขรายการและจำนวนได้ก่อนเจ้าหน้าที่พัสดุจะอนุมัติ)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Requester Details (Read-only) */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-slate-500">ผู้ขอเบิก:</span>{' '}
              <span className="font-bold text-slate-800">{order.requesterName}</span>{' '}
              <span className="text-slate-500">({order.department})</span>
            </div>
            <div className="text-slate-500">
              วันที่ยื่น: <span className="font-medium text-slate-700">{order.date}</span>
            </div>
          </div>

          {/* Purpose Edit */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              วัตถุประสงค์ในการขอเบิก / โครงการ <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              value={purpose}
              onChange={e => setPurpose(e.target.value)}
              required
              placeholder="ระบุวัตถุประสงค์ เช่น ใช้สำหรับจัดพิมพ์เอกสารประชุม..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            />
          </div>

          {/* Items List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700">
                รายการวัสดุที่ขอเบิก ({items.length} รายการ)
              </label>
              <span className="text-xs font-mono font-bold text-amber-800">
                รวม ฿{totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 max-h-64 overflow-y-auto">
              {items.map((item, index) => {
                const mat = materialMap.get(item.materialId);
                const currentStock = mat ? mat.currentStock : 0;
                const isStockLow = currentStock < item.requestedQty;

                return (
                  <div key={item.materialId} className="p-3 bg-white hover:bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-semibold">
                          {item.materialId}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {item.name}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                        <span>฿{item.unitPrice.toLocaleString()} / {item.unit}</span>
                        <span>•</span>
                        <span className={isStockLow ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                          คงเหลือในคลัง: {currentStock} {item.unit}
                        </span>
                      </div>
                      {/* Reason input */}
                      <input
                        type="text"
                        value={item.remark || ''}
                        onChange={e => handleRemarkChange(item.materialId, e.target.value)}
                        placeholder="หมายเหตุ / เหตุผลการใช้..."
                        className="mt-1.5 w-full text-[11px] px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.materialId, item.requestedQty - 1)}
                          disabled={item.requestedQty <= 1}
                          className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-slate-600 hover:text-slate-900 shadow-2xs disabled:opacity-30 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.requestedQty}
                          onChange={e => handleQuantityChange(item.materialId, parseInt(e.target.value, 10) || 1)}
                          className="w-12 text-center text-xs font-mono font-bold bg-transparent focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(item.materialId, item.requestedQty + 1)}
                          className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-slate-600 hover:text-slate-900 shadow-2xs cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right min-w-[70px]">
                        <span className="text-xs font-mono font-bold text-slate-900">
                          ฿{item.totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.materialId)}
                        title="ลบรายการนี้"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Another Material to this Requisition */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              + เพิ่มรายการพัสดุอื่นเข้าในใบเบิกนี้
            </label>
            <div className="flex items-center gap-2">
              <select
                value={selectedNewMaterialId}
                onChange={e => setSelectedNewMaterialId(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
              >
                <option value="">-- เลือกรายการพัสดุเพื่อเพิ่ม --</option>
                {materials
                  .filter(m => !items.some(it => it.materialId === m.id))
                  .map(m => (
                    <option key={m.id} value={m.id}>
                      [{m.id}] {m.name} (คงเหลือ: {m.currentStock} {m.unit} | ฿{m.unitPrice})
                    </option>
                  ))}
              </select>
              <button
                type="button"
                onClick={handleAddItem}
                disabled={!selectedNewMaterialId}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                เพิ่มลงใบเบิก
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <div className="text-xs text-slate-500">
              รวมทั้งหมด: <span className="font-bold text-slate-800">{totalItems} รายการ</span> |{' '}
              <span className="font-bold text-amber-800 font-mono">
                ฿{totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                บันทึกการแก้ไข
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
