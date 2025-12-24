'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Calendar } from 'lucide-react';
import { LaporanHarian as LaporanHarianType } from '@/lib/types';

const mockLaporan: LaporanHarianType[] = [
  {
    laporan_id: '1',
    tanggal: '2025-12-08',
    ayam_id: '1', // Refers to Ayam in Kandang A1
    nama_kandang: 'Kandang A1',
    telur_butir: 850,
    telur_kg: 51,
    pakan_gr: 120, // Gram per ekor? Or total kg? ERD says pakan_gr, usually gram/ekor or total gram. Assuming gram/ekor for input, or total? Let's assume total kg input for ease, converted to gr for DB? The prompt says "pakan_gr". Let's use gram input per bird or total kg.
    // If "pakan_gr", it usually means per bird daily intake (e.g. 110-120g).
    // But for a daily report, you usually measure total sacks used (kg).
    // Let's assume the INPUT is "Total Pakan (kg)" and we store it, OR we stick to the name "pakan_gr" which might be per bird.
    // Let's stick to valid interpretation: "Total Konsumsi (kg)" is easier to measure. "pakan_gr" might be the calculated Average Daily Intake (ADI).
    // However, the ERD just says "pakan_gr". I will provide an input for "Total Pakan (kg)" and maybe save it as total grams? Or just rename UI to "Pakan (gram/ekor)"?
    // Let's assume standard farm recording: Total Feed (kg).
    // I will add a clarifying label.
    ayam_hidup: 998,
    ayam_mati: 0,
    fcr: 0, // Calculated
    hd_percent: 85, // Calculated
    keterangan: 'Normal'
  }
];

export function LaporanHarian() {
  const [activeTab, setActiveTab] = useState<'input' | 'riwayat'>('input');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<LaporanHarianType>>({
    tanggal: new Date().toISOString().split('T')[0],
    ayam_id: '',
    telur_butir: 0,
    telur_kg: 0,
    ayam_hidup: 0,
    ayam_mati: 0,
    pakan_gr: 0, // Using this as field carrier
    keterangan: ''
  });

  // Calculate FCR and HD% live
  const [calculatedStats, setCalculatedStats] = useState({ fcr: 0, hd: 0 });

  useEffect(() => {
    // Simple logic:
    // HD% = (Telur Butir / Ayam Hidup) * 100
    // FCR = Total Pakan (kg) / Total Telur (kg) -> usually FCR is Feed/Gain (broiler) or Feed/Egg Mass (layer). For layers, often kg Feed / kg Egg.

    // NOTE: The formData.pakan_gr is ambiguous. If user inputs '120', is it 120kg total?
    // If ayam_hidup = 1000, 120g/bird = 120kg total.
    // Let's assume the input is "Total Pakan (kg)" for easier daily ops, but mapped to pakan_gr field?.
    // actually let's treat pakan_gr as "Total Pakan dalam Gram" in DB? Or "Gram per ekor"?
    // I will use "Total Pakan (kg)" in UI and store in pakan_gr (maybe as kg * 1000 if strict, or just modify semantics).
    // Let's treat pakan_gr field as "Konsumsi Pakan (kg)" for now to be safe, or assume strict text.

    const telurButir = Number(formData.telur_butir || 0);
    const telurKg = Number(formData.telur_kg || 0);
    const ayamHidup = Number(formData.ayam_hidup || 0);
    const pakanKg = Number(formData.pakan_gr || 0); // Assuming input is KG

    let hd = 0;
    if (ayamHidup > 0) {
      hd = (telurButir / ayamHidup) * 100;
    }

    let fcr = 0;
    if (telurKg > 0) {
      fcr = pakanKg / telurKg;
    }

    setCalculatedStats({
      hd: parseFloat(hd.toFixed(2)),
      fcr: parseFloat(fcr.toFixed(2))
    });

  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Laporan berhasil disimpan! (Mock)');
    // Reset
    setFormData({
      tanggal: new Date().toISOString().split('T')[0],
      ayam_id: '',
      telur_butir: 0,
      telur_kg: 0,
      ayam_hidup: 0,
      ayam_mati: 0,
      pakan_gr: 0,
      keterangan: ''
    });
  };

  const filteredLaporan = mockLaporan.filter(lap =>
    (lap.nama_kandang?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
    lap.tanggal.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Laporan Harian</h1>
        <p className="text-gray-600">Catat produksi telur dan pakan harian</p>
      </div>

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
                  onChange={(e) => setFormData({ ...formData, ayam_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Pilih Kandang</option>
                  <option value="1">Kandang A1</option>
                  <option value="2">Kandang A2</option>
                  <option value="3">Kandang B1</option>
                  <option value="4">Kandang B2</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Populasi Awal (Ekor) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.ayam_hidup}
                  onChange={(e) => setFormData({ ...formData, ayam_hidup: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="0"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Kematian (Ekor)
                </label>
                <input
                  type="number"
                  value={formData.ayam_mati}
                  onChange={(e) => setFormData({ ...formData, ayam_mati: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Telur (Butir) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.telur_butir}
                  onChange={(e) => setFormData({ ...formData, telur_butir: parseFloat(e.target.value) })}
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
                  value={formData.telur_kg}
                  onChange={(e) => setFormData({ ...formData, telur_kg: parseFloat(e.target.value) })}
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
                  value={formData.pakan_gr}
                  onChange={(e) => setFormData({ ...formData, pakan_gr: parseFloat(e.target.value) })}
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLaporan.map((lap) => (
                  <tr key={lap.laporan_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900 whitespace-nowrap">{lap.tanggal}</td>
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
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{lap.keterangan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
