'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSolver } from '@/hooks/useSolver';
import { Schedule, Lecturer, Room, Subject, ChangeRequest } from '@/lib/db';
import CalendarGrid from '@/components/CalendarGrid';
import ConflictPanel from '@/components/ConflictPanel';
import RequestPanel from '@/components/RequestPanel';
import MasterDataPanel from '@/components/MasterDataPanel';
import {
  Calendar,
  Users,
  FileText,
  Layers,
  LogOut,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Play,
  X,
  Loader2,
  BookOpen,
  Settings,
  Trash2,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  
  // Client auth states (loaded from localStorage on mount)
  const [isMounted, setIsMounted] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'dosen' | 'mahasiswa'>('mahasiswa');
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');

  // UI state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'requests' | 'master'>('dashboard');
  const [isSolving, setIsSolving] = useState(false);
  const [solveProgress, setSolveProgress] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  
  // Schedule Form Modal States
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [editScheduleId, setEditScheduleId] = useState<number | null>(null);
  const [schedSubject, setSchedSubject] = useState('');
  const [schedLecturer, setSchedLecturer] = useState('');
  const [schedRoom, setSchedRoom] = useState('');
  const [schedDay, setSchedDay] = useState('Senin');
  const [schedSlot, setSchedSlot] = useState('08:00 - 10:30');
  const [schedLoading, setSchedLoading] = useState(false);

  // Raw Database States
  const [dbData, setDbData] = useState<{
    dosen: Lecturer[];
    ruangan: Room[];
    matakuliah: Subject[];
    schedules: Schedule[];
    requests: ChangeRequest[];
  }>({
    dosen: [],
    ruangan: [],
    matakuliah: [],
    schedules: [],
    requests: [],
  });

  const [dbLoading, setDbLoading] = useState(true);

  // Initialize browser solver hook
  const {
    schedules,
    stats,
    solveConflicts,
    setSchedules,
  } = useSolver(dbData.schedules, dbData.dosen, dbData.ruangan, dbData.matakuliah);

  // Load auth state and fetch database on mount
  useEffect(() => {
    setIsMounted(true);
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    
    setUserRole((localStorage.getItem('userRole') as any) || 'mahasiswa');
    setUserEmail(localStorage.getItem('userEmail') || '');
    setUserName(localStorage.getItem('userName') || 'User');
    
    fetchDBState();
  }, [router]);

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
  }, [userRole]);

  // Fetch complete database state
  const fetchDBState = useCallback(async () => {
    setDbLoading(true);
    try {
      const res = await fetch('/api/db');
      if (!res.ok) throw new Error('Gagal mengambil data database.');
      const data = await res.json();
      setDbData({
        dosen: data.dosen || [],
        ruangan: data.ruangan || [],
        matakuliah: data.matakuliah || [],
        schedules: data.schedules || [],
        requests: data.requests || [],
      });
    } catch (err: any) {
      console.error(err.message);
    } finally {
      setDbLoading(false);
    }
  }, []);

  // Show auto-dismissing notice toast
  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => {
      setNotice(null);
    }, 4000);
  };

  // Trigger Genetic Algorithm solver simulation
  const triggerGASolver = async () => {
    if (userRole !== 'admin') return;

    setIsSolving(true);
    setSolveProgress(0);

    // Progress Bar Animation (1.5 seconds total)
    const interval = setInterval(() => {
      setSolveProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 20;
      });
    }, 150);

    // Wait for animation to finish
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      // Run solver algorithm client-side
      const result = await solveConflicts();
      
      // Save results back to backend JSON db in bulk
      const res = await fetch('/api/schedules/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': userRole,
          'X-User-Email': userEmail,
        },
        body: JSON.stringify({ schedules: result.schedules }),
      });

      if (!res.ok) throw new Error('Gagal sinkronisasi data GA ke database.');

      setIsSolving(false);
      fetchDBState();
      showNotice(`Penjadwalan otomatis sukses! Berhasil merelokasi ${result.solvedCount} bentrok.`);
    } catch (err: any) {
      setIsSolving(false);
      alert(err.message || 'Terjadi kesalahan saat memproses solusi.');
    }
  };

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
    
    if (dbData.matakuliah.length === 0 || dbData.dosen.length === 0 || dbData.ruangan.length === 0) {
      alert('Harap lengkapi Data Master (Dosen, Ruangan, Mata Kuliah) terlebih dahulu sebelum membuat Jadwal.');
      return;
    }

    if (sched) {
      // Edit mode
      setEditScheduleId(sched.id);
      setSchedSubject(sched.subject);
      setSchedLecturer(sched.lecturer);
      setSchedRoom(sched.room);
      setSchedDay(sched.day);
      setSchedSlot(sched.timeSlot);
    } else {
      // Add mode
      setEditScheduleId(null);
      
      // Prefill with first mata kuliah data
      const firstMK = dbData.matakuliah[0];
      setSchedSubject(firstMK.name);
      setSchedLecturer(dbData.dosen[0]?.name || '');
      setSchedRoom(dbData.ruangan[0]?.name || '');
      setSchedDay(firstMK.day || 'Senin');
      setSchedSlot(firstMK.timeSlot || '08:00 - 10:30');
    }
    
    setIsScheduleOpen(true);
  };

  // Update day and timeslot automatically based on selected subject in schedule form
  const handleSubjectChange = (subjectName: string) => {
    setSchedSubject(subjectName);
    const selected = dbData.matakuliah.find((m) => m.name === subjectName);
    if (selected) {
      setSchedDay(selected.day || 'Senin');
      setSchedSlot(selected.timeSlot || '08:00 - 10:30');
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole !== 'admin') return;

    setSchedLoading(true);
    const code = dbData.matakuliah.find((m) => m.name === schedSubject)?.code || '';

    const payload = {
      subject: schedSubject,
      code,
      lecturer: schedLecturer,
      room: schedRoom,
      day: schedDay,
      timeSlot: schedSlot,
    };

    const url = editScheduleId ? `/api/schedules/${editScheduleId}` : '/api/schedules';
    const method = editScheduleId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': userRole,
          'X-User-Email': userEmail,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Gagal menyimpan jadwal perkuliahan.');

      setIsScheduleOpen(false);
      fetchDBState();
      showNotice(editScheduleId ? 'Jadwal berhasil diperbarui!' : 'Jadwal baru berhasil dibuat!');
    } catch (err: any) {
      alert(err.message || 'Kesalahan sistem.');
    } finally {
      setSchedLoading(false);
    }
  };

  const handleScheduleDelete = async () => {
    if (!editScheduleId || userRole !== 'admin') return;
    if (!confirm('Apakah Anda yakin ingin menghapus jadwal ini secara permanen?')) return;

    setSchedLoading(true);
    try {
      const res = await fetch(`/api/schedules/${editScheduleId}`, {
        method: 'DELETE',
        headers: {
          'X-User-Role': userRole,
          'X-User-Email': userEmail,
        },
      });

      if (!res.ok) throw new Error('Gagal menghapus jadwal.');

      setIsScheduleOpen(false);
      fetchDBState();
      showNotice('Jadwal sukses dihapus.');
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus.');
    } finally {
      setSchedLoading(false);
    }
  };

  if (!isMounted || dbLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-9 w-9 animate-spin text-indigo-600 dark:text-indigo-400" />
          <span className="text-sm font-semibold text-slate-500">Memuat SISJAD...</span>
        </div>
      </div>
    );
  }

  const hasConflicts = stats.conflictCount > 0;

  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-200">
      {/* Top Banner Navigation Header */}
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 font-extrabold text-white">
            S
          </div>
          <span className="text-base font-extrabold tracking-wide text-slate-900 dark:text-white">
            SISJAD
          </span>
        </div>

        {/* Dynamic Navbar Statistics Counter */}
        <div className="hidden md:flex items-center gap-5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          <div className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span>{stats.validCount} Valid</span>
          </div>
          {stats.conflictCount > 0 && (
            <div className="flex items-center gap-1 rounded bg-rose-50 px-2 py-0.5 font-bold text-rose-600 dark:bg-rose-950/20 dark:text-rose-400">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
              <span>{stats.conflictCount} Bentrok</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span>{stats.warningCount} Peringatan</span>
          </div>
        </div>

        {/* User Identity Details & Logout */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{userName}</div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
              {userRole === 'admin' ? 'Administrator' : userRole === 'dosen' ? 'Dosen' : 'Mahasiswa'}
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Keluar sistem"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-rose-650 transition-colors dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </header>

      {/* Main Panel Layout */}
      <div className="flex flex-1 w-full">
        {/* Sidebar Nav */}
        <aside className="hidden md:flex w-64 flex-col border-r border-slate-200 bg-white py-6 px-4 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="space-y-1.5 flex-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-xs font-bold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-50 text-indigo-650 dark:bg-indigo-950/20 dark:text-indigo-400'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              <Calendar className="h-4.5 w-4.5" />
              <span>Dashboard Jadwal</span>
            </button>

            {userRole !== 'mahasiswa' && (
              <button
                onClick={() => setActiveTab('requests')}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-xs font-bold transition-all ${
                  activeTab === 'requests'
                    ? 'bg-indigo-50 text-indigo-650 dark:bg-indigo-950/20 dark:text-indigo-400'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                <FileText className="h-4.5 w-4.5" />
                <span>Pergeseran Jadwal</span>
              </button>
            )}

            {userRole === 'admin' && (
              <button
                onClick={() => setActiveTab('master')}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-xs font-bold transition-all ${
                  activeTab === 'master'
                    ? 'bg-indigo-50 text-indigo-650 dark:bg-indigo-950/20 dark:text-indigo-400'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                <Settings className="h-4.5 w-4.5" />
                <span>Data Master</span>
              </button>
            )}
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-6 px-4 text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">
            &copy; 2026 Program Studi Sistem Informasi. SISJAD refactored to Next.js + Tailwind.
          </div>
        </aside>

        {/* Content Body Container */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Mobile Tab Swapping */}
          <div className="flex md:hidden mb-6 rounded-lg bg-slate-100 p-1 dark:bg-slate-800 text-[10px] font-bold">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 rounded-md py-2 transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              Dashboard
            </button>
            {userRole !== 'mahasiswa' && (
              <button
                onClick={() => setActiveTab('requests')}
                className={`flex-1 rounded-md py-2 transition-all ${
                  activeTab === 'requests'
                    ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Requests
              </button>
            )}
            {userRole === 'admin' && (
              <button
                onClick={() => setActiveTab('master')}
                className={`flex-1 rounded-md py-2 transition-all ${
                  activeTab === 'master'
                    ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500 dark:text-slate-400'
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50/40 p-5 dark:border-rose-950/20 dark:bg-rose-950/10">
                  <div className="flex gap-3">
                    <AlertTriangle className="h-5.5 w-5.5 text-rose-500 dark:text-rose-455 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs text-rose-800 dark:text-rose-350">
                        Peringatan Bentrok Hard Constraint Dideteksi
                      </h4>
                      <p className="text-[11px] text-rose-700 dark:text-rose-400/80 mt-1 max-w-[580px] leading-relaxed">
                        Terdapat {stats.conflictCount} bentrok jadwal kuliah. Selesaikan secara manual atau jalankan
                        Constraint Solver otomatis berbasis Algoritma Genetika untuk mengalokasi ulang ruangan secara bebas tumpang tindih.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={triggerGASolver}
                    className="flex items-center gap-1.5 shrink-0 rounded-lg bg-rose-600 px-4.5 py-2.5 text-xs font-semibold text-white shadow-md shadow-rose-600/10 hover:bg-rose-700 transition-all dark:bg-rose-500 dark:hover:bg-rose-600 dark:shadow-none"
                  >
                    <Play className="h-4 w-4 shrink-0 fill-current" />
                    <span>Jalankan Solusi Otomatis (GA)</span>
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
                    schedules={schedules}
                    dosen={dbData.dosen}
                    ruangan={dbData.ruangan}
                    matakuliah={dbData.matakuliah}
                    userRole={userRole}
                    userName={userName}
                    onRefresh={fetchDBState}
                    onAddScheduleClick={() => openScheduleForm(null)}
                    openEditModal={(s) => openScheduleForm(s)}
                  />
                </div>

                {userRole === 'admin' && (
                  <div className="xl:col-span-4">
                    <ConflictPanel
                      schedules={schedules}
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
                schedules={dbData.schedules}
                requests={dbData.requests}
                userRole={userRole}
                userName={userName}
                onRefresh={fetchDBState}
              />
            </div>
          )}

          {activeTab === 'master' && userRole === 'admin' && (
            <div className="animate-in fade-in duration-300">
              <MasterDataPanel
                dosen={dbData.dosen}
                ruangan={dbData.ruangan}
                matakuliah={dbData.matakuliah}
                userRole={userRole}
                onRefresh={fetchDBState}
              />
            </div>
          )}
        </main>
      </div>

      {/* Floating Notice Toast */}
      {notice && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3.5 text-xs font-semibold text-white shadow-xl dark:bg-indigo-950 animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Dynamic Solver (GA) Progress Overlay */}
      {isSolving && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 p-6 text-white backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm text-center">
            <h3 className="text-lg font-extrabold tracking-wide mb-2 flex items-center justify-center gap-2">
              <RefreshCw className="h-5.5 w-5.5 animate-spin text-indigo-400" />
              <span>ALGORITMA GENETIKA AKTIF</span>
            </h3>
            <p className="text-[11px] text-slate-400 max-w-[280px] mx-auto leading-relaxed mb-6">
              Mengevaluasi alokasi constraint ruang & waktu dosen. Menghitung mutasi kecocokan penjadwalan optimal...
            </p>

            {/* Progress Bar Container */}
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden shadow-inner mb-2">
              <div
                className="bg-indigo-500 h-2.5 rounded-full transition-all duration-150"
                style={{ width: `${solveProgress}%` }}
              />
            </div>
            <span className="text-xs font-bold text-indigo-400">{solveProgress}% Selesai</span>
          </div>
        </div>
      )}

      {/* Schedule Form Modal */}
      {isScheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200 dark:border-slate-800 dark:bg-slate-900">
            {/* Header */}
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editScheduleId ? 'Edit Jadwal Kuliah' : 'Tambah Jadwal Kuliah'}
              </h3>
              <button
                onClick={() => setIsScheduleOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleScheduleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Mata Kuliah
                </label>
                <select
                  value={schedSubject}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950"
                >
                  {dbData.matakuliah.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.code} - {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Dosen Pengampu
                </label>
                <select
                  value={schedLecturer}
                  onChange={(e) => setSchedLecturer(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950"
                >
                  {dbData.dosen.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Hari Kuliah (Sesuai MK)
                  </label>
                  <input
                    type="text"
                    value={schedDay}
                    disabled
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Waktu Jam (Sesuai MK)
                  </label>
                  <input
                    type="text"
                    value={schedSlot}
                    disabled
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Ruangan Kelas
                </label>
                <select
                  value={schedRoom}
                  onChange={(e) => setSchedRoom(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950"
                >
                  {dbData.ruangan.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name} ({r.type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Action buttons */}
              <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
                <div>
                  {editScheduleId && (
                    <button
                      type="button"
                      onClick={handleScheduleDelete}
                      disabled={schedLoading}
                      className="flex items-center gap-1 rounded bg-rose-50 text-rose-650 hover:bg-rose-100 font-bold px-3.5 py-2 text-xs transition-colors dark:bg-rose-950/20 dark:text-rose-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Hapus</span>
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsScheduleOpen(false)}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={schedLoading}
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-650 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-75 dark:bg-indigo-50 dark:hover:bg-indigo-600"
                  >
                    {schedLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <span>Simpan</span>
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
