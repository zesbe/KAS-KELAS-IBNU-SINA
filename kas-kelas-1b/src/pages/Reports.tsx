import React, { useEffect, useState } from 'react';
import { Download, Calendar, TrendingUp, Users, DollarSign } from 'lucide-react';
import { transactionService } from '../services/transactionService';
import { studentService } from '../services/studentService';
import { paymentTypeService } from '../services/paymentTypeService';
import { Transaction, Student, PaymentType } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const Reports: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [transactionsData, studentsData, paymentTypesData] = await Promise.all([
        transactionService.getAll(),
        studentService.getAll(),
        paymentTypeService.getAll()
      ]);

      setTransactions(transactionsData);
      setStudents(studentsData);
      setPaymentTypes(paymentTypesData);
    } catch (error) {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  // Filter transactions by selected month
  const filteredTransactions = transactions.filter(t => {
    const transactionMonth = new Date(t.created_at).toISOString().slice(0, 7);
    return transactionMonth === selectedMonth;
  });

  // Calculate statistics
  const completedTransactions = filteredTransactions.filter(t => t.status === 'completed');
  const totalRevenue = completedTransactions.reduce((sum, t) => sum + t.amount, 0);
  const averagePayment = completedTransactions.length > 0 ? totalRevenue / completedTransactions.length : 0;

  // Payment type distribution
  const paymentTypeData = paymentTypes.map(type => {
    const typeTransactions = completedTransactions.filter(t => t.payment_type_id === type.id);
    const total = typeTransactions.reduce((sum, t) => sum + t.amount, 0);
    return {
      name: type.name,
      value: total,
      count: typeTransactions.length
    };
  });

  // Student payment status
  const studentPaymentStatus = students.map(student => {
    const studentTransactions = completedTransactions.filter(t => t.student_id === student.id);
    const totalPaid = studentTransactions.reduce((sum, t) => sum + t.amount, 0);
    const pendingTransactions = filteredTransactions.filter(
      t => t.student_id === student.id && t.status === 'pending'
    );
    const totalPending = pendingTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    return {
      name: student.name,
      paid: totalPaid,
      pending: totalPending,
      status: pendingTransactions.length === 0 ? 'complete' : 'partial'
    };
  });

  // Monthly trend data (last 6 months)
  const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthStr = date.toISOString().slice(0, 7);
    
    const monthTransactions = transactions.filter(t => 
      t.status === 'completed' && 
      new Date(t.completed_at!).toISOString().slice(0, 7) === monthStr
    );
    
    return {
      month: new Intl.DateTimeFormat('id-ID', { month: 'short', year: 'numeric' }).format(date),
      total: monthTransactions.reduce((sum, t) => sum + t.amount, 0)
    };
  }).reverse();

  const exportToCSV = () => {
    const headers = ['Tanggal', 'Order ID', 'Siswa', 'Jenis Pembayaran', 'Jumlah', 'Status', 'Metode Pembayaran'];
    const rows = filteredTransactions.map(t => [
      formatDate(t.created_at),
      t.order_id,
      t.student?.name || '',
      t.payment_type?.name || '',
      t.amount,
      t.status,
      t.payment_method || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `laporan-kas-${selectedMonth}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan Keuangan</h1>
          <p className="text-gray-600">Analisis dan laporan kas kelas</p>
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={exportToCSV}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-5 w-5 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Terkumpul</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Transaksi Selesai</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{completedTransactions.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rata-rata Pembayaran</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{formatCurrency(averagePayment)}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Siswa Lunas</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {studentPaymentStatus.filter(s => s.status === 'complete').length} / {students.length}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trend Bulanan</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `${value / 1000}k`} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="total" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Type Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribusi Jenis Pembayaran</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {paymentTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Student Payment Status Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Status Pembayaran Siswa</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Siswa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Dibayar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Pending
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {studentPaymentStatus.map((student) => (
                <tr key={student.name} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(student.paid)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(student.pending)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      student.status === 'complete' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {student.status === 'complete' ? 'Lunas' : 'Belum Lunas'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;