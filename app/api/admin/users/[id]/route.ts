import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest } from '@/lib/auth';

// DELETE user (admin only)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = getTokenFromRequest(req);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { id } = await params;
        if (id === user.userId) {
            return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
        }

        await prisma.booking.deleteMany({ where: { userId: id } });
        await prisma.user.delete({ where: { id } });

        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('User DELETE error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH update user (admin only)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = getTokenFromRequest(req);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { id } = await params;
        const body = await req.json();
        const { name, email, role, batch, squad } = body;

        const updated = await prisma.user.update({
            where: { id },
            data: { name, email, role, batch, squad },
            select: { id: true, name: true, email: true, role: true, batch: true, squad: true },
        });

        return NextResponse.json({ user: updated });
    } catch (error) {
        console.error('User PATCH error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
