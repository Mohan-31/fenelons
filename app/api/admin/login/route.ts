import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    const admin = await prisma.admin.findUnique({ 
      where: { username } 
    });

    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
      return NextResponse.json(
        { error: 'Invalid username or password' }, 
        { status: 401 }
      );
    }

    const cookieStore = await cookies();
    cookieStore.set({
      name: 'admin_session',
      value: 'true',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("LOGIN_ERROR:", error);
    return NextResponse.json(
      { error: 'Login service currently unavailable' }, 
      { status: 500 }
    );
  }
}
