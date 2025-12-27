import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { CekKesehatan } from '@/lib/types';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const ayam_id = searchParams.get('ayam_id');
        const tanggal = searchParams.get('tanggal');

        let sql = `
      SELECT c.*, k.nomor_kandang as nama_kandang 
      FROM cek_kesehatan c
      LEFT JOIN ayam a ON c.ayam_id = a.ayam_id
      LEFT JOIN data_kandang k ON a.kandang_id = k.kandang_id
    `;

        const params: any[] = [];
        if (ayam_id && tanggal) {
            sql += ` WHERE c.ayam_id = ? AND DATE(c.tanggal) = DATE(?)`;
            params.push(ayam_id, tanggal);
        } else if (ayam_id) {
            sql += ` WHERE c.ayam_id = ?`;
            params.push(ayam_id);
        } else if (tanggal) {
            sql += ` WHERE DATE(c.tanggal) = DATE(?)`;
            params.push(tanggal);
        }

        sql += ` ORDER BY c.tanggal DESC`;
        const rows = await query(sql, params) as any[];

        const data: CekKesehatan[] = rows.map((row) => ({
            cek_id: row.cek_id,
            tanggal: row.tanggal,
            ayam_id: row.ayam_id,
            nama_kandang: row.nama_kandang || 'Kandang Tidak Ditemukan',
            jum_sakit: row.jum_sakit,
            jum_mati: row.jum_mati,
            catatan: row.catatan
        }));

        return NextResponse.json(data);
    } catch (error) {
        console.error('Fetch Error:', error);
        return NextResponse.json({ error: 'Failed to fetch kesehatan data' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { tanggal, ayam_id, jum_sakit, jum_mati, catatan } = body;
        const cek_id = crypto.randomUUID();

        // Validasi input
        if (!tanggal || !ayam_id) {
            return NextResponse.json({ error: 'Tanggal dan Kandang harus diisi' }, { status: 400 });
        }

        const sql = `
      INSERT INTO cek_kesehatan (cek_id, tanggal, ayam_id, jum_sakit, jum_mati, catatan) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
        await query(sql, [cek_id, tanggal, ayam_id, jum_sakit, jum_mati, catatan]);

        return NextResponse.json({ message: 'Success', cek_id }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating record:', error);
        return NextResponse.json({ error: error.message || 'Failed to create record' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { cek_id, tanggal, ayam_id, jum_sakit, jum_mati, catatan } = body;

        if (!cek_id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const sql = `
      UPDATE cek_kesehatan 
      SET tanggal = ?, ayam_id = ?, jum_sakit = ?, jum_mati = ?, catatan = ?
      WHERE cek_id = ?
    `;
        await query(sql, [tanggal, ayam_id, jum_sakit, jum_mati, catatan, cek_id]);

        return NextResponse.json({ message: 'Success' }, { status: 200 });
    } catch (error: any) {
        console.error('Error updating record:', error);
        return NextResponse.json({ error: error.message || 'Failed to update record' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const sql = `DELETE FROM cek_kesehatan WHERE cek_id = ?`;
        await query(sql, [id]);

        return NextResponse.json({ message: 'Success' }, { status: 200 });
    } catch (error: any) {
        console.error('Error deleting record:', error);
        return NextResponse.json({ error: error.message || 'Failed to delete record' }, { status: 500 });
    }
}
