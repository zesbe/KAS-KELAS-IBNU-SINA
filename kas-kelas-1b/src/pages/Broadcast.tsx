import React, { useState, useEffect } from 'react';
import { Send, Users, MessageSquare, Clock, Loader, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { broadcastService, BroadcastPayment } from '../services/broadcastService';
import { paymentTypeService } from '../services/paymentTypeService';
import { studentService } from '../services/studentService';
import { PaymentType, Student } from '../types';
import toast from 'react-hot-toast';

export default function Broadcast() {
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedPaymentType, setSelectedPaymentType] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('payment_reminder');
  const [customMessage, setCustomMessage] = useState('');
  const [delaySeconds, setDelaySeconds] = useState(10);
  const [broadcastPayments, setBroadcastPayments] = useState<BroadcastPayment[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [broadcastHistory, setBroadcastHistory] = useState<any[]>([]);
  const [queueStatus, setQueueStatus] = useState<any>(null);

  const templates = broadcastService.getMessageTemplates();

  useEffect(() => {
    loadData();
    loadBroadcastHistory();
    // Poll queue status every 5 seconds
    const interval = setInterval(loadQueueStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [types, studentList] = await Promise.all([
        paymentTypeService.getAll(),
        studentService.getAll()
      ]);
      setPaymentTypes(types);
      setStudents(studentList);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Gagal memuat data');
    }
  };

  const loadBroadcastHistory = async () => {
    try {
      const history = await broadcastService.getBroadcastHistory(20);
      setBroadcastHistory(history);
    } catch (error) {
      console.error('Failed to load broadcast history:', error);
    }
  };

  const loadQueueStatus = async () => {
    try {
      const status = await broadcastService.getBroadcastStatus();
      setQueueStatus(status);
    } catch (error) {
      console.error('Failed to load queue status:', error);
    }
  };

  const handleGenerateLinks = async () => {
    if (!selectedPaymentType) {
      toast.error('Pilih jenis pembayaran terlebih dahulu');
      return;
    }

    setIsGenerating(true);
    try {
      const payments = await broadcastService.generatePaymentLinksForAll(selectedPaymentType);
      setBroadcastPayments(payments);
      toast.success(`${payments.length} link pembayaran berhasil dibuat`);
    } catch (error) {
      console.error('Failed to generate links:', error);
      toast.error('Gagal membuat link pembayaran');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendBroadcast = async () => {
    if (broadcastPayments.length === 0) {
      toast.error('Generate link pembayaran terlebih dahulu');
      return;
    }

    const template = templates.find(t => t.id === selectedTemplate);
    const message = selectedTemplate === 'custom' ? customMessage : template?.template || '';

    if (!message) {
      toast.error('Pesan tidak boleh kosong');
      return;
    }

    // Validate delay
    if (delaySeconds < 1 || delaySeconds > 300) {
      toast.error('Delay harus antara 1-300 detik');
      return;
    }

    setIsSending(true);
    try {
      const result = await broadcastService.sendBroadcastMessages(
        broadcastPayments, 
        message,
        {
          delaySeconds,
          paymentTypeId: selectedPaymentType
        }
      );
      
      if (result.success) {
        toast.success(`Pesan berhasil dijadwalkan! Delay: ${delaySeconds} detik per pesan`);
        setBroadcastPayments([]);
        loadBroadcastHistory();
        loadQueueStatus();
      } else {
        toast.error(result.error || 'Gagal mengirim broadcast');
      }
    } catch (error) {
      console.error('Failed to send broadcast:', error);
      toast.error('Gagal mengirim broadcast');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendCustomBroadcast = async () => {
    if (selectedStudents.length === 0) {
      toast.error('Pilih siswa terlebih dahulu');
      return;
    }

    if (!customMessage) {
      toast.error('Pesan tidak boleh kosong');
      return;
    }

    // Validate delay
    if (delaySeconds < 1 || delaySeconds > 300) {
      toast.error('Delay harus antara 1-300 detik');
      return;
    }

    setIsSending(true);
    try {
      const result = await broadcastService.sendCustomBroadcast(
        selectedStudents, 
        customMessage,
        delaySeconds
      );
      
      if (result.success) {
        toast.success(`Pesan berhasil dijadwalkan! Delay: ${delaySeconds} detik per pesan`);
        setSelectedStudents([]);
        setCustomMessage('');
        loadBroadcastHistory();
        loadQueueStatus();
      } else {
        toast.error(result.error || 'Gagal mengirim pesan');
      }
    } catch (error) {
      console.error('Failed to send custom broadcast:', error);
      toast.error('Gagal mengirim pesan');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Broadcast WhatsApp</h1>
        <p className="mt-1 text-sm text-gray-500">
          Kirim pesan WhatsApp ke semua orang tua siswa dengan delay antar pesan
        </p>
      </div>

      {/* Queue Status */}
      {queueStatus && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-blue-900">Status Antrian Pesan</h3>
            <button
              onClick={loadQueueStatus}
              className="text-blue-600 hover:text-blue-700"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-2 grid grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-blue-600">Menunggu:</span> {queueStatus.waiting}
            </div>
            <div>
              <span className="text-yellow-600">Diproses:</span> {queueStatus.active}
            </div>
            <div>
              <span className="text-green-600">Selesai:</span> {queueStatus.completed}
            </div>
            <div>
              <span className="text-red-600">Gagal:</span> {queueStatus.failed}
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Payment Reminder */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Broadcast Pengingat Pembayaran
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Jenis Pembayaran
            </label>
            <select
              value={selectedPaymentType}
              onChange={(e) => setSelectedPaymentType(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Pilih jenis pembayaran</option>
              {paymentTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name} - Rp {type.amount.toLocaleString('id-ID')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Template Pesan
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          {selectedTemplate === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Pesan Custom
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Tulis pesan custom..."
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Delay Antar Pesan (detik)
            </label>
            <input
              type="number"
              min="1"
              max="300"
              value={delaySeconds}
              onChange={(e) => setDelaySeconds(parseInt(e.target.value) || 10)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">
              Jeda waktu antara pengiriman pesan (1-300 detik)
            </p>
          </div>

          {selectedTemplate !== 'custom' && (
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Preview Pesan:</h4>
              <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                {templates.find(t => t.id === selectedTemplate)?.template}
              </pre>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={handleGenerateLinks}
              disabled={!selectedPaymentType || isGenerating}
              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300"
            >
              {isGenerating ? (
                <Loader className="animate-spin h-4 w-4 mr-2" />
              ) : (
                <Users className="h-4 w-4 mr-2" />
              )}
              Generate Link Pembayaran
            </button>

            <button
              onClick={handleSendBroadcast}
              disabled={broadcastPayments.length === 0 || isSending}
              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-300"
            >
              {isSending ? (
                <Loader className="animate-spin h-4 w-4 mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Kirim Broadcast
            </button>
          </div>
        </div>

        {broadcastPayments.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Preview ({broadcastPayments.length} siswa)
            </h3>
            <div className="bg-gray-50 rounded-md p-4 max-h-60 overflow-y-auto">
              <div className="space-y-2">
                {broadcastPayments.slice(0, 5).map((payment) => (
                  <div key={payment.student_id} className="text-sm">
                    <span className="font-medium">{payment.student_name}</span>
                    <span className="text-gray-500 ml-2">
                      {payment.parent_phone}
                    </span>
                    {payment.status === 'failed' && (
                      <span className="text-red-600 ml-2">
                        (Gagal: {payment.error_message})
                      </span>
                    )}
                  </div>
                ))}
                {broadcastPayments.length > 5 && (
                  <div className="text-sm text-gray-500">
                    ... dan {broadcastPayments.length - 5} lainnya
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Broadcast */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Broadcast Custom
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Pilih Siswa
            </label>
            <div className="mt-2 space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md p-3">
              {students.map((student) => (
                <label key={student.id} className="flex items-center">
                  <input
                    type="checkbox"
                    value={student.id}
                    checked={selectedStudents.includes(student.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStudents([...selectedStudents, student.id]);
                      } else {
                        setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                      }
                    }}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {student.name} - {student.parent_phone}
                  </span>
                </label>
              ))}
            </div>
            <div className="mt-2 text-sm text-gray-500">
              {selectedStudents.length} siswa dipilih
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Pesan
            </label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Tulis pesan..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Delay Antar Pesan (detik)
            </label>
            <input
              type="number"
              min="1"
              max="300"
              value={delaySeconds}
              onChange={(e) => setDelaySeconds(parseInt(e.target.value) || 10)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <button
            onClick={handleSendCustomBroadcast}
            disabled={selectedStudents.length === 0 || !customMessage || isSending}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-300"
          >
            {isSending ? (
              <Loader className="animate-spin h-4 w-4 mr-2" />
            ) : (
              <MessageSquare className="h-4 w-4 mr-2" />
            )}
            Kirim Pesan Custom
          </button>
        </div>
      </div>

      {/* Broadcast History */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Riwayat Broadcast
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Waktu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Siswa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  No. HP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {broadcastHistory.map((log) => (
                <tr key={log.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(log.created_at).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.student?.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.phone_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {log.status === 'success' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Terkirim
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircle className="h-3 w-3 mr-1" />
                        Gagal
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}