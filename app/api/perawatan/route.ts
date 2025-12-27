import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { Perawatan } from '@/lib/types';

export async function GET() {
    try {
        const sql = `
      SELECT p.*, k.nomor_kandang as nama_kandang
      FROM perawatan p
      LEFT JOIN ayam a ON p.ayam_id = a.ayam_id
      LEFT JOIN data_kandang k ON a.kandang_id = k.kandang_id
      ORDER BY p.tanggal_perawatan DESC
    `;
        const rows = await query(sql) as any[];

        const data: Perawatan[] = rows.map(row => ({
            perawatan_id: row.perawatan_id,
            tanggal_perawatan: row.tanggal_perawatan,
            ayam_id: row.ayam_id,
            nama_kandang: row.nama_kandang || 'Kandang Tidak Ditemukan',
            jenis_perawatan: row.jenis_perawatan,
            biaya: row.biaya,
            keterangan: row.keterangan
        }));

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch perawatan data' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { tanggal_perawatan, ayam_id, jenis_perawatan, biaya, keterangan } = body;
        const perawatan_id = crypto.randomUUID();

        // Basic validation
        if (!tanggal_perawatan || !ayam_id || !jenis_perawatan) {
            return NextResponse.json({ error: 'Tanggal, Kandang, dan Jenis Perawatan wajib diisi' }, { status: 400 });
        }

        const sql = `
      INSERT INTO perawatan (perawatan_id, tanggal_perawatan, ayam_id, jenis_perawatan, biaya, keterangan)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
        await query(sql, [perawatan_id, tanggal_perawatan, ayam_id, jenis_perawatan, biaya, keterangan]);

        return NextResponse.json({ message: 'Success', perawatan_id }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating perawatan:', error);
        return NextResponse.json({ error: error.message || 'Failed to create perawatan' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { perawatan_id, tanggal_perawatan, ayam_id, jenis_perawatan, biaya, keterangan } = body;

        if (!perawatan_id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const sql = `
      UPDATE perawatan 
      SET tanggal_perawatan = ?, ayam_id = ?, jenis_perawatan = ?, biaya = ?, keterangan = ?
      WHERE perawatan_id = ?
    `;
        await query(sql, [tanggal_perawatan, ayam_id, jenis_perawatan, biaya, keterangan, perawatan_id]);

        return NextResponse.json({ message: 'Success' }, { status: 200 });
    } catch (error: any) {
        console.error('Error updating perawatan:', error);
        return NextResponse.json({ error: error.message || 'Failed to update perawatan' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const sql = `DELETE FROM perawatan WHERE perawatan_id = ?`;
        await query(sql, [id]);

        return NextResponse.json({ message: 'Success' }, { status: 200 });
    } catch (error: any) {
        console.error('Error deleting perawatan:', error);
        return NextResponse.json({ error: error.message || 'Failed to delete perawatan' }, { status: 500 });
    }
}
