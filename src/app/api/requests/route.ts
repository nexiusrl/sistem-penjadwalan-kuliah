import { NextResponse } from 'next/server';
import { readDB, writeDB, ChangeRequest } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await requireRole(['dosen']);
    if (!session) {
      return NextResponse.json({ message: 'Akses ditolak.' }, { status: 403 });
    }

    const { lecturer, subject, fromTime, toTime, reason } = await req.json();
    if (!lecturer || !subject || !fromTime || !toTime || !reason) {
      return NextResponse.json({ message: 'Semua data permohonan wajib diisi.' }, { status: 400 });
    }

    const db = readDB();

    // Enforce lecturer name matches user session to prevent spoofing
    const finalLecturer = session.name;

    const newRequest: ChangeRequest = {
      id: db.requests.length > 0 ? Math.max(...db.requests.map(r => r.id)) + 1 : 1,
      lecturer: finalLecturer,
      subject,
      fromTime,
      toTime,
      reason,
      status: 'pending'
    };

    db.requests.unshift(newRequest); // Newest first
    writeDB(db);

    return NextResponse.json(newRequest, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
