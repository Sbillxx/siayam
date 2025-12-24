import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { CekKesehatan } from '@/lib/types';

export async function GET() {
    try {
        const sql = `
      SELECT c.*, k.nomor_kandang as nama_kandang 
      FROM cek_kesehatan c
      LEFT JOIN ayam a ON c.ayam_id = a.ayam_id
      LEFT JOIN data_kandang k ON a.kandang_id = k.kandang_id
      ORDER BY c.tanggal DESC
    `;
        const rows = await query(sql) as any[];

        // Ensure mapping matches CekKesehatan interface
        const data: CekKesehatan[] = rows.map((row) => ({
            cek_id: row.cek_id,
            tanggal: row.tanggal,
            ayam_id: row.ayam_id,
            nama_kandang: row.nama_kandang,
            jum_sakit: row.jum_sakit,
            jum_mati: row.jum_mati,
            catatan: row.catatan
        }));

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch kesehatan data' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { tanggal, ayam_id, jum_sakit, jum_mati, catatan } = body;
        const cek_id = crypto.randomUUID();

        const sql = `
      INSERT INTO cek_kesehatan (cek_id, tanggal, ayam_id, jum_sakit, jum_mati, catatan) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
        await query(sql, [cek_id, tanggal, ayam_id, jum_sakit, jum_mati, catatan]);

        return NextResponse.json({ message: 'Success', cek_id }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create record' }, { status: 500 });
    }
}
