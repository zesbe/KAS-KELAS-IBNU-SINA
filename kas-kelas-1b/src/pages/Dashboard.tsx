import React, { useEffect, useState } from 'react';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { studentService } from '../services/studentService';
import { transactionService } from '../services/transactionService';
import { paymentTypeService } from '../services/paymentTypeService';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Transaction, Student, PaymentType } from '../types';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [studentsData, transactionsData, paymentTypesData] = await Promise.all([
        studentService.getAll(),
        transactionService.getAll(),
        paymentTypeService.getAll()
      ]);

      setStudents(studentsData);
      setTransactions(transactionsData);
      setPaymentTypes(paymentTypesData);
    } catch (error) {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const totalStudents = students.length;
  const completedTransactions = transactions.filter(t => t.status === 'completed');
  const pendingTransactions = transactions.filter(t => t.status === 'pending');
  const totalRevenue = completedTransactions.reduce((sum, t) => sum + t.amount, 0);
  const pendingAmount = pendingTransactions.reduce((sum, t) => sum + t.amount, 0);

  // Get recent transactions
  const recentTransactions = transactions.slice(0, 5);

  // Calculate monthly revenue
  const currentMonth = new Date().getMonth();
  const currentMonthRevenue = completedTransactions
    .filter(t => new Date(t.completed_at!).getMonth() === currentMonth)
    .reduce((sum, t) => sum + t.amount, 0);

  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastMonthRevenue = completedTransactions
    .filter(t => new Date(t.completed_at!).getMonth() === lastMonth)
    .reduce((sum, t) => sum + t.amount, 0);

  const revenueGrowth = lastMonthRevenue > 0 
    ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
    : 0;

  const stats = [
    {
      name: 'Total Siswa',
      value: totalStudents,
      icon: Users,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-100',
      textColor: 'text-blue-600'
    },
    {
      name: 'Total Terkumpul',
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      color: 'bg-green-500',
      lightColor: 'bg-green-100',
      textColor: 'text-green-600',
      change: revenueGrowth,
      changeType: revenueGrowth >= 0 ? 'increase' : 'decrease'
    },
    {
      name: 'Pembayaran Pending',
      value: pendingTransactions.length,
      icon: Clock,
      color: 'bg-yellow-500',
      lightColor: 'bg-yellow-100',
      textColor: 'text-yellow-600',
      subValue: formatCurrency(pendingAmount)
    },
    {
      name: 'Tingkat Pembayaran',
      value: `${totalStudents > 0 ? Math.round((completedTransactions.length / (completedTransactions.length + pendingTransactions.length)) * 100) : 0}%`,
      icon: TrendingUp,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-100',
      textColor: 'text-purple-600'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Selamat datang di sistem manajemen kas kelas 1B</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">{stat.value}</p>
                
                {stat.subValue && (
                  <p className="mt-1 text-sm text-gray-500">{stat.subValue}</p>
                )}
                
                {stat.change !== undefined && (
                  <div className="mt-2 flex items-center text-sm">
                    {stat.changeType === 'increase' ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}>
                      {Math.abs(stat.change).toFixed(1)}%
                    </span>
                    <span className="text-gray-500 ml-1">dari bulan lalu</span>
                  </div>
                )}
              </div>
              <div className={`${stat.lightColor} p-3 rounded-lg`}>
                <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Transactions and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Transaksi Terbaru</h2>
              <Link 
                to="/transactions" 
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Lihat Semua
              </Link>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Siswa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jenis
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jumlah
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {transaction.student?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.payment_type?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        transaction.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transaction.status === 'completed' ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Lunas
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(transaction.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* Payment Types Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Jenis Pembayaran</h3>
            <div className="space-y-3">
              {paymentTypes.map((type) => {
                const typeTransactions = completedTransactions.filter(t => t.payment_type_id === type.id);
                const collected = typeTransactions.reduce((sum, t) => sum + t.amount, 0);
                
                return (
                  <div key={type.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{type.name}</p>
                      <p className="text-xs text-gray-500">
                        {typeTransactions.length} dari {totalStudents} siswa
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(collected)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h3>
            <div className="space-y-3">
              <Link
                to="/transactions/new"
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Buat Transaksi Baru
              </Link>
              <Link
                to="/reminders"
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Kirim Pengingat
              </Link>
              <Link
                to="/reports"
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Lihat Laporan
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;