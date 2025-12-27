'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Calendar, Trash2, Edit2 } from 'lucide-react';
import { LaporanHarian as LaporanHarianType, Ayam } from '@/lib/types';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EditReportModal } from './EditReportModal';

export function LaporanHarian() {
  const [activeTab, setActiveTab] = useState<'input' | 'riwayat'>('input');
  const [searchTerm, setSearchTerm] = useState('');
  const [listLaporan, setListLaporan] = useState<LaporanHarianType[]>([]);
  const [listAyam, setListAyam] = useState<Ayam[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState<Partial<LaporanHarianType>>({
    tanggal: new Date().toISOString().split('T')[0],
    ayam_id: '',
    kandang_id: '',
    telur_butir: 0,
    telur_kg: 0,
    ayam_hidup: 0,
    ayam_mati: 0,
    pakan_gr: 0,
    keterangan: ''
  });

  // Confirm Dialog State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<LaporanHarianType | null>(null);

  // Fetch Data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [resLaporan, resAyam] = await Promise.all([
        fetch('/api/laporan'),
        fetch('/api/ayam')
      ]);

      if (resLaporan.ok) {
        const data = await resLaporan.json();
        setListLaporan(data);
      }
      if (resAyam.ok) {
        const data = await resAyam.json();
        setListAyam(data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Gagal mengambil data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Derived state for stats - useMemo is more stable than useEffect + useState
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

  // Fetch Death Count (Cumulative)
  useEffect(() => {
    const fetchDeathCount = async () => {
      if (!formData.ayam_id) return;
      try {
        const response = await fetch(`/api/kesehatan?ayam_id=${formData.ayam_id}`);
        if (response.ok) {
          const data = await response.json();
          const totalMati = data.reduce((sum: number, item: any) => sum + (Number(item.jum_mati) || 0), 0);
          // Only update if it's actually different to avoid unnecessary re-renders
          if (totalMati !== formData.ayam_mati) {
            setFormData(prev => ({ ...prev, ayam_mati: totalMati }));
          }
        }
      } catch (error) {
        console.error('Error fetching death count:', error);
      }
    };

    fetchDeathCount();
  }, [formData.ayam_id]); // Only re-run when ayam_id (the batch) changes

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.ayam_id) {
      toast.error('Mohon pilih kandang');
      return;
    }

    try {
      const response = await fetch('/api/laporan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          fcr: calculatedStats.fcr,
          hd_percent: calculatedStats.hd
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.details || result.error || 'Gagal menyimpan laporan');
      }

      toast.success('Laporan berhasil disimpan!');
      handleReset();
      fetchData();
      setActiveTab('riwayat');
    } catch (error: any) {
      console.error('Error saving data:', error);
      toast.error(`Gagal: ${error.message}`);
    }
  };

  const handleReset = () => {
    setFormData({
      tanggal: new Date().toISOString().split('T')[0],
      ayam_id: '',
      kandang_id: '',
      telur_butir: 0,
      telur_kg: 0,
      ayam_hidup: 0,
      ayam_mati: 0,
      pakan_gr: 0,
      keterangan: ''
    });
  };

  const handleEdit = (report: LaporanHarianType) => {
    setSelectedReport(report);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    setPendingDeleteId(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;

    try {
      const response = await fetch(`/api/laporan?id=${pendingDeleteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Gagal menghapus laporan');

      toast.success('Laporan berhasil dihapus!');
      fetchData();
    } catch (error: any) {
      console.error('Error deleting data:', error);
      toast.error(`Gagal menghapus: ${error.message}`);
    }
  };

  const filteredLaporan = listLaporan.filter(lap =>
    (lap.nama_kandang?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
    lap.tanggal.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Laporan Harian</h1>
        <p className="text-gray-600">Catat produksi telur dan pakan harian</p>
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setPendingDeleteId(null);
        }}
        onConfirm={confirmDelete}
        title="Hapus Laporan"
        description="Apakah Anda yakin ingin menghapus laporan harian ini? Tindakan ini tidak dapat dibatalkan."
      />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('input')}
          className={`px-4 py-2 -mb-px ${activeTab === 'input'
            ? 'border-b-2 border-green-600 text-green-600'
            : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          Input Laporan
        </button>
        <button
          onClick={() => setActiveTab('riwayat')}
          className={`px-4 py-2 -mb-px ${activeTab === 'riwayat'
            ? 'border-b-2 border-green-600 text-green-600'
            : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          Riwayat Laporan
        </button>
      </div>

      {/* Input Laporan */}
      {activeTab === 'input' && (
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">
                  Tanggal <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Kandang (Ayam ID) <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.ayam_id}
                  onChange={(e) => {
                    const selectedAyam = listAyam.find(a => a.ayam_id === e.target.value);
                    setFormData({
                      ...formData,
                      ayam_id: e.target.value,
                      kandang_id: selectedAyam ? selectedAyam.kandang_id : '',
                      ayam_hidup: selectedAyam ? selectedAyam.jumlah_ayam : 0
                    });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
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
                <label className="block text-gray-700 mb-2">
                  Populasi Awal (Ekor) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.ayam_hidup === 0 ? '' : formData.ayam_hidup}
                  onChange={(e) => setFormData({ ...formData, ayam_hidup: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="0"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Kematian (Ekor) <span className="text-xs text-blue-600 font-normal">(Otomatis dari Kesehatan)</span>
                </label>
                <input
                  type="number"
                  value={formData.ayam_mati}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg cursor-not-allowed"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Telur (Butir) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.telur_butir === 0 ? '' : formData.telur_butir}
                  onChange={(e) => setFormData({ ...formData, telur_butir: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="0"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Telur (Kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.telur_kg === 0 ? '' : formData.telur_kg}
                  onChange={(e) => setFormData({ ...formData, telur_kg: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="0.0"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Pakan Diberikan (Kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.pakan_gr === 0 ? '' : formData.pakan_gr}
                  onChange={(e) => setFormData({ ...formData, pakan_gr: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="0.0"
                  required
                />
              </div>

              {/* Calculated Read-only */}
              <div className="bg-gray-50 p-4 rounded-lg md:col-span-1">
                <div className="text-sm text-gray-500">Estimasi HD%</div>
                <div className="text-xl font-bold text-gray-900">{calculatedStats.hd}%</div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg md:col-span-1">
                <div className="text-sm text-gray-500">Estimasi FCR</div>
                <div className="text-xl font-bold text-gray-900">{calculatedStats.fcr}</div>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                Keterangan
              </label>
              <textarea
                value={formData.keterangan}
                onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                rows={3}
                placeholder="Catatan tambahan..."
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Reset
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Simpan Laporan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Riwayat Laporan */}
      {activeTab === 'riwayat' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari berdasarkan kandang atau tanggal..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-700 whitespace-nowrap">Tanggal</th>
                  <th className="px-6 py-3 text-left text-gray-700 whitespace-nowrap">Kandang</th>
                  <th className="px-6 py-3 text-left text-gray-700 whitespace-nowrap">Produksi</th>
                  <th className="px-6 py-3 text-left text-gray-700 whitespace-nowrap">Pakan</th>
                  <th className="px-6 py-3 text-left text-gray-700 whitespace-nowrap">Performa</th>
                  <th className="px-6 py-3 text-left text-gray-700 whitespace-nowrap">Keterangan</th>
                  <th className="px-6 py-3 text-left text-gray-700 whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan={7} className="px-6 py-4 text-center">Memuat data...</td></tr>
                ) : filteredLaporan.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-4 text-center">Belum ada laporan</td></tr>
                ) : filteredLaporan.map((lap) => (
                  <tr key={lap.laporan_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900 whitespace-nowrap">
                      {new Date(lap.tanggal).toLocaleDateString(['id-ID'], {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-gray-900 whitespace-nowrap">{lap.nama_kandang}</td>
                    <td className="px-6 py-4 text-gray-900 whitespace-nowrap">
                      <div>{lap.telur_butir} butir</div>
                      <div className="text-sm text-gray-500">{lap.telur_kg} kg</div>
                    </td>
                    <td className="px-6 py-4 text-gray-900 whitespace-nowrap">{lap.pakan_gr} kg</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-500">HD:</span>
                          <span className="font-medium">{lap.hd_percent}%</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-500">FCR:</span>
                          <span className="font-medium">{lap.fcr}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-500">Mati:</span>
                          <span className="text-red-600 font-medium">{lap.ayam_mati}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap max-w-xs truncate" title={lap.keterangan}>{lap.keterangan}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleEdit(lap)}
                          className="text-blue-600 hover:text-blue-700 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(lap.laporan_id)}
                          className="text-red-600 hover:text-red-700 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <EditReportModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedReport(null);
        }}
        report={selectedReport}
        listAyam={listAyam}
        onSuccess={fetchData}
      />
    </div>
  );
}
