import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { Ayam } from '@/lib/types';

export async function GET() {
    try {
        const sql = `
      SELECT a.*, k.nomor_kandang, k.lokasi, k.kapasitas 
      FROM ayam a
      LEFT JOIN data_kandang k ON a.kandang_id = k.kandang_id
    `;
        const rows = await query(sql) as any[];

        const data: Ayam[] = rows.map((row) => ({
            ayam_id: row.ayam_id,
            kandang_id: row.kandang_id,
            jumlah_ayam: row.jumlah_ayam,
            updated_at: row.updated_at,
            kandang: {
                kandang_id: row.kandang_id,
                nomor_kandang: row.nomor_kandang,
                kapasitas: row.kapasitas,
                lokasi: row.lokasi
            }
        }));

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { kandang_id, jumlah_ayam } = body;

        const ayam_id = crypto.randomUUID();

        // Ensure kandang_id is not empty
        if (!kandang_id) {
            return NextResponse.json({ error: 'Kandang ID is required' }, { status: 400 });
        }

        const sql = `INSERT INTO ayam (ayam_id, kandang_id, jumlah_ayam, updated_at) VALUES (?, ?, ?, NOW())`;
        await query(sql, [ayam_id, kandang_id, jumlah_ayam]);

        return NextResponse.json({ message: 'Success', ayam_id }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { ayam_id, kandang_id, jumlah_ayam } = body;

        if (!ayam_id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const sql = `UPDATE ayam SET kandang_id = ?, jumlah_ayam = ?, updated_at = NOW() WHERE ayam_id = ?`;
        await query(sql, [kandang_id, jumlah_ayam, ayam_id]);

        return NextResponse.json({ message: 'Success' }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to update data' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const sql = `DELETE FROM ayam WHERE ayam_id = ?`;
        await query(sql, [id]);

        return NextResponse.json({ message: 'Success' }, { status: 200 });
    } catch (error: any) {
        console.error('Delete Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to delete data' }, { status: 500 });
    }
}
