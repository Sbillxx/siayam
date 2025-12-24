'use client';

import { useState } from 'react';
import { Plus, Search, Calendar, DollarSign } from 'lucide-react';
import { DataPakan } from '@/lib/types';

const mockPakan: DataPakan[] = [
  {
    pakan_id: '1',
    jenis_pakan: 'Layer Starter',
    tanggal: '2025-12-08',
    biaya_pakan: 8500000
  },
  {
    pakan_id: '2',
    jenis_pakan: 'Layer Grower',
    tanggal: '2025-12-05',
    biaya_pakan: 6000000
  }
];

export function Pakan() {
  const [activeTab, setActiveTab] = useState<'input' | 'riwayat'>('input');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<DataPakan>>({
    jenis_pakan: '',
    tanggal: new Date().toISOString().split('T')[0],
    biaya_pakan: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Data pembelian pakan berhasil disimpan!');
    setFormData({
      jenis_pakan: '',
      tanggal: new Date().toISOString().split('T')[0],
      biaya_pakan: 0
    });
  };

  const filteredPakan = mockPakan.filter(pakan =>
    pakan.jenis_pakan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalBiaya = mockPakan.reduce((sum, p) => sum + p.biaya_pakan, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Pakan</h1>
        <p className="text-gray-600">Catat pembelian dan biaya pakan</p>
      </div>

      {/* Summary Cards */}
      <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-gray-600 mb-1">Total Biaya Pakan (Bulan Ini)</div>
            <div className="text-gray-900 text-2xl font-bold">
              Rp {totalBiaya.toLocaleString()}
            </div>
          </div>
          <DollarSign className="w-10 h-10 text-green-500" />
        </div>
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
          Input Pembelian
        </button>
        <button
          onClick={() => setActiveTab('riwayat')}
          className={`px-4 py-2 -mb-px ${activeTab === 'riwayat'
            ? 'border-b-2 border-green-600 text-green-600'
            : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          Riwayat Pembelian
        </button>
      </div>

      {/* Input Pakan */}
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
                  Jenis Pakan <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.jenis_pakan}
                  onChange={(e) => setFormData({ ...formData, jenis_pakan: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Pilih Jenis</option>
                  <option value="Pre-Starter">Pre-Starter</option>
                  <option value="Starter">Starter</option>
                  <option value="Grower">Grower</option>
                  <option value="Layer 1">Layer 1</option>
                  <option value="Layer 2">Layer 2</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Biaya Total (Rp) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rp</span>
                  <input
                    type="number"
                    value={formData.biaya_pakan}
                    onChange={(e) => setFormData({ ...formData, biaya_pakan: parseFloat(e.target.value) })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="0"
                    required
                  />
                </div>
              </div>
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
                Simpan Transaksi
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Riwayat Pakan */}
      {activeTab === 'riwayat' && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari berdasarkan jenis pakan..."
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
                  <th className="px-6 py-3 text-left text-gray-700 whitespace-nowrap">Jenis Pakan</th>
                  <th className="px-6 py-3 text-left text-gray-700 whitespace-nowrap">Biaya</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPakan.map((pakan) => (
                  <tr key={pakan.pakan_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900 whitespace-nowrap">{pakan.tanggal}</td>
                    <td className="px-6 py-4 text-gray-900 whitespace-nowrap">{pakan.jenis_pakan}</td>
                    <td className="px-6 py-4 text-gray-900 whitespace-nowrap">
                      Rp {pakan.biaya_pakan.toLocaleString()}
                    </td>
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