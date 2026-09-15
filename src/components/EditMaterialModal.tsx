import React, { useState } from 'react';
import { MaterialItem } from '../types';
import {
  X,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Hash,
  Package,
  Layers,
  Sparkles
} from 'lucide-react';
import { MaterialImageUploader } from './MaterialImageUploader';
import { getMaterialImage } from '../data/materials';

interface EditMaterialModalProps {
  isOpen: boolean;
  material: MaterialItem;
  onClose: () => void;
  onSave: (updatedMaterial: MaterialItem) => void;
}

const COMMON_UNITS = ['อัน', 'เล่ม', 'ด้าม', 'รีม', 'กล่อง', 'ม้วน', 'แพ็ค', 'ขวด', 'หลอด', 'แผ่น', 'ชุด', 'ถุง', 'ก้อน'];

export const EditMaterialModal: React.FC<EditMaterialModalProps> = ({
  isOpen,
  material,
  onClose,
  onSave
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(material.name);
  const [imageUrl, setImageUrl] = useState<string>(
    material.imageUrl || getMaterialImage(material.name, material.category)
  );
  const [purchaseQty, setPurchaseQty] = useState<number | string>(
    material.purchaseQty !== undefined ? material.purchaseQty : ''
  );
  const [unit, setUnit] = useState(material.unit || 'อัน');
  const [minQty, setMinQty] = useState<number>(material.minQty || 0);
  const [maxQty, setMaxQty] = useState<number>(material.maxQty || 50);
  const [usageStatus, setUsageStatus] = useState<string>(material.usageStatus || 'ประจำ');
  const [unitPrice, setUnitPrice] = useState<number>(material.unitPrice || 0);

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!unit.trim()) {
      setError('กรุณาระบุหน่วยนับ');
      return;
    }

    const parsedMin = Number(minQty);
    const parsedMax = Number(maxQty);
    const parsedPurchase = purchaseQty === '' ? 0 : Number(purchaseQty);
    const parsedPrice = Number(unitPrice);

    if (parsedMin < 0 || parsedMax < 0) {
      setError('จำนวนขั้นต่ำและสูงสุดต้องไม่เป็นค่าติดลบ');
      return;
    }

    if (parsedMax < parsedMin) {
      setError('จำนวนสูงสุดต้องไม่น้อยกว่าจำนวนขั้นต่ำ');
      return;
    }

    // Determine refill status based on current stock vs new minQty
    let nextRefillStatus = material.refillStatus;
    if (material.currentStock <= 0) {
      nextRefillStatus = 'วัสดุหมด';
    } else if (material.currentStock <= parsedMin) {
      nextRefillStatus = 'ใกล้หมด';
    } else {
      nextRefillStatus = 'OK';
    }

    const updated: MaterialItem = {
      ...material,
      name: name.trim() || material.name,
      imageUrl: imageUrl.trim() || material.imageUrl || getMaterialImage(material.name, material.category),
      purchaseQty: parsedPurchase,
      unit: unit.trim(),
      minQty: parsedMin,
      maxQty: parsedMax,
      usageStatus: usageStatus === 'ครั้งคราว' ? 'ครั้งคราว' : 'ประจำ',
      unitPrice: parsedPrice >= 0 ? parsedPrice : material.unitPrice,
      totalPurchaseCost: (parsedPurchase || 0) * (parsedPrice || material.unitPrice),
      refillStatus: nextRefillStatus
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-amber-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                แก้ไขข้อมูลพัสดุ: <span className="text-amber-800 font-mono">{material.id}</span>
              </h3>
              <p className="text-xs text-slate-500 line-clamp-1">{material.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Read-only / Quick Info Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
            <div>
              <span className="text-[11px] text-slate-400 block">รหัสวัสดุ</span>
              <span className="font-bold font-mono text-slate-800">{material.id}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">หมวดหมู่</span>
              <span className="font-semibold text-slate-700 truncate block">{material.category}</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">คงเหลือปัจจุบัน</span>
              <span className="font-bold font-mono text-indigo-700">
                {material.currentStock} {material.unit}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">เบิกสะสม</span>
              <span className="font-bold font-mono text-amber-700">
                {material.totalWithdrawn} {material.unit}
              </span>
            </div>
          </div>

          {/* Material Name & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ชื่อวัสดุ / รายการ
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ราคาซื้อต่อหน่วย (บาท)
              </label>
              <input
                type="number"
                step="0.25"
                min="0"
                value={unitPrice}
                onChange={e => setUnitPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white font-mono"
                required
              />
            </div>
          </div>

          {/* Material Image Uploader / Changer */}
          <div className="pt-2 border-t border-slate-100">
            <MaterialImageUploader
              currentImageUrl={imageUrl}
              materialName={name}
              category={material.category}
              onChange={setImageUrl}
              label="รูปภาพพัสดุ (อัปโหลดจากเครื่อง หรือ วางลิงก์)"
            />
          </div>

          {/* Requirement 1: จำนวนซื้อ & หน่วยนับ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>จำนวนซื้อ (Purchase Qty)</span>
                <span className="text-[10px] text-slate-400 font-normal">จำนวนสั่งซื้อล่าสุด/งวด</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={purchaseQty}
                  onChange={e => setPurchaseQty(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                  placeholder="เช่น 24, 50, 100"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                หน่วยนับ (Unit)
              </label>
              <input
                type="text"
                value={unit}
                onChange={e => setUnit(e.target.value)}
                placeholder="เช่น อัน, เล่ม, รีม, กล่อง"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                required
              />
              {/* Unit suggestions */}
              <div className="flex flex-wrap gap-1 mt-1.5">
                {COMMON_UNITS.slice(0, 8).map(u => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setUnit(u)}
                    className={`px-1.5 py-0.5 rounded text-[10px] transition-colors cursor-pointer ${
                      unit === u
                        ? 'bg-amber-600 text-white font-bold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Requirement 1: จำนวนขั้นต่ำ - จำนวนสูงสุด */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>จำนวนขั้นต่ำ (Min Qty)</span>
                <span className="text-[10px] text-amber-600 font-semibold">แจ้งเตือน &quot;ใกล้หมด&quot;</span>
              </label>
              <input
                type="number"
                min="0"
                value={minQty}
                onChange={e => setMinQty(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white font-mono"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">
                หากยอดคงเหลือ &le; ขั้นต่ำ ระบบจะขึ้นสถานะ &quot;ใกล้หมด&quot; ทันที
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>จำนวนสูงสุด (Max Qty)</span>
                <span className="text-[10px] text-slate-400 font-normal">ความจุจัดเก็บสูงสุด</span>
              </label>
              <input
                type="number"
                min="0"
                value={maxQty}
                onChange={e => setMaxQty(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white font-mono"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">
                กำหนดเพดานสต็อกเพื่อป้องกันการสั่งซื้อเกินความจำเป็น
              </p>
            </div>
          </div>

          {/* Requirement 1: การใช้ - เปลี่ยนเป็น 'ประจำ' หรือ 'ครั้งคราว' ได้ */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 mb-2">
              สถานะการใช้ (Usage Frequency)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUsageStatus('ประจำ')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                  usageStatus === 'ประจำ'
                    ? 'border-indigo-500 bg-indigo-50/60 ring-2 ring-indigo-200 text-indigo-900'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center ${
                    usageStatus === 'ประจำ' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                  }`}
                >
                  {usageStatus === 'ประจำ' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <span>📌 ใช้ประจำ</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    วัสดุพื้นฐานที่มีการเบิกใช้งานอย่างสม่ำเสมอในทุกเดือน
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setUsageStatus('ครั้งคราว')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                  usageStatus === 'ครั้งคราว'
                    ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-200 text-amber-900'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center ${
                    usageStatus === 'ครั้งคราว' ? 'border-amber-600 bg-amber-600' : 'border-slate-300'
                  }`}
                >
                  {usageStatus === 'ครั้งคราว' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div>
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <span>⏱️ ใช้ครั้งคราว</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    วัสดุเฉพาะกิจหรือใช้ตามวาระงาน/กิจกรรม ไม่เบิกเป็นประจำ
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Live Preview Info */}
          <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/60 text-xs text-amber-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              ราคาซื้อรวมจะคำนวณใหม่เป็น{' '}
              <strong className="font-mono">
                ฿{((Number(purchaseQty) || 0) * (Number(unitPrice) || 0)).toLocaleString('th-TH', {
                  minimumFractionDigits: 2
                })}
              </strong>{' '}
              ({purchaseQty || 0} {unit} &times; ฿{unitPrice})
            </span>
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              บันทึกการแก้ไข
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
