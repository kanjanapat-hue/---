import { MaterialItem, StockInRecord } from '../types';

// Category color badges and helper mapping
export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'วัสดุสำนักงาน': { bg: 'bg-blue-50 text-blue-700', text: 'text-blue-700', border: 'border-blue-200' },
  'วัสดุคอมพิวเตอร์': { bg: 'bg-indigo-50 text-indigo-700', text: 'text-indigo-700', border: 'border-indigo-200' },
  'วัสดุงานบ้านและงานครัว': { bg: 'bg-emerald-50 text-emerald-700', text: 'text-emerald-700', border: 'border-emerald-200' },
  'วัสดุการศึกษา': { bg: 'bg-amber-50 text-amber-700', text: 'text-amber-700', border: 'border-amber-200' },
  'วัสดุวิทยาศาสตร์หรือการแพทย์': { bg: 'bg-teal-50 text-teal-700', text: 'text-teal-700', border: 'border-teal-200' },
  'วัสดุไฟฟ้าและวิทยุ': { bg: 'bg-yellow-50 text-yellow-800', text: 'text-yellow-800', border: 'border-yellow-200' },
  'วัสดุโฆษณาและเผยแพร่': { bg: 'bg-purple-50 text-purple-700', text: 'text-purple-700', border: 'border-purple-200' },
  'วัสดุการเกษตร': { bg: 'bg-lime-50 text-lime-700', text: 'text-lime-700', border: 'border-lime-200' },
  'วัสดุก่อสร้าง': { bg: 'bg-orange-50 text-orange-700', text: 'text-orange-700', border: 'border-orange-200' },
};

// Map items to representative realistic SVG / Unsplash image urls so users can visually preview materials
export const getMaterialImage = (name: string, category: string): string => {
  const lower = name.toLowerCase();
  if (lower.includes('กบเหลา') || lower.includes('เครื่องเหลา')) return 'https://images.unsplash.com/photo-1596496181871-9681eacf9764?w=400&auto=format&fit=crop&q=60';
  if (lower.includes('กรรไกร')) return 'https://images.unsplash.com/photo-1589256469067-ea99122bbdc4?w=400&auto=format&fit=crop&q=60';
  if (lower.includes('กระดาษ') && lower.includes('ชำระ') || lower.includes('ทิชชู่')) return 'https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=400&auto=format&fit=crop&q=60';
  if (lower.includes('กระดาษ') || lower.includes('รีม')) return 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&auto=format&fit=crop&q=60';
  if (lower.includes('กาว')) return 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=400&auto=format&fit=crop&q=60';
  if (lower.includes('คลิป') || lower.includes('ลวดเสียบ')) return 'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?w=400&auto=format&fit=crop&q=60';
  if (lower.includes('คัทเตอร์') || lower.includes('ใบมีด')) return 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=400&auto=format&fit=crop&q=60';
  if (lower.includes('เครื่องคิดเลข')) return 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=60';
  if (lower.includes('ซอง')) return 'https://images.unsplash.com/photo-1579208575657-c595a05383b7?w=400&auto=format&fit=crop&q=60';
  if (lower.includes('ดินสอ')) return 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400&auto=format&fit=crop&q=60';
  if (lower.includes('ถังดับเพลิง')) return 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&auto=format&fit=crop&q=60';
  if (lower.includes('เทป')) return 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=400&auto=format&fit=crop&q=60';
  if (lower.includes('ปากกา') || lower.includes('เมจิก') || lower.includes('ไฮไลท์')) return 'https://images.unsplash.com/photo-1585336261026-4182998a442e?w=400&auto=format&fit=crop&q=60';
  if (lower.includes('โพสต์อิท') || lower.includes('post-it')) return 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&auto=format&fit=crop&q=60';
  if (lower.includes('แฟ้ม')) return 'https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?w=400&auto=format&fit=crop&q=60';
  if (lower.includes('แม็ก') || lower.includes('ลูกแม็ก')) return 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&auto=format&fit=crop&q=60';
  if (lower.includes('ไม้บรรทัด')) return 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&auto=format&fit=crop&q=60';
  if (lower.includes('ยางลบ')) return 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=400&auto=format&fit=crop&q=60';
  if (lower.includes('แอลกอฮอล์') || lower.includes('เจลทำความสะอาดมือ')) return 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=60';
  if (lower.includes('ถ่าน')) return 'https://images.unsplash.com/photo-1619725002198-6a689b72f41d?w=400&auto=format&fit=crop&q=60';
  if (lower.includes('ปลั๊ก')) return 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&auto=format&fit=crop&q=60';
  if (lower.includes('หลอดไฟ')) return 'https://images.unsplash.com/photo-1507499739999-097706ad8914?w=400&auto=format&fit=crop&q=60';
  if (lower.includes('น้ำยา') || lower.includes('สบู่') || lower.includes('ไฮเตอร์')) return 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400&auto=format&fit=crop&q=60';
  if (lower.includes('ไม้กวาด') || lower.includes('ไม้ถูพื้น') || lower.includes('ที่โกย')) return 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&auto=format&fit=crop&q=60';
  if (lower.includes('ถุงมือ')) return 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=400&auto=format&fit=crop&q=60';
  if (lower.includes('ถุงขยะ') || lower.includes('ถังขยะ')) return 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?w=400&auto=format&fit=crop&q=60';
  if (lower.includes('คีย์บอร์ด') || lower.includes('เมาส์')) return 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&auto=format&fit=crop&q=60';
  if (lower.includes('หมึก Brother') || lower.includes('หมึก HP') || lower.includes('ดรัม')) return 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400&auto=format&fit=crop&q=60';
  if (lower.includes('แฟลชไดร์ฟ') || lower.includes('ฮาร์ดดิสก์') || lower.includes('เอสเอสดี')) return 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?w=400&auto=format&fit=crop&q=60';
  if (lower.includes('สาย hdmi') || lower.includes('สายแลน') || lower.includes('สาย usb')) return 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60';

  if (category === 'วัสดุสำนักงาน') return 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=400&auto=format&fit=crop&q=60';
  if (category === 'วัสดุคอมพิวเตอร์') return 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&auto=format&fit=crop&q=60';
  if (category === 'วัสดุงานบ้านและงานครัว') return 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&auto=format&fit=crop&q=60';
  return 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&auto=format&fit=crop&q=60';
};

