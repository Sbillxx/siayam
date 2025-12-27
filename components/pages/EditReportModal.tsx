'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, Calendar, Save } from 'lucide-react';
import { LaporanHarian, Ayam } from '@/lib/types';
import { toast } from 'sonner';

interface EditReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    report: LaporanHarian | null;
    listAyam: Ayam[];
    onSuccess: () => void;
}

export function EditReportModal({ isOpen, onClose, report, listAyam, onSuccess }: EditReportModalProps) {
    const [formData, setFormData] = useState<Partial<LaporanHarian>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (report) {
            setFormData({ ...report });
        }
    }, [report, isOpen]);

    const calculatedStats = useMemo(() => {
        const telurButir = Number(formData.telur_butir || 0);
        const telurKg = Number(formData.telur_kg || 0);
        const ayamHidup = Number(formData.ayam_hidup || 0);
        const pakanKg = Number(formData.pakan_gr || 0);

        let hd = 0;
        if (ayamHidup > 0) hd = (telurButir / ayamHidup) * 100;

        let fcr = 0;
        if (telurKg > 0) fcr = pakanKg / telurKg;

        return {
            hd: parseFloat(hd.toFixed(2)),
            fcr: parseFloat(fcr.toFixed(2))
        };
    }, [formData.telur_butir, formData.telur_kg, formData.ayam_hidup, formData.pakan_gr]);

    if (!isOpen || !report) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`/api/laporan?id=${report.laporan_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    fcr: calculatedStats.fcr,
                    hd_percent: calculatedStats.hd
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.details || result.error || 'Gagal memperbarui laporan');
            }

            toast.success('Laporan berhasil diperbarui!');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error updating data:', error);
            toast.error(`Gagal: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with Blur */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Edit Laporan Harian</h2>
                        <p className="text-sm text-gray-500">Sesuaikan data produksi dan pakan</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tanggal
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="date"
                                    value={formData.tanggal?.split('T')[0] || ''}
                                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Kandang (Ayam ID)
                            </label>
                            <select
                                value={formData.ayam_id || ''}
                                onChange={(e) => {
                                    const selectedAyam = listAyam.find(a => a.ayam_id === e.target.value);
                                    setFormData({
                                        ...formData,
                                        ayam_id: e.target.value,
                                        kandang_id: selectedAyam ? selectedAyam.kandang_id : '',
                                        ayam_hidup: selectedAyam ? selectedAyam.jumlah_ayam : 0
                                    });
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all appearance-none"
                                required
                            >
                                <option value="">Pilih Kandang</option>
                                {listAyam.map(ayam => (
                                    <option key={ayam.ayam_id} value={ayam.ayam_id}>
                                        {ayam.kandang?.nomor_kandang || 'Unknown'} (Populasi: {ayam.jumlah_ayam})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Populasi Awal (Ekor)
                            </label>
                            <input
                                type="number"
                                value={formData.ayam_hidup || ''}
                                onChange={(e) => setFormData({ ...formData, ayam_hidup: parseFloat(e.target.value) || 0 })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Kematian (Ekor)
                            </label>
                            <input
                                type="number"
                                value={formData.ayam_mati || 0}
                                readOnly
                                className="w-full px-4 py-2 border border-gray-200 bg-gray-50 text-gray-400 rounded-xl cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Telur (Butir)
                            </label>
                            <input
                                type="number"
                                value={formData.telur_butir || ''}
                                onChange={(e) => setFormData({ ...formData, telur_butir: parseFloat(e.target.value) || 0 })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Telur (Kg)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={formData.telur_kg || ''}
                                onChange={(e) => setFormData({ ...formData, telur_kg: parseFloat(e.target.value) || 0 })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Pakan Diberikan (Kg)
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={formData.pakan_gr || ''}
                                onChange={(e) => setFormData({ ...formData, pakan_gr: parseFloat(e.target.value) || 0 })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                                required
                            />
                        </div>

                        <div className="col-span-1 grid grid-cols-2 gap-2">
                            <div className="bg-green-50 p-3 rounded-xl">
                                <div className="text-[10px] uppercase tracking-wider text-green-600 font-bold mb-1">HD% Estimasi</div>
                                <div className="text-lg font-bold text-green-900">{calculatedStats.hd}%</div>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-xl">
                                <div className="text-[10px] uppercase tracking-wider text-blue-600 font-bold mb-1">FCR Estimasi</div>
                                <div className="text-lg font-bold text-blue-900">{calculatedStats.fcr}</div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Keterangan
                        </label>
                        <textarea
                            value={formData.keterangan || ''}
                            onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none min-h-[80px]"
                            placeholder="Catatan tambahan..."
                        />
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-medium flex items-center gap-2 shadow-lg shadow-green-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            Simpan Perubahan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
