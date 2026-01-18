import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    // 1. Add securityAnswer to the destructured body
    const { username, password, securityAnswer, setupKey } = await req.json()

    const adminCount = await prisma.admin.count()
    if (adminCount > 0 && setupKey !== process.env.INTERNAL_SETUP_KEY) {
      return NextResponse.json({ error: 'Setup already completed' }, { status: 403 })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    // 2. Add securityAnswer to the data object
    const newAdmin = await prisma.admin.create({
      data: {
        username,
        passwordHash,
        securityAnswer, // THIS FIXES THE ERROR
      }
    })

    return NextResponse.json({ success: true, message: 'Admin created successfully' })
  } catch (error) {
    console.error("Setup Error:", error)
    return NextResponse.json({ error: 'Setup failed' }, { status: 500 })
  }
}