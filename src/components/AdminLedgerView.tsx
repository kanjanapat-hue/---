import React, { useState, useMemo, useRef } from 'react';
import { MaterialItem, StockInRecord, StockOutRecord, RequisitionOrder } from '../types';
import { CATEGORY_COLORS } from '../data/materials';
import { MaterialStatsBar } from './MaterialStatsBar';
import { ConfirmModal } from './ConfirmModal';
import {
  BookOpen,
  Search,
  Printer,
  Download,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  Package,
  Layers,
  ChevronRight,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
  RotateCcw,
  CheckCircle2,
  Clock,
  Repeat,
  PlusCircle,
  HelpCircle
} from 'lucide-react';

interface AdminLedgerViewProps {
  materials: MaterialItem[];
  stockIns: StockInRecord[];
  stockOuts: StockOutRecord[];
  orders: RequisitionOrder[];
  initialSelectedId?: string;
  onNavigateToStockIn?: () => void;
  onNavigateToStockOut?: () => void;
  onReceiveAll20?: () => void;
  onResetAllStockToZero?: () => void;
}

interface LedgerEntry {
  id: string;
  date: string;
  docNo: string;
  type: 'BEGIN' | 'IN' | 'OUT';
  description: string;
  operator: string;
  unitPrice: number;
  inQty: number;
  inAmount: number;
  outQty: number;
  outAmount: number;
  balanceQty: number;
  balanceAmount: number;
  note?: string;
}

