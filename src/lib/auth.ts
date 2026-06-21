import { cookies } from 'next/headers';

export interface SessionData {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'dosen' | 'mahasiswa';
}

export async function getSession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    if (!sessionCookie) return null;
    return JSON.parse(sessionCookie.value) as SessionData;
  } catch {
    return null;
  }
}

export async function requireRole(allowedRoles: ('admin' | 'dosen' | 'mahasiswa')[]): Promise<SessionData | null> {
  const session = await getSession();
  if (!session || !allowedRoles.includes(session.role)) {
    return null;
  }
  return session;
}
