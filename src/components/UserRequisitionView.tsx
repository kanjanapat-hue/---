import React, { useState, useMemo } from 'react';
import { MaterialItem, RequisitionCartItem, RequisitionOrder, UserProfile } from '../types';
import { CATEGORY_COLORS, getMaterialImage } from '../data/materials';
import { FALLBACK_MATERIAL_IMAGE } from '../utils/imageHelper';
import { MaterialStatsBar } from './MaterialStatsBar';
import { EditRequisitionModal } from './EditRequisitionModal';
import { ConfirmModal } from './ConfirmModal';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Send,
  AlertCircle,
  Package,
  Layers,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  Printer,
  History,
  Info,
  FileEdit,
  Ban
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface UserRequisitionViewProps {
  materials: MaterialItem[];
  user: UserProfile;
  orders?: RequisitionOrder[];
  onSubmitOrder: (cart: RequisitionCartItem[], purpose: string) => void;
  onRequestRestockNotice?: (material: MaterialItem) => void;
  onViewPrintForm?: (order: RequisitionOrder) => void;
  onCancelOrder?: (orderId: string) => void;
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
}

export const UserRequisitionView: React.FC<UserRequisitionViewProps> = ({
  materials,
  user,
  orders = [],
  onSubmitOrder,
  onViewPrintForm,
  onCancelOrder,
  onEditOrder,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ทั้งหมด');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [usageFilter, setUsageFilter] = useState<string>('ทั้งหมด');
  const [cart, setCart] = useState<RequisitionCartItem[]>([]);
  const [purpose, setPurpose] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'catalog' | 'cart' | 'history'>('catalog');
  const [submittedDocNo, setSubmittedDocNo] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<RequisitionOrder | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<RequisitionOrder | null>(null);

  // User's own orders
  const myOrders = useMemo(() => {
    return orders.filter(
      o => o.requesterEmail?.toLowerCase() === user.email?.toLowerCase() || o.requesterName === user.name
    );
  }, [orders, user]);

  const pendingMyOrders = useMemo(() => {
    return myOrders.filter(o => o.status === 'รออนุมัติ');
  }, [myOrders]);

  // Categories list
  const categories = useMemo(() => {
    const list = Array.from(new Set(materials.map(m => m.category))).filter(Boolean);
    return ['ทั้งหมด', ...list];
  }, [materials]);

  // Filtered materials
  const filteredMaterials = useMemo(() => {
    return materials.filter(item => {
      const matchSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedCategory === 'ทั้งหมด' || item.category === selectedCategory;
      const matchStock = !onlyInStock || item.currentStock > 0;
      const matchUsage = usageFilter === 'ทั้งหมด' || item.usageStatus === usageFilter;
      return matchSearch && matchCat && matchStock && matchUsage;
    });
  }, [materials, searchTerm, selectedCategory, onlyInStock, usageFilter]);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartPrice = cart.reduce(
    (sum, item) => sum + item.material.unitPrice * item.quantity,
    0
  );

  const handleAddToCart = (material: MaterialItem) => {
    if (material.currentStock <= 0) return;

    setCart(prev => {
      const existing = prev.find(i => i.material.id === material.id);
      if (existing) {
        if (existing.quantity >= material.currentStock) return prev;
        return prev.map(i =>
          i.material.id === material.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { material, quantity: 1 }];
    });
  };

  const handleUpdateQty = (materialId: string, delta: number) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.material.id === materialId) {
            const nextQty = item.quantity + delta;
            if (nextQty <= 0) return null;
            if (nextQty > item.material.currentStock) return item;
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter((item): item is RequisitionCartItem => item !== null)
    );
  };

  const handleSetQty = (materialId: string, qty: number) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.material.id === materialId) {
            if (qty <= 0) return null;
            const validQty = Math.min(qty, item.material.currentStock);
            return { ...item, quantity: validQty };
          }
          return item;
        })
        .filter((item): item is RequisitionCartItem => item !== null)
    );
  };

  const handleRemoveFromCart = (materialId: string) => {
    setCart(prev => prev.filter(i => i.material.id !== materialId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!purpose.trim()) {
      alert('กรุณาระบุวัตถุประสงค์เพื่อใช้ในงาน/โครงการ');
      return;
    }

    setIsSubmitting(true);
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      onSubmitOrder(cart, purpose);
      setCart([]);
      setPurpose('');
      setActiveTab('history');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome Bar */}
      <div className="bg-linear-to-r from-amber-600 via-amber-700 to-yellow-700 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-xs mb-2">
            วิทยาลัยการเมืองการปกครอง (COPAG) มหาวิทยาลัยมหาสารคาม
          </span>
          <h2 className="text-2xl font-bold tracking-tight">ระบบเบิกจ่ายพัสดุและวัสดุออนไลน์</h2>
          <p className="text-amber-100 text-sm mt-1 max-w-2xl">
            ผู้ขอเบิก: <span className="font-semibold text-white">{user.name}</span> ({user.email}) | หน่วยงาน: {user.department}
          </p>
        </div>

        {/* View Switch / Cart / History Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            id="btn-switch-catalog"
            onClick={() => setActiveTab('catalog')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'catalog'
                ? 'bg-white text-amber-900 shadow-sm'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            รายการวัสดุ
          </button>

          <button
            id="btn-switch-cart"
            onClick={() => setActiveTab('cart')}
            className={`relative px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'cart'
                ? 'bg-white text-amber-900 shadow-sm'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>ตะกร้าเบิก</span>
            {totalCartCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full shadow-xs">
                {totalCartCount}
              </span>
            )}
          </button>

          <button
            id="btn-switch-history"
            onClick={() => setActiveTab('history')}
            className={`relative px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-white text-amber-900 shadow-sm'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>ประวัติคำขอเบิก</span>
            {pendingMyOrders.length > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold text-amber-900 bg-amber-200 rounded-full border border-amber-300">
                {pendingMyOrders.length} รออนุมัติ
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Requisition Process Workflow Notice */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>ขั้นตอนการขอเบิกพัสดุ:</strong> 1. เลือกวัสดุใส่ตะกร้าและระบุวัตถุประสงค์ &rarr; 2. ส่งคำขอเบิก (ระบบจะแจ้งเตือนไปยังเจ้าหน้าที่พัสดุ/แอดมิน) &rarr; 3. เจ้าหน้าที่พัสดุตรวจสอบ อนุมัติ และตัดจ่ายวัสดุออกจากคลัง &rarr; 4. ผู้ขอเบิกมารับพัสดุได้ตามระเบียบ
        </div>
      </div>

      {/* Global Material Classification Stats Bar */}
      <MaterialStatsBar
        materials={materials}
        activeUsageFilter={usageFilter}
        onFilterUsage={(status) => setUsageFilter(status)}
      />

      {activeTab === 'catalog' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Catalog View */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-4">
            {/* Search and Category Filter Toolbar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-search-materials"
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="ค้นหาชื่อวัสดุ หรือ รหัสพัสดุ (เช่น 1ก01, กระดาษ, ปากกา, แฟ้ม)..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-slate-50/50"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 select-none cursor-pointer px-2">
                    <input
                      type="checkbox"
                      checked={onlyInStock}
                      onChange={e => setOnlyInStock(e.target.checked)}
                      className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    <span className="whitespace-nowrap">เฉพาะที่มีคงเหลือ</span>
                  </label>
                  <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs">
                    <button
                      type="button"
                      onClick={() => setUsageFilter('ทั้งหมด')}
                      className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
                        usageFilter === 'ทั้งหมด' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      ทั้งหมด
                    </button>
                    <button
                      type="button"
                      onClick={() => setUsageFilter('ประจำ')}
                      className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
                        usageFilter === 'ประจำ' ? 'bg-amber-600 text-white shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      ใช้ประจำ
                    </button>
                    <button
                      type="button"
                      onClick={() => setUsageFilter('ครั้งคราว')}
                      className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
                        usageFilter === 'ครั้งคราว' ? 'bg-indigo-600 text-white shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      ใช้ครั้งคราว
                    </button>
                  </div>
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Materials Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredMaterials.map(item => {
                const isOutOfStock = item.currentStock <= 0;
                const cartItem = cart.find(c => c.material.id === item.id);
                const currentCartQty = cartItem ? cartItem.quantity : 0;
                const categoryColor = CATEGORY_COLORS[item.category] || {
                  bg: 'bg-slate-100 text-slate-700',
                  text: 'text-slate-700',
                  border: 'border-slate-200'
                };

                return (
                  <div
                    key={item.id}
                    id={`card-material-${item.id}`}
                    className={`bg-white rounded-xl border flex flex-col overflow-hidden transition-all duration-200 ${
                      isOutOfStock
                        ? 'border-slate-200 opacity-70 bg-slate-50/50'
                        : 'border-slate-200 hover:border-amber-400 hover:shadow-md'
                    }`}
                  >
                    {/* Material Image Container */}
                    <div className="relative h-36 bg-slate-100 overflow-hidden flex items-center justify-center">
                      <img
                        src={item.imageUrl || getMaterialImage(item.name, item.category)}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        onError={e => {
                          (e.currentTarget as HTMLImageElement).src = FALLBACK_MATERIAL_IMAGE;
                        }}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                      <span className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-mono px-2 py-0.5 rounded-md font-semibold">
                        {item.id}
                      </span>
                      <span
                        className={`absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isOutOfStock
                            ? 'bg-red-100 text-red-700'
                            : item.currentStock <= item.minQty
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isOutOfStock ? 'วัสดุหมด' : `คงเหลือ ${item.currentStock} ${item.unit}`}
                      </span>
                    </div>

                    {/* Material Info */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="mb-1.5">
                          <span
                            className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-md ${categoryColor.bg}`}
                          >
                            {item.category}
                          </span>
                        </div>
                        <h4 className="font-semibold text-slate-900 text-sm line-clamp-2 title-hover mb-1">
                          {item.name}
                        </h4>
                        <div className="flex items-baseline justify-between text-xs text-slate-500">
                          <span>ราคาอ้างอิง</span>
                          <span className="font-semibold text-slate-800 font-mono">
                            ฿{item.unitPrice.toLocaleString('th-TH', { minimumFractionDigits: 2 })} / {item.unit}
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100">
                        {isOutOfStock ? (
                          <div className="flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-rose-600 bg-rose-50 rounded-lg">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>สินค้าหมดชั่วคราว</span>
                          </div>
                        ) : currentCartQty > 0 ? (
                          <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg p-1">
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(item.id, -1)}
                              className="w-7 h-7 flex items-center justify-center rounded-md bg-white hover:bg-amber-100 text-amber-900 shadow-2xs cursor-pointer"
                              title="ลดจำนวน"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="1"
                                max={item.currentStock}
                                value={currentCartQty}
                                onChange={e => {
                                  const val = parseInt(e.target.value);
                                  if (!isNaN(val)) handleSetQty(item.id, val);
                                }}
                                className="w-14 text-center font-bold text-amber-900 text-xs bg-white rounded border border-amber-300 py-0.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
                              />
                              <span className="text-[10px] text-amber-800 font-medium">{item.unit}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(item.id, 1)}
                              disabled={currentCartQty >= item.currentStock}
                              className="w-7 h-7 flex items-center justify-center rounded-md bg-white hover:bg-amber-100 text-amber-900 shadow-2xs disabled:opacity-40 cursor-pointer"
                              title="เพิ่มจำนวน"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            id={`btn-add-${item.id}`}
                            onClick={() => handleAddToCart(item)}
                            className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>เลือกรายการนี้</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredMaterials.length === 0 && (
              <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 font-medium text-sm">ไม่พบรายการวัสดุที่ค้นหา</p>
                <p className="text-slate-400 text-xs mt-1">ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่น</p>
              </div>
            )}
          </div>

          {/* Right Floating Cart Sidebar */}
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sticky top-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">รายการขอเบิก</h3>
                    <p className="text-[11px] text-slate-500">{cart.length} รายการที่เลือก</p>
                  </div>
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={() => setCart([])}
                    className="text-xs text-rose-600 hover:underline cursor-pointer"
                  >
                    ล้างรายการ
                  </button>
                )}
              </div>

              {/* Cart Items List */}
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="py-8 text-center text-slate-400">
                    <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs">ยังไม่มีรายการที่เลือก</p>
                    <p className="text-[11px] text-slate-400 mt-1">กด &quot;เลือกรายการนี้&quot; เพื่อเพิ่ม</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div
                      key={item.material.id}
                      className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-2.5 text-xs"
                    >
                      <img
                        src={item.material.imageUrl || getMaterialImage(item.material.name, item.material.category)}
                        alt=""
                        referrerPolicy="no-referrer"
                        onError={e => {
                          (e.currentTarget as HTMLImageElement).src = FALLBACK_MATERIAL_IMAGE;
                        }}
                        className="w-9 h-9 rounded-lg object-cover bg-white border border-slate-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">{item.material.name}</p>
                        <p className="text-slate-500 font-mono text-[11px]">
                          ฿{item.material.unitPrice} x {item.quantity} {item.material.unit} = ฿
                          {(item.material.unitPrice * item.quantity).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.material.id, -1)}
                          className="w-5 h-5 flex items-center justify-center rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
                          title="ลดจำนวน"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <input
                          type="number"
                          min={1}
                          max={item.material.currentStock}
                          value={item.quantity}
                          onChange={e => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val)) handleSetQty(item.material.id, val);
                          }}
                          className="w-10 text-center font-bold text-slate-800 text-xs bg-white rounded border border-slate-300 py-0.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.material.id, 1)}
                          disabled={item.quantity >= item.material.currentStock}
                          className="w-5 h-5 flex items-center justify-center rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                          title="เพิ่มจำนวน"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveFromCart(item.material.id)}
                          className="w-5 h-5 ml-1 flex items-center justify-center rounded text-rose-500 hover:bg-rose-50 cursor-pointer"
                          title="ลบรายการ"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Purpose & Submit Section */}
              {cart.length > 0 && (
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ความประสงค์เพื่อใช้ในงาน / โครงการ <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="input-purpose-sidebar"
                      rows={2}
                      value={purpose}
                      onChange={e => setPurpose(e.target.value)}
                      placeholder="เช่น ใช้สำหรับจัดทำเอกสารการประชุมคณะกรรมการ หรือ จัดสอบนิสิต..."
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
                      required
                    />
                  </div>

                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs">
                    <div className="flex justify-between font-semibold text-amber-900">
                      <span>ยอดรวมมูลค่าวัสดุ</span>
                      <span className="font-mono">฿{totalCartPrice.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  <button
                    id="btn-submit-cart"
                    onClick={handleSubmit}
                    disabled={isSubmitting || cart.length === 0}
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>บันทึกและออกใบเบิกวัสดุ (PDF)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : activeTab === 'cart' ? (
        /* Full Cart Review & Confirmation Tab */
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-lg font-bold text-slate-900">ตรวจสอบรายการขอเบิกวัสดุ</h3>
              <p className="text-xs text-slate-500">กรุณาตรวจสอบความถูกต้องก่อนกดบันทึกเพื่อสร้างแบบฟอร์มใบเบิก</p>
            </div>
            <button
              onClick={() => setActiveTab('catalog')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              เลือกรายการเพิ่ม
            </button>
          </div>

          {cart.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">ยังไม่มีรายการขอเบิกในตะกร้า</p>
              <button
                onClick={() => setActiveTab('catalog')}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-white bg-amber-600 px-4 py-2 rounded-lg"
              >
                ไปหน้ารายการวัสดุ <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                {cart.map((item, idx) => (
                  <div
                    key={item.material.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-center font-bold text-slate-400 text-xs">{idx + 1}</span>
                      <img
                        src={item.material.imageUrl}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover bg-slate-200"
                      />
                      <div>
                        <span className="text-[10px] font-mono text-slate-500 font-semibold">{item.material.id}</span>
                        <h4 className="text-sm font-semibold text-slate-900">{item.material.name}</h4>
                        <span className="text-xs text-slate-500">
                          ฿{item.material.unitPrice} / {item.material.unit} (คงเหลือในคลัง {item.material.currentStock})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.material.id, -1)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer"
                          title="ลดจำนวน"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          min={1}
                          max={item.material.currentStock}
                          value={item.quantity}
                          onChange={e => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val)) handleSetQty(item.material.id, val);
                          }}
                          className="w-16 text-center font-bold text-sm text-slate-900 bg-white border border-slate-300 rounded-lg py-1 focus:ring-2 focus:ring-amber-500 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.material.id, 1)}
                          disabled={item.quantity >= item.material.currentStock}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                          title="เพิ่มจำนวน"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <span className="text-xs text-slate-500 ml-1">{item.material.unit}</span>
                      </div>

                      <div className="text-right min-w-20">
                        <span className="text-xs font-mono font-bold text-slate-900">
                          ฿{(item.material.unitPrice * item.quantity).toLocaleString()}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveFromCart(item.material.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Purpose & Note Box */}
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-3">
                <label className="block text-sm font-semibold text-slate-800">
                  วัตถุประสงค์ในการขอเบิกเพื่อใช้ในงาน / โครงการ <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="input-purpose-full"
                  rows={3}
                  value={purpose}
                  onChange={e => setPurpose(e.target.value)}
                  placeholder="เช่น เพื่อใช้สำหรับการดำเนินงานโครงการบริการวิชาการแก่ชุมชน หรือ เตรียมเอกสารการประชุมวิทยาลัย..."
                  className="w-full text-sm p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  required
                />
              </div>

              {/* Summary Card */}
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex flex-col sm:flex-row justify-between items-center gap-3">
                <div>
                  <p className="text-xs text-amber-800 font-medium">รวมจำนวนวัสดุทั้งหมด: {totalCartCount} หน่วย</p>
                  <p className="text-xs text-amber-700">ตามระเบียบพัสดุวิทยาลัยการเมืองการปกครอง มมส.</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-amber-800 block">มูลค่ารวมทั้งสิ้น</span>
                  <span className="text-xl font-bold font-mono text-amber-950">
                    ฿{totalCartPrice.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('catalog')}
                  className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  กลับไปเลือกต่อ
                </button>
                <button
                  type="submit"
                  id="btn-confirm-and-print"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>ยื่นคำขอเบิกพัสดุ (ส่งแจ้งเตือนถึงเจ้าหน้าที่)</span>
                </button>
              </div>
            </form>
          )}
        </div>
      ) : activeTab === 'history' ? (
        /* My Requisitions History Tab */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <History className="w-5 h-5 text-amber-600" />
                ประวัติการยื่นคำขอเบิกพัสดุของฉัน
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ติดตามสถานะคำขอเบิกที่ยื่นไว้ เมื่อเจ้าหน้าที่อนุมัติและตัดจ่ายแล้ว สามารถนำใบเบิกไปรับพัสดุได้
              </p>
            </div>
            <button
              onClick={() => setActiveTab('catalog')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              ขอเบิกพัสดุเพิ่ม
            </button>
          </div>

          {myOrders.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <History className="w-12 h-12 mx-auto opacity-30" />
              <p className="text-sm font-medium">ยังไม่มีประวัติการขอเบิกพัสดุ</p>
              <button
                onClick={() => setActiveTab('catalog')}
                className="mt-2 text-xs font-bold text-amber-700 hover:underline inline-block"
              >
                เลือกรายการวัสดุเพื่อเริ่มขอเบิก
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 space-y-3">
              {myOrders.map(order => {
                const isPending = order.status === 'รออนุมัติ';
                const isDisbursed = order.status === 'เบิกจ่ายแล้ว' || order.status === 'อนุมัติแล้ว';
                const isRejected = order.status === 'ยกเลิก';

                return (
                  <div key={order.id} className="pt-3 first:pt-0 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                          {order.docNo}
                        </span>
                        <span className="text-xs text-slate-500">
                          วันที่: {order.date}
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
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-900">
                          ฿{order.totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </span>
                        {isPending && onEditOrder && (
                          <button
                            onClick={() => setEditingOrder(order)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-300 hover:bg-amber-100 text-amber-900 text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
                            title="แก้ไขรายการพัสดุและวัตถุประสงค์"
                          >
                            <FileEdit className="w-3.5 h-3.5 text-amber-700" />
                            แก้ไขรายการ
                          </button>
                        )}
                        {isPending && onCancelOrder && (
                          <button
                            onClick={() => setOrderToCancel(order)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
                            title="ยกเลิกคำขอเบิกพัสดุนี้"
                          >
                            <Ban className="w-3.5 h-3.5 text-rose-600" />
                            ยกเลิกคำขอ
                          </button>
                        )}
                        {onViewPrintForm && (
                          <button
                            onClick={() => onViewPrintForm(order)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5 text-slate-500" />
                            พิมพ์ใบเบิก
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl text-xs text-slate-700">
                      <span className="font-semibold text-slate-800">วัตถุประสงค์:</span> {order.purpose}
                      {order.approverName && (
                        <div className="mt-1 text-emerald-700 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          ผู้อนุมัติ/จ่ายพัสดุ: {order.approverName} {order.disbursedDate && `(${order.disbursedDate})`}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {order.items.map((item, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white border border-slate-200 text-xs text-slate-700"
                        >
                          <span className="font-mono text-[10px] text-slate-400 font-semibold">{item.materialId}</span>
                          <span className="font-medium text-slate-900">{item.name}</span>
                          <span className="font-mono font-bold text-amber-800">
                            {item.requestedQty} {item.unit}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : null}

      {/* Edit Requisition Modal for Pending Orders */}
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

      {/* Confirm Cancel User Requisition Modal */}
      {orderToCancel && onCancelOrder && (
        <ConfirmModal
          isOpen={true}
          title="ยืนยันการยกเลิกคำขอเบิกพัสดุ"
          message={`ต้องการยกเลิกคำขอเบิกพัสดุเลขที่ ${orderToCancel.docNo} ใช่หรือไม่?`}
          details={`วัตถุประสงค์: ${orderToCancel.purpose}\nจำนวน: ${orderToCancel.items.length} รายการ (มูลค่ารวม ฿${orderToCancel.totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })})`}
          confirmText="ยืนยันยกเลิกคำขอ"
          variant="danger"
          icon="danger"
          onConfirm={() => {
            onCancelOrder(orderToCancel.id);
            setOrderToCancel(null);
          }}
          onClose={() => setOrderToCancel(null)}
        />
      )}
    </div>
  );
};
