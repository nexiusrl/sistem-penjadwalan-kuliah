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

  // Clear errors when switching tabs
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

      // Save auth data to localStorage for client-side legacy sync/convenience
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', data.role);
      localStorage.setItem('userEmail', data.email);
      localStorage.setItem('userName', data.name);
      
      // Redirect to dashboard
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
      
      // Reset register forms
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setRegRole('mahasiswa');

      // Auto redirect to login and fill email
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
    <div className="flex min-h-screen w-full bg-slate-50 font-sans text-slate-800 dark:bg-slate-950 dark:text-slate-200">
      {/* Left Panel: Branding & Information */}
      <div className="relative hidden w-[45%] flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-700 to-violet-900 p-14 text-white lg:flex before:absolute before:inset-0 before:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] before:bg-[size:24px_24px] before:pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500 font-extrabold text-white shadow-lg shadow-indigo-500/40">
            S
          </div>
          <span className="text-xl font-bold tracking-wide">SISJAD</span>
        </div>

        <div className="my-auto py-10">
          <h1 className="text-4xl font-extrabold leading-tight text-white mb-6">
            Sistem Penjadwalan Kuliah Prodi
          </h1>
          <p className="text-lg text-indigo-100/80 leading-relaxed max-w-md">
            Platform otomasi penjadwalan kuliah berbasis constraint.
            Meminimalisir bentrok jadwal dosen, ruang kelas, dan waktu secara
            real-time.
          </p>
        </div>

        <div className="flex justify-between border-t border-indigo-500/20 pt-6 text-xs text-indigo-200/50">
          <span>Program Studi Sistem Informasi</span>
          <span>SISJAD v1.0.0</span>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="flex w-full items-center justify-center p-6 lg:w-[55%]">
        <div className="w-full max-w-[440px] rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
          {/* Auth Tabs */}
          <div className="mb-6 flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
            <button
              onClick={() => setActiveTab('login')}
              className={`w-1/2 rounded-md py-2 text-sm font-bold transition-all ${
                activeTab === 'login'
                  ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Masuk
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`w-1/2 rounded-md py-2 text-sm font-bold transition-all ${
                activeTab === 'register'
                  ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Daftar
            </button>
          </div>

          {/* Login Section */}
          {activeTab === 'login' && (
            <div className="animate-in fade-in duration-300">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Selamat Datang
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Silakan masuk ke akun Anda untuk melanjutkan.
                </p>
              </div>

              {loginError && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-950/30 dark:text-rose-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Alamat Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute top-1/2 left-3 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="nama@univ.ac.id"
                      required
                      className="w-full rounded-lg border border-slate-200 py-2.5 pr-4 pl-10 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute top-1/2 left-3 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full rounded-lg border border-slate-200 py-2.5 pr-4 pl-10 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 select-none cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700"
                    />
                    <span>Ingat saya</span>
                  </label>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Silakan hubungi Admin Prodi untuk reset password.');
                    }}
                    className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                  >
                    Lupa password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-75 dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:shadow-none"
                >
                  {loginLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <span>Masuk Ke Sistem</span>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Register Section */}
          {activeTab === 'register' && (
            <div className="animate-in fade-in duration-300">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Daftar Akun Baru
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Buat akun SISJAD baru Anda untuk memulai.
                </p>
              </div>

              {regMessage && (
                <div
                  className={`mb-4 flex items-center gap-2 rounded-lg p-3 text-sm ${
                    regMessage.type === 'success'
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
                      : 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400'
                  }`}
                >
                  {regMessage.type === 'success' ? (
                    <CheckCircle className="h-4 w-4 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0" />
                  )}
                  <span>{regMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute top-1/2 left-3 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Nama Lengkap / Dosen"
                      required
                      className="w-full rounded-lg border border-slate-200 py-2.5 pr-4 pl-10 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Alamat Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute top-1/2 left-3 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="nama@univ.ac.id"
                      required
                      className="w-full rounded-lg border border-slate-200 py-2.5 pr-4 pl-10 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute top-1/2 left-3 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full rounded-lg border border-slate-200 py-2.5 pr-4 pl-10 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Pilih Peran (Role)
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as any)}
                    required
                    className="w-full rounded-lg border border-slate-200 py-2.5 px-3 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950"
                  >
                    <option value="mahasiswa">Mahasiswa</option>
                    <option value="dosen">Dosen</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={regLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-75 dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:shadow-none"
                >
                  {regLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Mendaftar...</span>
                    </>
                  ) : (
                    <span>Daftar Akun Baru</span>
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
