import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { DataPakan } from '@/lib/types';

export async function GET() {
    try {
        const rows = await query('SELECT * FROM data_pakan ORDER BY tanggal DESC') as DataPakan[];
        return NextResponse.json(rows);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch pakan data' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { jenis_pakan, tanggal, biaya_pakan } = body;
        const pakan_id = crypto.randomUUID();

        if (!jenis_pakan || !tanggal || !biaya_pakan) {
            return NextResponse.json({ error: 'Mohon lengkapi semua data' }, { status: 400 });
        }

        const sql = `INSERT INTO data_pakan (pakan_id, jenis_pakan, tanggal, biaya_pakan) VALUES (?, ?, ?, ?)`;
        await query(sql, [pakan_id, jenis_pakan, tanggal, biaya_pakan]);

        return NextResponse.json({ message: 'Success', pakan_id }, { status: 201 });
    } catch (error: any) {
        console.error('Create error:', error);
        return NextResponse.json({ error: error.message || 'Failed to create pakan record' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { pakan_id, jenis_pakan, tanggal, biaya_pakan } = body;

        if (!pakan_id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const sql = `UPDATE data_pakan SET jenis_pakan = ?, tanggal = ?, biaya_pakan = ? WHERE pakan_id = ?`;
        await query(sql, [jenis_pakan, tanggal, biaya_pakan, pakan_id]);

        return NextResponse.json({ message: 'Success' }, { status: 200 });
    } catch (error: any) {
        console.error('Update error:', error);
        return NextResponse.json({ error: error.message || 'Failed to update pakan record' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const sql = `DELETE FROM data_pakan WHERE pakan_id = ?`;
        await query(sql, [id]);

        return NextResponse.json({ message: 'Success' }, { status: 200 });
    } catch (error: any) {
        console.error('Delete error:', error);
        return NextResponse.json({ error: error.message || 'Failed to delete pakan record' }, { status: 500 });
    }
}
