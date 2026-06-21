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
    <div className="flex flex-col h-full bg-white border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
      {/* Title Header */}
      <div className="bg-neutral-50 border-b-2 border-black px-5 py-4 flex items-center justify-between">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 font-bold">
            02 // Evaluator Konflik
          </span>
          <h3 className="font-display font-extrabold italic text-base text-neutral-900 mt-0.5">
            Daftar Isu Jadwal
          </h3>
        </div>
        {hasConflicts && (
          <span className="font-mono text-xs font-bold border-2 border-black bg-rose-50 px-2.5 py-0.5 text-rose-700">
            {hardConflicts.length + softWarnings.length} ISU
          </span>
        )}
      </div>

      {/* Issues List Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[500px] xl:max-h-none">
        {!hasConflicts ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="rounded-none border-2 border-black bg-emerald-50 p-4 text-emerald-700 mb-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h4 className="font-display font-bold italic text-sm text-neutral-900 mb-1">
              Bebas Bentrok Kuliah
            </h4>
            <p className="font-mono text-[10px] text-neutral-500 max-w-[200px] leading-relaxed">
              Semua alokasi dosen, ruangan, dan preferensi tersinkronisasi sempurna.
            </p>
          </div>
        ) : (
          <>
            {/* Hard Conflicts */}
            {hardConflicts.map((c) => (
              <div
                key={`hard-${c.id}`}
                className="group relative rounded-none border-2 border-black bg-white p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 shrink-0 text-rose-550 mt-0.5" />
                  <div className="flex-1 text-xs font-mono">
                    <div className="flex items-center justify-between gap-2 border-b border-black/10 pb-1.5 mb-2">
                      <span className="font-bold text-rose-600 uppercase tracking-wider text-[9px]">
                        BENTROK UTAMA
                      </span>
                      <span className="text-[10px] text-neutral-500 font-bold">
                        {c.day}, {c.timeSlot}
                      </span>
                    </div>
                    <h5 className="font-display font-bold italic text-neutral-900 text-sm">
                      {c.subject}
                    </h5>
                    <p className="text-neutral-600 font-medium mt-2 leading-relaxed">
                      {c.details}
                    </p>

                    {userRole === 'admin' && (
                      <button
                        onClick={() => onResolveClick(c)}
                        className="mt-4 flex items-center gap-1.5 rounded-none border-2 border-black bg-white hover:bg-neutral-50 font-bold px-3 py-1.5 text-[9px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
                      >
                        <RefreshCw className="h-3 w-3 shrink-0 text-black stroke-2" />
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
                className="group relative rounded-none border-2 border-black bg-white p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 shrink-0 text-amber-555 mt-0.5" />
                  <div className="flex-1 text-xs font-mono">
                    <div className="flex items-center justify-between gap-2 border-b border-black/10 pb-1.5 mb-2">
                      <span className="font-bold text-amber-600 uppercase tracking-wider text-[9px]">
                        OPTIMASI
                      </span>
                      <span className="text-[10px] text-neutral-500 font-bold">
                        {w.day}, {w.timeSlot}
                      </span>
                    </div>
                    <h5 className="font-display font-bold italic text-neutral-900 text-sm">
                      {w.subject}
                    </h5>
                    <p className="text-neutral-600 font-medium mt-2 leading-relaxed">
                      {w.details}
                    </p>

                    {userRole === 'admin' && (
                      <button
                        onClick={() => onResolveClick(w)}
                        className="mt-4 flex items-center gap-1.5 rounded-none border-2 border-black bg-white hover:bg-neutral-50 font-bold px-3 py-1.5 text-[9px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
                      >
                        <RefreshCw className="h-3 w-3 shrink-0 text-black stroke-2" />
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
