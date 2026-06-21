import React, { useState } from 'react';
import { Lecturer, Room, Subject } from '@/lib/db';
import { PlusCircle, Edit, Trash2, X, Users, BookOpen, Layers, Loader2 } from 'lucide-react';

interface MasterDataPanelProps {
  dosen: Lecturer[];
  ruangan: Room[];
  matakuliah: Subject[];
  userRole: 'admin' | 'dosen' | 'mahasiswa';
  onRefresh: () => void;
}

type SubTab = 'dosen' | 'ruang' | 'mk';

export default function MasterDataPanel({
  dosen,
  ruangan,
  matakuliah,
  userRole,
  onRefresh,
}: MasterDataPanelProps) {
  const [activeTab, setActiveTab] = useState<SubTab>('dosen');
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Form inputs
  const [dosenName, setDosenName] = useState('');
  const [dosenCode, setDosenCode] = useState('');
  const [dosenPref, setDosenPref] = useState('Bebas');

  const [ruangName, setRuangName] = useState('');
  const [ruangType, setRuangType] = useState('Teori');
  const [ruangCapacity, setRuangCapacity] = useState(40);

  const [mkName, setMkName] = useState('');
  const [mkCode, setMkCode] = useState('');
  const [mkSks, setMkSks] = useState(3);
  const [mkDay, setMkDay] = useState('Senin');
  const [mkTimeStart, setMkTimeStart] = useState('08:00');
  const [mkTimeEnd, setMkTimeEnd] = useState('10:30');

  const openAddModal = () => {
    setEditId(null);
    setDosenName('');
    setDosenCode('');
    setDosenPref('Bebas');
    setRuangName('');
    setRuangType('Teori');
    setRuangCapacity(40);
    setMkName('');
    setMkCode('');
    setMkSks(3);
    setMkDay('Senin');
    setMkTimeStart('08:00');
    setMkTimeEnd('10:30');
    setIsOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditId(item.id);
    if (activeTab === 'dosen') {
      const d = item as Lecturer;
      setDosenName(d.name);
      setDosenCode(d.code);
      setDosenPref(d.pref || 'Bebas');
    } else if (activeTab === 'ruang') {
      const r = item as Room;
      setRuangName(r.name);
      setRuangType(r.type);
      setRuangCapacity(r.capacity);
    } else if (activeTab === 'mk') {
      const m = item as Subject;
      setMkName(m.name);
      setMkCode(m.code);
      setMkSks(m.sks);
      setMkDay(m.day);
      if (m.timeSlot && m.timeSlot.includes(' - ')) {
        const parts = m.timeSlot.split(' - ');
        setMkTimeStart(parts[0]);
        setMkTimeEnd(parts[1]);
      } else {
        setMkTimeStart('08:00');
        setMkTimeEnd('10:30');
      }
    }
    setIsOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus item ini secara permanen?')) return;
    const endpoint = activeTab === 'dosen' ? 'dosen' : activeTab === 'ruang' ? 'ruangan' : 'matakuliah';
    try {
      const res = await fetch(`/api/${endpoint}/${id}`, {
        method: 'DELETE',
        headers: {
          'X-User-Role': userRole,
          'X-User-Email': localStorage.getItem('userEmail') || '',
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Gagal menghapus data.');
      }

      onRefresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const endpoint = activeTab === 'dosen' ? 'dosen' : activeTab === 'ruang' ? 'ruangan' : 'matakuliah';
    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `/api/${endpoint}/${editId}` : `/api/${endpoint}`;

    let payload: any = {};
    if (activeTab === 'dosen') {
      payload = {
        name: dosenName.trim(),
        code: dosenCode.trim().toUpperCase(),
        pref: dosenPref.trim()
      };
    } else if (activeTab === 'ruang') {
      payload = {
        name: ruangName.trim(),
        type: ruangType,
        capacity: Number(ruangCapacity)
      };
    } else if (activeTab === 'mk') {
      payload = {
        name: mkName.trim(),
        code: mkCode.trim().toUpperCase(),
        sks: Number(mkSks),
        day: mkDay,
        timeSlot: `${mkTimeStart} - ${mkTimeEnd}`
      };
    }

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': userRole,
          'X-User-Email': localStorage.getItem('userEmail') || '',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Gagal menyimpan data.');
      }

      setIsOpen(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Tab bar header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b-2 border-black pb-4">
        <div className="flex items-center gap-1.5 p-1 rounded-none border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <button
            onClick={() => setActiveTab('dosen')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-none text-xs font-mono font-bold transition-all ${
              activeTab === 'dosen'
                ? 'bg-black text-white'
                : 'text-neutral-500 hover:text-black'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>DATA DOSEN</span>
          </button>
          <button
            onClick={() => setActiveTab('ruang')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-none text-xs font-mono font-bold transition-all ${
              activeTab === 'ruang'
                ? 'bg-black text-white'
                : 'text-neutral-500 hover:text-black'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>DATA RUANGAN</span>
          </button>
          <button
            onClick={() => setActiveTab('mk')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-none text-xs font-mono font-bold transition-all ${
              activeTab === 'mk'
                ? 'bg-black text-white'
                : 'text-neutral-500 hover:text-black'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>MATA KULIAH</span>
          </button>
        </div>

        {userRole === 'admin' && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 rounded-none border-2 border-black bg-neutral-900 px-5 py-2.5 text-xs font-mono font-bold text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
          >
            <PlusCircle className="h-4.5 w-4.5" />
            <span>
              TAMBAH {activeTab === 'dosen' ? 'DOSEN' : activeTab === 'ruang' ? 'RUANGAN' : 'MATA KULIAH'}
            </span>
          </button>
        )}
      </div>

      {/* Main Table Panel */}
      <div className="rounded-none border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === 'dosen' && (
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b-2 border-black bg-neutral-50 text-neutral-900 uppercase font-bold tracking-wider">
                  <th className="px-5 py-4 w-24">Kode</th>
                  <th className="px-5 py-4 font-display font-bold italic text-sm">Nama Dosen</th>
                  <th className="px-5 py-4">Preferensi Hari</th>
                  {userRole === 'admin' && <th className="px-5 py-4 w-28 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                {dosen.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-neutral-450 font-bold">
                      Belum ada data Dosen.
                    </td>
                  </tr>
                ) : (
                  dosen.map((d) => (
                    <tr key={d.id} className="hover:bg-neutral-50">
                      <td className="px-5 py-4 font-bold text-neutral-900">{d.code}</td>
                      <td className="px-5 py-4 font-display font-extrabold italic text-neutral-900 text-sm">{d.name}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-none border-2 border-black px-2 py-0.5 text-[10px] font-bold ${
                          d.pref && d.pref !== 'Bebas' 
                            ? 'bg-indigo-50 text-indigo-700' 
                            : 'bg-white text-neutral-500'
                        }`}>
                          {d.pref || 'Bebas'}
                        </span>
                      </td>
                      {userRole === 'admin' && (
                        <td className="px-5 py-4 text-right space-x-2">
                          <button
                            onClick={() => openEditModal(d)}
                            className="inline-flex p-1.5 rounded-none border-2 border-black bg-white shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none text-black cursor-pointer"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(d.id)}
                            className="inline-flex p-1.5 rounded-none border-2 border-black bg-white shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'ruang' && (
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b-2 border-black bg-neutral-50 text-neutral-900 uppercase font-bold tracking-wider">
                  <th className="px-5 py-4">Nama Ruangan</th>
                  <th className="px-5 py-4 w-36">Tipe Ruangan</th>
                  <th className="px-5 py-4 w-36">Kapasitas Kursi</th>
                  {userRole === 'admin' && <th className="px-5 py-4 w-28 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                {ruangan.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-neutral-450 font-bold">
                      Belum ada data Ruangan.
                    </td>
                  </tr>
                ) : (
                  ruangan.map((r) => (
                    <tr key={r.id} className="hover:bg-neutral-50">
                      <td className="px-5 py-4 font-bold text-neutral-900">{r.name}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-none border-2 border-black px-2 py-0.5 text-[10px] font-bold ${
                          r.type === 'Praktikum' 
                            ? 'bg-amber-50 text-amber-700' 
                            : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {r.type}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-neutral-700 font-bold">{r.capacity} Kursi</td>
                      {userRole === 'admin' && (
                        <td className="px-5 py-4 text-right space-x-2">
                          <button
                            onClick={() => openEditModal(r)}
                            className="inline-flex p-1.5 rounded-none border-2 border-black bg-white shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none text-black cursor-pointer"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(r.id)}
                            className="inline-flex p-1.5 rounded-none border-2 border-black bg-white shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'mk' && (
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b-2 border-black bg-neutral-50 text-neutral-900 uppercase font-bold tracking-wider">
                  <th className="px-5 py-4 w-24">Kode</th>
                  <th className="px-5 py-4 font-display font-bold italic text-sm">Nama Mata Kuliah</th>
                  <th className="px-5 py-4 w-20">SKS</th>
                  <th className="px-5 py-4 w-28">Hari</th>
                  <th className="px-5 py-4 w-32">Waktu Asal</th>
                  {userRole === 'admin' && <th className="px-5 py-4 w-28 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10">
                {matakuliah.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-neutral-450 font-bold">
                      Belum ada data Mata Kuliah.
                    </td>
                  </tr>
                ) : (
                  matakuliah.map((m) => (
                    <tr key={m.id} className="hover:bg-neutral-50">
                      <td className="px-5 py-4 font-bold text-neutral-900">{m.code}</td>
                      <td className="px-5 py-4 font-display font-extrabold italic text-neutral-900 text-sm">{m.name}</td>
                      <td className="px-5 py-4 text-neutral-700 font-bold">{m.sks} SKS</td>
                      <td className="px-5 py-4 text-neutral-500 font-bold">{m.day}</td>
                      <td className="px-5 py-4 font-bold text-neutral-800">{m.timeSlot}</td>
                      {userRole === 'admin' && (
                        <td className="px-5 py-4 text-right space-x-2">
                          <button
                            onClick={() => openEditModal(m)}
                            className="inline-flex p-1.5 rounded-none border-2 border-black bg-white shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none text-black cursor-pointer"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(m.id)}
                            className="inline-flex p-1.5 rounded-none border-2 border-black bg-white shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* CRUD Modal Form */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-none border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between border-b-2 border-black pb-3">
              <h3 className="text-lg font-display font-extrabold italic text-neutral-900">
                {editId
                  ? `Edit Data ${activeTab === 'dosen' ? 'Dosen' : activeTab === 'ruang' ? 'Ruangan' : 'Mata Kuliah'}`
                  : `Tambah Data ${activeTab === 'dosen' ? 'Dosen' : activeTab === 'ruang' ? 'Ruangan' : 'Mata Kuliah'}`}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-none border-2 border-black p-1 hover:bg-neutral-100 text-black active:translate-x-0.5 active:translate-y-0.5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-4 space-y-4 font-mono text-xs font-semibold">
              {activeTab === 'dosen' && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                      Nama Dosen
                    </label>
                    <input
                      type="text"
                      value={dosenName}
                      onChange={(e) => setDosenName(e.target.value)}
                      required
                      placeholder="Nama Lengkap Beserta Gelar"
                      className="w-full rounded-none border-2 border-black py-2.5 px-3 bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                      Kode Singkat Dosen
                    </label>
                    <input
                      type="text"
                      value={dosenCode}
                      onChange={(e) => setDosenCode(e.target.value)}
                      required
                      maxLength={3}
                      placeholder="Contoh: BD"
                      className="w-full rounded-none border-2 border-black py-2.5 px-3 bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                      Preferensi Hari Mengajar
                    </label>
                    <select
                      value={dosenPref}
                      onChange={(e) => setDosenPref(e.target.value)}
                      className="w-full rounded-none border-2 border-black py-2.5 px-3 bg-white outline-none"
                    >
                      <option value="Bebas">Bebas</option>
                      <option value="Senin">Senin</option>
                      <option value="Selasa">Selasa</option>
                      <option value="Rabu">Rabu</option>
                      <option value="Kamis">Kamis</option>
                      <option value="Jumat">Jumat</option>
                    </select>
                  </div>
                </>
              )}

              {activeTab === 'ruang' && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                      Nama Ruangan
                    </label>
                    <input
                      type="text"
                      value={ruangName}
                      onChange={(e) => setRuangName(e.target.value)}
                      required
                      placeholder="Contoh: R301"
                      className="w-full rounded-none border-2 border-black py-2.5 px-3 bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                      Tipe Ruangan
                    </label>
                    <select
                      value={ruangType}
                      onChange={(e) => setRuangType(e.target.value)}
                      required
                      className="w-full rounded-none border-2 border-black py-2.5 px-3 bg-white outline-none"
                    >
                      <option value="Teori">Teori</option>
                      <option value="Praktikum">Praktikum</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                      Kapasitas Kursi
                    </label>
                    <input
                      type="number"
                      value={ruangCapacity}
                      onChange={(e) => setRuangCapacity(Number(e.target.value))}
                      required
                      className="w-full rounded-none border-2 border-black py-2.5 px-3 bg-white outline-none"
                    />
                  </div>
                </>
              )}

              {activeTab === 'mk' && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                      Nama Mata Kuliah
                    </label>
                    <input
                      type="text"
                      value={mkName}
                      onChange={(e) => setMkName(e.target.value)}
                      required
                      className="w-full rounded-none border-2 border-black py-2.5 px-3 bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                      Kode MK
                    </label>
                    <input
                      type="text"
                      value={mkCode}
                      onChange={(e) => setMkCode(e.target.value)}
                      required
                      placeholder="Contoh: SI-101"
                      className="w-full rounded-none border-2 border-black py-2.5 px-3 bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                      Jumlah SKS
                    </label>
                    <input
                      type="number"
                      value={mkSks}
                      onChange={(e) => setMkSks(Number(e.target.value))}
                      required
                      className="w-full rounded-none border-2 border-black py-2.5 px-3 bg-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                      Hari Kuliah
                    </label>
                    <select
                      value={mkDay}
                      onChange={(e) => setMkDay(e.target.value)}
                      required
                      className="w-full rounded-none border-2 border-black py-2.5 px-3 bg-white outline-none"
                    >
                      <option value="Senin">Senin</option>
                      <option value="Selasa">Selasa</option>
                      <option value="Rabu">Rabu</option>
                      <option value="Kamis">Kamis</option>
                      <option value="Jumat">Jumat</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                        Jam Mulai
                      </label>
                      <input
                        type="time"
                        value={mkTimeStart}
                        onChange={(e) => setMkTimeStart(e.target.value)}
                        required
                        className="w-full rounded-none border-2 border-black py-2 px-3 bg-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                        Jam Selesai
                      </label>
                      <input
                        type="time"
                        value={mkTimeEnd}
                        onChange={(e) => setMkTimeEnd(e.target.value)}
                        required
                        className="w-full rounded-none border-2 border-black py-2 px-3 bg-white outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Action buttons */}
              <div className="flex justify-end gap-3 border-t-2 border-black pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-none border-2 border-black bg-white px-4 py-2 text-xs font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-1.5 rounded-none border-2 border-black bg-black px-4 py-2 text-xs font-bold text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>MENYIMPAN...</span>
                    </>
                  ) : (
                    <span>SIMPAN</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
