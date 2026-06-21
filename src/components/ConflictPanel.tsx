import React from 'react';
import { Schedule } from '@/lib/db';
import { AlertTriangle, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

interface ConflictPanelProps {
  schedules: Schedule[];
  userRole: 'admin' | 'dosen' | 'mahasiswa';
  onResolveClick: (sched: Schedule) => void;
}

export default function ConflictPanel({
  schedules,
  userRole,
  onResolveClick,
}: ConflictPanelProps) {
  const hardConflicts = schedules.filter((s) => s.status === 'hard-conflict');
  const softWarnings = schedules.filter((s) => s.status === 'soft-warning');

  const hasConflicts = hardConflicts.length > 0 || softWarnings.length > 0;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
      {/* Title Header */}
      <div className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
            Daftar Evaluasi Konflik
          </h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Analisis tumpang tindih alokasi ruang & dosen.
          </p>
        </div>
        {hasConflicts && (
          <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 animate-pulse">
            {hardConflicts.length + softWarnings.length} Isu
          </span>
        )}
      </div>

      {/* Issues List Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[500px] xl:max-h-none">
        {!hasConflicts ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <div className="rounded-full bg-emerald-50 dark:bg-emerald-950/20 p-3 text-emerald-600 dark:text-emerald-400 mb-3 shadow-inner">
              <CheckCircle className="h-7 w-7" />
            </div>
            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 mb-1">
              Jadwal Bebas Bentrok
            </h4>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-[200px] leading-relaxed">
              Semua data dosen, ruang, dan preferensi waktu berhasil disinkronisasi tanpa konflik.
            </p>
          </div>
        ) : (
          <>
            {/* Hard Conflicts */}
            {hardConflicts.map((c) => (
              <div
                key={`hard-${c.id}`}
                className="group relative rounded-lg border border-rose-100 bg-rose-50/10 p-3.5 transition-all hover:bg-rose-50/20 dark:border-rose-900/20 dark:bg-rose-950/5 dark:hover:bg-rose-950/10"
              >
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 text-rose-500 dark:text-rose-400 mt-0.5" />
                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold tracking-wider text-rose-600 dark:text-rose-450 text-[10px] uppercase">
                        BENTROK UTAMA
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                        {c.day}, {c.timeSlot}
                      </span>
                    </div>
                    <h5 className="font-bold text-slate-800 dark:text-slate-200 mt-1">
                      {c.subject}
                    </h5>
                    <p className="text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                      {c.details}
                    </p>

                    {userRole === 'admin' && (
                      <button
                        onClick={() => onResolveClick(c)}
                        className="mt-3 flex items-center gap-1 rounded bg-rose-100 hover:bg-rose-200 text-rose-700 font-semibold px-2.5 py-1 text-[10px] transition-colors dark:bg-rose-950/40 dark:hover:bg-rose-900/40 dark:text-rose-350"
                      >
                        <RefreshCw className="h-3 w-3 shrink-0" />
                        <span>Pindahkan / Reschedule</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Soft Warnings */}
            {softWarnings.map((w) => (
              <div
                key={`soft-${w.id}`}
                className="group relative rounded-lg border border-amber-100 bg-amber-50/10 p-3.5 transition-all hover:bg-amber-50/20 dark:border-amber-900/20 dark:bg-amber-950/5 dark:hover:bg-amber-950/10"
              >
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-amber-500 dark:text-amber-400 mt-0.5" />
                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold tracking-wider text-amber-600 dark:text-amber-450 text-[10px] uppercase">
                        OPTIMASI
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                        {w.day}, {w.timeSlot}
                      </span>
                    </div>
                    <h5 className="font-bold text-slate-800 dark:text-slate-200 mt-1">
                      {w.subject}
                    </h5>
                    <p className="text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                      {w.details}
                    </p>

                    {userRole === 'admin' && (
                      <button
                        onClick={() => onResolveClick(w)}
                        className="mt-3 flex items-center gap-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-700 font-semibold px-2.5 py-1 text-[10px] transition-colors dark:bg-amber-950/40 dark:hover:bg-amber-900/40 dark:text-amber-350"
                      >
                        <RefreshCw className="h-3 w-3 shrink-0" />
                        <span>Pindahkan Pagi</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