// Parsed initial raw list directly from user's provided sheet data
export const INITIAL_MATERIALS: MaterialItem[] = [
  { no: 1, id: '1ก01', name: 'กบเหลาดินสอ (เล็ก)', category: 'วัสดุสำนักงาน', unitPrice: 20, purchaseQty: 24, unit: 'อัน', minQty: 2, maxQty: 50, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 480, totalWithdrawn: 0, monthlyAverage: 0 },
  { no: 2, id: '1ก02', name: 'กรรไกร', category: 'วัสดุสำนักงาน', unitPrice: 65, purchaseQty: 24, unit: 'อัน', minQty: 5, maxQty: 50, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 1560, totalWithdrawn: 15, monthlyAverage: 3 },
  { no: 3, id: '1ก18', name: 'กระดาษกาว 1.5 นิ้ว', category: 'วัสดุสำนักงาน', unitPrice: 30, purchaseQty: 50, unit: 'ม้วน', minQty: 5, maxQty: 50, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ครั้งคราว', totalPurchaseCost: 1500, totalWithdrawn: 8, monthlyAverage: 2 },
  { no: 4, id: '1ก03', name: 'กระดาษขาว 150 แกรม', category: 'วัสดุสำนักงาน', unitPrice: 100, purchaseQty: 20, unit: 'แพ็ค', minQty: 3, maxQty: 20, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 2000, totalWithdrawn: 8, monthlyAverage: 2 },
  { no: 5, id: '1ก04', name: 'กระดาษขาว 180 แกรม', category: 'วัสดุสำนักงาน', unitPrice: 110, purchaseQty: 20, unit: 'แพ็ค', minQty: 3, maxQty: 20, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 2200, totalWithdrawn: 6, monthlyAverage: 1.5 },
  { no: 6, id: '1ก05', name: 'กระดาษขาวอาร์ตมัน 260แกรม', category: 'วัสดุสำนักงาน', unitPrice: 160, purchaseQty: 20, unit: 'แพ็ค', minQty: 1, maxQty: 20, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 3200, totalWithdrawn: 4, monthlyAverage: 1 },
  { no: 7, id: '1ก06', name: 'กระดาษบวกเลข 2.5 นิ้ว', category: 'วัสดุสำนักงาน', unitPrice: 78, purchaseQty: 10, unit: 'แพ็ค', minQty: 1, maxQty: 6, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ครั้งคราว', totalPurchaseCost: 780, totalWithdrawn: 2, monthlyAverage: 0.5 },
  { no: 8, id: '1ก17', name: 'กระดาษเรนโบว์ ห่อของขวัญ', category: 'วัสดุสำนักงาน', unitPrice: 20, purchaseQty: 30, unit: 'แผ่น', minQty: 5, maxQty: 50, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ครั้งคราว', totalPurchaseCost: 600, totalWithdrawn: 5, monthlyAverage: 1 },
  { no: 9, id: '1ก07', name: 'กระดาษสติกเกอร์ขาวด้าน A4', category: 'วัสดุสำนักงาน', unitPrice: 100, purchaseQty: 20, unit: 'แพ็ค', minQty: 2, maxQty: 20, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 2000, totalWithdrawn: 9, monthlyAverage: 2.2 },
  { no: 10, id: '1ก08', name: 'กระดาษสติกเกอร์ขาวมันวาว A4', category: 'วัสดุสำนักงาน', unitPrice: 100, purchaseQty: 20, unit: 'แพ็ค', minQty: 1, maxQty: 20, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 2000, totalWithdrawn: 6, monthlyAverage: 1.5 },
  { no: 11, id: '1ก09', name: 'กระดาษสี 120 แกรม', category: 'วัสดุสำนักงาน', unitPrice: 110, purchaseQty: 20, unit: 'แพ็ค', minQty: 3, maxQty: 20, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 2200, totalWithdrawn: 5, monthlyAverage: 1.2 },
  { no: 12, id: '1ก10', name: 'กระดาษสี 150 แกรม', category: 'วัสดุสำนักงาน', unitPrice: 100, purchaseQty: 20, unit: 'แพ็ค', minQty: 3, maxQty: 20, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 2000, totalWithdrawn: 7, monthlyAverage: 1.8 },
  { no: 13, id: '1ก11', name: 'กระดาษสี 180 แกรม', category: 'วัสดุสำนักงาน', unitPrice: 65, purchaseQty: 20, unit: 'แพ็ค', minQty: 3, maxQty: 20, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 1300, totalWithdrawn: 4, monthlyAverage: 1 },
  { no: 14, id: '1ก12', name: 'กระดาษสี 80 แกรม', category: 'วัสดุสำนักงาน', unitPrice: 100, purchaseQty: 20, unit: 'แพ็ค', minQty: 3, maxQty: 20, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 2000, totalWithdrawn: 4, monthlyAverage: 1 },
  { no: 15, id: '1ก13', name: 'กาวตราช้าง', category: 'วัสดุสำนักงาน', unitPrice: 25, purchaseQty: 24, unit: 'อัน', minQty: 2, maxQty: 50, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 600, totalWithdrawn: 6, monthlyAverage: 1.5 },
  { no: 16, id: '1ก14', name: 'กาวแท่ง', category: 'วัสดุสำนักงาน', unitPrice: 60, purchaseQty: 50, unit: 'แท่ง', minQty: 10, maxQty: 50, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 3000, totalWithdrawn: 20, monthlyAverage: 5 },
  { no: 17, id: '1ก15', name: 'กาวน้ำ', category: 'วัสดุสำนักงาน', unitPrice: 30, purchaseQty: 50, unit: 'แท่ง', minQty: 10, maxQty: 50, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 1500, totalWithdrawn: 12, monthlyAverage: 3 },
  { no: 18, id: '1ก16', name: 'กาวร้อน', category: 'วัสดุสำนักงาน', unitPrice: 16, purchaseQty: 24, unit: 'อัน', minQty: 2, maxQty: 12, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 384, totalWithdrawn: 5, monthlyAverage: 1.2 },
  { no: 19, id: '1ข01', name: 'ขี้ผึ้งนับธนบัตร', category: 'วัสดุสำนักงาน', unitPrice: 30, purchaseQty: 12, unit: 'อัน', minQty: 3, maxQty: 50, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 360, totalWithdrawn: 3, monthlyAverage: 0.8 },
  { no: 36, id: '1ค01', name: 'คลิปดำหนีบกระดาษ เบอร์ 8 mm', category: 'วัสดุสำนักงาน', unitPrice: 20, purchaseQty: 48, unit: 'กล่อง', minQty: 25, maxQty: 200, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 960, totalWithdrawn: 10, monthlyAverage: 2.5 },
  { no: 37, id: '1ค02', name: 'คลิปดำหนีบกระดาษ เบอร์ 10 mm', category: 'วัสดุสำนักงาน', unitPrice: 20, purchaseQty: 50, unit: 'กล่อง', minQty: 25, maxQty: 200, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 1000, totalWithdrawn: 8, monthlyAverage: 2 },
  { no: 38, id: '1ค03', name: 'คลิปดำหนีบกระดาษ เบอร์ 12 mm', category: 'วัสดุสำนักงาน', unitPrice: 30, purchaseQty: 50, unit: 'กล่อง', minQty: 25, maxQty: 200, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 1500, totalWithdrawn: 15, monthlyAverage: 3.5 },
  { no: 39, id: '1ค04', name: 'คลิปดำหนีบกระดาษ เบอร์ 17.5 mm', category: 'วัสดุสำนักงาน', unitPrice: 40, purchaseQty: 50, unit: 'กล่อง', minQty: 25, maxQty: 200, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 2000, totalWithdrawn: 12, monthlyAverage: 3 },
  { no: 40, id: '1ค05', name: 'คลิปดำหนีบกระดาษ เบอร์ 22 mm', category: 'วัสดุสำนักงาน', unitPrice: 50, purchaseQty: 50, unit: 'กล่อง', minQty: 25, maxQty: 200, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 2500, totalWithdrawn: 18, monthlyAverage: 4 },
  { no: 41, id: '1ค26', name: 'คลิปบอร์ด แผ่นรองเซ็น', category: 'วัสดุสำนักงาน', unitPrice: 55, purchaseQty: 20, unit: 'แผ่น', minQty: 2, maxQty: 50, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 1100, totalWithdrawn: 6, monthlyAverage: 1.5 },
  { no: 42, id: '1ค06', name: 'คัทเตอร์', category: 'วัสดุสำนักงาน', unitPrice: 55, purchaseQty: 36, unit: 'อัน', minQty: 6, maxQty: 50, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 1980, totalWithdrawn: 14, monthlyAverage: 3.2 },
  { no: 43, id: '1ค07', name: 'เครื่องคิดเลข', category: 'วัสดุสำนักงาน', unitPrice: 700, purchaseQty: 10, unit: 'เครื่อง', minQty: 2, maxQty: 12, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 7000, totalWithdrawn: 4, monthlyAverage: 1 },
  { no: 44, id: '1ค08', name: 'เครื่องเหลาดินสอ', category: 'วัสดุสำนักงาน', unitPrice: 250, purchaseQty: 6, unit: 'อัน', minQty: 1, maxQty: 20, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 1500, totalWithdrawn: 2, monthlyAverage: 0.5 },
  { no: 47, id: '1ซ01', name: 'ซองขาว 2 พับ', category: 'วัสดุสำนักงาน', unitPrice: 1, purchaseQty: 500, unit: 'ซอง', minQty: 100, maxQty: 1000, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 500, totalWithdrawn: 150, monthlyAverage: 40 },
  { no: 48, id: '1ซ02', name: 'ซองขาว A4', category: 'วัสดุสำนักงาน', unitPrice: 1, purchaseQty: 500, unit: 'ซอง', minQty: 100, maxQty: 1000, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 500, totalWithdrawn: 180, monthlyAverage: 45 },
  { no: 50, id: '1ซ04', name: 'ซองขาวจดหมาย ครุฑ', category: 'วัสดุสำนักงาน', unitPrice: 1, purchaseQty: 1000, unit: 'ซอง', minQty: 100, maxQty: 1000, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 1000, totalWithdrawn: 320, monthlyAverage: 80 },
  { no: 56, id: '1ซ10', name: 'ซองสีน้ำตาล ครุฑ A4', category: 'วัสดุสำนักงาน', unitPrice: 4, purchaseQty: 1000, unit: 'ซอง', minQty: 100, maxQty: 1000, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 4000, totalWithdrawn: 460, monthlyAverage: 110 },
  { no: 57, id: '1ซ11', name: 'ซองสีน้ำตาล ครุฑ A4 ขยายข้าง', category: 'วัสดุสำนักงาน', unitPrice: 5, purchaseQty: 500, unit: 'ซอง', minQty: 100, maxQty: 1000, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 2500, totalWithdrawn: 220, monthlyAverage: 50 },
  { no: 62, id: '1ด01', name: 'ดินสอ 2B', category: 'วัสดุสำนักงาน', unitPrice: 5, purchaseQty: 200, unit: 'แท่ง', minQty: 30, maxQty: 200, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 1000, totalWithdrawn: 80, monthlyAverage: 20 },
  { no: 67, id: '1ต02', name: 'ตราแสตมป์สำเนาถูกต้อง หมึกในตัว', category: 'วัสดุสำนักงาน', unitPrice: 150, purchaseQty: 12, unit: 'อัน', minQty: 2, maxQty: 30, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 1800, totalWithdrawn: 5, monthlyAverage: 1.2 },
  { no: 69, id: '1ต04', name: 'ตัวดึงลูกแม็ก', category: 'วัสดุสำนักงาน', unitPrice: 80, purchaseQty: 20, unit: 'อัน', minQty: 5, maxQty: 40, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 1600, totalWithdrawn: 5, monthlyAverage: 1 },
  { no: 76, id: '1ท01', name: 'เทป 2 หน้า โฟมกาว', category: 'วัสดุสำนักงาน', unitPrice: 200, purchaseQty: 24, unit: 'ม้วน', minQty: 6, maxQty: 100, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 4800, totalWithdrawn: 10, monthlyAverage: 2.5 },
  { no: 77, id: '1ท02', name: 'เทป 2 หน้า เยื่อกาว', category: 'วัสดุสำนักงาน', unitPrice: 60, purchaseQty: 24, unit: 'ม้วน', minQty: 10, maxQty: 100, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 1440, totalWithdrawn: 8, monthlyAverage: 2 },
  { no: 78, id: '1ท12', name: 'เทปปิดกล่อง 48 มม.X45 หลา', category: 'วัสดุสำนักงาน', unitPrice: 45, purchaseQty: 24, unit: 'ม้วน', minQty: 4, maxQty: 100, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 1080, totalWithdrawn: 6, monthlyAverage: 1.5 },
  { no: 79, id: '1ท03', name: 'เทปผ้ากาว 48 มม. X 45 หลา', category: 'วัสดุสำนักงาน', unitPrice: 30, purchaseQty: 80, unit: 'ม้วน', minQty: 10, maxQty: 100, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 2400, totalWithdrawn: 35, monthlyAverage: 8 },
  { no: 81, id: '1ท04', name: 'เทปใส 24 มม.X 33 มม. แกน 1 นิ้ว', category: 'วัสดุสำนักงาน', unitPrice: 40, purchaseQty: 80, unit: 'ม้วน', minQty: 10, maxQty: 100, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 3200, totalWithdrawn: 28, monthlyAverage: 6 },
  { no: 103, id: '1ป07', name: 'ปากกาดำ', category: 'วัสดุสำนักงาน', unitPrice: 4, purchaseQty: 200, unit: 'แท่ง', minQty: 50, maxQty: 150, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 800, totalWithdrawn: 90, monthlyAverage: 22 },
  { no: 104, id: '1ป08', name: 'ปากกาดำ(เจล) 0.5', category: 'วัสดุสำนักงาน', unitPrice: 45, purchaseQty: 48, unit: 'แท่ง', minQty: 10, maxQty: 120, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 2160, totalWithdrawn: 20, monthlyAverage: 5 },
  { no: 107, id: '1ป11', name: 'ปากกาแดง', category: 'วัสดุสำนักงาน', unitPrice: 4, purchaseQty: 200, unit: 'แท่ง', minQty: 50, maxQty: 150, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 800, totalWithdrawn: 105, monthlyAverage: 25 },
  { no: 108, id: '1ป12', name: 'ปากกาแดง 0.5', category: 'วัสดุสำนักงาน', unitPrice: 35, purchaseQty: 48, unit: 'แท่ง', minQty: 20, maxQty: 120, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 1680, totalWithdrawn: 18, monthlyAverage: 4 },
  { no: 114, id: '1ป18', name: 'ปากกาน้ำเงิน', category: 'วัสดุสำนักงาน', unitPrice: 8, purchaseQty: 200, unit: 'แท่ง', minQty: 50, maxQty: 300, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 1600, totalWithdrawn: 60, monthlyAverage: 15 },
  { no: 118, id: '1ป22', name: 'ปากกาน้ำเงิน(เจล) 0.5', category: 'วัสดุสำนักงาน', unitPrice: 45, purchaseQty: 48, unit: 'แท่ง', minQty: 30, maxQty: 180, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 2160, totalWithdrawn: 26, monthlyAverage: 6 },
  { no: 124, id: '1ป25', name: 'ปากกาไวท์บอร์ด ดำ', category: 'วัสดุสำนักงาน', unitPrice: 20, purchaseQty: 50, unit: 'แท่ง', minQty: 20, maxQty: 100, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 1000, totalWithdrawn: 18, monthlyAverage: 4 },
  { no: 125, id: '1ป26', name: 'ปากกาไวท์บอร์ด แดง', category: 'วัสดุสำนักงาน', unitPrice: 20, purchaseQty: 50, unit: 'แท่ง', minQty: 20, maxQty: 100, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 1000, totalWithdrawn: 24, monthlyAverage: 5 },
  { no: 126, id: '1ป27', name: 'ปากกาไวท์บอร์ด น้ำเงิน', category: 'วัสดุสำนักงาน', unitPrice: 20, purchaseQty: 50, unit: 'แท่ง', minQty: 20, maxQty: 100, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 1000, totalWithdrawn: 15, monthlyAverage: 3.5 },
  { no: 127, id: '1ป28', name: 'ปากกาไฮไลท์ สีชมพู', category: 'วัสดุสำนักงาน', unitPrice: 30, purchaseQty: 48, unit: 'แท่ง', minQty: 10, maxQty: 100, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 1440, totalWithdrawn: 24, monthlyAverage: 5 },
  { no: 129, id: '1ป30', name: 'ปากกาไฮไลท์ สีเหลือง', category: 'วัสดุสำนักงาน', unitPrice: 30, purchaseQty: 48, unit: 'แท่ง', minQty: 10, maxQty: 100, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 1440, totalWithdrawn: 18, monthlyAverage: 4 },
  { no: 138, id: '1พ03', name: 'โพสต์อิท ขนาด 76 mm. X 76 mm.', category: 'วัสดุสำนักงาน', unitPrice: 35, purchaseQty: 60, unit: 'อัน', minQty: 10, maxQty: 200, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 2100, totalWithdrawn: 20, monthlyAverage: 4 },
  { no: 141, id: '1ฟ03', name: 'แฟ้มตราช้างสันกว้าง ดำ', category: 'วัสดุสำนักงาน', unitPrice: 85, purchaseQty: 48, unit: 'แฟ้ม', minQty: 5, maxQty: 150, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 4080, totalWithdrawn: 22, monthlyAverage: 5 },
  { no: 142, id: '1ฟ04', name: 'แฟ้มตราช้างสันกว้าง แดง', category: 'วัสดุสำนักงาน', unitPrice: 85, purchaseQty: 72, unit: 'แฟ้ม', minQty: 5, maxQty: 150, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 6120, totalWithdrawn: 24, monthlyAverage: 5.5 },
  { no: 151, id: '1ม01', name: 'แม็กเย็บกระดาษ เบอร์ 35', category: 'วัสดุสำนักงาน', unitPrice: 380, purchaseQty: 12, unit: 'อัน', minQty: 3, maxQty: 50, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 4560, totalWithdrawn: 4, monthlyAverage: 1 },
  { no: 152, id: '1ม02', name: 'แม็กเย็บกระดาษ เบอร์ 10', category: 'วัสดุสำนักงาน', unitPrice: 85, purchaseQty: 12, unit: 'อัน', minQty: 3, maxQty: 50, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 1020, totalWithdrawn: 3, monthlyAverage: 0.8 },
  { no: 164, id: '1ล08', name: 'ลูกแม็ก เบอร์ 10', category: 'วัสดุสำนักงาน', unitPrice: 10, purchaseQty: 100, unit: 'กล่อง', minQty: 10, maxQty: 200, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 1000, totalWithdrawn: 35, monthlyAverage: 8 },
  { no: 170, id: '1ล12', name: 'ลูกแม็ก เบอร์ 35', category: 'วัสดุสำนักงาน', unitPrice: 15, purchaseQty: 100, unit: 'กล่อง', minQty: 10, maxQty: 200, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 1500, totalWithdrawn: 30, monthlyAverage: 7 },

  // คอมพิวเตอร์
  { no: 291, id: '3ก01', name: 'กล้องติดคอมพิวเตอร์ (Webcam HD)', category: 'วัสดุคอมพิวเตอร์', unitPrice: 550, purchaseQty: 12, unit: 'ชุด', minQty: 1, maxQty: 12, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 6600, totalWithdrawn: 6, monthlyAverage: 1 },
  { no: 294, id: '3ค01', name: 'คีย์บอร์ด USB', category: 'วัสดุคอมพิวเตอร์', unitPrice: 360, purchaseQty: 20, unit: 'อัน', minQty: 2, maxQty: 20, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 7200, totalWithdrawn: 12, monthlyAverage: 2.5 },
  { no: 300, id: '3ด01', name: 'ดรัม Brother DR2455', category: 'วัสดุคอมพิวเตอร์', unitPrice: 3190, purchaseQty: 15, unit: 'กล่อง', minQty: 3, maxQty: 15, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 47850, totalWithdrawn: 11, monthlyAverage: 2 },
  { no: 306, id: '3ผ03', name: 'แผ่นรองเมาส์', category: 'วัสดุคอมพิวเตอร์', unitPrice: 90, purchaseQty: 20, unit: 'แผ่น', minQty: 2, maxQty: 20, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 1800, totalWithdrawn: 9, monthlyAverage: 2 },
  { no: 308, id: '3ฟ01', name: 'แฟลชไดร์ฟ 32GB', category: 'วัสดุคอมพิวเตอร์', unitPrice: 220, purchaseQty: 50, unit: 'อัน', minQty: 5, maxQty: 50, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 11000, totalWithdrawn: 28, monthlyAverage: 6 },
  { no: 310, id: '3ฟ02', name: 'แฟลชไดร์ฟ 64GB', category: 'วัสดุคอมพิวเตอร์', unitPrice: 130, purchaseQty: 20, unit: 'อัน', minQty: 7, maxQty: 20, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 2600, totalWithdrawn: 15, monthlyAverage: 3 },
  { no: 312, id: '3ม01', name: 'เมาส์ USB มีสาย', category: 'วัสดุคอมพิวเตอร์', unitPrice: 180, purchaseQty: 20, unit: 'อัน', minQty: 2, maxQty: 10, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 3600, totalWithdrawn: 11, monthlyAverage: 2.5 },
  { no: 320, id: '3ส06', name: 'สาย HDMI 1.5 เมตร', category: 'วัสดุคอมพิวเตอร์', unitPrice: 200, purchaseQty: 12, unit: 'เส้น', minQty: 2, maxQty: 12, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 2400, totalWithdrawn: 7, monthlyAverage: 1.5 },
  { no: 321, id: '3ส07', name: 'สาย HDMI 1.8 เมตร', category: 'วัสดุคอมพิวเตอร์', unitPrice: 250, purchaseQty: 12, unit: 'เส้น', minQty: 2, maxQty: 12, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 3000, totalWithdrawn: 6, monthlyAverage: 1 },
  { no: 332, id: '3ห01', name: 'หมึก Brother 2480', category: 'วัสดุคอมพิวเตอร์', unitPrice: 3390, purchaseQty: 15, unit: 'กล่อง', minQty: 3, maxQty: 15, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 50850, totalWithdrawn: 10, monthlyAverage: 2 },
  { no: 338, id: '3ห07', name: 'หมึก HP48A', category: 'วัสดุคอมพิวเตอร์', unitPrice: 2790, purchaseQty: 15, unit: 'กล่อง', minQty: 3, maxQty: 15, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 41850, totalWithdrawn: 11, monthlyAverage: 2.2 },
  { no: 349, id: '3ฮ01', name: 'ฮาร์ดดิสก์พกพา 1 TB (External Hard Disk)', category: 'วัสดุคอมพิวเตอร์', unitPrice: 1500, purchaseQty: 12, unit: 'อัน', minQty: 1, maxQty: 12, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ครั้งคราว', totalPurchaseCost: 18000, totalWithdrawn: 7, monthlyAverage: 1.2 },

  // วัสดุงานบ้านและงานครัว
  { no: 199, id: '4ก01', name: 'กระดาษชำระจัมโบ้โรล', category: 'วัสดุงานบ้านและงานครัว', unitPrice: 75, purchaseQty: 144, unit: 'ม้วน', minQty: 48, maxQty: 432, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 10800, totalWithdrawn: 64, monthlyAverage: 16 },
  { no: 200, id: '4ก02', name: 'กระดาษเช็ดชู่ กล่อง', category: 'วัสดุงานบ้านและงานครัว', unitPrice: 30, purchaseQty: 240, unit: 'กล่อง', minQty: 30, maxQty: 420, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 7200, totalWithdrawn: 120, monthlyAverage: 30 },
  { no: 221, id: '4ถ03', name: 'ถุงขยะดำ 22x30', category: 'วัสดุงานบ้านและงานครัว', unitPrice: 40, purchaseQty: 50, unit: 'แพ็ค', minQty: 25, maxQty: 100, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 2000, totalWithdrawn: 15, monthlyAverage: 4 },
  { no: 222, id: '4ถ04', name: 'ถุงขยะดำ 36x45', category: 'วัสดุงานบ้านและงานครัว', unitPrice: 40, purchaseQty: 150, unit: 'แพ็ค', minQty: 75, maxQty: 300, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 6000, totalWithdrawn: 40, monthlyAverage: 10 },
  { no: 226, id: '4ถ08', name: 'ถุงมือยางสีส้ม L', category: 'วัสดุงานบ้านและงานครัว', unitPrice: 25, purchaseQty: 24, unit: 'ชิ้น', minQty: 20, maxQty: 50, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 600, totalWithdrawn: 6, monthlyAverage: 1.5 },
  { no: 243, id: '4น08', name: 'น้ำยาเช็ดกระจก', category: 'วัสดุงานบ้านและงานครัว', unitPrice: 65, purchaseQty: 24, unit: 'ขวด', minQty: 3, maxQty: 36, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 1560, totalWithdrawn: 10, monthlyAverage: 2.5 },
  { no: 250, id: '4น11', name: 'น้ำยาล้างจาน', category: 'วัสดุงานบ้านและงานครัว', unitPrice: 40, purchaseQty: 12, unit: 'ขวด', minQty: 6, maxQty: 36, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 480, totalWithdrawn: 5, monthlyAverage: 1.2 },
  { no: 252, id: '4น13', name: 'น้ำยาล้างห้องน้ำ', category: 'วัสดุงานบ้านและงานครัว', unitPrice: 55, purchaseQty: 24, unit: 'แกลลอน', minQty: 2, maxQty: 36, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 1320, totalWithdrawn: 8, monthlyAverage: 2 },
  { no: 256, id: '4บ01', name: 'ไบกอน (ยุงมดแมลงสาบ)', category: 'วัสดุงานบ้านและงานครัว', unitPrice: 110, purchaseQty: 24, unit: 'ขวด', minQty: 2, maxQty: 20, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 2640, totalWithdrawn: 13, monthlyAverage: 3 },
  { no: 268, id: '4ม01', name: 'ไม้กวาดดอกหญ้า', category: 'วัสดุงานบ้านและงานครัว', unitPrice: 45, purchaseQty: 20, unit: 'ด้าม', minQty: 1, maxQty: 10, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 900, totalWithdrawn: 12, monthlyAverage: 2.5 },
  { no: 279, id: '4ส03', name: 'สบู่เหลวล้างมือ', category: 'วัสดุงานบ้านและงานครัว', unitPrice: 160, purchaseQty: 6, unit: 'แกลลอน', minQty: 3, maxQty: 36, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 960, totalWithdrawn: 2, monthlyAverage: 0.5 },

  // วัสดุการศึกษา
  { no: 361, id: '2ก01', name: 'กระดาษ A3', category: 'วัสดุการศึกษา', unitPrice: 249, purchaseQty: 20, unit: 'รีม', minQty: 5, maxQty: 20, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 4980, totalWithdrawn: 12, monthlyAverage: 3 },
  { no: 362, id: '2ก02', name: 'กระดาษ A4 70 แกรม', category: 'วัสดุการศึกษา', unitPrice: 100, purchaseQty: 400, unit: 'รีม', minQty: 50, maxQty: 400, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 40000, totalWithdrawn: 220, monthlyAverage: 55 },
  { no: 363, id: '2ก03', name: 'กระดาษ A4 80 แกรม', category: 'วัสดุการศึกษา', unitPrice: 110, purchaseQty: 400, unit: 'รีม', minQty: 50, maxQty: 400, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 44000, totalWithdrawn: 260, monthlyAverage: 65 },
  { no: 364, id: '2ก04', name: 'กระดาษ F14 80 แกรม', category: 'วัสดุการศึกษา', unitPrice: 180, purchaseQty: 20, unit: 'รีม', minQty: 5, maxQty: 20, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 3600, totalWithdrawn: 8, monthlyAverage: 2 },

  // วัสดุไฟฟ้าและวิทยุ
  { no: 188, id: '7ถ01', name: 'ถ่าน AA', category: 'วัสดุไฟฟ้าและวิทยุ', unitPrice: 55, purchaseQty: 100, unit: 'แพ็ค', minQty: 20, maxQty: 200, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 5500, totalWithdrawn: 40, monthlyAverage: 10 },
  { no: 189, id: '7ถ02', name: 'ถ่าน AAA', category: 'วัสดุไฟฟ้าและวิทยุ', unitPrice: 60, purchaseQty: 100, unit: 'แพ็ค', minQty: 20, maxQty: 200, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 6000, totalWithdrawn: 45, monthlyAverage: 11 },
  { no: 195, id: '7ป03', name: 'ปลั๊กพ่วง 5m', category: 'วัสดุไฟฟ้าและวิทยุ', unitPrice: 450, purchaseQty: 20, unit: 'อัน', minQty: 6, maxQty: 100, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 9000, totalWithdrawn: 8, monthlyAverage: 2 },

  // วัสดุวิทยาศาสตร์หรือการแพทย์
  { no: 185, id: '5อ01', name: 'แอลกอฮอล์ทำความสะอาดมือ ขวดเล็ก', category: 'วัสดุวิทยาศาสตร์หรือการแพทย์', unitPrice: 100, purchaseQty: 24, unit: 'ขวด', minQty: 3, maxQty: 12, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 2400, totalWithdrawn: 9, monthlyAverage: 2.2 },
  { no: 186, id: '5อ02', name: 'แอลกอฮอล์ทำความสะอาดมือ ขวดใหญ่', category: 'วัสดุวิทยาศาสตร์หรือการแพทย์', unitPrice: 350, purchaseQty: 12, unit: 'แกลลอน', minQty: 2, maxQty: 12, currentStock: 0, refillStatus: 'วัสดุหมด', usageStatus: 'ประจำ', totalPurchaseCost: 4200, totalWithdrawn: 5, monthlyAverage: 1 }
].map(item => {
  const stock = 20;
  const refillStatus: 'OK' | 'ใกล้หมด' | 'วัสดุหมด' = stock >= item.minQty ? 'OK' : (stock > 0 ? 'ใกล้หมด' : 'วัสดุหมด');
  return {
    ...item,
    currentStock: stock,
    imageUrl: getMaterialImage(item.name, item.category),
    refillStatus
  };
});

export const DEPARTMENTS = [
  'สำนักงานคณบดี',
  'งานบริหารทั่วไปและธุรการ',
  'งานการเงินและพัสดุ',
  'งานนโยบายและแผน',
  'งานบริการการศึกษาและพัฒนาคุณภาพนิสิต',
  'งานวิจัยและบริการวิชาการ',
  'สาขาวิชารัฐศาสตร์',
  'สาขาวิชารัฐประศาสนศาสตร์',
  'สาขาวิชาความสัมพันธ์ระหว่างประเทศ',
  'ศูนย์บริการวิชาการวิทยาลัยการเมืองการปกครอง'
];

export const INITIAL_ORDERS = [
  {
    id: 'REQ-2569-0002',
    docNo: 'COPAG-REQ-2569/002',
    date: '2026-09-09',
    requesterName: 'ดร.สมชาย ปรีชาชาญ',
    requesterEmail: 'somchai.p@msu.ac.th',
    requesterPosition: 'อาจารย์ประจำสาขาวิชา',
    department: 'สาขาวิชารัฐประศาสนศาสตร์',
    purpose: 'ขอเบิกวัสดุสำหรับจัดการเรียนการสอนและการสอบวัดผลกลางภาค ภาคเรียนที่ 1/2569',
    items: [
      { materialId: '2ก03', name: 'กระดาษ A4 80 แกรม', category: 'วัสดุการศึกษา', unit: 'รีม', unitPrice: 110, requestedQty: 3, totalAmount: 330, remark: 'สำหรับพิมพ์ข้อสอบกลางภาค' },
      { materialId: '1ป18', name: 'ปากกาน้ำเงิน', category: 'วัสดุสำนักงาน', unit: 'แท่ง', unitPrice: 8, requestedQty: 5, totalAmount: 40, remark: 'อาจารย์ผู้คุมสอบ' },
      { materialId: '1ย01', name: 'ยางลบดินสอ', category: 'วัสดุสำนักงาน', unit: 'ก้อน', unitPrice: 5, requestedQty: 4, totalAmount: 20, remark: 'สำรองในห้องสอบ' }
    ],
    totalItems: 3,
    totalAmount: 390,
    status: 'รออนุมัติ' as const
  },
  {
    id: 'REQ-2569-0001',
    docNo: 'COPAG-REQ-2569/001',
    date: '2026-09-08',
    requesterName: 'กาญจนภาษณ์ มาตบุรม',
    requesterEmail: 'kanjanapat.m@msu.ac.th',
    requesterPosition: 'นักวิชาการศึกษา',
    department: 'งานบริการการศึกษาและพัฒนาคุณภาพนิสิต',
    purpose: 'ใช้สำหรับจัดการประชุมกรรมการบริหารวิทยาลัย และจัดทำเอกสารหลักสูตร',
    items: [
      { materialId: '2ก03', name: 'กระดาษ A4 80 แกรม', category: 'วัสดุการศึกษา', unit: 'รีม', unitPrice: 110, requestedQty: 5, approvedQty: 5, totalAmount: 550, remark: 'สำหรับจัดพิมพ์เอกสารประชุม' },
      { materialId: '1ป18', name: 'ปากกาน้ำเงิน', category: 'วัสดุสำนักงาน', unit: 'แท่ง', unitPrice: 8, requestedQty: 10, approvedQty: 10, totalAmount: 80, remark: 'ใช้ในห้องประชุม' },
      { materialId: '1พ03', name: 'โพสต์อิท ขนาด 76 mm. X 76 mm.', category: 'วัสดุสำนักงาน', unit: 'อัน', unitPrice: 35, requestedQty: 4, approvedQty: 4, totalAmount: 140, remark: 'จัดหมวดหมู่เอกสาร' }
    ],
    totalItems: 3,
    totalAmount: 770,
    status: 'เบิกจ่ายแล้ว' as const,
    approverName: 'รองคณบดีฝ่ายบริหาร',
    disbursedDate: '2026-09-08 14:30'
  }
];

export const INITIAL_STOCK_IN: StockInRecord[] = INITIAL_MATERIALS.map((item, idx) => {
  // If the item has an initial stock out record, adjust incoming quantity so net stock is exactly 20
  const outQty = item.id === '2ก03' ? 5 : item.id === '1ป18' ? 10 : item.id === '1พ03' ? 4 : 0;
  const qty = 20 + outQty;
  return {
    id: `IN-2569-BATCH-${String(idx + 1).padStart(3, '0')}`,
    date: '2026-09-02',
    docNo: 'PO-COPAG-2569/001',
    materialId: item.id,
    materialName: item.name,
    category: item.category,
    quantity: qty,
    unit: item.unit,
    unitPrice: item.unitPrice,
    totalPrice: item.unitPrice * qty,
    supplier: 'ร้านสหกรณ์มหาวิทยาลัยมหาสารคาม จำกัด',
    receiverName: 'เจ้าหน้าที่งานการเงินและพัสดุ',
    note: 'รับเข้าวัสดุเริ่มต้นทุกรายการอย่างละ 20 หน่วย'
  };
});

export const INITIAL_STOCK_OUT = [
  {
    id: 'OUT-2569-001',
    date: '2026-09-08',
    requisitionDocNo: 'COPAG-REQ-2569/001',
    materialId: '2ก03',
    materialName: 'กระดาษ A4 80 แกรม',
    category: 'วัสดุการศึกษา',
    quantity: 5,
    unit: 'รีม',
    unitPrice: 110,
    totalPrice: 550,
    requesterName: 'กาญจนภาษณ์ มาตบุรม',
    department: 'งานบริการการศึกษาและพัฒนาคุณภาพนิสิต',
    disburserName: 'เจ้าหน้าที่งานการเงินและพัสดุ',
    note: 'ส่งมอบเรียบร้อย'
  },
  {
    id: 'OUT-2569-002',
    date: '2026-09-08',
    requisitionDocNo: 'COPAG-REQ-2569/001',
    materialId: '1ป18',
    materialName: 'ปากกาน้ำเงิน',
    category: 'วัสดุสำนักงาน',
    quantity: 10,
    unit: 'แท่ง',
    unitPrice: 8,
    totalPrice: 80,
    requesterName: 'กาญจนภาษณ์ มาตบุรม',
    department: 'งานบริการการศึกษาและพัฒนาคุณภาพนิสิต',
    disburserName: 'เจ้าหน้าที่งานการเงินและพัสดุ',
    note: 'ส่งมอบเรียบร้อย'
  },
  {
    id: 'OUT-2569-003',
    date: '2026-09-08',
    requisitionDocNo: 'COPAG-REQ-2569/001',
    materialId: '1พ03',
    materialName: 'โพสต์อิท ขนาด 76 mm. X 76 mm.',
    category: 'วัสดุสำนักงาน',
    quantity: 4,
    unit: 'อัน',
    unitPrice: 35,
    totalPrice: 140,
    requesterName: 'กาญจนภาษณ์ มาตบุรม',
    department: 'งานบริการการศึกษาและพัฒนาคุณภาพนิสิต',
    disburserName: 'เจ้าหน้าที่งานการเงินและพัสดุ',
    note: 'ส่งมอบเรียบร้อย'
  }
];
