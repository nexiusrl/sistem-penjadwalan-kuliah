import React, { useState } from 'react';
import { Schedule, ChangeRequest } from '@/lib/db';
import { Calendar, User, Clock, AlertTriangle, CheckCircle, FileText, Send, Loader2 } from 'lucide-react';

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
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const uniqueSchedules = React.useMemo(() => {
    let list = schedules;
    if (userRole === 'dosen') {
      list = schedules.filter(
        (s) => s.lecturer.trim().toLowerCase() === userName.trim().toLowerCase()
      );
    }
    const seen = new Set();
    return list.filter((s) => {
      const key = `${s.subject}|${s.day}|${s.timeSlot}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [schedules, userRole, userName]);

  const handleSubjectChange = (subjectName: string) => {
    setSubject(subjectName);
    const selected = uniqueSchedules.find((s) => s.subject === subjectName);
    if (selected) {
      setFromTime(`${selected.day}, ${selected.timeSlot}`);
    } else {
      setFromTime('');
    }
  };

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
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
      {/* Form Section (Only for Dosen) */}
      {userRole === 'dosen' && (
        <div className="xl:col-span-5 rounded-none border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="font-display font-extrabold italic text-base text-neutral-900 pb-3 border-b-2 border-black mb-4 flex items-center gap-2">
            <Send className="h-5 w-5 text-black stroke-2" />
            <span>Ajukan Pergeseran Jadwal</span>
          </h3>
          <p className="font-mono text-[10px] text-neutral-500 mb-5 leading-relaxed">
            Dosen dapat mengajukan relokasi jam kuliah mandiri di sini.
          </p>

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-none border-2 border-black bg-rose-50 p-3 text-xs font-mono text-rose-900 animate-in fade-in">
              <AlertTriangle className="h-4 w-4 shrink-0 text-black mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 flex items-start gap-2 rounded-none border-2 border-black bg-emerald-50 p-3 text-xs font-mono text-emerald-950 animate-in fade-in">
              <CheckCircle className="h-4 w-4 shrink-0 text-black mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmitRequest} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                Mata Kuliah
              </label>
              <select
                value={subject}
                onChange={(e) => handleSubjectChange(e.target.value)}
                required
                className="w-full rounded-none border-2 border-black py-2 px-3 text-xs font-mono bg-white outline-none focus:bg-neutral-50"
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
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                Dosen Pemohon
              </label>
              <div className="relative">
                <User className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-black stroke-2" />
                <input
                  type="text"
                  value={userName}
                  disabled
                  className="w-full rounded-none border-2 border-black bg-neutral-100 py-2.5 pr-4 pl-9 text-xs font-mono text-neutral-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                Jadwal Asal
              </label>
              <div className="relative">
                <Clock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-black stroke-2" />
                <input
                  type="text"
                  value={fromTime}
                  readOnly
                  disabled
                  placeholder="Pilih mata kuliah untuk memuat jadwal asal"
                  className="w-full rounded-none border-2 border-black bg-neutral-100 py-2.5 pr-4 pl-9 text-xs font-mono text-neutral-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                Tanggal Usulan Baru
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                required
                className="w-full rounded-none border-2 border-black py-2 px-3 text-xs font-mono bg-white outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                  Jam Mulai Baru
                </label>
                <div className="flex gap-1">
                  <select
                    value={startHour}
                    onChange={(e) => setStartHour(e.target.value)}
                    required
                    className="w-1/2 rounded-none border-2 border-black py-2 px-1 text-xs font-mono bg-white outline-none"
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
                    className="w-1/2 rounded-none border-2 border-black py-2 px-1 text-xs font-mono bg-white outline-none"
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
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                  Jam Selesai Baru
                </label>
                <div className="flex gap-1">
                  <select
                    value={endHour}
                    onChange={(e) => setEndHour(e.target.value)}
                    required
                    className="w-1/2 rounded-none border-2 border-black py-2 px-1 text-xs font-mono bg-white outline-none"
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
                    className="w-1/2 rounded-none border-2 border-black py-2 px-1 text-xs font-mono bg-white outline-none"
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
              <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                Alasan Perubahan
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                required
                placeholder="Alasan pemindahan jadwal..."
                className="w-full rounded-none border-2 border-black py-2.5 px-3 text-xs font-mono bg-white outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-none border-2 border-black bg-black py-2.5 text-xs font-mono font-bold text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>MENGIRIM...</span>
                </>
              ) : (
                <span>KIRIM PERMOHONAN</span>
              )}
            </button>
          </form>
        </div>
      )}

      {/* History Section */}
      <div
        className={`${
          userRole === 'dosen' ? 'xl:col-span-7' : 'xl:col-span-12'
        } rounded-none border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}
      >
        <h3 className="font-display font-extrabold italic text-base text-neutral-900 pb-3 border-b-2 border-black mb-5 flex items-center gap-2">
          <FileText className="h-5 w-5 text-black stroke-2" />
          <span>Riwayat Pengajuan Pergeseran Jadwal</span>
        </h3>

        {filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-neutral-400">
            <Clock className="h-10 w-10 stroke-1.5 mb-3 opacity-30 text-black" />
            <p className="font-mono text-xs font-bold text-neutral-500">Belum ada riwayat permohonan masuk.</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
            {filteredRequests.map((req) => (
              <div
                key={req.id}
                className="rounded-none border-2 border-black bg-white p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                <div className="flex items-center justify-between border-b border-black/10 pb-2 mb-2">
                  <span className="font-display font-bold italic text-sm text-indigo-750">
                    {req.subject}
                  </span>
                  <div>
                    {req.status === 'approved' ? (
                      <span className="inline-flex rounded-none border border-emerald-500 bg-emerald-50 px-2 py-0.5 text-[9px] font-mono font-bold uppercase text-emerald-700">
                        Disetujui
                      </span>
                    ) : req.status === 'rejected' ? (
                      <span className="inline-flex rounded-none border border-rose-500 bg-rose-50 px-2 py-0.5 text-[9px] font-mono font-bold uppercase text-rose-700">
                        Ditolak
                      </span>
                    ) : (
                      <span className="inline-flex rounded-none border border-amber-500 bg-amber-50 px-2 py-0.5 text-[9px] font-mono font-bold uppercase text-amber-700">
                        Menunggu
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-xs font-mono text-neutral-600 space-y-1.5 mt-3">
                  <div>
                    Dosen Pemohon: <span className="font-bold text-neutral-900">{req.lecturer}</span>
                  </div>
                  <div className="leading-relaxed">
                    Pengajuan geser jadwal dari <code className="bg-neutral-100 border border-black/10 px-1 py-0.5 rounded-sm font-semibold">{req.fromTime}</code> ke <code className="bg-indigo-50 border border-indigo-200 px-1 py-0.5 rounded-sm font-bold text-indigo-700">{req.toTime}</code>.
                  </div>
                  <div className="text-[10px] text-neutral-450 border-t border-black/5 pt-2 mt-2 leading-relaxed">
                    Alasan: &ldquo;{req.reason}&rdquo;
                  </div>
                </div>

                {userRole === 'admin' && req.status === 'pending' && (
                  <div className="flex justify-end gap-3 border-t-2 border-black pt-3 mt-3">
                    <button
                      onClick={() => handleRequestStatus(req.id, 'rejected')}
                      disabled={actionLoading !== null}
                      className="rounded-none border-2 border-black bg-white text-black font-mono font-bold px-3.5 py-1.5 text-[10px] hover:bg-rose-50 hover:text-rose-700 transition-colors disabled:opacity-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                    >
                      {actionLoading === req.id ? 'MEMPROSES' : 'TOLAK'}
                    </button>
                    <button
                      onClick={() => handleRequestStatus(req.id, 'approved')}
                      disabled={actionLoading !== null}
                      className="rounded-none border-2 border-black bg-black text-white font-mono font-bold px-3.5 py-1.5 text-[10px] hover:bg-neutral-800 transition-colors disabled:opacity-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                    >
                      {actionLoading === req.id ? 'MEMPROSES' : 'SETUJUI'}
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
