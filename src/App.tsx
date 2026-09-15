import React, { useState, useEffect } from 'react';
import {
  MaterialItem,
  RequisitionCartItem,
  RequisitionOrder,
  StockInRecord,
  StockOutRecord,
  UserProfile
} from './types';
import {
  INITIAL_MATERIALS,
  INITIAL_ORDERS,
  INITIAL_STOCK_IN,
  INITIAL_STOCK_OUT,
  getMaterialImage
} from './data/materials';
import {
  testFirebaseConnection,
  subscribeMaterials,
  subscribeOrders,
  subscribeStockIn,
  subscribeStockOut,
  saveMaterialToFirestore,
  saveOrderToFirestore,
  saveStockInToFirestore,
  saveStockOutToFirestore,
  deleteMaterialFromFirestore,
  deleteOrderFromFirestore,
  deleteStockInFromFirestore,
  deleteStockOutFromFirestore,
  seedInitialFirestoreData
} from './services/firebase';
import { UserRequisitionView } from './components/UserRequisitionView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { AdminRequisitionsView } from './components/AdminRequisitionsView';
import { AdminStockOutView } from './components/AdminStockOutView';
import { AdminStockInView } from './components/AdminStockInView';
import { AdminInventoryReportView } from './components/AdminInventoryReportView';
import { AdminLedgerView } from './components/AdminLedgerView';
import { RequisitionPrintForm } from './components/RequisitionPrintForm';
import { LoginModal } from './components/LoginModal';
import { RightControlPanel } from './components/RightControlPanel';
import { GuestWelcomeView } from './components/GuestWelcomeView';
import {
  SUPER_ADMIN_PROFILE,
  DEMO_USER_PROFILE,
  checkIsAdmin,
  logoutMsuAccount,
  saveRecentMsuAccount
} from './services/auth';
import { playNotificationChime } from './utils/notificationSound';
import {
  LayoutDashboard,
  ShoppingCart,
  DollarSign,
  PackagePlus,
  BarChart3,
  BookOpen,
  LogOut,
  UserCheck,
  Building2,
  FileSpreadsheet,
  Settings,
  HelpCircle,
  FolderOpen,
  FileCheck,
  Bell,
  BellRing,
  CheckCircle2,
  Shield,
  User,
  X,
  AlertTriangle,
  Sparkles,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

export default function App() {
  // Application Data States
  const [materials, setMaterials] = useState<MaterialItem[]>(() => {
    const normalize = (list: MaterialItem[]) =>
      list.map(item => ({
        ...item,
        imageUrl: item.imageUrl || getMaterialImage(item.name, item.category)
      }));

    // Check if the 20-unit update has been applied to this browser's localStorage
    const hasStock20Applied = localStorage.getItem('copag_stock_20_applied_v2');
    if (!hasStock20Applied) {
      localStorage.setItem('copag_stock_20_applied_v2', 'true');
      localStorage.removeItem('copag_materials');
      localStorage.removeItem('copag_stock_in');
      return normalize(INITIAL_MATERIALS);
    }
    const saved = localStorage.getItem('copag_materials');
    return saved ? normalize(JSON.parse(saved)) : normalize(INITIAL_MATERIALS);
  });

  const [orders, setOrders] = useState<RequisitionOrder[]>(() => {
    const saved = localStorage.getItem('copag_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [stockIns, setStockIns] = useState<StockInRecord[]>(() => {
    const hasStock20Applied = localStorage.getItem('copag_stock_20_applied_v2');
    if (!hasStock20Applied) {
      return INITIAL_STOCK_IN;
    }
    const saved = localStorage.getItem('copag_stock_in');
    return saved ? JSON.parse(saved) : INITIAL_STOCK_IN;
  });

  const [stockOuts, setStockOuts] = useState<StockOutRecord[]>(() => {
    const saved = localStorage.getItem('copag_stock_out');
    return saved ? JSON.parse(saved) : INITIAL_STOCK_OUT;
  });

  // User Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('copag_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) {
          // Strictly enforce admin role for kanjanapat.m@msu.ac.th
          if (checkIsAdmin(parsed.email)) {
            parsed.role = 'admin';
          }
          return parsed;
        }
      } catch (err) {
        console.warn('Failed to parse saved user:', err);
      }
    }
    // Default initial user: kanjanapat.m@msu.ac.th as Super Admin
    return SUPER_ADMIN_PROFILE;
  });

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'requisition' | 'dashboard' | 'requisitions' | 'stockout' | 'stockin' | 'inventory' | 'ledger'>('requisition');
  const [ledgerTargetMaterialId, setLedgerTargetMaterialId] = useState<string | undefined>(undefined);
  const [currentViewingOrder, setCurrentViewingOrder] = useState<RequisitionOrder | null>(null);

  // Control Panel Position State (Default to 'right' as requested by user)
  const [panelPosition, setPanelPosition] = useState<'right' | 'top'>(() => {
    const saved = localStorage.getItem('copag_panel_position');
    return (saved === 'top' || saved === 'right') ? saved : 'right';
  });
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('copag_sidebar_collapsed') === 'true';
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleTogglePanelPosition = () => {
    setPanelPosition(prev => {
      const next = prev === 'right' ? 'top' : 'right';
      localStorage.setItem('copag_panel_position', next);
      setToastMessage({
        type: 'info',
        title: next === 'right' ? 'ย้ายแผงควบคุมมาไว้ด้านข้างฝั่งขวาแล้ว' : 'ย้ายแผงควบคุมไปไว้ด้านบนแล้ว',
        desc: next === 'right'
          ? 'แผงควบคุมระบบถูกจัดวางไว้เป็นแถบด้านข้างฝั่งขวา สะดวกในการใช้งานและไม่กินพื้นที่แนวนอน'
          : 'แผงควบคุมระบบถูกจัดวางไว้ที่แถบเมนูด้านบน'
      });
      return next;
    });
  };

  const handleToggleSidebarCollapse = () => {
    setIsRightSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('copag_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Login handler
  const handleLogin = (user: UserProfile) => {
    if (checkIsAdmin(user.email)) {
      user.role = 'admin';
    }
    setCurrentUser(user);
    saveRecentMsuAccount(user);
    setShowLoginModal(false);
    setShowUserMenu(false);
    playNotificationChime();
    setToastMessage({
      type: 'success',
      title: 'เข้าสู่ระบบสำเร็จ',
      desc: `ยินดีต้อนรับ ${user.name} (${user.role === 'admin' ? '🛡️ แอดมินเจ้าหน้าที่พัสดุ' : '👤 ผู้ขอเบิก'}) เข้าสู่ระบบ มมส.`
    });
  };

  // Logout handler
  const handleLogout = async () => {
    await logoutMsuAccount();
    setCurrentUser(null);
    setShowUserMenu(false);
    setShowLoginModal(false);
    setCurrentViewingOrder(null);
    playNotificationChime();
    setToastMessage({
      type: 'info',
      title: 'ออกจากระบบสำเร็จ',
      desc: 'คุณได้ออกจากระบบเรียบร้อยแล้ว ข้อมูลทั้งหมดได้รับการบันทึกบนคลาวด์'
    });
  };

  const handleToggleRole = () => {
    if (currentUser?.role === 'admin') {
      setCurrentUser(DEMO_USER_PROFILE);
      setCurrentViewingOrder(null);
      setActiveTab('requisition');
      setToastMessage({
        type: 'info',
        title: 'สลับเป็นมุมมองผู้ใช้งาน (ผู้ขอเบิก)',
        desc: 'ท่านอยู่ในบัญชี ดร.สมชาย ปรีชาชาญ สามารถคีย์รายการขอเบิกพัสดุและดูประวัติของตนเองได้'
      });
    } else {
      setCurrentUser(SUPER_ADMIN_PROFILE);
      setCurrentViewingOrder(null);
      setActiveTab('requisitions');
      setToastMessage({
        type: 'info',
        title: 'สลับเป็นมุมมองเจ้าหน้าที่พัสดุ (แอดมิน)',
        desc: 'เข้าสู่หน้ารวมใบขอเบิกพัสดุ ท่านสามารถตรวจสอบ อนุมัติ และตัดจ่ายพัสดุออกจากคลัง'
      });
    }
  };

  const getActiveTabTitle = (tab: string) => {
    switch (tab) {
      case 'requisition':
        return '🛒 คีย์ขอเบิกพัสดุ';
      case 'requisitions':
        return '📋 อนุมัติเบิกจ่าย';
      case 'dashboard':
        return '📊 แดชบอร์ดภาพรวม';
      case 'stockout':
        return '💰 บันทึกเบิกจ่ายพัสดุ';
      case 'stockin':
        return '💸 บันทึกรับเข้าพัสดุ';
      case 'inventory':
        return '📈 รายงานพัสดุคงเหลือ';
      case 'ledger':
        return '📒 สมุดคุมบัญชีพัสดุ';
      default:
        return tab;
    }
  };

  // Notifications and Toasts
  const [adminAlert, setAdminAlert] = useState<{
    id: string;
    docNo: string;
    requesterName: string;
    time: string;
    totalItems: number;
    totalAmount: number;
  } | null>(null);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'info' | 'warning';
    title: string;
    desc: string;
  } | null>(null);

  // Auto-dismiss toast after 6 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Optional Google Sheet ID configuration for direct synchronization
  const [spreadsheetId, setSpreadsheetId] = useState(() => {
    return localStorage.getItem('copag_sheet_id') || '1kZq7Y7QZ9...';
  });
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Save changes to LocalStorage
  useEffect(() => {
    localStorage.setItem('copag_materials', JSON.stringify(materials));
  }, [materials]);

  useEffect(() => {
    localStorage.setItem('copag_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('copag_stock_in', JSON.stringify(stockIns));
  }, [stockIns]);

  useEffect(() => {
    localStorage.setItem('copag_stock_out', JSON.stringify(stockOuts));
  }, [stockOuts]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('copag_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('copag_user');
    }
  }, [currentUser]);

  // Firebase Cloud Real-time Synchronization
  const [firebaseConnected, setFirebaseConnected] = useState<boolean | null>(null);
  const [isFirebaseSyncing, setIsFirebaseSyncing] = useState(false);

  useEffect(() => {
    let unsubscribeMaterials: (() => void) | undefined;
    let unsubscribeOrders: (() => void) | undefined;
    let unsubscribeStockIn: (() => void) | undefined;
    let unsubscribeStockOut: (() => void) | undefined;

    const initFirebase = async () => {
      try {
        setIsFirebaseSyncing(true);
        const ok = await testFirebaseConnection();
        setFirebaseConnected(ok);

        // Seed initial data to cloud if collections are empty
        await seedInitialFirestoreData(materials, orders, stockIns, stockOuts);

        // Listen for real-time updates from other clients/devices
        unsubscribeMaterials = subscribeMaterials(items => {
          if (items.length > 0) {
            setMaterials(items);
          }
        });

        unsubscribeOrders = subscribeOrders(items => {
          if (items.length > 0) {
            setOrders(items);
          }
        });

        unsubscribeStockIn = subscribeStockIn(items => {
          if (items.length > 0) {
            setStockIns(items);
          }
        });

        unsubscribeStockOut = subscribeStockOut(items => {
          if (items.length > 0) {
            setStockOuts(items);
          }
        });
      } catch (err) {
        console.warn('Firebase initialization notice:', err);
        setFirebaseConnected(false);
      } finally {
        setIsFirebaseSyncing(false);
      }
    };

    initFirebase();

    return () => {
      if (unsubscribeMaterials) unsubscribeMaterials();
      if (unsubscribeOrders) unsubscribeOrders();
      if (unsubscribeStockIn) unsubscribeStockIn();
      if (unsubscribeStockOut) unsubscribeStockOut();
    };
  }, []);

  // Pending requisitions count
  const pendingOrdersCount = orders.filter(o => o.status === 'รออนุมัติ').length;

  // Handle User Requisition Submission (Step 1: User submits requisition -> Status: 'รออนุมัติ' -> Notify Admin)
  // IMPORTANT: Stock is NOT deducted here. Admin will review, approve, and disburse from their portal.
  const handleSubmitRequisition = (cart: RequisitionCartItem[], purpose: string) => {
    if (!currentUser) return;

    const docNo = `COPAG-REQ-2569/${String(orders.length + 1).padStart(3, '0')}`;
    const date = new Date().toISOString().split('T')[0];

    const orderItems = cart.map(item => ({
      materialId: item.material.id,
      name: item.material.name,
      category: item.material.category,
      unit: item.material.unit,
      unitPrice: item.material.unitPrice,
      requestedQty: item.quantity,
      totalAmount: item.material.unitPrice * item.quantity,
      remark: item.reason || ''
    }));

    const totalAmount = orderItems.reduce((sum, item) => sum + item.totalAmount, 0);

    const newOrder: RequisitionOrder = {
      id: `ORDER-${Date.now()}`,
      docNo,
      date,
      requesterName: currentUser.name,
      requesterEmail: currentUser.email,
      requesterPosition: currentUser.position,
      department: currentUser.department,
      purpose,
      items: orderItems,
      totalItems: orderItems.length,
      totalAmount,
      status: 'รออนุมัติ'
    };

    // Save order with status 'รออนุมัติ' (Stock is NOT deducted until admin approves!)
    setOrders(prev => [newOrder, ...prev]);
    saveOrderToFirestore(newOrder).catch(err => console.warn('Firestore sync order error:', err));

    // Play notification sound
    playNotificationChime();

    // Trigger Admin Alert banner
    setAdminAlert({
      id: newOrder.id,
      docNo: newOrder.docNo,
      requesterName: newOrder.requesterName,
      time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      totalItems: newOrder.totalItems,
      totalAmount: newOrder.totalAmount
    });

    setToastMessage({
      type: 'success',
      title: 'ยื่นคำขอเบิกพัสดุสำเร็จ!',
      desc: `คำขอเบิกเลขที่ ${docNo} ถูกส่งไปยังระบบของเจ้าหน้าที่พัสดุและบันทึกคลาวด์เรียบร้อยแล้ว กรุณารอเจ้าหน้าที่ตรวจสอบและอนุมัติเบิกจ่ายออกจากคลัง`
    });
  };

  // Handle Admin Approval & Stock Disbursement (Step 2: Admin approves and deducts stock)
  const handleApproveAndDisburseOrder = (
    orderId: string,
    approvedQuantities: Record<string, number>,
    approverNote: string
  ) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    const approverName = currentUser?.name || 'เจ้าหน้าที่งานการเงินและพัสดุ';

    // 1. Calculate stock deductions and create StockOut records
    const deductions: Record<string, number> = {};
    const createdStockOuts: StockOutRecord[] = [];

    order.items.forEach((item, idx) => {
      const approvedQty = approvedQuantities[item.materialId] !== undefined
        ? approvedQuantities[item.materialId]
        : item.requestedQty;

      if (approvedQty > 0) {
        deductions[item.materialId] = (deductions[item.materialId] || 0) + approvedQty;
        const outRecord: StockOutRecord = {
          id: `OUT-${Date.now()}-${idx + 1}`,
          date,
          requisitionDocNo: order.docNo,
          materialId: item.materialId,
          materialName: item.name,
          category: item.category,
          quantity: approvedQty,
          unit: item.unit,
          unitPrice: item.unitPrice,
          totalPrice: item.unitPrice * approvedQty,
          requesterName: order.requesterName,
          department: order.department,
          disburserName: approverName,
          note: approverNote ? `${order.purpose} (หมายเหตุ: ${approverNote})` : order.purpose
        };
        createdStockOuts.push(outRecord);
        saveStockOutToFirestore(outRecord).catch(err => console.warn('Firestore sync stock out error:', err));
      }
    });

    // 2. Deduct from materials stock and sync to Firestore
    setMaterials(prev =>
      prev.map(mat => {
        const deductQty = deductions[mat.id];
        if (deductQty && deductQty > 0) {
          const nextStock = Math.max(0, mat.currentStock - deductQty);
          const nextWithdrawn = (mat.totalWithdrawn || 0) + deductQty;
          const updatedMat = {
            ...mat,
            currentStock: nextStock,
            totalWithdrawn: nextWithdrawn,
            refillStatus: nextStock <= 0 ? 'วัสดุหมด' : (nextStock <= mat.minQty ? 'ใกล้หมด' : 'OK')
          };
          saveMaterialToFirestore(updatedMat).catch(err => console.warn('Firestore sync material error:', err));
          return updatedMat;
        }
        return mat;
      })
    );

    // 3. Add records to StockOuts
    if (createdStockOuts.length > 0) {
      setStockOuts(prev => [...createdStockOuts, ...prev]);
    }

    // 4. Update order status to 'เบิกจ่ายแล้ว' with accurate quantities and amounts
    let updatedOrderObj: RequisitionOrder | null = null;
    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          const updatedItems = o.items.map(it => {
            const approvedQty = approvedQuantities[it.materialId] !== undefined
              ? approvedQuantities[it.materialId]
              : it.requestedQty;
            return {
              ...it,
              approvedQty,
              totalAmount: it.unitPrice * approvedQty
            };
          });
          const totalAmount = updatedItems.reduce((sum, it) => sum + it.totalAmount, 0);

          const updated: RequisitionOrder = {
            ...o,
            status: 'เบิกจ่ายแล้ว',
            items: updatedItems,
            totalAmount,
            approverName,
            disbursedDate: `${date} ${time}`,
            purpose: approverNote ? `${o.purpose} [หมายเหตุเจ้าหน้าที่: ${approverNote}]` : o.purpose
          };
          updatedOrderObj = updated;
          return updated;
        }
        return o;
      })
    );

    if (updatedOrderObj) {
      saveOrderToFirestore(updatedOrderObj).catch(err => console.warn('Firestore sync order error:', err));
    }

    // Dismiss any alert for this order
    if (adminAlert && adminAlert.id === orderId) {
      setAdminAlert(null);
    }

    playNotificationChime();
    setToastMessage({
      type: 'success',
      title: 'อนุมัติและตัดจ่ายพัสดุสำเร็จ!',
      desc: `อนุมัติใบขอเบิก ${order.docNo} และตัดสต็อกออกจากระบบเรียบร้อยแล้ว บันทึกลงสมุดคุมบัญชีพัสดุและคลาวด์อัตโนมัติ`
    });
  };

  // Handle Admin Rejection
  const handleRejectOrder = (orderId: string, reason: string) => {
    const approverName = currentUser?.name || 'เจ้าหน้าที่งานการเงินและพัสดุ';
    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

    let updatedOrder: RequisitionOrder | null = null;
    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          const res: RequisitionOrder = {
            ...o,
            status: 'ยกเลิก',
            approverName,
            disbursedDate: `${date} ${time}`,
            purpose: `${o.purpose} [ไม่อนุมัติ: ${reason}]`
          };
          updatedOrder = res;
          return res;
        }
        return o;
      })
    );

    if (updatedOrder) {
      saveOrderToFirestore(updatedOrder).catch(err => console.warn('Firestore sync reject error:', err));
    }

    if (adminAlert && adminAlert.id === orderId) {
      setAdminAlert(null);
    }

    setToastMessage({
      type: 'info',
      title: 'ยกเลิกใบขอเบิกเรียบร้อย',
      desc: `บันทึกสถานะไม่อนุมัติ ไม่มีการตัดสต็อกวัสดุออกจากระบบ`
    });
  };

  // User: Cancel Requisition (if pending)
  const handleCancelUserOrder = (orderId: string) => {
    let canceledOrder: RequisitionOrder | null = null;
    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId && o.status === 'รออนุมัติ') {
          const res: RequisitionOrder = {
            ...o,
            status: 'ยกเลิก',
            purpose: `${o.purpose} [ผู้ขอเบิกยกเลิกรายการ]`
          };
          canceledOrder = res;
          return res;
        }
        return o;
      })
    );

    if (canceledOrder) {
      saveOrderToFirestore(canceledOrder).catch(err => console.warn('Firestore sync cancel error:', err));
    }

    if (adminAlert && adminAlert.id === orderId) {
      setAdminAlert(null);
    }
    setToastMessage({
      type: 'info',
      title: 'ยกเลิกคำขอเรียบร้อย',
      desc: 'ระบบได้บันทึกการยกเลิกคำขอเบิกพัสดุของคุณแล้ว'
    });
  };

  // Update Existing Requisition (User or Admin)
  const handleUpdateRequisition = (
    orderId: string,
    updatedData: {
      purpose: string;
      items: any[];
      totalItems: number;
      totalAmount: number;
    }
  ) => {
    const existingOrder = orders.find(o => o.id === orderId);
    if (!existingOrder) return;

    // If order was already disbursed, adjust materials stock AND stockOuts based on quantity differences
    if (existingOrder.status === 'เบิกจ่ายแล้ว' || existingOrder.status === 'อนุมัติแล้ว') {
      const oldQtyMap = new Map<string, number>();
      existingOrder.items.forEach(it => {
        const q = it.approvedQty !== undefined ? it.approvedQty : it.requestedQty;
        oldQtyMap.set(it.materialId, (oldQtyMap.get(it.materialId) || 0) + q);
      });

      const newQtyMap = new Map<string, number>();
      updatedData.items.forEach((it: any) => {
        const q = it.approvedQty !== undefined ? it.approvedQty : it.requestedQty;
        newQtyMap.set(it.materialId, (newQtyMap.get(it.materialId) || 0) + q);
      });

      const allMaterialIds = new Set([...oldQtyMap.keys(), ...newQtyMap.keys()]);
      const diffMap = new Map<string, number>();
      allMaterialIds.forEach(mId => {
        const oldQ = oldQtyMap.get(mId) || 0;
        const newQ = newQtyMap.get(mId) || 0;
        const diff = newQ - oldQ; // diff > 0 means disbursed more -> reduce currentStock
        if (diff !== 0) {
          diffMap.set(mId, diff);
        }
      });

      if (diffMap.size > 0) {
        setMaterials(prev =>
          prev.map(mat => {
            const diff = diffMap.get(mat.id);
            if (diff !== undefined && diff !== 0) {
              const nextStock = Math.max(0, mat.currentStock - diff);
              const nextWithdrawn = Math.max(0, (mat.totalWithdrawn || 0) + diff);
              return {
                ...mat,
                currentStock: nextStock,
                totalWithdrawn: nextWithdrawn,
                refillStatus: nextStock <= 0 ? 'วัสดุหมด' : (nextStock <= mat.minQty ? 'ใกล้หมด' : 'OK')
              };
            }
            return mat;
          })
        );

        // Synchronize stockOuts with updated items
        setStockOuts(prev => {
          const others = prev.filter(so => so.requisitionDocNo !== existingOrder.docNo);
          const date = new Date().toISOString().split('T')[0];
          const newOuts: StockOutRecord[] = updatedData.items.map((it: any, idx) => {
            const approvedQty = it.approvedQty !== undefined ? it.approvedQty : it.requestedQty;
            return {
              id: `OUT-${Date.now()}-${idx + 1}`,
              date,
              requisitionDocNo: existingOrder.docNo,
              materialId: it.materialId,
              materialName: it.name,
              category: it.category,
              quantity: approvedQty,
              unit: it.unit,
              unitPrice: it.unitPrice,
              totalPrice: it.unitPrice * approvedQty,
              requesterName: existingOrder.requesterName,
              department: existingOrder.department,
              disburserName: existingOrder.approverName || 'เจ้าหน้าที่งานการเงินและพัสดุ',
              note: updatedData.purpose
            };
          });
          return [...newOuts, ...others];
        });
      }
    }

    let updatedOrderObj: RequisitionOrder | null = null;
    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          const isDisbursed = o.status === 'เบิกจ่ายแล้ว' || o.status === 'อนุมัติแล้ว';
          const itemsWithApproved = updatedData.items.map((it: any) => ({
            ...it,
            approvedQty: isDisbursed
              ? (it.approvedQty !== undefined ? it.approvedQty : it.requestedQty)
              : it.approvedQty
          }));

          const updated: RequisitionOrder = {
            ...o,
            purpose: updatedData.purpose,
            items: itemsWithApproved,
            totalItems: updatedData.totalItems,
            totalAmount: updatedData.totalAmount
          };
          updatedOrderObj = updated;
          return updated;
        }
        return o;
      })
    );

    if (updatedOrderObj) {
      saveOrderToFirestore(updatedOrderObj).catch(err => console.warn('Firestore sync updated order error:', err));
    }

    setToastMessage({
      type: 'success',
      title: 'แก้ไขใบเบิกสำเร็จ',
      desc: `บันทึกการแก้ไขรายการใบเบิก ${existingOrder.docNo} เรียบร้อยแล้ว (อัปเดตสต็อกและรายการตัดจ่ายตรงกัน)`
    });
  };

  // Admin: Cancel disbursement and restore stock into warehouse
  const handleCancelDisbursement = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Calculate total quantity to restore for each material
    const restoreQuantities: Record<string, number> = {};
    order.items.forEach(it => {
      const qty = it.approvedQty !== undefined ? it.approvedQty : it.requestedQty;
      if (qty > 0) {
        restoreQuantities[it.materialId] = (restoreQuantities[it.materialId] || 0) + qty;
      }
    });

    // 1. Restore stock in materials
    setMaterials(prev =>
      prev.map(mat => {
        const qtyToRestore = restoreQuantities[mat.id];
        if (qtyToRestore && qtyToRestore > 0) {
          const nextStock = mat.currentStock + qtyToRestore;
          const nextWithdrawn = Math.max(0, (mat.totalWithdrawn || 0) - qtyToRestore);
          const updatedMat = {
            ...mat,
            currentStock: nextStock,
            totalWithdrawn: nextWithdrawn,
            refillStatus: nextStock <= 0 ? 'วัสดุหมด' : (nextStock <= mat.minQty ? 'ใกล้หมด' : 'OK')
          };
          saveMaterialToFirestore(updatedMat).catch(err => console.warn('Firestore sync material error:', err));
          return updatedMat;
        }
        return mat;
      })
    );

    // 2. Remove matching stockOut records from state and Firestore
    const matchingOuts = stockOuts.filter(so => so.requisitionDocNo === order.docNo);
    matchingOuts.forEach(so => {
      deleteStockOutFromFirestore(so.id).catch(err => console.warn('Firestore delete stock out error:', err));
    });
    setStockOuts(prev => prev.filter(so => so.requisitionDocNo !== order.docNo));

    // 3. Mark order as 'ยกเลิก'
    let canceledOrderObj: RequisitionOrder | null = null;
    setOrders(prev =>
      prev.map(o => {
        if (o.id === orderId) {
          const res: RequisitionOrder = {
            ...o,
            status: 'ยกเลิก',
            purpose: o.purpose.includes('ยกเลิกการเบิกจ่าย')
              ? o.purpose
              : `${o.purpose} [ยกเลิกการเบิกจ่ายและคืนสต็อกเข้าคลังแล้ว โดย ${currentUser?.name || 'เจ้าหน้าที่งานการเงินและพัสดุ'}]`
          };
          canceledOrderObj = res;
          return res;
        }
        return o;
      })
    );

    if (canceledOrderObj) {
      saveOrderToFirestore(canceledOrderObj).catch(err => console.warn('Firestore sync order error:', err));
    }

    playNotificationChime();
    setToastMessage({
      type: 'info',
      title: 'ยกเลิกการเบิกจ่ายและคืนสต็อกสำเร็จ',
      desc: `คืนยอดพัสดุใบเบิก ${order.docNo} (${order.items.length} รายการ) กลับเข้าสู่คลังเรียบร้อยแล้ว`
    });
  };

  // Add Manual Stock Out (Admin 💰 เบิกจ่าย)
  const handleAddStockOut = (record: StockOutRecord) => {
    setStockOuts(prev => [record, ...prev]);
    saveStockOutToFirestore(record).catch(err => console.warn('Firestore save stock out error:', err));

    // Deduct stock in materials inventory
    setMaterials(prev =>
      prev.map(mat => {
        if (mat.id === record.materialId) {
          const nextStock = Math.max(0, mat.currentStock - record.quantity);
          const updatedMat = {
            ...mat,
            currentStock: nextStock,
            totalWithdrawn: mat.totalWithdrawn + record.quantity,
            refillStatus: nextStock <= 0 ? 'วัสดุหมด' : (nextStock <= mat.minQty ? 'ใกล้หมด' : 'OK')
          };
          saveMaterialToFirestore(updatedMat).catch(err => console.warn('Firestore save material error:', err));
          return updatedMat;
        }
        return mat;
      })
    );
  };

  // Update Existing Stock Out Record (Admin)
  const handleUpdateStockOut = (updatedRecord: StockOutRecord) => {
    const oldRecord = stockOuts.find(r => r.id === updatedRecord.id);
    if (!oldRecord) return;
    const diff = updatedRecord.quantity - oldRecord.quantity;

    saveStockOutToFirestore(updatedRecord).catch(err => console.warn('Firestore update stock out error:', err));

    setMaterials(prev =>
      prev.map(mat => {
        if (mat.id === updatedRecord.materialId) {
          const nextStock = Math.max(0, mat.currentStock - diff);
          const nextWithdrawn = Math.max(0, (mat.totalWithdrawn || 0) + diff);
          const updatedMat = {
            ...mat,
            currentStock: nextStock,
            totalWithdrawn: nextWithdrawn,
            refillStatus: nextStock <= 0 ? 'วัสดุหมด' : (nextStock <= mat.minQty ? 'ใกล้หมด' : 'OK')
          };
          saveMaterialToFirestore(updatedMat).catch(err => console.warn('Firestore update material error:', err));
          return updatedMat;
        }
        return mat;
      })
    );

    setStockOuts(prev =>
      prev.map(r => (r.id === updatedRecord.id ? updatedRecord : r))
    );

    setToastMessage({
      type: 'success',
      title: 'แก้ไขรายการเบิกจ่ายสำเร็จ',
      desc: `แก้ไขข้อมูล ${updatedRecord.materialName} เรียบร้อยแล้ว (ปรับสต็อกตามจริง)`
    });
  };

  // Delete/Cancel Stock Out Record (Admin: Restores stock)
  const handleDeleteStockOut = (recordId: string) => {
    const target = stockOuts.find(r => r.id === recordId);
    if (!target) return;

    deleteStockOutFromFirestore(recordId).catch(err => console.warn('Firestore delete stock out error:', err));

    setMaterials(prev =>
      prev.map(mat => {
        if (mat.id === target.materialId) {
          const nextStock = mat.currentStock + target.quantity;
          const nextWithdrawn = Math.max(0, (mat.totalWithdrawn || 0) - target.quantity);
          const updatedMat = {
            ...mat,
            currentStock: nextStock,
            totalWithdrawn: nextWithdrawn,
            refillStatus: nextStock <= 0 ? 'วัสดุหมด' : (nextStock <= mat.minQty ? 'ใกล้หมด' : 'OK')
          };
          saveMaterialToFirestore(updatedMat).catch(err => console.warn('Firestore restore material error:', err));
          return updatedMat;
        }
        return mat;
      })
    );

    setStockOuts(prev => prev.filter(r => r.id !== recordId));

    setToastMessage({
      type: 'info',
      title: 'ยกเลิกรายการเบิกจ่ายเรียบร้อย',
      desc: `คืนยอดพัสดุ ${target.materialName} จำนวน ${target.quantity} ${target.unit} เข้าสู่คลังแล้ว`
    });
  };

  // Add Manual Stock In (Admin 💸 รับเข้า)
  const handleAddStockIn = (record: StockInRecord) => {
    setStockIns(prev => [record, ...prev]);
    saveStockInToFirestore(record).catch(err => console.warn('Firestore save stock in error:', err));

    // Increase stock in materials inventory
    setMaterials(prev =>
      prev.map(mat => {
        if (mat.id === record.materialId) {
          const nextStock = mat.currentStock + record.quantity;
          const updatedMat = {
            ...mat,
            currentStock: nextStock,
            unitPrice: record.unitPrice || mat.unitPrice,
            refillStatus: nextStock <= 0 ? 'วัสดุหมด' : (nextStock <= mat.minQty ? 'ใกล้หมด' : 'OK')
          };
          saveMaterialToFirestore(updatedMat).catch(err => console.warn('Firestore update material error:', err));
          return updatedMat;
        }
        return mat;
      })
    );
  };

  // Update Existing Stock In Record (Admin)
  const handleUpdateStockIn = (updatedRecord: StockInRecord) => {
    const oldRecord = stockIns.find(r => r.id === updatedRecord.id);
    if (!oldRecord) return;
    const diff = updatedRecord.quantity - oldRecord.quantity;

    saveStockInToFirestore(updatedRecord).catch(err => console.warn('Firestore update stock in error:', err));

    setMaterials(prev =>
      prev.map(mat => {
        if (mat.id === updatedRecord.materialId) {
          const nextStock = Math.max(0, mat.currentStock + diff);
          const updatedMat = {
            ...mat,
            currentStock: nextStock,
            unitPrice: updatedRecord.unitPrice || mat.unitPrice,
            refillStatus: nextStock <= 0 ? 'วัสดุหมด' : (nextStock <= mat.minQty ? 'ใกล้หมด' : 'OK')
          };
          saveMaterialToFirestore(updatedMat).catch(err => console.warn('Firestore update material error:', err));
          return updatedMat;
        }
        return mat;
      })
    );

    setStockIns(prev =>
      prev.map(r => (r.id === updatedRecord.id ? updatedRecord : r))
    );

    setToastMessage({
      type: 'success',
      title: 'แก้ไขรายการรับเข้าสำเร็จ',
      desc: `แก้ไขข้อมูล ${updatedRecord.materialName} เรียบร้อยแล้ว (ปรับสต็อกตามจริง)`
    });
  };

  // Delete/Cancel Stock In Record (Admin: Reduces stock)
  const handleDeleteStockIn = (recordId: string) => {
    const target = stockIns.find(r => r.id === recordId);
    if (!target) return;

    deleteStockInFromFirestore(recordId).catch(err => console.warn('Firestore delete stock in error:', err));

    setMaterials(prev =>
      prev.map(mat => {
        if (mat.id === target.materialId) {
          const nextStock = Math.max(0, mat.currentStock - target.quantity);
          const updatedMat = {
            ...mat,
            currentStock: nextStock,
            refillStatus: nextStock <= 0 ? 'วัสดุหมด' : (nextStock <= mat.minQty ? 'ใกล้หมด' : 'OK')
          };
          saveMaterialToFirestore(updatedMat).catch(err => console.warn('Firestore update material error:', err));
          return updatedMat;
        }
        return mat;
      })
    );

    setStockIns(prev => prev.filter(r => r.id !== recordId));

    setToastMessage({
      type: 'info',
      title: 'ลบรายการรับเข้าเรียบร้อย',
      desc: `ลดสต็อกพัสดุ ${target.materialName} ลง ${target.quantity} ${target.unit} คืนแล้ว`
    });
  };

  // Admin: Add New Material Item
  const handleAddMaterial = (newMaterial: MaterialItem) => {
    setMaterials(prev => [...prev, newMaterial]);
    saveMaterialToFirestore(newMaterial).catch(err => console.warn('Firestore save material error:', err));

    // If new material starts with stock > 0, create an initial stock-in record
    if (newMaterial.currentStock > 0) {
      const initStockIn: StockInRecord = {
        id: `IN-INIT-${newMaterial.id}-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        docNo: `INIT-STOCK-${newMaterial.id}`,
        materialId: newMaterial.id,
        materialName: newMaterial.name,
        category: newMaterial.category,
        quantity: newMaterial.currentStock,
        unit: newMaterial.unit,
        unitPrice: newMaterial.unitPrice,
        totalPrice: newMaterial.unitPrice * newMaterial.currentStock,
        supplier: 'ยอดยกมาจากสต็อกตั้งต้น',
        receiverName: currentUser?.name || 'เจ้าหน้าที่งานการเงินและพัสดุ',
        note: 'บันทึกสต็อกตั้งต้นจากการเพิ่มรายการวัสดุใหม่'
      };
      setStockIns(prev => [initStockIn, ...prev]);
      saveStockInToFirestore(initStockIn).catch(err => console.warn('Firestore save stock in error:', err));
    }

    setToastMessage({
      type: 'success',
      title: 'เพิ่มรายการวัสดุใหม่สำเร็จ!',
      desc: `เพิ่ม "${newMaterial.name}" (${newMaterial.id}) เข้าสู่ทะเบียนคลังพัสดุเรียบร้อยแล้ว`
    });
  };

  // Admin: Update Material Properties (Purchase Qty, Unit, Min/Max, Usage Status)
  const handleUpdateMaterial = (updatedMaterial: MaterialItem) => {
    setMaterials(prev =>
      prev.map(mat => (mat.id === updatedMaterial.id ? updatedMaterial : mat))
    );
    saveMaterialToFirestore(updatedMaterial).catch(err => console.warn('Firestore update material error:', err));

    setToastMessage({
      type: 'success',
      title: 'บันทึกการแก้ไขพัสดุสำเร็จ',
      desc: `อัปเดตข้อมูล ${updatedMaterial.name} (${updatedMaterial.id}) เรียบร้อยแล้ว`
    });
  };

  const handleDriveSaved = (fileId: string, viewLink: string) => {
    if (currentViewingOrder) {
      setOrders(prev =>
        prev.map(ord =>
          ord.id === currentViewingOrder.id
            ? { ...ord, driveFileId: fileId, driveViewLink: viewLink }
            : ord
        )
      );
    }
  };

  // Reset all stock quantities to 0
  const handleResetAllStockToZero = () => {
    const updated = materials.map(item => ({
      ...item,
      currentStock: 0,
      refillStatus: 'วัสดุหมด' as const
    }));
    setMaterials(updated);
    updated.forEach(item => {
      saveMaterialToFirestore(item).catch(err => console.warn('Firestore sync reset error:', err));
    });

    playNotificationChime();
    setToastMessage({
      type: 'info',
      title: 'รีเซ็ตจำนวนคงเหลือเป็น 0 สำเร็จ',
      desc: 'ระบบได้ปรับปรุงยอดคงเหลือของวัสดุทุกรายการเป็น 0 หน่วย เรียบร้อยแล้ว'
    });
  };

  // Batch Stock In of 20 units for all materials (Request 2: รับเข้าวัสดุทุกรายการอย่างละ 20)
  const handleReceiveAll20 = () => {
    const date = new Date().toISOString().split('T')[0];
    const batchDocNo = `PO-COPAG-2569/BATCH-20-${Date.now().toString().slice(-4)}`;
    const newStockIns: StockInRecord[] = [];

    const updatedMaterials = materials.map((item, idx) => {
      const addedQty = 20;
      const newStock = item.currentStock + addedQty;
      const refillStatus: 'OK' | 'ใกล้หมด' | 'วัสดุหมด' =
        newStock >= item.minQty ? 'OK' : newStock > 0 ? 'ใกล้หมด' : 'วัสดุหมด';

      const inRecord: StockInRecord = {
        id: `IN-${Date.now()}-${idx + 1}`,
        date,
        docNo: batchDocNo,
        materialId: item.id,
        materialName: item.name,
        category: item.category,
        quantity: addedQty,
        unit: item.unit,
        unitPrice: item.unitPrice,
        totalPrice: item.unitPrice * addedQty,
        supplier: 'ร้านสหกรณ์มหาวิทยาลัยมหาสารคาม จำกัด',
        receiverName: currentUser?.name || 'เจ้าหน้าที่งานการเงินและพัสดุ',
        note: 'รับเข้าวัสดุทุกรายการอย่างละ 20 หน่วย'
      };
      newStockIns.push(inRecord);
      saveStockInToFirestore(inRecord).catch(err => console.warn('Firestore sync batch in error:', err));

      const updatedMat = {
        ...item,
        currentStock: newStock,
        refillStatus
      };
      saveMaterialToFirestore(updatedMat).catch(err => console.warn('Firestore sync batch mat error:', err));
      return updatedMat;
    });

    setMaterials(updatedMaterials);
    setStockIns(prev => [...newStockIns, ...prev]);
    playNotificationChime();
    setToastMessage({
      type: 'success',
      title: 'รับเข้าวัสดุทุกรายการ 20 หน่วย สำเร็จ!',
      desc: `บันทึกรับเข้าพัสดุทุกรายการอย่างละ 20 หน่วย (${updatedMaterials.length} รายการ) เข้าสู่คลังและสมุดคุมเรียบร้อยแล้ว`
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-amber-100 selection:text-amber-900">
      {/* Top Main Navigation Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo and College Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white font-bold shadow-xs">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 text-sm md:text-base truncate">
                    ระบบเบิกจ่ายวัสดุ
                  </span>
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    COPAG MSU
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate hidden sm:block">
                  วิทยาลัยการเมืองการปกครอง มหาวิทยาลัยมหาสารคาม
                </p>
              </div>
            </div>

            {/* Navigation Tabs (Displayed only when panel is set to 'top') */}
            {panelPosition === 'top' ? (
              <nav className="flex items-center gap-1 overflow-x-auto py-1">
                {/* User Tab */}
                <button
                  id="nav-tab-requisition"
                  onClick={() => {
                    setCurrentViewingOrder(null);
                    setActiveTab('requisition');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === 'requisition' && !currentViewingOrder
                      ? 'bg-amber-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>คีย์ขอเบิกพัสดุ</span>
                </button>

                {/* Admin Tabs */}
                {currentUser?.role === 'admin' && (
                  <>
                    <button
                      id="nav-tab-requisitions"
                      onClick={() => {
                        setCurrentViewingOrder(null);
                        setActiveTab('requisitions');
                      }}
                      className={`relative px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                        activeTab === 'requisitions' && !currentViewingOrder
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>📋 อนุมัติเบิกจ่าย</span>
                      {pendingOrdersCount > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                          {pendingOrdersCount}
                        </span>
                      )}
                    </button>

                    <button
                      id="nav-tab-dashboard"
                      onClick={() => {
                        setCurrentViewingOrder(null);
                        setActiveTab('dashboard');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                        activeTab === 'dashboard' && !currentViewingOrder
                          ? 'bg-amber-600 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>แดชบอร์ด</span>
                    </button>

                    <button
                      id="nav-tab-stockout"
                      onClick={() => {
                        setCurrentViewingOrder(null);
                        setActiveTab('stockout');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                        activeTab === 'stockout' && !currentViewingOrder
                          ? 'bg-amber-600 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <DollarSign className="w-3.5 h-3.5 text-amber-500" />
                      <span>💰 เบิกจ่าย</span>
                    </button>

                    <button
                      id="nav-tab-stockin"
                      onClick={() => {
                        setCurrentViewingOrder(null);
                        setActiveTab('stockin');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                        activeTab === 'stockin' && !currentViewingOrder
                          ? 'bg-amber-600 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <PackagePlus className="w-3.5 h-3.5 text-emerald-500" />
                      <span>💸 รับเข้า</span>
                    </button>

                    <button
                      id="nav-tab-inventory"
                      onClick={() => {
                        setCurrentViewingOrder(null);
                        setActiveTab('inventory');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                        activeTab === 'inventory' && !currentViewingOrder
                          ? 'bg-amber-600 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-indigo-500" />
                      <span>📊 รายงานพัสดุคงเหลือ</span>
                    </button>

                    <button
                      id="nav-tab-ledger"
                      onClick={() => {
                        setCurrentViewingOrder(null);
                        setLedgerTargetMaterialId(undefined);
                        setActiveTab('ledger');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                        activeTab === 'ledger' && !currentViewingOrder
                          ? 'bg-amber-600 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                      <span>📒 สมุดคุมบัญชีพัสดุ</span>
                    </button>
                  </>
                )}
              </nav>
            ) : (
              /* When panel is on the right, show clean active page pill in the center */
              <div className="hidden md:flex items-center gap-2 bg-amber-50/80 border border-amber-200/80 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-amber-900 shadow-2xs">
                <span className="text-slate-400 font-normal">หน้าปัจจุบัน:</span>
                <span className="font-bold">{getActiveTabTitle(activeTab)}</span>
              </div>
            )}

            {/* Right: Notifications, Panel Switcher, Role Switch & User Profile */}
            <div className="flex items-center gap-2">
              {/* Position Switcher (Toggle between Right side and Top bar) */}
              <button
                id="btn-toggle-panel-position"
                onClick={handleTogglePanelPosition}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all border border-slate-200 bg-white hover:bg-amber-50 hover:border-amber-300 text-slate-700 hover:text-amber-900 shadow-2xs"
                title={
                  panelPosition === 'right'
                    ? 'คลิกเพื่อย้ายแผงควบคุมไปไว้ด้านบน'
                    : 'คลิกเพื่อย้ายแผงควบคุมมาไว้ด้านข้างฝั่งขวา'
                }
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
                <span>{panelPosition === 'right' ? 'แผงควบคุม: ด้านขวา' : 'แผงควบคุม: ด้านบน'}</span>
              </button>

              {/* Mobile button to open right control panel drawer */}
              {panelPosition === 'right' && (
                <button
                  id="btn-open-mobile-sidebar"
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs cursor-pointer"
                  title="เปิดแผงควบคุมระบบ"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>แผงควบคุม</span>
                  {pendingOrdersCount > 0 && currentUser?.role === 'admin' && (
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  )}
                </button>
              )}

              {/* Quick Role Switcher button */}
              {currentUser && (
                <button
                  id="btn-quick-role-toggle"
                  onClick={handleToggleRole}
                  className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all border ${
                    currentUser.role === 'admin'
                      ? 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                      : 'border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold shadow-2xs'
                  }`}
                  title="คลิกเพื่อสลับบทบาททดสอบระหว่าง ผู้ขอเบิก ↔ แอดมินผู้อนุมัติ"
                >
                  {currentUser.role === 'admin' ? (
                    <>
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>สลับเป็นผู้ขอเบิก</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-3.5 h-3.5 text-amber-600" />
                      <span>สลับเป็นแอดมิน</span>
                    </>
                  )}
                </button>
              )}

              {/* Firebase Firestore Cloud Real-time Status Badge */}
              <div
                id="firebase-sync-status-badge"
                className={`hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                  firebaseConnected
                    ? 'border-emerald-200 bg-emerald-50/90 text-emerald-800 shadow-2xs'
                    : firebaseConnected === false
                    ? 'border-amber-200 bg-amber-50 text-amber-800'
                    : 'border-slate-200 bg-slate-50 text-slate-500'
                }`}
                title="ระบบเชื่อมต่อฐานข้อมูล Google Firebase Firestore (ซิงค์ข้อมูลเรียลไทม์ข้ามอุปกรณ์และเบราว์เซอร์)"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    firebaseConnected
                      ? isFirebaseSyncing
                        ? 'bg-amber-500 animate-spin'
                        : 'bg-emerald-500 animate-pulse'
                      : 'bg-amber-400'
                  }`}
                />
                <span className="truncate">
                  {isFirebaseSyncing
                    ? 'กำลังเชื่อมต่อ Cloud...'
                    : firebaseConnected
                    ? '🔥 Firebase ซิงค์เรียลไทม์'
                    : '🔥 Firebase Cloud'}
                </span>
              </div>

              {/* Notification Bell (Admin side notification for pending requisitions) */}
              {currentUser?.role === 'admin' && (
                <div className="relative">
                  <button
                    id="btn-admin-notification-bell"
                    onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                    className={`relative p-2 rounded-lg cursor-pointer transition-colors ${
                      pendingOrdersCount > 0
                        ? 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                        : 'text-slate-500 hover:bg-slate-100'
                    }`}
                    title="การแจ้งเตือนคำขอเบิกพัสดุ"
                  >
                    {pendingOrdersCount > 0 ? (
                      <BellRing className="w-4 h-4 text-amber-600 animate-pulse" />
                    ) : (
                      <Bell className="w-4 h-4" />
                    )}
                    {pendingOrdersCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-bounce">
                        {pendingOrdersCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {showNotificationDropdown && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                      <div className="p-3 bg-amber-50 border-b border-amber-100 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Bell className="w-4 h-4 text-amber-700" />
                          <span className="text-xs font-bold text-slate-900">
                            การแจ้งเตือนคำขอเบิกพัสดุ
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                          รออนุมัติ {pendingOrdersCount} รายการ
                        </span>
                      </div>

                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                        {pendingOrdersCount === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-500">
                            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                            <p className="font-semibold text-slate-700">ไม่มีคำขอเบิกพัสดุค้างรออนุมัติ</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              เมื่อผู้ใช้คีย์ขอเบิกพัสดุเข้ามา ระบบจะแจ้งเตือนที่นี่ทันที
                            </p>
                          </div>
                        ) : (
                          orders
                            .filter(o => o.status === 'รออนุมัติ')
                            .map(order => (
                              <div
                                key={order.id}
                                className="p-3 hover:bg-amber-50/50 transition-colors"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <p className="text-xs font-bold text-slate-900">
                                      {order.requesterName}
                                    </p>
                                    <p className="text-[11px] text-slate-500 truncate max-w-[200px]">
                                      {order.department}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-[10px] font-mono text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded font-semibold">
                                        {order.docNo}
                                      </span>
                                      <span className="text-[10px] text-slate-500">
                                        {order.items.length} รายการ
                                      </span>
                                      <span className="text-[10px] font-bold text-slate-700">
                                        ฿{order.totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                                      </span>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => {
                                      setShowNotificationDropdown(false);
                                      setCurrentViewingOrder(null);
                                      setActiveTab('requisitions');
                                    }}
                                    className="px-2 py-1 text-[11px] font-bold bg-amber-600 hover:bg-amber-700 text-white rounded cursor-pointer whitespace-nowrap"
                                  >
                                    อนุมัติ
                                  </button>
                                </div>
                              </div>
                            ))
                        )}
                      </div>

                      <div className="p-2 bg-slate-50 border-t border-slate-100 text-center">
                        <button
                          onClick={() => {
                            setShowNotificationDropdown(false);
                            setCurrentViewingOrder(null);
                            setActiveTab('requisitions');
                          }}
                          className="text-xs font-semibold text-amber-700 hover:text-amber-800 cursor-pointer"
                        >
                          เปิดหน้ารวมใบขอเบิกทั้งหมด →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* User Profile & Menu */}
              {currentUser ? (
                <div className="relative">
                  <button
                    id="btn-user-profile-menu"
                    onClick={() => setShowUserMenu(prev => !prev)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200 cursor-pointer"
                  >
                    <div className="hidden md:block text-right">
                      <p className="text-xs font-bold text-slate-800 leading-tight">
                        {currentUser.name}
                      </p>
                      <span className="text-[10px] text-slate-500 flex items-center justify-end gap-1">
                        {currentUser.email.toLowerCase() === 'kanjanapat.m@msu.ac.th' ? (
                          <span className="text-amber-700 font-bold">🛡️ แอดมิน (Super Admin)</span>
                        ) : currentUser.role === 'admin' ? (
                          <span className="text-amber-700 font-medium">🛡️ เจ้าหน้าที่พัสดุ</span>
                        ) : (
                          <span className="text-blue-600 font-medium">👤 ผู้ขอเบิก</span>
                        )}
                      </span>
                    </div>
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-8 h-8 rounded-full border border-slate-200 bg-slate-50 ring-1 ring-slate-100"
                    />
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* User Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                      {/* User Info Card */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={currentUser.avatar}
                            alt={currentUser.name}
                            className="w-10 h-10 rounded-full border border-slate-200 bg-white shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 text-sm truncate">
                              {currentUser.name}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {currentUser.position || 'บุคลากร มมส.'}
                            </p>
                            <p className="text-[10px] font-mono text-amber-800 font-semibold truncate">
                              {currentUser.email}
                            </p>
                          </div>
                        </div>

                        <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">สิทธิ์ในระบบ:</span>
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              currentUser.role === 'admin'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-blue-100 text-blue-900 border border-blue-200'
                            }`}
                          >
                            {currentUser.email.toLowerCase() === 'kanjanapat.m@msu.ac.th'
                              ? '🛡️ แอดมิน (Super Admin)'
                              : currentUser.role === 'admin'
                              ? '🛡️ เจ้าหน้าที่พัสดุ'
                              : '👤 ผู้ขอเบิก'}
                          </span>
                        </div>
                      </div>

                      {/* Dropdown Actions */}
                      <div className="mt-2 space-y-1">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            handleToggleRole();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-amber-800 transition-colors cursor-pointer font-medium"
                        >
                          <Shield className="w-4 h-4 text-amber-600" />
                          <span>สลับบทบาท (ผู้ขอเบิก ↔ แอดมิน)</span>
                        </button>

                        <button
                          id="btn-dropdown-switch-account"
                          onClick={() => {
                            setShowUserMenu(false);
                            setShowLoginModal(true);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 hover:text-amber-800 transition-colors cursor-pointer font-medium"
                        >
                          <User className="w-4 h-4 text-blue-600" />
                          <span>เปลี่ยนบัญชี มมส. (@msu.ac.th)</span>
                        </button>

                        <div className="border-t border-slate-100 my-1" />

                        <button
                          id="btn-dropdown-logout"
                          onClick={() => {
                            setShowUserMenu(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer font-bold"
                        >
                          <LogOut className="w-4 h-4 text-red-500" />
                          <span>ออกจากระบบ (Logout)</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  id="btn-open-login"
                  onClick={() => setShowLoginModal(true)}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>เข้าสู่ระบบ @msu.ac.th</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Admin Requisition Notification Alert Bar */}
      {currentUser?.role === 'admin' && pendingOrdersCount > 0 && activeTab !== 'requisitions' && (
        <div className="bg-amber-600 text-white px-4 py-2 text-xs font-medium shadow-xs sticky top-16 z-20">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <BellRing className="w-4 h-4 text-amber-200 animate-bounce shrink-0" />
              <p className="truncate">
                <strong>แจ้งเตือนคำขอเบิกพัสดุใหม่:</strong> มีคำขอเบิกพัสดุจำนวน{' '}
                <span className="bg-amber-800 px-1.5 py-0.2 rounded font-bold text-white">
                  {pendingOrdersCount} ใบ
                </span>{' '}
                ที่ผู้ใช้คีย์ส่งเข้ามา รอเจ้าหน้าที่ตรวจสอบและอนุมัติเบิกจ่ายออกจากระบบ
              </p>
            </div>
            <button
              id="btn-alert-banner-goto-requisitions"
              onClick={() => {
                setCurrentViewingOrder(null);
                setActiveTab('requisitions');
              }}
              className="px-3 py-1 bg-white hover:bg-amber-50 text-amber-900 font-bold rounded-md shadow-2xs cursor-pointer shrink-0 transition-colors"
            >
              เปิดหน้ารวมใบขอเบิก ({pendingOrdersCount}) →
            </button>
          </div>
        </div>
      )}

      {/* Page Body: Main Content Area + Right Control Panel */}
      <div className="flex-1 flex flex-col lg:flex-row w-full min-h-0 relative">
        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {!currentUser ? (
            /* Logged-out / Guest State */
            <GuestWelcomeView
              onLoginProfile={handleLogin}
              onOpenLoginModal={() => setShowLoginModal(true)}
              materialsCount={materials.length}
            />
          ) : currentViewingOrder ? (
            /* If user is currently looking at a generated Requisition Form for print / PDF */
            <RequisitionPrintForm
              order={currentViewingOrder}
              onBack={() => setCurrentViewingOrder(null)}
              accessToken={currentUser?.accessToken}
              onDriveSaved={handleDriveSaved}
            />
          ) : (
            <>
              {/* Access restriction notice if regular user attempts to access admin tabs */}
              {currentUser.role !== 'admin' && activeTab !== 'requisition' && (
                <div className="bg-white rounded-2xl border border-amber-200 p-8 text-center max-w-md mx-auto my-12 space-y-4 shadow-sm animate-in fade-in duration-200">
                  <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-amber-700 border border-amber-200">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">
                    หน้านี้สงวนสิทธิ์เฉพาะเจ้าหน้าที่พัสดุ (แอดมิน)
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    ท่านกำลังเข้าใช้งานด้วยบัญชีผู้ขอเบิก หากต้องการเข้าถึงระบบจัดการคลัง กรุณาเข้าสู่ระบบด้วยบัญชีแอดมิน (kanjanapat.m@msu.ac.th)
                  </p>
                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      onClick={() => {
                        handleLogin(SUPER_ADMIN_PROFILE);
                      }}
                      className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                    >
                      เข้าสู่ระบบในฐานะ kanjanapat.m@msu.ac.th (แอดมิน)
                    </button>
                    <button
                      onClick={() => setActiveTab('requisition')}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                    >
                      กลับสู่หน้าคีย์ขอเบิกพัสดุ
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'requisition' && (
                <UserRequisitionView
                  materials={materials}
                  user={currentUser}
                  orders={orders}
                  onSubmitOrder={handleSubmitRequisition}
                  onViewPrintForm={order => setCurrentViewingOrder(order)}
                  onCancelOrder={handleCancelUserOrder}
                  onEditOrder={handleUpdateRequisition}
                />
              )}

              {activeTab === 'requisitions' && currentUser?.role === 'admin' && (
                <AdminRequisitionsView
                  orders={orders}
                  materials={materials}
                  currentUser={currentUser}
                  onApproveAndDisburse={handleApproveAndDisburseOrder}
                  onRejectOrder={handleRejectOrder}
                  onViewPrintForm={order => setCurrentViewingOrder(order)}
                  onEditOrder={handleUpdateRequisition}
                  onCancelDisbursement={handleCancelDisbursement}
                />
              )}

              {activeTab === 'dashboard' && currentUser?.role === 'admin' && (
                <AdminDashboardView
                  materials={materials}
                  orders={orders}
                  stockIns={stockIns}
                  stockOuts={stockOuts}
                  onNavigateTab={tab => setActiveTab(tab)}
                />
              )}

              {activeTab === 'stockout' && currentUser?.role === 'admin' && (
                <AdminStockOutView
                  stockOuts={stockOuts}
                  materials={materials}
                  user={currentUser}
                  spreadsheetId={spreadsheetId}
                  onAddStockOut={handleAddStockOut}
                  onEditStockOut={handleUpdateStockOut}
                  onDeleteStockOut={handleDeleteStockOut}
                />
              )}

              {activeTab === 'stockin' && currentUser?.role === 'admin' && (
                <AdminStockInView
                  stockIns={stockIns}
                  materials={materials}
                  user={currentUser}
                  spreadsheetId={spreadsheetId}
                  onAddStockIn={handleAddStockIn}
                  onEditStockIn={handleUpdateStockIn}
                  onDeleteStockIn={handleDeleteStockIn}
                  onReceiveAll20={handleReceiveAll20}
                  onResetAllStockToZero={handleResetAllStockToZero}
                />
              )}

              {activeTab === 'inventory' && currentUser?.role === 'admin' && (
                <AdminInventoryReportView
                  materials={materials}
                  orders={orders}
                  stockOuts={stockOuts}
                  onResetAllStockToZero={handleResetAllStockToZero}
                  onReceiveAll20={handleReceiveAll20}
                  onAddMaterial={handleAddMaterial}
                  onUpdateMaterial={handleUpdateMaterial}
                  onViewLedger={(matId) => {
                    if (matId) {
                      setLedgerTargetMaterialId(matId);
                    }
                    setActiveTab('ledger');
                  }}
                />
              )}

              {activeTab === 'ledger' && currentUser?.role === 'admin' && (
                <AdminLedgerView
                  materials={materials}
                  stockIns={stockIns}
                  stockOuts={stockOuts}
                  orders={orders}
                  initialSelectedId={ledgerTargetMaterialId}
                  onNavigateToStockIn={() => setActiveTab('stockin')}
                  onNavigateToStockOut={() => setActiveTab('stockout')}
                  onReceiveAll20={handleReceiveAll20}
                  onResetAllStockToZero={handleResetAllStockToZero}
                />
              )}
            </>
          )}
        </main>

        {/* Right-side Control Panel (แผงควบคุมด้านข้างฝั่งขวา) */}
        {panelPosition === 'right' && (
          <RightControlPanel
            activeTab={activeTab}
            onSelectTab={tab => setActiveTab(tab as any)}
            currentUser={currentUser}
            onToggleRole={handleToggleRole}
            pendingOrdersCount={pendingOrdersCount}
            currentViewingOrder={currentViewingOrder}
            onClearViewingOrder={() => setCurrentViewingOrder(null)}
            panelPosition={panelPosition}
            onTogglePanelPosition={handleTogglePanelPosition}
            isCollapsed={isRightSidebarCollapsed}
            onToggleCollapse={handleToggleSidebarCollapse}
            isMobileOpen={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
            spreadsheetId={spreadsheetId}
            onLogout={handleLogout}
            onOpenLogin={() => setShowLoginModal(true)}
          />
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2569 วิทยาลัยการเมืองการปกครอง มหาวิทยาลัยมหาสารคาม (College of Politics and Governance, Mahasarakham University)</p>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-slate-600">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              โครงสร้าง Sheet เดิม
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-slate-600">
              <FolderOpen className="w-3.5 h-3.5 text-amber-600" />
              ไดร์ฟของฉัน: โฟลเดอร์ &ldquo;ใบเบิกวัสดุ&rdquo;
            </span>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          currentUser={currentUser}
          onLogin={handleLogin}
          onLogout={handleLogout}
          onClose={() => setShowLoginModal(false)}
        />
      )}

      {/* Floating Action Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md w-full animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div
            className={`p-4 rounded-xl shadow-xl border flex items-start gap-3 ${
              toastMessage.type === 'success'
                ? 'bg-white border-emerald-200 text-slate-800'
                : toastMessage.type === 'warning'
                ? 'bg-white border-amber-200 text-slate-800'
                : 'bg-white border-sky-200 text-slate-800'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {toastMessage.type === 'success' ? (
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              ) : toastMessage.type === 'warning' ? (
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-900">{toastMessage.title}</h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{toastMessage.desc}</p>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
