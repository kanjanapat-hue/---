import React, { useState } from 'react';
import { StockOutRecord, MaterialItem } from '../types';
import {
  FileEdit,
  X,
  AlertCircle,
  Save,
  Calendar,
  Hash,
  Coins,
  Building,
  User
} from 'lucide-react';

interface EditStockOutModalProps {
  record: StockOutRecord | null;
  materials: MaterialItem[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedRecord: StockOutRecord) => void;
}

export const EditStockOutModal: React.FC<EditStockOutModalProps> = ({
  record,
  materials,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !record) return null;

  const [date, setDate] = useState(record.date);
  const [requisitionDocNo, setRequisitionDocNo] = useState(record.requisitionDocNo);
  const [quantity, setQuantity] = useState<number | ''>(record.quantity);
  const [unitPrice, setUnitPrice] = useState<number | ''>(record.unitPrice);
  const [requesterName, setRequesterName] = useState(record.requesterName);
  const [department, setDepartment] = useState(record.department);
  const [disburserName, setDisburserName] = useState(record.disburserName);
  const [note, setNote] = useState(record.note || '');
  const [error, setError] = useState('');

  const currentMat = materials.find(m => m.id === record.materialId);
  const availableStock = currentMat ? currentMat.currentStock : 0;
  // Maximum can be currentStock + old quantity
  const maxPossible = availableStock + record.quantity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const finalQty = typeof quantity === 'number' ? quantity : 0;
    const finalPrice = typeof unitPrice === 'number' ? unitPrice : 0;

    if (!requisitionDocNo.trim()) {
      setError('กรุณาระบุเลขที่ใบเบิก');
      return;
    }

    if (finalQty <= 0) {
      setError('จำนวนเบิกจ่ายต้องมากกว่า 0');
      return;
    }

    if (finalQty > maxPossible) {
      setError(`จำนวนที่เบิก (${finalQty}) เกินกว่าพัสดุคงเหลือสูงสุดที่จะจ่ายได้ (${maxPossible} ${record.unit})`);
      return;
    }

    if (finalPrice < 0) {
      setError('ราคาต่อหน่วยต้องไม่ติดลบ');
      return;
    }

    const updated: StockOutRecord = {
      ...record,
      date,
      requisitionDocNo: requisitionDocNo.trim(),
      quantity: finalQty,
      unitPrice: finalPrice,
      totalPrice: finalQty * finalPrice,
      requesterName: requesterName.trim() || record.requesterName,
      department: department.trim() || record.department,
      disburserName: disburserName.trim() || record.disburserName,
      note: note.trim()
    };

    onSave(updated);
    onClose();
  };

  const qtyNumber = typeof quantity === 'number' ? quantity : 0;
  const priceNumber = typeof unitPrice === 'number' ? unitPrice : 0;
  const calculatedTotal = qtyNumber * priceNumber;
  const qtyDiff = qtyNumber - record.quantity;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-linear-to-r from-amber-600 to-amber-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shadow-inner">
              <FileEdit className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">แก้ไขรายการเบิกจ่ายพัสดุ (Stock Out)</h3>
              <p className="text-xs text-amber-100">
                รหัส: {record.materialId} • {record.materialName}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Material Info Box */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-800">{record.materialName}</span>
              <span className="font-mono font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded">
                {record.materialId}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>หมวดหมู่: {record.category}</span>
              <span>
                สต็อกปัจจุบันในคลัง: <strong>{availableStock}</strong> {record.unit} (ปรับได้สูงสุด {maxPossible})
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                วันที่เบิกจ่าย <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Requisition Doc No */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                เลขที่ใบเบิก <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={requisitionDocNo}
                  onChange={e => setRequisitionDocNo(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Quantity */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                จำนวนที่เบิกจ่าย ({record.unit}) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max={maxPossible}
                value={quantity}
                onChange={e => setQuantity(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                required
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
              {qtyDiff !== 0 && (
                <p className="text-[10px] text-slate-500 mt-1">
                  ปรับจากเดิม ({record.quantity}):{' '}
                  <span className={qtyDiff > 0 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                    {qtyDiff > 0 ? `+${qtyDiff}` : qtyDiff} {record.unit}
                  </span>{' '}
                  (สต็อกในคลังจะปรับลด/คืนตามจริง)
                </p>
              )}
            </div>

            {/* Unit Price */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ราคาต่อหน่วย (บาท) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Coins className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={unitPrice}
                  onChange={e => setUnitPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                รวมเป็นเงิน: <span className="font-bold text-amber-800 font-mono">฿{calculatedTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Requester Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ผู้ขอเบิก
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={requesterName}
                  onChange={e => setRequesterName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                หน่วยงาน / สาขาวิชา
              </label>
              <div className="relative">
                <Building className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Disburser Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ผู้จ่ายพัสดุ
            </label>
            <input
              type="text"
              value={disburserName}
              onChange={e => setDisburserName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              วัตถุประสงค์ / หมายเหตุ
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="ระบุวัตถุประสงค์หรือหมายเหตุเพิ่มเติม"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
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
        </form>
      </div>
    </div>
  );
};
