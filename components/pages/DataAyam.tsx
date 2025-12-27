'use client';

import { useState, useEffect } from 'react';
import { Edit2, Search, Plus, Trash2 } from 'lucide-react';
import { Ayam, Kandang } from '@/lib/types';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export function DataAyam() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dataAyam, setDataAyam] = useState<Ayam[]>([]);
  const [listKandang, setListKandang] = useState<Kandang[]>([]); // For dropdown
  const [loading, setLoading] = useState(true);

  // States for Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Forms
  const [formData, setFormData] = useState({ kandang_id: '', jumlah_ayam: '' });

  // Confirm Dialog State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // Fetch Data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [resAyam, resKandang] = await Promise.all([
        fetch('/api/ayam'),
        fetch('/api/kandang')
      ]);

      if (resAyam.ok) {
        const ayam = await resAyam.json();
        setDataAyam(ayam);
      }
      if (resKandang.ok) {
        const kandang = await resKandang.json();
        setListKandang(kandang);
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

  const handleAdd = async () => {
    if (!formData.kandang_id || !formData.jumlah_ayam) {
      alert('Mohon lengkapi data');
      return;
    }

    try {
      const response = await fetch('/api/ayam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kandang_id: formData.kandang_id,
          jumlah_ayam: parseInt(formData.jumlah_ayam)
        })
      });

      if (!response.ok) throw new Error('Failed to add data');

      await fetchData();
      toast.success('Data berhasil ditambahkan!');
      setIsAddModalOpen(false);
      setFormData({ kandang_id: '', jumlah_ayam: '' });
    } catch (error) {
      console.error('Error adding data:', error);
      toast.error('Gagal menambahkan data');
    }
  };

  const handleUpdate = async () => {
    if (!editingId || !formData.kandang_id || !formData.jumlah_ayam) return;

    try {
      const response = await fetch('/api/ayam', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ayam_id: editingId,
          kandang_id: formData.kandang_id,
          jumlah_ayam: parseInt(formData.jumlah_ayam)
        })
      });

      if (!response.ok) throw new Error('Failed to update data');

      await fetchData();
      toast.success('Data berhasil diperbarui!');
      setEditingId(null);
      setFormData({ kandang_id: '', jumlah_ayam: '' });
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error updating data:', error);
      toast.error('Gagal mengupdate data');
    }
  };

  const handleDelete = async (id: string) => {
    setPendingDeleteId(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;

    try {
      const response = await fetch(`/api/ayam?id=${pendingDeleteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete data');
      }
      await fetchData();
      toast.success('Data ayam berhasil dihapus!');
    } catch (error: any) {
      console.error('Error deleting data:', error);
      toast.error(`Gagal menghapus data: ${error.message}`);
    }
  };

  const openEditModal = (data: Ayam) => {
    setEditingId(data.ayam_id);
    setFormData({
      kandang_id: data.kandang_id,
      jumlah_ayam: (data.jumlah_ayam || 0).toString()
    });
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingId(null);
    setFormData({ kandang_id: '', jumlah_ayam: '' });
  };

  const filteredData = dataAyam.filter(data =>
    (data.kandang?.nomor_kandang || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAyam = dataAyam.reduce((sum, data) => sum + (data.jumlah_ayam || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-gray-900 mb-2">Data Ayam</h1>
          <p className="text-gray-600">Populasi Ayam per Kandang</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
        >
          <Plus className="w-4 h-4" />
          Tambah Data
        </button>
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setPendingDeleteId(null);
        }}
        onConfirm={confirmDelete}
        title="Hapus Data Ayam"
        description="Apakah Anda yakin ingin menghapus data populasi ayam ini? Tindakan ini tidak dapat dibatalkan."
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 mb-2">Total Ayam</div>
          <div className="text-gray-900">{totalAyam.toLocaleString()} ekor</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 mb-2">Total Kandang Terisi</div>
          <div className="text-gray-900">{dataAyam.length} kandang</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 mb-2">Rata-rata per Kandang</div>
          <div className="text-gray-900">
            {dataAyam.length > 0 ? Math.round(totalAyam / dataAyam.length).toLocaleString() : 0} ekor
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Data Ayam' : 'Tambah Data Ayam'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Kandang</label>
                <select
                  value={formData.kandang_id}
                  onChange={(e) => setFormData({ ...formData, kandang_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">-- Pilih Kandang --</option>
                  {listKandang.map(k => (
                    <option key={k.kandang_id} value={k.kandang_id}>
                      {k.nomor_kandang} (Kapasitas: {k.kapasitas})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Ayam</label>
                <input
                  type="number"
                  value={formData.jumlah_ayam}
                  onChange={(e) => setFormData({ ...formData, jumlah_ayam: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="0"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Batal
                </button>
                <button
                  onClick={editingId ? handleUpdate : handleAdd}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan kandang..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-gray-700 whitespace-nowrap">Kandang</th>
                <th className="px-6 py-3 text-left text-gray-700 whitespace-nowrap">Jumlah Ayam</th>
                <th className="px-6 py-3 text-left text-gray-700 whitespace-nowrap">Terakhir Update</th>
                <th className="px-6 py-3 text-left text-gray-700 whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr key="loading"><td colSpan={4} className="px-6 py-4 text-center">Memuat data...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr key="empty"><td colSpan={4} className="px-6 py-4 text-center">Belum ada data</td></tr>
              ) : filteredData.map((data) => (
                <tr key={data.ayam_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-900 whitespace-nowrap">
                    {data.kandang?.nomor_kandang || '(Kandang dihapus/Invalid)'}
                    <span className="text-xs text-gray-500 block">{data.kandang?.lokasi || '-'}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-900 whitespace-nowrap">{(data.jumlah_ayam || 0).toLocaleString()} ekor</td>
                  <td className="px-6 py-4 text-gray-900 whitespace-nowrap">
                    {data.updated_at ? new Date(data.updated_at).toLocaleDateString(['id-ID'], {
                      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    }) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(data)}
                        className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(data.ayam_id)}
                        className="text-red-600 hover:text-red-700 flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}