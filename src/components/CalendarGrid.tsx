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
    <div className="flex flex-col gap-8">
      {/* Calendar Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 border-b-4 border-black pb-6">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-neutral-500 font-bold">
            01 // Kalender Distribusi
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold italic tracking-tight text-neutral-900 mt-1 flex items-center gap-3">
            <Calendar className="h-7 w-7 stroke-2 text-black" />
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
            className="flex items-center gap-2 rounded-none border-2 border-black bg-neutral-900 px-5 py-2.5 text-xs font-bold text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-800 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all shrink-0 cursor-pointer"
          >
            <PlusCircle className="h-4.5 w-4.5" />
            <span>TAMBAH JADWAL KULIAH</span>
          </button>
        )}
      </div>

      {/* Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-6">
        {DAYS.map((day) => {
          const events = getFilteredEvents(day);

          return (
            <div
              key={day}
              className="flex flex-col rounded-none border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              {/* Day Header */}
              <div className="border-b-2 border-black bg-neutral-50 px-4 py-3 text-center flex items-center justify-between">
                <span className="font-display font-extrabold italic text-sm text-neutral-900">
                  {day}
                </span>
                <span className="font-mono text-xs font-bold border border-black bg-white px-2 py-0.5">
                  {String(events.length).padStart(2, '0')}
                </span>
              </div>

              {/* Day Events Column */}
              <div className="flex flex-1 flex-col gap-4 p-4 min-h-[280px]">
                {events.length === 0 ? (
                  <div className="my-auto flex flex-col items-center justify-center p-4 text-center text-neutral-400">
                    <Clock className="h-8 w-8 stroke-1.5 mb-2 opacity-40 text-black" />
                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-450">
                      Kosong
                    </span>
                  </div>
                ) : (
                  events.map((evt) => {
                    let cardBorder = 'border-l-4 border-l-emerald-500';
                    let cardBg = 'bg-white hover:bg-neutral-50';
                    
                    if (evt.status === 'hard-conflict') {
                      cardBorder = 'border-l-4 border-l-rose-500';
                      cardBg = 'bg-rose-50/30 hover:bg-rose-50/50';
                    } else if (evt.status === 'soft-warning') {
                      cardBorder = 'border-l-4 border-l-amber-500';
                      cardBg = 'bg-amber-50/30 hover:bg-amber-50/50';
                    }

                    return (
                      <div
                        key={evt.id}
                        onClick={() => setSelectedEvent(evt)}
                        className={`group cursor-pointer rounded-none border-2 border-black p-4 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${cardBorder} ${cardBg}`}
                      >
                        <h3 className="font-display font-bold italic text-sm leading-tight text-neutral-900 group-hover:text-indigo-650 transition-colors">
                          {evt.subject}
                        </h3>
                        
                        <div className="mt-3.5 space-y-1.5 text-[11px] text-neutral-600 font-mono font-medium">
                          <div className="flex items-center gap-1.5 font-bold text-indigo-750">
                            <Clock className="h-3.5 w-3.5 shrink-0 text-black stroke-2" />
                            <span>{evt.timeSlot}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 shrink-0 text-black stroke-2" />
                            <span className="truncate">{evt.lecturer}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-black stroke-2" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-none border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b-2 border-black pb-4">
              <div>
                <span className="font-mono text-xs font-bold text-neutral-500 uppercase tracking-widest">
                  Detail Kelas // {selectedEvent.code}
                </span>
                <h3 className="text-xl font-display font-bold italic text-neutral-900 mt-1">
                  {selectedEvent.subject}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="rounded-none border-2 border-black p-1 hover:bg-neutral-100 text-black active:translate-x-0.5 active:translate-y-0.5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Event Info Details */}
            <div className="my-5 space-y-4 text-xs font-mono font-medium">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-none border-2 border-black bg-neutral-50">
                  <User className="h-4.5 w-4.5 text-black" />
                </div>
                <div>
                  <div className="text-[10px] text-neutral-450 uppercase font-bold">Dosen Pengampu</div>
                  <div className="text-neutral-900 font-bold text-xs">{selectedEvent.lecturer}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-none border-2 border-black bg-neutral-50">
                  <MapPin className="h-4.5 w-4.5 text-black" />
                </div>
                <div>
                  <div className="text-[10px] text-neutral-450 uppercase font-bold">Lokasi Ruang</div>
                  <div className="text-neutral-900 font-bold text-xs">Ruangan {selectedEvent.room}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-none border-2 border-black bg-neutral-50">
                  <Clock className="h-4.5 w-4.5 text-black" />
                </div>
                <div>
                  <div className="text-[10px] text-neutral-450 uppercase font-bold">Hari & Jam</div>
                  <div className="text-indigo-650 font-bold text-xs">
                    {selectedEvent.day}, {selectedEvent.timeSlot}
                  </div>
                </div>
              </div>

              {/* Status Section */}
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-none border-2 border-black bg-neutral-50">
                  {selectedEvent.status === 'hard-conflict' ? (
                    <AlertCircle className="h-4.5 w-4.5 text-rose-500" />
                  ) : selectedEvent.status === 'soft-warning' ? (
                    <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
                  ) : (
                    <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
                  )}
                </div>
                <div>
                  <div className="text-[10px] text-neutral-450 uppercase font-bold">Status Alokasi</div>
                  <div>
                    {selectedEvent.status === 'hard-conflict' ? (
                      <span className="inline-flex rounded-none border border-rose-500 bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase text-rose-700">
                        Bentrok Hard Constraint
                      </span>
                    ) : selectedEvent.status === 'soft-warning' ? (
                      <span className="inline-flex rounded-none border border-amber-500 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700">
                        Optimasi Warning
                      </span>
                    ) : (
                      <span className="inline-flex rounded-none border border-emerald-500 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
                        Jadwal Valid
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Error Detail Notice */}
            {selectedEvent.details && (
              <div className="mb-5 flex items-start gap-2 rounded-none border-2 border-black bg-amber-50 p-3 text-xs font-mono text-amber-900">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-black" />
                <span>{selectedEvent.details}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 border-t-2 border-black pt-4">
              <button
                onClick={() => setSelectedEvent(null)}
                className="rounded-none border-2 border-black bg-white px-4 py-2 text-xs font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
              >
                TUTUP
              </button>
              {userRole === 'admin' && (
                <button
                  onClick={() => {
                    const evt = selectedEvent;
                    setSelectedEvent(null);
                    openEditModal(evt);
                  }}
                  className="flex items-center gap-1.5 rounded-none border-2 border-black bg-neutral-900 px-4 py-2 text-xs font-bold text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>EDIT JADWAL</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
