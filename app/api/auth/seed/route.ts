import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        // Cek apakah user sudah ada
        const existingUsers = await query('SELECT * FROM user WHERE username = ?', ['admin']) as any[];

        if (existingUsers.length > 0) {
            return NextResponse.json({ message: 'User admin sudah ada. Tidak perlu seeding.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash('admin123', 10);

        // Masukkan user admin baru.
        // Asumsi user_id adalah AUTO_INCREMENT (INT), jadi kita tidak perlu menyertakannya di INSERT.
        // Jika skemanya berbeda, query ini mungkin perlu disesuaikan.
        const sql = `
            INSERT INTO user (username, password, nama_lengkap, role, created_at)
            VALUES (?, ?, ?, ?, NOW())
        `;

        await query(sql, ['admin', hashedPassword, 'Administrator', 'admin']);

        return NextResponse.json({
            message: 'Berhasil membuat user admin.',
            credentials: {
                username: 'admin',
                password: 'admin123'
            }
        }, { status: 201 });

    } catch (error: any) {
        console.error('Seeding Error:', error);
        return NextResponse.json({ error: error.message || 'Gagal melakukan seeding' }, { status: 500 });
    }
}
