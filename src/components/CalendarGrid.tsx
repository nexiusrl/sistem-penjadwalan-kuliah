import React, { useState } from 'react';
import { Schedule, Lecturer, Room, Subject } from '@/lib/db';
import { Calendar, User, MapPin, Clock, Edit3, X, PlusCircle, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

interface CalendarGridProps {
  schedules: Schedule[];
  dosen: Lecturer[];
  ruangan: Room[];
  matakuliah: Subject[];
  userRole: 'admin' | 'dosen' | 'mahasiswa';
  userName: string;
  onRefresh: () => void;
  onAddScheduleClick: () => void;
  openEditModal: (sched: Schedule) => void;
}

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

export default function CalendarGrid({
  schedules,
  dosen,
  ruangan,
  matakuliah,
  userRole,
  userName,
  onRefresh,
  onAddScheduleClick,
  openEditModal,
}: CalendarGridProps) {
  const [selectedEvent, setSelectedEvent] = useState<Schedule | null>(null);

  const getFilteredEvents = (day: string) => {
    let events = schedules.filter((s) => s.day === day);
    if (userRole === 'dosen') {
      events = events.filter(
        (s) => s.lecturer.trim().toLowerCase() === userName.trim().toLowerCase()
      );
    }
    return events.sort((a, b) => {
      const timeA = (a.timeSlot || '').split(' - ')[0] || '';
      const timeB = (b.timeSlot || '').split(' - ')[0] || '';
      return timeA.localeCompare(timeB);
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Calendar Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/60">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 font-bold">
            01 // Kalender Distribusi
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5 flex items-center gap-2">
            <Calendar className="h-5.5 w-5.5 text-blue-600" strokeWidth={1.5} />
            <span>
              {userRole === 'admin'
                ? 'Distribusi Jadwal Kuliah'
                : userRole === 'dosen'
                ? 'Jadwal Mengajar Dosen'
                : 'Jadwal Perkuliahan Mahasiswa'}
            </span>
          </h2>
        </div>

        {userRole === 'admin' && (
          <button
            onClick={onAddScheduleClick}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-xs font-bold text-white shadow-[0_4px_12px_rgba(37,99,235,0.15)] active:scale-[0.98] transition-all duration-300 cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" strokeWidth={1.5} />
            <span>Tambah Jadwal Kuliah</span>
          </button>
        )}
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-5">
        {DAYS.map((day) => {
          const events = getFilteredEvents(day);

          return (
            <div
              key={day}
              className="flex flex-col rounded-2xl border border-slate-200/60 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.02)]"
            >
              {/* Day Header */}
              <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-3.5 flex items-center justify-between rounded-t-2xl">
                <span className="font-bold text-xs text-slate-800">
                  {day}
                </span>
                <span className="font-mono text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">
                  {events.length}
                </span>
              </div>

              {/* Day Events Column */}
              <div className="flex flex-1 flex-col gap-3 p-3 min-h-[260px]">
                {events.length === 0 ? (
                  <div className="my-auto flex flex-col items-center justify-center p-4 text-center text-slate-400">
                    <Clock className="h-7 w-7 stroke-[1.2] mb-2 opacity-50 text-slate-500" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      Kosong
                    </span>
                  </div>
                ) : (
                  events.map((evt) => {
                    let cardBorder = 'border-l-2 border-l-blue-600';
                    let cardBg = 'bg-white hover:bg-blue-50/15';
                    
                    if (evt.status === 'hard-conflict') {
                      cardBorder = 'border-l-2 border-l-rose-500';
                      cardBg = 'bg-rose-50/20 hover:bg-rose-50/40';
                    } else if (evt.status === 'soft-warning') {
                      cardBorder = 'border-l-2 border-l-amber-500';
                      cardBg = 'bg-amber-50/20 hover:bg-amber-50/40';
                    }

                    return (
                      <div
                        key={evt.id}
                        onClick={() => setSelectedEvent(evt)}
                        className={`group cursor-pointer rounded-xl border border-slate-150 p-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_25px_rgba(37,99,235,0.06)] hover:-translate-y-[2px] transition-all duration-300 active:scale-[0.98] ${cardBorder} ${cardBg}`}
                      >
                        <h3 className="font-bold text-xs leading-snug text-slate-900 group-hover:text-blue-600 transition-colors">
                           {evt.subject}
                        </h3>
                        
                        <div className="mt-3 space-y-1 text-[10px] text-slate-500 font-mono font-semibold">
                          <div className="flex items-center gap-1.5 font-bold text-blue-600">
                            <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" strokeWidth={1.5} />
                            <span>{evt.timeSlot}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 shrink-0 text-slate-400" strokeWidth={1.5} />
                            <span className="truncate">{evt.lecturer}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" strokeWidth={1.5} />
                            <span>R. {evt.room}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-150">
              <div>
                <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Detail Kelas // {selectedEvent.code}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {selectedEvent.subject}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50 text-slate-500 active:scale-95 transition-all cursor-pointer"
              >
                <X className="h-4.5 w-4.5" strokeWidth={1.5} />
              </button>
            </div>

            {/* Event Info Details */}
            <div className="my-5 space-y-4 text-xs font-mono font-bold">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 border border-slate-150">
                  <User className="h-4 w-4 text-slate-600" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Dosen Pengampu</div>
                  <div className="text-slate-800 font-bold text-xs">{selectedEvent.lecturer}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 border border-slate-150">
                  <MapPin className="h-4 w-4 text-slate-600" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Lokasi Ruang</div>
                  <div className="text-slate-800 font-bold text-xs">Ruangan {selectedEvent.room}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 border border-slate-150">
                  <Clock className="h-4 w-4 text-slate-600" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Hari & Jam</div>
                  <div className="text-blue-600 font-bold text-xs">
                    {selectedEvent.day}, {selectedEvent.timeSlot}
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 border border-slate-150">
                  {selectedEvent.status === 'hard-conflict' ? (
                    <AlertCircle className="h-4 w-4 text-rose-500" strokeWidth={1.5} />
                  ) : selectedEvent.status === 'soft-warning' ? (
                    <AlertTriangle className="h-4 w-4 text-amber-500" strokeWidth={1.5} />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-emerald-500" strokeWidth={1.5} />
                  )}
                </div>
                <div>
                  <div className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Status Alokasi</div>
                  <div>
                    {selectedEvent.status === 'hard-conflict' ? (
                      <span className="inline-flex rounded-full border border-rose-200 bg-rose-50/50 px-2.5 py-0.5 text-[9px] font-bold uppercase text-rose-600">
                        Bentrok Hard Constraint
                      </span>
                    ) : selectedEvent.status === 'soft-warning' ? (
                      <span className="inline-flex rounded-full border border-amber-200 bg-amber-50/50 px-2.5 py-0.5 text-[9px] font-bold uppercase text-amber-600">
                        Optimasi Warning
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50/50 px-2.5 py-0.5 text-[9px] font-bold uppercase text-emerald-600">
                        Jadwal Valid
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Error Detail Notice */}
            {selectedEvent.details && (
              <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50/50 p-3.5 text-xs font-mono text-amber-800">
                <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5 text-amber-600" strokeWidth={1.5} />
                <span>{selectedEvent.details}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-2.5 border-t border-slate-150 pt-4">
              <button
                onClick={() => setSelectedEvent(null)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
              >
                Tutup
              </button>
              {userRole === 'admin' && (
                <button
                  onClick={() => {
                    const evt = selectedEvent;
                    setSelectedEvent(null);
                    openEditModal(evt);
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 active:scale-95 transition-all duration-300 cursor-pointer shadow-sm"
                >
                  <Edit3 className="h-3.5 w-3.5" strokeWidth={1.5} />
                  <span>Edit Jadwal</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
