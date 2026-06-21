import { useState, useCallback, useMemo } from 'react';
import { Schedule, Lecturer, Room, Subject } from '@/lib/db';

export interface SolverStats {
  validCount: number;
  conflictCount: number;
  warningCount: number;
}

export function useSolver(
  initialSchedules: Schedule[],
  dosen: Lecturer[],
  ruangan: Room[],
  matakuliah: Subject[]
) {
  // Local state for schedules so we can display real-time client validation
  const [schedules, setSchedules] = useState<Schedule[]>(initialSchedules);

  // Synchronize state when initialSchedules changes
  useMemo(() => {
    setSchedules(initialSchedules);
  }, [initialSchedules]);

  // Evaluates constraints on any schedule list
  const evaluateSchedules = useCallback(
    (schedList: Schedule[]): Schedule[] => {
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
            // If preference is a specific day, e.g., "Senin", check if schedule day matches
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
    },
    [dosen]
  );

  // Get active schedules with evaluated status
  const evaluatedSchedules = useMemo(() => {
    return evaluateSchedules(schedules);
  }, [schedules, evaluateSchedules]);

  // Compute stats
  const stats = useMemo<SolverStats>(() => {
    let validCount = 0;
    let conflictCount = 0;
    let warningCount = 0;

    evaluatedSchedules.forEach((s) => {
      if (s.status === 'hard-conflict') conflictCount++;
      else if (s.status === 'soft-warning') warningCount++;
      else validCount++;
    });

    return { validCount, conflictCount, warningCount };
  }, [evaluatedSchedules]);

  // Dynamic Backtracking Constraint Solver
  const solveConflicts = useCallback(async (): Promise<{
    schedules: Schedule[];
    solvedCount: number;
  }> => {
    const availableRooms = ruangan.map((r) => r.name);
    let newSchedules = JSON.parse(JSON.stringify(evaluatedSchedules)) as Schedule[];
    let solvedCount = 0;

    // Helper to check constraints for a slot placement
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
          // Room conflict
          if (other.room === room) return true;
          // Lecturer conflict
          if (other.lecturer === sched.lecturer) return true;
        }
        return false;
      });
    };

    // Try to resolve each conflicted item
    newSchedules.forEach((item) => {
      // Find course to get the fixed day & slot (forcing alignment with master data)
      const mk = matakuliah.find(
        (m) => m.name === item.subject || m.code === item.code
      );
      const fixedDay = mk ? mk.day : item.day;
      const fixedSlot = mk ? mk.timeSlot : item.timeSlot;

      item.day = fixedDay;
      item.timeSlot = fixedSlot;

      // Recalculate if there is a conflict
      const hasConflict = newSchedules.some((other) => {
        if (other.id === item.id) return false;
        return (
          other.day === item.day &&
          other.timeSlot === item.timeSlot &&
          (other.room === item.room || other.lecturer === item.lecturer)
        );
      });

      if (hasConflict) {
        // Search available rooms for this specific course-bound schedule slot
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

    // Run final evaluation on the resolved schedule list
    const finalEvaluated = evaluateSchedules(newSchedules);
    return { schedules: finalEvaluated, solvedCount };
  }, [evaluatedSchedules, ruangan, matakuliah, evaluateSchedules]);

  return {
    schedules: evaluatedSchedules,
    setSchedules,
    stats,
    solveConflicts,
    evaluateSchedules,
  };
}
