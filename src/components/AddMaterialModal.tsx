import React, { useState, useMemo } from 'react';
import { MaterialItem } from '../types';
import {
  PackagePlus,
  X,
  AlertCircle,
  Tag,
  Hash,
  Coins,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { MaterialImageUploader } from './MaterialImageUploader';
import { getMaterialImage } from '../data/materials';

interface AddMaterialModalProps {
  existingMaterials: MaterialItem[];
  isOpen: boolean;
  onClose: () => void;
  onAddMaterial?: (material: MaterialItem) => void;
  onAdd?: (material: MaterialItem) => void;
}

const COMMON_CATEGORIES = [
  'วัสดุสำนักงาน',
  'วัสดุการศึกษา',
  'วัสดุคอมพิวเตอร์',
  'วัสดุงานบ้านงานครัว',
  'วัสดุไฟฟ้าและวิทยุ',
  'วัสดุยานพาหนะ'
];

const COMMON_UNITS = [
  'รีม',
  'แท่ง',
  'ด้าม',
  'เล่ม',
  'กล่อง',
  'อัน',
  'ม้วน',
  'แฟ้ม',
  'ก้อน',
  'ขวด',
  'ห่อ',
  'ชุด',
  'เครื่อง'
];

export const AddMaterialModal: React.FC<AddMaterialModalProps> = ({
  existingMaterials,
  isOpen,
  onClose,
  onAddMaterial,
  onAdd,
}) => {
  // Suggest next ID prefix based on category
  const suggestedNextId = useMemo(() => {
    // Generate a default unique ID like 1ว... or similar
    let nextNum = existingMaterials.length + 1;
    let testId = `1ว${String(nextNum).padStart(2, '0')}`;
    while (existingMaterials.some(m => m.id === testId)) {
      nextNum++;
      testId = `1ว${String(nextNum).padStart(2, '0')}`;
    }
    return testId;
  }, [existingMaterials]);

  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('วัสดุสำนักงาน');
  const [customCategory, setCustomCategory] = useState('');
  const [unit, setUnit] = useState('อัน');
  const [customUnit, setCustomUnit] = useState('');
  const [unitPrice, setUnitPrice] = useState<number | ''>(100);
  const [currentStock, setCurrentStock] = useState<number | ''>(0);
  const [minQty, setMinQty] = useState<number | ''>(5);
  const [maxQty, setMaxQty] = useState<number | ''>(50);
  const [usageStatus, setUsageStatus] = useState<'ประจำ' | 'ครั้งคราว'>('ประจำ');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');

  // Reset form when opened
  React.useEffect(() => {
    if (isOpen) {
      setId(suggestedNextId);
      setName('');
      setImageUrl('');
      setCategory('วัสดุสำนักงาน');
      setCustomCategory('');
      setUnit('อัน');
      setCustomUnit('');
      setUnitPrice(50);
      setCurrentStock(0);
      setMinQty(5);
      setMaxQty(50);
      setUsageStatus('ประจำ');
      setError('');
    }
  }, [isOpen, suggestedNextId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const finalId = id.trim();
    const finalName = name.trim();
    const finalCategory = category === 'อื่นๆ' ? customCategory.trim() : category;
    const finalUnit = unit === 'อื่นๆ' ? customUnit.trim() : unit;
    const finalPrice = typeof unitPrice === 'number' ? unitPrice : 0;
    const finalStock = typeof currentStock === 'number' ? currentStock : 0;
    const finalMin = typeof minQty === 'number' ? minQty : 5;
    const finalMax = typeof maxQty === 'number' ? maxQty : 50;

    if (!finalId) {
      setError('กรุณาระบุรหัสวัสดุ');
      return;
    }

    if (existingMaterials.some(m => m.id.toLowerCase() === finalId.toLowerCase())) {
      setError(`รหัสวัสดุ "${finalId}" มีอยู่ในระบบแล้ว กรุณาใช้รหัสอื่น`);
      return;
    }

    if (!finalName) {
      setError('กรุณาระบุชื่อรายการวัสดุ');
      return;
    }

    if (!finalCategory) {
      setError('กรุณาเลือกหรือระบุหมวดหมู่วัสดุ');
      return;
    }

    if (!finalUnit) {
      setError('กรุณาเลือกหรือระบุหน่วยนับ');
      return;
    }

    if (finalPrice < 0) {
      setError('ราคาต่อหน่วยต้องไม่ติดลบ');
      return;
    }

    if (finalStock < 0) {
      setError('จำนวนคงเหลือเริ่มต้นต้องไม่ติดลบ');
      return;
    }

    const refillStatus: 'OK' | 'ใกล้หมด' | 'วัสดุหมด' =
      finalStock <= 0 ? 'วัสดุหมด' : finalStock <= finalMin ? 'ใกล้หมด' : 'OK';

    const finalImage = imageUrl.trim() || getMaterialImage(finalName, finalCategory);

    const newMaterial: MaterialItem = {
      id: finalId,
      no: existingMaterials.length + 1,
      name: finalName,
      imageUrl: finalImage,
      category: finalCategory,
      unitPrice: finalPrice,
      unit: finalUnit,
      minQty: finalMin,
      maxQty: finalMax,
      currentStock: finalStock,
      refillStatus,
      usageStatus,
      totalPurchaseCost: finalStock * finalPrice,
      totalWithdrawn: 0,
      monthlyAverage: 0
    };

    const addFn = onAddMaterial || onAdd;
    if (addFn) {
      addFn(newMaterial);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-linear-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shadow-inner">
              <PackagePlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">เพิ่มรายการวัสดุใหม่เข้าสู่คลัง</h3>
              <p className="text-xs text-emerald-100">
                เพิ่มชื่อ รหัส หมวดหมู่ ราคาต่อหน่วย และกำหนดเกณฑ์คงเหลือของวัสดุ
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Material ID */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                รหัสวัสดุ <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={id}
                  onChange={e => setId(e.target.value)}
                  placeholder="เช่น 1ก05, 2พ01"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">แนะนำ: {suggestedNextId}</p>
            </div>

            {/* Material Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ชื่อรายการวัสดุ <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="เช่น แฟ้มสันกว้าง 3 นิ้ว ตราช้าง, ปากกาเคมี 2 หัว"
                required
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                หมวดหมู่วัสดุ <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white cursor-pointer"
              >
                {COMMON_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="อื่นๆ">อื่นๆ (ระบุเอง)</option>
              </select>
              {category === 'อื่นๆ' && (
                <input
                  type="text"
                  value={customCategory}
                  onChange={e => setCustomCategory(e.target.value)}
                  placeholder="พิมพ์ชื่อหมวดหมู่..."
                  className="mt-2 w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              )}
            </div>

            {/* Unit */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                หน่วยนับ <span className="text-rose-500">*</span>
              </label>
              <select
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white cursor-pointer"
              >
                {COMMON_UNITS.map(u => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
                <option value="อื่นๆ">อื่นๆ (ระบุเอง)</option>
              </select>
              {unit === 'อื่นๆ' && (
                <input
                  type="text"
                  value={customUnit}
                  onChange={e => setCustomUnit(e.target.value)}
                  placeholder="พิมพ์หน่วยนับ..."
                  className="mt-2 w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              )}
            </div>
          </div>

          {/* Material Image Uploader */}
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200">
            <MaterialImageUploader
              currentImageUrl={imageUrl}
              materialName={name}
              category={category === 'อื่นๆ' ? customCategory : category}
              onChange={setImageUrl}
              label="รูปภาพพัสดุ (อัปโหลดรูปภาพใหม่ หรือ เลือกภาพแนะนำ)"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
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
                  placeholder="0.00"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Initial Stock */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                จำนวนคงเหลือเริ่มต้น
              </label>
              <div className="relative">
                <Layers className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="number"
                  min="0"
                  value={currentStock}
                  onChange={e => setCurrentStock(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                  placeholder="0"
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">สามารถกำหนดเป็น 0 หรือยอดตั้งต้นได้</p>
            </div>

            {/* Usage Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                สถานะการใช้งาน
              </label>
              <select
                value={usageStatus}
                onChange={e => setUsageStatus(e.target.value as 'ประจำ' | 'ครั้งคราว')}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white cursor-pointer"
              >
                <option value="ประจำ">ประจำ (ใช้อย่างต่อเนื่อง)</option>
                <option value="ครั้งคราว">ครั้งคราว (เบิกเฉพาะช่วงงาน)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Min Qty */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                เกณฑ์สำรองขั้นต่ำ (Min Qty)
              </label>
              <input
                type="number"
                min="0"
                value={minQty}
                onChange={e => setMinQty(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
              <p className="text-[10px] text-slate-500 mt-1">หากยอดคงเหลือต่ำกว่านี้จะขึ้นสถานะ &ldquo;ใกล้หมด&rdquo;</p>
            </div>

            {/* Max Qty */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                เกณฑ์สูงสุด (Max Qty)
              </label>
              <input
                type="number"
                min="1"
                value={maxQty}
                onChange={e => setMaxQty(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              บันทึกรายการวัสดุใหม่
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