// Format Thai Date e.g. 2026-09-02 -> 2 ก.ย. 2569
export const formatThaiDate = (dateStr: string) => {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10) + 543;
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const months = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
      ];
      return `${day} ${months[monthIdx] || ''} ${year}`;
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543}`;
  } catch {
    return dateStr;
  }
};

export const AdminLedgerView: React.FC<AdminLedgerViewProps> = ({
  materials,
  stockIns,
  stockOuts,
  orders: _orders,
  initialSelectedId,
  onNavigateToStockIn: _onNavigateToStockIn,
  onNavigateToStockOut: _onNavigateToStockOut,
  onReceiveAll20,
  onResetAllStockToZero
}) => {
  const [viewMode, setViewMode] = useState<'individual' | 'summary'>('individual');
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>(
    initialSelectedId || (materials.length > 0 ? materials[0].id : '')
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ทั้งหมด');
  const [usageFilter, setUsageFilter] = useState<'ทั้งหมด' | 'ประจำ' | 'ครั้งคราว'>('ทั้งหมด');

  // Date Range Filter States
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Summary view specific states
  const [searchSummaryTerm, setSearchSummaryTerm] = useState('');
  const [summaryCategoryFilter, setSummaryCategoryFilter] = useState('ทั้งหมด');
  const [summaryUsageFilter, setSummaryUsageFilter] = useState<'ทั้งหมด' | 'ประจำ' | 'ครั้งคราว'>('ทั้งหมด');

  // Modal / Prompt confirmation for actions
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    details?: string;
    confirmText: string;
    variant: 'danger' | 'warning' | 'success' | 'info';
    icon: 'restore' | 'delete' | 'danger' | 'success' | 'warning';
    onConfirm: () => void;
  } | null>(null);

  const printAreaRef = useRef<HTMLDivElement>(null);

  // Categories list
  const categories = useMemo(() => {
    const list = Array.from(new Set(materials.map(m => m.category))).filter(Boolean);
    return ['ทั้งหมด', ...list];
  }, [materials]);

  // Selected Material Object
  const selectedMaterial = useMemo(() => {
    return materials.find(m => m.id === selectedMaterialId) || materials[0] || null;
  }, [materials, selectedMaterialId]);

  // Quick Date Range Presets
  const handleApplyPreset = (preset: 'all' | 'this_month' | 'last_month' | 'fiscal_2569' | 'last_7_days' | 'last_30_days') => {
    const today = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const toIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    } else if (preset === 'this_month') {
      // Month of September 2026 (or current)
      const yr = today.getFullYear();
      const m = today.getMonth();
      const firstDay = new Date(yr, m, 1);
      const lastDay = new Date(yr, m + 1, 0);
      setStartDate(toIso(firstDay));
      setEndDate(toIso(lastDay));
    } else if (preset === 'last_month') {
      const yr = today.getFullYear();
      const m = today.getMonth();
      const firstDay = new Date(yr, m - 1, 1);
      const lastDay = new Date(yr, m, 0);
      setStartDate(toIso(firstDay));
      setEndDate(toIso(lastDay));
    } else if (preset === 'fiscal_2569') {
      // Fiscal year 2569: 1 Oct 2025 to 30 Sep 2026
      setStartDate('2025-10-01');
      setEndDate('2026-09-30');
    } else if (preset === 'last_7_days') {
      const past = new Date(today);
      past.setDate(past.getDate() - 6);
      setStartDate(toIso(past));
      setEndDate(toIso(today));
    } else if (preset === 'last_30_days') {
      const past = new Date(today);
      past.setDate(past.getDate() - 29);
      setStartDate(toIso(past));
      setEndDate(toIso(today));
    }
  };

  // Filtered materials list for the selector
  const filteredMaterialsForSelect = useMemo(() => {
    return materials.filter(m => {
      const matchSearch =
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = categoryFilter === 'ทั้งหมด' || m.category === categoryFilter;
      const matchUsage = usageFilter === 'ทั้งหมด' || m.usageStatus === usageFilter;
      return matchSearch && matchCat && matchUsage;
    });
  }, [materials, searchTerm, categoryFilter, usageFilter]);

  // Build Chronological Ledger for the selected material with Date Range Filtering
  const ledgerCalculation = useMemo(() => {
    if (!selectedMaterial) {
      return {
        entries: [] as LedgerEntry[],
        openingQty: 0,
        openingAmount: 0,
        periodInQty: 0,
        periodInAmount: 0,
        periodOutQty: 0,
        periodOutAmount: 0,
        closingQty: 0,
        closingAmount: 0
      };
    }

    const matId = selectedMaterial.id;

    // Inflows and Outflows for this material
    const ins = stockIns.filter(it => it.materialId === matId);
    const outs = stockOuts.filter(it => it.materialId === matId);

    type RawEvent =
      | { type: 'IN'; data: StockInRecord }
      | { type: 'OUT'; data: StockOutRecord };

    const allEvents: RawEvent[] = [
      ...ins.map(i => ({ type: 'IN' as const, data: i })),
      ...outs.map(o => ({ type: 'OUT' as const, data: o }))
    ];

    // Sort chronologically by date
    allEvents.sort((a, b) => new Date(a.data.date).getTime() - new Date(b.data.date).getTime());

    // 1. Separate prior events (before startDate) from in-range events
    const priorEvents: RawEvent[] = [];
    const inRangeEvents: RawEvent[] = [];

    allEvents.forEach(evt => {
      const evtDate = evt.data.date;
      if (startDate && evtDate < startDate) {
        priorEvents.push(evt);
      } else if (!endDate || evtDate <= endDate) {
        inRangeEvents.push(evt);
      }
    });

    // 2. Calculate Opening Balance before startDate
    let priorInQty = 0;
    let priorInAmount = 0;
    let priorOutQty = 0;
    let priorOutAmount = 0;

    priorEvents.forEach(evt => {
      if (evt.type === 'IN') {
        priorInQty += evt.data.quantity;
        priorInAmount += evt.data.totalPrice;
      } else {
        priorOutQty += evt.data.quantity;
        priorOutAmount += evt.data.totalPrice;
      }
    });

    const openingQty = Math.max(0, priorInQty - priorOutQty);
    const openingAmount = Math.max(0, priorInAmount - priorOutAmount);

    let runningQty = openingQty;
    let runningAmount = openingAmount;

    const entries: LedgerEntry[] = [];

    // First Row: Opening Balance (ยอดยกมา)
    entries.push({
      id: `BEGIN-${matId}`,
      date: startDate || '2026-09-01',
      docNo: '-',
      type: 'BEGIN',
      description: startDate
        ? `ยอดยกมาก่อนวันที่ ${formatThaiDate(startDate)}`
        : 'ยอดยกมา (ต้นปีงบประมาณ 2569)',
      operator: 'ระบบพัสดุกลาง',
      unitPrice: selectedMaterial.unitPrice,
      inQty: 0,
      inAmount: 0,
      outQty: 0,
      outAmount: 0,
      balanceQty: runningQty,
      balanceAmount: runningAmount,
      note: startDate
        ? `คำนวณจากรายการก่อน ${formatThaiDate(startDate)} (รับ ${priorInQty}, จ่าย ${priorOutQty})`
        : 'เริ่มต้นนับรอบสต็อกปีงบประมาณ'
    });

    let periodInQty = 0;
    let periodInAmount = 0;
    let periodOutQty = 0;
    let periodOutAmount = 0;

    // Process in-range events
    inRangeEvents.forEach(evt => {
      if (evt.type === 'IN') {
        const item = evt.data;
        runningQty += item.quantity;
        runningAmount += item.totalPrice;
        periodInQty += item.quantity;
        periodInAmount += item.totalPrice;

        entries.push({
          id: item.id,
          date: item.date,
          docNo: item.docNo,
          type: 'IN',
          description: item.supplier ? `รับจาก: ${item.supplier}` : 'รับเข้าคลังพัสดุ',
          operator: item.receiverName || 'เจ้าหน้าที่พัสดุ',
          unitPrice: item.unitPrice,
          inQty: item.quantity,
          inAmount: item.totalPrice,
          outQty: 0,
          outAmount: 0,
          balanceQty: runningQty,
          balanceAmount: runningAmount,
          note: item.note || ''
        });
      } else {
        const item = evt.data;
        runningQty = Math.max(0, runningQty - item.quantity);
        runningAmount = Math.max(0, runningAmount - item.totalPrice);
        periodOutQty += item.quantity;
        periodOutAmount += item.totalPrice;

        entries.push({
          id: item.id,
          date: item.date,
          docNo: item.requisitionDocNo,
          type: 'OUT',
          description: `จ่ายให้: ${item.requesterName} (${item.department})`,
          operator: item.disburserName || 'เจ้าหน้าที่การเงินและพัสดุ',
          unitPrice: item.unitPrice,
          inQty: 0,
          inAmount: 0,
          outQty: item.quantity,
          outAmount: item.totalPrice,
          balanceQty: runningQty,
          balanceAmount: runningAmount,
          note: item.note || ''
        });
      }
    });

    return {
      entries,
      openingQty,
      openingAmount,
      periodInQty,
      periodInAmount,
      periodOutQty,
      periodOutAmount,
      closingQty: runningQty,
      closingAmount: runningAmount
    };
  }, [selectedMaterial, stockIns, stockOuts, startDate, endDate]);

  const { entries: ledgerEntries } = ledgerCalculation;

  // Summary of All Materials for the summary table (filtered by date range)
  const allMaterialsSummary = useMemo(() => {
    return materials.map(mat => {
      const allIns = stockIns.filter(i => i.materialId === mat.id);
      const allOuts = stockOuts.filter(o => o.materialId === mat.id);

      // Prior movements before startDate
      const priorIns = startDate ? allIns.filter(i => i.date < startDate) : [];
      const priorOuts = startDate ? allOuts.filter(o => o.date < startDate) : [];
      const priorInQty = priorIns.reduce((s, i) => s + i.quantity, 0);
      const priorOutQty = priorOuts.reduce((s, o) => s + o.quantity, 0);
      const openingStock = Math.max(0, priorInQty - priorOutQty);

      // In-range movements
      const ins = allIns.filter(
        i => (!startDate || i.date >= startDate) && (!endDate || i.date <= endDate)
      );
      const outs = allOuts.filter(
        o => (!startDate || o.date >= startDate) && (!endDate || o.date <= endDate)
      );

      const totalInQty = ins.reduce((sum, i) => sum + i.quantity, 0);
      const totalInCost = ins.reduce((sum, i) => sum + i.totalPrice, 0);
      const totalOutQty = outs.reduce((sum, o) => sum + o.quantity, 0);
      const totalOutCost = outs.reduce((sum, o) => sum + o.totalPrice, 0);

      // Current stock at end of the filtered range
      const endPeriodStock = Math.max(0, openingStock + totalInQty - totalOutQty);
      const currentValuation = endPeriodStock * mat.unitPrice;
      const movementCount = ins.length + outs.length;

      return {
        material: mat,
        openingStock,
        totalInQty,
        totalInCost,
        totalOutQty,
        totalOutCost,
        currentStock: endPeriodStock,
        currentValuation,
        movementCount
      };
    });
  }, [materials, stockIns, stockOuts, startDate, endDate]);

  // Filtered summary materials
  const filteredSummary = useMemo(() => {
    return allMaterialsSummary.filter(item => {
      const matchSearch =
        item.material.name.toLowerCase().includes(searchSummaryTerm.toLowerCase()) ||
        item.material.id.toLowerCase().includes(searchSummaryTerm.toLowerCase());
      const matchCat =
        summaryCategoryFilter === 'ทั้งหมด' || item.material.category === summaryCategoryFilter;
      const matchUsage =
        summaryUsageFilter === 'ทั้งหมด' || item.material.usageStatus === summaryUsageFilter;
      return matchSearch && matchCat && matchUsage;
    });
  }, [allMaterialsSummary, searchSummaryTerm, summaryCategoryFilter, summaryUsageFilter]);

  // Grand totals across all materials for the filtered date range
  const grandTotals = useMemo(() => {
    const totalInVal = allMaterialsSummary.reduce((acc, it) => acc + it.totalInCost, 0);
    const totalOutVal = allMaterialsSummary.reduce((acc, it) => acc + it.totalOutCost, 0);
    const totalStockVal = allMaterialsSummary.reduce((acc, it) => acc + it.currentValuation, 0);
    const totalActiveItems = allMaterialsSummary.filter(it => it.movementCount > 0).length;
    return { totalInVal, totalOutVal, totalStockVal, totalActiveItems };
  }, [allMaterialsSummary]);

  // Trigger browser print
  const handlePrint = () => {
    window.print();
  };

  // Export CSV for single material stock card
  const handleExportIndividualCsv = () => {
    if (!selectedMaterial) return;
    const headers = [
      'วัน เดือน ปี',
      'เลขที่เอกสาร',
      'รายการ / รับจากหรือจ่ายให้',
      'ราคาต่อหน่วย',
      'จำนวนรับ',
      'จำนวนเงินรับ',
      'จำนวนจ่าย',
      'จำนวนเงินจ่าย',
      'จำนวนคงเหลือ',
      'มูลค่าคงเหลือ',
      'ผู้ลงนาม/หมายเหตุ'
    ];

    const rows = ledgerEntries.map(entry => [
      entry.date,
      `"${entry.docNo}"`,
      `"${entry.description.replace(/"/g, '""')}"`,
      entry.unitPrice,
      entry.inQty || 0,
      entry.inAmount || 0,
      entry.outQty || 0,
      entry.outAmount || 0,
      entry.balanceQty,
      entry.balanceAmount,
      `"${(entry.note || entry.operator).replace(/"/g, '""')}"`
    ]);

    const dateRangeNote = startDate || endDate
      ? `# ช่วงเวลาที่เลือก: ${startDate || 'เริ่มต้น'} ถึง ${endDate || 'ปัจจุบัน'}\n`
      : '# ช่วงเวลา: ทั้งหมด\n';

    const csvContent = '\uFEFF' + dateRangeNote + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const rangeTag = startDate || endDate ? `_${startDate || 'start'}_to_${endDate || 'now'}` : '';
    link.setAttribute(
      'download',
      `สมุดคุมบัญชีพัสดุ_${selectedMaterial.id}_${selectedMaterial.name.substring(0, 15)}${rangeTag}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export CSV for all ledger summary
  const handleExportSummaryCsv = () => {
    const headers = [
      'รหัสพัสดุ',
      'ชื่อวัสดุ',
      'หมวดหมู่',
      'สถานะการใช้',
      'หน่วยนับ',
      'ราคาต่อหน่วย',
      'ยอดยกมา',
      'รวมรับเข้า (จำนวน)',
      'มูลค่ารับเข้ารวม (บาท)',
      'รวมจ่ายออก (จำนวน)',
      'มูลค่าจ่ายออกรวม (บาท)',
      'คงเหลือปลายงวด (จำนวน)',
      'มูลค่าคงคลังปลายงวด (บาท)',
      'จำนวนครั้งเคลื่อนไหว'
    ];

    const rows = allMaterialsSummary.map(item => [
      `"${item.material.id}"`,
      `"${item.material.name.replace(/"/g, '""')}"`,
      `"${item.material.category}"`,
      `"${item.material.usageStatus || 'ประจำ'}"`,
      `"${item.material.unit}"`,
      item.material.unitPrice,
      item.openingStock,
      item.totalInQty,
      item.totalInCost,
      item.totalOutQty,
      item.totalOutCost,
      item.currentStock,
      item.currentValuation,
      item.movementCount
    ]);

    const dateRangeNote = startDate || endDate
      ? `# ช่วงเวลาที่เลือก: ${startDate || 'เริ่มต้น'} ถึง ${endDate || 'ปัจจุบัน'}\n`
      : '# ช่วงเวลา: ทั้งหมด\n';

    const csvContent = '\uFEFF' + dateRangeNote + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const rangeTag = startDate || endDate ? `_${startDate || 'start'}_to_${endDate || 'now'}` : '';
    link.setAttribute('download', `สรุปสมุดคุมบัญชีพัสดุทั้งหมด_COPAG_MSU${rangeTag}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Global Inventory Usage Stats Banner (Requirement 3) */}
      <MaterialStatsBar
        materials={materials}
        activeUsageFilter={viewMode === 'individual' ? usageFilter : summaryUsageFilter}
        onFilterUsage={filter => {
          if (viewMode === 'individual') {
            setUsageFilter(filter);
          } else {
            setSummaryUsageFilter(filter);
          }
        }}
      />

      {/* 2. View Header & Mode Selector & Batch Action */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs print:hidden">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
            <BookOpen className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-mono">
                COPAG-LEDGER-2569
              </span>
              <span className="text-xs text-slate-500">
                วิทยาลัยการเมืองการปกครอง มหาวิทยาลัยมหาสารคาม
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
              <span>📒 สมุดคุมบัญชีพัสดุ (Material Control Ledger Card)</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              แบบบัญชีคุมพัสดุและสต็อกการ์ดตามระเบียบพัสดุภาครัฐ เลือกระบุช่วงวันเดือนปีแสดงผลได้ พร้อมคำนวณยอดยกมาและยอดคงเหลือต่อเนื่อง
            </p>
          </div>
        </div>

        {/* View mode toggle tabs & Batch Receive 20 */}
        <div className="flex flex-wrap items-center gap-2">
          {onReceiveAll20 && (
            <button
              id="btn-ledger-bulk-receive-20"
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
              className="px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-colors cursor-pointer shadow-2xs"
              title="รับเข้าวัสดุทุกรายการอย่างละ 20 หน่วย"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>รับเข้าทุกรายการ 20 หน่วย</span>
            </button>
          )}

          {onResetAllStockToZero && (
            <button
              id="btn-ledger-reset-stock-zero"
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
              className="px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer shadow-2xs"
              title="ลบจำนวนคงเหลือให้เป็น 0 ทุกรายการ"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
              <span>ลบจำนวนคงเหลือเป็น 0 ทุกรายการ</span>
            </button>
          )}

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
            <button
              id="btn-ledger-mode-individual"
              onClick={() => setViewMode('individual')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'individual'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-amber-600" />
              <span>สมุดคุมรายรายการ (Stock Card)</span>
            </button>
            <button
              id="btn-ledger-mode-summary"
              onClick={() => setViewMode('summary')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'summary'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
              <span>ภาพรวมสมุดคุมทุกรายการ</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. DATE RANGE FILTER TOOLBAR (Requirement 1) */}
      <div
        id="ledger-date-range-toolbar"
        className="bg-white rounded-2xl border border-amber-200/80 shadow-2xs p-4 print:hidden"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs">
              <Calendar className="w-4 h-4 text-amber-600" />
              <span>เลือกช่วงวันเดือนปีแสดงผล:</span>
            </div>

            {/* Start Date Input */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="ledger-start-date" className="text-xs text-slate-500 font-medium">
                ตั้งแต่:
              </label>
              <input
                id="ledger-start-date"
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-mono shadow-2xs"
              />
            </div>

            {/* End Date Input */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="ledger-end-date" className="text-xs text-slate-500 font-medium">
                ถึงวันที่:
              </label>
              <input
                id="ledger-end-date"
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-mono shadow-2xs"
              />
            </div>

            {/* Reset Dates */}
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={() => handleApplyPreset('all')}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                title="ล้างตัวกรองวันที่ทั้งหมด"
              >
                <RotateCcw className="w-3 h-3 text-slate-500" />
                <span>ล้างวันที่</span>
              </button>
            )}
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 text-[11px] mr-1">ทางลัด:</span>
            <button
              type="button"
              onClick={() => handleApplyPreset('all')}
              className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                !startDate && !endDate
                  ? 'bg-amber-600 text-white font-medium shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('this_month')}
              className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
            >
              เดือนนี้
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('last_month')}
              className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
            >
              เดือนที่แล้ว
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('fiscal_2569')}
              className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
            >
              ปีงบ 2569
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('last_7_days')}
              className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
            >
              7 วันล่าสุด
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('last_30_days')}
              className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
            >
              30 วันล่าสุด
            </button>
          </div>
        </div>

        {/* Date status indicator pill */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-medium">
              <Clock className="w-3 h-3 text-amber-600" />
              {startDate || endDate ? (
                <span>
                  ช่วงเวลาแสดงผล: <strong>{startDate ? formatThaiDate(startDate) : 'ตั้งแต่เริ่มต้น'}</strong>{' '}
                  ถึง <strong>{endDate ? formatThaiDate(endDate) : 'ปัจจุบัน'}</strong>
                </span>
              ) : (
                <span>ช่วงเวลาแสดงผล: ข้อมูลย้อนหลังทั้งหมด (ตั้งแต่เริ่มต้นรอบสต็อก)</span>
              )}
            </span>
          </div>

          <span className="text-[11px] text-slate-400">
            * ระบบจะคำนวณยอดยกมาก่อนวันที่เริ่มต้นอัตโนมัติเพื่อให้คงเหลือต่อเนื่องถูกต้องตามระเบียบ
          </span>
        </div>
      </div>

      {/* 4. KPI Overview Summary Banner for Filtered Period */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 block">รายการพัสดุในระบบ</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-900 font-mono">{materials.length}</span>
            <span className="text-xs text-slate-500">รายการ</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            เคลื่อนไหวในช่วงเวลานี้: {grandTotals.totalActiveItems} รายการ
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 block">
            {startDate || endDate ? 'มูลค่ารับเข้าในช่วงเวลา' : 'มูลค่ารับเข้ารวม'}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-emerald-600 font-mono">
              ฿{grandTotals.totalInVal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <span className="text-[11px] text-emerald-600 flex items-center gap-1 mt-1">
            <ArrowDownLeft className="w-3 h-3" /> รวมรับเข้า {allMaterialsSummary.reduce((s, it) => s + it.totalInQty, 0)} หน่วย
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 block">
            {startDate || endDate ? 'มูลค่าเบิกจ่ายในช่วงเวลา' : 'มูลค่าเบิกจ่ายรวม'}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-amber-600 font-mono">
              ฿{grandTotals.totalOutVal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <span className="text-[11px] text-amber-600 flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3 h-3" /> รวมเบิกจ่าย {allMaterialsSummary.reduce((s, it) => s + it.totalOutQty, 0)} หน่วย
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500 block">
            {endDate ? `มูลค่าคงคลัง ณ ${formatThaiDate(endDate)}` : 'มูลค่าคงคลังปัจจุบัน'}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-indigo-600 font-mono">
              ฿{grandTotals.totalStockVal.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            คำนวณตามราคาต่อหน่วยมาตรฐาน
          </span>
        </div>
      </div>

      {/* MODE 1: Individual Material Stock Card */}
      {viewMode === 'individual' && selectedMaterial && (
        <div className="space-y-6">
          {/* Material Selection Toolbar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4 print:hidden">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[300px]">
              {/* Category Filter */}
              <div className="w-40">
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white text-slate-700"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>
                      หมวด: {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Usage Status Filter (ทั้งหมด / ประจำ / ครั้งคราว) */}
              <div className="w-36">
                <select
                  value={usageFilter}
                  onChange={e => setUsageFilter(e.target.value as any)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white text-slate-700"
                >
                  <option value="ทั้งหมด">สถานะ: ทั้งหมด</option>
                  <option value="ประจำ">เฉพาะ: ใช้ประจำ</option>
                  <option value="ครั้งคราว">เฉพาะ: ใช้ครั้งคราว</option>
                </select>
              </div>

              {/* Material Dropdown */}
              <div className="flex-1 min-w-[240px]">
                <select
                  id="select-ledger-material"
                  value={selectedMaterialId}
                  onChange={e => setSelectedMaterialId(e.target.value)}
                  className="w-full text-xs p-2 font-semibold rounded-lg border border-amber-300 bg-amber-50/50 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                >
                  {filteredMaterialsForSelect.map(m => (
                    <option key={m.id} value={m.id}>
                      [{m.id}] {m.name} ({m.category} / {m.usageStatus || 'ประจำ'}) - คงเหลือ: {m.currentStock} {m.unit}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Search */}
              <div className="relative w-44">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="ค้นหารหัสหรือชื่อ..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                />
              </div>
            </div>

            {/* Actions for current card */}
            <div className="flex items-center gap-2">
              <button
                id="btn-print-ledger-card"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>พิมพ์สมุดคุม (A4)</span>
              </button>
              <button
                id="btn-export-ledger-csv"
                onClick={handleExportIndividualCsv}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>ส่งออก CSV</span>
              </button>
            </div>
          </div>

          {/* Printable Official Government Stock Card Sheet */}
          <div
            ref={printAreaRef}
            className="bg-white rounded-2xl border border-slate-300 shadow-sm p-8 print:p-0 print:border-none print:shadow-none print:m-0"
          >
            {/* Formal Header */}
            <div className="text-center border-b-2 border-slate-800 pb-4 mb-6">
              <h2 className="text-lg font-bold text-slate-900 tracking-wide font-sans">
                สมุดคุมบัญชีพัสดุ / บัญชีคุมวัสดุ (Material Control Ledger Card)
              </h2>
              <p className="text-xs font-semibold text-slate-700 mt-1">
                วิทยาลัยการเมืองการปกครอง มหาวิทยาลัยมหาสารคาม
              </p>
              <p className="text-[11px] text-slate-500">
                ประจำปีงบประมาณ พ.ศ. 2569 (ฝ่ายบริหารงานทั่วไปและงานการเงินพัสดุ)
              </p>
              {startDate || endDate ? (
                <div className="inline-block mt-1 px-3 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-medium">
                  ช่วงเวลาแสดงผล: {startDate ? formatThaiDate(startDate) : 'ตั้งแต่เริ่มต้น'} ถึง{' '}
                  {endDate ? formatThaiDate(endDate) : 'ปัจจุบัน'}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 mt-0.5">
                  ช่วงเวลาแสดงผล: ข้อมูลย้อนหลังทั้งหมด (All Time)
                </p>
              )}
            </div>

            {/* Material Specification Grid (Standard Gov Format) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl mb-6 text-xs text-slate-800">
              <div>
                <span className="text-slate-500 block text-[11px]">ชื่อหรือชนิดพัสดุ:</span>
                <span className="font-bold text-sm text-slate-900">{selectedMaterial.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">รหัสพัสดุ:</span>
                <span className="font-mono font-bold text-amber-700">{selectedMaterial.id}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">ประเภท/หมวดหมู่วัสดุ:</span>
                <span className="font-semibold">{selectedMaterial.category}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">สถานะการใช้งาน:</span>
                <span
                  className={`inline-block font-semibold px-2 py-0.5 rounded text-[11px] ${
                    selectedMaterial.usageStatus === 'ครั้งคราว'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {selectedMaterial.usageStatus === 'ครั้งคราว' ? '⏳ ใช้ครั้งคราว' : '🔄 ใช้ประจำ'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">หน่วยนับ:</span>
                <span className="font-semibold text-slate-900">{selectedMaterial.unit}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">ราคาต่อหน่วยมาตรฐาน:</span>
                <span className="font-mono font-semibold">
                  ฿{selectedMaterial.unitPrice.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">สถานที่เก็บ/คลัง:</span>
                <span className="font-medium">ห้องพัสดุ ชั้น 1 อาคารวิทยาลัยการเมืองการปกครอง</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">เกณฑ์สำรอง (Min - Max):</span>
                <span className="font-mono font-semibold text-slate-700">
                  {selectedMaterial.minQty} - {selectedMaterial.maxQty} {selectedMaterial.unit}
                </span>
              </div>
            </div>

            {/* Official Material Ledger Card Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse border border-slate-300">
                <thead>
                  {/* Row 1: Header groupings */}
                  <tr className="bg-slate-200 text-slate-900 font-semibold border-b border-slate-300 text-center">
                    <th rowSpan={2} className="py-2.5 px-2 border-r border-slate-300 w-24">
                      วัน เดือน ปี
                    </th>
                    <th rowSpan={2} className="py-2.5 px-2 border-r border-slate-300 w-28">
                      เลขที่เอกสาร
                    </th>
                    <th rowSpan={2} className="py-2.5 px-3 border-r border-slate-300 text-left">
                      รายการ / รับจากหรือจ่ายให้
                    </th>
                    <th rowSpan={2} className="py-2.5 px-2 border-r border-slate-300 w-20 text-center">
                      ประเภท
                    </th>
                    <th rowSpan={2} className="py-2.5 px-2 border-r border-slate-300 w-20 text-right">
                      ราคาหน่วย
                    </th>
                    <th colSpan={2} className="py-1.5 px-2 border-r border-slate-300 bg-emerald-100/70 text-emerald-900">
                      รับ (Inflow)
                    </th>
                    <th colSpan={2} className="py-1.5 px-2 border-r border-slate-300 bg-amber-100/70 text-amber-900">
                      จ่าย (Outflow)
                    </th>
                    <th colSpan={2} className="py-1.5 px-2 border-r border-slate-300 bg-blue-100/70 text-blue-900">
                      คงเหลือ (Balance)
                    </th>
                    <th rowSpan={2} className="py-2.5 px-3 w-40 text-left">
                      ผู้ลงนาม / หมายเหตุ
                    </th>
                  </tr>
                  {/* Row 2: Sub-columns */}
                  <tr className="bg-slate-100 text-slate-800 font-medium border-b border-slate-300 text-center text-[11px]">
                    <th className="py-1.5 px-2 border-r border-slate-300 bg-emerald-50/50 w-16">
                      จำนวน
                    </th>
                    <th className="py-1.5 px-2 border-r border-slate-300 bg-emerald-50/50 w-20 text-right">
                      จำนวนเงิน
                    </th>
                    <th className="py-1.5 px-2 border-r border-slate-300 bg-amber-50/50 w-16">
                      จำนวน
                    </th>
                    <th className="py-1.5 px-2 border-r border-slate-300 bg-amber-50/50 w-20 text-right">
                      จำนวนเงิน
                    </th>
                    <th className="py-1.5 px-2 border-r border-slate-300 bg-blue-50/50 w-16">
                      จำนวน
                    </th>
                    <th className="py-1.5 px-2 border-r border-slate-300 bg-blue-50/50 w-20 text-right">
                      จำนวนเงิน
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {ledgerEntries.map((entry, idx) => {
                    const isBegin = entry.type === 'BEGIN';
                    const isIn = entry.type === 'IN';
                    const isOut = entry.type === 'OUT';

                    return (
                      <tr
                        key={`${entry.id}-${idx}`}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isBegin ? 'bg-slate-50/90 font-medium' : ''
                        }`}
                      >
                        {/* Date */}
                        <td className="py-2 px-2 text-center border-r border-slate-200 font-mono text-[11px]">
                          {formatThaiDate(entry.date)}
                        </td>

                        {/* Document No */}
                        <td className="py-2 px-2 text-center border-r border-slate-200 font-mono text-[11px] text-slate-700">
                          {entry.docNo}
                        </td>

                        {/* Description */}
                        <td className="py-2 px-3 border-r border-slate-200 text-slate-900">
                          <span className={isBegin ? 'font-semibold text-slate-800' : ''}>
                            {entry.description}
                          </span>
                        </td>

                        {/* Event Badge */}
                        <td className="py-2 px-2 text-center border-r border-slate-200">
                          {isBegin && (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-slate-200 text-slate-800 font-medium">
                              ยอดยกมา
                            </span>
                          )}
                          {isIn && (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-medium">
                              รับเข้า
                            </span>
                          )}
                          {isOut && (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-medium">
                              เบิกจ่าย
                            </span>
                          )}
                        </td>

                        {/* Unit Price */}
                        <td className="py-2 px-2 text-right border-r border-slate-200 font-mono text-slate-700">
                          {entry.unitPrice.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </td>

                        {/* Inflow */}
                        <td className="py-2 px-2 text-center border-r border-slate-200 font-mono font-bold text-emerald-700 bg-emerald-50/20">
                          {entry.inQty > 0 ? entry.inQty : '-'}
                        </td>
                        <td className="py-2 px-2 text-right border-r border-slate-200 font-mono text-emerald-800 bg-emerald-50/20">
                          {entry.inAmount > 0
                            ? entry.inAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })
                            : '-'}
                        </td>

                        {/* Outflow */}
                        <td className="py-2 px-2 text-center border-r border-slate-200 font-mono font-bold text-amber-700 bg-amber-50/20">
                          {entry.outQty > 0 ? entry.outQty : '-'}
                        </td>
                        <td className="py-2 px-2 text-right border-r border-slate-200 font-mono text-amber-800 bg-amber-50/20">
                          {entry.outAmount > 0
                            ? entry.outAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })
                            : '-'}
                        </td>

                        {/* Running Balance */}
                        <td className="py-2 px-2 text-center border-r border-slate-200 font-mono font-bold text-blue-900 bg-blue-50/30">
                          {entry.balanceQty}
                        </td>
                        <td className="py-2 px-2 text-right border-r border-slate-200 font-mono font-bold text-blue-900 bg-blue-50/30">
                          {entry.balanceAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </td>

                        {/* Remarks */}
                        <td className="py-2 px-3 text-slate-600 text-[11px]">
                          {entry.note || entry.operator || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  {/* Totals Summary Footer */}
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-300 text-slate-900 text-xs">
                    <td colSpan={5} className="py-2.5 px-3 text-right border-r border-slate-300">
                      {startDate || endDate ? 'สรุปยอดช่วงเวลาที่เลือก:' : 'รวมสะสมทั้งสิ้น:'}
                    </td>
                    <td className="py-2.5 px-2 text-center border-r border-slate-300 font-mono text-emerald-800">
                      {ledgerCalculation.periodInQty}
                    </td>
                    <td className="py-2.5 px-2 text-right border-r border-slate-300 font-mono text-emerald-800">
                      ฿{ledgerCalculation.periodInAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-2 text-center border-r border-slate-300 font-mono text-amber-800">
                      {ledgerCalculation.periodOutQty}
                    </td>
                    <td className="py-2.5 px-2 text-right border-r border-slate-300 font-mono text-amber-800">
                      ฿{ledgerCalculation.periodOutAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-2 text-center border-r border-slate-300 font-mono text-blue-900 bg-blue-100/50">
                      {ledgerCalculation.closingQty}
                    </td>
                    <td className="py-2.5 px-2 text-right border-r border-slate-300 font-mono text-blue-900 bg-blue-100/50">
                      ฿{ledgerCalculation.closingAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-500">
                      {startDate || endDate ? 'ยอดคงเหลือปลายงวด' : 'ยอดคงเหลือปัจจุบัน'}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Official Signature Blocks (ตามระเบียบพัสดุทางราชการ) */}
            <div className="grid grid-cols-2 gap-8 mt-12 pt-6 text-center text-xs text-slate-800">
              <div className="space-y-8">
                <p>ลงชื่อ ........................................................... ผู้ควบคุมพัสดุ</p>
                <div className="space-y-1">
                  <p className="font-semibold">(...........................................................)</p>
                  <p className="text-slate-500 text-[11px]">เจ้าหน้าที่งานการเงินและพัสดุ</p>
                  <p className="text-slate-500 text-[11px]">วันที่ ........ เดือน .................... พ.ศ. ...........</p>
                </div>
              </div>
              <div className="space-y-8">
                <p>ลงชื่อ ........................................................... หัวหน้าหน่วยงาน/ผู้มีอำนาจ</p>
                <div className="space-y-1">
                  <p className="font-semibold">(...........................................................)</p>
                  <p className="text-slate-500 text-[11px]">รองคณบดีฝ่ายบริหาร หรือผู้ได้รับมอบหมาย</p>
                  <p className="text-slate-500 text-[11px]">วันที่ ........ เดือน .................... พ.ศ. ...........</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: Master Summary Table Across All Materials */}
      {viewMode === 'summary' && (
        <div className="space-y-4">
          {/* Summary Search & Export Toolbar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4 print:hidden">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[300px]">
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อ หรือ รหัสวัสดุ..."
                  value={searchSummaryTerm}
                  onChange={e => setSearchSummaryTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                />
              </div>

              <div className="w-44">
                <select
                  value={summaryCategoryFilter}
                  onChange={e => setSummaryCategoryFilter(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white text-slate-700"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>
                      หมวด: {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-36">
                <select
                  value={summaryUsageFilter}
                  onChange={e => setSummaryUsageFilter(e.target.value as any)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white text-slate-700"
                >
                  <option value="ทั้งหมด">สถานะ: ทั้งหมด</option>
                  <option value="ประจำ">เฉพาะ: ใช้ประจำ</option>
                  <option value="ครั้งคราว">เฉพาะ: ใช้ครั้งคราว</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-export-all-ledger-csv"
                onClick={handleExportSummaryCsv}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>ส่งออกตารางสรุปสมุดคุม CSV</span>
              </button>
            </div>
          </div>

          {/* All Ledger Master Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="py-2.5 px-2.5 text-center">ลำดับ</th>
                    <th className="py-2.5 px-2.5 text-center">รหัสพัสดุ</th>
                    <th className="py-2.5 px-3">ชื่อพัสดุ/วัสดุ</th>
                    <th className="py-2.5 px-2.5">หมวดหมู่</th>
                    <th className="py-2.5 px-2 text-center">สถานะ</th>
                    <th className="py-2.5 px-2 text-center">หน่วย</th>
                    <th className="py-2.5 px-2.5 text-right">ราคาหน่วย</th>
                    {startDate && (
                      <th className="py-2.5 px-2 text-center bg-slate-200/60 text-slate-800">ยอดยกมา</th>
                    )}
                    <th className="py-2.5 px-2 text-center bg-emerald-50/60 text-emerald-900">รวมรับเข้า</th>
                    <th className="py-2.5 px-2.5 text-right bg-emerald-50/60 text-emerald-900">มูลค่ารับ (฿)</th>
                    <th className="py-2.5 px-2 text-center bg-amber-50/60 text-amber-900">รวมเบิกจ่าย</th>
                    <th className="py-2.5 px-2.5 text-right bg-amber-50/60 text-amber-900">มูลค่าจ่าย (฿)</th>
                    <th className="py-2.5 px-2.5 text-center bg-blue-50/60 text-blue-900 font-bold">ยอดคงเหลือ</th>
                    <th className="py-2.5 px-2.5 text-right bg-blue-50/60 text-blue-900 font-bold">มูลค่าคงคลัง (฿)</th>
                    <th className="py-2.5 px-2.5 text-center">การเคลื่อนไหว</th>
                    <th className="py-2.5 px-3 text-center">ดูสมุดคุม</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSummary.map((item, idx) => {
                    const categoryColor = CATEGORY_COLORS[item.material.category] || {
                      bg: 'bg-slate-100 text-slate-700'
                    };

                    return (
                      <tr key={item.material.id} className="hover:bg-slate-50/80">
                        <td className="py-2 px-2.5 text-center text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-2 px-2.5 text-center font-mono font-bold text-slate-800">
                          {item.material.id}
                        </td>
                        <td className="py-2 px-3 font-medium text-slate-900 max-w-64">
                          {item.material.name}
                        </td>
                        <td className="py-2 px-2.5 whitespace-nowrap">
                          <span className={`inline-block text-[10px] px-2 py-0.5 rounded-md ${categoryColor.bg}`}>
                            {item.material.category}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-center whitespace-nowrap">
                          <span
                            className={`inline-block text-[10px] px-1.5 py-0.5 rounded font-medium ${
                              item.material.usageStatus === 'ครั้งคราว'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {item.material.usageStatus === 'ครั้งคราว' ? 'ครั้งคราว' : 'ประจำ'}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-center text-slate-600">{item.material.unit}</td>
                        <td className="py-2 px-2.5 text-right font-mono text-slate-700">
                          {item.material.unitPrice.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </td>

                        {startDate && (
                          <td className="py-2 px-2 text-center font-mono text-slate-700 bg-slate-50">
                            {item.openingStock}
                          </td>
                        )}

                        {/* Total In */}
                        <td className="py-2 px-2 text-center font-mono font-bold text-emerald-700 bg-emerald-50/20">
                          {item.totalInQty}
                        </td>
                        <td className="py-2 px-2.5 text-right font-mono text-emerald-700 bg-emerald-50/20">
                          {item.totalInCost.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </td>

                        {/* Total Out */}
                        <td className="py-2 px-2 text-center font-mono font-bold text-amber-700 bg-amber-50/20">
                          {item.totalOutQty}
                        </td>
                        <td className="py-2 px-2.5 text-right font-mono text-amber-700 bg-amber-50/20">
                          {item.totalOutCost.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </td>

                        {/* Current Stock */}
                        <td className="py-2 px-2.5 text-center font-mono font-bold text-blue-900 bg-blue-50/30">
                          {item.currentStock}
                        </td>
                        <td className="py-2 px-2.5 text-right font-mono font-bold text-blue-900 bg-blue-50/30">
                          {item.currentValuation.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </td>

                        {/* Movements */}
                        <td className="py-2 px-2.5 text-center font-mono text-slate-500">
                          {item.movementCount > 0 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {item.movementCount} รายการ
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* Action Link to Individual Card */}
                        <td className="py-2 px-3 text-center">
                          <button
                            onClick={() => {
                              setSelectedMaterialId(item.material.id);
                              setViewMode('individual');
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer border border-amber-200 shadow-2xs"
                          >
                            <span>เปิดสมุดคุม</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                    <td colSpan={startDate ? 8 : 7} className="py-3 px-3 text-right">
                      ยอดรวมทั้งสิ้น ({filteredSummary.length} รายการ):
                    </td>
                    <td className="py-3 px-2 text-center font-mono text-emerald-800">
                      {filteredSummary.reduce((s, it) => s + it.totalInQty, 0)}
                    </td>
                    <td className="py-3 px-2.5 text-right font-mono text-emerald-800">
                      ฿{filteredSummary.reduce((s, it) => s + it.totalInCost, 0).toLocaleString('th-TH', {
                        minimumFractionDigits: 2
                      })}
                    </td>
                    <td className="py-3 px-2 text-center font-mono text-amber-800">
                      {filteredSummary.reduce((s, it) => s + it.totalOutQty, 0)}
                    </td>
                    <td className="py-3 px-2.5 text-right font-mono text-amber-800">
                      ฿{filteredSummary.reduce((s, it) => s + it.totalOutCost, 0).toLocaleString('th-TH', {
                        minimumFractionDigits: 2
                      })}
                    </td>
                    <td className="py-3 px-2.5 text-center font-mono text-blue-900 bg-blue-100/50">
                      {filteredSummary.reduce((s, it) => s + it.currentStock, 0)}
                    </td>
                    <td className="py-3 px-2.5 text-right font-mono text-blue-900 bg-blue-100/50">
                      ฿{filteredSummary.reduce((s, it) => s + it.currentValuation, 0).toLocaleString('th-TH', {
                        minimumFractionDigits: 2
                      })}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
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
