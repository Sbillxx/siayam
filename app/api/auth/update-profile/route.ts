import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { user_id, username, nama_lengkap, image_url, update_type } = body;

        if (!user_id) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        let sql = '';
        let params: any[] = [];

        if (update_type === 'username') {
            if (!username) return NextResponse.json({ error: 'Username tidak boleh kosong' }, { status: 400 });

            // Cek duplikasi username
            const checkRows = await query('SELECT * FROM user WHERE username = ? AND user_id != ?', [username, user_id]) as any[];
            if (checkRows.length > 0) {
                return NextResponse.json({ error: 'Username sudah digunakan' }, { status: 400 });
            }

            sql = 'UPDATE user SET username = ? WHERE user_id = ?';
            params = [username, user_id];
        }
        else if (update_type === 'nama') {
            if (!nama_lengkap) return NextResponse.json({ error: 'Nama tidak boleh kosong' }, { status: 400 });
            sql = 'UPDATE user SET nama_lengkap = ? WHERE user_id = ?';
            params = [nama_lengkap, user_id];
        }
        else if (update_type === 'image') {
            // image_url bisa null/empty untuk menghapus foto
            sql = 'UPDATE user SET image_url = ? WHERE user_id = ?';
            params = [image_url, user_id];
        }

        await query(sql, params);

        return NextResponse.json({ message: 'Data berhasil diperbarui' });
    } catch (error: any) {
        console.error('Update Profile Error:', error);
        return NextResponse.json({ error: error.message || 'Gagal memperbarui profil' }, { status: 500 });
    }
}
