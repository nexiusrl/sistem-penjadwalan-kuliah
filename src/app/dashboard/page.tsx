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
  Trash2,
  Settings,
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
      setEditScheduleId(sched.id);
      setSchedSubject(sched.subject);
      setSchedLecturer(sched.lecturer);
      setSchedRoom(sched.room);
      setSchedDay(sched.day);
      setSchedSlot(sched.timeSlot);
    } else {
      setEditScheduleId(null);
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
      <div className="flex min-h-screen w-full items-center justify-center bg-white font-mono border-4 border-black">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-9 w-9 animate-spin text-black stroke-2" />
          <span className="text-xs font-bold uppercase tracking-widest">MEMUAT SISJAD...</span>
        </div>
      </div>
    );
  }

  const hasConflicts = stats.conflictCount > 0;

  return (
    <div className="flex min-h-screen w-full flex-col bg-white font-sans text-neutral-900 border-4 border-black">
      {/* Top Banner Navigation Header */}
      <header className="sticky top-0 z-40 flex h-18 w-full items-center justify-between border-b-4 border-black bg-white px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-none border-2 border-black bg-black font-extrabold text-white text-base shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
            S
          </div>
          <span className="text-xl font-display font-extrabold italic tracking-tight text-neutral-900">
            SISJAD
          </span>
        </div>

        {/* Dynamic Navbar Statistics Counter */}
        <div className="hidden md:flex items-center gap-6 text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-500">
          <div className="flex items-center gap-1.5 border border-black/10 px-2 py-1 bg-neutral-50">
            <span className="h-2 w-2 bg-emerald-500 rounded-none border border-black" />
            <span>{stats.validCount} Valid</span>
          </div>
          {stats.conflictCount > 0 && (
            <div className="flex items-center gap-1.5 border-2 border-black bg-rose-50 px-2.5 py-1 text-rose-700 font-extrabold">
              <span className="h-2 w-2 bg-rose-500 rounded-none border border-black animate-ping" />
              <span>{stats.conflictCount} Bentrok</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 border border-black/10 px-2 py-1 bg-neutral-50">
            <span className="h-2 w-2 bg-amber-500 rounded-none border border-black" />
            <span>{stats.warningCount} Peringatan</span>
          </div>
        </div>

        {/* User Identity Details & Logout */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs font-display font-extrabold italic text-neutral-900 leading-none">{userName}</div>
            <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-500 mt-1">
              {userRole === 'admin' ? 'Administrator' : userRole === 'dosen' ? 'Dosen' : 'Mahasiswa'}
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Keluar sistem"
            className="flex h-9 w-9 items-center justify-center rounded-none border-2 border-black bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          >
            <LogOut className="h-4.5 w-4.5 stroke-2" />
          </button>
        </div>
      </header>

      {/* Main Panel Layout */}
      <div className="flex flex-1 w-full">
        {/* Sidebar Nav */}
        <aside className="hidden md:flex w-64 flex-col border-r-4 border-black bg-neutral-50 py-6 px-4">
          <div className="space-y-3 flex-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex w-full items-center gap-3 rounded-none border-2 border-black px-4 py-3 text-xs font-mono font-bold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(150,150,150,1)]'
                  : 'bg-white text-neutral-700 hover:bg-neutral-100 hover:text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
              }`}
            >
              <Calendar className="h-4.5 w-4.5 stroke-2" />
              <span>DASHBOARD JADWAL</span>
            </button>

            {userRole !== 'mahasiswa' && (
              <button
                onClick={() => setActiveTab('requests')}
                className={`flex w-full items-center gap-3 rounded-none border-2 border-black px-4 py-3 text-xs font-mono font-bold transition-all ${
                  activeTab === 'requests'
                    ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(150,150,150,1)]'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100 hover:text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                }`}
              >
                <FileText className="h-4.5 w-4.5 stroke-2" />
                <span>PERGESERAN JADWAL</span>
              </button>
            )}

            {userRole === 'admin' && (
              <button
                onClick={() => setActiveTab('master')}
                className={`flex w-full items-center gap-3 rounded-none border-2 border-black px-4 py-3 text-xs font-mono font-bold transition-all ${
                  activeTab === 'master'
                    ? 'bg-black text-white shadow-[2px_2px_0px_0px_rgba(150,150,150,1)]'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100 hover:text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                }`}
              >
                <Settings className="h-4.5 w-4.5 stroke-2" />
                <span>DATA MASTER</span>
              </button>
            )}
          </div>

          <div className="border-t-2 border-black pt-6 px-2 font-mono text-[9px] text-neutral-500 leading-relaxed font-semibold">
            &copy; 2026 PRODI SISTEM INFORMASI. REFAC. TO BRUTALIST LIGHT.
          </div>
        </aside>

        {/* Content Body Container */}
        <main className="flex-1 p-6 overflow-y-auto bg-white">
          {/* Mobile Tab Swapping */}
          <div className="flex md:hidden mb-6 rounded-none border-2 border-black bg-neutral-100 p-1 text-[10px] font-mono font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 rounded-none py-2 transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-black text-white'
                  : 'text-neutral-500'
              }`}
            >
              DASHBOARD
            </button>
            {userRole !== 'mahasiswa' && (
              <button
                onClick={() => setActiveTab('requests')}
                className={`flex-1 rounded-none py-2 transition-all ${
                  activeTab === 'requests'
                    ? 'bg-black text-white'
                    : 'text-neutral-500'
                }`}
              >
                REQUESTS
              </button>
            )}
            {userRole === 'admin' && (
              <button
                onClick={() => setActiveTab('master')}
                className={`flex-1 rounded-none py-2 transition-all ${
                  activeTab === 'master'
                    ? 'bg-black text-white'
                    : 'text-neutral-500'
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 rounded-none border-2 border-black bg-rose-50 p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex gap-3">
                    <AlertTriangle className="h-6 w-6 text-rose-600 shrink-0 mt-0.5 stroke-2" />
                    <div className="font-mono text-xs text-neutral-800">
                      <h4 className="font-display font-extrabold italic text-sm text-neutral-900 uppercase">
                        Deteksi Bentrok Jadwal Kuliah
                      </h4>
                      <p className="mt-2 text-neutral-600 font-semibold leading-relaxed max-w-[620px]">
                        Terdapat {stats.conflictCount} bentrok hard-constraint. Selesaikan secara manual atau jalankan
                        Constraint Solver otomatis berbasis Algoritma Genetika untuk mengalokasi ulang ruangan secara bebas tumpang tindih.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={triggerGASolver}
                    className="flex items-center gap-2 shrink-0 rounded-none border-2 border-black bg-neutral-900 px-5 py-3 text-xs font-mono font-bold text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
                  >
                    <Play className="h-4.5 w-4.5 shrink-0 fill-current" />
                    <span>JALANKAN GA SOLVER</span>
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
                  <div className="xl:col-span-4 font-sans">
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
        <div className="fixed bottom-8 right-8 z-50 flex items-center gap-2 rounded-none border-2 border-black bg-black px-5 py-3 text-xs font-mono font-bold text-white shadow-[4px_4px_0px_0px_rgba(100,100,100,1)] animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Dynamic Solver (GA) Progress Overlay */}
      {isSolving && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 p-6 text-white backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm text-center border-4 border-black bg-white p-8 text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-lg font-display font-extrabold italic text-neutral-900 mb-2 flex items-center justify-center gap-2">
              <RefreshCw className="h-5.5 w-5.5 animate-spin text-black stroke-2" />
              <span>GA SOLVER AKTIF</span>
            </h3>
            <p className="text-[10px] font-mono text-neutral-500 max-w-[280px] mx-auto leading-relaxed mb-6 font-bold">
              Mengevaluasi alokasi constraint ruang & waktu dosen. Menghitung mutasi kecocokan penjadwalan optimal...
            </p>

            {/* Progress Bar Container */}
            <div className="w-full bg-neutral-100 border-2 border-black rounded-none h-4 overflow-hidden mb-3">
              <div
                className="bg-black h-full transition-all duration-150"
                style={{ width: `${solveProgress}%` }}
              />
            </div>
            <span className="text-xs font-mono font-extrabold text-black">{solveProgress}% SELESAI</span>
          </div>
        </div>
      )}

      {/* Schedule Form Modal */}
      {isScheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-none border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between border-b-2 border-black pb-3">
              <h3 className="text-lg font-display font-extrabold italic text-neutral-900">
                {editScheduleId ? 'Edit Jadwal Kuliah' : 'Tambah Jadwal Kuliah'}
              </h3>
              <button
                onClick={() => setIsScheduleOpen(false)}
                className="rounded-none border-2 border-black p-1 hover:bg-neutral-100 text-black active:translate-x-0.5 active:translate-y-0.5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleScheduleSubmit} className="mt-4 space-y-4 font-mono text-xs font-semibold">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Mata Kuliah
                </label>
                <select
                  value={schedSubject}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  required
                  className="w-full rounded-none border-2 border-black py-2.5 px-3 bg-white outline-none"
                >
                  {dbData.matakuliah.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.code} - {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Dosen Pengampu
                </label>
                <select
                  value={schedLecturer}
                  onChange={(e) => setSchedLecturer(e.target.value)}
                  required
                  className="w-full rounded-none border-2 border-black py-2.5 px-3 bg-white outline-none"
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
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Hari Kuliah (Sesuai MK)
                  </label>
                  <input
                    type="text"
                    value={schedDay}
                    disabled
                    className="w-full rounded-none border-2 border-black bg-neutral-100 py-2.5 px-3 text-neutral-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Waktu Jam (Sesuai MK)
                  </label>
                  <input
                    type="text"
                    value={schedSlot}
                    disabled
                    className="w-full rounded-none border-2 border-black bg-neutral-100 py-2.5 px-3 text-neutral-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Ruangan Kelas
                </label>
                <select
                  value={schedRoom}
                  onChange={(e) => setSchedRoom(e.target.value)}
                  required
                  className="w-full rounded-none border-2 border-black py-2.5 px-3 bg-white outline-none"
                >
                  {dbData.ruangan.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name} ({r.type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Action buttons */}
              <div className="flex justify-between items-center border-t-2 border-black pt-4 mt-2">
                <div>
                  {editScheduleId && (
                    <button
                      type="button"
                      onClick={handleScheduleDelete}
                      disabled={schedLoading}
                      className="flex items-center gap-1.5 rounded-none border-2 border-black bg-white text-rose-650 hover:bg-rose-50 font-bold px-3.5 py-2 text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4 stroke-2" />
                      <span>HAPUS</span>
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsScheduleOpen(false)}
                    className="rounded-none border-2 border-black bg-white px-4 py-2 text-xs font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
                  >
                    BATAL
                  </button>
                  <button
                    type="submit"
                    disabled={schedLoading}
                    className="flex items-center gap-1.5 rounded-none border-2 border-black bg-black px-4 py-2 text-xs font-bold text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
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
