import React, { useState, useMemo } from 'react';
import { RequisitionOrder, MaterialItem, UserProfile } from '../types';
import { EditRequisitionModal } from './EditRequisitionModal';
import { ConfirmModal } from './ConfirmModal';
import {
  FileText,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  Eye,
  AlertTriangle,
  Send,
  Building2,
  UserCheck,
  PackageCheck,
  Filter,
  FileEdit,
  RotateCcw,
  Trash2
} from 'lucide-react';

interface AdminRequisitionsViewProps {
  orders: RequisitionOrder[];
  materials: MaterialItem[];
  currentUser: UserProfile;
  onApproveAndDisburse: (
    orderId: string,
    approvedQuantities: Record<string, number>,
    approverNote: string
  ) => void;
  onRejectOrder: (orderId: string, reason: string) => void;
  onViewPrintForm: (order: RequisitionOrder) => void;
  onEditOrder?: (orderId: string, updatedData: {
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
  onCancelDisbursement?: (orderId: string) => void;
  onDeleteOrder?: (orderId: string) => void;
}

export const AdminRequisitionsView: React.FC<AdminRequisitionsViewProps> = ({
  orders,
  materials,
  currentUser,
  onApproveAndDisburse,
  onRejectOrder,
  onViewPrintForm,
  onEditOrder,
  onCancelDisbursement,
  onDeleteOrder,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('รออนุมัติ'); // Default to pending to highlight actionable orders
  const [selectedOrder, setSelectedOrder] = useState<RequisitionOrder | null>(null);
  const [editingOrder, setEditingOrder] = useState<RequisitionOrder | null>(null);
  const [confirmCancelOrder, setConfirmCancelOrder] = useState<RequisitionOrder | null>(null);
  const [confirmDeleteOrder, setConfirmDeleteOrder] = useState<RequisitionOrder | null>(null);
  const [approvedQuantities, setApprovedQuantities] = useState<Record<string, number>>({});
  const [approverNote, setApproverNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectPrompt, setShowRejectPrompt] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Material lookup map for instant current stock check
  const materialMap = useMemo(() => {
    const map = new Map<string, MaterialItem>();
    materials.forEach(m => map.set(m.id, m));
    return map;
  }, [materials]);

  // Orders filtered by search and status
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchSearch =
        order.docNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(it => it.name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus =
        statusFilter === 'ทั้งหมด' ||
        (statusFilter === 'รออนุมัติ' && order.status === 'รออนุมัติ') ||
        (statusFilter === 'เบิกจ่ายแล้ว' && (order.status === 'เบิกจ่ายแล้ว' || order.status === 'อนุมัติแล้ว')) ||
        (statusFilter === 'ยกเลิก' && order.status === 'ยกเลิก');

      return matchSearch && matchStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const pending = orders.filter(o => o.status === 'รออนุมัติ').length;
    const disbursed = orders.filter(o => o.status === 'เบิกจ่ายแล้ว' || o.status === 'อนุมัติแล้ว').length;
    const rejected = orders.filter(o => o.status === 'ยกเลิก').length;
    const totalAmount = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    return {
      total: orders.length,
      pending,
      disbursed,
      rejected,
      totalAmount
    };
  }, [orders]);

  // Open modal for approval
  const handleOpenReview = (order: RequisitionOrder) => {
    setSelectedOrder(order);
    setShowRejectPrompt(false);
    setRejectReason('');
    setApproverNote('');
    // Initialize approved quantities to requested quantities (or clamped by current stock)
    const initialQtys: Record<string, number> = {};
    order.items.forEach(it => {
      const mat = materialMap.get(it.materialId);
      const stock = mat ? mat.currentStock : 0;
      // Default approved qty is requestedQty
      initialQtys[it.materialId] = it.approvedQty !== undefined ? it.approvedQty : Math.min(it.requestedQty, Math.max(0, stock));
    });
    setApprovedQuantities(initialQtys);
  };

  // Submit Approval & Stock Disbursement
  const handleConfirmDisbursement = () => {
    if (!selectedOrder) return;

    // Check if any items have invalid quantities
    for (const item of selectedOrder.items) {
      const approvedQty = approvedQuantities[item.materialId] ?? item.requestedQty;
      const mat = materialMap.get(item.materialId);
      const stock = mat ? mat.currentStock : 0;

      if (approvedQty > stock) {
        alert(
          `ไม่สามารถเบิกจ่ายได้: วัสดุ "${item.name}" ขอเบิก ${approvedQty} ${item.unit} แต่วัสดุในคลังมีคงเหลือเพียง ${stock} ${item.unit}`
        );
        return;
      }
    }

    setIsProcessing(true);
    try {
      onApproveAndDisburse(selectedOrder.id, approvedQuantities, approverNote);
      setSelectedOrder(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // Submit Rejection
  const handleConfirmReject = () => {
    if (!selectedOrder) return;
    if (!rejectReason.trim()) {
      alert('กรุณาระบุเหตุผลการไม่อนุมัติหรือยกเลิกใบขอเบิก');
      return;
    }

    setIsProcessing(true);
    try {
      onRejectOrder(selectedOrder.id, rejectReason.trim());
      setSelectedOrder(null);
      setShowRejectPrompt(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              รายการคำขอเบิกพัสดุและอนุมัติเบิกจ่าย
            </h2>
            {stats.pending > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                รออนุมัติ {stats.pending} ใบ
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            รวมรายการคำขอเบิกพัสดุจากอาจารย์และบุคลากร ให้เจ้าหน้าที่พัสดุเป็นผู้อนุมัติและตัดจ่ายวัสดุออกจากคลัง
          </p>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => setStatusFilter('ทั้งหมด')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'ทั้งหมด'
              ? 'bg-white border-slate-900 ring-2 ring-slate-900/10 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">ใบขอเบิกทั้งหมด</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-2">{stats.total}</p>
          <p className="text-[11px] text-slate-500 mt-1">มูลค่ารวม ฿{stats.totalAmount.toLocaleString()}</p>
        </button>

        <button
          onClick={() => setStatusFilter('รออนุมัติ')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'รออนุมัติ'
              ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-amber-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800">รออนุมัติ / รอตัดจ่าย</span>
            <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-2xl font-bold font-mono text-amber-900">{stats.pending}</p>
            {stats.pending > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-200 text-amber-800 rounded-md">
                ต้องดำเนินการ
              </span>
            )}
          </div>
          <p className="text-[11px] text-amber-700 mt-1">วัสดุยังไม่ถูกตัดออกจากระบบ</p>
        </button>

        <button
          onClick={() => setStatusFilter('เบิกจ่ายแล้ว')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'เบิกจ่ายแล้ว'
              ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-emerald-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800">อนุมัติและเบิกจ่ายแล้ว</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-900 mt-2">{stats.disbursed}</p>
          <p className="text-[11px] text-emerald-700 mt-1">ตัดจ่ายสต็อกและลงบัญชีแล้ว</p>
        </button>

        <button
          onClick={() => setStatusFilter('ยกเลิก')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'ยกเลิก'
              ? 'bg-rose-50/80 border-rose-500 ring-2 ring-rose-500/20 shadow-xs'
              : 'bg-white border-slate-200 hover:border-rose-300 shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-800">ไม่อนุมัติ / ยกเลิก</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-rose-900 mt-2">{stats.rejected}</p>
          <p className="text-[11px] text-rose-700 mt-1">คืนสิทธิ์ ไม่กระทบสต็อก</p>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-orders"
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="ค้นหาเลขที่ใบเบิก, ผู้ขอเบิก, หน่วยงาน, หรือวัตถุประสงค์..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            <span className="text-slate-500 px-2 flex items-center gap-1 font-medium">
              <Filter className="w-3 h-3" /> สถานะ:
            </span>
            <button
              onClick={() => setStatusFilter('ทั้งหมด')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                statusFilter === 'ทั้งหมด' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ทั้งหมด ({stats.total})
            </button>
            <button
              onClick={() => setStatusFilter('รออนุมัติ')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                statusFilter === 'รออนุมัติ' ? 'bg-amber-600 text-white shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รออนุมัติ ({stats.pending})
            </button>
            <button
              onClick={() => setStatusFilter('เบิกจ่ายแล้ว')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                statusFilter === 'เบิกจ่ายแล้ว' ? 'bg-emerald-600 text-white shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              เบิกจ่ายแล้ว ({stats.disbursed})
            </button>
            <button
              onClick={() => setStatusFilter('ยกเลิก')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                statusFilter === 'ยกเลิก' ? 'bg-rose-600 text-white shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ยกเลิก ({stats.rejected})
            </button>
          </div>
        </div>
      </div>

      {/* Orders List / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <FileText className="w-12 h-12 mx-auto opacity-30" />
            <p className="text-sm font-medium">ไม่พบใบขอเบิกพัสดุในหมวดหมู่นี้</p>
            {statusFilter !== 'ทั้งหมด' && (
              <button
                onClick={() => setStatusFilter('ทั้งหมด')}
                className="text-xs text-amber-700 hover:underline font-semibold mt-1 inline-block"
              >
                ดูใบขอเบิกทั้งหมด
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredOrders.map(order => {
              const isPending = order.status === 'รออนุมัติ';
              const isDisbursed = order.status === 'เบิกจ่ายแล้ว' || order.status === 'อนุมัติแล้ว';
              const isRejected = order.status === 'ยกเลิก';

              // Check if any item in this order has insufficient stock
              const hasInsufficientStock = order.items.some(item => {
                const mat = materialMap.get(item.materialId);
                return !mat || mat.currentStock < item.requestedQty;
              });

              return (
                <div
                  key={order.id}
                  className={`p-5 transition-colors ${
                    isPending ? 'bg-amber-50/20 hover:bg-amber-50/40' : 'hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Document Info & Requester */}
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-bold text-amber-800 bg-amber-100/70 border border-amber-200 px-2.5 py-0.5 rounded-lg">
                          {order.docNo}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          วันที่ยื่นขอเบิก: {order.date}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isPending
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : isDisbursed
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                        >
                          {isPending && <Clock className="w-3 h-3 text-amber-700 animate-pulse" />}
                          {isDisbursed && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {isRejected && <XCircle className="w-3 h-3 text-rose-600" />}
                          {order.status}
                        </span>

                        {isPending && hasInsufficientStock && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            มีรายการสต็อกไม่พอ
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          {order.requesterName}{' '}
                          <span className="text-xs font-normal text-slate-500">
                            ({order.requesterPosition || 'บุคลากร'})
                          </span>
                        </h4>
                        <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          หน่วยงาน/สาขาวิชา: <span className="font-medium text-slate-700">{order.department}</span>
                        </p>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs text-slate-700">
                        <span className="font-semibold text-slate-800">วัตถุประสงค์ในการเบิก:</span>{' '}
                        {order.purpose}
                      </div>

                      {order.approverName && (
                        <p className="text-[11px] text-slate-500">
                          ผู้อนุมัติ/จ่ายพัสดุ: <span className="font-medium text-slate-700">{order.approverName}</span>
                          {order.disbursedDate && ` (เมื่อ ${order.disbursedDate})`}
                        </p>
                      )}
                    </div>

                    {/* Right: Items Summary & Action Buttons */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                      <div className="text-left lg:text-right">
                        <span className="text-xs text-slate-500 block">จำนวนวัสดุที่ขอเบิก</span>
                        <span className="text-lg font-bold font-mono text-slate-900">
                          {order.items.length} รายการ
                        </span>
                        <span className="text-xs text-slate-500 block font-mono">
                          มูลค่ารวม ฿{order.totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {isPending ? (
                          <button
                            id={`btn-review-order-${order.id}`}
                            onClick={() => handleOpenReview(order)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                          >
                            <PackageCheck className="w-4 h-4" />
                            ตรวจสอบและอนุมัติเบิกจ่าย
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenReview(order)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            ดูรายละเอียด
                          </button>
                        )}

                        <button
                          id={`btn-print-order-${order.id}`}
                          onClick={() => onViewPrintForm(order)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer"
                          title="พิมพ์แบบใบเบิกพัสดุ (PDF)"
                        >
                          <Printer className="w-3.5 h-3.5 text-slate-600" />
                          พิมพ์ใบเบิก
                        </button>

                        {onEditOrder && (
                          <button
                            onClick={() => setEditingOrder(order)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer"
                            title="แก้ไขรายการพัสดุและวัตถุประสงค์"
                          >
                            <FileEdit className="w-3.5 h-3.5 text-amber-700" />
                            แก้ไขใบเบิก
                          </button>
                        )}

                        {(order.status === 'เบิกจ่ายแล้ว' || order.status === 'อนุมัติแล้ว') && onCancelDisbursement && (
                          <button
                            id={`btn-cancel-disbursement-${order.id}`}
                            onClick={() => setConfirmCancelOrder(order)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer"
                            title="ยกเลิกการเบิกจ่ายและคืนสต็อกเข้าคลัง"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                            ยกเลิกการเบิก (คืนสต็อก)
                          </button>
                        )}

                        {onDeleteOrder && (
                          <button
                            id={`btn-delete-order-${order.id}`}
                            onClick={() => setConfirmDeleteOrder(order)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer"
                            title="ลบใบขอเบิกนี้ออกจากระบบ"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            ลบใบขอเบิก
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Preview of Items */}
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="flex flex-wrap gap-2">
                      {order.items.map((item, idx) => {
                        const mat = materialMap.get(item.materialId);
                        const stock = mat ? mat.currentStock : 0;
                        const isStockLow = stock < item.requestedQty;

                        return (
                          <div
                            key={idx}
                            className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs border ${
                              isPending && isStockLow
                                ? 'bg-rose-50 border-rose-200 text-rose-800'
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <span className="font-mono text-[10px] text-slate-500 font-semibold">
                              {item.materialId}
                            </span>
                            <span className="font-medium text-slate-900">{item.name}</span>
                            <span className="font-mono font-bold text-amber-700">
                              {item.requestedQty} {item.unit}
                            </span>
                            {isPending && (
                              <span
                                className={`text-[10px] font-semibold px-1 rounded ${
                                  isStockLow
                                    ? 'bg-rose-200 text-rose-900'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                คงคลัง {stock}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review & Approval Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full my-8 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-linear-to-r from-amber-700 via-amber-800 to-yellow-800 text-white flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-amber-200 uppercase tracking-wider block">
                  วิทยาลัยการเมืองการปกครอง มหาวิทยาลัยมหาสารคาม
                </span>
                <h3 className="text-lg font-bold flex items-center gap-2 mt-0.5">
                  <PackageCheck className="w-5 h-5 text-amber-300" />
                  พิจารณาอนุมัติและเบิกจ่ายวัสดุ: {selectedOrder.docNo}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs sm:text-sm">
              {/* Order Metadata Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-xs text-slate-500 block">ผู้ขอเบิก</span>
                  <p className="font-bold text-slate-900 text-sm">
                    {selectedOrder.requesterName} ({selectedOrder.requesterPosition || 'บุคลากร'})
                  </p>
                  <p className="text-xs text-slate-600">{selectedOrder.requesterEmail}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">หน่วยงาน / ภาควิชา</span>
                  <p className="font-semibold text-slate-800">{selectedOrder.department}</p>
                  <span className="text-xs text-slate-500 block mt-1">วันที่ยื่นขอเบิก: {selectedOrder.date}</span>
                </div>
                <div className="sm:col-span-2 pt-2 border-t border-slate-200">
                  <span className="text-xs font-semibold text-slate-600 block">วัตถุประสงค์ในการเบิก:</span>
                  <p className="text-slate-800 mt-0.5 bg-white p-2.5 rounded-lg border border-slate-200">
                    {selectedOrder.purpose}
                  </p>
                </div>
              </div>

              {/* Items Verification Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <span>รายการวัสดุที่ขอเบิก</span>
                    <span className="text-xs font-normal text-slate-500">
                      (ตรวจสอบสต็อกคงเหลือจริง และกำหนดจำนวนจ่าย)
                    </span>
                  </h4>
                  <span className="text-xs text-slate-500">
                    รวม {selectedOrder.items.length} รายการ
                  </span>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                        <th className="py-2.5 px-3">ลำดับ</th>
                        <th className="py-2.5 px-3">รหัส/ชื่อวัสดุ</th>
                        <th className="py-2.5 px-3 text-center">คงเหลือในคลัง</th>
                        <th className="py-2.5 px-3 text-center">จำนวนที่ขอ</th>
                        <th className="py-2.5 px-3 text-center">จำนวนอนุมัติจ่าย</th>
                        <th className="py-2.5 px-3 text-right">ราคาต่อหน่วย</th>
                        <th className="py-2.5 px-3 text-right">รวมเงิน (บ.)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedOrder.items.map((item, idx) => {
                        const mat = materialMap.get(item.materialId);
                        const currentStock = mat ? mat.currentStock : 0;
                        const approvedQty = approvedQuantities[item.materialId] ?? item.requestedQty;
                        const isOutOfStock = currentStock <= 0;
                        const isInsufficient = currentStock < approvedQty;

                        return (
                          <tr
                            key={idx}
                            className={
                              isInsufficient ? 'bg-rose-50/50' : 'hover:bg-slate-50'
                            }
                          >
                            <td className="py-2.5 px-3 text-slate-400 font-mono text-center">{idx + 1}</td>
                            <td className="py-2.5 px-3">
                              <span className="font-mono text-[10px] text-slate-500 font-semibold block">
                                {item.materialId}
                              </span>
                              <span className="font-medium text-slate-900">{item.name}</span>
                              <span className="text-[11px] text-slate-500 block">หมวด: {item.category}</span>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span
                                className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                                  isOutOfStock
                                    ? 'bg-rose-100 text-rose-800'
                                    : currentStock < item.requestedQty
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {currentStock} {item.unit}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700">
                              {item.requestedQty} {item.unit}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {selectedOrder.status === 'รออนุมัติ' ? (
                                <div className="flex items-center justify-center gap-1">
                                  <input
                                    type="number"
                                    min="0"
                                    max={currentStock}
                                    value={approvedQty}
                                    onChange={e => {
                                      const val = Math.max(0, parseInt(e.target.value) || 0);
                                      setApprovedQuantities(prev => ({
                                        ...prev,
                                        [item.materialId]: val
                                      }));
                                    }}
                                    className="w-16 px-2 py-1 text-center font-mono font-bold border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs"
                                  />
                                  <span className="text-slate-500 text-xs">{item.unit}</span>
                                </div>
                              ) : (
                                <span className="font-mono font-bold text-emerald-700">
                                  {item.approvedQty ?? item.requestedQty} {item.unit}
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                              ฿{item.unitPrice.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                              ฿{(item.unitPrice * approvedQty).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Disbursement / Approval Notes */}
              {selectedOrder.status === 'รออนุมัติ' && (
                <div className="space-y-3 bg-amber-50/50 p-4 rounded-xl border border-amber-200">
                  <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs">
                    <UserCheck className="w-4 h-4 text-amber-700" />
                    <span>ข้อมูลการอนุมัติและผู้จ่ายพัสดุ</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">
                        ชื่อเจ้าหน้าที่ผู้อนุมัติและเบิกจ่าย:
                      </label>
                      <input
                        type="text"
                        defaultValue={currentUser.name}
                        disabled
                        className="w-full p-2 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">
                        หมายเหตุ / ข้อความถึงผู้ขอเบิก:
                      </label>
                      <input
                        type="text"
                        value={approverNote}
                        onChange={e => setApproverNote(e.target.value)}
                        placeholder="เช่น อนุมัติเบิกจ่ายครบตามจำนวน, มารับได้ที่ห้องพัสดุ..."
                        className="w-full p-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs focus:ring-2 focus:ring-amber-500 outline-none"
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-amber-800">
                    💡 <strong>คำแนะนำ:</strong> เมื่อกด "อนุมัติและตัดจ่ายวัสดุออกจากระบบ" ระบบจะทำการหักสต็อกคงคลังจริงทันที พร้อมบันทึกประวัติการเบิกจ่ายและลงรายการในสมุดคุมบัญชี (Stock Card) โดยอัตโนมัติ
                  </p>
                </div>
              )}

              {/* Rejection Prompt Box */}
              {showRejectPrompt && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-rose-800 font-semibold text-xs">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>ระบุเหตุผลในการไม่อนุมัติ / ยกเลิกใบขอเบิกนี้:</span>
                  </div>
                  <textarea
                    rows={2}
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    placeholder="เช่น วัสดุในคลังหมดชั่วคราว, วัตถุประสงค์ไม่ตรงตามระเบียบ, หรือโครงการได้รับจัดสรรงบประมาณแยกแล้ว..."
                    className="w-full text-xs p-2.5 rounded-lg border border-rose-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowRejectPrompt(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmReject}
                      disabled={isProcessing}
                      className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
                    >
                      ยืนยันไม่อนุมัติใบขอเบิก
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  onViewPrintForm(selectedOrder);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                พิมพ์แบบใบเบิกพัสดุ (PDF)
              </button>

              <div className="flex items-center gap-2">
                {onDeleteOrder && (
                  <button
                    type="button"
                    onClick={() => {
                      const ord = selectedOrder;
                      setSelectedOrder(null);
                      setConfirmDeleteOrder(ord);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer mr-2"
                  >
                    <Trash2 className="w-4 h-4 text-rose-600" />
                    ลบใบขอเบิกนี้
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-xl cursor-pointer"
                >
                  ปิดหน้าต่าง
                </button>

                {(selectedOrder.status === 'เบิกจ่ายแล้ว' || selectedOrder.status === 'อนุมัติแล้ว') && onCancelDisbursement && (
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmCancelOrder(selectedOrder);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 text-rose-600" />
                    ยกเลิกการเบิก (คืนสต็อกเข้าคลัง)
                  </button>
                )}

                {selectedOrder.status === 'รออนุมัติ' && !showRejectPrompt && (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowRejectPrompt(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                    >
                      <XCircle className="w-4 h-4 text-rose-600" />
                      ไม่อนุมัติ / ปฏิเสธ
                    </button>

                    <button
                      id="btn-confirm-disburse-stock"
                      type="button"
                      disabled={isProcessing}
                      onClick={handleConfirmDisbursement}
                      className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      อนุมัติและตัดจ่ายวัสดุออกจากระบบ
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Requisition Modal */}
      {editingOrder && (
        <EditRequisitionModal
          order={editingOrder}
          materials={materials}
          isOpen={true}
          onClose={() => setEditingOrder(null)}
          onSave={(orderId, updatedData) => {
            if (onEditOrder) {
              onEditOrder(orderId, updatedData);
            }
            setEditingOrder(null);
          }}
        />
      )}

      {/* Confirm Cancel Disbursement Modal */}
      {confirmCancelOrder && onCancelDisbursement && (
        <ConfirmModal
          isOpen={true}
          title="ยืนยันยกเลิกการเบิกและคืนสต็อกพัสดุ"
          message={`ต้องการยกเลิกการเบิกจ่ายใบเบิกเลขที่ ${confirmCancelOrder.docNo} ใช่หรือไม่?`}
          details={`• ผู้ขอเบิก: ${confirmCancelOrder.requesterName} (${confirmCancelOrder.department})\n• รายการพัสดุ: ${confirmCancelOrder.items.length} รายการ (มูลค่ารวม ฿${confirmCancelOrder.totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })})\n• ผลลัพธ์: ระบบจะคืนจำนวนพัสดุทุกรายการกลับเข้าสู่คลังทันที และปรับสถานะใบเบิกเป็น "ยกเลิก"`}
          confirmText="ยืนยันยกเลิก (คืนสต็อก)"
          variant="danger"
          icon="restore"
          onConfirm={() => {
            onCancelDisbursement(confirmCancelOrder.id);
            if (selectedOrder && selectedOrder.id === confirmCancelOrder.id) {
              setSelectedOrder(null);
            }
            setConfirmCancelOrder(null);
          }}
          onClose={() => setConfirmCancelOrder(null)}
        />
      )}

      {/* Confirm Delete Order Modal */}
      {confirmDeleteOrder && onDeleteOrder && (
        <ConfirmModal
          isOpen={true}
          title="ยืนยันการลบใบขอเบิกพัสดุ"
          message={`ต้องการลบใบขอเบิกเลขที่ ${confirmDeleteOrder.docNo} ออกจากระบบใช่หรือไม่?`}
          details={`• ผู้ขอเบิก: ${confirmDeleteOrder.requesterName} (${confirmDeleteOrder.department})\n• วัตถุประสงค์: ${confirmDeleteOrder.purpose}\n• รายการพัสดุ: ${confirmDeleteOrder.items.length} รายการ (มูลค่ารวม ฿${confirmDeleteOrder.totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })})\n• สถานะปัจจุบัน: ${confirmDeleteOrder.status}\n${confirmDeleteOrder.status === 'เบิกจ่ายแล้ว' || confirmDeleteOrder.status === 'อนุมัติแล้ว' ? '• หมายเหตุ: เนื่องจากใบเบิกนี้เบิกจ่ายแล้ว ระบบจะคืนยอดพัสดุกลับเข้าคลังให้โดยอัตโนมัติ' : '• การกระทำนี้จะลบใบขอเบิกออกจากฐานข้อมูลอย่างถาวร'}`}
          confirmText="ยืนยันลบใบขอเบิก"
          variant="danger"
          icon="delete"
          onConfirm={() => {
            onDeleteOrder(confirmDeleteOrder.id);
            if (selectedOrder && selectedOrder.id === confirmDeleteOrder.id) {
              setSelectedOrder(null);
            }
            setConfirmDeleteOrder(null);
          }}
          onClose={() => setConfirmDeleteOrder(null)}
        />
      )}
    </div>
  );
};
