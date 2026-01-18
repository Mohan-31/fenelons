import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { username, securityAnswer, newPassword } = await req.json();

    // 1. Find the admin
    const admin = await prisma.admin.findUnique({ 
      where: { username } 
    });

    if (!admin) {
      return NextResponse.json({ error: 'Username not found' }, { status: 404 });
    }

    // 2. Verify answer safely (handling potential nulls and case sensitivity)
    const storedAnswer = admin.securityAnswer || "";
    if (storedAnswer.toLowerCase() !== securityAnswer.trim().toLowerCase()) {
      return NextResponse.json({ error: 'Incorrect security answer' }, { status: 401 });
    }

    // 3. Update Password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.admin.update({
      where: { username },
      data: { passwordHash: hashedPassword }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("RESET_ERROR:", error);
    return NextResponse.json({ error: 'Reset failed' }, { status: 500 });
  }
}