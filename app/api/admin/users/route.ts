import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest } from '@/lib/auth';

// GET all users (admin only)
export async function GET(req: NextRequest) {
    try {
        const user = getTokenFromRequest(req);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true, batch: true, squad: true, createdAt: true },
            orderBy: { name: 'asc' },
        });

        return NextResponse.json({ users });
    } catch (error) {
        console.error('Users GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST create user (admin only)
export async function POST(req: NextRequest) {
    try {
        const user = getTokenFromRequest(req);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const bcrypt = await import('bcryptjs');
        const { name, email, password, role, batch, squad } = await req.json();

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
        }

        const hashedPw = await bcrypt.default.hash(password || 'wissen123', 10);
        const newUser = await prisma.user.create({
            data: { name, email, password: hashedPw, role: role || 'EMPLOYEE', batch: batch || 'NONE', squad: squad || '' },
            select: { id: true, name: true, email: true, role: true, batch: true, squad: true },
        });

        return NextResponse.json({ user: newUser }, { status: 201 });
    } catch (error) {
        console.error('User POST error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
