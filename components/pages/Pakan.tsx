'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Calendar, DollarSign, Edit2, Trash2 } from 'lucide-react';
import { DataPakan } from '@/lib/types';
import { formatIDR, parseCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export function Pakan() {
  const [activeTab, setActiveTab] = useState<'input' | 'riwayat'>('input');
  const [searchTerm, setSearchTerm] = useState('');

  // Data State
  const [listPakan, setListPakan] = useState<DataPakan[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    jenis_pakan: '',
    tanggal: new Date().toISOString().split('T')[0],
    biaya_pakan: 0
  });

  // Confirm Dialog State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/pakan');
      if (response.ok) {
        const data = await response.json();
        setListPakan(data);
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
      const url = '/api/pakan';
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId
        ? { ...formData, pakan_id: editingId }
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
      const response = await fetch(`/api/pakan?id=${pendingDeleteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal menghapus data');
      }
      await fetchData();
      toast.success('Data pembelian berhasil dihapus!');
    } catch (error: any) {
      console.error('Error deleting data:', error);
      toast.error(`Gagal menghapus data: ${error.message}`);
    }
  };

  const handleEdit = (data: DataPakan) => {
    setEditingId(data.pakan_id);
    setFormData({
      jenis_pakan: data.jenis_pakan,
      tanggal: data.tanggal.split('T')[0],
      biaya_pakan: data.biaya_pakan
    });
    setActiveTab('input');
  };

  const handleReset = () => {
    setEditingId(null);
    setFormData({
      jenis_pakan: '',
      tanggal: new Date().toISOString().split('T')[0],
      biaya_pakan: 0
    });
  };

  const filteredPakan = listPakan.filter(pakan =>
    pakan.jenis_pakan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate total cost for current month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const totalBiayaBulanIni = listPakan
    .filter(p => {
      const d = new Date(p.tanggal);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, p) => sum + (Number(p.biaya_pakan) || 0), 0);

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
              {formatIDR(totalBiayaBulanIni)}
            </div>
          </div>
          <DollarSign className="w-10 h-10 text-green-500" />
        </div>
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setPendingDeleteId(null);
        }}
        onConfirm={confirmDelete}
        title="Hapus Data Pembelian"
        description="Apakah Anda yakin ingin menghapus data pembelian ini? Tindakan ini tidak dapat dibatalkan."
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
          {editingId ? 'Edit Pembelian' : 'Input Pembelian'}
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
            <h2 className="text-lg font-semibold mb-4">{editingId ? 'Edit Data Pembelian' : 'Form Pembelian Pakan'}</h2>
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
                  Biaya Total <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.biaya_pakan === 0 ? '' : Number(formData.biaya_pakan).toLocaleString('id-ID')}
                    onChange={(e) => {
                      const value = parseCurrency(e.target.value);
                      setFormData({ ...formData, biaya_pakan: value });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Contoh: 20.000"
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                    (Biaya dalam Rupiah)
                  </div>
                </div>
              </div>
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
                {editingId ? 'Simpan Perubahan' : 'Simpan Transaksi'}
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
                  <th className="px-6 py-3 text-left text-gray-700 whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr key="loading"><td colSpan={4} className="px-6 py-4 text-center">Memuat data...</td></tr>
                ) : filteredPakan.length === 0 ? (
                  <tr key="empty"><td colSpan={4} className="px-6 py-4 text-center">Belum ada data pembelian</td></tr>
                ) : filteredPakan.map((pakan) => (
                  <tr key={pakan.pakan_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900 whitespace-nowrap">
                      {new Date(pakan.tanggal).toLocaleDateString(['id-ID'], {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 text-gray-900 whitespace-nowrap">{pakan.jenis_pakan}</td>
                    <td className="px-6 py-4 text-gray-900 whitespace-nowrap">
                      {formatIDR(Number(pakan.biaya_pakan) || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(pakan)}
                          className="text-blue-600 hover:text-blue-700" title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(pakan.pakan_id)}
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