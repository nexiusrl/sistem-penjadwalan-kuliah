import React from 'react';
import { Schedule } from '@/lib/db';
import { AlertTriangle, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

interface ConflictPanelProps {
  schedules: Schedule[];
  userRole: 'admin' | 'dosen' | 'mahasiswa';
  onResolveClick: (sched: Schedule) => void;
  loading?: boolean;
}

// Skeleton placeholder for the conflict panel while data is loading
function ConflictSkeleton() {
  return (
    <div className="flex flex-col h-full bg-white border border-slate-200/60 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
      <div className="bg-slate-50/50 border-b border-slate-100 px-5 py-4 flex items-center justify-between">
        <div>
          <div className="animate-pulse rounded-md bg-slate-100 h-2.5 w-28 mb-2" />
          <div className="animate-pulse rounded-md bg-slate-100 h-4 w-24" />
        </div>
        <div className="animate-pulse rounded-full bg-slate-100 h-5 w-12" />
      </div>
      <div className="flex-1 p-4 space-y-3.5">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-100 p-4">
            <div className="flex items-start gap-2.5">
              <div className="animate-pulse rounded-full bg-slate-100 h-4 w-4 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between gap-2 border-b border-slate-50 pb-1.5 mb-2">
                  <div className="animate-pulse rounded-md bg-slate-100 h-2.5 w-20" />
                  <div className="animate-pulse rounded-md bg-slate-100 h-2.5 w-24" />
                </div>
                <div className="animate-pulse rounded-md bg-slate-100 h-3.5 w-36" />
                <div className="animate-pulse rounded-md bg-slate-100 h-8 w-full" />
                <div className="animate-pulse rounded-lg bg-slate-100 h-7 w-36 mt-2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ConflictPanel({
  schedules,
  userRole,
  onResolveClick,
  loading = false,
}: ConflictPanelProps) {
  // Show skeleton while data is loading
  if (loading) {
    return <ConflictSkeleton />;
  }

  const hardConflicts = schedules.filter((s) => s.status === 'hard-conflict');
  const softWarnings = schedules.filter((s) => s.status === 'soft-warning');

  const hasConflicts = hardConflicts.length > 0 || softWarnings.length > 0;

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200/60 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
      {/* Title Header */}
      <div className="bg-slate-50/50 border-b border-slate-100 px-5 py-4 flex items-center justify-between">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 font-bold">
            02 // Evaluator Konflik
          </span>
          <h3 className="font-bold text-sm text-slate-800 mt-0.5">
            Daftar Isu Jadwal
          </h3>
        </div>
        {hasConflicts && (
          <span className="font-mono text-[10px] font-bold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full text-rose-600 animate-pulse">
            {hardConflicts.length + softWarnings.length} Isu
          </span>
        )}
      </div>

      {/* Issues List Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 max-h-[500px] xl:max-h-none">
        {!hasConflicts ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="rounded-2xl border border-slate-100 bg-emerald-50/50 p-4 text-emerald-600 mb-4">
              <CheckCircle className="h-7 w-7" strokeWidth={1.5} />
            </div>
            <h4 className="font-bold text-xs text-slate-800 mb-1">
              Bebas Bentrok Kuliah
            </h4>
            <p className="font-mono text-[9px] text-slate-400 max-w-[200px] leading-relaxed">
              Semua alokasi dosen, ruangan, dan preferensi tersinkronisasi sempurna.
            </p>
          </div>
        ) : (
          <>
            {/* Hard Conflicts */}
            {hardConflicts.map((c) => (
              <div
                key={`hard-${c.id}`}
                className="group relative rounded-xl border border-rose-100 bg-rose-50/10 p-4"
              >
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 text-rose-550 mt-0.5" strokeWidth={1.5} />
                  <div className="flex-1 text-xs font-mono">
                    <div className="flex items-center justify-between gap-2 border-b border-rose-100 pb-1.5 mb-2">
                      <span className="font-bold text-rose-600 uppercase tracking-wider text-[9px]">
                        BENTROK UTAMA
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {c.day}, {c.timeSlot}
                      </span>
                    </div>
                    <h5 className="font-sans font-bold text-slate-800 text-xs">
                      {c.subject}
                    </h5>
                    <p className="text-slate-500 font-medium mt-2 leading-relaxed text-[11px]">
                      {c.details}
                    </p>

                    {userRole === 'admin' && (
                      <button
                        onClick={() => onResolveClick(c)}
                        className="mt-3.5 flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-blue-50/50 hover:text-blue-600 hover:border-blue-200/60 font-bold px-3 py-1.5 text-[9px] uppercase transition-all duration-300 cursor-pointer active:scale-[0.97]"
                      >
                        <RefreshCw className="h-3 w-3 shrink-0 text-slate-600 stroke-[1.5]" />
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
                className="group relative rounded-xl border border-amber-100 bg-amber-50/10 p-4"
              >
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-amber-555 mt-0.5" strokeWidth={1.5} />
                  <div className="flex-1 text-xs font-mono">
                    <div className="flex items-center justify-between gap-2 border-b border-amber-100 pb-1.5 mb-2">
                      <span className="font-bold text-amber-600 uppercase tracking-wider text-[9px]">
                        OPTIMASI
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">
                        {w.day}, {w.timeSlot}
                      </span>
                    </div>
                    <h5 className="font-sans font-bold text-slate-800 text-xs">
                      {w.subject}
                    </h5>
                    <p className="text-slate-500 font-medium mt-2 leading-relaxed text-[11px]">
                      {w.details}
                    </p>

                    {userRole === 'admin' && (
                      <button
                        onClick={() => onResolveClick(w)}
                        className="mt-3.5 flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-blue-50/50 hover:text-blue-600 hover:border-blue-200/60 font-bold px-3 py-1.5 text-[9px] uppercase transition-all duration-300 cursor-pointer active:scale-[0.97]"
                      >
                        <RefreshCw className="h-3 w-3 shrink-0 text-slate-600 stroke-[1.5]" />
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
