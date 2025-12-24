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

        const sql = `INSERT INTO data_pakan (pakan_id, jenis_pakan, tanggal, biaya_pakan) VALUES (?, ?, ?, ?)`;
        await query(sql, [pakan_id, jenis_pakan, tanggal, biaya_pakan]);

        return NextResponse.json({ message: 'Success', pakan_id }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create pakan record' }, { status: 500 });
    }
}
