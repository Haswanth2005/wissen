import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest } from '@/lib/auth';
import { startOfDay } from 'date-fns';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = getTokenFromRequest(req);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const booking = await prisma.booking.findUnique({ where: { id }, include: { seat: true } });
        if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

        // Only owner or admin can cancel
        if (booking.userId !== user.userId && user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        if (booking.status !== 'ACTIVE') {
            return NextResponse.json({ error: 'Booking is not active' }, { status: 400 });
        }

        const updated = await prisma.booking.update({
            where: { id },
            data: { status: 'CANCELLED' },
            include: { seat: true },
        });

        return NextResponse.json({ booking: updated });
    } catch (error) {
        console.error('Cancel error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
