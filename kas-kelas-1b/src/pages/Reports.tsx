import React, { useEffect, useState } from 'react';
import { Download, Calendar, TrendingUp, Users, DollarSign, Receipt, Wallet } from 'lucide-react';
import { transactionService } from '../services/transactionService';
import { studentService } from '../services/studentService';
import { paymentTypeService } from '../services/paymentTypeService';
import { expenseService } from '../services/expenseService';
import { Transaction, Student, PaymentType, Expense } from '../types';
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
  Cell,
  LineChart,
  Line
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const Reports: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [transactionsData, studentsData, paymentTypesData, expensesData] = await Promise.all([
        transactionService.getAll(),
        studentService.getAll(),
        paymentTypeService.getAll(),
        expenseService.getAllExpenses()
      ]);

      setTransactions(transactionsData);
      setStudents(studentsData);
      setPaymentTypes(paymentTypesData);
      setExpenses(expensesData);
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

  // Filter expenses by selected month
  const filteredExpenses = expenses.filter(e => {
    const expenseMonth = e.expense_date.slice(0, 7);
    return expenseMonth === selectedMonth && e.approved;
  });

  // Calculate statistics
  const completedTransactions = filteredTransactions.filter(t => t.status === 'completed');
  const totalRevenue = completedTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netIncome = totalRevenue - totalExpenses;
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

  // Expense category distribution
  const expenseCategoryData = filteredExpenses.reduce((acc, expense) => {
    const categoryName = expense.category?.name || 'Lainnya';
    const existing = acc.find(c => c.name === categoryName);
    
    if (existing) {
      existing.value += expense.amount;
    } else {
      acc.push({ name: categoryName, value: expense.amount });
    }
    
    return acc;
  }, [] as { name: string; value: number }[]);

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

  // Monthly cash flow data (last 6 months)
  const monthlyCashFlow = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthStr = date.toISOString().slice(0, 7);
    
    const monthTransactions = transactions.filter(t => 
      t.status === 'completed' && 
      new Date(t.completed_at!).toISOString().slice(0, 7) === monthStr
    );
    
    const monthExpenses = expenses.filter(e =>
      e.approved &&
      e.expense_date.slice(0, 7) === monthStr
    );
    
    const income = monthTransactions.reduce((sum, t) => sum + t.amount, 0);
    const expense = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    return {
      month: new Intl.DateTimeFormat('id-ID', { month: 'short', year: 'numeric' }).format(date),
      income,
      expense,
      net: income - expense
    };
  }).reverse();

  const exportToCSV = () => {
    // Income data
    const incomeHeaders = ['Tanggal', 'Order ID', 'Siswa', 'Jenis Pembayaran', 'Jumlah', 'Status', 'Metode Pembayaran'];
    const incomeRows = filteredTransactions.map(t => [
      formatDate(t.created_at),
      t.order_id,
      t.student?.name || '',
      t.payment_type?.name || '',
      t.amount,
      t.status,
      t.payment_method || ''
    ]);

    // Expense data
    const expenseHeaders = ['Tanggal', 'Deskripsi', 'Kategori', 'Jumlah', 'Status'];
    const expenseRows = filteredExpenses.map(e => [
      formatDate(e.expense_date),
      e.description,
      e.category?.name || 'Lainnya',
      e.amount,
      e.approved ? 'Disetujui' : 'Pending'
    ]);

    // Summary
    const summary = [
      ['LAPORAN KEUANGAN KAS KELAS 1B'],
      [`Periode: ${selectedMonth}`],
      [''],
      ['RINGKASAN'],
      ['Total Pemasukan', formatCurrency(totalRevenue)],
      ['Total Pengeluaran', formatCurrency(totalExpenses)],
      ['Saldo Bersih', formatCurrency(netIncome)],
      [''],
      ['DETAIL PEMASUKAN'],
      incomeHeaders,
      ...incomeRows,
      [''],
      ['DETAIL PENGELUARAN'],
      expenseHeaders,
      ...expenseRows
    ];

    const csvContent = summary.map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `laporan-kas-lengkap-${selectedMonth}.csv`;
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
          <p className="text-gray-600">Analisis lengkap kas kelas</p>
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
              <p className="text-sm font-medium text-gray-600">Total Pemasukan</p>
              <p className="mt-2 text-2xl font-bold text-green-600">+{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pengeluaran</p>
              <p className="mt-2 text-2xl font-bold text-red-600">-{formatCurrency(totalExpenses)}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <Receipt className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Saldo Bersih</p>
              <p className="mt-2 text-2xl font-bold text-blue-600">{formatCurrency(netIncome)}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Wallet className="h-6 w-6 text-blue-600" />
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
        {/* Cash Flow Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Arus Kas Bulanan</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyCashFlow}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `${value / 1000}k`} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Line type="monotone" dataKey="income" stroke="#10B981" name="Pemasukan" strokeWidth={2} />
              <Line type="monotone" dataKey="expense" stroke="#EF4444" name="Pengeluaran" strokeWidth={2} />
              <Line type="monotone" dataKey="net" stroke="#3B82F6" name="Saldo Bersih" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Combined Pie Charts */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribusi Pemasukan & Pengeluaran</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600 text-center mb-2">Pemasukan</p>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={paymentTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
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
            <div>
              <p className="text-sm font-medium text-gray-600 text-center mb-2">Pengeluaran</p>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={expenseCategoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expenseCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
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