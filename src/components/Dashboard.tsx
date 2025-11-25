import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1']

const formatAmount = (amount: number) => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`
  return `₹${amount.toLocaleString('en-IN')}`
}

// Use Vite env var for backend base URL. In production use VITE_API_BASE, in dev use proxy
const API_BASE = import.meta.env.VITE_API_BASE || '/api'
const api = axios.create({ 
  baseURL: API_BASE.startsWith('http') ? API_BASE + '/api' : API_BASE 
})

function Dashboard() {
  // Fetch SRB amount distribution
  const { data: amountData, isLoading: amountLoading } = useQuery({
    queryKey: ['srb-amount-distribution'],
    queryFn: async () => {
      const response = await api.get('/stats/srb-amount-distribution')
      return response.data
    },
  })

  // Fetch category distribution
  const { data: categoryData, isLoading: categoryLoading } = useQuery({
    queryKey: ['asset-by-category'],
    queryFn: async () => {
      const response = await api.get('/stats/asset-by-category')
      return response.data
    },
  })

  // Fetch summary stats
  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['summary'],
    queryFn: async () => {
      const response = await api.get('/stats/summary')
      return response.data
    },
  })

  if (amountLoading || categoryLoading || summaryLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Loading dashboard data...</div>
      </div>
    )
  }

  // Prepare data for amount distribution chart
  const amountChartData = amountData?.ranges ? [
    { name: '> ₹1 Crore', count: amountData.ranges.above1Cr.count, value: amountData.ranges.above1Cr.total },
    { name: '₹10L - ₹1Cr', count: amountData.ranges.between10LTo1Cr.count, value: amountData.ranges.between10LTo1Cr.total },
    { name: '₹1L - ₹10L', count: amountData.ranges.between1LTo10L.count, value: amountData.ranges.between1LTo10L.total },
    { name: '< ₹1 Lakh', count: amountData.ranges.below1L.count, value: amountData.ranges.below1L.total },
  ] : []

  // Prepare data for category pie chart (top 6 categories)
  const categoryChartData = categoryData?.categories.slice(0, 6).map((cat: any) => ({
    name: cat.category,
    value: cat.count,
  })) || []

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Total Assets</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{summaryData?.totalAssets || 0}</dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Active Assets</dt>
                <dd className="mt-1 text-3xl font-semibold text-green-600">{summaryData?.activeAssets || 0}</dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Total SRB Records</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">{summaryData?.totalSRBRecords || 0}</dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Total SRB Value</dt>
                <dd className="mt-1 text-2xl font-semibold text-blue-600">
                  {formatAmount(summaryData?.totalSRBAmount || 0)}
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Amount Distribution Cards */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">SRB Amount Distribution</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm font-medium text-blue-800">Assets &gt; ₹1 Crore</div>
            <div className="mt-2 text-3xl font-bold text-blue-900">
              {amountData?.ranges.above1Cr.count || 0}
            </div>
            <div className="mt-1 text-sm text-blue-600">
              Total: {formatAmount(amountData?.ranges.above1Cr.total || 0)}
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="text-sm font-medium text-purple-800">Assets ₹10L - ₹1Cr</div>
            <div className="mt-2 text-3xl font-bold text-purple-900">
              {amountData?.ranges.between10LTo1Cr.count || 0}
            </div>
            <div className="mt-1 text-sm text-purple-600">
              Total: {formatAmount(amountData?.ranges.between10LTo1Cr.total || 0)}
            </div>
          </div>

          <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
            <div className="text-sm font-medium text-pink-800">Assets ₹1L - ₹10L</div>
            <div className="mt-2 text-3xl font-bold text-pink-900">
              {amountData?.ranges.between1LTo10L.count || 0}
            </div>
            <div className="mt-1 text-sm text-pink-600">
              Total: {formatAmount(amountData?.ranges.between1LTo10L.total || 0)}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="text-sm font-medium text-amber-800">Assets &lt; ₹1 Lakh</div>
            <div className="mt-2 text-3xl font-bold text-amber-900">
              {amountData?.ranges.below1L.count || 0}
            </div>
            <div className="mt-1 text-sm text-amber-600">
              Total: {formatAmount(amountData?.ranges.below1L.total || 0)}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Amount Distribution Bar Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Assets by Amount Range</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={amountChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => value}
                labelFormatter={(label) => `Range: ${label}`}
              />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" name="Asset Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 6 Asset Categories</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryChartData.map((_: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Details Table */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Assets by Category</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asset Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categoryData?.categories.map((cat: any, index: number) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {cat.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cat.count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatAmount(cat.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatAmount(cat.totalAmount / cat.count)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
