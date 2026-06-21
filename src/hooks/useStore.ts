import { create } from 'zustand';
import { Schedule, Lecturer, Room, Subject, ChangeRequest } from '@/lib/db';

// Helper to evaluate constraints on a list of schedules
export const evaluateSchedules = (
  schedList: Schedule[],
  dosen: Lecturer[]
): Schedule[] => {
  // 1. Reset all schedules to validated
  const evaluated: Schedule[] = schedList.map((s) => ({
    ...s,
    status: 'validated',
    details: '',
  }));

  // 2. Evaluate hard constraints (Room and Lecturer conflicts)
  evaluated.forEach((s1) => {
    evaluated.forEach((s2) => {
      if (s1.id === s2.id) return;

      if (s1.day === s2.day && s1.timeSlot === s2.timeSlot) {
        // Room conflict
        if (s1.room && s1.room === s2.room) {
          s1.status = 'hard-conflict';
          s1.details = `Bentrok Ruangan: Ruang ${s1.room} digunakan bersamaan dengan kelas ${s2.subject}.`;
        }
        // Lecturer conflict
        if (s1.lecturer && s1.lecturer === s2.lecturer) {
          s1.status = 'hard-conflict';
          s1.details = `Bentrok Dosen: ${s1.lecturer} mengajar kelas ${s2.subject} di jam yang sama.`;
        }
      }
    });
  });

  // 3. Evaluate soft constraints (Lecturer preferences)
  evaluated.forEach((s) => {
    if (s.status === 'validated') {
      const lec = dosen.find(
        (d) => d.name.toLowerCase() === s.lecturer.toLowerCase()
      );
      if (lec && lec.pref && lec.pref !== 'Bebas') {
        const prefDays = lec.pref.split(',').map(d => d.trim().toLowerCase());
        const currentDay = s.day.toLowerCase();
        
        if (prefDays.length > 0 && !prefDays.includes(currentDay) && lec.pref !== 'Bebas') {
          s.status = 'soft-warning';
          s.details = `Optimasi Preferensi: ${lec.name} lebih memilih mengajar pada hari ${lec.pref} (Saat ini: ${s.day}).`;
        }
      }
    }
  });

  return evaluated;
};

// Dynamic Backtracking Constraint Solver logic
export const solveConflicts = (
  schedList: Schedule[],
  dosen: Lecturer[],
  ruangan: Room[],
  matakuliah: Subject[]
): { schedules: Schedule[]; solvedCount: number } => {
  const availableRooms = ruangan.map((r) => r.name);
  const evaluated = evaluateSchedules(schedList, dosen);
  let newSchedules = JSON.parse(JSON.stringify(evaluated)) as Schedule[];
  let solvedCount = 0;

  const isPlacementValid = (
    sched: Schedule,
    day: string,
    slot: string,
    room: string,
    list: Schedule[]
  ) => {
    return !list.some((other) => {
      if (other.id === sched.id) return false;
      if (other.day === day && other.timeSlot === slot) {
        if (other.room === room) return true;
        if (other.lecturer === sched.lecturer) return true;
      }
      return false;
    });
  };

  newSchedules.forEach((item) => {
    const mk = matakuliah.find(
      (m) => m.name === item.subject || m.code === item.code
    );
    const fixedDay = mk ? mk.day : item.day;
    const fixedSlot = mk ? mk.timeSlot : item.timeSlot;

    item.day = fixedDay;
    item.timeSlot = fixedSlot;

    const hasConflict = newSchedules.some((other) => {
      if (other.id === item.id) return false;
      return (
        other.day === item.day &&
        other.timeSlot === item.timeSlot &&
        (other.room === item.room || other.lecturer === item.lecturer)
      );
    });

    if (hasConflict) {
      for (const r of availableRooms) {
        if (isPlacementValid(item, fixedDay, fixedSlot, r, newSchedules)) {
          item.room = r;
          item.status = 'validated';
          item.details = '';
          solvedCount++;
          break;
        }
      }
    }
  });

  const finalEvaluated = evaluateSchedules(newSchedules, dosen);
  return { schedules: finalEvaluated, solvedCount };
};

interface StoreState {
  // Auth state
  isMounted: boolean;
  userRole: 'admin' | 'dosen' | 'mahasiswa';
  userEmail: string;
  userName: string;
  
  // Database state
  dosen: Lecturer[];
  ruangan: Room[];
  matakuliah: Subject[];
  schedules: Schedule[];
  requests: ChangeRequest[];
  dbLoading: boolean;
  
  // UI states
  activeTab: 'dashboard' | 'requests' | 'master';
  isSolving: boolean;
  solveProgress: number;
  notice: string | null;
  
