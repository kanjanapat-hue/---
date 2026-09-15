import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import {
  LogIn,
  Shield,
  School,
  Info,
  CheckCircle2,
  X,
  User,
  LogOut,
  Sparkles,
  AlertCircle,
  Building2,
  Briefcase
} from 'lucide-react';
import {
  signInWithGoogleMsu,
  signInWithMsuAccount,
  checkIsAdmin,
  isMsuEmail,
  getRecentMsuAccounts,
  SUPER_ADMIN_PROFILE,
  DEMO_USER_PROFILE,
  COPAG_DEPARTMENTS
} from '../services/auth';

interface LoginModalProps {
  onLogin: (user: UserProfile) => void;
  onClose?: () => void;
  onLogout?: () => void;
  currentUser?: UserProfile | null;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  onLogin,
  onClose,
  onLogout,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'quick' | 'direct' | 'google'>('quick');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState(COPAG_DEPARTMENTS[0]);
  const [position, setPosition] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [error, setError] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [recentAccounts, setRecentAccounts] = useState<UserProfile[]>([]);

  useEffect(() => {
    setRecentAccounts(getRecentMsuAccounts());
  }, []);

  // When email changes, automatically enforce and reflect admin status
  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail);
    const isAdmin = checkIsAdmin(newEmail);
    if (isAdmin) {
      setRole('admin');
      if (newEmail.trim().toLowerCase() === SUPER_ADMIN_PROFILE.email.toLowerCase()) {
        setName(SUPER_ADMIN_PROFILE.name);
        setDepartment(SUPER_ADMIN_PROFILE.department);
        setPosition(SUPER_ADMIN_PROFILE.position);
      }
    }
  };

  // Direct MSU Account Form Submit
  const handleDirectLogin = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      const profile = signInWithMsuAccount({
        email,
        name,
        department,
        position,
        role
      });
      onLogin(profile);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
      setError(msg);
    }
  };

  // Google SSO with MSU Domain
  const handleGoogleSsoLogin = async () => {
    try {
      setError('');
      setIsGoogleLoading(true);
      const profile = await signInWithGoogleMsu();
      onLogin(profile);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'ไม่สามารถเข้าสู่ระบบด้วย Google ได้';
      setError(msg);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Quick select profile
  const handleSelectPreset = (preset: UserProfile) => {
    // Clone to avoid mutating
    const chosen: UserProfile = { ...preset };
    if (checkIsAdmin(chosen.email)) {
      chosen.role = 'admin';
    }
    onLogin(chosen);
  };

  const isCurrentEmailAdmin = checkIsAdmin(email);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-linear-to-r from-amber-600 via-amber-700 to-amber-800 text-white p-5 sm:p-6 relative">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="ปิดหน้าต่าง"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-white/15 backdrop-blur-xs rounded-xl flex items-center justify-center border border-white/20 shrink-0 shadow-xs">
              <School className="w-7 h-7 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold tracking-tight">
                  เข้าสู่ระบบ MSU Account
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-white/20 text-amber-100 border border-white/20">
                  @msu.ac.th
                </span>
              </div>
              <p className="text-xs text-amber-100/90 mt-0.5">
                ระบบเบิกจ่ายพัสดุ • วิทยาลัยการเมืองการปกครอง มหาวิทยาลัยมหาสารคาม
              </p>
            </div>
          </div>

          {/* Current user mini status if logged in */}
          {currentUser && (
            <div className="mt-4 p-2.5 bg-black/20 backdrop-blur-xs rounded-xl border border-white/15 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full bg-white/30 border border-white/40 shrink-0"
                />
                <div className="truncate">
                  <span className="font-bold text-white block truncate">{currentUser.name}</span>
                  <span className="text-[10px] text-amber-200 block truncate">
                    {currentUser.role === 'admin' ? '🛡️ แอดมิน (เจ้าหน้าที่พัสดุ)' : '👤 ผู้ขอเบิก'} • {currentUser.email}
                  </span>
                </div>
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="px-2.5 py-1 bg-red-500/80 hover:bg-red-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  title="ออกจากระบบ"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>ออกจากระบบ</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 text-xs px-4 pt-2 gap-2">
          <button
            onClick={() => { setActiveTab('quick'); setError(''); }}
            className={`pb-2.5 px-3 font-semibold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'quick'
                ? 'border-amber-600 text-amber-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>เข้าใช้ด่วน / บัญชีแนะนำ</span>
          </button>
          <button
            onClick={() => { setActiveTab('direct'); setError(''); }}
            className={`pb-2.5 px-3 font-semibold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'direct'
                ? 'border-amber-600 text-amber-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>ระบุบัญชี มมส.</span>
          </button>
          <button
            onClick={() => { setActiveTab('google'); setError(''); }}
            className={`pb-2.5 px-3 font-semibold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'google'
                ? 'border-amber-600 text-amber-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Google MSU SSO</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          {/* TAB 1: QUICK SELECTION & RECENT PROFILES */}
          {activeTab === 'quick' && (
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-amber-50/80 border border-amber-200/90 rounded-xl text-amber-900 flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>ระบบกำหนดสิทธิ์อัตโนมัติ:</strong> บัญชี{' '}
                  <span className="font-mono font-bold text-amber-950 bg-amber-200/60 px-1 py-0.5 rounded">
                    kanjanapat.m@msu.ac.th
                  </span>{' '}
                  ได้รับสิทธิ์เป็น <strong>แอดมินเจ้าหน้าที่พัสดุ (Super Admin)</strong> เสมอ
                </div>
              </div>

              {/* Primary Admin Card: kanjanapat.m@msu.ac.th */}
              <div className="space-y-1.5">
                <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-600" />
                  บัญชีผู้ดูแลระบบ (แอดมินเจ้าหน้าที่พัสดุ)
                </span>
                <div
                  onClick={() => handleSelectPreset(SUPER_ADMIN_PROFILE)}
                  className="p-3.5 rounded-xl border-2 border-amber-400 bg-linear-to-r from-amber-50/80 to-white hover:border-amber-600 hover:shadow-md cursor-pointer transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={SUPER_ADMIN_PROFILE.avatar}
                      alt={SUPER_ADMIN_PROFILE.name}
                      className="w-10 h-10 rounded-full border-2 border-amber-300 ring-2 ring-amber-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm group-hover:text-amber-900">
                          {SUPER_ADMIN_PROFILE.name}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-600 text-white">
                          🛡️ แอดมิน (Admin)
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] truncate">
                        {SUPER_ADMIN_PROFILE.position} • {SUPER_ADMIN_PROFILE.department}
                      </p>
                      <p className="text-amber-800 font-mono text-[10px] font-semibold mt-0.5">
                        {SUPER_ADMIN_PROFILE.email}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="px-3 py-1.5 bg-amber-600 group-hover:bg-amber-700 text-white rounded-lg font-bold text-xs shadow-xs transition-colors shrink-0"
                  >
                    เข้าใช้งาน
                  </button>
                </div>
              </div>

              {/* Demo Requisition User Card */}
              <div className="space-y-1.5 pt-1">
                <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  บัญชีอาจารย์/บุคลากร (สำหรับคีย์ขอเบิกพัสดุ)
                </span>
                <div
                  onClick={() => handleSelectPreset(DEMO_USER_PROFILE)}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/40 hover:shadow-sm cursor-pointer transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={DEMO_USER_PROFILE.avatar}
                      alt={DEMO_USER_PROFILE.name}
                      className="w-10 h-10 rounded-full border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm group-hover:text-blue-900">
                          {DEMO_USER_PROFILE.name}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-800">
                          👤 ผู้ขอเบิก
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px] truncate">
                        {DEMO_USER_PROFILE.position} • {DEMO_USER_PROFILE.department}
                      </p>
                      <p className="text-slate-500 font-mono text-[10px]">
                        {DEMO_USER_PROFILE.email}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="px-3 py-1.5 bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-700 rounded-lg font-bold text-xs transition-colors shrink-0"
                  >
                    เข้าใช้งาน
                  </button>
                </div>
              </div>

              {/* Recent Accounts list if more than default */}
              {recentAccounts.filter(
                a =>
                  a.email !== SUPER_ADMIN_PROFILE.email &&
                  a.email !== DEMO_USER_PROFILE.email
              ).length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <span className="font-bold text-slate-500 text-[11px]">
                    บัญชีที่เคยเข้าใช้งานล่าสุดบนอุปกรณ์นี้:
                  </span>
                  <div className="space-y-1.5">
                    {recentAccounts
                      .filter(
                        a =>
                          a.email !== SUPER_ADMIN_PROFILE.email &&
                          a.email !== DEMO_USER_PROFILE.email
                      )
                      .map(acc => (
                        <div
                          key={acc.email}
                          onClick={() => handleSelectPreset(acc)}
                          className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white hover:border-amber-300 cursor-pointer transition-all flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={acc.avatar}
                              alt={acc.name}
                              className="w-6 h-6 rounded-full bg-slate-200 shrink-0"
                            />
                            <div className="truncate">
                              <span className="font-bold text-slate-800 mr-2">{acc.name}</span>
                              <span className="text-slate-400 font-mono text-[10px]">{acc.email}</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold text-amber-700">เลือก →</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DIRECT MSU ACCOUNT CREDENTIALS */}
          {activeTab === 'direct' && (
            <form onSubmit={handleDirectLogin} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  อีเมลมหาวิทยาลัย (@msu.ac.th) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="input-msu-email-direct"
                    type="email"
                    value={email}
                    onChange={e => handleEmailChange(e.target.value)}
                    placeholder="เช่น kanjanapat.m@msu.ac.th"
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                    required
                  />
                  {email && isMsuEmail(email) && (
                    <div className="absolute right-3 top-2.5 text-emerald-600 flex items-center gap-1 text-[11px] font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>โดเมน มมส.</span>
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  ระบบอนุญาตเฉพาะอีเมลบุคลากรและนิสิตที่ลงท้ายด้วย @msu.ac.th
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ชื่อ - นามสกุล <span className="text-red-500">*</span>
                </label>
                <input
                  id="input-msu-name-direct"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="เช่น กาญจนภาษณ์ มาตบุรม"
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ตำแหน่งงาน</label>
                  <input
                    type="text"
                    value={position}
                    onChange={e => setPosition(e.target.value)}
                    placeholder="เช่น นักวิชาการศึกษา / อาจารย์"
                    className="w-full p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    สิทธิ์การใช้งานในระบบ
                  </label>
                  {isCurrentEmailAdmin ? (
                    <div className="p-2 rounded-lg bg-amber-100 border border-amber-300 text-amber-900 font-bold flex items-center gap-1.5 text-xs">
                      <Shield className="w-4 h-4 text-amber-700" />
                      <span>แอดมิน (Super Admin) ล็อกสิทธิ์อัตโนมัติ</span>
                    </div>
                  ) : (
                    <select
                      value={role}
                      onChange={e => setRole(e.target.value as 'admin' | 'user')}
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="user">ผู้ขอเบิก (อาจารย์/บุคลากร)</option>
                      <option value="admin">แอดมิน (เจ้าหน้าที่พัสดุ)</option>
                    </select>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  หน่วยงาน / ภาควิชา
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  placeholder="เลือกหรือพิมพ์หน่วยงาน"
                  list="copag-dept-list"
                  className="w-full p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <datalist id="copag-dept-list">
                  {COPAG_DEPARTMENTS.map(d => (
                    <option key={d} value={d} />
                  ))}
                </datalist>
              </div>

              <button
                id="btn-confirm-direct-login"
                type="submit"
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer mt-3"
              >
                <LogIn className="w-4 h-4" />
                <span>ยืนยันเข้าสู่ระบบด้วย MSU Account</span>
              </button>
            </form>
          )}

          {/* TAB 3: GOOGLE WORKSPACE SSO */}
          {activeTab === 'google' && (
            <div className="space-y-4 text-xs text-center py-3">
              <div className="max-w-xs mx-auto space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-700">
                  <School className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Google Workspace Single Sign-On
                </h4>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  เข้าสู่ระบบด้วยบัญชี Google ของมหาวิทยาลัยมหาสารคาม (@msu.ac.th)
                  ระบบจะตรวจสอบโดเมนและกำหนดสิทธิ์ผู้ใช้งานให้อัตโนมัติ
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-left text-[11px] text-slate-600 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-800 font-bold">
                  <Shield className="w-3.5 h-3.5 text-amber-600" />
                  <span>การจัดสรรสิทธิ์ผู้ใช้:</span>
                </div>
                <p>• <strong>kanjanapat.m@msu.ac.th</strong>: ได้รับสิทธิ์ แอดมิน (เจ้าหน้าที่พัสดุ)</p>
                <p>• <strong>อีเมล @msu.ac.th อื่นๆ</strong>: ได้รับสิทธิ์ ผู้ขอเบิก (สามารถขอเบิกและติดตามสถานะ)</p>
              </div>

              <button
                id="btn-google-msu-sso"
                type="button"
                onClick={handleGoogleSsoLogin}
                disabled={isGoogleLoading}
                className="w-full py-3 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 hover:border-amber-500 rounded-xl font-bold shadow-xs flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50"
              >
                {isGoogleLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>
                  {isGoogleLoading
                    ? 'กำลังเชื่อมต่อ Google MSU...'
                    : 'เข้าสู่ระบบด้วย Google MSU (@msu.ac.th)'}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500">
          วิทยาลัยการเมืองการปกครอง มหาวิทยาลัยมหาสารคาม
        </div>
      </div>
    </div>
  );
};
