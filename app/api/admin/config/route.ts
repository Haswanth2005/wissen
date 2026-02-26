import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const user = getTokenFromRequest(req);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const config = await prisma.systemConfig.findFirst();
        return NextResponse.json({ config });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const user = getTokenFromRequest(req);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { cycleStartDate } = await req.json();
        if (!cycleStartDate) {
            return NextResponse.json({ error: 'cycleStartDate required' }, { status: 400 });
        }

        const existing = await prisma.systemConfig.findFirst();
        let config;
        if (existing) {
            config = await prisma.systemConfig.update({
                where: { id: existing.id },
                data: { cycleStartDate: new Date(cycleStartDate) },
            });
        } else {
            config = await prisma.systemConfig.create({
                data: { cycleStartDate: new Date(cycleStartDate) },
            });
        }

        return NextResponse.json({ config, message: 'Cycle start date updated' });
    } catch (error) {
        console.error('Config PUT error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
