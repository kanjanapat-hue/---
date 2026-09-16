const fs = require('fs');
const path = require('path');

const raw = fs.readFileSync(path.join(__dirname, 'raw_data.csv'), 'utf8');

function parseCSV(content) {
  const rows = [];
  let currentRow = [];
  let currentVal = '';
  let inQuotes = false;
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];
    if (char === '"') {
      if (inQuotes && nextChar === '"') { currentVal += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentVal);
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      currentRow.push(currentVal);
      if (currentRow.some(c => c.trim() !== '')) rows.push(currentRow);
      currentRow = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }
  if (currentVal !== '' || currentRow.length > 0) {
    currentRow.push(currentVal);
    if (currentRow.some(c => c.trim() !== '')) rows.push(currentRow);
  }
  return rows;
}

const dataRows = parseCSV(raw).slice(1);

const items = dataRows.map((r, idx) => {
  const no = parseInt(r[0].trim(), 10) || (idx + 1);
  const id = r[1].trim();
  const name = r[2].replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
  const category = r[3].trim();
  const unitPrice = parseFloat((r[4] || '0').replace(/,/g, '').trim()) || 0;
  const purchaseQty = r[5] && r[5].trim() !== '' ? (parseFloat(r[5].replace(/,/g, '').trim()) || 0) : undefined;
  const unit = (r[6] || '').trim() || 'ชิ้น';
  const minQty = parseFloat((r[7] || '0').replace(/,/g, '').trim()) || 0;
  const maxQty = parseFloat((r[8] || '0').replace(/,/g, '').trim()) || 0;
  const currentStock = 20; // 20 units initial stock
  const usageStatus = (r[11] || '').trim() || 'ประจำ';
  const totalPurchaseCost = parseFloat((r[12] || '0').replace(/,/g, '').trim()) || (purchaseQty ? purchaseQty * unitPrice : 0);
  const totalWithdrawn = parseFloat((r[13] || '0').replace(/,/g, '').trim()) || 0;
  const monthlyAverage = parseFloat((r[14] || '0').replace(/,/g, '').trim()) || 0;
  const refillStatus = currentStock >= minQty ? 'OK' : (currentStock > 0 ? 'ใกล้หมด' : 'วัสดุหมด');

  return {
    no,
    id,
    name,
    category,
    unitPrice,
    ...(purchaseQty !== undefined ? { purchaseQty } : {}),
    unit,
    minQty,
    maxQty,
    currentStock,
    refillStatus,
    usageStatus,
    totalPurchaseCost,
    totalWithdrawn,
    monthlyAverage
  };
});

console.log(`Parsed ${items.length} items successfully.`);

