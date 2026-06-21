'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/hooks/useStore';
import { Schedule } from '@/lib/db';
import CalendarGrid from '@/components/CalendarGrid';
import ConflictPanel from '@/components/ConflictPanel';
import RequestPanel from '@/components/RequestPanel';
import MasterDataPanel from '@/components/MasterDataPanel';
import {
  Calendar,
  FileText,
  LogOut,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Play,
  X,
  Loader2,
  Trash2,
  Settings,
} from 'lucide-react';

// ─── Skeleton Components ─────────────────────────────────────────────────────
function SkeletonPulse({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-slate-100 ${className}`} />
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-[#f9fafb] font-sans">
      {/* Skeleton Header */}
      <header className="sticky top-0 z-40 flex h-18 w-full items-center justify-between border-b border-slate-200/60 bg-white/80 backdrop-blur-md px-6 shadow-xs">
        <div className="flex items-center gap-3">
          <SkeletonPulse className="h-9 w-9 rounded-xl" />
          <SkeletonPulse className="h-5 w-20" />
        </div>
        <div className="hidden md:flex items-center gap-4">
          <SkeletonPulse className="h-7 w-20 rounded-lg" />
          <SkeletonPulse className="h-7 w-24 rounded-lg" />
          <SkeletonPulse className="h-7 w-28 rounded-lg" />
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <SkeletonPulse className="h-3.5 w-24 mb-1.5" />
            <SkeletonPulse className="h-2.5 w-16" />
          </div>
          <SkeletonPulse className="h-9 w-9 rounded-xl" />
        </div>
      </header>

      <div className="flex flex-1 w-full">
        {/* Skeleton Sidebar */}
        <aside className="hidden md:flex w-64 flex-col border-r border-slate-200/60 bg-white py-6 px-4">
          <div className="space-y-3 flex-1">
            <SkeletonPulse className="h-11 w-full rounded-xl" />
            <SkeletonPulse className="h-11 w-full rounded-xl" />
            <SkeletonPulse className="h-11 w-full rounded-xl" />
          </div>
        </aside>

        {/* Skeleton Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
            {/* Calendar Skeleton */}
            <div className="xl:col-span-8">
              <div className="bg-white border border-slate-200/60 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-5">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <SkeletonPulse className="h-3 w-28 mb-2" />
                    <SkeletonPulse className="h-5 w-40" />
                  </div>
                  <SkeletonPulse className="h-9 w-36 rounded-xl" />
                </div>
                <div className="grid grid-cols-5 gap-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="space-y-3">
                      <SkeletonPulse className="h-8 w-full rounded-lg" />
                      <SkeletonPulse className="h-24 w-full rounded-xl" />
                      <SkeletonPulse className="h-20 w-full rounded-xl" />
                      <SkeletonPulse className="h-28 w-full rounded-xl" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Conflict Panel Skeleton */}
            <div className="xl:col-span-4">
              <div className="bg-white border border-slate-200/60 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
                <div className="bg-slate-50/50 border-b border-slate-100 px-5 py-4">
                  <SkeletonPulse className="h-2.5 w-32 mb-2" />
                  <SkeletonPulse className="h-4 w-28" />
                </div>
                <div className="p-4 space-y-3.5">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="rounded-xl border border-slate-100 p-4">
                      <div className="flex items-start gap-2.5">
                        <SkeletonPulse className="h-4.5 w-4.5 rounded-full shrink-0 mt-0.5" />
                        <div className="flex-1 space-y-2">
                          <SkeletonPulse className="h-2.5 w-24" />
                          <SkeletonPulse className="h-3.5 w-36" />
                          <SkeletonPulse className="h-8 w-full" />
                          <SkeletonPulse className="h-7 w-32 rounded-lg" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


// ─── Main Dashboard Page ─────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  
  // Zustand global state
  const isMounted = useStore((s) => s.isMounted);
  const userRole = useStore((s) => s.userRole);
  const userEmail = useStore((s) => s.userEmail);
  const userName = useStore((s) => s.userName);
  const dosen = useStore((s) => s.dosen);
  const ruangan = useStore((s) => s.ruangan);
  const matakuliah = useStore((s) => s.matakuliah);
  const schedules = useStore((s) => s.schedules);
  const requests = useStore((s) => s.requests);
  const dbLoading = useStore((s) => s.dbLoading);
  const activeTab = useStore((s) => s.activeTab);
  const isSolving = useStore((s) => s.isSolving);
  const solveProgress = useStore((s) => s.solveProgress);
  const notice = useStore((s) => s.notice);

  const setMounted = useStore((s) => s.setMounted);
  const setUserSession = useStore((s) => s.setUserSession);
  const setActiveTab = useStore((s) => s.setActiveTab);
  const showNotice = useStore((s) => s.showNotice);
  const fetchDBState = useStore((s) => s.fetchDBState);
  const triggerGASolver = useStore((s) => s.triggerGASolver);
  const deleteSchedule = useStore((s) => s.deleteSchedule);
  const submitSchedule = useStore((s) => s.submitSchedule);
  const getStats = useStore((s) => s.getStats);
  const getEvaluatedSchedules = useStore((s) => s.getEvaluatedSchedules);

  // Schedule Form Modal States (local UI state, not global)
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [editScheduleId, setEditScheduleId] = useState<number | null>(null);
  const [schedSubject, setSchedSubject] = useState('');
  const [schedLecturer, setSchedLecturer] = useState('');
  const [schedRoom, setSchedRoom] = useState('');
  const [schedDay, setSchedDay] = useState('Senin');
  const [schedSlot, setSchedSlot] = useState('08:00 - 10:30');
  const [schedLoading, setSchedLoading] = useState(false);

  // Load auth state and fetch database on mount
  useEffect(() => {
    setMounted(true);
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    
    const role = (localStorage.getItem('userRole') as 'admin' | 'dosen' | 'mahasiswa') || 'mahasiswa';
    const email = localStorage.getItem('userEmail') || '';
    const name = localStorage.getItem('userName') || 'User';
    setUserSession(role, email, name);
    
    fetchDBState();
  }, [router, setMounted, setUserSession, fetchDBState]);

  // Synchronize dynamic tab selection from query params (e.g. ?tab=master)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const tab = searchParams.get('tab');
      if (tab === 'master' && userRole === 'admin') {
        setActiveTab('master');
      } else if (tab === 'requests' && userRole !== 'mahasiswa') {
        setActiveTab('requests');
      }
    }
  }, [userRole, setActiveTab]);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    localStorage.clear();
    router.push('/login');
    router.refresh();
  };

  // Open Schedule Add/Edit Form
  const openScheduleForm = (sched: Schedule | null = null) => {
    if (userRole !== 'admin') return;
    
    if (matakuliah.length === 0 || dosen.length === 0 || ruangan.length === 0) {
      alert('Harap lengkapi Data Master (Dosen, Ruangan, Mata Kuliah) terlebih dahulu sebelum membuat Jadwal.');
      return;
    }

    if (sched) {
      setEditScheduleId(sched.id);
      setSchedSubject(sched.subject);
      setSchedLecturer(sched.lecturer);
      setSchedRoom(sched.room);
      setSchedDay(sched.day);
      setSchedSlot(sched.timeSlot);
    } else {
      setEditScheduleId(null);
      const firstMK = matakuliah[0];
      setSchedSubject(firstMK.name);
      setSchedLecturer(dosen[0]?.name || '');
      setSchedRoom(ruangan[0]?.name || '');
      setSchedDay(firstMK.day || 'Senin');
      setSchedSlot(firstMK.timeSlot || '08:00 - 10:30');
    }
    
    setIsScheduleOpen(true);
  };

  // Update day and timeslot automatically based on selected subject in schedule form
  const handleSubjectChange = (subjectName: string) => {
    setSchedSubject(subjectName);
    const selected = matakuliah.find((m) => m.name === subjectName);
    if (selected) {
      setSchedDay(selected.day || 'Senin');
      setSchedSlot(selected.timeSlot || '08:00 - 10:30');
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole !== 'admin') return;

    setSchedLoading(true);
    const code = matakuliah.find((m) => m.name === schedSubject)?.code || '';

    const payload = {
      subject: schedSubject,
      code,
      lecturer: schedLecturer,
      room: schedRoom,
      day: schedDay,
      timeSlot: schedSlot,
    };

    const success = await submitSchedule(payload, editScheduleId);
    if (success) {
      setIsScheduleOpen(false);
    }
    setSchedLoading(false);
  };

  const handleScheduleDelete = async () => {
    if (!editScheduleId || userRole !== 'admin') return;
    if (!confirm('Apakah Anda yakin ingin menghapus jadwal ini secara permanen?')) return;

    setSchedLoading(true);
    const success = await deleteSchedule(editScheduleId);
    if (success) {
      setIsScheduleOpen(false);
    }
    setSchedLoading(false);
  };

  // Show premium skeleton loader while data is loading
  if (!isMounted || dbLoading) {
    return <DashboardSkeleton />;
  }

  const stats = getStats();
  const evaluatedSchedules = getEvaluatedSchedules();
  const hasConflicts = stats.conflictCount > 0;

  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-[#f9fafb] font-sans text-slate-900">
      {/* Top Banner Navigation Header */}
      <header className="sticky top-0 z-40 flex h-18 w-full items-center justify-between border-b border-slate-200/60 bg-white/80 backdrop-blur-md px-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-extrabold text-white text-base shadow-sm transition-transform duration-300 hover:scale-105">
            S
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            SISJAD
          </span>
        </div>

        {/* Dynamic Navbar Statistics Counter */}
        <div className="hidden md:flex items-center gap-4 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200/60 px-3 py-1 bg-slate-50">
            <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
            <span>{stats.validCount} Valid</span>
          </div>
          {stats.conflictCount > 0 && (
            <div className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50/50 px-3 py-1 text-rose-600">
              <span className="h-1.5 w-1.5 bg-rose-500 rounded-full animate-pulse" />
              <span>{stats.conflictCount} Bentrok</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200/60 px-3 py-1 bg-slate-50">
            <span className="h-1.5 w-1.5 bg-amber-500 rounded-full" />
            <span>{stats.warningCount} Peringatan</span>
          </div>
        </div>

        {/* User Identity Details & Logout */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs font-semibold text-slate-805 leading-none">{userName}</div>
            <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 mt-1">
              {userRole === 'admin' ? 'Administrator' : userRole === 'dosen' ? 'Dosen' : 'Mahasiswa'}
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Keluar sistem"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98] transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* Main Panel Layout */}
      <div className="flex flex-1 w-full">
        {/* Sidebar Nav */}
        <aside className="hidden md:flex w-64 flex-col border-r border-slate-200/60 bg-white py-6 px-4">
          <div className="space-y-2.5 flex-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-xs font-semibold tracking-tight transition-all duration-300 active:scale-[0.98] cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-[0_4px_15px_rgba(37,99,235,0.18)]'
                  : 'bg-transparent text-slate-600 hover:bg-blue-50/50 hover:text-blue-600'
              }`}
            >
              <Calendar className="h-4 w-4" strokeWidth={1.5} />
              <span>DASHBOARD JADWAL</span>
            </button>

            {userRole !== 'mahasiswa' && (
              <button
                onClick={() => setActiveTab('requests')}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-xs font-semibold tracking-tight transition-all duration-300 active:scale-[0.98] cursor-pointer ${
                  activeTab === 'requests'
                    ? 'bg-blue-600 text-white shadow-[0_4px_15px_rgba(37,99,235,0.18)]'
                    : 'bg-transparent text-slate-600 hover:bg-blue-50/50 hover:text-blue-600'
                }`}
              >
                <FileText className="h-4 w-4" strokeWidth={1.5} />
                <span>PERGESERAN JADWAL</span>
              </button>
            )}

            {userRole === 'admin' && (
              <button
                onClick={() => setActiveTab('master')}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-xs font-semibold tracking-tight transition-all duration-300 active:scale-[0.98] cursor-pointer ${
                  activeTab === 'master'
                    ? 'bg-blue-600 text-white shadow-[0_4px_15px_rgba(37,99,235,0.18)]'
                    : 'bg-transparent text-slate-600 hover:bg-blue-50/50 hover:text-blue-600'
                }`}
              >
                <Settings className="h-4 w-4" strokeWidth={1.5} />
                <span>DATA MASTER</span>
              </button>
            )}
          </div>

          <div className="border-t border-slate-100 pt-6 px-2 font-mono text-[9px] text-slate-400 leading-relaxed font-semibold uppercase tracking-wider">
            &copy; 2026 PRODI SISTEM INFORMASI.
          </div>
        </aside>

        {/* Content Body Container */}
        <main className="flex-1 p-6 overflow-y-auto bg-transparent">
          {/* Mobile Tab Swapping */}
          <div className="flex md:hidden mb-6 rounded-xl bg-slate-100 p-1 text-[10px] font-bold border border-slate-200/40">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 rounded-lg py-2 text-center transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white text-slate-905 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              DASHBOARD
            </button>
            {userRole !== 'mahasiswa' && (
              <button
                onClick={() => setActiveTab('requests')}
                className={`flex-1 rounded-lg py-2 text-center transition-all ${
                  activeTab === 'requests'
                    ? 'bg-white text-slate-905 shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                REQUESTS
              </button>
            )}
            {userRole === 'admin' && (
              <button
                onClick={() => setActiveTab('master')}
                className={`flex-1 rounded-lg py-2 text-center transition-all ${
                  activeTab === 'master'
                    ? 'bg-white text-slate-905 shadow-xs'
                    : 'text-slate-500'
                }`}
              >
                MASTER
              </button>
            )}
          </div>

          {activeTab === 'dashboard' && (
            <div className="flex flex-col gap-8 animate-in fade-in duration-300">
              {/* Conflict Header Alert Banner */}
              {hasConflicts && userRole === 'admin' && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 rounded-2xl border border-rose-200/80 bg-rose-50/40 p-5 shadow-xs">
                  <div className="flex gap-3">
                    <AlertTriangle className="h-6 w-6 text-rose-500 shrink-0 mt-0.5" strokeWidth={1.5} />
                    <div className="text-xs text-slate-800">
                      <h4 className="font-bold text-slate-900 uppercase tracking-tight">
                        Deteksi Bentrok Jadwal Kuliah
                      </h4>
                      <p className="mt-1 text-slate-500 font-semibold leading-relaxed max-w-[620px]">
                        Terdapat {stats.conflictCount} bentrok hard-constraint. Selesaikan secara manual atau jalankan
                        Constraint Solver otomatis berbasis Algoritma Genetika untuk mengalokasi ulang ruangan secara bebas bentrok.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={triggerGASolver}
                    className="flex items-center gap-2 shrink-0 rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-3 text-xs font-semibold text-white shadow-[0_4px_15px_rgba(37,99,235,0.15)] active:scale-[0.98] transition-all duration-300 cursor-pointer"
                  >
                    <Play className="h-4 w-4 shrink-0 fill-current" strokeWidth={1.5} />
                    <span>Jalankan GA Solver</span>
                  </button>
                </div>
              )}

              {/* Split Calendar grid / evaluation panel */}
              <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
                <div
                  className={`${
                    userRole === 'admin' ? 'xl:col-span-8' : 'xl:col-span-12'
                  }`}
                >
                  <CalendarGrid
                    schedules={evaluatedSchedules}
                    dosen={dosen}
                    ruangan={ruangan}
                    matakuliah={matakuliah}
                    userRole={userRole}
                    userName={userName}
                    onRefresh={fetchDBState}
                    onAddScheduleClick={() => openScheduleForm(null)}
                    openEditModal={(s) => openScheduleForm(s)}
                  />
                </div>

                {userRole === 'admin' && (
                  <div className="xl:col-span-4 font-sans">
                    <ConflictPanel
                      schedules={evaluatedSchedules}
                      userRole={userRole}
                      onResolveClick={(s) => openScheduleForm(s)}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="animate-in fade-in duration-300">
              <RequestPanel
                schedules={schedules}
                requests={requests}
                userRole={userRole}
                userName={userName}
                onRefresh={fetchDBState}
              />
            </div>
          )}

          {activeTab === 'master' && userRole === 'admin' && (
            <div className="animate-in fade-in duration-300">
              <MasterDataPanel
                dosen={dosen}
                ruangan={ruangan}
                matakuliah={matakuliah}
                userRole={userRole}
                onRefresh={fetchDBState}
              />
            </div>
          )}
        </main>
      </div>

      {/* Floating Notice Toast */}
      {notice && (
        <div className="fixed bottom-8 right-8 z-50 flex items-center gap-2.5 rounded-xl bg-slate-900 border border-slate-800 px-5 py-3.5 text-xs font-semibold text-white shadow-[0_10px_30px_rgba(15,23,42,0.15)] animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0" strokeWidth={1.5} />
          <span>{notice}</span>
        </div>
      )}

      {/* Dynamic Solver (GA) Progress Overlay */}
      {isSolving && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/40 p-6 text-white backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-sm text-center border border-slate-200 bg-white p-8 text-slate-900 rounded-2xl shadow-[0_20px_50px_rgba(30,41,59,0.08)]">
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center justify-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin text-blue-600" strokeWidth={1.5} />
              <span className="text-blue-600 font-semibold tracking-tight">GA SOLVER AKTIF</span>
            </h3>
            <p className="text-[10px] text-slate-500 max-w-[280px] mx-auto leading-relaxed mb-6 font-semibold">
              Mengevaluasi alokasi constraint ruang & waktu dosen. Menghitung mutasi kecocokan penjadwalan optimal...
            </p>

            {/* Progress Bar Container */}
            <div className="w-full bg-slate-100 border border-slate-250 rounded-full h-3 overflow-hidden mb-3">
              <div
                className="bg-blue-600 h-full transition-all duration-300 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]"
                style={{ width: `${solveProgress}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-blue-600">{solveProgress}% SELESAI</span>
          </div>
        </div>
      )}

      {/* Schedule Form Modal */}
      {isScheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editScheduleId ? 'Edit Jadwal Kuliah' : 'Tambah Jadwal Kuliah'}
              </h3>
              <button
                onClick={() => setIsScheduleOpen(false)}
                className="rounded-lg border border-slate-250 p-1.5 hover:bg-slate-50 text-slate-500 active:scale-95 transition-all cursor-pointer"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleScheduleSubmit} className="mt-4 space-y-4 text-xs font-semibold">
              <div className="flex flex-col gap-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Mata Kuliah
                </label>
                <select
                  value={schedSubject}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 py-2.5 px-3 bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all font-sans font-medium text-slate-800"
                >
                  {matakuliah.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.code} - {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Dosen Pengampu
                </label>
                <select
                  value={schedLecturer}
                  onChange={(e) => setSchedLecturer(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 py-2.5 px-3 bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all font-sans font-medium text-slate-800"
                >
                  {dosen.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Hari Kuliah (Sesuai MK)
                  </label>
                  <input
                    type="text"
                    value={schedDay}
                    disabled
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 font-sans font-medium text-slate-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Waktu Jam (Sesuai MK)
                  </label>
                  <input
                    type="text"
                    value={schedSlot}
                    disabled
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 font-sans font-medium text-slate-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Ruangan Kelas
                </label>
                <select
                  value={schedRoom}
                  onChange={(e) => setSchedRoom(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 py-2.5 px-3 bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all font-sans font-medium text-slate-800"
                >
                  {ruangan.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name} ({r.type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Action buttons */}
              <div className="flex justify-between items-center border-t border-slate-100 pt-4 mt-2">
                <div>
                  {editScheduleId && (
                    <button
                      type="button"
                      onClick={handleScheduleDelete}
                      disabled={schedLoading}
                      className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white text-rose-600 hover:bg-rose-50 hover:border-rose-200 font-bold px-3.5 py-2 text-xs shadow-xs active:scale-[0.98] cursor-pointer transition-all"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                      <span>HAPUS</span>
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsScheduleOpen(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-650 hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    BATAL
                  </button>
                  <button
                    type="submit"
                    disabled={schedLoading}
                    className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-xs font-semibold text-white shadow-xs active:scale-[0.98] transition-all duration-300 cursor-pointer"
                  >
                    {schedLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>MENYIMPAN...</span>
                      </>
                    ) : (
                      <span>SIMPAN</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
