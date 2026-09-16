import React from 'react';
import { School, LogIn, ArrowRight } from 'lucide-react';

interface GuestWelcomeViewProps {
  onOpenLoginModal: () => void;
}

export const GuestWelcomeView: React.FC<GuestWelcomeViewProps> = ({
  onOpenLoginModal
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-300">
      {/* Exact Login Card matching Screenshot_1.png */}
      <div className="w-full bg-linear-to-br from-[#b45309] via-[#8c3707] to-[#5c2409] rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-5 sm:space-y-6">
          {/* Badge: Mahasarakham University • @msu.ac.th */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-xs border border-white/25 text-xs font-semibold text-amber-100 shadow-2xs">
            <School className="w-4 h-4 text-amber-200 shrink-0" />
            <span>มหาวิทยาลัยมหาสารคาม • @msu.ac.th</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight text-white">
            ระบบสารสนเทศบริหารจัดการและเบิกจ่าย
            <br className="hidden sm:inline" />
            พัสดุ
          </h1>

          {/* Description text */}
          <p className="text-sm sm:text-base text-amber-100/90 leading-relaxed max-w-2xl font-normal">
            วิทยาลัยการเมืองการปกครอง มหาวิทยาลัยมหาสารคาม (COPAG MSU) รองรับการคีย์ขอเบิกพัสดุออนไลน์ ตรวจสอบและอนุมัติตัดจ่าย สมุดคุมบัญชีพัสดุ และเชื่อมโยงฐานข้อมูลคลาวด์แบบเรียลไทม์
          </p>

          {/* Login Button with MSU Account */}
          <div className="pt-2 sm:pt-4">
            <button
              id="btn-guest-open-login"
              onClick={onOpenLoginModal}
              className="px-6 sm:px-7 py-3 sm:py-3.5 bg-white hover:bg-amber-50 text-amber-950 font-bold text-sm sm:text-base rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2.5 cursor-pointer active:scale-98 group"
            >
              <LogIn className="w-4 h-4 sm:w-5 sm:h-5 text-amber-700 transition-transform group-hover:translate-x-0.5" />
              <span>เข้าสู่ระบบด้วย MSU Account</span>
              <ArrowRight className="w-4 h-4 text-amber-700 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

