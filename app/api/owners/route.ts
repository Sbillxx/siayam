import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const rows = await query('SELECT * FROM owner') as any[];
        return NextResponse.json(rows);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch owners' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // Assuming standard fields for owner
        const { nama, kontak, alamat } = body;
        const owner_id = crypto.randomUUID();

        const sql = `INSERT INTO owner (owner_id, nama, kontak, alamat) VALUES (?, ?, ?, ?)`;
        await query(sql, [owner_id, nama, kontak, alamat]);

        return NextResponse.json({ message: 'Success', owner_id }, { status: 201 });
    } catch (error) {
        // console.error(error);
        return NextResponse.json({ error: 'Failed to create owner' }, { status: 500 });
    }
}
