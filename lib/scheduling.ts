import { startOfDay, addDays, differenceInCalendarDays, getDay } from 'date-fns';
import { prisma } from './prisma';

/**
 * Returns which week of the bi-weekly cycle a date falls in (1 or 2).
 * Week 1: Mon-Sun of first week, Week 2: Mon-Sun of second week.
 */
export async function getWeekNumber(date: Date): Promise<1 | 2> {
    const config = await prisma.systemConfig.findFirst();
    if (!config) return 1; // Default to week 1

    const cycleStart = startOfDay(new Date(config.cycleStartDate));
    const targetDate = startOfDay(new Date(date));
    const diffDays = differenceInCalendarDays(targetDate, cycleStart);

    if (diffDays < 0) return 1;

    // Each cycle is 2 weeks (14 days)
    const positionInCycle = diffDays % 14;
    return positionInCycle < 7 ? 1 : 2;
}

/**
 * Returns whether a given batch is scheduled (i.e., gets designated seats) on a date.
 * Week 1: Mon-Wed => Batch A, Thu-Fri => Batch B
 * Week 2: Mon-Wed => Batch B, Thu-Fri => Batch A
 */
export async function isBatchScheduled(batch: string, date: Date): Promise<boolean> {
    if (batch === 'NONE') return false;

    const dayOfWeek = getDay(new Date(date)); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat

    // Weekends => no one is scheduled
    if (dayOfWeek === 0 || dayOfWeek === 6) return false;

    const week = await getWeekNumber(date);
    const isMonToWed = dayOfWeek >= 1 && dayOfWeek <= 3;
    const isThuToFri = dayOfWeek >= 4 && dayOfWeek <= 5;

    if (week === 1) {
        if (batch === 'A' && isMonToWed) return true;
        if (batch === 'B' && isThuToFri) return true;
    } else {
        if (batch === 'B' && isMonToWed) return true;
        if (batch === 'A' && isThuToFri) return true;
    }

    return false;
}

/**
 * Checks if floating seats are currently unlocked for a given target date.
 * Floating seats for "tomorrow" unlock at 3:00 PM today.
 */
export function isFloatingUnlocked(targetDate: Date): boolean {
    const now = new Date();
    const today = startOfDay(now);
    const target = startOfDay(new Date(targetDate));

    const diffDays = differenceInCalendarDays(target, today);

    // Same day: floating always available (if you're already at work...)
    if (diffDays === 0) return true;

    // Next day: unlocks at 3 PM today
    if (diffDays === 1) {
        return now.getHours() >= 15;
    }

    // Beyond next day: always available if within 14-day window
    if (diffDays > 1 && diffDays <= 14) return true;

    return false;
}

/**
 * Returns the maximum bookable date (today + 14 days).
 */
export function getMaxBookingDate(): Date {
    return addDays(startOfDay(new Date()), 14);
}

export function isWeekend(date: Date): boolean {
    const day = getDay(new Date(date));
    return day === 0 || day === 6;
}
