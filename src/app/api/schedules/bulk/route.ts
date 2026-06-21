import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await requireRole(['admin']);
    if (!session) {
      return NextResponse.json({ message: 'Akses ditolak.' }, { status: 403 });
    }

    const { schedules } = await req.json();
    if (!Array.isArray(schedules)) {
      return NextResponse.json({ message: 'Jadwal harus berupa array.' }, { status: 400 });
    }

    const db = readDB();
    db.schedules = schedules;
    writeDB(db);

    return NextResponse.json({ message: 'Semua jadwal berhasil diperbarui.' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
