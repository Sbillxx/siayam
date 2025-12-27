import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { user_id, oldPassword, newPassword } = body;

        if (!user_id || !oldPassword || !newPassword) {
            return NextResponse.json({ error: 'Mohon lengkapi semua data' }, { status: 400 });
        }

        // 1. Ambil password lama dari database
        const rows = await query('SELECT password FROM user WHERE user_id = ?', [user_id]) as any[];

        if (rows.length === 0) {
            return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
        }

        const user = rows[0];

        // 2. Verifikasi password lama
        // Jika password di DB masih plain text (legacy), kita bandingkan langsung.
        // Jika sudah hash, kita pakai bcrypt.compare.
        // Untuk amannya, kita coba compare hash dulu.
        const isMatch = await bcrypt.compare(oldPassword, user.password);

        // Fallback: Jika validasi hash gagal, mungkin password di DB masih plain text (kasus migrasi awal)
        // Tapi jika kita sudah seeding dengan hash, harusnya match.
        // Namun, jika DB berisi data dummy lama 'admin123' (plain), bcrypt.compare akan false.
        // Kita tambahkan pengecekan plain text HANYA jika hash compare gagal (opsional, tapi berguna buat transisi).
        let isValid = isMatch;
        if (!isValid && user.password === oldPassword) {
            isValid = true;
        }

        if (!isValid) {
            return NextResponse.json({ error: 'Password lama salah' }, { status: 400 });
        }

        // 3. Hash password baru
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // 4. Update database
        await query('UPDATE user SET password = ? WHERE user_id = ?', [hashedNewPassword, user_id]);

        return NextResponse.json({ message: 'Password berhasil diubah' });

    } catch (error: any) {
        console.error('Change Password Error:', error);
        return NextResponse.json({ error: error.message || 'Gagal mengubah password' }, { status: 500 });
    }
}
