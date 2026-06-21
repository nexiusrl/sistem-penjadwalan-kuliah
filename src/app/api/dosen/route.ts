import { NextResponse } from 'next/server';
import { readDB, writeDB, Lecturer } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await requireRole(['admin']);
    if (!session) {
      return NextResponse.json({ message: 'Akses ditolak.' }, { status: 403 });
    }

    const { name, code } = await req.json();
    if (!name || !code) {
      return NextResponse.json({ message: 'Nama dan Kode wajib diisi.' }, { status: 400 });
    }

    const db = readDB();
    const newDosen: Lecturer = {
      id: db.dosen.length > 0 ? Math.max(...db.dosen.map(d => d.id)) + 1 : 1,
      name,
      code
    };
    db.dosen.push(newDosen);
    writeDB(db);

    return NextResponse.json(newDosen, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
