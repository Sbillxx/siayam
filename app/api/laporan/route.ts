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
    let body: any = null;
    try {
        body = await request.json();
        const {
            tanggal,
            ayam_id,
            kandang_id,
            telur_butir = 0,
            telur_kg = 0,
            pakan_gr = 0,
            ayam_hidup = 0,
            ayam_mati = 0,
            fcr = 0,
            hd_percent = 0,
            keterangan = ''
        } = body;

        const laporan_id = crypto.randomUUID();

        const sql = `
      INSERT INTO laporan_harian 
      (laporan_id, tanggal, ayam_id, kandang_id, telur_butir, telur_kg, pakan_gr, ayam_hidup, ayam_mati, fcr, hd_percent, keterangan) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        await query(sql, [
            laporan_id,
            tanggal,
            ayam_id,
            kandang_id,
            Number(telur_butir),
            Number(telur_kg),
            Number(pakan_gr),
            Number(ayam_hidup),
            Number(ayam_mati),
            Number(fcr),
            Number(hd_percent),
            keterangan || null
        ]);

        return NextResponse.json({ message: 'Success', laporan_id }, { status: 201 });
    } catch (error: any) {
        console.error('SERVER ERROR IN LAPORAN POST:', {
            error: error.message,
            code: error.code,
            sqlMessage: error.sqlMessage,
            body
        });
        return NextResponse.json({
            error: 'Failed to create laporan',
            details: error.sqlMessage || error.message
        }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    let body: any = null;
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        body = await request.json();
        const {
            tanggal,
            ayam_id,
            kandang_id,
            telur_butir = 0,
            telur_kg = 0,
            pakan_gr = 0,
            ayam_hidup = 0,
            ayam_mati = 0,
            fcr = 0,
            hd_percent = 0,
            keterangan = ''
        } = body;

        const sql = `
      UPDATE laporan_harian 
      SET tanggal = ?, 
          ayam_id = ?, 
          kandang_id = ?,
          telur_butir = ?, 
          telur_kg = ?, 
          pakan_gr = ?, 
          ayam_hidup = ?, 
          ayam_mati = ?, 
          fcr = ?, 
          hd_percent = ?, 
          keterangan = ?
      WHERE laporan_id = ?
    `;

        await query(sql, [
            tanggal,
            ayam_id,
            kandang_id,
            Number(telur_butir),
            Number(telur_kg),
            Number(pakan_gr),
            Number(ayam_hidup),
            Number(ayam_mati),
            Number(fcr),
            Number(hd_percent),
            keterangan || null,
            id
        ]);

        return NextResponse.json({ message: 'Success' });
    } catch (error: any) {
        console.error('SERVER ERROR IN LAPORAN PUT:', {
            error: error.message,
            code: error.code,
            sqlMessage: error.sqlMessage,
            body
        });
        return NextResponse.json({
            error: 'Failed to update laporan',
            details: error.sqlMessage || error.message
        }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const sql = 'DELETE FROM laporan_harian WHERE laporan_id = ?';
        await query(sql, [id]);

        return NextResponse.json({ message: 'Success' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to delete laporan' }, { status: 500 });
    }
}
