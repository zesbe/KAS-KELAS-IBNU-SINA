import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Home, FileText } from 'lucide-react';
import { pakasirService } from '../services/pakasirService';
import { transactionService } from '../services/transactionService';
import { formatCurrency } from '../utils/formatters';
import toast from 'react-hot-toast';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState<any>(null);
  
  const orderId = searchParams.get('order_id');

  const checkPaymentStatus = useCallback(async () => {
    if (!orderId) return;
    
    try {
      // Get transaction details
      const trans = await transactionService.getByOrderId(orderId);
      if (trans) {
        setTransaction(trans);
        
        // Check payment status from Pakasir
        const status = await pakasirService.checkTransactionStatus(orderId, trans.amount);
        if (status && status.status === 'completed') {
          toast.success('Pembayaran berhasil!');
        }
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      toast.error('Gagal memeriksa status pembayaran');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) {
      checkPaymentStatus();
    } else {
      setLoading(false);
    }
  }, [orderId, checkPaymentStatus]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Pembayaran Berhasil!
          </h2>
          
          <p className="text-gray-600 mb-6">
            Terima kasih telah melakukan pembayaran kas kelas.
          </p>

          {transaction && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-2">Detail Transaksi:</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-600">Order ID:</span> <span className="font-mono">{transaction.order_id}</span></p>
                <p><span className="text-gray-600">Siswa:</span> {transaction.student?.name}</p>
                <p><span className="text-gray-600">Jenis:</span> {transaction.payment_type?.name}</p>
                <p><span className="text-gray-600">Jumlah:</span> {formatCurrency(transaction.amount)}</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Link
              to="/transactions"
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FileText className="h-4 w-4 mr-2" />
              Lihat Riwayat Transaksi
            </Link>
            
            <Link
              to="/"
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Home className="h-4 w-4 mr-2" />
              Kembali ke Dashboard
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500">
          Konfirmasi pembayaran telah dikirim melalui WhatsApp
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;