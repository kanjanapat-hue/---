import React, { useMemo } from 'react';
import { MaterialItem, RequisitionOrder, StockInRecord, StockOutRecord } from '../types';
import { MaterialStatsBar } from './MaterialStatsBar';
import {
  TrendingUp,
  Package,
  AlertTriangle,
  FileText,
  DollarSign,
  BarChart3,
  Calendar,
  BookOpen
} from 'lucide-react';

interface AdminDashboardViewProps {
  materials: MaterialItem[];
  orders: RequisitionOrder[];
  stockIns: StockInRecord[];
  stockOuts: StockOutRecord[];
  onNavigateTab: (tab: 'inventory' | 'stockout' | 'stockin' | 'ledger' | 'requisitions') => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  materials,
  orders,
  stockIns,
  stockOuts,
  onNavigateTab,
}) => {
  // Statistics Calculations
  const totalStockValue = useMemo(() => {
    return materials.reduce((sum, item) => sum + item.unitPrice * item.currentStock, 0);
  }, [materials]);

  const outOfStockItems = useMemo(() => {
    return materials.filter(m => m.currentStock <= 0);
  }, [materials]);

  const lowStockItems = useMemo(() => {
    return materials.filter(m => m.currentStock > 0 && m.currentStock <= m.minQty);
  }, [materials]);

  const totalDisbursedThisMonth = useMemo(() => {
    return stockOuts.reduce((sum, item) => sum + item.totalPrice, 0);
  }, [stockOuts]);

  const totalStockInValue = useMemo(() => {
    return stockIns.reduce((sum, item) => sum + item.totalPrice, 0);
  }, [stockIns]);

  // Category Breakdown
  const categoryStats = useMemo(() => {
    const map: Record<string, { count: number; totalStock: number; value: number }> = {};
    materials.forEach(m => {
      if (!map[m.category]) {
        map[m.category] = { count: 0, totalStock: 0, value: 0 };
      }
      map[m.category].count += 1;
      map[m.category].totalStock += m.currentStock;
      map[m.category].value += m.unitPrice * m.currentStock;
    });
    return Object.entries(map).sort((a, b) => b[1].value - a[1].value);
  }, [materials]);

  return (
    <div className="space-y-6">
      {/* Welcome Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">แดชบอร์ดภาพรวมพัสดุและวัสดุ</h2>
          <p className="text-sm text-slate-500 mt-1">
            วิทยาลัยการเมืองการปกครอง มหาวิทยาลัยมหาสารคาม (ข้อมูลซิงค์กับ Google Sheet)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            id="dashboard-btn-ledger"
            onClick={() => onNavigateTab('ledger')}
            className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-200 transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-600" />
            <span>สมุดคุมบัญชีพัสดุ</span>
          </button>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
            <Calendar className="w-3.5 h-3.5 text-amber-600" />
            ปีงบประมาณ 2570
          </div>
        </div>
      </div>

      {/* Material Classification Statistics Bar */}
      <MaterialStatsBar materials={materials} onFilterUsage={() => onNavigateTab('inventory')} />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Stock Value */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">มูลค่าพัสดุคงคลังรวม</span>
            <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold font-mono text-slate-900">
              ฿{totalStockValue.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-500 mt-1">จากพัสดุทั้งหมด {materials.length} รายการ</p>
          </div>
        </div>

        {/* Total Disbursed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">มูลค่าเบิกจ่ายสะสม</span>
            <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold font-mono text-slate-900">
              ฿{totalDisbursedThisMonth.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-500 mt-1">บันทึกเบิกจ่าย {stockOuts.length} รายการ</p>
          </div>
        </div>

        {/* Total Stock In */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">มูลค่ารับเข้าพัสดุ</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold font-mono text-slate-900">
              ฿{totalStockInValue.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-500 mt-1">รับเข้าคลัง {stockIns.length} ล็อต</p>
          </div>
        </div>

        {/* Attention Items (Out of stock / Low) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">พัสดุที่ต้องจัดซื้อเติม</span>
            <div className="p-2.5 bg-rose-50 text-rose-700 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <div>
              <span className="text-2xl font-bold text-rose-600 font-mono">{outOfStockItems.length}</span>
              <span className="text-xs text-slate-500 ml-1">รายการหมด</span>
            </div>
            <div className="border-l border-slate-200 pl-3">
              <span className="text-lg font-bold text-amber-600 font-mono">{lowStockItems.length}</span>
              <span className="text-xs text-slate-500 ml-1">ใกล้หมด</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Category Stock Value & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Breakdown Table */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-slate-900 text-sm">การกระจายตัวตามหมวดหมู่พัสดุ</h3>
            </div>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 cursor-pointer"
            >
              ดูรายละเอียดพัสดุคงเหลือ →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 font-medium pb-2">
                  <th className="py-2.5">หมวดหมู่วัสดุ</th>
                  <th className="py-2.5 text-center">จำนวนรายการ</th>
                  <th className="py-2.5 text-center">คงเหลือรวม</th>
                  <th className="py-2.5 text-right">มูลค่าคงคลัง (บ.)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categoryStats.map(([cat, stats]) => (
                  <tr key={cat} className="hover:bg-slate-50">
                    <td className="py-2.5 font-medium text-slate-800">{cat}</td>
                    <td className="py-2.5 text-center text-slate-600">{stats.count}</td>
                    <td className="py-2.5 text-center font-mono text-slate-700">{stats.totalStock.toLocaleString()}</td>
                    <td className="py-2.5 text-right font-mono font-medium text-slate-900">
                      ฿{stats.value.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Warning Box */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-sm">รายการพัสดุใกล้หมดคลัง / หมด</h3>
              </div>
              <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                {outOfStockItems.length + lowStockItems.length} รายการ
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              ควรเปิดใบสั่งซื้อ (รับเข้า 💸) เพื่อไม่ให้กระทบการปฏิบัติงานของอาจารย์และเจ้าหน้าที่
            </p>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {[...outOfStockItems, ...lowStockItems].slice(0, 8).map(item => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-slate-500 font-semibold">{item.id}</span>
                      <p className="font-medium text-slate-900 truncate">{item.name}</p>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      หมวด: {item.category} | ขั้นต่ำ: {item.minQty} {item.unit}
                    </span>
                  </div>
                  <span
                    className={`shrink-0 font-bold px-2 py-0.5 rounded-md text-[11px] ${
                      item.currentStock <= 0
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    คงเหลือ {item.currentStock} {item.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 flex gap-2">
            <button
              id="btn-nav-stockin"
              onClick={() => onNavigateTab('stockin')}
              className="flex-1 py-2 text-center text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer"
            >
              + บันทึกรับเข้าพัสดุ (💸 รับเข้า)
            </button>
            <button
              id="btn-nav-stockout"
              onClick={() => onNavigateTab('stockout')}
              className="flex-1 py-2 text-center text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors cursor-pointer"
            >
              บันทึกเบิกจ่าย (💰 เบิกจ่าย)
            </button>
          </div>
        </div>
      </div>

      {/* Recent Requisition Orders List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">ประวัติใบเบิกพัสดุล่าสุด</h3>
            {orders.some(o => o.status === 'รออนุมัติ') && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                มี {orders.filter(o => o.status === 'รออนุมัติ').length} ใบรออนุมัติ
              </span>
            )}
          </div>
          <button
            id="btn-goto-requisitions"
            onClick={() => onNavigateTab('requisitions')}
            className="text-xs font-semibold text-amber-700 hover:text-amber-800 cursor-pointer flex items-center gap-1"
          >
            ไปที่หน้ารวมใบขอเบิก / อนุมัติเบิกจ่ายพัสดุ ({orders.length}) →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
                <th className="py-2.5 px-3">เลขที่ใบเบิก</th>
                <th className="py-2.5 px-3">วันที่</th>
                <th className="py-2.5 px-3">ผู้ขอเบิก</th>
                <th className="py-2.5 px-3">หน่วยงาน</th>
                <th className="py-2.5 px-3 text-center">จำนวนรายการ</th>
                <th className="py-2.5 px-3 text-right">มูลค่ารวม (บ.)</th>
                <th className="py-2.5 px-3 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono font-medium text-amber-700">{order.docNo}</td>
                  <td className="py-2.5 px-3 text-slate-600">{order.date}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-900">{order.requesterName}</td>
                  <td className="py-2.5 px-3 text-slate-600">{order.department}</td>
                  <td className="py-2.5 px-3 text-center font-mono">{order.items.length} รายการ</td>
                  <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-900">
                    ฿{order.totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        order.status === 'เบิกจ่ายแล้ว'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
