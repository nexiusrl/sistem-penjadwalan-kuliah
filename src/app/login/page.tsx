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
    <div className="flex min-h-screen w-full bg-white font-sans text-neutral-900 border-4 border-black">
      {/* Left Panel: Branding & Information */}
      <div className="relative hidden w-[45%] flex-col justify-between overflow-hidden bg-neutral-50 p-14 border-r-4 border-black lg:flex before:absolute before:inset-0 before:bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] before:bg-[size:24px_24px] before:pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-none border-2 border-black bg-black font-extrabold text-white text-base shadow-[2px_2px_0px_0px_rgba(200,200,200,1)]">
            S
          </div>
          <span className="text-xl font-display font-extrabold italic tracking-tight text-neutral-900">
            SISJAD
          </span>
        </div>

        <div className="my-auto py-10 max-w-md">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-neutral-500">
            PRODI SISTEM INFORMASI
          </span>
          <h1 className="text-4xl font-display font-extrabold italic leading-tight text-neutral-950 mt-2 mb-6">
            Sistem Penjadwalan Kuliah Prodi
          </h1>
          <p className="text-sm font-mono font-medium text-neutral-600 leading-relaxed">
            Platform otomasi penjadwalan kuliah berbasis constraint.
            Meminimalisir bentrok jadwal dosen, ruang kelas, dan waktu secara
            real-time.
          </p>
        </div>

        <div className="flex justify-between border-t-2 border-black pt-6 font-mono text-[9px] text-neutral-500 font-bold uppercase tracking-wider">
          <span>SISTEM INFORMASI</span>
          <span>SISJAD v1.0.0</span>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="flex w-full items-center justify-center p-6 lg:w-[55%]">
        <div className="w-full max-w-[440px] rounded-none border-4 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          {/* Auth Tabs */}
          <div className="mb-8 flex rounded-none border-2 border-black bg-neutral-50 p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <button
              onClick={() => setActiveTab('login')}
              className={`w-1/2 rounded-none py-2 text-xs font-mono font-bold transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-black text-white'
                  : 'text-neutral-500 hover:text-black'
              }`}
            >
              MASUK
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`w-1/2 rounded-none py-2 text-xs font-mono font-bold transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-black text-white'
                  : 'text-neutral-500 hover:text-black'
              }`}
            >
              DAFTAR
            </button>
          </div>

          {/* Login Section */}
          {activeTab === 'login' && (
            <div className="animate-in fade-in duration-300">
              <div className="mb-6 border-b-2 border-black pb-4">
                <h2 className="text-2xl font-display font-extrabold italic text-neutral-950">
                  Selamat Datang
                </h2>
                <p className="text-xs font-mono font-medium text-neutral-500 mt-1">
                  Silakan masuk ke akun Anda untuk melanjutkan.
                </p>
              </div>

              {loginError && (
                <div className="mb-4 flex items-start gap-2 rounded-none border-2 border-black bg-rose-50 p-3 text-xs font-mono text-rose-900">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 text-black mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4 font-mono text-xs font-semibold">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Alamat Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute top-1/2 left-3 h-4.5 w-4.5 -translate-y-1/2 text-black stroke-2" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="nama@univ.ac.id"
                      required
                      className="w-full rounded-none border-2 border-black py-2.5 pr-4 pl-10 bg-white outline-none focus:bg-neutral-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute top-1/2 left-3 h-4.5 w-4.5 -translate-y-1/2 text-black stroke-2" />
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full rounded-none border-2 border-black py-2.5 pr-4 pl-10 bg-white outline-none focus:bg-neutral-50"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-bold">
                  <label className="flex items-center gap-2 text-neutral-600 select-none cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded-none border-2 border-black text-black focus:ring-0 focus:ring-offset-0"
                    />
                    <span>Ingat saya</span>
                  </label>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Silakan hubungi Admin Prodi untuk reset password.');
                    }}
                    className="text-black underline decoration-2 hover:text-neutral-700"
                  >
                    Lupa password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-none border-2 border-black bg-black py-2.5 font-bold text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
                >
                  {loginLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
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
              <div className="mb-6 border-b-2 border-black pb-4">
                <h2 className="text-2xl font-display font-extrabold italic text-neutral-950">
                  Daftar Akun Baru
                </h2>
                <p className="text-xs font-mono font-medium text-neutral-500 mt-1">
                  Buat akun SISJAD baru Anda untuk memulai.
                </p>
              </div>

              {regMessage && (
                <div
                  className={`mb-4 flex items-start gap-2 rounded-none border-2 border-black p-3 text-xs font-mono ${
                    regMessage.type === 'success'
                      ? 'bg-emerald-50 text-emerald-950 border-emerald-500'
                      : 'bg-rose-50 text-rose-900 border-rose-500'
                  }`}
                >
                  {regMessage.type === 'success' ? (
                    <CheckCircle className="h-4.5 w-4.5 shrink-0 text-black mt-0.5" />
                  ) : (
                    <AlertCircle className="h-4.5 w-4.5 shrink-0 text-black mt-0.5" />
                  )}
                  <span>{regMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-4 font-mono text-xs font-semibold">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute top-1/2 left-3 h-4.5 w-4.5 -translate-y-1/2 text-black stroke-2" />
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Nama Lengkap / Dosen"
                      required
                      className="w-full rounded-none border-2 border-black py-2.5 pr-4 pl-10 bg-white outline-none focus:bg-neutral-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Alamat Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute top-1/2 left-3 h-4.5 w-4.5 -translate-y-1/2 text-black stroke-2" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="nama@univ.ac.id"
                      required
                      className="w-full rounded-none border-2 border-black py-2.5 pr-4 pl-10 bg-white outline-none focus:bg-neutral-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute top-1/2 left-3 h-4.5 w-4.5 -translate-y-1/2 text-black stroke-2" />
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full rounded-none border-2 border-black py-2.5 pr-4 pl-10 bg-white outline-none focus:bg-neutral-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Pilih Peran (Role)
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as any)}
                    required
                    className="w-full rounded-none border-2 border-black py-2.5 px-3 bg-white outline-none"
                  >
                    <option value="mahasiswa">Mahasiswa</option>
                    <option value="dosen">Dosen</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={regLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-none border-2 border-black bg-black py-2.5 font-bold text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
                >
                  {regLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
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
