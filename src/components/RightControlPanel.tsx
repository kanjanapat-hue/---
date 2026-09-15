import React from 'react';
import { UserProfile, RequisitionOrder } from '../types';
import {
  LayoutDashboard,
  ShoppingCart,
  FileCheck,
  DollarSign,
  PackagePlus,
  BarChart3,
  BookOpen,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  X,
  User,
  Shield,
  PanelRightClose,
  PanelRightOpen,
  ArrowUpToLine,
  ArrowRightToLine,
  FileSpreadsheet
} from 'lucide-react';

export interface RightControlPanelProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: UserProfile | null;
  onToggleRole: () => void;
  pendingOrdersCount: number;
  currentViewingOrder: RequisitionOrder | null;
  onClearViewingOrder: () => void;
  panelPosition: 'right' | 'top';
  onTogglePanelPosition: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  spreadsheetId?: string;
}

export const RightControlPanel: React.FC<RightControlPanelProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
  onToggleRole,
  pendingOrdersCount,
  currentViewingOrder,
  onClearViewingOrder,
  panelPosition,
  onTogglePanelPosition,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  spreadsheetId
}) => {
  const handleNavClick = (tabId: string) => {
    onClearViewingOrder();
    onSelectTab(tabId);
    if (isMobileOpen) {
      onCloseMobile();
    }
  };

  const adminNavItems = [
    {
      id: 'requisitions',
      label: 'อนุมัติเบิกจ่าย',
      icon: <FileCheck className="w-4 h-4" />,
      badge: pendingOrdersCount,
      color: 'text-amber-700 bg-amber-50 hover:bg-amber-100',
      activeColor: 'bg-amber-600 text-white shadow-xs',
      description: 'ตรวจสอบและตัดจ่ายพัสดุ'
    },
    {
      id: 'dashboard',
      label: 'แดชบอร์ดภาพรวม',
      icon: <LayoutDashboard className="w-4 h-4" />,
      color: 'text-slate-700 hover:bg-slate-100',
      activeColor: 'bg-amber-600 text-white shadow-xs',
      description: 'สรุปยอดและสถิติการใช้งาน'
    },
    {
      id: 'stockout',
      label: 'บันทึกเบิกจ่ายพัสดุ',
      icon: <DollarSign className="w-4 h-4 text-amber-500" />,
      color: 'text-slate-700 hover:bg-slate-100',
      activeColor: 'bg-amber-600 text-white shadow-xs',
      description: 'ประวัติการจ่ายและออกพัสดุ'
    },
    {
      id: 'stockin',
      label: 'บันทึกรับเข้าพัสดุ',
      icon: <PackagePlus className="w-4 h-4 text-emerald-500" />,
      color: 'text-slate-700 hover:bg-slate-100',
      activeColor: 'bg-amber-600 text-white shadow-xs',
      description: 'รับของเข้าคลังและเพิ่มสต็อก'
    },
    {
      id: 'inventory',
      label: 'รายงานพัสดุคงเหลือ',
      icon: <BarChart3 className="w-4 h-4 text-indigo-500" />,
      color: 'text-slate-700 hover:bg-slate-100',
      activeColor: 'bg-amber-600 text-white shadow-xs',
      description: 'ตรวจเช็กสต็อกและระดับเตือน'
    },
    {
      id: 'ledger',
      label: 'สมุดคุมบัญชีพัสดุ',
      icon: <BookOpen className="w-4 h-4 text-amber-500" />,
      color: 'text-slate-700 hover:bg-slate-100',
      activeColor: 'bg-amber-600 text-white shadow-xs',
      description: 'สต็อกการ์ดตามระเบียบพัสดุ'
    }
  ];

  const content = (
    <div className="h-full flex flex-col justify-between overflow-y-auto">
      {/* Top Header of the Control Panel */}
      <div>
        <div className="p-4 border-b border-slate-200 bg-linear-to-r from-amber-50/70 to-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                  <span>แผงควบคุมระบบ</span>
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                    ขวา
                  </span>
                </h3>
                <p className="text-[10px] text-slate-500 truncate">
                  เมนูจัดการพัสดุ COPAG
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Toggle Position Button (Switch between right and top) */}
            <button
              onClick={onTogglePanelPosition}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg transition-colors cursor-pointer"
              title={
                panelPosition === 'right'
                  ? 'ย้ายแผงควบคุมกลับไปไว้ด้านบน'
                  : 'ย้ายแผงควบคุมมาไว้ด้านข้างฝั่งขวา'
              }
            >
              <ArrowUpToLine className="w-4 h-4" />
            </button>

            {/* Collapse / Expand Button on Desktop */}
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg transition-colors cursor-pointer"
              title={isCollapsed ? 'ขยายแผงควบคุม' : 'ย่อแผงควบคุม'}
            >
              {isCollapsed ? (
                <PanelRightOpen className="w-4 h-4" />
              ) : (
                <PanelRightClose className="w-4 h-4" />
              )}
            </button>

            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg transition-colors cursor-pointer"
              title="ปิดแผงควบคุม"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Items List */}
        <div className="p-3 space-y-4">
          {/* User Section */}
          <div>
            {!isCollapsed && (
              <div className="px-2 pb-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                เมนูผู้ขอเบิก
              </div>
            )}
            <button
              id="sidebar-nav-tab-requisition"
              onClick={() => handleNavClick('requisition')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'requisition' && !currentViewingOrder
                  ? 'bg-amber-600 text-white shadow-xs font-bold'
                  : 'text-slate-700 hover:bg-amber-50/60 hover:text-amber-900'
              } ${isCollapsed ? 'justify-center px-2' : ''}`}
              title="คีย์ขอเบิกพัสดุ (เลือกพัสดุและส่งคำขอ)"
            >
              <div
                className={`shrink-0 ${
                  activeTab === 'requisition' && !currentViewingOrder
                    ? 'text-white'
                    : 'text-amber-600'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
              </div>
              {!isCollapsed && (
                <div className="text-left flex-1 min-w-0">
                  <div className="truncate">คีย์ขอเบิกพัสดุ</div>
                  <div
                    className={`text-[10px] truncate ${
                      activeTab === 'requisition' && !currentViewingOrder
                        ? 'text-amber-100'
                        : 'text-slate-400'
                    }`}
                  >
                    เลือกพัสดุและส่งคำขอเบิก
                  </div>
                </div>
              )}
            </button>
          </div>

          {/* Admin Section */}
          {currentUser?.role === 'admin' && (
            <div>
              {!isCollapsed && (
                <div className="px-2 pb-1.5 pt-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase flex items-center justify-between">
                  <span>สำหรับเจ้าหน้าที่พัสดุ</span>
                  <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                    ADMIN
                  </span>
                </div>
              )}

              <div className="space-y-1">
                {adminNavItems.map(item => {
                  const isActive = activeTab === item.id && !currentViewingOrder;
                  return (
                    <button
                      key={item.id}
                      id={`sidebar-nav-tab-${item.id}`}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer relative ${
                        isActive
                          ? item.activeColor
                          : 'text-slate-700 hover:bg-slate-100'
                      } ${isCollapsed ? 'justify-center px-2' : ''}`}
                      title={`${item.label} - ${item.description}`}
                    >
                      <div
                        className={`shrink-0 ${
                          isActive ? 'text-white' : ''
                        }`}
                      >
                        {item.icon}
                      </div>

                      {!isCollapsed && (
                        <div className="text-left flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="truncate">{item.label}</span>
                            {item.badge !== undefined && item.badge > 0 && (
                              <span
                                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                                  isActive
                                    ? 'bg-white text-amber-700'
                                    : 'bg-rose-500 text-white animate-pulse'
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <div
                            className={`text-[10px] truncate ${
                              isActive ? 'text-amber-100' : 'text-slate-400'
                            }`}
                          >
                            {item.description}
                          </div>
                        </div>
                      )}

                      {/* Dot badge if collapsed */}
                      {isCollapsed && item.badge !== undefined && item.badge > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom User & System Info */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/70 space-y-2.5">
        {/* User profile capsule */}
        {currentUser && (
          <div
            className={`p-2.5 bg-white border border-slate-200 rounded-xl shadow-2xs flex items-center gap-2.5 ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-lg ring-1 ring-slate-200 shrink-0 object-cover"
            />
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {currentUser.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`inline-block w-1.5 h-1.5 rounded-full ${
                      currentUser.role === 'admin'
                        ? 'bg-amber-500'
                        : 'bg-blue-500'
                    }`}
                  />
                  <span className="text-[10px] text-slate-500 truncate">
                    {currentUser.role === 'admin'
                      ? 'เจ้าหน้าที่พัสดุ (แอดมิน)'
                      : 'ผู้ขอเบิก'}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Role Switcher Button */}
        <button
          id="sidebar-btn-quick-role-toggle"
          onClick={onToggleRole}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all border shadow-2xs ${
            currentUser?.role === 'admin'
              ? 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
              : 'border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold'
          } ${isCollapsed ? 'justify-center px-2' : ''}`}
          title="สลับบทบาททดสอบระหว่าง ผู้ขอเบิก ↔ แอดมิน"
        >
          {currentUser?.role === 'admin' ? (
            <>
              <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              {!isCollapsed && <span className="truncate">สลับเป็นผู้ขอเบิก</span>}
            </>
          ) : (
            <>
              <Shield className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              {!isCollapsed && <span className="truncate">สลับเป็นแอดมิน</span>}
            </>
          )}
        </button>

        {/* Google Spreadsheet Link Info */}
        {!isCollapsed && (
          <div className="px-2 pt-1 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
              Google Sheets พร้อมใช้งาน
            </span>
            <span className="font-mono text-[9px] bg-slate-200/60 px-1 py-0.2 rounded text-slate-600">
              v2.1
            </span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Right Sidebar */}
      <aside
        id="right-control-panel-desktop"
        className={`hidden lg:flex flex-col shrink-0 bg-white border-l border-slate-200 sticky top-16 h-[calc(100vh-4rem)] z-20 transition-all duration-200 ${
          isCollapsed ? 'w-18' : 'w-64 xl:w-72'
        }`}
      >
        {content}
      </aside>

      {/* Mobile Slide-over Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Drawer content sliding from the right */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-80 max-w-sm bg-white shadow-2xl border-l border-slate-200">
              {content}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
