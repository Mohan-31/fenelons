import { NextResponse } from 'next/server'

// TEMP MOCK — replace with DB logic
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const meatType = searchParams.get('meatType')

  if (!meatType) {
    return NextResponse.json(
      { error: 'meatType required' },
      { status: 400 }
    )
  }

  return NextResponse.json({
    stats: [],
    orders: []
  })
}
