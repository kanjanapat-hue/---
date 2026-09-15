import React, { useState } from 'react';
import { UserProfile } from '../types';
import { LogIn, Shield, Check, School, Info } from 'lucide-react';

interface LoginModalProps {
  onLogin: (user: UserProfile) => void;
  onClose?: () => void;
  currentUser?: UserProfile | null;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('kanjanapat.m@msu.ac.th');
  const [name, setName] = useState('กาญจนภาษณ์ มาตบุรม');
  const [role, setRole] = useState<'admin' | 'user'>('admin');
  const [department, setDepartment] = useState('งานบริการการศึกษาและพัฒนาคุณภาพนิสิต');
  const [position, setPosition] = useState('นักวิชาการศึกษา');
  const [error, setError] = useState('');

  const handleMsuLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim().toLowerCase().endsWith('@msu.ac.th')) {
      setError('กรุณาใช้อีเมลสถาบันที่ลงท้ายด้วย @msu.ac.th เท่านั้น');
      return;
    }

    setError('');
    const profile: UserProfile = {
      email: email.trim().toLowerCase(),
      name: name.trim() || email.split('@')[0],
      role,
      department,
      position,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || email)}`,
    };

    onLogin(profile);
  };

  // Quick switch presets for evaluation
  const setPresetUser = () => {
    setEmail('somchai.p@msu.ac.th');
    setName('ดร.สมชาย ปรีชาชาญ');
    setRole('user');
    setDepartment('สาขาวิชารัฐศาสตร์');
    setPosition('อาจารย์ประจำสาขาวิชา');
    setError('');
  };

  const setPresetAdmin = () => {
    setEmail('kanjanapat.m@msu.ac.th');
    setName('กาญจนภาษณ์ มาตบุรม');
    setRole('admin');
    setDepartment('งานการเงินและพัสดุ');
    setPosition('เจ้าหน้าที่บริหารงานทั่วไป (พัสดุ)');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6">
        {/* Emblem & Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
            <School className="w-8 h-8 text-amber-700" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            เข้าสู่ระบบด้วย @msu.ac.th
          </h3>
          <p className="text-xs text-slate-500">
            ระบบสารสนเทศเบิกจ่ายพัสดุและวัสดุ <br />
            วิทยาลัยการเมืองการปกครอง มหาวิทยาลัยมหาสารคาม
          </p>
        </div>

        {/* Quick Role Selection Presets */}
        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={setPresetAdmin}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              role === 'admin'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            แอดมิน (เจ้าหน้าที่พัสดุ)
          </button>
          <button
            type="button"
            onClick={setPresetUser}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              role === 'user'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ผู้ใช้งาน (อาจารย์/บุคลากร)
          </button>
        </div>

        <form onSubmit={handleMsuLogin} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              MSU Account (@msu.ac.th) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="input-msu-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name.surname@msu.ac.th"
                className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              ชื่อ - นามสกุล <span className="text-red-500">*</span>
            </label>
            <input
              id="input-msu-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="เช่น กาญจนภาษณ์ มาตบุรม"
              className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">ตำแหน่ง</label>
              <input
                type="text"
                value={position}
                onChange={e => setPosition(e.target.value)}
                placeholder="ตำแหน่งงาน"
                className="w-full p-2 rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">สิทธิ์เข้าใช้งาน</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as 'admin' | 'user')}
                className="w-full p-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="admin">แอดมิน (จัดการคลัง)</option>
                <option value="user">ผู้ใช้ (ขอเบิกวัสดุ)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">หน่วยงาน / ภาควิชา</label>
            <input
              type="text"
              value={department}
              onChange={e => setDepartment(e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-200"
            />
          </div>

          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-600 text-[11px] font-medium">
              {error}
            </div>
          )}

          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              ระบบล็อกอินเชื่อมโยงความปลอดภัยกับโดเมนมหาวิทยาลัยมหาสารคาม (@msu.ac.th) เพื่อออกใบเบิกพัสดุและบันทึกข้อมูล
            </span>
          </div>

          <button
            id="btn-confirm-msu-login"
            type="submit"
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer mt-2"
          >
            <LogIn className="w-4 h-4" />
            <span>เข้าสู่ระบบด้วยบัญชี มมส.</span>
          </button>
        </form>
      </div>
    </div>
  );
};
