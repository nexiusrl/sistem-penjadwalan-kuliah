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
  loading?: boolean;
}

// Skeleton placeholder for the calendar grid while data is loading
function CalendarSkeleton() {
  const skeletonDays = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
  const cardHeights = [
    ['h-24', 'h-20', 'h-28'],
    ['h-28', 'h-24'],
    ['h-20', 'h-28', 'h-24'],
    ['h-24', 'h-20'],
    ['h-28', 'h-24', 'h-20'],
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/60">
        <div>
          <div className="animate-pulse rounded-md bg-slate-100 h-3 w-32 mb-2" />
          <div className="animate-pulse rounded-md bg-slate-100 h-6 w-52" />
        </div>
        <div className="animate-pulse rounded-xl bg-slate-100 h-10 w-40" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-5">
        {skeletonDays.map((day, i) => (
          <div key={day} className="flex flex-col rounded-2xl border border-slate-200/60 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-3.5 flex items-center justify-between rounded-t-2xl">
              <div className="animate-pulse rounded-md bg-slate-200 h-3.5 w-14" />
              <div className="animate-pulse rounded-full bg-slate-100 h-5 w-5" />
            </div>
            <div className="flex flex-1 flex-col gap-3 p-3 min-h-[260px]">
              {cardHeights[i].map((h, j) => (
                <div key={j} className={`animate-pulse rounded-xl bg-slate-50 border border-slate-100 ${h} w-full`} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
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
  loading = false,
}: CalendarGridProps) {
  const [selectedEvent, setSelectedEvent] = useState<Schedule | null>(null);

  // Show skeleton while data is loading
  if (loading) {
    return <CalendarSkeleton />;
  }

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200">
        <div>
          <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
            01 // Kalender Distribusi
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-1 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" strokeWidth={2} />
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
            className="flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-5 py-3 text-sm font-semibold text-white shadow-primary active:scale-[0.98] transition-all duration-300 cursor-pointer"
          >
            <PlusCircle className="h-5 w-5" strokeWidth={2} />
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
              className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-md"
            >
              {/* Day Header */}
              <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-4 py-4 flex items-center justify-between rounded-t-2xl">
                <span className="font-bold text-sm text-slate-800">
                  {day}
                </span>
                <span className="text-xs font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                  {events.length}
                </span>
              </div>

              {/* Day Events Column */}
              <div className="flex flex-1 flex-col gap-3 p-3 min-h-[280px]">
                {events.length === 0 ? (
                  <div className="my-auto flex flex-col items-center justify-center p-4 text-center text-slate-400">
                    <Clock className="h-8 w-8 mb-2 text-slate-300" strokeWidth={1.5} />
                    <span className="text-xs font-semibold text-slate-400">
                      Kosong
                    </span>
                  </div>
                ) : (
                  events.map((evt) => {
                    let cardBorder = 'border-l-4 border-l-primary';
                    let cardBg = 'bg-white hover:bg-primary/5';

                    if (evt.status === 'hard-conflict') {
                      cardBorder = 'border-l-4 border-l-rose-500';
                      cardBg = 'bg-rose-50/50 hover:bg-rose-50';
                    } else if (evt.status === 'soft-warning') {
                      cardBorder = 'border-l-4 border-l-amber-500';
                      cardBg = 'bg-amber-50/50 hover:bg-amber-50';
                    }

                    return (
                      <div
                        key={evt.id}
                        onClick={() => setSelectedEvent(evt)}
                        className={`group cursor-pointer rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 active:scale-[0.98] ${cardBorder} ${cardBg}`}
                      >
                        <h3 className="font-bold text-sm leading-snug text-slate-900 group-hover:text-primary transition-colors">
                           {evt.subject}
                        </h3>

                        <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                          <div className="flex items-center gap-2 font-semibold text-primary">
                            <Clock className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={2} />
                            <span>{evt.timeSlot}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={2} />
                            <span className="truncate">{evt.lecturer}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={2} />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Detail Kelas // {selectedEvent.code}
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  {selectedEvent.subject}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="rounded-lg border border-slate-200 p-2 hover:bg-slate-50 text-slate-500 hover:text-slate-700 active:scale-95 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>

            {/* Event Info Details */}
            <div className="my-6 space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <User className="h-5 w-5 text-primary" strokeWidth={2} />
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Dosen Pengampu</div>
                  <div className="text-slate-900 font-semibold">{selectedEvent.lecturer}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" strokeWidth={2} />
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Lokasi Ruang</div>
                  <div className="text-slate-900 font-semibold">Ruangan {selectedEvent.room}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" strokeWidth={2} />
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Hari & Jam</div>
                  <div className="text-primary font-semibold">
                    {selectedEvent.day}, {selectedEvent.timeSlot}
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  {selectedEvent.status === 'hard-conflict' ? (
                    <AlertCircle className="h-5 w-5 text-rose-500" strokeWidth={2} />
                  ) : selectedEvent.status === 'soft-warning' ? (
                    <AlertTriangle className="h-5 w-5 text-amber-500" strokeWidth={2} />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-emerald-500" strokeWidth={2} />
                  )}
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Status Alokasi</div>
                  <div className="mt-1">
                    {selectedEvent.status === 'hard-conflict' ? (
                      <span className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">
                        Bentrok Hard Constraint
                      </span>
                    ) : selectedEvent.status === 'soft-warning' ? (
                      <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">
                        Optimasi Warning
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                        Jadwal Valid
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Error Detail Notice */}
            {selectedEvent.details && (
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" strokeWidth={2} />
                <span>{selectedEvent.details}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
              <button
                onClick={() => setSelectedEvent(null)}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
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
                  className="flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-5 py-2.5 text-sm font-semibold text-white shadow-primary active:scale-95 transition-all duration-300 cursor-pointer"
                >
                  <Edit3 className="h-4 w-4" strokeWidth={2} />
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
