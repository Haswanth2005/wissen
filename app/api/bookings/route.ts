import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest } from '@/lib/auth';
import { isBatchScheduled, isFloatingUnlocked, isWeekend, getMaxBookingDate } from '@/lib/scheduling';
import { startOfDay, differenceInCalendarDays } from 'date-fns';

export async function GET(req: NextRequest) {
    try {
        const user = getTokenFromRequest(req);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const upcoming = searchParams.get('upcoming') === 'true';

        const whereClause: Record<string, unknown> = {};
        if (user.role !== 'ADMIN') {
            whereClause.userId = user.userId;
        }
        if (upcoming) {
            whereClause.date = { gte: startOfDay(new Date()) };
            whereClause.status = 'ACTIVE';
        }

        const bookings = await prisma.booking.findMany({
            where: whereClause,
            include: {
                user: { select: { id: true, name: true, email: true, batch: true, squad: true } },
                seat: true,
            },
            orderBy: { date: 'asc' },
        });

        return NextResponse.json({ bookings });
    } catch (error) {
        console.error('Bookings GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const userPayload = getTokenFromRequest(req);
        if (!userPayload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { seatId, date } = await req.json();
        if (!seatId || !date) {
            return NextResponse.json({ error: 'seatId and date are required' }, { status: 400 });
        }

        const targetDate = startOfDay(new Date(date));
        const today = startOfDay(new Date());
        const diffDays = differenceInCalendarDays(targetDate, today);

        // Cannot book past dates  
        if (diffDays < 0) {
            return NextResponse.json({ error: 'Cannot book past dates' }, { status: 400 });
        }

        // Cannot book beyond 14 days
        if (diffDays > 14) {
            return NextResponse.json({ error: 'Cannot book more than 14 days in advance' }, { status: 400 });
        }

        // No weekends
        if (isWeekend(targetDate)) {
            return NextResponse.json({ error: 'Cannot book on weekends' }, { status: 400 });
        }

        // Fetch the seat
        const seat = await prisma.seat.findUnique({ where: { id: seatId } });
        if (!seat) return NextResponse.json({ error: 'Seat not found' }, { status: 404 });

        if (seat.type === 'DESIGNATED') {
            const batchScheduled = await isBatchScheduled(userPayload.batch, targetDate);
            if (!batchScheduled) {
                return NextResponse.json({ error: 'Your batch is not scheduled for designated seats on this day' }, { status: 403 });
            }
        } else {
            // FLOATING
            if (!isFloatingUnlocked(targetDate)) {
                return NextResponse.json({ error: 'Floating seats for tomorrow unlock at 3:00 PM today' }, { status: 403 });
            }
        }

        // Check if seat is already booked for this date
        const existingBooking = await prisma.booking.findFirst({
            where: { seatId, date: targetDate, status: 'ACTIVE' },
        });
        if (existingBooking) {
            return NextResponse.json({ error: 'Seat is already booked for this date' }, { status: 409 });
        }

        // Check if user already has a booking for this date
        const userExistingBooking = await prisma.booking.findFirst({
            where: { userId: userPayload.userId, date: targetDate, status: 'ACTIVE' },
        });
        if (userExistingBooking) {
            return NextResponse.json({ error: 'You already have a booking for this date' }, { status: 409 });
        }

        const booking = await prisma.booking.create({
            data: { userId: userPayload.userId, seatId, date: targetDate, status: 'ACTIVE' },
            include: {
                seat: true,
                user: { select: { id: true, name: true, email: true } },
            },
        });

        return NextResponse.json({ booking }, { status: 201 });
    } catch (error) {
        console.error('Booking POST error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
