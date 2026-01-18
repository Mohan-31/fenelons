import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const meatType = searchParams.get('meatType');
  try {
    const stats = await prisma.order.groupBy({
      by: ['cut', 'weight'],
      where: { meatType: meatType as string, isFinished: false },
      _count: { _all: true },
      orderBy: [{ cut: 'asc' }, { weight: 'asc' }]
    });
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}