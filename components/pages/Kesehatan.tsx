'use client';

import { useState } from 'react';
import { Plus, Search, AlertCircle } from 'lucide-react';
import { CekKesehatan } from '@/lib/types';

const mockKesehatan: CekKesehatan[] = [
  {
    cek_id: '1',
    tanggal: '2025-12-08',
    ayam_id: '1',
    nama_kandang: 'Kandang A1',
    jum_sakit: 0,
    jum_mati: 0,
    catatan: 'Normal'
  },
  {
    cek_id: '2',
    tanggal: '2025-12-07',
    ayam_id: '2',
    nama_kandang: 'Kandang A2',
    jum_sakit: 5,
    jum_mati: 1,
    catatan: 'Beberapa ayam terlihat lesu disaat pagi hari'
  }
];

export function Kesehatan() {
  const [activeTab, setActiveTab] = useState<'cek' | 'riwayat'>('cek');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<CekKesehatan>>({
    tanggal: new Date().toISOString().split('T')[0],
    ayam_id: '',
    jum_sakit: 0,
    jum_mati: 0,
    catatan: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Data kesehatan berhasil disimpan!');
    setFormData({
      tanggal: new Date().toISOString().split('T')[0],
      ayam_id: '',
      jum_sakit: 0,
      jum_mati: 0,
      catatan: ''
    });
  };

  const filteredKesehatan = mockKesehatan.filter(data =>
    (data.nama_kandang?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
    data.catatan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Kesehatan Ayam</h1>
        <p className="text-gray-600">Monitor kesehatan dan kematian harian</p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-600 mb-1">Total Sakit (7 Hari)</div>
              <div className="text-gray-900">
                {mockKesehatan.reduce((acc, curr) => acc + curr.jum_sakit, 0)} ekor
              </div>
            </div>
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-gray-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-600 mb-1">Total Kematian (7 Hari)</div>
              <div className="text-gray-900">
                {mockKesehatan.reduce((acc, curr) => acc + curr.jum_mati, 0)} ekor
              </div>
            </div>
            <AlertCircle className="w-10 h-10 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('cek')}
          className={`px-4 py-2 -mb-px ${activeTab === 'cek'
            ? 'border-b-2 border-green-600 text-green-600'
            : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          Input Kesehatan
        </button>
        <button
          onClick={() => setActiveTab('riwayat')}
          className={`px-4 py-2 -mb-px ${activeTab === 'riwayat'
            ? 'border-b-2 border-green-600 text-green-600'
            : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          Riwayat Kesehatan
        </button>
      </div>

      {/* Input Kesehatan Form */}
      {activeTab === 'cek' && (
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">
                  Tanggal <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.tanggal}
                  onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
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
                  Jumlah Ayam Sakit
                </label>
                <input
                  type="number"
                  value={formData.jum_sakit}
                  onChange={(e) => setFormData({ ...formData, jum_sakit: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Jumlah Ayam Mati
                </label>
                <input
                  type="number"
                  value={formData.jum_mati}
                  onChange={(e) => setFormData({ ...formData, jum_mati: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                Catatan / Keterangan
              </label>
              <textarea
                value={formData.catatan}
                onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                rows={3}
                placeholder="Deskripsikan gejala atau catatan tambahan..."
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
                Simpan Data
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Riwayat Kesehatan */}
      {activeTab === 'riwayat' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari berdasarkan kandang atau catatan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-700 whitespace-nowrap">Tanggal</th>
                  <th className="px-6 py-3 text-left text-gray-700 whitespace-nowrap">Kandang</th>
                  <th className="px-6 py-3 text-left text-gray-700 whitespace-nowrap">Sakit</th>
                  <th className="px-6 py-3 text-left text-gray-700 whitespace-nowrap">Mati</th>
                  <th className="px-6 py-3 text-left text-gray-700 whitespace-nowrap">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredKesehatan.map((data) => (
                  <tr key={data.cek_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900 whitespace-nowrap">{data.tanggal}</td>
                    <td className="px-6 py-4 text-gray-900 whitespace-nowrap">{data.nama_kandang}</td>
                    <td className="px-6 py-4 text-gray-900 whitespace-nowrap">{data.jum_sakit} ekor</td>
                    <td className="px-6 py-4 text-red-600 whitespace-nowrap">{data.jum_mati} ekor</td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{data.catatan}</td>
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