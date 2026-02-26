'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { Settings, Save, CalendarDays, Info } from 'lucide-react';

export default function AdminSettingsPage() {
    const { token } = useAuth();
    const [cycleStartDate, setCycleStartDate] = useState('');
    const [currentConfig, setCurrentConfig] = useState<{ cycleStartDate: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    const showToast = (msg: string, type: 'success' | 'error') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        fetch('/api/admin/config', { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(d => {
                if (d.config) {
                    setCurrentConfig(d.config);
                    setCycleStartDate(format(new Date(d.config.cycleStartDate), 'yyyy-MM-dd'));
                }
                setLoading(false);
            });
    }, [token]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const res = await fetch('/api/admin/config', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ cycleStartDate }),
        });
        const data = await res.json();
        setSaving(false);
        if (!res.ok) { showToast(data.error, 'error'); return; }
        showToast('Cycle start date updated successfully!', 'success');
        setCurrentConfig(data.config);
    };

    const getSchedulePreview = () => {
        if (!cycleStartDate) return [];
        const start = new Date(cycleStartDate);
        const weeks = [];
        for (let w = 0; w < 2; w++) {
            const weekStart = new Date(start);
            weekStart.setDate(start.getDate() + w * 7);
            weeks.push({
                week: w + 1,
                monWed: w === 0 ? 'Batch A (Designated)' : 'Batch B (Designated)',
                thuFri: w === 0 ? 'Batch B (Designated)' : 'Batch A (Designated)',
            });
        }
        return weeks;
    };

    return (
        <div className="fade-in">
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Settings size={24} /> System Settings
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Configure the bi-weekly batch rotation schedule</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {/* Config form */}
                <div className="card">
                    <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CalendarDays size={18} color="var(--accent)" /> Cycle Start Date
                    </h2>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
                        Set the Monday that begins Week 1 of the bi-weekly rotation cycle.
                    </p>

                    {currentConfig && (
                        <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: 12, marginBottom: 16, border: '1px solid var(--border)' }}>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Current setting</p>
                            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                                {format(new Date(currentConfig.cycleStartDate), 'EEEE, MMMM d, yyyy')}
                            </p>
                        </div>
                    )}

                    {loading ? (
                        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading...</div>
                    ) : (
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label className="label">New Cycle Start Date (must be a Monday)</label>
                                <input className="input" type="date" value={cycleStartDate} onChange={e => setCycleStartDate(e.target.value)} required />
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    )}
                </div>

                {/* Schedule preview */}
                <div className="card">
                    <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>Schedule Logic</h2>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>How the bi-weekly rotation works:</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[
                            { week: 'Week 1', monWed: '🟣 Batch A gets designated seats', thuFri: '🔵 Batch B gets designated seats' },
                            { week: 'Week 2', monWed: '🔵 Batch B gets designated seats', thuFri: '🟣 Batch A gets designated seats' },
                        ].map(({ week, monWed, thuFri }) => (
                            <div key={week} style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 16, border: '1px solid var(--border)' }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', marginBottom: 10 }}>{week}</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                        <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 60, flexShrink: 0 }}>Mon–Wed</span>
                                        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{monWed}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                        <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 60, flexShrink: 0 }}>Thu–Fri</span>
                                        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{thuFri}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="info-box" style={{ marginTop: 16 }}>
                        <Info size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                        <div>
                            <span style={{ fontWeight: 600, display: 'block', marginBottom: 4 }}>Floating Seats Rule</span>
                            <span>F01–F10 are always available, but unlock for the next day only after <strong>3:00 PM</strong> today. Both batches can book floating seats on any day.</span>
                        </div>
                    </div>
                </div>
            </div>

            {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
        </div>
    );
}
