import React, { useState } from 'react';
import { Schedule, Lecturer, Room, Subject } from '@/lib/db';
import { Calendar, User, MapPin, Clock, Edit3, Trash2, X, PlusCircle, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

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

  // Filter events based on role
  const getFilteredEvents = (day: string) => {
    let events = schedules.filter((s) => s.day === day);
    if (userRole === 'dosen') {
      events = events.filter(
        (s) => s.lecturer.trim().toLowerCase() === userName.trim().toLowerCase()
      );
    }
    // Sort chronologically by start time
    return events.sort((a, b) => {
      const timeA = (a.timeSlot || '').split(' - ')[0] || '';
      const timeB = (b.timeSlot || '').split(' - ')[0] || '';
      return timeA.localeCompare(timeB);
    });
  };

  const handleCardClick = (event: Schedule) => {
    setSelectedEvent(event);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Calendar Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="h-5.5 w-5.5 text-indigo-600 dark:text-indigo-400" />
            <span>
              {userRole === 'admin'
                ? 'Distribusi Jadwal Kuliah'
                : userRole === 'dosen'
                ? 'Jadwal Mengajar Dosen'
                : 'Jadwal Perkuliahan Mahasiswa'}
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Menampilkan seluruh sebaran jam mata kuliah Prodi.
          </p>
        </div>

        {userRole === 'admin' && (
          <button
            onClick={onAddScheduleClick}
            className="flex items-center gap-1.5 self-start sm:self-center rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/10 hover:bg-indigo-700 transition-all dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:shadow-none"
          >
            <PlusCircle className="h-4.5 w-4.5" />
            <span>Tambah Jadwal Kuliah</span>
          </button>
        )}
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {DAYS.map((day) => {
          const events = getFilteredEvents(day);

          return (
            <div
              key={day}
              className="flex flex-col rounded-xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              {/* Day Header */}
              <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-3 text-center dark:border-slate-800 dark:bg-slate-900/50">
                <span className="font-bold text-sm text-slate-700 dark:text-slate-300">
                  {day}
                </span>
                <span className="ml-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  {events.length}
                </span>
              </div>

              {/* Day Events Column */}
              <div className="flex flex-1 flex-col gap-3 p-3 min-h-[220px]">
                {events.length === 0 ? (
                  <div className="my-auto flex flex-col items-center justify-center p-4 text-center text-slate-400 dark:text-slate-600">
                    <Clock className="h-8 w-8 stroke-1 mb-2 opacity-50" />
                    <span className="text-xs font-medium">Tidak ada perkuliahan</span>
                  </div>
                ) : (
                  events.map((evt) => {
                    let cardBorder = 'border-l-4 border-l-emerald-500 dark:border-l-emerald-600';
                    let cardBg = 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-950/40 dark:hover:bg-slate-950/70';
                    
                    if (evt.status === 'hard-conflict') {
                      cardBorder = 'border-l-4 border-l-rose-500 dark:border-l-rose-600';
                      cardBg = 'bg-rose-50/40 hover:bg-rose-50/70 border-rose-100/50 dark:bg-rose-950/10 dark:hover:bg-rose-950/20 dark:border-rose-900/20';
                    } else if (evt.status === 'soft-warning') {
                      cardBorder = 'border-l-4 border-l-amber-500 dark:border-l-amber-600';
                      cardBg = 'bg-amber-50/30 hover:bg-amber-50/60 border-amber-100/50 dark:bg-amber-950/10 dark:hover:bg-amber-950/20 dark:border-amber-900/20';
                    }

                    return (
                      <div
                        key={evt.id}
                        onClick={() => handleCardClick(evt)}
                        className={`group cursor-pointer rounded-lg border border-slate-150 p-3.5 transition-all shadow-2xs hover:shadow-xs ${cardBorder} ${cardBg} dark:border-slate-800`}
                      >
                        <h3 className="font-bold text-xs leading-snug text-slate-900 group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400 transition-colors">
                          {evt.subject}
                        </h3>
                        <div className="mt-2 space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400">
                            <Clock className="h-3 w-3 shrink-0" />
                            <span>{evt.timeSlot}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3 shrink-0" />
                            <span className="truncate">{evt.lecturer}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span>{evt.room}</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200 dark:border-slate-800 dark:bg-slate-900">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Detail Kelas
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedEvent.subject}
                </h3>
                <code className="mt-1 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500 dark:bg-slate-850 dark:text-slate-400">
                  Kode: {selectedEvent.code}
                </code>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Event Info Details */}
            <div className="my-5 space-y-3.5 border-t border-b border-slate-100 py-4 dark:border-slate-800 text-sm">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  <User className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Dosen Pengampu</div>
                  <div className="font-semibold text-slate-700 dark:text-slate-350">{selectedEvent.lecturer}</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  <MapPin className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Lokasi Ruang</div>
                  <div className="font-semibold text-slate-700 dark:text-slate-350">Ruangan {selectedEvent.room}</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  <Clock className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Hari & Jam</div>
                  <div className="font-semibold text-indigo-650 dark:text-indigo-400">
                    {selectedEvent.day}, {selectedEvent.timeSlot}
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  {selectedEvent.status === 'hard-conflict' ? (
                    <AlertCircle className="h-4.5 w-4.5 text-rose-500" />
                  ) : selectedEvent.status === 'soft-warning' ? (
                    <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
                  ) : (
                    <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
                  )}
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Status Alokasi</div>
                  <div>
                    {selectedEvent.status === 'hard-conflict' ? (
                      <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-600 dark:bg-rose-950/20 dark:text-rose-450">
                        Bentrok Hard Constraint
                      </span>
                    ) : selectedEvent.status === 'soft-warning' ? (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:bg-amber-950/20 dark:text-amber-450">
                        Optimasi Warning
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-450">
                        Jadwal Valid
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Error Detail Notice */}
            {selectedEvent.details && (
              <div className="mb-5 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-700 dark:bg-amber-950/20 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{selectedEvent.details}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedEvent(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold hover:bg-slate-50 transition-colors dark:border-slate-800 dark:hover:bg-slate-800"
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
                  className="flex items-center gap-1 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors dark:bg-indigo-500 dark:hover:bg-indigo-600"
                >
                  <Edit3 className="h-3.5 w-3.5" />
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
