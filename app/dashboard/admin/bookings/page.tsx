'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { RefreshCw, XCircle } from 'lucide-react';

interface Booking {
    id: string;
    date: string;
    status: 'ACTIVE' | 'CANCELLED' | 'RELEASED';
    seat: { seatNumber: string; type: string };
    user: { name: string; email: string; batch: string; squad: string };
}

export default function AdminAllBookingsPage() {
    const { token } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'ACTIVE' | 'CANCELLED' | 'RELEASED'>('all');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);

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

    const filteredBookings = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

    const handleCancel = async (id: string) => {
        setActionLoading(id);
        const res = await fetch(`/api/bookings/${id}/cancel`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (!res.ok) { showToast(data.error, 'error'); }
        else { showToast('Booking cancelled by admin', 'info'); fetchBookings(); }
        setActionLoading(null);
    };

    const stats = {
        active: bookings.filter(b => b.status === 'ACTIVE').length,
        cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
        released: bookings.filter(b => b.status === 'RELEASED').length,
    };

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>All Bookings</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{bookings.length} total records</p>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={fetchBookings}><RefreshCw size={14} /> Refresh</button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
                {[
                    { label: 'Active', count: stats.active, cls: 'badge-active' },
                    { label: 'Cancelled', count: stats.cancelled, cls: 'badge-cancelled' },
                    { label: 'Released', count: stats.released, cls: 'badge-released' },
                ].map(({ label, count, cls }) => (
                    <div key={label} className="stat-card" style={{ padding: 16 }}>
                        <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>{count}</div>
                        <span className={`badge ${cls}`} style={{ marginTop: 4 }}>{label}</span>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {(['all', 'ACTIVE', 'CANCELLED', 'RELEASED'] as const).map(f => (
                    <button key={f} className="btn btn-secondary btn-sm" onClick={() => setFilter(f)}
                        style={{ background: filter === f ? 'var(--accent)' : undefined, color: filter === f ? '#fff' : undefined, border: filter === f ? 'none' : undefined }}>
                        {f === 'all' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
                    </button>
                ))}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading bookings...</div>
            ) : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Employee</th>
                                <th>Batch</th>
                                <th>Seat</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBookings.map(b => (
                                <tr key={b.id}>
                                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{format(new Date(b.date), 'MMM d, yyyy')}</td>
                                    <td>
                                        <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{b.user.name}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{b.user.email}</div>
                                    </td>
                                    <td>{b.user.batch !== 'NONE' ? <span className={`badge badge-${b.user.batch.toLowerCase()}`}>Batch {b.user.batch}</span> : '—'}</td>
                                    <td style={{ color: 'var(--accent)', fontWeight: 700 }}>{b.seat.seatNumber}</td>
                                    <td><span style={{ fontSize: 12, color: b.seat.type === 'DESIGNATED' ? '#9b95ff' : '#60a5fa' }}>{b.seat.type === 'DESIGNATED' ? '🏷️ Desig.' : '🔄 Float'}</span></td>
                                    <td><span className={`badge badge-${b.status.toLowerCase()}`}>{b.status}</span></td>
                                    <td>
                                        {b.status === 'ACTIVE' && (
                                            <button className="btn btn-danger btn-sm" onClick={() => handleCancel(b.id)} disabled={actionLoading === b.id}>
                                                <XCircle size={12} /> Cancel
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
        </div>
    );
}
