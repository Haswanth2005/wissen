'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserPlus, Trash2, Edit2, X, Check } from 'lucide-react';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'EMPLOYEE';
    batch: 'A' | 'B' | 'NONE';
    squad: string;
    createdAt: string;
}

export default function AdminUsersPage() {
    const { token } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'EMPLOYEE', batch: 'A', squad: '' });

    const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchUsers = useCallback(async () => {
        const res = await fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setUsers(data.users || []);
        setLoading(false);
    }, [token]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/admin/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) { showToast(data.error, 'error'); return; }
        showToast('User created successfully', 'success');
        setShowAdd(false);
        setForm({ name: '', email: '', password: '', role: 'EMPLOYEE', batch: 'A', squad: '' });
        fetchUsers();
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this user and all their bookings?')) return;
        const res = await fetch(`/api/admin/users/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) { showToast(data.error, 'error'); return; }
        showToast('User deleted', 'info');
        fetchUsers();
    };

    const handleUpdate = async (user: User) => {
        const res = await fetch(`/api/admin/users/${user.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ name: user.name, email: user.email, role: user.role, batch: user.batch, squad: user.squad }),
        });
        const data = await res.json();
        if (!res.ok) { showToast(data.error, 'error'); return; }
        showToast('User updated', 'success');
        setEditId(null);
        fetchUsers();
    };

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Manage Users</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{users.length} total users in system</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
                    <UserPlus size={16} /> Add User
                </button>
            </div>

            {/* Add user modal */}
            {showAdd && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
                    <div className="modal">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>Add New User</h2>
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setShowAdd(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div><label className="label">Name</label><input className="input" placeholder="John Doe" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                                <div><label className="label">Email</label><input className="input" type="email" placeholder="john@wissen.com" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
                                <div><label className="label">Password</label><input className="input" type="password" placeholder="wissen123" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} /></div>
                                <div><label className="label">Squad</label><input className="input" placeholder="Alpha" value={form.squad} onChange={e => setForm(f => ({ ...f, squad: e.target.value }))} /></div>
                                <div><label className="label">Role</label>
                                    <select className="input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                                        <option value="EMPLOYEE">Employee</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </div>
                                <div><label className="label">Batch</label>
                                    <select className="input" value={form.batch} onChange={e => setForm(f => ({ ...f, batch: e.target.value }))}>
                                        <option value="A">Batch A</option>
                                        <option value="B">Batch B</option>
                                        <option value="NONE">No Batch</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary"><UserPlus size={14} /> Create User</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading users...</div>
            ) : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Batch</th>
                                <th>Squad</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <UserRow key={u.id} user={u} editId={editId} setEditId={setEditId} onDelete={handleDelete} onUpdate={handleUpdate} />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
        </div>
    );
}

function UserRow({ user, editId, setEditId, onDelete, onUpdate }: {
    user: User;
    editId: string | null;
    setEditId: (id: string | null) => void;
    onDelete: (id: string) => void;
    onUpdate: (u: User) => void;
}) {
    const [form, setForm] = useState({ ...user });
    const isEditing = editId === user.id;

    if (isEditing) {
        return (
            <tr>
                <td><input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ padding: '6px 10px', fontSize: 13 }} /></td>
                <td><input className="input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={{ padding: '6px 10px', fontSize: 13 }} /></td>
                <td>
                    <select className="input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as 'ADMIN' | 'EMPLOYEE' }))} style={{ padding: '6px 10px', fontSize: 13 }}>
                        <option value="EMPLOYEE">Employee</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                </td>
                <td>
                    <select className="input" value={form.batch} onChange={e => setForm(f => ({ ...f, batch: e.target.value as 'A' | 'B' | 'NONE' }))} style={{ padding: '6px 10px', fontSize: 13 }}>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="NONE">None</option>
                    </select>
                </td>
                <td><input className="input" value={form.squad} onChange={e => setForm(f => ({ ...f, squad: e.target.value }))} style={{ padding: '6px 10px', fontSize: 13 }} /></td>
                <td style={{ display: 'flex', gap: 6, padding: '8px 16px' }}>
                    <button className="btn btn-success btn-sm" onClick={() => onUpdate(form)}><Check size={12} /></button>
                    <button className="btn btn-secondary btn-sm" onClick={() => setEditId(null)}><X size={12} /></button>
                </td>
            </tr>
        );
    }

    return (
        <tr>
            <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{user.name}</td>
            <td>{user.email}</td>
            <td><span className={`badge ${user.role === 'ADMIN' ? 'badge-admin' : 'badge-active'}`}>{user.role}</span></td>
            <td>{user.batch !== 'NONE' ? <span className={`badge badge-${user.batch.toLowerCase()}`}>Batch {user.batch}</span> : '—'}</td>
            <td>{user.squad || '—'}</td>
            <td>
                <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setEditId(user.id)}><Edit2 size={12} /></button>
                    <button className="btn btn-danger btn-sm" onClick={() => onDelete(user.id)}><Trash2 size={12} /></button>
                </div>
            </td>
        </tr>
    );
}
