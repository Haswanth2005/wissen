'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, Calendar, Settings, Users, LogOut, Armchair } from 'lucide-react';
import Link from 'next/link';

export default function Sidebar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    const navItems = [
        { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { href: '/dashboard/book', icon: Armchair, label: 'Book a Seat' },
        { href: '/dashboard/bookings', icon: Calendar, label: 'My Bookings' },
        ...(user?.role === 'ADMIN' ? [
            { href: '/dashboard/admin/users', icon: Users, label: 'Manage Users' },
            { href: '/dashboard/admin/bookings', icon: Calendar, label: 'All Bookings' },
            { href: '/dashboard/admin/settings', icon: Settings, label: 'Settings' },
        ] : []),
    ];

    return (
        <nav className="sidebar">
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32, paddingLeft: 4 }}>
                <img
                    src="/6448bf6f06402019562ca4db_Wissen Logo Blue.png"
                    alt="Wissen Logo"
                    style={{ height: 50, width: 'auto' }}
                />
            </div>

            {/* Nav items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 12px', marginBottom: 4 }}>Navigation</p>
                {navItems.map(({ href, icon: Icon, label }) => (
                    <Link key={href} href={href} className={`nav-item ${pathname === href ? 'active' : ''}`}>
                        <Icon size={16} />
                        {label}
                    </Link>
                ))}
            </div>

            {/* User info */}
            <div>
                <hr className="divider" />
                <div style={{ padding: '8px 12px', marginBottom: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{user?.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>{user?.email}</span>
                    </div>
                    <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
                        {user?.role === 'ADMIN' ? (
                            <span className="badge badge-admin">Admin</span>
                        ) : (
                            <span className={`badge ${user?.batch === 'A' ? 'badge-a' : 'badge-b'}`}>Batch {user?.batch}</span>
                        )}
                        {user?.squad && <span style={{ fontSize: 11, color: 'var(--text-muted)', paddingTop: 3 }}>· {user.squad}</span>}
                    </div>
                </div>
                <button className="nav-item" onClick={logout} style={{ color: 'var(--danger)' }}>
                    <LogOut size={16} />
                    Sign Out
                </button>
            </div>
        </nav>
    );
}
