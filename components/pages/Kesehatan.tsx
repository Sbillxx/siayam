'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, AlertCircle, Trash2, Edit2 } from 'lucide-react';
import { CekKesehatan, Ayam } from '@/lib/types';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export function Kesehatan() {
  const [activeTab, setActiveTab] = useState<'cek' | 'riwayat'>('cek');
  const [searchTerm, setSearchTerm] = useState('');
  const [listKesehatan, setListKesehatan] = useState<CekKesehatan[]>([]);
  const [listAyam, setListAyam] = useState<Ayam[]>([]); // Dropdown choices
  const [loading, setLoading] = useState(true);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    ayam_id: '',
    jum_sakit: 0,
    jum_mati: 0,
    catatan: ''
  });

  // Confirm Dialog State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resKesehatan, resAyam] = await Promise.all([
        fetch('/api/kesehatan'),
        fetch('/api/ayam') // We need ayam_id to link health check to a batch/cage
      ]);

      if (resKesehatan.ok) {
        const data = await resKesehatan.json();
        setListKesehatan(data);
      }
      if (resAyam.ok) {
        const data = await resAyam.json();
        setListAyam(data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = '/api/kesehatan';
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId
        ? { ...formData, cek_id: editingId }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal menyimpan data');
      }

      await fetchData();
      toast.success(`Data berhasil ${editingId ? 'diperbarui' : 'disimpan'}!`);
      handleReset();
      setActiveTab('riwayat'); // Switch to history to see result
    } catch (error: any) {
      console.error('Error saving data:', error);
      toast.error(`Gagal menyimpan data: ${error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    setPendingDeleteId(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;

    try {
      const response = await fetch(`/api/kesehatan?id=${pendingDeleteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal menghapus data');
      }
      await fetchData();
      toast.success('Data berhasil dihapus!');
    } catch (error: any) {
      console.error('Error deleting data:', error);
      toast.error(`Gagal menghapus data: ${error.message}`);
    }
  };

  const handleEdit = (data: CekKesehatan) => {
    setEditingId(data.cek_id);
    setFormData({
      tanggal: data.tanggal.split('T')[0], // Ensure date format for input
      ayam_id: data.ayam_id,
      jum_sakit: data.jum_sakit,
      jum_mati: data.jum_mati,
      catatan: data.catatan
    });
    setActiveTab('cek'); // Switch to input form
  };

  const handleReset = () => {
    setEditingId(null);
    setFormData({
      tanggal: new Date().toISOString().split('T')[0],
      ayam_id: '',
      jum_sakit: 0,
      jum_mati: 0,
      catatan: ''
    });
  };

  const filteredKesehatan = listKesehatan.filter(data =>
    (data.nama_kandang?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
    data.catatan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Kesehatan Ayam</h1>
        <p className="text-gray-600">Monitor kesehatan dan kematian harian</p>
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setPendingDeleteId(null);
        }}
        onConfirm={confirmDelete}
        title="Hapus Data Kesehatan"
        description="Apakah Anda yakin ingin menghapus riwayat kesehatan ini? Tindakan ini tidak dapat dibatalkan."
      />

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-600 mb-1">Total Sakit (Semua)</div>
              <div className="text-gray-900 text-2xl font-bold">
                {listKesehatan.reduce((acc, curr) => acc + curr.jum_sakit, 0)} ekor
              </div>
            </div>
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-gray-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-600 mb-1">Total Kematian (Semua)</div>
              <div className="text-gray-900 text-2xl font-bold">
                {listKesehatan.reduce((acc, curr) => acc + curr.jum_mati, 0)} ekor
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
          {editingId ? 'Edit Data' : 'Input Kesehatan'}
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
            <h2 className="text-lg font-semibold mb-4">{editingId ? 'Edit Data Kesehatan' : 'Form Cek Kesehatan'}</h2>
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
                  <option value="">-- Pilih Kandang/Batch Ayam --</option>
                  {listAyam.map(ayam => (
                    <option key={ayam.ayam_id} value={ayam.ayam_id}>
                      {ayam.kandang?.nomor_kandang || 'Unknown Kandang'} (Populasi: {ayam.jumlah_ayam})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Jumlah Ayam Sakit
                </label>
                <input
                  type="number"
                  value={formData.jum_sakit === 0 ? '' : formData.jum_sakit}
                  onChange={(e) => setFormData({ ...formData, jum_sakit: parseInt(e.target.value) || 0 })}
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
                  value={formData.jum_mati === 0 ? '' : formData.jum_mati}
                  onChange={(e) => setFormData({ ...formData, jum_mati: parseInt(e.target.value) || 0 })}
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
                onClick={handleReset}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
              >
                Batal / Reset
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {editingId ? 'Update Data' : 'Simpan Data'}
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
                  <th className="px-6 py-3 text-left text-gray-700 whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr key="loading"><td colSpan={6} className="px-6 py-4 text-center">Memuat data...</td></tr>
                ) : filteredKesehatan.length === 0 ? (
                  <tr key="empty"><td colSpan={6} className="px-6 py-4 text-center">Belum ada riwayat kesehatan</td></tr>
                ) : filteredKesehatan.map((data) => (
                  <tr key={data.cek_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900 whitespace-nowrap">
                      {new Date(data.tanggal).toLocaleDateString(['id-ID'], {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-gray-900 whitespace-nowrap">{data.nama_kandang}</td>
                    <td className="px-6 py-4 text-gray-900 whitespace-nowrap">{data.jum_sakit} ekor</td>
                    <td className="px-6 py-4 text-red-600 whitespace-nowrap">{data.jum_mati} ekor</td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap max-w-xs truncate" title={data.catatan}>{data.catatan}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(data)}
                          className="text-blue-600 hover:text-blue-700" title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(data.cek_id)}
                          className="text-red-600 hover:text-red-700" title="Hapus"
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
    </div>
  );
}