import React, { useState } from 'react';
import { StockOutRecord, MaterialItem, UserProfile } from '../types';
import { MaterialStatsBar } from './MaterialStatsBar';
import { EditStockOutModal } from './EditStockOutModal';
import { ConfirmModal } from './ConfirmModal';
import {
  DollarSign,
  Plus,
  Search,
  CheckCircle,
  FileSpreadsheet,
  AlertCircle,
  FileEdit,
  Trash2
} from 'lucide-react';
import { appendRequisitionToSheet } from '../services/googleService';

interface AdminStockOutViewProps {
  stockOuts: StockOutRecord[];
  materials: MaterialItem[];
  user: UserProfile;
  spreadsheetId: string;
  onAddStockOut: (record: StockOutRecord) => void;
  onEditStockOut?: (record: StockOutRecord) => void;
  onDeleteStockOut?: (recordId: string) => void;
}

export const AdminStockOutView: React.FC<AdminStockOutViewProps> = ({
  stockOuts,
  materials,
  user,
  spreadsheetId,
  onAddStockOut,
  onEditStockOut,
  onDeleteStockOut,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingRecord, setEditingRecord] = useState<StockOutRecord | null>(null);
  const [sheetSyncStatus, setSheetSyncStatus] = useState<string>('');
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    title: string;
    message: string;
    details?: string;
    confirmText: string;
    variant: 'danger' | 'warning' | 'success' | 'info';
    icon: 'restore' | 'delete' | 'danger' | 'success' | 'warning';
    onConfirm: () => void;
  } | null>(null);

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [docNo, setDocNo] = useState(`COPAG-REQ-2569/${String(stockOuts.length + 1).padStart(3, '0')}`);
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [requesterName, setRequesterName] = useState('');
  const [department, setDepartment] = useState('สำนักงานคณบดี');
  const [disburserName, setDisburserName] = useState(user.name);
  const [note, setNote] = useState('');

  const selectedMaterial = materials.find(m => m.id === selectedMaterialId);

  const filteredRecords = stockOuts.filter(record =>
    record.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.materialId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.requisitionDocNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.requesterName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterial) {
      alert('กรุณาเลือกวัสดุ');
      return;
    }
    if (quantity <= 0) {
      alert('จำนวนต้องมากกว่า 0');
      return;
    }
    if (quantity > selectedMaterial.currentStock) {
      alert(`จำนวนขอเบิก (${quantity}) มากกว่าคงเหลือในคลัง (${selectedMaterial.currentStock})`);
      return;
    }

    const newRecord: StockOutRecord = {
      id: `OUT-${Date.now()}`,
      date,
      requisitionDocNo: docNo,
      materialId: selectedMaterial.id,
      materialName: selectedMaterial.name,
      category: selectedMaterial.category,
      quantity,
      unit: selectedMaterial.unit,
      unitPrice: selectedMaterial.unitPrice,
      totalPrice: selectedMaterial.unitPrice * quantity,
      requesterName,
      department,
      disburserName,
      note
    };

    onAddStockOut(newRecord);

    // If Google token exists and sheet id provided, sync to Sheet '💰 เบิกจ่าย'
    if (user.accessToken && spreadsheetId) {
      setSheetSyncStatus('กำลังบันทึกลง Google Sheet...');
      try {
        const row = [
          date,
          docNo,
          selectedMaterial.id,
          selectedMaterial.name,
          selectedMaterial.category,
          quantity,
          selectedMaterial.unit,
          selectedMaterial.unitPrice,
          selectedMaterial.unitPrice * quantity,
          requesterName,
          department,
          disburserName,
          note
        ];
        const success = await appendRequisitionToSheet(
          user.accessToken,
          spreadsheetId,
          '💰 เบิกจ่าย',
          [row]
        );
        if (success) {
          setSheetSyncStatus('บันทึกใน Sheet หน้า "💰 เบิกจ่าย" สำเร็จ');
        } else {
          setSheetSyncStatus('บันทึกในระบบสำเร็จ (Google Sheet ตอบสนองช้าหรือไม่พบคอลัมน์)');
        }
      } catch {
        setSheetSyncStatus('บันทึกในระบบสำเร็จ');
      }
    }

    setIsAdding(false);
    // Reset form
    setSelectedMaterialId('');
    setQuantity(1);
    setRequesterName('');
    setNote('');
  };

  const totalValue = stockOuts.reduce((sum, r) => sum + r.totalPrice, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">บันทึก 💰 เบิกจ่าย วัสดุ</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            อ้างอิงและบันทึกรูปแบบตาม Sheet หน้า &ldquo;💰 เบิกจ่าย&rdquo; สำหรับเจ้าหน้าที่พัสดุ
          </p>
        </div>

        <button
          id="btn-open-stockout-modal"
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          คีย์ข้อมูลเบิกจ่ายใหม่
        </button>
      </div>

      {/* Global Material Classification Stats Bar */}
      <MaterialStatsBar materials={materials} />

      {sheetSyncStatus && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{sheetSyncStatus}</span>
        </div>
      )}

      {/* Summary Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6 text-xs">
          <div>
            <span className="text-slate-500 block">รายการเบิกจ่ายทั้งหมด</span>
            <span className="text-lg font-bold text-slate-900 font-mono">{stockOuts.length} รายการ</span>
          </div>
          <div className="border-l border-slate-200 pl-6">
            <span className="text-slate-500 block">มูลค่าการเบิกจ่ายรวม</span>
            <span className="text-lg font-bold text-amber-700 font-mono">
              ฿{totalValue.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="ค้นหาเลขที่ใบเบิก, วัสดุ, ผู้ขอ..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Entry Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">บันทึกข้อมูลหน้า 💰 เบิกจ่าย</h3>
              <button
                onClick={() => setIsAdding(false)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">วันที่เบิกจ่าย</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">เลขที่ใบเบิก</label>
                  <input
                    type="text"
                    value={docNo}
                    onChange={e => setDocNo(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  เลือกรายการวัสดุ <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedMaterialId}
                  onChange={e => setSelectedMaterialId(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                  required
                >
                  <option value="">-- เลือกวัสดุเพื่อเบิกจ่าย --</option>
                  {materials.map(m => (
                    <option key={m.id} value={m.id} disabled={m.currentStock <= 0}>
                      [{m.id}] {m.name} (คงเหลือ {m.currentStock} {m.unit}) - ฿{m.unitPrice}
                    </option>
                  ))}
                </select>
              </div>

              {selectedMaterial && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500">หมวดหมู่:</span> <strong>{selectedMaterial.category}</strong>
                    <br />
                    <span className="text-slate-500">ราคาซื้อต่อหน่วย:</span>{' '}
                    <strong className="font-mono">฿{selectedMaterial.unitPrice} / {selectedMaterial.unit}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500">คงเหลือในคลัง:</span>{' '}
                    <strong className={selectedMaterial.currentStock <= selectedMaterial.minQty ? 'text-rose-600' : 'text-emerald-700'}>
                      {selectedMaterial.currentStock} {selectedMaterial.unit}
                    </strong>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">จำนวนที่เบิก</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedMaterial ? selectedMaterial.currentStock : 9999}
                    value={quantity}
                    onChange={e => setQuantity(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-200 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">รวมเป็นเงิน (บาท)</label>
                  <input
                    type="text"
                    value={
                      selectedMaterial
                        ? (selectedMaterial.unitPrice * quantity).toLocaleString('th-TH', { minimumFractionDigits: 2 })
                        : '0.00'
                    }
                    readOnly
                    className="w-full p-2 rounded-lg border border-slate-200 bg-slate-100 font-mono font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ชื่อผู้ขอเบิก</label>
                  <input
                    type="text"
                    value={requesterName}
                    onChange={e => setRequesterName(e.target.value)}
                    placeholder="เช่น อาจารย์ หรือ บุคลากร"
                    className="w-full p-2 rounded-lg border border-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">หน่วยงาน / ฝ่าย</label>
                  <input
                    type="text"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">เจ้าหน้าที่ผู้จ่ายพัสดุ</label>
                  <input
                    type="text"
                    value={disburserName}
                    onChange={e => setDisburserName(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">หมายเหตุ</label>
                  <input
                    type="text"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="ระบุเพิ่มเติม (ถ้ามี)"
                    className="w-full p-2 rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg cursor-pointer shadow-xs"
                >
                  บันทึกข้อมูลเบิกจ่าย
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Out Table (Matching Sheet "💰 เบิกจ่าย" Columns) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <th className="py-3 px-3">ลำดับ</th>
                <th className="py-3 px-3">วันที่</th>
                <th className="py-3 px-3">เลขที่ใบเบิก</th>
                <th className="py-3 px-3">รหัสวัสดุ</th>
                <th className="py-3 px-3">ชื่อรายการวัสดุ</th>
                <th className="py-3 px-3">หมวดหมู่</th>
                <th className="py-3 px-3 text-center">จำนวน</th>
                <th className="py-3 px-3 text-center">หน่วยนับ</th>
                <th className="py-3 px-3 text-right">ราคาต่อหน่วย</th>
                <th className="py-3 px-3 text-right">รวมเป็นเงิน (บ.)</th>
                <th className="py-3 px-3">ผู้ขอเบิก</th>
                <th className="py-3 px-3">หน่วยงาน</th>
                <th className="py-3 px-3">ผู้จ่ายพัสดุ</th>
                <th className="py-3 px-3">หมายเหตุ</th>
                <th className="py-3 px-3 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/80">
                  <td className="py-2.5 px-3 text-slate-500 text-center">{idx + 1}</td>
                  <td className="py-2.5 px-3 whitespace-nowrap text-slate-600">{item.date}</td>
                  <td className="py-2.5 px-3 font-mono font-medium text-amber-700 whitespace-nowrap">
                    {item.requisitionDocNo}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-medium">{item.materialId}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-900">{item.materialName}</td>
                  <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">{item.category}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-amber-800">{item.quantity}</td>
                  <td className="py-2.5 px-3 text-center text-slate-600">{item.unit}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                    ฿{item.unitPrice.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    ฿{item.totalPrice.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-800 whitespace-nowrap">{item.requesterName}</td>
                  <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">{item.department}</td>
                  <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">{item.disburserName}</td>
                  <td className="py-2.5 px-3 text-slate-500 text-[11px]">{item.note || '-'}</td>
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      {onEditStockOut && (
                        <button
                          onClick={() => setEditingRecord(item)}
                          className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          title="แก้ไขรายการเบิกจ่าย"
                        >
                          <FileEdit className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDeleteStockOut && (
                        <button
                          onClick={() => {
                            setConfirmModalConfig({
                              title: 'ยืนยันการยกเลิก/ลบรายการเบิกจ่าย',
                              message: `ยืนยันการยกเลิก/ลบรายการเบิกจ่าย "${item.materialName}" (${item.quantity} ${item.unit}) ใช่หรือไม่?`,
                              details: `การลบรายการนี้จะคืนจำนวนพัสดุ ${item.quantity} ${item.unit} กลับเข้าสู่สต็อกคงเหลือในคลังทันที`,
                              confirmText: 'ยืนยันลบรายการ',
                              variant: 'danger',
                              icon: 'delete',
                              onConfirm: () => onDeleteStockOut(item.id)
                            });
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="ยกเลิก/ลบรายการเบิกจ่าย (คืนสต็อกเข้าคลัง)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRecords.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-xs">
            ไม่พบข้อมูลการเบิกจ่ายตามคำค้นหา
          </div>
        )}
      </div>

      {/* Edit Stock Out Modal */}
      {editingRecord && (
        <EditStockOutModal
          record={editingRecord}
          materials={materials}
          isOpen={true}
          onClose={() => setEditingRecord(null)}
          onSave={updated => {
            if (onEditStockOut) {
              onEditStockOut(updated);
            }
            setEditingRecord(null);
          }}
        />
      )}

      {/* Confirm Modal */}
      {confirmModalConfig && (
        <ConfirmModal
          isOpen={true}
          title={confirmModalConfig.title}
          message={confirmModalConfig.message}
          details={confirmModalConfig.details}
          confirmText={confirmModalConfig.confirmText}
          variant={confirmModalConfig.variant}
          icon={confirmModalConfig.icon}
          onConfirm={confirmModalConfig.onConfirm}
          onClose={() => setConfirmModalConfig(null)}
        />
      )}
    </div>
  );
};
