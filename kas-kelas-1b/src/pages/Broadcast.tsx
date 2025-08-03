import React, { useEffect, useState } from 'react';
import { 
  Send, 
  Users, 
  Link, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Download,
  Copy,
  MessageSquare,
  Loader,
  DollarSign
} from 'lucide-react';
import { broadcastService, BroadcastPayment } from '../services/broadcastService';
import { paymentTypeService } from '../services/paymentTypeService';
import { studentService } from '../services/studentService';
import { PaymentType, Student } from '../types';
import { formatCurrency } from '../utils/formatters';
import toast from 'react-hot-toast';

const Broadcast: React.FC = () => {
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedPaymentType, setSelectedPaymentType] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [messageTemplate, setMessageTemplate] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('payment_reminder');
  const [broadcastPayments, setBroadcastPayments] = useState<BroadcastPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState<'payment' | 'custom'>('payment');

  const templates = broadcastService.getMessageTemplates();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const template = templates.find(t => t.id === selectedTemplate);
    if (template) {
      setMessageTemplate(template.template);
    }
  }, [selectedTemplate]);

  useEffect(() => {
    if (selectAll) {
      setSelectedStudents(students.map(s => s.id));
    } else {
      setSelectedStudents([]);
    }
  }, [selectAll, students]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [paymentTypesData, studentsData] = await Promise.all([
        paymentTypeService.getAll(),
        studentService.getAll()
      ]);

      setPaymentTypes(paymentTypesData);
      setStudents(studentsData);
    } catch (error) {
      toast.error('Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLinks = async () => {
    if (!selectedPaymentType) {
      toast.error('Pilih jenis pembayaran terlebih dahulu');
      return;
    }

    setGenerating(true);
    try {
      const payments = await broadcastService.generatePaymentLinksForAll(selectedPaymentType);
      setBroadcastPayments(payments);
      toast.success(`${payments.length} link pembayaran berhasil dibuat`);
    } catch (error) {
      toast.error('Gagal membuat link pembayaran');
    } finally {
      setGenerating(false);
    }
  };

  const handleSendBroadcast = async () => {
    if (broadcastPayments.length === 0) {
      toast.error('Generate link pembayaran terlebih dahulu');
      return;
    }

    if (!messageTemplate) {
      toast.error('Template pesan tidak boleh kosong');
      return;
    }

    setSending(true);
    try {
      const results = await broadcastService.sendBroadcastMessages(
        broadcastPayments,
        messageTemplate
      );
      
      setBroadcastPayments(results);
      
      const successCount = results.filter(r => r.status === 'sent').length;
      const failedCount = results.filter(r => r.status === 'failed').length;
      
      if (successCount > 0) {
        toast.success(`${successCount} pesan berhasil dikirim`);
      }
      if (failedCount > 0) {
        toast.error(`${failedCount} pesan gagal dikirim`);
      }
    } catch (error) {
      toast.error('Gagal mengirim broadcast');
    } finally {
      setSending(false);
    }
  };

  const handleSendCustomBroadcast = async () => {
    if (selectedStudents.length === 0) {
      toast.error('Pilih siswa terlebih dahulu');
      return;
    }

    if (!messageTemplate) {
      toast.error('Pesan tidak boleh kosong');
      return;
    }

    setSending(true);
    try {
      const result = await broadcastService.sendCustomBroadcast(
        selectedStudents,
        messageTemplate
      );
      
      toast.success(`${result.success} pesan berhasil dikirim, ${result.failed} gagal`);
      
      // Reset selection
      setSelectedStudents([]);
      setSelectAll(false);
      setMessageTemplate('');
    } catch (error) {
      toast.error('Gagal mengirim broadcast');
    } finally {
      setSending(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Link berhasil disalin');
  };

  const exportToCSV = () => {
    if (broadcastPayments.length === 0) {
      toast.error('Tidak ada data untuk diexport');
      return;
    }

    const headers = ['Nama Siswa', 'No. WhatsApp', 'Order ID', 'Jumlah', 'Link Pembayaran', 'Status'];
    const rows = broadcastPayments.map(p => [
      p.student_name,
      p.parent_phone,
      p.order_id,
      p.amount,
      p.payment_url,
      p.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `broadcast-payment-links-${new Date().toISOString().split('T')[0]}.csv`;
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Broadcast Pembayaran</h1>
        <p className="text-gray-600">Generate link pembayaran personal dan kirim ke semua orang tua</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('payment')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'payment'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Broadcast Pembayaran
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'custom'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pesan Custom
          </button>
        </nav>
      </div>

      {activeTab === 'payment' ? (
        <>
          {/* Step 1: Select Payment Type */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              Step 1: Pilih Jenis Pembayaran
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paymentTypes.map((type) => (
                <div
                  key={type.id}
                  onClick={() => setSelectedPaymentType(type.id)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedPaymentType === type.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h4 className="font-medium text-gray-900">{type.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">{type.description}</p>
                  <p className="text-lg font-semibold text-gray-900 mt-2">
                    {formatCurrency(type.amount)}
                  </p>
                  {type.is_recurring && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-2">
                      Berulang
                    </span>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleGenerateLinks}
              disabled={!selectedPaymentType || generating}
              className="mt-6 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {generating ? (
                <>
                  <Loader className="animate-spin h-5 w-5 mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Link className="h-5 w-5 mr-2" />
                  Generate Link Pembayaran
                </>
              )}
            </button>
          </div>

          {/* Step 2: Configure Message */}
          {broadcastPayments.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                </div>
                Step 2: Atur Pesan WhatsApp
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Pesan
                  </label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preview Pesan
                  </label>
                  <textarea
                    value={messageTemplate}
                    onChange={(e) => setMessageTemplate(e.target.value)}
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Variables: {'{nama_siswa}'}, {'{jumlah}'}, {'{order_id}'}, {'{link_pembayaran}'}
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleSendBroadcast}
                    disabled={sending}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {sending ? (
                      <>
                        <Loader className="animate-spin h-5 w-5 mr-2" />
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Kirim Broadcast
                      </>
                    )}
                  </button>

                  <button
                    onClick={exportToCSV}
                    className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Export CSV
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Results Table */}
          {broadcastPayments.length > 0 && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Hasil Generate Link</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Siswa
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        No. WhatsApp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Jumlah
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Link
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {broadcastPayments.map((payment) => (
                      <tr key={payment.student_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {payment.student_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payment.parent_phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payment.order_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {payment.status === 'sent' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Terkirim
                            </span>
                          ) : payment.status === 'failed' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <XCircle className="h-3 w-3 mr-1" />
                              Gagal
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {payment.payment_url && (
                            <button
                              onClick={() => copyToClipboard(payment.payment_url)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Copy link"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Custom Message Tab */
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Kirim Pesan Custom</h3>

          {/* Student Selection */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Pilih Siswa
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={(e) => setSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">Pilih Semua</span>
              </label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
              {students.map((student) => (
                <label key={student.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStudents([...selectedStudents, student.id]);
                      } else {
                        setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{student.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Message Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pesan
            </label>
            <textarea
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
              rows={8}
              placeholder="Tulis pesan yang akan dikirim ke orang tua..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={handleSendCustomBroadcast}
            disabled={sending || selectedStudents.length === 0 || !messageTemplate}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? (
              <>
                <Loader className="animate-spin h-5 w-5 mr-2" />
                Mengirim...
              </>
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                Kirim Pesan ({selectedStudents.length} siswa)
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default Broadcast;