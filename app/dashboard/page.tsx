'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { format, addDays, startOfDay } from 'date-fns';
import { Calendar, CheckCircle, Clock, TrendingUp, Armchair, XCircle } from 'lucide-react';
import Link from 'next/link';


interface Booking {
    id: string;
    date: string;
    status: string;
    seat: { seatNumber: string; type: string };
}

export default function DashboardPage() {
    const { user, token } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const today = new Date();

    useEffect(() => {
        fetch('/api/bookings?upcoming=true', {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(r => r.json())
            .then(d => {
                setBookings(d.bookings || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [token]);

    const todayBooking = bookings.find(b => format(new Date(b.date), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd'));
    const upcoming = bookings.filter(b => format(new Date(b.date), 'yyyy-MM-dd') !== format(today, 'yyyy-MM-dd')).slice(0, 5);

    const getWeekInfo = () => {
        const day = today.getDay();
        if (day === 0 || day === 6) return 'Weekend — No office today';
        return `${format(today, 'EEEE, MMMM d')}`;
    };

    return (
        <div className="fade-in">
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                    Good {today.getHours() < 12 ? 'morning' : today.getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                    {getWeekInfo()} · Batch <strong style={{ color: 'var(--accent)' }}>{user?.batch === 'NONE' ? '—' : user?.batch}</strong>
                </p>
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
                <div className="stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div className="stat-value">{bookings.length}</div>
                            <div className="stat-label">Upcoming Bookings</div>
                        </div>
                        <div style={{ width: 40, height: 40, background: 'rgba(108,99,255,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Calendar size={18} color="var(--accent)" />
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div className="stat-value">{todayBooking ? '✓' : '—'}</div>
                            <div className="stat-label">Today's Seat</div>
                            {todayBooking && <div style={{ fontSize: 12, color: 'var(--success)', marginTop: 2 }}>{todayBooking.seat.seatNumber}</div>}
                        </div>
                        <div style={{ width: 40, height: 40, background: todayBooking ? 'rgba(34,197,94,0.12)' : 'rgba(108,99,255,0.12)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Armchair size={18} color={todayBooking ? 'var(--success)' : 'var(--accent)'} />
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div className="stat-value">14</div>
                            <div className="stat-label">Day Advance Window</div>
                        </div>
                        <div style={{ width: 40, height: 40, background: 'rgba(245,158,11,0.12)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrendingUp size={18} color="var(--warning)" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Today's booking */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                <div>
                    <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Today's Status</h2>
                    {todayBooking ? (
                        <div style={{ background: 'var(--success-bg)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 12, padding: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                <CheckCircle size={20} color="var(--success)" />
                                <span style={{ color: 'var(--success)', fontWeight: 600 }}>Seat Booked</span>
                            </div>
                            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>{todayBooking.seat.seatNumber}</div>
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                {todayBooking.seat.type === 'DESIGNATED' ? '🏷️ Designated Seat' : '🔄 Floating Seat'}
                            </div>
                        </div>
                    ) : (
                        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                <XCircle size={20} color="var(--text-muted)" />
                                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>No Booking Today</span>
                            </div>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>You don't have a seat for today.</p>
                            <Link href="/dashboard/book" className="btn btn-primary btn-sm">Book Now →</Link>
                        </div>
                    )}
                </div>

                {/* Quick info */}
                <div>
                    <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Quick Info</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div className="info-box">
                            <Clock size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                            <span>Floating seats for tomorrow unlock at <strong>3:00 PM</strong> today</span>
                        </div>
                        <div className="info-box">
                            <Calendar size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                            <span>Book up to <strong>14 days</strong> in advance</span>
                        </div>
                        <div style={{ background: user?.batch === 'A' ? 'rgba(108,99,255,0.1)' : 'rgba(59,130,246,0.1)', border: `1px solid ${user?.batch === 'A' ? 'rgba(108,99,255,0.25)' : 'rgba(59,130,246,0.25)'}`, borderRadius: 10, padding: '12px 16px', fontSize: 13 }}>
                            <span style={{ color: user?.batch === 'A' ? '#9b95ff' : '#60a5fa' }}>
                                Batch {user?.batch === 'NONE' ? 'N/A' : user?.batch} — Designated seats available on scheduled days
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upcoming bookings */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Upcoming Bookings</h2>
                    <Link href="/dashboard/bookings" className="btn btn-secondary btn-sm">View All</Link>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading...</div>
                ) : upcoming.length === 0 ? (
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 32, textAlign: 'center' }}>
                        <Armchair size={32} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
                        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No upcoming bookings</p>
                        <Link href="/dashboard/book" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>Book a Seat</Link>
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Seat</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {upcoming.map(b => (
                                    <tr key={b.id}>
                                        <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{format(new Date(b.date), 'EEE, MMM d')}</td>
                                        <td style={{ color: 'var(--accent)', fontWeight: 700 }}>{b.seat.seatNumber}</td>
                                        <td>
                                            <span style={{ fontSize: 12, color: b.seat.type === 'DESIGNATED' ? '#9b95ff' : '#60a5fa' }}>
                                                {b.seat.type === 'DESIGNATED' ? '🏷️ Designated' : '🔄 Floating'}
                                            </span>
                                        </td>
                                        <td><span className={`badge badge-${b.status.toLowerCase()}`}>{b.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
