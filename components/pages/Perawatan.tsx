'use client';

import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Perawatan as PerawatanType } from '@/lib/types';

const mockPerawatan: PerawatanType[] = [
  {
    perawatan_id: '1',
    tanggal_perawatan: '2025-12-08',
    ayam_id: '1',
    nama_kandang: 'Kandang A1',
    jenis_perawatan: 'Vaksinasi',
    biaya: 1500000,
    keterangan: 'Vaksinasi ND (Newcastle Disease)'
  },
  {
    perawatan_id: '2',
    tanggal_perawatan: '2025-12-12',
    ayam_id: '3',
    nama_kandang: 'Kandang B1',
    jenis_perawatan: 'Perbaikan Atap',
    biaya: 500000,
    keterangan: 'Perbaikan atap bocor'
  }
];

export function Perawatan() {
  const [activeTab, setActiveTab] = useState<'input' | 'riwayat'>('input');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<PerawatanType>>({
    tanggal_perawatan: new Date().toISOString().split('T')[0],
    ayam_id: '',
    jenis_perawatan: '',
    biaya: 0,
    keterangan: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Data perawatan berhasil disimpan!');
    setFormData({
      tanggal_perawatan: new Date().toISOString().split('T')[0],
      ayam_id: '',
      jenis_perawatan: '',
      biaya: 0,
      keterangan: ''
    });
  };

  const filteredData = mockPerawatan.filter(data =>
    (data.nama_kandang?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
    data.jenis_perawatan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Perawatan & Operasional</h1>
        <p className="text-gray-600">Catat perawatan ayam, perbaikan kandang, dan biayanya</p>
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
          Input Perawatan
        </button>
        <button
          onClick={() => setActiveTab('riwayat')}
          className={`px-4 py-2 -mb-px ${activeTab === 'riwayat'
            ? 'border-b-2 border-green-600 text-green-600'
            : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          Riwayat Perawatan
        </button>
      </div>

      {/* Input Perawatan */}
      {activeTab === 'input' && (
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">
                  Tanggal <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.tanggal_perawatan}
                  onChange={(e) => setFormData({ ...formData, tanggal_perawatan: e.target.value })}
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
                  Jenis Perawatan <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.jenis_perawatan}
                  onChange={(e) => setFormData({ ...formData, jenis_perawatan: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Pilih Jenis</option>
                  <option value="Vaksinasi">Vaksinasi</option>
                  <option value="Obat/Vitamin">Obat/Vitamin</option>
                  <option value="Pembersihan">Pembersihan</option>
                  <option value="Perbaikan Kandang">Perbaikan Kandang</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Biaya (Rp)
                </label>
                <input
                  type="number"
                  value={formData.biaya}
                  onChange={(e) => setFormData({ ...formData, biaya: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                Keterangan <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.keterangan}
                onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                rows={4}
                placeholder="Detail kegiatan perawatan..."
                required
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
                Simpan Perawatan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Riwayat Perawatan */}
      {activeTab === 'riwayat' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari riwayat perawatan..."
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
                  <th className="px-6 py-3 text-left text-gray-700 whitespace-nowrap">Jenis</th>
                  <th className="px-6 py-3 text-left text-gray-700 whitespace-nowrap">Biaya</th>
                  <th className="px-6 py-3 text-left text-gray-700 whitespace-nowrap">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.map((data) => (
                  <tr key={data.perawatan_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900 whitespace-nowrap">{data.tanggal_perawatan}</td>
                    <td className="px-6 py-4 text-gray-900 whitespace-nowrap">{data.nama_kandang}</td>
                    <td className="px-6 py-4 text-gray-900 whitespace-nowrap">{data.jenis_perawatan}</td>
                    <td className="px-6 py-4 text-gray-900 whitespace-nowrap">
                      Rp {data.biaya.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{data.keterangan}</td>
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