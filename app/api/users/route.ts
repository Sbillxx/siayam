import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { User } from '@/lib/types';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        const rows = await query('SELECT * FROM user') as User[];
        return NextResponse.json(rows);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, nama_lengkap, role, password } = body;

        if (!username || !password || !role) {
            return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
        }

        // Hash password sebelum disimpan
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert tanpa user_id (biarkan Auto Increment DB bekerja)
        const sql = `
            INSERT INTO user (username, password, nama_lengkap, role, created_at) 
            VALUES (?, ?, ?, ?, NOW())
        `;

        await query(sql, [username, hashedPassword, nama_lengkap, role]);

        return NextResponse.json({ message: 'Success' }, { status: 201 });
    } catch (error: any) {
        console.error('Create User Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to create user' }, { status: 500 });
    }
}
