'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { Armchair, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface Booking {
    id: string;
    date: string;
    status: 'ACTIVE' | 'CANCELLED' | 'RELEASED';
    seat: { seatNumber: string; type: string };
}

export default function MyBookingsPage() {
    const { token } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);
    const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');

    const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        const res = await fetch('/api/bookings', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setBookings(data.bookings || []);
        setLoading(false);
    }, [token]);

    useEffect(() => { fetchBookings(); }, [fetchBookings]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filteredBookings = bookings.filter(b => {
        const bDate = new Date(b.date);
        if (filter === 'upcoming') return bDate >= today && b.status === 'ACTIVE';
        if (filter === 'past') return bDate < today;
        return true;
    });

    const handleCancel = async (booking: Booking) => {
        setActionLoading(booking.id);
        try {
            const res = await fetch(`/api/bookings/${booking.id}/cancel`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) { showToast(data.error, 'error'); return; }
            showToast(`Booking cancelled`, 'info');
            fetchBookings();
        } finally { setActionLoading(null); }
    };

    const handleRelease = async (booking: Booking) => {
        setActionLoading(booking.id);
        try {
            const res = await fetch(`/api/bookings/${booking.id}/release`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) { showToast(data.error, 'error'); return; }
            showToast(data.message, 'success');
            fetchBookings();
        } finally { setActionLoading(null); }
    };

    const isFuture = (date: string) => new Date(date) >= today;

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>My Bookings</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{bookings.filter(b => b.status === 'ACTIVE' && new Date(b.date) >= today).length} upcoming active booking(s)</p>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={fetchBookings}>
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {(['upcoming', 'all', 'past'] as const).map(f => (
                    <button key={f} className="btn btn-secondary btn-sm" onClick={() => setFilter(f)}
                        style={{ background: filter === f ? 'var(--accent)' : undefined, color: filter === f ? '#fff' : undefined, border: filter === f ? 'none' : undefined }}>
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading bookings...</div>
            ) : filteredBookings.length === 0 ? (
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 48, textAlign: 'center' }}>
                    <Armchair size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
                    <p style={{ color: 'var(--text-muted)' }}>No bookings found</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {filteredBookings.map(b => (
                        <div key={b.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, transition: 'all 0.2s' }}>
                            {/* Seat number */}
                            <div style={{ width: 56, height: 56, background: b.status === 'ACTIVE' ? 'rgba(108,99,255,0.15)' : 'rgba(30,30,42,0.8)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <span style={{ fontSize: 14, fontWeight: 800, color: b.status === 'ACTIVE' ? 'var(--accent)' : 'var(--text-muted)' }}>{b.seat.seatNumber}</span>
                            </div>

                            {/* Info */}
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                    <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{format(new Date(b.date), 'EEEE, MMMM d, yyyy')}</span>
                                    <span className={`badge badge-${b.status.toLowerCase()}`}>{b.status}</span>
                                </div>
                                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                    {b.seat.type === 'DESIGNATED' ? '🏷️ Designated' : '🔄 Floating'}
                                </span>
                            </div>

                            {/* Actions */}
                            {b.status === 'ACTIVE' && isFuture(b.date) && (
                                <div style={{ display: 'flex', gap: 8 }}>
                                    {b.seat.type === 'DESIGNATED' && (
                                        <button className="btn btn-success btn-sm" onClick={() => handleRelease(b)} disabled={actionLoading === b.id}>
                                            <RefreshCw size={12} /> Release
                                        </button>
                                    )}
                                    <button className="btn btn-danger btn-sm" onClick={() => handleCancel(b)} disabled={actionLoading === b.id}>
                                        <XCircle size={12} /> Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
        </div>
    );
}
