import React, { useRef, useState } from 'react';
import { RequisitionOrder } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Printer, Download, CloudUpload, CheckCircle, ExternalLink, ArrowLeft } from 'lucide-react';
import { uploadPdfToDrive, getOrCreateRequisitionFolder } from '../services/googleService';
import garudaEmblem from '../assets/images/regenerated_image_1789365132270.png';

interface RequisitionPrintFormProps {
  order: RequisitionOrder;
  onBack: () => void;
  accessToken?: string;
  onDriveSaved?: (fileId: string, viewLink: string) => void;
}

export const RequisitionPrintForm: React.FC<RequisitionPrintFormProps> = ({
  order,
  onBack,
  accessToken,
  onDriveSaved,
}) => {
  const formRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [driveStatus, setDriveStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [driveUrl, setDriveUrl] = useState<string>(order.driveViewLink || '');

  // Format thai date e.g. "9 กันยายน 2569"
  const formatThaiDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const months = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
      ];
      return `${d.getDate()} ${months[d.getMonth()]} พ.ศ. ${d.getFullYear() + 543}`;
    } catch {
      return dateStr;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const generatePdfBlob = async (): Promise<Blob> => {
    if (!formRef.current) throw new Error('Form reference not found');

    const canvas = await html2canvas(formRef.current, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 210; // A4 width mm
    const pageHeight = 297; // A4 height mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    return pdf.output('blob');
  };

  const handleDownloadPdf = async () => {
    try {
      setIsGenerating(true);
      const blob = await generatePdfBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ใบเบิกวัสดุ_${order.docNo}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download PDF error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToDrive = async () => {
    if (!accessToken) {
      alert('กรุณาลงชื่อเข้าใช้ด้วย Google (@msu.ac.th) เพื่อบันทึกไฟล์ลง Google Drive');
      return;
    }

    try {
      setDriveStatus('uploading');
      const blob = await generatePdfBlob();
      const folderId = await getOrCreateRequisitionFolder(accessToken);
      const fileName = `ใบเบิกวัสดุ_${order.docNo}_${order.requesterName}.pdf`;
      const res = await uploadPdfToDrive(accessToken, blob, fileName, folderId);
      
      setDriveStatus('success');
      setDriveUrl(res.webViewLink);
      if (onDriveSaved) {
        onDriveSaved(res.fileId, res.webViewLink);
      }
    } catch (err) {
      console.error('Save to Drive error:', err);
      setDriveStatus('error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Action Bar (Hidden on print) */}
      <div className="print:hidden mb-6 flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <button
          id="btn-back-from-print"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          กลับหน้ารายการ
        </button>

        <div className="flex flex-wrap items-center gap-3">
          <button
            id="btn-print-form"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            พิมพ์เอกสาร
          </button>

          <button
            id="btn-download-pdf"
            onClick={handleDownloadPdf}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 px-3.5 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-60"
          >
            <Download className="w-4 h-4 text-slate-600" />
            {isGenerating ? 'กำลังสร้าง PDF...' : 'ดาวน์โหลด PDF'}
          </button>

          <button
            id="btn-save-drive"
            onClick={handleSaveToDrive}
            disabled={driveStatus === 'uploading' || !accessToken}
            title={!accessToken ? 'ต้องเข้าสู่ระบบ Google เพื่อใช้สิทธิ์ Drive' : 'บันทึกในโฟลเดอร์ ใบเบิกวัสดุ ใน Google Drive'}
            className="inline-flex items-center gap-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <CloudUpload className="w-4 h-4" />
            {driveStatus === 'uploading' ? 'กำลังบันทึกลง Drive...' : 'บันทึกลงไดร์ฟของฉัน (โฟลเดอร์ ใบเบิกวัสดุ)'}
          </button>
        </div>
      </div>

      {driveStatus === 'success' && (
        <div className="print:hidden mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-800 text-sm font-medium">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            บันทึกไฟล์ “ใบเบิกวัสดุ_{order.docNo}.pdf” ลงในโฟลเดอร์ “ใบเบิกวัสดุ” บน Google Drive ของคุณเรียบร้อยแล้ว
          </div>
          {driveUrl && (
            <a
              href={driveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              เปิดดูใน Drive <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}

      {driveStatus === 'error' && (
        <div className="print:hidden mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm">
          ไม่สามารถเชื่อมต่อ Google Drive ได้ กรุณาตรวจสอบการอนุญาตสิทธิ์ หรือดาวน์โหลดเป็น PDF โดยตรง
        </div>
      )}

      {/* Actual Requisition Form (Compliant with Sheet "form" layout) */}
      <div
        ref={formRef}
        className="bg-white p-8 md:p-12 rounded-xl shadow-md border border-slate-200 text-slate-900 mx-auto"
        style={{ fontFamily: "'Sarabun', sans-serif" }}
      >
        {/* Header with Garuda and Organization Info */}
        <div className="text-center relative pb-4 mb-6 border-b border-slate-300">
          <div className="flex justify-center mb-2">
            <img
              src={garudaEmblem}
              alt="ตราครุฑ"
              referrerPolicy="no-referrer"
              className="h-20 w-auto object-contain"
            />
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
            ใบเบิกพัสดุ / วัสดุ
          </h1>
          <p className="text-base font-medium text-slate-700 mt-1">
            วิทยาลัยการเมืองการปกครอง มหาวิทยาลัยมหาสารคาม
          </p>
          <div className="flex justify-between items-center text-xs md:text-sm text-slate-600 mt-3 pt-2 border-t border-slate-100">
            <span>เลขที่ใบเบิก: <strong className="text-slate-900 font-semibold">{order.docNo}</strong></span>
            <span>วันที่: <strong className="text-slate-900 font-semibold">{formatThaiDate(order.date)}</strong></span>
          </div>
        </div>

        {/* Requester Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6 bg-slate-50/70 p-4 rounded-lg border border-slate-200">
          <div>
            <span className="text-slate-500 font-medium">ชื่อผู้ขอเบิก:</span>{' '}
            <span className="font-semibold text-slate-900">{order.requesterName}</span>
          </div>
          <div>
            <span className="text-slate-500 font-medium">ตำแหน่ง:</span>{' '}
            <span className="font-semibold text-slate-900">{order.requesterPosition || 'อาจารย์ / บุคลากร'}</span>
          </div>
          <div>
            <span className="text-slate-500 font-medium">หน่วยงาน / ฝ่าย:</span>{' '}
            <span className="font-semibold text-slate-900">{order.department}</span>
          </div>
          <div>
            <span className="text-slate-500 font-medium">อีเมล MSU:</span>{' '}
            <span className="font-semibold text-slate-900">{order.requesterEmail}</span>
          </div>
          <div className="md:col-span-2">
            <span className="text-slate-500 font-medium">ความประสงค์เพื่อใช้ในงาน:</span>{' '}
            <span className="font-semibold text-slate-900">{order.purpose || 'ใช้ในการปฏิบัติงานราชการภายในวิทยาลัย'}</span>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6 overflow-x-auto">
          <table className="w-full text-left border-collapse border border-slate-300 text-xs md:text-sm">
            <thead>
              <tr className="bg-slate-100 text-slate-800 text-center font-semibold">
                <th className="border border-slate-300 px-2 py-2 w-12">ลำดับ</th>
                <th className="border border-slate-300 px-3 py-2 w-20">รหัส</th>
                <th className="border border-slate-300 px-3 py-2 text-left">รายการวัสดุ</th>
                <th className="border border-slate-300 px-2 py-2 w-24">หมวดหมู่</th>
                <th className="border border-slate-300 px-2 py-2 w-16">จำนวน ขอเบิก</th>
                <th className="border border-slate-300 px-2 py-2 w-16">หน่วย นับ</th>
                <th className="border border-slate-300 px-2 py-2 w-20">ราคาต่อ หน่วย (บ.)</th>
                <th className="border border-slate-300 px-2 py-2 w-24">รวมเป็นเงิน (บาท)</th>
                <th className="border border-slate-300 px-3 py-2 w-28">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="border border-slate-300 px-2 py-2 text-center text-slate-600">{idx + 1}</td>
                  <td className="border border-slate-300 px-3 py-2 text-center font-mono font-medium">{item.materialId}</td>
                  <td className="border border-slate-300 px-3 py-2 font-medium text-slate-900">{item.name}</td>
                  <td className="border border-slate-300 px-2 py-2 text-center text-xs text-slate-600">{item.category}</td>
                  <td className="border border-slate-300 px-2 py-2 text-center font-semibold text-amber-700">{item.requestedQty}</td>
                  <td className="border border-slate-300 px-2 py-2 text-center text-slate-700">{item.unit}</td>
                  <td className="border border-slate-300 px-2 py-2 text-right font-mono">{item.unitPrice.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                  <td className="border border-slate-300 px-2 py-2 text-right font-mono font-medium">{item.totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</td>
                  <td className="border border-slate-300 px-2 py-2 text-xs text-slate-600">{item.remark || '-'}</td>
                </tr>
              ))}

              {/* Empty rows to make the standard paper form look complete */}
              {Array.from({ length: Math.max(0, 8 - order.items.length) }).map((_, i) => (
                <tr key={`empty-${i}`} className="h-8">
                  <td className="border border-slate-300 px-2 py-2 text-center text-slate-300">{order.items.length + i + 1}</td>
                  <td className="border border-slate-300"></td>
                  <td className="border border-slate-300"></td>
                  <td className="border border-slate-300"></td>
                  <td className="border border-slate-300"></td>
                  <td className="border border-slate-300"></td>
                  <td className="border border-slate-300"></td>
                  <td className="border border-slate-300"></td>
                  <td className="border border-slate-300"></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100 font-semibold text-slate-900">
                <td colSpan={4} className="border border-slate-300 px-3 py-2 text-right">
                  รวมทั้งสิ้น ({order.items.length} รายการ)
                </td>
                <td className="border border-slate-300 px-2 py-2 text-center font-bold text-amber-800">
                  {order.items.reduce((sum, it) => sum + it.requestedQty, 0)}
                </td>
                <td className="border border-slate-300"></td>
                <td className="border border-slate-300"></td>
                <td className="border border-slate-300 px-2 py-2 text-right font-mono font-bold text-slate-950">
                  {order.totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                </td>
                <td className="border border-slate-300 text-center text-xs text-slate-600">บาท</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* 4 Official Signature Blocks (ตามระเบียบพัสดุมหาวิทยาลัย) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-4 border-t border-slate-200 text-xs text-center">
          {/* 1. ผู้ขอเบิก */}
          <div className="flex flex-col justify-between h-32 p-2 rounded-md bg-slate-50/50 border border-slate-100">
            <div>
              <p className="font-semibold text-slate-800">ลงชื่อ...........................................</p>
              <p className="text-slate-600 mt-1">({order.requesterName})</p>
              <p className="text-slate-500">ผู้ขอเบิก</p>
            </div>
            <p className="text-slate-400">วันที่ ......./......./...........</p>
          </div>

          {/* 2. หัวหน้างาน / ผู้เห็นชอบ */}
          <div className="flex flex-col justify-between h-32 p-2 rounded-md bg-slate-50/50 border border-slate-100">
            <div>
              <p className="font-semibold text-slate-800">ลงชื่อ...........................................</p>
              <p className="text-slate-600 mt-1">(...........................................)</p>
              <p className="text-slate-500">หัวหน้างาน / ผู้เห็นชอบ</p>
            </div>
            <p className="text-slate-400">วันที่ ......./......./...........</p>
          </div>

          {/* 3. เจ้าหน้าที่พัสดุ (ผู้จ่าย) */}
          <div className="flex flex-col justify-between h-32 p-2 rounded-md bg-slate-50/50 border border-slate-100">
            <div>
              <p className="font-semibold text-slate-800">ลงชื่อ...........................................</p>
              <p className="text-slate-600 mt-1">(...........................................)</p>
              <p className="text-slate-500">เจ้าหน้าที่พัสดุ (ผู้จ่าย)</p>
            </div>
            <p className="text-slate-400">วันที่ ......./......./...........</p>
          </div>

          {/* 4. ผู้รับพัสดุ */}
          <div className="flex flex-col justify-between h-32 p-2 rounded-md bg-slate-50/50 border border-slate-100">
            <div>
              <p className="font-semibold text-slate-800">ลงชื่อ...........................................</p>
              <p className="text-slate-600 mt-1">(...........................................)</p>
              <p className="text-slate-500">ผู้รับพัสดุ</p>
            </div>
            <p className="text-slate-400">วันที่ ......./......./...........</p>
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-6 pt-3 text-center text-[11px] text-slate-500 border-t border-dashed border-slate-200">
          * เอกสารฉบับนี้พิมพ์จากระบบสารสนเทศเบิกจ่ายวัสดุ วิทยาลัยการเมืองการปกครอง มหาวิทยาลัยมหาสารคาม
        </div>
      </div>
    </div>
  );
};
