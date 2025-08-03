import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Check, X, Calendar, Receipt, Filter, Clock } from 'lucide-react';
import { expenseService } from '../services/expenseService';
import { Expense, ExpenseCategory } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const Expenses: React.FC = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filterApproved, setFilterApproved] = useState<'all' | 'approved' | 'pending'>('all');
  const [formData, setFormData] = useState({
    description: '',
    amount: 0,
    category_id: '',
    expense_date: new Date().toISOString().split('T')[0],
    notes: '',
    receipt_url: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [expensesData, categoriesData] = await Promise.all([
        expenseService.getAllExpenses(),
        expenseService.getCategories()
      ]);

      setExpenses(expensesData);
      setCategories(categoriesData);
    } catch (error) {
      toast.error('Gagal memuat data pengeluaran');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingExpense) {
        await expenseService.updateExpense(editingExpense.id, {
          ...formData,
          amount: Number(formData.amount)
        });
        toast.success('Pengeluaran berhasil diperbarui');
      } else {
        await expenseService.createExpense({
          ...formData,
          amount: Number(formData.amount),
          created_by: user?.email || 'Admin',
          approved: false
        });
        toast.success('Pengeluaran berhasil ditambahkan');
      }
      
      setShowModal(false);
      setEditingExpense(null);
      setFormData({
        description: '',
        amount: 0,
        category_id: '',
        expense_date: new Date().toISOString().split('T')[0],
        notes: '',
        receipt_url: ''
      });
      loadData();
    } catch (error) {
      toast.error('Gagal menyimpan pengeluaran');
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      description: expense.description,
      amount: expense.amount,
      category_id: expense.category_id || '',
      expense_date: expense.expense_date,
      notes: expense.notes || '',
      receipt_url: expense.receipt_url || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus pengeluaran ini?')) return;
    
    try {
      await expenseService.deleteExpense(id);
      toast.success('Pengeluaran berhasil dihapus');
      loadData();
    } catch (error) {
      toast.error('Gagal menghapus pengeluaran');
    }
  };

  const handleApprove = async (expense: Expense) => {
    try {
      await expenseService.approveExpense(expense.id, user?.email || 'Admin');
      toast.success('Pengeluaran berhasil disetujui');
      loadData();
    } catch (error) {
      toast.error('Gagal menyetujui pengeluaran');
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    if (filterApproved === 'approved') return expense.approved;
    if (filterApproved === 'pending') return !expense.approved;
    return true;
  });

  const totalApproved = expenses
    .filter(e => e.approved)
    .reduce((sum, e) => sum + e.amount, 0);

  const totalPending = expenses
    .filter(e => !e.approved)
    .reduce((sum, e) => sum + e.amount, 0);

  const getCategoryIcon = (iconName?: string) => {
    // This would be better with a proper icon mapping
    return iconName || 'MoreHorizontal';
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
          <h1 className="text-2xl font-bold text-gray-900">Pengeluaran</h1>
          <p className="text-gray-600">Kelola pengeluaran kas kelas</p>
        </div>
        <button
          onClick={() => {
            setEditingExpense(null);
            setFormData({
              description: '',
              amount: 0,
              category_id: '',
              expense_date: new Date().toISOString().split('T')[0],
              notes: '',
              receipt_url: ''
            });
            setShowModal(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Tambah Pengeluaran
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pengeluaran</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">
                {formatCurrency(totalApproved + totalPending)}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Receipt className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Disetujui</p>
              <p className="mt-2 text-2xl font-bold text-green-600">
                {formatCurrency(totalApproved)}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Check className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Menunggu Persetujuan</p>
              <p className="mt-2 text-2xl font-bold text-yellow-600">
                {formatCurrency(totalPending)}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={filterApproved}
            onChange={(e) => setFilterApproved(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Semua Pengeluaran</option>
            <option value="approved">Disetujui</option>
            <option value="pending">Menunggu Persetujuan</option>
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tanggal
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Deskripsi
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kategori
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jumlah
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredExpenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    {formatDate(expense.expense_date)}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div>
                    <p className="font-medium">{expense.description}</p>
                    {expense.notes && (
                      <p className="text-xs text-gray-500 mt-1">{expense.notes}</p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {expense.category?.name || 'Lainnya'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  {formatCurrency(expense.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {expense.approved ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Check className="h-3 w-3 mr-1" />
                      Disetujui
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {!expense.approved && (
                    <button
                      onClick={() => handleApprove(expense)}
                      className="text-green-600 hover:text-green-900 mr-3"
                      title="Setujui"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(expense)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingExpense ? 'Edit Pengeluaran' : 'Tambah Pengeluaran'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi
                </label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jumlah
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.expense_date}
                    onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Pilih kategori...</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catatan (Opsional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL Bukti/Kwitansi (Opsional)
                </label>
                <input
                  type="url"
                  value={formData.receipt_url}
                  onChange={(e) => setFormData({ ...formData, receipt_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingExpense(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingExpense ? 'Simpan' : 'Tambah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;