'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { Perawatan as PerawatanType, Ayam } from '@/lib/types';
import { formatIDR, parseCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export function Perawatan() {
  const [activeTab, setActiveTab] = useState<'input' | 'riwayat'>('input');
  const [searchTerm, setSearchTerm] = useState('');

  // Data States
  const [listPerawatan, setListPerawatan] = useState<PerawatanType[]>([]);
  const [listAyam, setListAyam] = useState<Ayam[]>([]); // For Dropdown
  const [loading, setLoading] = useState(true);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    tanggal_perawatan: new Date().toISOString().split('T')[0],
    ayam_id: '',
    jenis_perawatan: '',
    biaya: 0,
    keterangan: ''
  });

  // Confirm Dialog State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resPerawatan, resAyam] = await Promise.all([
        fetch('/api/perawatan'),
        fetch('/api/ayam')
      ]);

      if (resPerawatan.ok) {
        const data = await resPerawatan.json();
        setListPerawatan(data);
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
      const url = '/api/perawatan';
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId
        ? { ...formData, perawatan_id: editingId }
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
      setActiveTab('riwayat');
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
      const response = await fetch(`/api/perawatan?id=${pendingDeleteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal menghapus data');
      }
      await fetchData();
      toast.success('Data perawatan berhasil dihapus!');
    } catch (error: any) {
      console.error('Error deleting data:', error);
      toast.error(`Gagal menghapus data: ${error.message}`);
    }
  };

  const handleEdit = (data: PerawatanType) => {
    setEditingId(data.perawatan_id);
    setFormData({
      tanggal_perawatan: data.tanggal_perawatan.split('T')[0],
      ayam_id: data.ayam_id,
      jenis_perawatan: data.jenis_perawatan,
      biaya: data.biaya,
      keterangan: data.keterangan || ''
    });
    setActiveTab('input');
  };

  const handleReset = () => {
    setEditingId(null);
    setFormData({
      tanggal_perawatan: new Date().toISOString().split('T')[0],
      ayam_id: '',
      jenis_perawatan: '',
      biaya: 0,
      keterangan: ''
    });
  };

  const filteredData = listPerawatan.filter(data =>
    (data.nama_kandang?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
    data.jenis_perawatan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Perawatan & Operasional</h1>
        <p className="text-gray-600">Catat perawatan ayam, perbaikan kandang, dan biayanya</p>
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setPendingDeleteId(null);
        }}
        onConfirm={confirmDelete}
        title="Hapus Data Perawatan"
        description="Apakah Anda yakin ingin menghapus riwayat perawatan ini? Tindakan ini tidak dapat dibatalkan."
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
          {editingId ? 'Edit Perawatan' : 'Input Perawatan'}
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
            <h2 className="text-lg font-semibold mb-4">{editingId ? 'Edit Data Perawatan' : 'Form Input Perawatan'}</h2>
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
                  <option value="">-- Pilih Kandang --</option>
                  {listAyam.map(ayam => (
                    <option key={ayam.ayam_id} value={ayam.ayam_id}>
                      {ayam.kandang?.nomor_kandang || 'Unknown'} (Populasi: {ayam.jumlah_ayam})
                    </option>
                  ))}
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
                  type="text"
                  value={formData.biaya === 0 ? '' : Number(formData.biaya).toLocaleString('id-ID')}
                  onChange={(e) => {
                    const value = parseCurrency(e.target.value);
                    setFormData({ ...formData, biaya: value });
                  }}
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
                {editingId ? 'Simpan Perubahan' : 'Simpan Perawatan'}
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
                  <th className="px-6 py-3 text-left text-gray-700 whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr key="loading"><td colSpan={6} className="px-6 py-4 text-center">Memuat data...</td></tr>
                ) : filteredData.length === 0 ? (
                  <tr key="empty"><td colSpan={6} className="px-6 py-4 text-center">Belum ada riwayat perawatan</td></tr>
                ) : filteredData.map((data) => (
                  <tr key={data.perawatan_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900 whitespace-nowrap">
                      {new Date(data.tanggal_perawatan).toLocaleDateString(['id-ID'], {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-gray-900 whitespace-nowrap">{data.nama_kandang}</td>
                    <td className="px-6 py-4 text-gray-900 whitespace-nowrap">{data.jenis_perawatan}</td>
                    <td className="px-6 py-4 text-gray-900 whitespace-nowrap">
                      {formatIDR(Number(data.biaya) || 0)}
                    </td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap max-w-xs truncate" title={data.keterangan}>{data.keterangan}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(data)}
                          className="text-blue-600 hover:text-blue-700" title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(data.perawatan_id)}
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