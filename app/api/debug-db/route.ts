import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const [laporanCol, ayamCol, kesehatanCol] = await Promise.all([
            query('DESCRIBE laporan_harian'),
            query('DESCRIBE ayam'),
            query('DESCRIBE cek_kesehatan')
        ]);
        return NextResponse.json({ laporanCol, ayamCol, kesehatanCol });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
