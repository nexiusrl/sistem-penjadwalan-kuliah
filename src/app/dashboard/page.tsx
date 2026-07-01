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

  // Master Data Auto-Open States
  const [masterSubTab, setMasterSubTab] = useState<'dosen' | 'ruang' | 'mk'>('dosen');
  const [editSubjectId, setEditSubjectId] = useState<number | null>(null);

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

  // Open Course Edit Form directly in Master Data Tab
  const openScheduleForm = (sched: Schedule | null = null) => {
    if (userRole !== 'admin') return;

    if (sched) {
      const mk = matakuliah.find(m => m.code === sched.code || m.name === sched.subject);
      if (mk) {
        setMasterSubTab('mk');
        setEditSubjectId(mk.id);
        setActiveTab('master');
      }
    }
  };

  // Show premium skeleton loader while data is loading
  if (!isMounted || dbLoading) {
    return <DashboardSkeleton />;
  }

  const stats = getStats();
  const evaluatedSchedules = getEvaluatedSchedules();
  const hasConflicts = stats.conflictCount > 0;

  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-gradient-to-br from-slate-50 to-slate-100 font-sans text-slate-900">
      {/* Top Banner Navigation Header */}
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/90 backdrop-blur-md px-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary font-extrabold text-white text-lg shadow-primary transition-transform duration-300 hover:scale-105">
            S
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            SISJAD
          </span>
        </div>

        {/* Dynamic Navbar Statistics Counter */}
        <div className="hidden md:flex items-center gap-3 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 bg-white">
            <span className="h-2 w-2 bg-emerald-500 rounded-full" />
            <span>{stats.validCount} Valid</span>
          </div>
          {stats.conflictCount > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-rose-600">
              <span className="h-2 w-2 bg-rose-500 rounded-full animate-pulse" />
              <span>{stats.conflictCount} Bentrok</span>
            </div>
          )}
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 bg-white">
            <span className="h-2 w-2 bg-amber-500 rounded-full" />
            <span>{stats.warningCount} Peringatan</span>
          </div>
        </div>

        {/* User Identity Details & Logout */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-semibold text-slate-900 leading-none">{userName}</div>
            <div className="text-xs text-slate-500 mt-1">
              {userRole === 'admin' ? 'Administrator' : userRole === 'dosen' ? 'Dosen' : 'Mahasiswa'}
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Keluar sistem"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 active:scale-[0.98] transition-all cursor-pointer"
          >
            <LogOut className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
      </header>

      {/* Main Panel Layout */}
      <div className="flex flex-1 w-full">
        {/* Sidebar Nav */}
        <aside className="hidden md:flex w-64 flex-col border-r border-slate-200 bg-white py-6 px-4">
          <div className="space-y-2 flex-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold tracking-tight transition-all duration-300 active:scale-[0.98] cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-primary text-white shadow-primary'
                  : 'bg-transparent text-slate-600 hover:bg-primary/10 hover:text-primary'
              }`}
            >
              <Calendar className="h-5 w-5" strokeWidth={2} />
              <span>Dashboard Jadwal</span>
            </button>

            {userRole !== 'mahasiswa' && (
              <button
                onClick={() => setActiveTab('requests')}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold tracking-tight transition-all duration-300 active:scale-[0.98] cursor-pointer ${
                  activeTab === 'requests'
                    ? 'bg-primary text-white shadow-primary'
                    : 'bg-transparent text-slate-600 hover:bg-primary/10 hover:text-primary'
                }`}
              >
                <FileText className="h-5 w-5" strokeWidth={2} />
                <span>Pergeseran Jadwal</span>
              </button>
            )}

            {userRole === 'admin' && (
              <button
                onClick={() => setActiveTab('master')}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold tracking-tight transition-all duration-300 active:scale-[0.98] cursor-pointer ${
                  activeTab === 'master'
                    ? 'bg-primary text-white shadow-primary'
                    : 'bg-transparent text-slate-600 hover:bg-primary/10 hover:text-primary'
                }`}
              >
                <Settings className="h-5 w-5" strokeWidth={2} />
                <span>Data Master</span>
              </button>
            )}
          </div>

          <div className="border-t border-slate-100 pt-6 px-2 text-xs text-slate-400 leading-relaxed font-medium">
            &copy; 2026 PRODI SISTEM INFORMASI
          </div>
        </aside>

        {/* Content Body Container */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Mobile Tab Swapping */}
          <div className="flex md:hidden mb-6 rounded-xl bg-slate-100 p-1.5 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 rounded-lg py-2.5 text-center transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              Dashboard
            </button>
            {userRole !== 'mahasiswa' && (
              <button
                onClick={() => setActiveTab('requests')}
                className={`flex-1 rounded-lg py-2.5 text-center transition-all ${
                  activeTab === 'requests'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                Requests
              </button>
            )}
            {userRole === 'admin' && (
              <button
                onClick={() => setActiveTab('master')}
                className={`flex-1 rounded-lg py-2.5 text-center transition-all ${
                  activeTab === 'master'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                Master
              </button>
            )}
          </div>

          {activeTab === 'dashboard' && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-300">
              {/* Conflict Header Alert Banner */}
              {hasConflicts && userRole === 'admin' && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
                  <div className="flex gap-3">
                    <AlertTriangle className="h-6 w-6 text-rose-500 shrink-0 mt-0.5" strokeWidth={2} />
                    <div className="text-sm text-slate-800">
                      <h4 className="font-bold text-slate-900 uppercase tracking-tight">
                        Deteksi Bentrok Jadwal Kuliah
                      </h4>
                      <p className="mt-1 text-slate-600 font-medium leading-relaxed max-w-[620px]">
                        Terdapat {stats.conflictCount} bentrok hard-constraint. Selesaikan secara manual atau jalankan
                        Constraint Solver otomatis berbasis Algoritma Genetika untuk mengalokasi ulang ruangan secara bebas bentrok.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={triggerGASolver}
                    className="flex items-center gap-2 shrink-0 rounded-xl bg-primary hover:bg-primary-hover px-5 py-3 text-sm font-semibold text-white shadow-primary active:scale-[0.98] transition-all duration-300 cursor-pointer"
                  >
                    <Play className="h-5 w-5 shrink-0 fill-current" strokeWidth={2} />
                    <span>Jalankan GA Solver</span>
                  </button>
                </div>
              )}

              {/* Split Calendar grid / evaluation panel */}
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
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
                initialSubTab={masterSubTab}
                initialEditSubjectId={editSubjectId}
                onClearInitialState={() => {
                  setEditSubjectId(null);
                }}
              />
            </div>
          )}
        </main>
      </div>

      {/* Floating Notice Toast */}
      {notice && (
        <div className="fixed bottom-8 right-8 z-50 flex items-center gap-3 rounded-xl bg-slate-900 border border-slate-700 px-5 py-4 text-sm font-medium text-white shadow-lg animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" strokeWidth={2} />
          <span>{notice}</span>
        </div>
      )}

      {/* Dynamic Solver (GA) Progress Overlay */}
      {isSolving && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/50 p-6 text-white backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md text-center border border-slate-200 bg-white p-8 text-slate-900 rounded-2xl shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center justify-center gap-2">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" strokeWidth={2} />
              <span className="text-primary font-semibold tracking-tight">GA SOLVER AKTIF</span>
            </h3>
            <p className="text-sm text-slate-600 max-w-[320px] mx-auto leading-relaxed mb-6 font-medium">
              Mengevaluasi alokasi constraint ruang & waktu dosen. Menghitung mutasi kecocokan penjadwalan optimal...
            </p>

            {/* Progress Bar Container */}
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden mb-3">
              <div
                className="bg-primary h-full transition-all duration-300 rounded-full shadow-[0_0_12px_rgba(37,99,235,0.4)]"
                style={{ width: `${solveProgress}%` }}
              />
            </div>
            <span className="text-sm font-semibold text-primary">{solveProgress}% SELESAI</span>
          </div>
        </div>
      )}
    </div>
  );
}
