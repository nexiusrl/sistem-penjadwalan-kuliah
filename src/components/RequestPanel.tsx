import React, { useState, useEffect } from 'react';
import { Schedule, ChangeRequest } from '@/lib/db';
import { Calendar, User, Clock, AlertTriangle, CheckCircle, XCircle, FileText, Send, Loader2 } from 'lucide-react';

interface RequestPanelProps {
  schedules: Schedule[];
  requests: ChangeRequest[];
  userRole: 'admin' | 'dosen' | 'mahasiswa';
  userName: string;
  onRefresh: () => void;
}

const HOURS = Array.from({ length: 16 }, (_, i) => String(i + 7).padStart(2, '0')); // 07 to 22
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0')); // 00 to 55

export default function RequestPanel({
  schedules,
  requests,
  userRole,
  userName,
  onRefresh,
}: RequestPanelProps) {
  // Form states
  const [subject, setSubject] = useState('');
  const [fromTime, setFromTime] = useState('');
  const [toDate, setToDate] = useState('');
  const [startHour, setStartHour] = useState('');
  const [startMinute, setStartMinute] = useState('');
  const [endHour, setEndHour] = useState('');
  const [endMinute, setEndMinute] = useState('');
  const [reason, setReason] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Admin action loading states
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Filter unique schedules for the dropdown
  const uniqueSchedules = React.useMemo(() => {
    let list = schedules;
    if (userRole === 'dosen') {
      list = schedules.filter(
        (s) => s.lecturer.trim().toLowerCase() === userName.trim().toLowerCase()
      );
    }
    
    // De-duplicate schedules
    const seen = new Set();
    return list.filter((s) => {
      const key = `${s.subject}|${s.day}|${s.timeSlot}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [schedules, userRole, userName]);

  // Update fromTime when subject changes
  const handleSubjectChange = (subjectName: string) => {
    setSubject(subjectName);
    const selected = uniqueSchedules.find((s) => s.subject === subjectName);
    if (selected) {
      setFromTime(`${selected.day}, ${selected.timeSlot}`);
    } else {
      setFromTime('');
    }
  };

  // Filter requests history list
  const filteredRequests = React.useMemo(() => {
    if (userRole === 'dosen') {
      return requests.filter(
        (r) => r.lecturer.trim().toLowerCase() === userName.trim().toLowerCase()
      );
    }
    return requests;
  }, [requests, userRole, userName]);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!subject || !fromTime || !toDate || !startHour || !startMinute || !endHour || !endMinute || !reason.trim()) {
      setError('Semua form wajib diisi.');
      return;
    }

    // Parse day name from selected date
    const [year, month, day] = toDate.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const dayName = dayNames[dateObj.getDay()];

    if (dateObj.getDay() === 0 || dateObj.getDay() === 6) {
      setError('Jadwal perkuliahan hanya tersedia pada hari kerja (Senin - Jumat).');
      return;
    }

    const startTimeVal = `${startHour}:${startMinute}`;
    const endTimeVal = `${endHour}:${endMinute}`;

    if (startTimeVal >= endTimeVal) {
      setError('Jam mulai harus lebih awal dari jam selesai.');
      return;
    }

    const toTimeStr = `${dayName}, ${startTimeVal} - ${endTimeVal}`;

    setLoading(true);
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': userRole,
          'X-User-Email': localStorage.getItem('userEmail') || '',
        },
        body: JSON.stringify({
          lecturer: userName,
          subject,
          fromTime,
          toTime: toTimeStr,
          reason,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Gagal mengirim permohonan.');
      }

      setSuccess('Permohonan perpindahan jadwal berhasil dikirim.');
      
      // Reset form
      setSubject('');
      setFromTime('');
      setToDate('');
      setStartHour('');
      setStartMinute('');
      setEndHour('');
      setEndMinute('');
      setReason('');
      
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestStatus = async (id: number, status: 'approved' | 'rejected') => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': userRole,
          'X-User-Email': localStorage.getItem('userEmail') || '',
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Gagal memproses permohonan.');
      }

      onRefresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
      {/* Form Section (Only for Dosen) */}
      {userRole === 'dosen' && (
        <div className="xl:col-span-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 pb-2 border-b border-slate-100 dark:border-slate-800 mb-3 flex items-center gap-2">
            <Send className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400" />
            <span>Ajukan Perubahan Jadwal</span>
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
            Gunakan form ini untuk mengajukan pergeseran jam atau ruangan mengajar dosen.
          </p>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-600 dark:bg-rose-950/30 dark:text-rose-450 animate-in fade-in">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-450 animate-in fade-in">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmitRequest} className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Mata Kuliah
              </label>
              <select
                value={subject}
                onChange={(e) => handleSubjectChange(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950"
              >
                <option value="" disabled>
                  Pilih mata kuliah & jadwal...
                </option>
                {uniqueSchedules.map((s) => (
                  <option key={s.id} value={s.subject}>
                    {s.subject} ({s.day}, {s.timeSlot})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Dosen Pemohon
              </label>
              <div className="relative">
                <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={userName}
                  disabled
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pr-4 pl-9 text-xs outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Jadwal Asal
              </label>
              <div className="relative">
                <Clock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={fromTime}
                  readOnly
                  disabled
                  placeholder="Pilih mata kuliah untuk memuat jadwal asal"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pr-4 pl-9 text-xs outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Tanggal Usulan Baru
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 py-2 px-3 text-xs outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Jam Mulai Baru
                </label>
                <div className="flex gap-1">
                  <select
                    value={startHour}
                    onChange={(e) => setStartHour(e.target.value)}
                    required
                    className="w-1/2 rounded-lg border border-slate-200 py-2 px-1 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
                  >
                    <option value="" disabled>
                      Jam
                    </option>
                    {HOURS.map((h) => (
                      <option key={`sh-${h}`} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                  <select
                    value={startMinute}
                    onChange={(e) => setStartMinute(e.target.value)}
                    required
                    className="w-1/2 rounded-lg border border-slate-200 py-2 px-1 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
                  >
                    <option value="" disabled>
                      Mnt
                    </option>
                    {MINUTES.map((m) => (
                      <option key={`sm-${m}`} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Jam Selesai Baru
                </label>
                <div className="flex gap-1">
                  <select
                    value={endHour}
                    onChange={(e) => setEndHour(e.target.value)}
                    required
                    className="w-1/2 rounded-lg border border-slate-200 py-2 px-1 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
                  >
                    <option value="" disabled>
                      Jam
                    </option>
                    {HOURS.map((h) => (
                      <option key={`eh-${h}`} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                  <select
                    value={endMinute}
                    onChange={(e) => setEndMinute(e.target.value)}
                    required
                    className="w-1/2 rounded-lg border border-slate-200 py-2 px-1 text-xs outline-none dark:border-slate-800 dark:bg-slate-950"
                  >
                    <option value="" disabled>
                      Mnt
                    </option>
                    {MINUTES.map((m) => (
                      <option key={`em-${m}`} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Alasan Perubahan
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                required
                placeholder="Alasan pemindahan jadwal..."
                className="w-full rounded-lg border border-slate-200 py-2.5 px-3 text-xs outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/15 hover:bg-indigo-700 disabled:opacity-75 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Mengirim...</span>
                </>
              ) : (
                <span>Kirim Permohonan</span>
              )}
            </button>
          </form>
        </div>
      )}

      {/* History Section */}
      <div
        className={`${
          userRole === 'dosen' ? 'xl:col-span-7' : 'xl:col-span-12'
        } rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900`}
      >
        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200 pb-2 border-b border-slate-100 dark:border-slate-800 mb-4 flex items-center gap-2">
          <FileText className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400" />
          <span>Riwayat Pengajuan Pergeseran Jadwal</span>
        </h3>

        {filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400 dark:text-slate-650">
            <Clock className="h-10 w-10 stroke-1 mb-2 opacity-50" />
            <p className="text-xs font-medium">Belum ada riwayat permohonan masuk.</p>
          </div>
        ) : (
          <div className="space-y-3.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredRequests.map((req) => (
              <div
                key={req.id}
                className="rounded-lg border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/20"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
                  <span className="font-bold text-xs text-indigo-700 dark:text-indigo-455">
                    {req.subject}
                  </span>
                  <div>
                    {req.status === 'approved' ? (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-450">
                        Disetujui
                      </span>
                    ) : req.status === 'rejected' ? (
                      <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:bg-rose-950/20 dark:text-rose-455">
                        Ditolak
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:bg-amber-950/20 dark:text-amber-455">
                        Menunggu
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-xs space-y-1 text-slate-600 dark:text-slate-400">
                  <div>
                    Dosen Pemohon: <span className="font-semibold text-slate-850 dark:text-slate-300">{req.lecturer}</span>
                  </div>
                  <div>
                    Pengajuan geser jadwal dari <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[11px] font-medium text-slate-700 dark:text-slate-300">{req.fromTime}</code> ke <code className="bg-indigo-50 dark:bg-indigo-950/30 px-1 py-0.5 rounded text-[11px] font-medium text-indigo-700 dark:text-indigo-350">{req.toTime}</code>.
                  </div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 leading-relaxed">
                    Alasan: &ldquo;{req.reason}&rdquo;
                  </div>
                </div>

                {userRole === 'admin' && req.status === 'pending' && (
                  <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-2.5 mt-2.5">
                    <button
                      onClick={() => handleRequestStatus(req.id, 'rejected')}
                      disabled={actionLoading !== null}
                      className="rounded border border-rose-200 text-rose-600 font-bold px-3 py-1 text-[10px] hover:bg-rose-50 hover:text-rose-700 transition-colors disabled:opacity-50 dark:border-rose-900/30 dark:hover:bg-rose-950/20"
                    >
                      {actionLoading === req.id ? 'Memproses' : 'Tolak'}
                    </button>
                    <button
                      onClick={() => handleRequestStatus(req.id, 'approved')}
                      disabled={actionLoading !== null}
                      className="rounded bg-indigo-650 text-white font-bold px-3 py-1 text-[10px] hover:bg-indigo-700 transition-colors disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                    >
                      {actionLoading === req.id ? 'Memproses' : 'Setujui'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
