import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { 
  User, 
  CreditCard, 
  FileText, 
  Download, 
  CheckCircle, 
  Clock,
  Calendar,
  Shield,
  LogOut
} from 'lucide-react';
import { recurringService, ParentAccess } from '../services/recurringService';
import { transactionService } from '../services/transactionService';
import { pakasirService } from '../services/pakasirService';
import { Transaction } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';

const ParentPortal: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [access, setAccess] = useState<ParentAccess | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [pinVerified, setPinVerified] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

  useEffect(() => {
    if (token) {
      verifyAccess();
    }
  }, [token]);

  useEffect(() => {
    if (access && pinVerified) {
      loadTransactions();
    }
  }, [access, pinVerified]);

  const verifyAccess = async () => {
    try {
      const parentAccess = await recurringService.getParentAccessByToken(token!);
      if (parentAccess) {
        setAccess(parentAccess);
        // Check if PIN is required
        if (!parentAccess.pin_code) {
          setPinVerified(true);
        }
      } else {
        toast.error('Link tidak valid atau sudah kadaluarsa');
      }
    } catch (error) {
      toast.error('Gagal memverifikasi akses');
    } finally {
      setLoading(false);
    }
  };

  const verifyPin = () => {
    if (pinInput === access?.pin_code) {
      setPinVerified(true);
      toast.success('PIN berhasil diverifikasi');
    } else {
      toast.error('PIN salah');
    }
  };

  const loadTransactions = async () => {
    if (!access?.student_id) return;
    
    try {
      const data = await transactionService.getByStudent(access.student_id);
      setTransactions(data);
    } catch (error) {
      toast.error('Gagal memuat data transaksi');
    }
  };

  const handlePayment = (transaction: Transaction) => {
    if (transaction.payment_url) {
      window.location.href = transaction.payment_url;
    } else {
      const paymentUrl = pakasirService.generatePaymentUrl(
        transaction.order_id,
        transaction.amount
      );
      window.location.href = paymentUrl;
    }
  };

  const downloadReceipt = (transaction: Transaction) => {
    // Generate simple receipt
    const receiptContent = `
KWITANSI PEMBAYARAN
===================

No. Order: ${transaction.order_id}
Tanggal: ${formatDate(transaction.completed_at || transaction.created_at)}
Nama Siswa: ${transaction.student?.name}
Jenis Pembayaran: ${transaction.payment_type?.name}
Jumlah: ${formatCurrency(transaction.amount)}
Status: LUNAS
Metode: ${transaction.payment_method || 'QRIS'}

===================
SD Islam Al Husna
Kelas 1B - TA 2025/2026
    `.trim();

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kwitansi-${transaction.order_id}.txt`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!access) {
    return <Navigate to="/" replace />;
  }

  if (!pinVerified && access.pin_code) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="bg-blue-100 p-4 rounded-full inline-flex mb-4">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Verifikasi PIN</h2>
            <p className="text-gray-600 mt-2">
              Masukkan PIN yang telah dikirim melalui WhatsApp
            </p>
          </div>
          
          <div className="space-y-4">
            <input
              type="text"
              maxLength={6}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
              placeholder="Masukkan 6 digit PIN"
              className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <button
              onClick={verifyPin}
              disabled={pinInput.length !== 6}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Verifikasi
            </button>
          </div>
        </div>
      </div>
    );
  }

  const pendingTransactions = transactions.filter(t => t.status === 'pending');
  const completedTransactions = transactions.filter(t => t.status === 'completed');
  const displayTransactions = activeTab === 'pending' ? pendingTransactions : completedTransactions;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Portal Pembayaran</h1>
              <p className="text-gray-600 mt-1">
                {access.student?.name} - Kelas 1B
              </p>
            </div>
            <button
              onClick={() => {
                setPinVerified(false);
                setPinInput('');
                setAccess(null);
              }}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <LogOut className="h-5 w-5 mr-1" />
              Keluar
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Dibayar</p>
                <p className="mt-2 text-2xl font-bold text-green-600">
                  {formatCurrency(
                    completedTransactions.reduce((sum, t) => sum + t.amount, 0)
                  )}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Belum Dibayar</p>
                <p className="mt-2 text-2xl font-bold text-yellow-600">
                  {formatCurrency(
                    pendingTransactions.reduce((sum, t) => sum + t.amount, 0)
                  )}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transaksi</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {transactions.length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'pending'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Belum Dibayar ({pendingTransactions.length})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'history'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Riwayat Pembayaran ({completedTransactions.length})
              </button>
            </nav>
          </div>

          {/* Transaction List */}
          <div className="p-6">
            {displayTransactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-100 p-4 rounded-full inline-flex mb-4">
                  {activeTab === 'pending' ? (
                    <CheckCircle className="h-8 w-8 text-gray-400" />
                  ) : (
                    <FileText className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <p className="text-gray-500">
                  {activeTab === 'pending' 
                    ? 'Tidak ada pembayaran yang tertunda' 
                    : 'Belum ada riwayat pembayaran'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {displayTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {transaction.payment_type?.name}
                        </h4>
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(transaction.created_at)}
                          </span>
                          <span>Order ID: {transaction.order_id}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          {formatCurrency(transaction.amount)}
                        </p>
                        
                        {transaction.status === 'pending' ? (
                          <button
                            onClick={() => handlePayment(transaction)}
                            className="mt-2 flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Bayar Sekarang
                          </button>
                        ) : (
                          <div className="mt-2 space-y-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Lunas
                            </span>
                            <button
                              onClick={() => downloadReceipt(transaction)}
                              className="block w-full text-center px-3 py-1 text-xs text-blue-600 hover:text-blue-800"
                            >
                              <Download className="h-3 w-3 inline mr-1" />
                              Kwitansi
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Informasi Penting</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Pembayaran dapat dilakukan melalui QRIS di semua aplikasi e-wallet dan m-banking</li>
            <li>• Kwitansi akan otomatis tersedia setelah pembayaran berhasil</li>
            <li>• Untuk bantuan, hubungi admin melalui WhatsApp</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ParentPortal;