  // Setters/Actions
  setMounted: (mounted: boolean) => void;
  setUserSession: (role: 'admin' | 'dosen' | 'mahasiswa', email: string, name: string) => void;
  setActiveTab: (tab: 'dashboard' | 'requests' | 'master') => void;
  showNotice: (msg: string) => void;
  clearNotice: () => void;
  
  // API Actions
  fetchDBState: () => Promise<void>;
  triggerGASolver: () => Promise<void>;
  deleteSchedule: (scheduleId: number) => Promise<boolean>;
  submitSchedule: (payload: any, scheduleId: number | null) => Promise<boolean>;
  
  // Computed stats helper
  getStats: () => { validCount: number; conflictCount: number; warningCount: number };
  getEvaluatedSchedules: () => Schedule[];
}

export const useStore = create<StoreState>((set, get) => ({
  isMounted: false,
  userRole: 'mahasiswa',
  userEmail: '',
  userName: '',
  
  dosen: [],
  ruangan: [],
  matakuliah: [],
  schedules: [],
  requests: [],
  dbLoading: true,
  
  activeTab: 'dashboard',
  isSolving: false,
  solveProgress: 0,
  notice: null,
  
  setMounted: (mounted) => set({ isMounted: mounted }),
  setUserSession: (role, email, name) => set({ userRole: role, userEmail: email, userName: name }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  showNotice: (msg) => {
    set({ notice: msg });
    setTimeout(() => {
      set({ notice: null });
    }, 4000);
  },
  clearNotice: () => set({ notice: null }),
  
  fetchDBState: async () => {
    set({ dbLoading: true });
    try {
      const res = await fetch('/api/db');
      if (!res.ok) throw new Error('Gagal mengambil data database.');
      const data = await res.json();
      set({
        dosen: data.dosen || [],
        ruangan: data.ruangan || [],
        matakuliah: data.matakuliah || [],
        schedules: data.schedules || [],
        requests: data.requests || [],
      });
    } catch (err: any) {
      console.error(err.message);
    } finally {
      set({ dbLoading: false });
    }
  },
  
  triggerGASolver: async () => {
    const { userRole, userEmail, schedules, dosen, ruangan, matakuliah, fetchDBState, showNotice } = get();
    if (userRole !== 'admin') return;

    set({ isSolving: true, solveProgress: 0 });

    // Progress Bar Animation (1.5 seconds total)
    const interval = setInterval(() => {
      set((state) => {
        if (state.solveProgress >= 100) {
          clearInterval(interval);
          return { solveProgress: 100 };
        }
        return { solveProgress: state.solveProgress + 20 };
      });
    }, 150);

    // Wait for animation to finish
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      // Run solver algorithm client-side using state values
      const result = solveConflicts(schedules, dosen, ruangan, matakuliah);
      
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

      set({ isSolving: false });
      await fetchDBState();
      showNotice(`Penjadwalan otomatis sukses! Berhasil merelokasi ${result.solvedCount} bentrok.`);
    } catch (err: any) {
      set({ isSolving: false });
      alert(err.message || 'Terjadi kesalahan saat memproses solusi.');
    }
  },
  
  deleteSchedule: async (scheduleId) => {
    const { userRole, userEmail, fetchDBState, showNotice } = get();
    if (userRole !== 'admin') return false;
    
    try {
      const res = await fetch(`/api/schedules/${scheduleId}`, {
        method: 'DELETE',
        headers: {
          'X-User-Role': userRole,
          'X-User-Email': userEmail,
        },
      });

      if (!res.ok) throw new Error('Gagal menghapus jadwal.');

      await fetchDBState();
      showNotice('Jadwal sukses dihapus.');
      return true;
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus.');
      return false;
    }
  },
  
  submitSchedule: async (payload, scheduleId) => {
    const { userRole, userEmail, fetchDBState, showNotice } = get();
    if (userRole !== 'admin') return false;

    const url = scheduleId ? `/api/schedules/${scheduleId}` : '/api/schedules';
    const method = scheduleId ? 'PUT' : 'POST';

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

      await fetchDBState();
      showNotice(scheduleId ? 'Jadwal berhasil diperbarui!' : 'Jadwal baru berhasil dibuat!');
      return true;
    } catch (err: any) {
      alert(err.message || 'Kesalahan sistem.');
      return false;
    }
  },
  
  getEvaluatedSchedules: () => {
    const { schedules, dosen } = get();
    return evaluateSchedules(schedules, dosen);
  },
  
  getStats: () => {
    const evaluated = get().getEvaluatedSchedules();
    let validCount = 0;
    let conflictCount = 0;
    let warningCount = 0;

    evaluated.forEach((s) => {
      if (s.status === 'hard-conflict') conflictCount++;
      else if (s.status === 'soft-warning') warningCount++;
      else validCount++;
    });

    return { validCount, conflictCount, warningCount };
  }
}));
