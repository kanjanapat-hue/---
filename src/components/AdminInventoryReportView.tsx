import React, { useState, useMemo } from 'react';
import { MaterialItem, RequisitionOrder, StockOutRecord } from '../types';
import { CATEGORY_COLORS, getMaterialImage } from '../data/materials';
import { MaterialStatsBar } from './MaterialStatsBar';
import { AddMaterialModal } from './AddMaterialModal';
import { EditMaterialModal } from './EditMaterialModal';
import { QuickChangeImageModal } from './QuickChangeImageModal';
import { ConfirmModal } from './ConfirmModal';
import { getFiscalYearInfo, calculateFiscalMonthlyAverage } from '../utils/fiscalYear';
import { FALLBACK_MATERIAL_IMAGE } from '../utils/imageHelper';
import {
  BarChart3,
  Search,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  BookOpen,
  PlusCircle,
  Plus,
  Edit3,
  Camera,
  ArrowRightLeft,
  Calendar,
  Calculator,
  FileCheck,
  Info,
  Check
} from 'lucide-react';

interface AdminInventoryReportViewProps {
  materials: MaterialItem[];
  orders?: RequisitionOrder[];
  stockOuts?: StockOutRecord[];
  onSelectMaterial?: (item: MaterialItem) => void;
  onResetAllStockToZero?: () => void;
  onReceiveAll20?: () => void;
  onViewLedger?: (materialId: string) => void;
  onAddMaterial?: (newMaterial: MaterialItem) => void;
  onUpdateMaterial?: (updatedMaterial: MaterialItem) => void;
}

