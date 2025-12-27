import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, password } = body;

        if (!username || !password) {
            return NextResponse.json({ error: 'Username dan password wajib diisi' }, { status: 400 });
        }

        // 1. Ambil user berdasarkan username
        const rows = await query('SELECT * FROM user WHERE username = ?', [username]) as any[];

        if (rows.length === 0) {
            return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 });
        }

        const user = rows[0];

        // 2. Verifikasi Password
        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            // Fallback untuk password plain text (jika ada data legacy yang belum di-hash)
            if (user.password === password) {
                // Password cocok secara plain text, tapi sebaiknya kita hash ulang (next step improvement)
            } else {
                return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 });
            }
        }

        // 3. Login Sukses
        return NextResponse.json({
            message: 'Login berhasil',
            user: {
                user_id: user.user_id,
                username: user.username,
                name: user.nama_lengkap,
                role: user.role,
                image_url: user.image_url
            }
        });

    } catch (error: any) {
        console.error('Login Error:', error);
        return NextResponse.json({ error: 'Terjadi kesalahan saat login' }, { status: 500 });
    }
}
