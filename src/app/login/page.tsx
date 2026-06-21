'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, User as UserIcon, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Register states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'admin' | 'dosen' | 'mahasiswa'>('mahasiswa');
  const [regMessage, setRegMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [regLoading, setRegLoading] = useState(false);

  useEffect(() => {
    setLoginError('');
    setRegMessage(null);
  }, [activeTab]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    if (!loginEmail.trim() || !loginPassword) {
      setLoginError('Email dan password harus diisi.');
      return;
    }

    setLoginLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Kombinasi email atau password salah.');
      }

      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', data.role);
      localStorage.setItem('userEmail', data.email);
      localStorage.setItem('userName', data.name);
      
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setLoginError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegMessage(null);

    if (!regName.trim() || !regEmail.trim() || !regPassword || !regRole) {
      setRegMessage({ text: 'Semua form wajib diisi.', type: 'error' });
      return;
    }

    setRegLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName.trim(),
          email: regEmail.trim(),
          password: regPassword,
          role: regRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Gagal membuat akun.');
      }

      setRegMessage({ text: 'Registrasi sukses! Akun Anda siap digunakan.', type: 'success' });
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setRegRole('mahasiswa');

      setTimeout(() => {
        setActiveTab('login');
        setLoginEmail(regEmail.trim());
      }, 1500);

    } catch (err: any) {
      setRegMessage({ text: err.message || 'Gagal registrasi.', type: 'error' });
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] w-full bg-[#f9fafb] font-sans text-slate-900">
      {/* Left Panel: Branding & Information */}
      <div className="relative hidden w-[45%] flex-col justify-between overflow-hidden bg-slate-50 p-14 border-r border-slate-200/60 lg:flex before:absolute before:inset-0 before:bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] before:bg-[size:24px_24px] before:pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-bold text-white text-base shadow-xs">
            S
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            SISJAD
          </span>
        </div>

        <div className="my-auto py-10 max-w-sm">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-slate-400">
            PRODI SISTEM INFORMASI
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 mt-2 mb-6 leading-tight">
            Sistem Penjadwalan Kuliah Prodi
          </h1>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            Platform otomasi penjadwalan kuliah berbasis constraint.
            Meminimalisir bentrok jadwal dosen, ruang kelas, dan waktu secara
            real-time.
          </p>
        </div>

        <div className="flex justify-between border-t border-slate-200/40 pt-6 font-mono text-[9px] text-slate-400 font-bold uppercase tracking-wider">
          <span>SISTEM INFORMASI</span>
          <span>SISJAD v1.0.0</span>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="flex w-full items-center justify-center p-6 lg:w-[55%]">
        <div className="w-full max-w-[440px] rounded-2xl border border-slate-200/60 bg-white p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
          {/* Auth Tabs */}
          <div className="mb-8 flex rounded-xl bg-slate-100/80 p-1 border border-slate-200/40">
            <button
              onClick={() => setActiveTab('login')}
              className={`w-1/2 rounded-lg py-2.5 text-xs font-semibold tracking-tight transition-all duration-300 active:scale-[0.98] cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-blue-600'
              }`}
            >
              MASUK
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`w-1/2 rounded-lg py-2.5 text-xs font-semibold tracking-tight transition-all duration-300 active:scale-[0.98] cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-blue-600'
              }`}
            >
              DAFTAR
            </button>
          </div>

          {/* Login Section */}
          {activeTab === 'login' && (
            <div className="animate-in fade-in duration-300">
              <div className="mb-6 border-b border-slate-100 pb-4">
                <h2 className="text-2xl font-bold text-slate-900">
                  Selamat Datang
                </h2>
                <p className="text-xs font-mono font-medium text-slate-400 mt-1">
                  Silakan masuk ke akun Anda untuk melanjutkan.
                </p>
              </div>

              {loginError && (
                <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-rose-250 bg-rose-50/40 p-3.5 text-xs text-rose-700">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 text-rose-500 mt-0.5" strokeWidth={1.5} />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs font-semibold">
                <div className="flex flex-col gap-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Alamat Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute top-1/2 left-3 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" strokeWidth={1.5} />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="nama@univ.ac.id"
                      required
                      className="w-full rounded-xl border border-slate-200 py-2.5 pr-4 pl-10 bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all font-sans font-medium text-slate-800 placeholder-slate-400"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute top-1/2 left-3 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" strokeWidth={1.5} />
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full rounded-xl border border-slate-200 py-2.5 pr-4 pl-10 bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all font-sans font-medium text-slate-800 placeholder-slate-400"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-bold">
                  <label className="flex items-center gap-2 text-slate-500 select-none cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-slate-350 text-blue-600 focus:ring-blue-500/20 focus:ring-opacity-50"
                    />
                    <span>Ingat saya</span>
                  </label>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Silakan hubungi Admin Prodi untuk reset password.');
                    }}
                    className="text-slate-600 hover:text-blue-600 hover:underline"
                  >
                    Lupa password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 py-2.5 font-semibold text-white shadow-[0_4px_12px_rgba(37,99,235,0.15)] active:scale-[0.98] transition-all duration-300 cursor-pointer shadow-xs"
                >
                  {loginLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                      <span>MEMPROSES...</span>
                    </>
                  ) : (
                    <span>MASUK KE SISTEM</span>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Register Section */}
          {activeTab === 'register' && (
            <div className="animate-in fade-in duration-300">
              <div className="mb-6 border-b border-slate-100 pb-4">
                <h2 className="text-2xl font-bold text-slate-900">
                  Daftar Akun Baru
                </h2>
                <p className="text-xs font-mono font-medium text-slate-400 mt-1">
                  Buat akun SISJAD baru Anda untuk memulai.
                </p>
              </div>

              {regMessage && (
                <div
                  className={`mb-4 flex items-start gap-2.5 rounded-xl p-3.5 text-xs ${
                    regMessage.type === 'success'
                      ? 'bg-emerald-50/50 text-emerald-700 border border-emerald-250'
                      : 'bg-rose-50/50 text-rose-700 border border-rose-250'
                  }`}
                >
                  {regMessage.type === 'success' ? (
                    <CheckCircle className="h-4.5 w-4.5 shrink-0 text-emerald-550 mt-0.5" strokeWidth={1.5} />
                  ) : (
                    <AlertCircle className="h-4.5 w-4.5 shrink-0 text-rose-500 mt-0.5" strokeWidth={1.5} />
                  )}
                  <span>{regMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs font-semibold">
                <div className="flex flex-col gap-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute top-1/2 left-3 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" strokeWidth={1.5} />
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Nama Lengkap / Dosen"
                      required
                      className="w-full rounded-xl border border-slate-200 py-2.5 pr-4 pl-10 bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all font-sans font-medium text-slate-800 placeholder-slate-400"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Alamat Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute top-1/2 left-3 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" strokeWidth={1.5} />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="nama@univ.ac.id"
                      required
                      className="w-full rounded-xl border border-slate-200 py-2.5 pr-4 pl-10 bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all font-sans font-medium text-slate-800 placeholder-slate-400"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute top-1/2 left-3 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" strokeWidth={1.5} />
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full rounded-xl border border-slate-200 py-2.5 pr-4 pl-10 bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all font-sans font-medium text-slate-800 placeholder-slate-400"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Pilih Peran (Role)
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as any)}
                    required
                    className="w-full rounded-xl border border-slate-200 py-2.5 px-3 bg-white outline-none focus:border-blue-500 transition-all font-sans font-medium text-slate-800"
                  >
                    <option value="mahasiswa">Mahasiswa</option>
                    <option value="dosen">Dosen</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={regLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 py-2.5 font-semibold text-white shadow-[0_4px_12px_rgba(37,99,235,0.15)] active:scale-[0.98] transition-all duration-300 cursor-pointer shadow-xs"
                >
                  {regLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                      <span>MENDAFTAR...</span>
                    </>
                  ) : (
                    <span>DAFTAR AKUN BARU</span>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
