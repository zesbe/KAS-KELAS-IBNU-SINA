import React, { useEffect, useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Calendar, 
  Smartphone,
  Download,
  RefreshCw,
  Save,
  Check
} from 'lucide-react';
import { recurringService, RecurringSetting } from '../services/recurringService';
import { pwaService } from '../services/pwaService';
import { PaymentType } from '../types';
import { paymentTypeService } from '../services/paymentTypeService';
import toast from 'react-hot-toast';

const Settings: React.FC = () => {
  const [recurringSettings, setRecurringSettings] = useState<RecurringSetting[]>([]);
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    loadData();
    checkNotificationStatus();
    
    // Listen for PWA install availability
    window.addEventListener('pwa-install-available', () => {
      setShowInstallButton(true);
    });
  }, []);

  const loadData = async () => {
    try {
      const [settingsData, typesData] = await Promise.all([
        recurringService.getRecurringSettings(),
        paymentTypeService.getAll()
      ]);

      // Merge settings with payment types
      const mergedSettings = typesData
        .filter(t => t.is_recurring)
        .map(type => {
          const setting = settingsData.find(s => s.payment_type_id === type.id);
          return setting || {
            id: '',
            payment_type_id: type.id,
            is_active: true,
            day_of_month: 1,
            reminder_days: [7, 3, 1],
            escalation_days: 3,
            created_at: '',
            updated_at: '',
            payment_type: type
          };
        });

      setRecurringSettings(mergedSettings);
      setPaymentTypes(typesData);
    } catch (error) {
      toast.error('Gagal memuat pengaturan');
    } finally {
      setLoading(false);
    }
  };

  const checkNotificationStatus = async () => {
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  };

  const handleSettingChange = (paymentTypeId: string, field: string, value: any) => {
    setRecurringSettings(prev => 
      prev.map(setting => 
        setting.payment_type_id === paymentTypeId
          ? { ...setting, [field]: value }
          : setting
      )
    );
  };

  const handleReminderDaysChange = (paymentTypeId: string, days: string) => {
    const daysArray = days.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d));
    handleSettingChange(paymentTypeId, 'reminder_days', daysArray);
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      for (const setting of recurringSettings) {
        await recurringService.updateRecurringSetting(setting.payment_type_id, {
          is_active: setting.is_active,
          day_of_month: setting.day_of_month,
          reminder_days: setting.reminder_days,
          escalation_days: setting.escalation_days
        });
      }
      toast.success('Pengaturan berhasil disimpan');
    } catch (error) {
      toast.error('Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  };

  const enableNotifications = async () => {
    const granted = await pwaService.requestNotificationPermission();
    if (granted) {
      setNotificationsEnabled(true);
      toast.success('Notifikasi berhasil diaktifkan');
      
      // Subscribe to push notifications
      const subscription = await pwaService.subscribeToPushNotifications();
      if (subscription) {
        console.log('Push subscription:', subscription);
        // Send subscription to your server
      }
    } else {
      toast.error('Notifikasi ditolak');
    }
  };

  const installPWA = async () => {
    const installed = await pwaService.promptInstall();
    if (installed) {
      toast.success('Aplikasi berhasil diinstall');
      setShowInstallButton(false);
    }
  };

  const testCronJob = async () => {
    try {
      const result = await recurringService.runDailyCron();
      toast.success(`Cron job berhasil: ${result.recurringGenerated} tagihan dibuat, ${result.remindersProcessed} reminder diproses`);
    } catch (error) {
      toast.error('Gagal menjalankan cron job');
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
        <p className="text-gray-600">Konfigurasi sistem dan otomasi</p>
      </div>

      {/* PWA Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Smartphone className="h-5 w-5 mr-2 text-blue-600" />
          Progressive Web App
        </h2>

        <div className="space-y-4">
          {showInstallButton && !pwaService.isStandalone() && (
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Install Aplikasi</p>
                <p className="text-sm text-gray-600">Install sebagai aplikasi untuk akses lebih cepat</p>
              </div>
              <button
                onClick={installPWA}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Install
              </button>
            </div>
          )}

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Push Notifications</p>
              <p className="text-sm text-gray-600">Terima notifikasi pembayaran real-time</p>
            </div>
            {notificationsEnabled ? (
              <span className="flex items-center text-green-600">
                <Check className="h-5 w-5 mr-1" />
                Aktif
              </span>
            ) : (
              <button
                onClick={enableNotifications}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <Bell className="h-4 w-4 mr-2" />
                Aktifkan
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Recurring Payment Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <RefreshCw className="h-5 w-5 mr-2 text-green-600" />
          Pengaturan Pembayaran Berulang
        </h2>

        <div className="space-y-6">
          {recurringSettings.map((setting) => (
            <div key={setting.payment_type_id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">
                  {setting.payment_type?.name}
                </h3>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={setting.is_active}
                    onChange={(e) => handleSettingChange(setting.payment_type_id, 'is_active', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Aktif</span>
                </label>
              </div>

              {setting.is_active && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal Generate (1-28)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="28"
                      value={setting.day_of_month}
                      onChange={(e) => handleSettingChange(setting.payment_type_id, 'day_of_month', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hari Reminder (pisah koma)
                    </label>
                    <input
                      type="text"
                      value={setting.reminder_days.join(', ')}
                      onChange={(e) => handleReminderDaysChange(setting.payment_type_id, e.target.value)}
                      placeholder="7, 3, 1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Hari sebelum jatuh tempo</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Eskalasi (hari)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={setting.escalation_days}
                      onChange={(e) => handleSettingChange(setting.payment_type_id, 'escalation_days', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Hari setelah jatuh tempo</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-between">
          <button
            onClick={testCronJob}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Test Cron Job
          </button>

          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-medium text-yellow-900 mb-2">Informasi Cron Job</h3>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Cron job akan berjalan otomatis setiap hari pada jam 09:00 WIB</li>
          <li>• Generate tagihan dilakukan pada tanggal yang telah ditentukan</li>
          <li>• Reminder akan dikirim sesuai jadwal yang dikonfigurasi</li>
          <li>• Pastikan webhook URL sudah terdaftar di Vercel untuk automation</li>
        </ul>
      </div>
    </div>
  );
};

export default Settings;