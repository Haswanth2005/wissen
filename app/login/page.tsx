'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { SparklesCore } from '@/components/ui/sparkles';

type Mode = 'login' | 'register';

export default function LoginPage() {
    const { login, register } = useAuth();
    const [mode, setMode] = useState<Mode>('login');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '', batch: 'A', squad: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (mode === 'login') {
                await login(form.email, form.password);
            } else {
                await register({ name: form.name, email: form.email, password: form.password, batch: form.batch, squad: form.squad });
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, position: 'relative', overflow: 'hidden' }}>
            {/* Sparkles Background */}
            <div style={{ position: 'fixed', inset: 0, zIndex: 1 }}>
                <SparklesCore
                    background="transparent"
                    minSize={0.4}
                    maxSize={1}
                    particleDensity={50}
                    className="w-full h-full"
                    particleColor="#6c63ff"
                    speed={0.5}
                />
            </div>

            {/* Background glow */}
            <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(108,99,255,0.08) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 2 }} />

            <div className="fade-in" style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 10 }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                        <img
                            src="/6448bf6f06402019562ca4db_Wissen Logo Blue.png"
                            alt="Wissen Logo"
                            style={{ height: 80, width: 'auto' }}
                        />
                    </div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                        {mode === 'login' ? 'Welcome back' : 'Create account'}
                    </h1>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                        {mode === 'login' ? 'Sign in to manage your seat bookings' : 'Join Wissen seat booking system'}
                    </p>
                </div>

                {/* Card */}
                <div className="glass" style={{ padding: 32 }}>
                    {/* Tab toggle */}
                    <div style={{ display: 'flex', background: 'var(--bg-secondary)', borderRadius: 10, padding: 4, marginBottom: 24, border: '1px solid var(--border)' }}>
                        {(['login', 'register'] as Mode[]).map((m) => (
                            <button key={m} onClick={() => { setMode(m); setError(''); }} className="btn" style={{ flex: 1, padding: '8px', fontSize: 13, background: mode === m ? 'var(--accent)' : 'transparent', color: mode === m ? '#fff' : 'var(--text-secondary)', border: 'none', transition: 'all 0.2s' }}>
                                {m === 'login' ? 'Sign In' : 'Register'}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {mode === 'register' && (
                            <div>
                                <label className="label">Full Name</label>
                                <div style={{ position: 'relative' }}>
                                    <User size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input className="input" style={{ paddingLeft: 36 }} placeholder="John Doe" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="label">Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input className="input" style={{ paddingLeft: 36 }} type="email" placeholder="you@wissen.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                            </div>
                        </div>

                        <div>
                            <label className="label">Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input className="input" style={{ paddingLeft: 36, paddingRight: 40 }} type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        {mode === 'register' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                    <label className="label">Batch</label>
                                    <select className="input" value={form.batch} onChange={e => setForm(f => ({ ...f, batch: e.target.value }))}>
                                        <option value="A">Batch A</option>
                                        <option value="B">Batch B</option>
                                        <option value="NONE">No Batch</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Squad</label>
                                    <input className="input" placeholder="Alpha" value={form.squad} onChange={e => setForm(f => ({ ...f, squad: e.target.value }))} />
                                </div>
                            </div>
                        )}

                        {error && (
                            <div style={{ background: 'var(--danger-bg)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--danger)' }}>
                                <AlertCircle size={14} />
                                {error}
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: 15, marginTop: 4 }} disabled={loading}>
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                                    {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                                </span>
                            ) : (mode === 'login' ? 'Sign In' : 'Create Account')}
                        </button>
                    </form>

                    {mode === 'login' && (
                        <div style={{ marginTop: 20, padding: 14, background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Demo Credentials</p>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <span>👑 Admin: <code style={{ color: 'var(--accent)' }}>admin@wissen.com</code> / <code style={{ color: 'var(--accent)' }}>admin123</code></span>
                                <span>👤 Employee: <code style={{ color: 'var(--accent)' }}>alice@wissen.com</code> / <code style={{ color: 'var(--accent)' }}>emp123</code></span>
                            </div>
                        </div>
                    )}
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        </div>
    );
}
