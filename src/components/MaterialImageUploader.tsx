import React, { useState, useRef } from 'react';
import {
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  Sparkles,
  Trash2,
  Check,
  AlertCircle,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import {
  processImageFile,
  FALLBACK_MATERIAL_IMAGE,
  MATERIAL_IMAGE_PRESETS
} from '../utils/imageHelper';
import { getMaterialImage } from '../data/materials';

interface MaterialImageUploaderProps {
  currentImageUrl?: string;
  materialName?: string;
  category?: string;
  onChange: (newImageUrl: string) => void;
  label?: string;
  compact?: boolean;
}

export const MaterialImageUploader: React.FC<MaterialImageUploaderProps> = ({
  currentImageUrl,
  materialName = '',
  category = '',
  onChange,
  label = 'รูปภาพพัสดุ (Material Image)',
  compact = false
}) => {
  const [activeMode, setActiveMode] = useState<'upload' | 'url' | 'presets'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayImage = currentImageUrl || (materialName ? getMaterialImage(materialName, category) : FALLBACK_MATERIAL_IMAGE);

  const handleFile = async (file: File) => {
    setErrorMsg(null);
    setIsProcessing(true);
    try {
      const optimizedDataUrl = await processImageFile(file, 480, 480, 0.82);
      onChange(optimizedDataUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'ไม่สามารถประมวลผลไฟล์ภาพได้';
      setErrorMsg(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    // reset input so same file can be re-selected if desired
    if (e.target) e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleApplyUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setErrorMsg('กรุณากรอก URL ของรูปภาพ');
      return;
    }
    setErrorMsg(null);
    onChange(trimmed);
    setUrlInput('');
  };

  const handleAutoSuggest = () => {
    if (!materialName && !category) {
      setErrorMsg('กรุณากรอกชื่อวัสดุหรือเลือกหมวดหมู่ก่อนเพื่อให้ระบบแนะนำภาพ');
      return;
    }
    const suggested = getMaterialImage(materialName, category);
    onChange(suggested);
    setErrorMsg(null);
  };

  const handleClearImage = () => {
    // Reset to auto suggested or empty
    const fallback = materialName ? getMaterialImage(materialName, category) : FALLBACK_MATERIAL_IMAGE;
    onChange(fallback);
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-700">
            {label}
          </label>
          <span className="text-[11px] text-slate-400">
            รองรับ JPG, PNG, WebP (บีบอัดอัตโนมัติ)
          </span>
        </div>
      )}

      {errorMsg && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className={`grid grid-cols-1 ${compact ? 'sm:grid-cols-1' : 'sm:grid-cols-12'} gap-3 items-start`}>
        {/* Image Preview Box */}
        <div className={`${compact ? 'w-full flex items-center gap-3' : 'sm:col-span-4'} flex flex-col items-center justify-center p-2.5 bg-slate-50 border border-slate-200 rounded-xl relative group`}>
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden bg-white border border-slate-200 shadow-xs relative flex items-center justify-center shrink-0">
            {displayImage ? (
              <img
                src={displayImage}
                alt="ตัวอย่างรูปภาพพัสดุ"
                referrerPolicy="no-referrer"
                onError={e => {
                  (e.currentTarget as HTMLImageElement).src = FALLBACK_MATERIAL_IMAGE;
                }}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-300 p-2">
                <ImageIcon className="w-8 h-8 mb-1" />
                <span className="text-[10px] text-slate-400">ไม่มีรูปภาพ</span>
              </div>
            )}

            {isProcessing && (
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center text-white text-xs gap-1.5 p-1 text-center">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span className="text-[10px]">กำลังบีบอัดภาพ...</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-2 w-full justify-center">
            {materialName && (
              <button
                type="button"
                onClick={handleAutoSuggest}
                title="ใช้รูปแนะนำจากชื่อวัสดุ"
                className="text-[10px] text-amber-700 hover:text-amber-800 hover:bg-amber-100/60 bg-amber-50 px-2 py-1 rounded-md border border-amber-200 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>แนะนำอัตโนมัติ</span>
              </button>
            )}
            {currentImageUrl && (
              <button
                type="button"
                onClick={handleClearImage}
                title="รีเซ็ตรูปภาพเป็นค่าเริ่มต้น"
                className="text-[10px] text-slate-500 hover:text-rose-600 hover:bg-rose-50 px-1.5 py-1 rounded-md transition-colors cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Action Controls & Tabs */}
        <div className={`${compact ? 'w-full' : 'sm:col-span-8'} space-y-2`}>
          {/* Method selector tabs */}
          <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setActiveMode('upload')}
              className={`flex-1 py-1 px-2 rounded-md font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeMode === 'upload'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>อัปโหลดรูป</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('url')}
              className={`flex-1 py-1 px-2 rounded-md font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeMode === 'url'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>ลิงก์ URL</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('presets')}
              className={`flex-1 py-1 px-2 rounded-md font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeMode === 'presets'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>คลังภาพแนะนำ</span>
            </button>
          </div>

          {/* Mode 1: Upload File */}
          {activeMode === 'upload' && (
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={onFileInputChange}
                accept="image/*"
                className="hidden"
              />
              <div
                onDragOver={e => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
                  isDragOver
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-slate-300 hover:border-amber-400 bg-slate-50/50 hover:bg-amber-50/20'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                  <FolderOpen className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-semibold text-amber-800">คลิกเพื่อเลือกไฟล์</span> หรือลากวางไฟล์ที่นี่
                </div>
                <p className="text-[10px] text-slate-400">
                  ระบบจะปรับลดขนาดและบีบอัดภาพให้อัตโนมัติเพื่อให้โหลดเร็ว
                </p>
              </div>
            </div>
          )}

          {/* Mode 2: Paste URL */}
          {activeMode === 'url' && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  placeholder="วางลิงก์รูปภาพ https://..."
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleApplyUrl();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>ใช้ภาพนี้</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-400">
                รองรับลิงก์รูปภาพโดยตรงจากเว็บ เช่น Unsplash หรือไดรฟ์
              </p>
            </div>
          )}

          {/* Mode 3: Presets */}
          {activeMode === 'presets' && (
            <div className="space-y-1.5">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto pr-1">
                {MATERIAL_IMAGE_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onChange(p.url)}
                    className={`flex items-center gap-2 p-1.5 rounded-lg border text-left text-[11px] transition-all cursor-pointer ${
                      currentImageUrl === p.url
                        ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold'
                        : 'border-slate-200 hover:border-amber-300 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <img
                      src={p.url}
                      alt=""
                      className="w-7 h-7 rounded object-cover shrink-0 bg-slate-100"
                    />
                    <span className="truncate">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
