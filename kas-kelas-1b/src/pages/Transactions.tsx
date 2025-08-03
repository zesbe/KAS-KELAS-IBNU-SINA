import React, { useEffect, useState } from 'react';
import { Plus, ExternalLink, Send, CheckCircle, Clock, XCircle } from 'lucide-react';
import { transactionService } from '../services/transactionService';
import { studentService } from '../services/studentService';
import { paymentTypeService } from '../services/paymentTypeService';
import { pakasirService } from '../services/pakasirService';
import { whatsappService } from '../services/whatsappService';
import { Transaction, Student, PaymentType } from '../types';
import { formatCurrency, formatDateTime, getStatusBadgeClass } from '../utils/formatters';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Transactions: React.FC = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    payment_type_id: '',
    amount: 0
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Create transaction
      const transaction = await transactionService.create(formData);
      
      // Generate payment URL
      const paymentUrl = pakasirService.generatePaymentUrl(transaction.order_id, transaction.amount);
      await transactionService.updatePaymentUrl(transaction.order_id, paymentUrl);
      
      // Send WhatsApp notification
      const student = students.find(s => s.id === formData.student_id);
      const paymentType = paymentTypes.find(pt => pt.id === formData.payment_type_id);
      
      if (student && paymentType) {
        await whatsappService.sendPaymentReminder(
          student.parent_phone,
          student.name,
          paymentType.name,
          formData.amount,
          paymentUrl
        );
      }
      
      toast.success('Transaksi berhasil dibuat dan notifikasi terkirim');
      setShowModal(false);
      setFormData({ student_id: '', payment_type_id: '', amount: 0 });
      loadData();
    } catch (error) {
      toast.error('Gagal membuat transaksi');
    }
  };

  const handlePaymentTypeChange = (paymentTypeId: string) => {
    const paymentType = paymentTypes.find(pt => pt.id === paymentTypeId);
    if (paymentType) {
      setFormData({
        ...formData,
        payment_type_id: paymentTypeId,
        amount: paymentType.amount
      });
    }
  };

  const handleSendReminder = async (transaction: Transaction) => {
    if (!transaction.student || !transaction.payment_type) return;
    
    try {
      const paymentUrl = pakasirService.generatePaymentUrl(transaction.order_id, transaction.amount);
      
      await whatsappService.sendPaymentReminder(
        transaction.student.parent_phone,
        transaction.student.name,
        transaction.payment_type.name,
        transaction.amount,
        paymentUrl
      );
      
      toast.success('Pengingat berhasil dikirim');
    } catch (error) {
      toast.error('Gagal mengirim pengingat');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Lunas';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Gagal';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return status;
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Transaksi</h1>
          <p className="text-gray-600">Kelola transaksi pembayaran kas kelas</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Buat Transaksi
        </button>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Siswa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jenis Pembayaran
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
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    {transaction.order_id}
                  </td>
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
                    <span className={getStatusBadgeClass(transaction.status)}>
                      {getStatusIcon(transaction.status)}
                      <span className="ml-1">{getStatusLabel(transaction.status)}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDateTime(transaction.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    {transaction.status === 'pending' && (
                      <>
                        {transaction.payment_url && (
                          <a
                            href={transaction.payment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-900 mr-3"
                            title="Buka link pembayaran"
                          >
                            <ExternalLink className="h-4 w-4 inline" />
                          </a>
                        )}
                        <button
                          onClick={() => handleSendReminder(transaction)}
                          className="text-green-600 hover:text-green-900"
                          title="Kirim pengingat WhatsApp"
                        >
                          <Send className="h-4 w-4 inline" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Buat Transaksi Baru
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Siswa
                </label>
                <select
                  required
                  value={formData.student_id}
                  onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Pilih siswa...</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jenis Pembayaran
                </label>
                <select
                  required
                  value={formData.payment_type_id}
                  onChange={(e) => handlePaymentTypeChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Pilih jenis pembayaran...</option>
                  {paymentTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name} - {formatCurrency(type.amount)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah
                </label>
                <input
                  type="number"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ student_id: '', payment_type_id: '', amount: 0 });
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Buat & Kirim Notifikasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;