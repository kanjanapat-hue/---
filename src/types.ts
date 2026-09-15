export interface MaterialItem {
  id: string; // e.g. "1ก01"
  no: number;
  name: string;
  category: string;
  unitPrice: number;
  purchaseQty?: number;
  unit: string;
  minQty: number;
  maxQty: number;
  currentStock: number;
  refillStatus: string; // 'OK', 'วัสดุหมด', 'ใกล้หมด'
  usageStatus: string; // 'ประจำ', 'ครั้งคราว'
  totalPurchaseCost: number;
  totalWithdrawn: number;
  monthlyAverage: number;
  imageUrl?: string;
}

export interface RequisitionCartItem {
  material: MaterialItem;
  quantity: number;
  reason?: string;
  note?: string;
}

export interface RequisitionOrder {
  id: string;
  docNo: string; // เลขที่ใบเบิก
  date: string;
  requesterName: string;
  requesterEmail: string;
  requesterPosition: string; // ตำแหน่ง
  department: string; // หน่วยงาน/ฝ่าย/สาขาวิชา
  purpose: string; // เพื่อใช้ในงาน/โครงการ
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
  status: 'รออนุมัติ' | 'อนุมัติแล้ว' | 'เบิกจ่ายแล้ว' | 'ยกเลิก';
  approverName?: string;
  disbursedDate?: string;
  driveFileId?: string;
  driveViewLink?: string;
  createdSheetRow?: number;
}

export interface StockInRecord {
  id: string;
  date: string;
  docNo: string;
  materialId: string;
  materialName: string;
  category: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  supplier?: string;
  receiverName: string;
  note?: string;
}

export interface StockOutRecord {
  id: string;
  date: string;
  requisitionDocNo: string;
  materialId: string;
  materialName: string;
  category: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  requesterName: string;
  department: string;
  disburserName: string;
  note?: string;
}

export interface UserProfile {
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'user';
  department: string;
  position: string;
  accessToken?: string;
}

export interface GoogleSheetsConfig {
  spreadsheetId: string;
  inventorySheetName: string;
  stockInSheetName: string;
  stockOutSheetName: string;
  formSheetName: string;
}
