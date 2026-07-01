import { NextResponse } from 'next/server';
import { readDB, writeDB, Subject } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await requireRole(['admin']);
    if (!session) {
      return NextResponse.json({ message: 'Akses ditolak.' }, { status: 403 });
    }

    const { name, code, sks, day, timeSlot, lecturer, room } = await req.json();
    if (!name || !code || !sks || !day || !timeSlot) {
      return NextResponse.json({
        message: 'Nama, Kode MK, SKS, Hari, dan Slot Waktu wajib diisi.'
      }, { status: 400 });
    }

    const db = readDB();
    const newMK: Subject = {
      id: db.matakuliah.length > 0 ? Math.max(...db.matakuliah.map(m => m.id)) + 1 : 1,
      name,
      code,
      sks: parseInt(sks),
      day,
      timeSlot,
      lecturer: lecturer || '',
      room: room || ''
    };
    db.matakuliah.push(newMK);

    // Automatically sync to schedules if lecturer and room are provided
    if (lecturer && room) {
      const newSchedule = {
        id: db.schedules.length > 0 ? Math.max(...db.schedules.map(s => s.id)) + 1 : 1,
        subject: name,
        code,
        lecturer,
        room,
        day,
        timeSlot,
        status: 'validated' as const,
        details: ''
      };
      db.schedules.push(newSchedule);
    }

    writeDB(db);

    return NextResponse.json(newMK, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