const tsContent = `import { MaterialItem, StockInRecord } from '../types';

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
  if (lower.includes('กระดาษ') || lower.includes('รีม') || lower.includes('บรู๊ฟ')) return 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&auto=format&fit=crop&q=60';
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
  if (lower.includes('แอลกอฮอล์') || lower.includes('เจลทำความสะอาดมือ') || lower.includes('ยาสามัญ')) return 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=60';
  if (lower.includes('ถ่าน') || lower.includes('แบตเตอรี่')) return 'https://images.unsplash.com/photo-1619725002198-6a689b72f41d?w=400&auto=format&fit=crop&q=60';
  if (lower.includes('ปลั๊ก') || lower.includes('มัลติมิเตอร์')) return 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&auto=format&fit=crop&q=60';
  if (lower.includes('หลอดไฟ')) return 'https://images.unsplash.com/photo-1507499739999-097706ad8914?w=400&auto=format&fit=crop&q=60';
  if (lower.includes('น้ำยา') || lower.includes('สบู่') || lower.includes('ไฮเตอร์') || lower.includes('ผงซัก')) return 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400&auto=format&fit=crop&q=60';
  if (lower.includes('ไม้กวาด') || lower.includes('ไม้ถูพื้น') || lower.includes('ที่โกย') || lower.includes('ไม้รีดน้ำ')) return 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&auto=format&fit=crop&q=60';
  if (lower.includes('ถุงมือ')) return 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=400&auto=format&fit=crop&q=60';
  if (lower.includes('ถุงขยะ') || lower.includes('ถังขยะ')) return 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?w=400&auto=format&fit=crop&q=60';
  if (lower.includes('คีย์บอร์ด') || lower.includes('เมาส์')) return 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&auto=format&fit=crop&q=60';
  if (lower.includes('หมึก') || lower.includes('ดรัม')) return 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400&auto=format&fit=crop&q=60';
  if (lower.includes('แฟลชไดร์ฟ') || lower.includes('ฮาร์ดดิสก์') || lower.includes('เอสเอสดี')) return 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?w=400&auto=format&fit=crop&q=60';
  if (lower.includes('สาย hdmi') || lower.includes('สายแลน') || lower.includes('สาย usb') || lower.includes('สายสัญญาณ') || lower.includes('สาย audio')) return 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60';
  if (lower.includes('กระดาน') || lower.includes('ไวท์บอร์ด')) return 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=400&auto=format&fit=crop&q=60';
  if (lower.includes('แผนที่')) return 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&auto=format&fit=crop&q=60';
  if (lower.includes('คราด') || lower.includes('จอบ') || lower.includes('สายยาง')) return 'https://images.unsplash.com/photo-1617576683096-00fc8eecb3af?w=400&auto=format&fit=crop&q=60';
  if (lower.includes('ไขควง') || lower.includes('สว่าน') || lower.includes('ตลับเมตร') || lower.includes('ยิงตะปู')) return 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&auto=format&fit=crop&q=60';
  if (lower.includes('กล้อง') || lower.includes('ขาตั้งกล้อง') || lower.includes('มาสคอต')) return 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&auto=format&fit=crop&q=60';
  if (lower.includes('คริสต์มาส') || lower.includes('สายรุ้ง') || lower.includes('ไฟประดับ')) return 'https://images.unsplash.com/photo-1543258103-a62bdc069871?w=400&auto=format&fit=crop&q=60';

  if (category === 'วัสดุสำนักงาน') return 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=400&auto=format&fit=crop&q=60';
  if (category === 'วัสดุคอมพิวเตอร์') return 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&auto=format&fit=crop&q=60';
  if (category === 'วัสดุงานบ้านและงานครัว') return 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&auto=format&fit=crop&q=60';
  if (category === 'วัสดุการศึกษา') return 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&auto=format&fit=crop&q=60';
  if (category === 'วัสดุวิทยาศาสตร์หรือการแพทย์') return 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=60';
  if (category === 'วัสดุไฟฟ้าและวิทยุ') return 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&auto=format&fit=crop&q=60';
  if (category === 'วัสดุโฆษณาและเผยแพร่') return 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&auto=format&fit=crop&q=60';
  if (category === 'วัสดุการเกษตร') return 'https://images.unsplash.com/photo-1617576683096-00fc8eecb3af?w=400&auto=format&fit=crop&q=60';
  if (category === 'วัสดุก่อสร้าง') return 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&auto=format&fit=crop&q=60';
  return 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&auto=format&fit=crop&q=60';
};

// Complete official list of 367 materials from the faculty inventory sheet
export const INITIAL_MATERIALS: MaterialItem[] = ${JSON.stringify(items, null, 2)}.map(item => {
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
      { materialId: '1ย01', name: 'ยางลบ', category: 'วัสดุสำนักงาน', unit: 'ก้อน', unitPrice: 5, requestedQty: 4, totalAmount: 20, remark: 'สำรองในห้องสอบ' }
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
    id: \`IN-2569-BATCH-\${String(idx + 1).padStart(3, '0')}\`,
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
`;

fs.writeFileSync(path.join(__dirname, '../src/data/materials.ts'), tsContent, 'utf8');
console.log('Successfully wrote /src/data/materials.ts with all 367 items!');
