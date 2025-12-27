'use client';

import { useState, useEffect } from 'react';
import { Edit2, Search, Home } from 'lucide-react';
import type { Kandang as KandangType } from '@/lib/types';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export function Kandang() {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [kandangData, setKandangData] = useState<KandangType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editForm, setEditForm] = useState<KandangType | null>(null);

  // States for Add Kandang
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({ nomor_kandang: '', kapasitas: '', lokasi: '' });

  // Confirm Dialog State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingDeleteInfo, setPendingDeleteInfo] = useState<{ id: string, nomor: string } | null>(null);

  // Fetch data from API
  const fetchKandang = async () => {
    try {
      const response = await fetch('/api/kandang');
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      setKandangData(data);
    } catch (error) {
      console.error('Error fetching kandang:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKandang();
  }, []);

  const handleAddKandang = async () => {
    try {
      const response = await fetch('/api/kandang', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomor_kandang: addForm.nomor_kandang,
          kapasitas: parseInt(addForm.kapasitas),
          lokasi: addForm.lokasi
        })
      });

      if (!response.ok) throw new Error('Failed to create kandang');

      await fetchKandang(); // Refresh data
      setIsAddModalOpen(false);
      setAddForm({ nomor_kandang: '', kapasitas: '', lokasi: '' });
      toast.success('Kandang berhasil ditambahkan!');
    } catch (error) {
      console.error('Error adding kandang:', error);
      toast.error('Gagal menambahkan kandang');
    }
  };

  const handleDelete = async (id: string, nomor: string) => {
    setPendingDeleteInfo({ id, nomor });
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteInfo) return;

    try {
      const response = await fetch(`/api/kandang?id=${pendingDeleteInfo.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal menghapus kandang');
      }

      await fetchKandang(); // Refresh data
      toast.success('Kandang berhasil dihapus!');
    } catch (error: any) {
      console.error('Error deleting kandang:', error);
      toast.error(error.message || 'Gagal menghapus kandang');
    }
  };

  const filteredKandang = kandangData.filter(kandang =>
    kandang.nomor_kandang.toLowerCase().includes(searchTerm.toLowerCase()) ||
    kandang.lokasi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (kandang: KandangType) => {
    setEditingId(kandang.kandang_id);
    setEditForm({ ...kandang });
  };

  const handleSave = async () => {
    if (editForm) {
      try {
        const response = await fetch('/api/kandang', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            kandang_id: editForm.kandang_id,
            nomor_kandang: editForm.nomor_kandang,
            kapasitas: editForm.kapasitas,
            lokasi: editForm.lokasi
          })
        });

        if (!response.ok) throw new Error('Failed to update kandang');

        setKandangData(kandangData.map(k =>
          k.kandang_id === editForm.kandang_id ? editForm : k
        ));
        setEditingId(null);
        setEditForm(null);
        toast.success('Data kandang berhasil diperbarui!');
      } catch (error) {
        console.error('Error updating kandang:', error);
        toast.error('Gagal mengupdate kandang');
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const totalKapasitas = kandangData.reduce((sum, k) => sum + k.kapasitas, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-gray-900 mb-2">Kandang</h1>
          <p className="text-gray-600">Master Data Kandang</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
        >
          <Home className="w-4 h-4" />
          Tambah Kandang
        </button>
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setPendingDeleteInfo(null);
        }}
        onConfirm={confirmDelete}
        title="Hapus Kandang"
        description={`Apakah Anda yakin ingin menghapus ${pendingDeleteInfo?.nomor}? Tindakan ini tidak dapat dibatalkan.`}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Home className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-gray-600">Total Kandang</div>
              <div className="text-gray-900">{kandangData.length} kandang</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 mb-2">Total Kapasitas</div>
          <div className="text-gray-900">{totalKapasitas.toLocaleString()} ekor</div>
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-2xl border border-gray-100">
            <h2 className="text-xl font-bold mb-4">Tambah Kandang Baru</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama/Nomor Kandang</label>
                <input
                  type="text"
                  value={addForm.nomor_kandang}
                  onChange={(e) => setAddForm({ ...addForm, nomor_kandang: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Contoh: Kandang C1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kapasitas</label>
                <input
                  type="number"
                  value={addForm.kapasitas === '' || addForm.kapasitas === '0' ? '' : addForm.kapasitas}
                  onChange={(e) => setAddForm({ ...addForm, kapasitas: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
                <input
                  type="text"
                  value={addForm.lokasi}
                  onChange={(e) => setAddForm({ ...addForm, lokasi: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Contoh: Blok C"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Batal
                </button>
                <button
                  onClick={handleAddKandang}
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
              placeholder="Cari berdasarkan nama kandang atau lokasi..."
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
                <th className="px-6 py-3 text-left text-gray-700 whitespace-nowrap">Nama Kandang (Nomor)</th>
                <th className="px-6 py-3 text-left text-gray-700 whitespace-nowrap">Kapasitas</th>
                <th className="px-6 py-3 text-left text-gray-700 whitespace-nowrap">Lokasi</th>
                <th className="px-6 py-3 text-left text-gray-700 whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center">Memuat data...</td>
                </tr>
              ) : filteredKandang.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center">Belum ada data kandang</td>
                </tr>
              ) : filteredKandang.map((kandang) => (
                <tr key={kandang.kandang_id} className="hover:bg-gray-50">
                  {editingId === kandang.kandang_id && editForm ? (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          value={editForm.nomor_kandang}
                          onChange={(e) => setEditForm({ ...editForm, nomor_kandang: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          value={editForm.kapasitas === 0 ? '' : editForm.kapasitas}
                          onChange={(e) => setEditForm({ ...editForm, kapasitas: parseInt(e.target.value) || 0 })}
                          className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          value={editForm.lokasi}
                          onChange={(e) => setEditForm({ ...editForm, lokasi: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={handleSave}
                            className="text-green-600 hover:text-green-700"
                          >
                            Simpan
                          </button>
                          <button
                            onClick={handleCancel}
                            className="text-gray-600 hover:text-gray-700"
                          >
                            Batal
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 text-gray-900 whitespace-nowrap">{kandang.nomor_kandang}</td>
                      <td className="px-6 py-4 text-gray-900 whitespace-nowrap">{kandang.kapasitas.toLocaleString()} ekor</td>
                      <td className="px-6 py-4 text-gray-900 whitespace-nowrap">{kandang.lokasi}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleEdit(kandang)}
                            className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(kandang.kandang_id, kandang.nomor_kandang)}
                            className="text-red-600 hover:text-red-700 flex items-center gap-1"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}