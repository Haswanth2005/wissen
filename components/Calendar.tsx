'use client';
import { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isToday, isWeekend } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
}

export default function Calendar({ selectedDate, onDateSelect }: CalendarProps) {
    const [displayMonth, setDisplayMonth] = useState<Date>(selectedDate);

    const monthStart = startOfMonth(displayMonth);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const days = [];
    let currentDate = calendarStart;
    while (currentDate <= calendarEnd) {
        days.push(currentDate);
        currentDate = addDays(currentDate, 1);
    }

    const handleDateClick = (date: Date) => {
        if (isWeekend(date)) return; // Don't allow weekends
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date < today) return; // Don't allow past dates
        if (addDays(today, 14) < date) return; // Don't allow beyond 14 days
        onDateSelect(date);
    };

    const isDateSelectable = (date: Date) => {
        if (isWeekend(date)) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date < today) return false;
        if (addDays(today, 14) < date) return false;
        return true;
    };

    const canGoPrev = () => {
        const prevMonth = subMonths(displayMonth, 1);
        return prevMonth >= new Date();
    };

    const canGoNext = () => {
        const nextMonth = addMonths(displayMonth, 1);
        const twoWeeksFromNow = addDays(new Date(), 14);
        return startOfMonth(nextMonth) <= endOfMonth(twoWeeksFromNow);
    };

    return (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 18, minHeight: 260 }}>
            {/* Month/Year header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <button
                    onClick={() => setDisplayMonth(subMonths(displayMonth, 1))}
                    disabled={!canGoPrev()}
                    className="btn btn-secondary"
                    style={{ padding: '5px 7px', opacity: canGoPrev() ? 1 : 0.5, cursor: canGoPrev() ? 'pointer' : 'not-allowed' }}
                >
                    <ChevronLeft size={16} />
                </button>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', flex: 1, textAlign: 'center' }}>
                    {format(displayMonth, 'MMM yyyy')}
                </h3>
                <button
                    onClick={() => setDisplayMonth(addMonths(displayMonth, 1))}
                    disabled={!canGoNext()}
                    className="btn btn-secondary"
                    style={{ padding: '5px 7px', opacity: canGoNext() ? 1 : 0.5, cursor: canGoNext() ? 'pointer' : 'not-allowed' }}
                >
                    <ChevronRight size={16} />
                </button>
            </div>

            {/* Weekdays */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, marginBottom: 8 }}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                    <div
                        key={day}
                        style={{
                            textAlign: 'center',
                            fontSize: 10,
                            fontWeight: 600,
                            color: 'var(--text-muted)',
                            padding: '4px 0',
                        }}
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Days grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
                {days.map((date, idx) => {
                    const isCurrentMonth = isSameMonth(date, displayMonth);
                    const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                    const isTodayDate = isToday(date);
                    const isWeekendDay = isWeekend(date);
                    const isSelectable = isDateSelectable(date);

                    return (
                        <button
                            key={idx}
                            onClick={() => handleDateClick(date)}
                            disabled={!isSelectable}
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 5,
                                border: isSelected ? '2px solid var(--accent)' : isTodayDate ? '2px solid var(--accent)' : '1px solid var(--border)',
                                background: isSelected
                                    ? 'var(--accent)'
                                    : isTodayDate
                                        ? 'rgba(108,99,255,0.1)'
                                        : isCurrentMonth && isSelectable
                                            ? 'var(--bg-secondary)'
                                            : 'transparent',
                                color: isSelected ? '#fff' : isTodayDate ? 'var(--accent)' : isCurrentMonth ? 'var(--text-primary)' : 'var(--text-muted)',
                                fontSize: 10,
                                fontWeight: isSelected || isTodayDate ? 600 : 500,
                                cursor: isSelectable ? 'pointer' : 'not-allowed',
                                opacity: !isCurrentMonth || isWeekendDay ? 0.3 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s',
                                padding: 0,
                                lineHeight: 1,
                            }}
                        >
                            {format(date, 'd')}
                        </button>
                    );
                })}
            </div>

            {/* Info text */}
            <div style={{ marginTop: 10, fontSize: 10, color: 'var(--text-muted)', textAlign: 'center' }}>
                📅 Weekday only
            </div>
        </div>
    );
}
