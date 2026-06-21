import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { readDB } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ message: 'Email dan password wajib diisi.' }, { status: 400 });
    }

    const db = readDB();
    const user = db.users.find(u => u.email === email && u.password === password);
    if (!user) {
      return NextResponse.json({ message: 'Email atau password salah.' }, { status: 401 });
    }

    const cookieStore = await cookies();
    cookieStore.set('session', JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 // 1 day
    });

    return NextResponse.json({
      email: user.email,
      name: user.name,
      role: user.role
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
