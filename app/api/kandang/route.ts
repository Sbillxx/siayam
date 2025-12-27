import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { Kandang } from '@/lib/types';

export async function GET() {
    try {
        const rows = await query('SELECT * FROM data_kandang') as Kandang[];
        return NextResponse.json(rows);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch kandang' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { nomor_kandang, kapasitas, lokasi } = body;
        const kandang_id = crypto.randomUUID();

        const sql = `INSERT INTO data_kandang (kandang_id, nomor_kandang, kapasitas, lokasi) VALUES (?, ?, ?, ?)`;
        await query(sql, [kandang_id, nomor_kandang, kapasitas, lokasi]);

        return NextResponse.json({ message: 'Success', kandang_id }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create kandang' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { kandang_id, nomor_kandang, kapasitas, lokasi } = body;

        if (!kandang_id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const sql = `UPDATE data_kandang SET nomor_kandang = ?, kapasitas = ?, lokasi = ? WHERE kandang_id = ?`;
        await query(sql, [nomor_kandang, kapasitas, lokasi, kandang_id]);

        return NextResponse.json({ message: 'Success' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update kandang' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const sql = `DELETE FROM data_kandang WHERE kandang_id = ?`;
        await query(sql, [id]);

        return NextResponse.json({ message: 'Success' }, { status: 200 });
    } catch (error: any) {
        console.error('Delete error:', error);

        // Handle Foreign Key Constraint violation (MySQL Error 1451)
        if (error.message && (error.message.includes('1451') || error.message.includes('foreign key constraint'))) {
            return NextResponse.json({
                error: 'Tidak bisa menghapus kandang karena masih memiliki data ayam atau laporan terkait. Silakan hapus data ayam di kandang ini terlebih dahulu.'
            }, { status: 400 });
        }

        return NextResponse.json({ error: 'Gagal menghapus kandang' }, { status: 500 });
    }
}
