import { NextResponse } from 'next/server';
import { readDB, writeDB, Schedule } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await requireRole(['admin']);
    if (!session) {
      return NextResponse.json({ message: 'Akses ditolak.' }, { status: 403 });
    }

    const { subject, code, lecturer, room, day, timeSlot, status, details } = await req.json();
    if (!subject || !code || !lecturer || !room || !day || !timeSlot) {
      return NextResponse.json({ message: 'Semua detail jadwal wajib diisi.' }, { status: 400 });
    }

    const db = readDB();
    const newSchedule: Schedule = {
      id: db.schedules.length > 0 ? Math.max(...db.schedules.map(s => s.id)) + 1 : 1,
      subject,
      code,
      lecturer,
      room,
      day,
      timeSlot,
      status: status || 'validated',
      details: details || ''
    };

    db.schedules.push(newSchedule);
    writeDB(db);

    return NextResponse.json(newSchedule, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
