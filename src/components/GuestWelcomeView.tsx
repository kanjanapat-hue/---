import React from 'react';
import { UserProfile } from '../types';
import {
  School,
  Shield,
  User,
  LogIn,
  CheckCircle2,
  Package,
  FileText,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { SUPER_ADMIN_PROFILE, DEMO_USER_PROFILE } from '../services/auth';

interface GuestWelcomeViewProps {
  onLoginProfile: (user: UserProfile) => void;
  onOpenLoginModal: () => void;
  materialsCount: number;
}

export const GuestWelcomeView: React.FC<GuestWelcomeViewProps> = ({
  onLoginProfile,
  onOpenLoginModal,
  materialsCount
}) => {
  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 space-y-8 animate-in fade-in duration-300">
      {/* Hero Welcome Card */}
      <div className="bg-linear-to-br from-amber-600 via-amber-700 to-amber-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs border border-white/25 text-xs font-semibold text-amber-100">
            <School className="w-4 h-4" />
            <span>มหาวิทยาลัยมหาสารคาม • @msu.ac.th</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
            ระบบสารสนเทศบริหารจัดการและเบิกจ่ายพัสดุ
          </h1>

          <p className="text-sm sm:text-base text-amber-100/90 leading-relaxed">
            วิทยาลัยการเมืองการปกครอง มหาวิทยาลัยมหาสารคาม (COPAG MSU)
            รองรับการคีย์ขอเบิกพัสดุออนไลน์ ตรวจสอบและอนุมัติตัดจ่าย สมุดคุมบัญชีพัสดุ
            และเชื่อมโยงฐานข้อมูลคลาวด์แบบเรียลไทม์
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              id="btn-guest-open-login"
              onClick={onOpenLoginModal}
              className="px-6 py-3 bg-white hover:bg-amber-50 text-amber-950 font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-amber-700" />
              <span>เข้าสู่ระบบด้วย MSU Account</span>
              <ArrowRight className="w-4 h-4 text-amber-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Access Account Selector */}
      <div className="space-y-4">
        <div className="text-center sm:text-left">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            เลือกเข้าใช้งานด่วนตามบทบาท
          </h2>
          <p className="text-xs text-slate-500">
            คลิกเลือกบัญชีที่ต้องการเพื่อเข้าสู่ระบบและเริ่มใช้งานได้ทันที
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Admin Account Card: kanjanapat.m@msu.ac.th */}
          <div className="p-5 rounded-2xl border-2 border-amber-400/90 bg-linear-to-br from-amber-50/70 to-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-600 text-white flex items-center gap-1.5 shadow-2xs">
                  <Shield className="w-3.5 h-3.5" />
                  <span>แอดมิน (Super Admin)</span>
                </span>
                <span className="text-[11px] font-mono text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded font-semibold">
                  เจ้าหน้าที่พัสดุ
                </span>
              </div>

              <div className="flex items-center gap-3.5">
                <img
                  src={SUPER_ADMIN_PROFILE.avatar}
                  alt={SUPER_ADMIN_PROFILE.name}
                  className="w-12 h-12 rounded-full border-2 border-amber-300 ring-2 ring-amber-100 shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-amber-900 transition-colors">
                    {SUPER_ADMIN_PROFILE.name}
                  </h3>
                  <p className="text-xs text-slate-600 truncate">
                    {SUPER_ADMIN_PROFILE.position}
                  </p>
                  <p className="text-xs font-mono font-semibold text-amber-800 mt-0.5">
                    {SUPER_ADMIN_PROFILE.email}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed border-t border-amber-200/60 pt-2.5">
                สิทธิ์บริหารจัดการคลังพัสดุเต็มรูปแบบ ตรวจสอบและอนุมัติตัดจ่ายพัสดุ บันทึกรับเข้าพัสดุ และสมุดคุมบัญชีพัสดุ
              </p>
            </div>

            <button
              id="btn-quick-login-admin"
              onClick={() => onLoginProfile(SUPER_ADMIN_PROFILE)}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Shield className="w-4 h-4" />
              <span>เข้าใช้งานในฐานะ แอดมิน (kanjanapat.m@msu.ac.th)</span>
            </button>
          </div>

          {/* User Account Card: somchai.p@msu.ac.th */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between space-y-4 group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>ผู้ขอเบิก (อาจารย์/บุคลากร)</span>
                </span>
                <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  สาขาวิชารัฐศาสตร์
                </span>
              </div>

              <div className="flex items-center gap-3.5">
                <img
                  src={DEMO_USER_PROFILE.avatar}
                  alt={DEMO_USER_PROFILE.name}
                  className="w-12 h-12 rounded-full border border-slate-200 shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-blue-900 transition-colors">
                    {DEMO_USER_PROFILE.name}
                  </h3>
                  <p className="text-xs text-slate-500 truncate">
                    {DEMO_USER_PROFILE.position}
                  </p>
                  <p className="text-xs font-mono text-slate-600 mt-0.5">
                    {DEMO_USER_PROFILE.email}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-2.5">
                สิทธิ์สำหรับบุคลากรและอาจารย์ คีย์เลือกรายการวัสดุเพื่อขอเบิก ติดตามสถานะใบขอเบิก และพิมพ์ใบเบิกพัสดุ
              </p>
            </div>

            <button
              id="btn-quick-login-user"
              onClick={() => onLoginProfile(DEMO_USER_PROFILE)}
              className="w-full py-2.5 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span>เข้าใช้งานในฐานะ ผู้ขอเบิก (ดร.สมชาย ปรีชาชาญ)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">
              ทะเบียนพัสดุ {materialsCount} รายการ
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              ตรวจนับคงคลัง แยกหมวดหมู่ และเตือนเมื่อวัสดุใกล้หมด
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">
              ใบเบิกพัสดุตามระเบียบ
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              พิมพ์แบบฟอร์มใบเบิกวัสดุ COPAG พร้อมส่งออกและบันทึก
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">
              สมุดคุมบัญชี & Cloud Sync
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              สต็อกการ์ดอัตโนมัติ ซิงค์ข้อมูลผ่าน Google Firebase ทันที
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