export const AdminInventoryReportView: React.FC<AdminInventoryReportViewProps> = ({
  materials,
  orders = [],
  stockOuts = [],
  onResetAllStockToZero,
  onReceiveAll20,
  onViewLedger,
  onAddMaterial,
  onUpdateMaterial,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ทั้งหมด');
  const [filterStatus, setFilterStatus] = useState<string>('ทั้งหมด');
  const [usageFilter, setUsageFilter] = useState<string>('ทั้งหมด');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<MaterialItem | null>(null);
  const [quickImageMaterial, setQuickImageMaterial] = useState<MaterialItem | null>(null);

  // Fiscal Year calculation settings
  const fiscalInfo = useMemo(() => getFiscalYearInfo(), []);
  const [selectedFiscalMonths, setSelectedFiscalMonths] = useState<number>(fiscalInfo.elapsedMonths);

  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    details?: string;
    confirmText: string;
    variant: 'danger' | 'warning' | 'success' | 'info';
    icon: 'restore' | 'delete' | 'danger' | 'success' | 'warning';
    onConfirm: () => void;
  } | null>(null);

  // Quick feedback toast for inline changes
  const [inlineFeedback, setInlineFeedback] = useState<string | null>(null);

  const showInlineNotice = (msg: string) => {
    setInlineFeedback(msg);
    setTimeout(() => setInlineFeedback(null), 4000);
  };

  // Requirement 2 & 3:
  // 2. รายการเบิกสะสมให้อิงตามใบเบิกจ่าย หากใบเบิกจ่ายมีการยกเลิกให้ยกเลิกตามด้วยโดยให้สัมพันธ์กัน
  // 3. รายการเฉลี่ย/ต่อเดือน ให้คำนวณจากยอดเบิกสะสม นับตามเดือนปีงบประมาณทางการเงิน
  const disbursedOrders = useMemo(() => {
    return orders.filter(o => o.status === 'เบิกจ่ายแล้ว');
  }, [orders]);

  const cancelledOrders = useMemo(() => {
    return orders.filter(o => o.status === 'ยกเลิก');
  }, [orders]);

  // Compute synchronized materials with dynamic totalWithdrawn and fiscal monthlyAverage
  const synchronizedMaterials = useMemo(() => {
    return materials.map(item => {
      // 1. Calculate withdrawn amount from disbursed orders (status === 'เบิกจ่ายแล้ว')
      // Cancelled orders (status === 'ยกเลิก') and pending orders are strictly excluded!
      const orderWithdrawn = disbursedOrders.reduce((sum, order) => {
        const matchedItem = order.items.find(it => it.materialId === item.id);
        if (matchedItem) {
          const qty = matchedItem.approvedQty !== undefined ? matchedItem.approvedQty : matchedItem.requestedQty;
          return sum + (Number(qty) || 0);
        }
        return sum;
      }, 0);

      // Also include manual stockouts that are not linked to a requisition order (if any)
      const manualWithdrawn = stockOuts
        .filter(so => so.materialId === item.id && (!so.requisitionDocNo || !orders.some(o => o.docNo === so.requisitionDocNo)))
        .reduce((sum, so) => sum + (Number(so.quantity) || 0), 0);

      const dynamicTotalWithdrawn = orderWithdrawn + manualWithdrawn;

      // 2. Calculate monthly average based on financial fiscal year elapsed months
      const dynamicMonthlyAverage = calculateFiscalMonthlyAverage(dynamicTotalWithdrawn, selectedFiscalMonths);

      // 3. Calculate purchase total cost
      const purchaseQty = item.purchaseQty !== undefined ? item.purchaseQty : 0;
      const totalPurchaseCost = purchaseQty * item.unitPrice;

      return {
        ...item,
        totalWithdrawn: dynamicTotalWithdrawn,
        monthlyAverage: dynamicMonthlyAverage,
        totalPurchaseCost
      };
    });
  }, [materials, disbursedOrders, stockOuts, orders, selectedFiscalMonths]);

  // Categories list
  const categories = useMemo(() => {
    const list = Array.from(new Set(synchronizedMaterials.map(m => m.category))).filter(Boolean);
    return ['ทั้งหมด', ...list];
  }, [synchronizedMaterials]);

  // Filtered materials
  const filteredMaterials = useMemo(() => {
    return synchronizedMaterials.filter(item => {
      const matchSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedCategory === 'ทั้งหมด' || item.category === selectedCategory;
      const matchStatus =
        filterStatus === 'ทั้งหมด' ||
        (filterStatus === 'OK' && item.currentStock > item.minQty) ||
        (filterStatus === 'ใกล้หมด' && item.currentStock > 0 && item.currentStock <= item.minQty) ||
        (filterStatus === 'วัสดุหมด' && item.currentStock <= 0);
      const matchUsage = usageFilter === 'ทั้งหมด' || item.usageStatus === usageFilter;
      return matchSearch && matchCat && matchStatus && matchUsage;
    });
  }, [synchronizedMaterials, searchTerm, selectedCategory, filterStatus, usageFilter]);

  // Requirement 1: Toggle usage status directly between 'ประจำ' and 'ครั้งคราว'
  const handleToggleUsageStatus = (item: MaterialItem) => {
    const nextStatus = item.usageStatus === 'ครั้งคราว' ? 'ประจำ' : 'ครั้งคราว';
    const updated: MaterialItem = {
      ...item,
      usageStatus: nextStatus
    };
    if (onUpdateMaterial) {
      onUpdateMaterial(updated);
      showInlineNotice(`เปลี่ยนสถานะการใช้ "${item.name}" เป็น "${nextStatus === 'ครั้งคราว' ? 'ใช้ครั้งคราว' : 'ใช้ประจำ'}" เรียบร้อยแล้ว`);
    }
  };

  // Handle save from EditMaterialModal
  const handleSaveEditedMaterial = (updatedItem: MaterialItem) => {
    if (onUpdateMaterial) {
      onUpdateMaterial(updatedItem);
      showInlineNotice(`บันทึกการแก้ไข "${updatedItem.name}" (${updatedItem.id}) สำเร็จ`);
    }
  };

  // Handle quick image update for a material
  const handleSaveMaterialImage = (materialId: string, newImageUrl: string) => {
    const target = materials.find(m => m.id === materialId);
    if (target && onUpdateMaterial) {
      const updated: MaterialItem = {
        ...target,
        imageUrl: newImageUrl
      };
      onUpdateMaterial(updated);
      showInlineNotice(`เปลี่ยนรูปภาพ "${target.name}" (${target.id}) สำเร็จ`);
    }
  };

  // CSV Export for administrative report (Includes dynamic totalWithdrawn and fiscal monthlyAverage)
  const handleExportCsv = () => {
    const headers = [
      'ลำดับ',
      'รหัสวัสดุ',
      'ชื่อวัสดุ',
      'หมวดวัสดุ',
      'ราคาซื้อ',
      'จำนวนซื้อ',
      'หน่วยนับ',
      'จำนวนขั้นต่ำ',
      'จำนวนสูงสุด',
      'จำนวนสินค้าคงเหลือ',
      'สถานะการเติมสินค้า',
      'สถานะการใช้',
      'ราคาซื้อรวม',
      'จำนวนการเบิกถึงปัจจุบัน (อิงใบเบิกจ่าย)',
      `เฉลี่ยเบิกต่อเดือน (ปีงบ ${fiscalInfo.fiscalYearBE} นับ ${selectedFiscalMonths} เดือน)`
    ];

    const rows = filteredMaterials.map((item, idx) => [
      idx + 1,
      item.id,
      `"${item.name.replace(/"/g, '""')}"`,
      item.category,
      item.unitPrice,
      item.purchaseQty || '',
      item.unit,
      item.minQty,
      item.maxQty,
      item.currentStock,
      item.refillStatus,
      item.usageStatus,
      item.unitPrice * item.currentStock,
      item.totalWithdrawn,
      item.monthlyAverage
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `รายงานพัสดุคงเหลือ_วิทยาลัยการเมืองการปกครอง_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalCurrentStockCount = filteredMaterials.reduce((s, it) => s + it.currentStock, 0);
  const totalStockWorth = filteredMaterials.reduce((s, it) => s + (it.unitPrice * it.currentStock), 0);
  const totalDisbursedCount = filteredMaterials.reduce((s, it) => s + it.totalWithdrawn, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 text-indigo-800 rounded-xl">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">📊 รายงานพัสดุคงเหลือ</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            อ้างอิงโครงสร้าง Sheet &ldquo;📊 รายงานพัสดุคงเหลือ&rdquo; วิทยาลัยการเมืองการปกครอง มมส. คำนวณเบิกสะสมสัมพันธ์กับใบเบิกจ่ายและรอบปีงบประมาณ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onAddMaterial && (
            <button
              id="btn-add-new-material"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              title="เพิ่มรายการพัสดุ/วัสดุใหม่เข้าสู่ระบบ"
            >
              <Plus className="w-4 h-4" />
              + เพิ่มรายการวัสดุใหม่
            </button>
          )}

          {onViewLedger && (
            <button
              id="btn-goto-ledger"
              onClick={() => onViewLedger('')}
              className="inline-flex items-center gap-2 px-3 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer"
              title="เปิดดูสมุดคุมบัญชีพัสดุ"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
              สมุดคุมบัญชีพัสดุ
            </button>
          )}

          {onReceiveAll20 && (
            <button
              id="btn-inventory-receive-20"
              onClick={() => {
                setConfirmConfig({
                  title: 'ยืนยันการรับเข้าวัสดุทุกรายการ 20 หน่วย',
                  message: 'คุณต้องการบันทึกรับเข้าพัสดุทุกรายการอย่างละ 20 หน่วย เข้าสู่คลังพัสดุใช่หรือไม่?',
                  details: `รายการพัสดุทั้งหมดในระบบจำนวน ${materials.length} รายการ จะได้รับเข้าสต็อกเพิ่มรายการละ 20 หน่วย พร้อมบันทึกลงในสมุดคุมบัญชีและประวัติรับเข้าโดยอัตโนมัติ`,
                  confirmText: 'ยืนยันรับเข้า 20 หน่วย',
                  variant: 'success',
                  icon: 'success',
                  onConfirm: () => onReceiveAll20()
                });
              }}
              className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer"
              title="รับเข้าวัสดุทุกรายการอย่างละ 20 หน่วย"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
              รับเข้าทุกรายการ 20 หน่วย
            </button>
          )}

          {onResetAllStockToZero && (
            <button
              id="btn-reset-stock-zero"
              onClick={() => {
                setConfirmConfig({
                  title: 'ยืนยันการรีเซ็ตยอดคงเหลือเป็น 0',
                  message: 'คุณต้องการลบจำนวนคงเหลือให้เป็น 0 ทุกรายการใช่หรือไม่?',
                  details: 'การกระทำนี้จะเปลี่ยนจำนวนคงเหลือของพัสดุทุกรายการให้เป็น 0 และปรับสถานะเป็น "วัสดุหมด" เพื่อเริ่มต้นนับสต็อกใหม่',
                  confirmText: 'ยืนยันรีเซ็ตเป็น 0',
                  variant: 'danger',
                  icon: 'danger',
                  onConfirm: () => onResetAllStockToZero()
                });
              }}
              className="inline-flex items-center gap-2 px-3 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer"
              title="ลบจำนวนคงเหลือให้เป็น 0 ทุกรายการ"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
              ลบจำนวนคงเหลือเป็น 0 ทุกรายการ
            </button>
          )}

          <button
            id="btn-export-inventory-csv"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            ส่งออกรายงาน CSV
          </button>
        </div>
      </div>

      {/* Inline Notification Banner */}
      {inlineFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">{inlineFeedback}</span>
          </div>
          <button
            onClick={() => setInlineFeedback(null)}
            className="text-emerald-600 hover:text-emerald-800 text-xs font-bold"
          >
            &times;
          </button>
        </div>
      )}

      {/* Requirement 2 & 3: Fiscal Year & Requisition Synchronization Banner */}
      <div className="bg-gradient-to-r from-amber-50/80 via-indigo-50/60 to-slate-50 p-4 rounded-2xl border border-amber-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-amber-600 text-white rounded-xl shadow-2xs shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-slate-900 text-sm">
                รอบปีงบประมาณทางการเงิน พ.ศ. {fiscalInfo.fiscalYearBE} (1 ต.ค. - 30 ก.ย.)
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/70 text-amber-900 border border-amber-300/80">
                นับถึงเดือน {fiscalInfo.currentMonthName} ({fiscalInfo.elapsedMonths} เดือน)
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              ยอด <strong className="text-amber-900">เบิกสะสม</strong> คำนวณตรงจากใบเบิกจ่ายที่อนุมัติแล้ว ({disbursedOrders.length} ใบ) | ใบที่ยกเลิก ({cancelledOrders.length} ใบ) ถูกตัดออกจากยอดสะสมอัตโนมัติ
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
              <Calculator className="w-3 h-3 text-indigo-600" />
              สูตรเฉลี่ยต่อเดือน: <code className="bg-white/80 px-1 py-0.2 rounded font-mono font-bold text-indigo-700">ยอดเบิกสะสม &divide; {selectedFiscalMonths} เดือน</code>
            </p>
          </div>
        </div>

        {/* Fiscal Month Count Selector */}
        <div className="flex items-center gap-2 shrink-0 bg-white/90 p-2 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-700">นับหารเฉลี่ย:</span>
          <select
            id="select-fiscal-months"
            value={selectedFiscalMonths}
            onChange={e => setSelectedFiscalMonths(Number(e.target.value))}
            className="text-xs font-bold py-1 px-2.5 rounded-lg border border-amber-300 bg-amber-50/70 text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
          >
            <option value={fiscalInfo.elapsedMonths}>
              {fiscalInfo.elapsedMonths} เดือน (ตามเดือนปัจจุบัน {fiscalInfo.currentMonthName})
            </option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
              <option key={m} value={m}>
                {m} เดือน {m === 12 ? '(ครบ 1 ปีงบประมาณ)' : m === 6 ? '(ครึ่งปีงบประมาณ)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Material Classification Stats Bar */}
      <MaterialStatsBar materials={synchronizedMaterials} onFilterUsage={(status) => setUsageFilter(status)} />

      {/* Filter and Metrics Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] text-slate-500 font-medium block">จำนวนรายการที่แสดง</span>
            <span className="text-xl font-bold font-mono text-slate-900">{filteredMaterials.length} รายการ</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] text-slate-500 font-medium block">จำนวนหน่วยคงเหลือรวม</span>
            <span className="text-xl font-bold font-mono text-indigo-700">{totalCurrentStockCount.toLocaleString()} หน่วย</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] text-slate-500 font-medium block">ยอดเบิกจ่ายสะสมรวม</span>
            <span className="text-xl font-bold font-mono text-amber-700">{totalDisbursedCount.toLocaleString()} หน่วย</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[11px] text-slate-500 font-medium block">มูลค่าคงคลังรวม</span>
            <span className="text-xl font-bold font-mono text-emerald-700">
              ฿{totalStockWorth.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex flex-col md:flex-row gap-3 pt-2 border-t border-slate-100">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="ค้นหาชื่อวัสดุ หรือ รหัส (1ก01, กระดาษ, แฟ้ม)..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50/70 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="text-xs p-2 rounded-lg border border-slate-200 bg-white cursor-pointer"
            >
              {categories.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="text-xs p-2 rounded-lg border border-slate-200 bg-white cursor-pointer"
            >
              <option value="ทั้งหมด">สถานะสต็อกทั้งหมด</option>
              <option value="OK">ปกติ (OK)</option>
              <option value="ใกล้หมด">ใกล้หมด (ต่ำกว่าขั้นต่ำ)</option>
              <option value="วัสดุหมด">วัสดุหมด (0)</option>
            </select>

            <select
              value={usageFilter}
              onChange={e => setUsageFilter(e.target.value)}
              className="text-xs p-2 rounded-lg border border-slate-200 bg-white cursor-pointer"
            >
              <option value="ทั้งหมด">ประเภทการใช้ทั้งหมด</option>
              <option value="ประจำ">ใช้ประจำ ({synchronizedMaterials.filter(m => m.usageStatus === 'ประจำ').length})</option>
              <option value="ครั้งคราว">ใช้ครั้งคราว ({synchronizedMaterials.filter(m => m.usageStatus === 'ครั้งคราว').length})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Comprehensive Report Table (With edit triggers, usage switcher, synced withdrawals, and fiscal monthly averages) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <th className="py-2.5 px-2.5 text-center">ลำดับ</th>
                <th className="py-2.5 px-2.5 text-center">รหัสวัสดุ</th>
                <th className="py-2.5 px-3">รูปภาพ</th>
                <th className="py-2.5 px-3">ชื่อวัสดุ</th>
                <th className="py-2.5 px-2.5">หมวดวัสดุ</th>
                <th className="py-2.5 px-2.5 text-right">ราคาซื้อ</th>
                {/* Requirement 1: จำนวนซื้อ (แก้ไขได้) */}
                <th className="py-2.5 px-2 text-center bg-amber-50/60 text-amber-900 border-x border-amber-200/50">
                  จำนวนซื้อ ✏️
                </th>
                {/* Requirement 1: หน่วยนับ (แก้ไขได้) */}
                <th className="py-2.5 px-2 text-center bg-amber-50/60 text-amber-900 border-r border-amber-200/50">
                  หน่วยนับ ✏️
                </th>
                {/* Requirement 1: ขั้นต่ำ-สูงสุด (แก้ไขได้) */}
                <th className="py-2.5 px-2 text-center bg-amber-50/60 text-amber-900">ขั้นต่ำ ✏️</th>
                <th className="py-2.5 px-2 text-center bg-amber-50/60 text-amber-900 border-r border-amber-200/50">สูงสุด ✏️</th>
                <th className="py-2.5 px-2.5 text-center">คงเหลือ</th>
                <th className="py-2.5 px-2.5 text-center">สถานะเติม</th>
                {/* Requirement 1: การใช้ (เปลี่ยนเป็น ประจำ / ครั้งคราว ได้) */}
                <th className="py-2.5 px-2.5 text-center bg-indigo-50/60 text-indigo-900 border-x border-indigo-200/50">
                  การใช้ 🔄
                </th>
                <th className="py-2.5 px-2.5 text-right">ราคาซื้อรวม</th>
                {/* Requirement 2: เบิกสะสม (อิงใบเบิกจ่าย ยกเลิกสัมพันธ์กัน) */}
                <th className="py-2.5 px-2 text-center bg-amber-50/80 text-amber-950 border-x border-amber-200">
                  เบิกสะสม 📋
                </th>
                {/* Requirement 3: เฉลี่ย/เดือน (นับตามปีงบประมาณทางการเงิน) */}
                <th className="py-2.5 px-2 text-center bg-indigo-50/80 text-indigo-950 border-r border-indigo-200">
                  เฉลี่ย/เดือน 📅
                </th>
                <th className="py-2.5 px-2.5 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMaterials.map((item, idx) => {
                const isOutOfStock = item.currentStock <= 0;
                const isLow = item.currentStock > 0 && item.currentStock <= item.minQty;
                const categoryColor = CATEGORY_COLORS[item.category] || {
                  bg: 'bg-slate-100 text-slate-700'
                };

                return (
                  <tr key={item.id} className="hover:bg-amber-50/30 transition-colors">
                    <td className="py-2 px-2.5 text-center text-slate-400">{idx + 1}</td>
                    <td className="py-2 px-2.5 text-center font-mono font-bold text-slate-800">
                      {item.id}
                    </td>
                    <td className="py-2 px-3">
                      <div
                        onClick={() => setQuickImageMaterial(item)}
                        className="relative group/img cursor-pointer w-9 h-9 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs flex items-center justify-center transition-all hover:ring-2 hover:ring-amber-500"
                        title="คลิกเพื่อเปลี่ยนรูปภาพพัสดุนี้"
                      >
                        <img
                          src={item.imageUrl || getMaterialImage(item.name, item.category)}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          onError={e => {
                            (e.currentTarget as HTMLImageElement).src = FALLBACK_MATERIAL_IMAGE;
                          }}
                          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity text-white">
                          <Camera className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </td>
                    <td className="py-2 px-3 font-medium text-slate-900 max-w-56">
                      <span
                        className="cursor-pointer hover:text-amber-700 hover:underline"
                        onClick={() => setEditingMaterial(item)}
                        title="คลิกเพื่อแก้ไขข้อมูลพัสดุนี้"
                      >
                        {item.name}
                      </span>
                    </td>
                    <td className="py-2 px-2.5 whitespace-nowrap">
                      <span className={`inline-block text-[10px] px-2 py-0.5 rounded-md ${categoryColor.bg}`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="py-2 px-2.5 text-right font-mono text-slate-700">
                      {item.unitPrice.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Requirement 1: จำนวนซื้อ (แก้ไขได้ - คลิกเพื่อแก้ไข) */}
                    <td
                      onClick={() => setEditingMaterial(item)}
                      className="py-2 px-2 text-center font-mono font-semibold text-slate-800 bg-amber-50/30 hover:bg-amber-100/60 cursor-pointer transition-colors border-x border-amber-100"
                      title="คลิกเพื่อแก้ไขจำนวนซื้อ"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>{item.purchaseQty || '-'}</span>
                        <Edit3 className="w-2.5 h-2.5 text-slate-400 opacity-0 group-hover:opacity-100" />
                      </div>
                    </td>

                    {/* Requirement 1: หน่วยนับ (แก้ไขได้ - คลิกเพื่อแก้ไข) */}
                    <td
                      onClick={() => setEditingMaterial(item)}
                      className="py-2 px-2 text-center text-slate-700 bg-amber-50/30 hover:bg-amber-100/60 cursor-pointer transition-colors border-r border-amber-100"
                      title="คลิกเพื่อแก้ไขหน่วยนับ"
                    >
                      <span>{item.unit}</span>
                    </td>

                    {/* Requirement 1: ขั้นต่ำ (แก้ไขได้) */}
                    <td
                      onClick={() => setEditingMaterial(item)}
                      className="py-2 px-2 text-center font-mono text-slate-600 bg-amber-50/30 hover:bg-amber-100/60 cursor-pointer transition-colors"
                      title="คลิกเพื่อแก้ไขจำนวนขั้นต่ำ"
                    >
                      <span>{item.minQty}</span>
                    </td>

                    {/* Requirement 1: สูงสุด (แก้ไขได้) */}
                    <td
                      onClick={() => setEditingMaterial(item)}
                      className="py-2 px-2 text-center font-mono text-slate-600 bg-amber-50/30 hover:bg-amber-100/60 cursor-pointer transition-colors border-r border-amber-100"
                      title="คลิกเพื่อแก้ไขจำนวนสูงสุด"
                    >
                      <span>{item.maxQty}</span>
                    </td>

                    {/* จำนวนคงเหลือ */}
                    <td className="py-2 px-2.5 text-center font-bold font-mono">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md ${
                          isOutOfStock
                            ? 'bg-rose-100 text-rose-800'
                            : isLow
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-50 text-emerald-800'
                        }`}
                      >
                        {item.currentStock}
                      </span>
                    </td>

                    {/* สถานะเติม */}
                    <td className="py-2 px-2.5 text-center whitespace-nowrap">
                      {isOutOfStock ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600">
                          <XCircle className="w-3 h-3" /> วัสดุหมด
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                          <AlertTriangle className="w-3 h-3" /> ใกล้หมด
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                          <CheckCircle2 className="w-3 h-3" /> OK
                        </span>
                      )}
                    </td>

                    {/* Requirement 1: การใช้ - สามารถคลิกเปลี่ยนเป็น 'ประจำ' ↔ 'ครั้งคราว' ได้ทันที */}
                    <td className="py-2 px-2 text-center whitespace-nowrap border-x border-indigo-100 bg-indigo-50/20">
                      <button
                        type="button"
                        onClick={() => handleToggleUsageStatus(item)}
                        className={`group px-2 py-1 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 transition-all cursor-pointer border shadow-2xs ${
                          item.usageStatus === 'ครั้งคราว'
                            ? 'bg-amber-100/80 border-amber-300 text-amber-900 hover:bg-amber-200'
                            : 'bg-indigo-100/80 border-indigo-300 text-indigo-900 hover:bg-indigo-200'
                        }`}
                        title={`คลิกเพื่อสลับเป็น "${item.usageStatus === 'ครั้งคราว' ? 'ประจำ' : 'ครั้งคราว'}"`}
                      >
                        <span>{item.usageStatus === 'ครั้งคราว' ? '⏱️ ครั้งคราว' : '📌 ประจำ'}</span>
                        <ArrowRightLeft className="w-2.5 h-2.5 text-slate-400 group-hover:text-slate-700 transition-transform" />
                      </button>
                    </td>

                    {/* ราคาซื้อรวม */}
                    <td className="py-2 px-2.5 text-right font-mono font-medium text-slate-800">
                      {(item.unitPrice * item.currentStock).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Requirement 2: เบิกสะสม - คำนวณตรงจากใบเบิกจ่ายที่อนุมัติแล้ว หากยกเลิกจะยกเลิกตาม */}
                    <td className="py-2 px-2 text-center font-mono font-bold text-amber-800 bg-amber-50/40 border-x border-amber-200">
                      <div className="flex flex-col items-center">
                        <span className="text-xs">{item.totalWithdrawn}</span>
                        <span className="text-[9px] text-slate-400 font-normal">{item.unit}</span>
                      </div>
                    </td>

                    {/* Requirement 3: เฉลี่ย/เดือน - คำนวณจากยอดเบิกสะสมตามเดือนปีงบประมาณทางการเงิน */}
                    <td className="py-2 px-2 text-center font-mono font-bold text-indigo-900 bg-indigo-50/40 border-r border-indigo-200">
                      <div className="flex flex-col items-center">
                        <span className="text-xs">{item.monthlyAverage}</span>
                        <span className="text-[9px] text-slate-400 font-normal">
                          {item.unit}/ด. ({item.totalWithdrawn} &divide; {selectedFiscalMonths})
                        </span>
                      </div>
                    </td>

                    {/* ปุ่มจัดการ: แก้ไขข้อมูล & ดูสมุดคุม */}
                    <td className="py-2 px-2 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingMaterial(item)}
                          className="p-1.5 rounded-lg text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
                          title={`แก้ไขข้อมูล ${item.name}`}
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>แก้ไข</span>
                        </button>

                        {onViewLedger && (
                          <button
                            type="button"
                            onClick={() => onViewLedger(item.id)}
                            className="p-1.5 rounded-lg text-slate-600 bg-slate-100 hover:bg-slate-200 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
                            title={`เปิดสมุดคุมบัญชี ${item.name}`}
                          >
                            <BookOpen className="w-3 h-3 text-slate-500" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredMaterials.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-xs">
            ไม่พบข้อมูลพัสดุคงเหลือตามเงื่อนไขที่เลือก
          </div>
        )}
      </div>

      {/* Edit Material Modal */}
      {editingMaterial && (
        <EditMaterialModal
          isOpen={Boolean(editingMaterial)}
          material={editingMaterial}
          onClose={() => setEditingMaterial(null)}
          onSave={handleSaveEditedMaterial}
        />
      )}

      {/* Quick Change Image Modal */}
      {quickImageMaterial && (
        <QuickChangeImageModal
          isOpen={Boolean(quickImageMaterial)}
          material={quickImageMaterial}
          onClose={() => setQuickImageMaterial(null)}
          onSaveImage={handleSaveMaterialImage}
        />
      )}

      {/* Add Material Modal */}
      {isAddModalOpen && onAddMaterial && (
        <AddMaterialModal
          isOpen={isAddModalOpen}
          existingMaterials={materials}
          onClose={() => setIsAddModalOpen(false)}
          onAddMaterial={newMat => {
            onAddMaterial(newMat);
            setIsAddModalOpen(false);
          }}
          onAdd={newMat => {
            onAddMaterial(newMat);
            setIsAddModalOpen(false);
          }}
        />
      )}

      {/* Confirm Action Modal */}
      {confirmConfig && (
        <ConfirmModal
          isOpen={true}
          title={confirmConfig.title}
          message={confirmConfig.message}
          details={confirmConfig.details}
          confirmText={confirmConfig.confirmText}
          variant={confirmConfig.variant}
          icon={confirmConfig.icon}
          onConfirm={confirmConfig.onConfirm}
          onClose={() => setConfirmConfig(null)}
        />
      )}
    </div>
  );
};
