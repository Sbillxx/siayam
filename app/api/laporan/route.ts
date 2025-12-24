import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { LaporanHarian } from '@/lib/types';

export async function GET() {
    try {
        // Joining with ayam and data_kandang to get cage name if needed, 
        // or just assume the table has what we need or the type 'nama_kandang' comes from a join.
        // Based on ERD usually laporan links to ayam or kandang directly.
        // LaporanHarian type has 'ayam_id' and 'nama_kandang'.
        // If 'nama_kandang' is not in the table, we fetch it.

        const sql = `
      SELECT l.*, k.nomor_kandang as nama_kandang
      FROM laporan_harian l
      LEFT JOIN ayam a ON l.ayam_id = a.ayam_id
      LEFT JOIN data_kandang k ON a.kandang_id = k.kandang_id
      ORDER BY l.tanggal DESC
    `;

        const rows = await query(sql) as any[];

        // Map to ensure type consistency if needed, though rows often suffice if column names match
        const data: LaporanHarian[] = rows.map((row) => ({
            ...row,
            // Ensure specific mapping if column names differ from property names
        }));

        return NextResponse.json(data);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch laporan' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            tanggal, ayam_id, telur_butir, telur_kg,
            pakan_gr, ayam_hidup, ayam_mati, fcr, hd_percent, keterangan
        } = body;

        const laporan_id = crypto.randomUUID();

        const sql = `
      INSERT INTO laporan_harian 
      (laporan_id, tanggal, ayam_id, telur_butir, telur_kg, pakan_gr, ayam_hidup, ayam_mati, fcr, hd_percent, keterangan) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        await query(sql, [
            laporan_id, tanggal, ayam_id, telur_butir, telur_kg,
            pakan_gr, ayam_hidup, ayam_mati, fcr, hd_percent, keterangan
        ]);

        return NextResponse.json({ message: 'Success', laporan_id }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create laporan' }, { status: 500 });
    }
}
