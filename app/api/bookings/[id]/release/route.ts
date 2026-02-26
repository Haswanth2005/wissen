import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = getTokenFromRequest(req);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const booking = await prisma.booking.findUnique({ where: { id }, include: { seat: true } });
        if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

        if (booking.userId !== user.userId && user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        if (booking.seat.type !== 'DESIGNATED') {
            return NextResponse.json({ error: 'Only designated seats can be released' }, { status: 400 });
        }

        if (booking.status !== 'ACTIVE') {
            return NextResponse.json({ error: 'Booking is not active' }, { status: 400 });
        }

        // Mark as RELEASED - it makes the seat available as floating for that day
        const updated = await prisma.booking.update({
            where: { id },
            data: { status: 'RELEASED' },
            include: { seat: true },
        });

        return NextResponse.json({ booking: updated, message: 'Seat released and available as floating for others' });
    } catch (error) {
        console.error('Release error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
