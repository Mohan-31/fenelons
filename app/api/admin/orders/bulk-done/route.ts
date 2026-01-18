import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function PATCH(req: Request) {
  try {
    const { meatType, cut, count } = await req.json();
    const ordersToUpdate = await prisma.order.findMany({
      where: { meatType, cut: cut || undefined, isFinished: false },
      orderBy: { createdAt: 'asc' },
      take: parseInt(count),
      select: { id: true }
    });
    const ids = ordersToUpdate.map(o => o.id);
    await prisma.order.updateMany({
      where: { id: { in: ids } },
      data: { isFinished: true }
    });
    return NextResponse.json({ success: true, count: ids.length });
  } catch (error) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}