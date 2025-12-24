'use client';

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const produksiTelurData = [
  { bulan: 'Jun', produksi: 24500, target: 25000 },
  { bulan: 'Jul', produksi: 25200, target: 25000 },
  { bulan: 'Agu', produksi: 24800, target: 25000 },
  { bulan: 'Sep', produksi: 26100, target: 25000 },
  { bulan: 'Okt', produksi: 25900, target: 25000 },
  { bulan: 'Nov', produksi: 26500, target: 25000 },
];

const konsumsiPakanData = [
  { bulan: 'Jun', konsumsi: 3600, efisiensi: 95 },
  { bulan: 'Jul', konsumsi: 3550, efisiensi: 97 },
  { bulan: 'Agu', konsumsi: 3620, efisiensi: 94 },
  { bulan: 'Sep', konsumsi: 3580, efisiensi: 96 },
  { bulan: 'Okt', konsumsi: 3590, efisiensi: 96 },
  { bulan: 'Nov', konsumsi: 3570, efisiensi: 97 },
];

const kematianData = [
  { bulan: 'Jun', kematian: 12 },
  { bulan: 'Jul', kematian: 8 },
  { bulan: 'Agu', kematian: 15 },
  { bulan: 'Sep', kematian: 6 },
  { bulan: 'Okt', kematian: 9 },
  { bulan: 'Nov', kematian: 7 },
];

const performaKandangData = [
  { name: 'Kandang A1', produksi: 8500, fill: '#10b981' },
  { name: 'Kandang A2', produksi: 7950, fill: '#3b82f6' },
  { name: 'Kandang B1', produksi: 10200, fill: '#f59e0b' },
  { name: 'Kandang B2', produksi: 0, fill: '#ef4444' },
];

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

export function Analitik() {
  const totalProduksi = produksiTelurData.reduce((sum, d) => sum + d.produksi, 0);
  const avgProduksi = Math.round(totalProduksi / produksiTelurData.length);
  const totalKematian = kematianData.reduce((sum, d) => sum + d.kematian, 0);
  const mortalityRate = ((totalKematian / 3150) * 100).toFixed(2); // assuming 3150 total chickens

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Analitik</h1>
        <p className="text-gray-600">Dashboard analitik performa peternakan ayam petelur</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 mb-2">Rata-rata Produksi</div>
          <div className="text-gray-900">{avgProduksi.toLocaleString()} butir/bulan</div>
          <div className="text-green-600 mt-1">↑ 5.2% dari bulan lalu</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 mb-2">Efisiensi Pakan</div>
          <div className="text-gray-900">96.2%</div>
          <div className="text-green-600 mt-1">↑ 1.1% dari bulan lalu</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 mb-2">Mortality Rate</div>
          <div className="text-gray-900">{mortalityRate}%</div>
          <div className="text-green-600 mt-1">↓ 0.3% dari bulan lalu</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 mb-2">Kandang Produktif</div>
          <div className="text-gray-900">3 dari 4</div>
          <div className="text-yellow-600 mt-1">1 kandang perlu perbaikan</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Produksi Telur */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-900 mb-4">Produksi Telur (6 Bulan Terakhir)</h2>
          <div className="overflow-x-auto pb-2">
            <div className="min-w-[600px] h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={produksiTelurData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bulan" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="produksi" stroke="#10b981" strokeWidth={2} name="Produksi Aktual" />
                  <Line type="monotone" dataKey="target" stroke="#94a3b8" strokeDasharray="5 5" name="Target" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Konsumsi Pakan */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-900 mb-4">Konsumsi Pakan (kg)</h2>
          <div className="overflow-x-auto pb-2">
            <div className="min-w-[600px] h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={konsumsiPakanData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bulan" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="konsumsi" fill="#3b82f6" name="Konsumsi (kg)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Kematian Ayam */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-900 mb-4">Kematian Ayam (ekor)</h2>
          <div className="overflow-x-auto pb-2">
            <div className="min-w-[600px] h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={kematianData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bulan" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="kematian" stroke="#ef4444" strokeWidth={2} name="Kematian" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Performa Kandang */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-900 mb-4">Performa Kandang (Produksi Bulan Ini)</h2>
          <div className="overflow-x-auto pb-2">
            <div className="min-w-[600px] h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={performaKandangData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="produksi"
                  >
                    {performaKandangData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-gray-900 mb-4">Insights & Rekomendasi</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
            <div className="w-2 h-2 mt-2 rounded-full bg-green-600"></div>
            <div>
              <div className="text-gray-900">Produksi Meningkat</div>
              <p className="text-gray-600">
                Produksi telur bulan November mencapai 26,500 butir, melampaui target 6% dan meningkat 2.3% dari bulan sebelumnya.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
            <div className="w-2 h-2 mt-2 rounded-full bg-blue-600"></div>
            <div>
              <div className="text-gray-900">Efisiensi Pakan Optimal</div>
              <p className="text-gray-600">
                Tingkat efisiensi pakan mencapai 97%, menunjukkan performa yang sangat baik dalam Feed Conversion Ratio (FCR).
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg">
            <div className="w-2 h-2 mt-2 rounded-full bg-yellow-600"></div>
            <div>
              <div className="text-gray-900">Perhatian: Kandang B2</div>
              <p className="text-gray-600">
                Kandang B2 dalam kondisi rusak dan tidak beroperasi. Disarankan untuk segera melakukan perbaikan untuk meningkatkan kapasitas produksi.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
            <div className="w-2 h-2 mt-2 rounded-full bg-green-600"></div>
            <div>
              <div className="text-gray-900">Tingkat Kematian Rendah</div>
              <p className="text-gray-600">
                Mortality rate 1.81% masih dalam batas normal dan menunjukkan trend menurun, indikasi manajemen kesehatan yang baik.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}