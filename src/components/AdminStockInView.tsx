import React, { useState } from 'react';
import { StockInRecord, MaterialItem, UserProfile } from '../types';
import { MaterialStatsBar } from './MaterialStatsBar';
import { EditStockInModal } from './EditStockInModal';
import { ConfirmModal } from './ConfirmModal';
import {
  PackagePlus,
  Plus,
  Search,
  CheckCircle,
  FileSpreadsheet,
  FileEdit,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { appendStockInToSheet } from '../services/googleService';

interface AdminStockInViewProps {
  stockIns: StockInRecord[];
  materials: MaterialItem[];
  user: UserProfile;
  spreadsheetId: string;
  onAddStockIn: (record: StockInRecord) => void;
  onEditStockIn?: (record: StockInRecord) => void;
  onDeleteStockIn?: (recordId: string) => void;
  onReceiveAll20?: () => void;
  onResetAllStockToZero?: () => void;
}

export const AdminStockInView: React.FC<AdminStockInViewProps> = ({
  stockIns,
  materials,
  user,
  spreadsheetId,
  onAddStockIn,
  onEditStockIn,
  onDeleteStockIn,
  onReceiveAll20,
  onResetAllStockToZero,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingRecord, setEditingRecord] = useState<StockInRecord | null>(null);
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
  const [docNo, setDocNo] = useState(`PO-COPAG-2569/${String(stockIns.length + 1).padStart(3, '0')}`);
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [quantity, setQuantity] = useState<number>(10);
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [supplier, setSupplier] = useState('');
  const [receiverName, setReceiverName] = useState(user.name);
  const [note, setNote] = useState('');

  const selectedMaterial = materials.find(m => m.id === selectedMaterialId);

  const handleSelectMaterial = (id: string) => {
    setSelectedMaterialId(id);
    const m = materials.find(it => it.id === id);
    if (m) {
      setUnitPrice(m.unitPrice);
    }
  };

  const filteredRecords = stockIns.filter(record =>
    record.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.materialId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.docNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (record.supplier && record.supplier.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMaterial) {
      alert('กรุณาเลือกวัสดุ');
      return;
    }
    if (quantity <= 0) {
      alert('จำนวนรับเข้าต้องมากกว่า 0');
      return;
    }

    const newRecord: StockInRecord = {
      id: `IN-${Date.now()}`,
      date,
      docNo,
      materialId: selectedMaterial.id,
      materialName: selectedMaterial.name,
      category: selectedMaterial.category,
      quantity,
      unit: selectedMaterial.unit,
      unitPrice,
      totalPrice: unitPrice * quantity,
      supplier,
      receiverName,
      note
    };

    onAddStockIn(newRecord);

    // Sync to Google Sheet page '💸 รับเข้า'
    if (user.accessToken && spreadsheetId) {
      setSheetSyncStatus('กำลังบันทึกรับเข้าลง Google Sheet...');
      try {
        const row = [
          date,
          docNo,
          selectedMaterial.id,
          selectedMaterial.name,
          selectedMaterial.category,
          quantity,
          selectedMaterial.unit,
          unitPrice,
          unitPrice * quantity,
          supplier,
          receiverName,
          note
        ];
        const success = await appendStockInToSheet(
          user.accessToken,
          spreadsheetId,
          '💸 รับเข้า',
          [row]
        );
        if (success) {
          setSheetSyncStatus('บันทึกใน Sheet หน้า "💸 รับเข้า" สำเร็จ');
        } else {
          setSheetSyncStatus('บันทึกในระบบสำเร็จ');
        }
      } catch {
        setSheetSyncStatus('บันทึกในระบบสำเร็จ');
      }
    }

    setIsAdding(false);
    setSelectedMaterialId('');
    setQuantity(10);
    setSupplier('');
    setNote('');
  };

  const totalInValue = stockIns.reduce((sum, r) => sum + r.totalPrice, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <PackagePlus className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">บันทึก 💸 รับเข้า พัสดุ</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            อ้างอิงและบันทึกรูปแบบตาม Sheet หน้า &ldquo;💸 รับเข้า&rdquo; เพื่อเพิ่มจำนวนคงเหลือในคลัง
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onReceiveAll20 && (
            <button
              id="btn-stockin-receive-20"
              onClick={() => {
                setConfirmModalConfig({
                  title: 'ยืนยันการรับเข้าวัสดุทุกรายการ 20 หน่วย',
                  message: 'คุณต้องการบันทึกรับเข้าพัสดุทุกรายการอย่างละ 20 หน่วย เข้าสู่คลังพัสดุใช่หรือไม่?',
                  details: `จำนวนพัสดุทั้งหมด ${materials.length} รายการ จะได้รับเข้าสต็อกเพิ่มรายการละ 20 หน่วย และลงบันทึกในสมุดคุมบัญชีอัตโนมัติ`,
                  confirmText: 'ยืนยันรับเข้า 20 หน่วย',
                  variant: 'success',
                  icon: 'success',
                  onConfirm: () => onReceiveAll20()
                });
              }}
              className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-semibold rounded-xl shadow-2xs transition-colors cursor-pointer"
              title="รับเข้าวัสดุทุกรายการอย่างละ 20 หน่วย"
            >
              <PackagePlus className="w-3.5 h-3.5 text-emerald-600" />
              รับเข้าทุกรายการ 20 หน่วย
            </button>
          )}

          {onResetAllStockToZero && (
            <button
              id="btn-stockin-reset-stock-zero"
              onClick={() => {
                setConfirmModalConfig({
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
            id="btn-open-stockin-modal"
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            คีย์ข้อมูลรับเข้าใหม่
          </button>
        </div>
      </div>

      {/* Global Material Classification Stats Bar */}
      <MaterialStatsBar materials={materials} />

      {sheetSyncStatus && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{sheetSyncStatus}</span>
        </div>
      )}

      {/* Summary Banner */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6 text-xs">
          <div>
            <span className="text-slate-500 block">รายการรับเข้าทั้งหมด</span>
            <span className="text-lg font-bold text-slate-900 font-mono">{stockIns.length} ล็อต</span>
          </div>
          <div className="border-l border-slate-200 pl-6">
            <span className="text-slate-500 block">มูลค่าการรับเข้ารวม</span>
            <span className="text-lg font-bold text-emerald-700 font-mono">
              ฿{totalInValue.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
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
            placeholder="ค้นหาเลขที่จัดซื้อ, วัสดุ, ร้านค้า..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Entry Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">บันทึกข้อมูลหน้า 💸 รับเข้า</h3>
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
                  <label className="block font-semibold text-slate-700 mb-1">วันที่รับเข้า</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">เลขที่ใบสั่งซื้อ / ใบส่งของ</label>
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
                  onChange={e => handleSelectMaterial(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                  required
                >
                  <option value="">-- เลือกวัสดุเพื่อรับเข้าคลัง --</option>
                  {materials.map(m => (
                    <option key={m.id} value={m.id}>
                      [{m.id}] {m.name} (คงเหลือเดิม {m.currentStock} {m.unit})
                    </option>
                  ))}
                </select>
              </div>

              {selectedMaterial && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
                  <div>
                    <span>หมวดหมู่:</span> <strong>{selectedMaterial.category}</strong>
                  </div>
                  <div>
                    <span>คงเหลือก่อนรับเข้า:</span>{' '}
                    <strong>{selectedMaterial.currentStock} {selectedMaterial.unit}</strong>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">จำนวนที่รับเข้า</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={e => setQuantity(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-200 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ราคาต่อหน่วย (บาท)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={unitPrice}
                    onChange={e => setUnitPrice(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-slate-200 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">รวมเป็นเงิน (บาท)</label>
                  <input
                    type="text"
                    value={(quantity * unitPrice).toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                    readOnly
                    className="w-full p-2 rounded-lg border border-slate-200 bg-slate-100 font-mono font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ร้านค้า / ผู้จัดจำหน่าย</label>
                  <input
                    type="text"
                    value={supplier}
                    onChange={e => setSupplier(e.target.value)}
                    placeholder="เช่น ห้างหุ้นส่วนจำกัด มหาสารคามศึกษาภัณฑ์"
                    className="w-full p-2 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">เจ้าหน้าที่ผู้ตรวจรับ</label>
                  <input
                    type="text"
                    value={receiverName}
                    onChange={e => setReceiverName(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">หมายเหตุ</label>
                <input
                  type="text"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="เช่น จัดซื้อตามงบประมาณโครงการ หรือ เติมคลังประจำไตรมาส"
                  className="w-full p-2 rounded-lg border border-slate-200"
                />
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
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer shadow-xs"
                >
                  บันทึกรับเข้าคลัง
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock In Table (Matching Sheet "💸 รับเข้า" Columns) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <th className="py-3 px-3">ลำดับ</th>
                <th className="py-3 px-3">วันที่รับ</th>
                <th className="py-3 px-3">เลขที่จัดซื้อ</th>
                <th className="py-3 px-3">รหัสวัสดุ</th>
                <th className="py-3 px-3">ชื่อรายการวัสดุ</th>
                <th className="py-3 px-3">หมวดหมู่</th>
                <th className="py-3 px-3 text-center">จำนวนรับ</th>
                <th className="py-3 px-3 text-center">หน่วยนับ</th>
                <th className="py-3 px-3 text-right">ราคาต่อหน่วย</th>
                <th className="py-3 px-3 text-right">รวมเป็นเงิน (บ.)</th>
                <th className="py-3 px-3">ผู้จำหน่าย / ร้านค้า</th>
                <th className="py-3 px-3">ผู้ตรวจรับ</th>
                <th className="py-3 px-3">หมายเหตุ</th>
                <th className="py-3 px-3 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/80">
                  <td className="py-2.5 px-3 text-slate-500 text-center">{idx + 1}</td>
                  <td className="py-2.5 px-3 whitespace-nowrap text-slate-600">{item.date}</td>
                  <td className="py-2.5 px-3 font-mono font-medium text-emerald-700 whitespace-nowrap">
                    {item.docNo}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-medium">{item.materialId}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-900">{item.materialName}</td>
                  <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">{item.category}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-emerald-800">+{item.quantity}</td>
                  <td className="py-2.5 px-3 text-center text-slate-600">{item.unit}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                    ฿{item.unitPrice.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    ฿{item.totalPrice.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">{item.supplier || '-'}</td>
                  <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">{item.receiverName}</td>
                  <td className="py-2.5 px-3 text-slate-500 text-[11px]">{item.note || '-'}</td>
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      {onEditStockIn && (
                        <button
                          onClick={() => setEditingRecord(item)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="แก้ไขรายการรับเข้า"
                        >
                          <FileEdit className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDeleteStockIn && (
                        <button
                          onClick={() => {
                            setConfirmModalConfig({
                              title: 'ยืนยันการยกเลิก/ลบรายการรับเข้า',
                              message: `ยืนยันการยกเลิก/ลบรายการรับเข้าพัสดุ "${item.materialName}" (${item.quantity} ${item.unit}) ใช่หรือไม่?`,
                              details: `การลบรายการนี้จะลดจำนวนคงเหลือในคลังลง ${item.quantity} ${item.unit} ตามจำนวนที่รับเข้าเดิม`,
                              confirmText: 'ยืนยันลบรายการ',
                              variant: 'danger',
                              icon: 'delete',
                              onConfirm: () => onDeleteStockIn(item.id)
                            });
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="ยกเลิก/ลบรายการรับเข้า (ลดสต็อกคืน)"
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
            ไม่พบข้อมูลการรับเข้าตามคำค้นหา
          </div>
        )}
      </div>

      {/* Edit Stock In Modal */}
      {editingRecord && (
        <EditStockInModal
          record={editingRecord}
          materials={materials}
          isOpen={true}
          onClose={() => setEditingRecord(null)}
          onSave={updated => {
            if (onEditStockIn) {
              onEditStockIn(updated);
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
