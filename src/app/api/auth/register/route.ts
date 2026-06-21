import { NextResponse } from 'next/server';
import { readDB, writeDB, User } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json();
    if (!name || !email || !password || !role) {
      return NextResponse.json({ message: 'Semua data wajib diisi.' }, { status: 400 });
    }

    const db = readDB();
    const exists = db.users.some(u => u.email === email);
    if (exists) {
      return NextResponse.json({ message: 'Email sudah terdaftar.' }, { status: 400 });
    }

    const newUser: User = {
      id: db.users.length > 0 ? Math.max(...db.users.map(u => u.id)) + 1 : 1,
      name,
      email,
      password,
      role
    };

    db.users.push(newUser);

    // If registered role is dosen, automatically add to the Dosen master list if not exists
    if (role === 'dosen') {
      const dosenExists = db.dosen.some(
        d => d.name.toLowerCase() === name.toLowerCase()
      );
      if (!dosenExists) {
        db.dosen.push({
          id: db.dosen.length > 0 ? Math.max(...db.dosen.map(d => d.id)) + 1 : 1,
          name: name,
          code: name.substring(0, 2).toUpperCase()
        });
      }
    }

    writeDB(db);
    return NextResponse.json({ message: 'Registrasi berhasil.' }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
