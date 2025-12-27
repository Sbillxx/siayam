export interface Kandang {
    kandang_id: string;
    nomor_kandang: string;
    kapasitas: number;
    lokasi: string;
}

export interface Ayam {
    ayam_id: string;
    kandang_id: string;
    jumlah_ayam: number;
    updated_at: string;
    kandang?: Kandang;
}

export interface CekKesehatan {
    cek_id: string;
    tanggal: string;
    ayam_id: string;
    nama_kandang: string;
    jum_sakit: number;
    jum_mati: number;
    catatan: string;
}

export interface LaporanHarian {
    laporan_id: string;
    tanggal: string;
    ayam_id: string;
    kandang_id: string;
    nama_kandang: string;
    telur_butir: number;
    telur_kg: number;
    pakan_gr: number;
    ayam_hidup: number;
    ayam_mati: number;
    fcr: number;
    hd_percent: number;
    keterangan: string;
}

export interface DataPakan {
    pakan_id: string;
    jenis_pakan: string;
    tanggal: string;
    biaya_pakan: number;
    // added fields inferred from usage if any, but previous usage was simple.
    // Pakan.tsx uses: pakan_id, jenis_pakan, tanggal, biaya_pakan.
}

export interface Perawatan {
    perawatan_id: string;
    tanggal_perawatan: string;
    ayam_id: string;
    nama_kandang: string;
    jenis_perawatan: string;
    biaya: number;
    keterangan: string;
}

export interface User {
    user_id: number | string;
    username: string;
    nama_lengkap: string;
    role: string;
    created_at: string;
    image_url?: string | null;
}
