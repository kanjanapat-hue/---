import React, { useState, useEffect } from 'react';
import { MaterialItem } from '../types';
import { X, Camera, CheckCircle2 } from 'lucide-react';
import { MaterialImageUploader } from './MaterialImageUploader';
import { getMaterialImage } from '../data/materials';

interface QuickChangeImageModalProps {
  isOpen: boolean;
  material: MaterialItem | null;
  onClose: () => void;
  onSaveImage: (materialId: string, newImageUrl: string) => void;
}

export const QuickChangeImageModal: React.FC<QuickChangeImageModalProps> = ({
  isOpen,
  material,
  onClose,
  onSaveImage
}) => {
  const [selectedImage, setSelectedImage] = useState<string>('');

  useEffect(() => {
    if (material) {
      setSelectedImage(material.imageUrl || getMaterialImage(material.name, material.category));
    }
  }, [material]);

  if (!isOpen || !material) return null;

  const handleSave = () => {
    onSaveImage(material.id, selectedImage);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-amber-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                เปลี่ยนรูปภาพพัสดุ
              </h3>
              <p className="text-xs text-slate-500">
                <span className="font-mono font-semibold text-amber-800 mr-1.5">{material.id}</span>
                {material.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <MaterialImageUploader
            currentImageUrl={selectedImage}
            materialName={material.name}
            category={material.category}
            onChange={setSelectedImage}
            label="เลือกรูปภาพใหม่หรืออัปโหลดจากเครื่อง"
          />

          <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/60 text-xs text-amber-900">
            💡 <strong>เคล็ดลับ:</strong> คุณสามารถอัปโหลดภาพจากมือถือ/คอมพิวเตอร์ หรือวางลิงก์รูปภาพ ระบบจะบันทึกและแสดงผลทันทีทั้งในหน้ารายงานคลังพัสดุและหน้าจอขอเบิกของผู้ใช้งาน
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-3.5 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200/70 rounded-xl transition-colors cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>บันทึกรูปภาพ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
