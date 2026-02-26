'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { format, addDays, startOfDay, isWeekend, parseISO } from 'date-fns';
import { Info, CheckCircle } from 'lucide-react';
import Calendar from '@/components/Calendar';

interface SeatData {
    id: string;
    seatNumber: string;
    type: 'DESIGNATED' | 'FLOATING';
    isBooked: boolean;
    isMyBooking: boolean;
    myBookingId?: string;
    available: boolean;
    reason: string;
}

interface Meta {
    weekNumber: 1 | 2;
    batchScheduled: boolean;
    floatingUnlocked: boolean;
    userBatch: string;
}

type Toast = { msg: string; type: 'success' | 'error' | 'info' } | null;

export default function BookPage() {
    const { token } = useAuth();
    const [selectedDate, setSelectedDate] = useState<Date>(() => {
        const d = new Date();
        if (d.getDay() === 0) return addDays(d, 1);
        if (d.getDay() === 6) return addDays(d, 2);
        return d;
    });
    const [seats, setSeats] = useState<SeatData[]>([]);
    const [meta, setMeta] = useState<Meta | null>(null);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<Toast>(null);
    const [bookingLoading, setBookingLoading] = useState<string | null>(null);

    const showToast = (msg: string, type: Toast['type'] = 'info') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchSeats = useCallback(async (date: Date) => {
        setLoading(true);
        const dateStr = format(date, 'yyyy-MM-dd');
        const res = await fetch(`/api/seats?date=${dateStr}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setSeats(data.seats || []);
        setMeta(data.meta || null);
        setLoading(false);
    }, [token]);

    useEffect(() => {
        fetchSeats(selectedDate);
    }, [selectedDate, fetchSeats]);



    const handleBook = async (seat: SeatData) => {
        if (!seat.available) return;
        // block floating seat bookings on batch days or when not unlocked
        if (seat.type === 'FLOATING' && (meta?.batchScheduled || !meta?.floatingUnlocked)) {
            showToast(meta?.batchScheduled ? 'Floating seats locked on batch days' : 'Floating seats are not available for this date', 'error');
            return;
        }
        setBookingLoading(seat.id);
        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ seatId: seat.id, date: format(selectedDate, 'yyyy-MM-dd') }),
            });
            const data = await res.json();
            if (!res.ok) { showToast(data.error, 'error'); return; }
            showToast(`✅ Booked ${seat.seatNumber} for ${format(selectedDate, 'EEE, MMM d')}`, 'success');
            fetchSeats(selectedDate);
        } finally {
            setBookingLoading(null);
        }
    };

    const handleCancel = async (seat: SeatData) => {
        if (!seat.myBookingId) return;
        setBookingLoading(seat.id);
        try {
            const res = await fetch(`/api/bookings/${seat.myBookingId}/cancel`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) { showToast(data.error, 'error'); return; }
            showToast(`Booking for ${seat.seatNumber} cancelled`, 'info');
            fetchSeats(selectedDate);
        } finally {
            setBookingLoading(null);
        }
    };

    const designated = seats.filter(s => s.type === 'DESIGNATED');
    const floating = seats
        .filter(s => s.type === 'FLOATING')
        .map(s => meta?.batchScheduled ? { ...s, available: false, reason: 'Locked on batch day' } : s);
    const today = startOfDay(new Date());
    const isToday = format(selectedDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');

    return (
        <div className="fade-in">
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Book a Seat</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Select a date and choose your seat</p>
            </div>

            {/* Calendar picker */}
            {meta && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
                    <span className="badge" style={{ background: 'rgba(108,99,255,0.15)', color: 'var(--accent)', border: '1px solid rgba(108,99,255,0.2)' }}>Week {meta.weekNumber}</span>
                    <span className={`badge ${meta.batchScheduled ? 'badge-active' : 'badge-cancelled'}`}>
                        {meta.batchScheduled ? `✓ Batch ${meta.userBatch} Day` : `✗ Not Batch ${meta.userBatch} Day`}
                    </span>
                    <span className={`badge ${meta.floatingUnlocked ? 'badge-active' : 'badge-released'}`}>
                        {meta.floatingUnlocked ? '🔓 Float Unlocked' : '🔒 Float Locked (3 PM)'}
                    </span>
                </div>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                    <div style={{ width: 28, height: 28, border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                    Loading seats...
                </div>
            ) : (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24, marginBottom: 28 }}>
                        {/* Calendar Column */}
                        <div>
                            <Calendar selectedDate={selectedDate} onDateSelect={setSelectedDate} />
                        </div>

                        {/* Designated seats */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                                <span style={{ width: 10, height: 10, background: 'var(--accent)', borderRadius: '50%' }} />
                                <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Designated Seats (D01–D40)</h2>
                            </div>
                            {!meta?.batchScheduled && (
                                <div className="warning-box" style={{ marginBottom: 12 }}>
                                    <Info size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                                    <span>Not your batch day — designated seats unavailable</span>
                                </div>
                            )}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 6 }}>
                                {designated.map(seat => (
                                    <SeatCell key={seat.id} seat={seat} onBook={handleBook} onCancel={handleCancel} loading={bookingLoading === seat.id} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Floating seats - Full width */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                            <span style={{ width: 10, height: 10, background: 'var(--floating-color)', borderRadius: '50%' }} />
                            <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Floating Seats (F01–F10)</h2>
                        </div>
                        {meta?.batchScheduled && (
                            <div className="warning-box" style={{ marginBottom: 12 }}>
                                <Info size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                                <span>Floating seats locked on batch days — use designated seats only</span>
                            </div>
                        )}
                        {!meta?.floatingUnlocked && !meta?.batchScheduled && (
                            <div className="warning-box" style={{ marginBottom: 12 }}>
                                <Info size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                                <span>Floating seats for tomorrow unlock at 3:00 PM today</span>
                            </div>
                        )}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
                        {floating.map(seat => (
                            <SeatCell key={seat.id} seat={seat} onBook={handleBook} onCancel={handleCancel} loading={bookingLoading === seat.id} />
                        ))}
                    </div>

                    {/* Legend */}
                    <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <h3 style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Legend</h3>
                        {[
                            { color: 'rgba(108,99,255,0.3)', label: 'Designated - Available' },
                            { color: 'rgba(59,130,246,0.3)', label: 'Floating - Available' },
                            { color: 'rgba(34,197,94,0.3)', label: 'Your Booking' },
                            { color: 'rgba(239,68,68,0.2)', label: 'Booked by Others' },
                            { color: 'rgba(30,30,42,0.8)', label: 'Unavailable' },
                        ].map(({ color, label }) => (
                            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 16, height: 16, background: color, borderRadius: 4, flexShrink: 0 }} />
                                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
                </>
            )}

            {/* Toast */}
            {toast && (
                <div className={`toast toast-${toast.type}`}>{toast.msg}</div>
            )}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

function SeatCell({ seat, onBook, onCancel, loading }: {
    seat: SeatData;
    onBook: (s: SeatData) => void;
    onCancel: (s: SeatData) => void;
    loading: boolean;
}) {
    const cls = seat.isMyBooking ? 'my-booking'
        : seat.isBooked ? 'booked'
            : seat.available ? 'available'
                : 'unavailable';

    const handleClick = () => {
        if (loading) return;
        if (seat.isMyBooking) onCancel(seat);
        else if (seat.available) onBook(seat);
    };

    return (
        <div
            className={`seat-cell ${seat.type.toLowerCase()} ${cls}`}
            onClick={handleClick}
            title={seat.isMyBooking ? 'Your booking — click to cancel' : seat.reason || seat.seatNumber}
        >
            {loading ? (
                <div style={{ width: 10, height: 10, border: '1.5px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            ) : seat.isMyBooking ? (
                <CheckCircle size={12} />
            ) : (
                <span style={{ fontSize: 10 }}>{seat.seatNumber}</span>
            )}
            <span style={{ fontSize: 9, opacity: 0.7 }}>{seat.isMyBooking ? 'Mine' : seat.isBooked ? 'Taken' : ''}</span>
        </div>
    );
}
