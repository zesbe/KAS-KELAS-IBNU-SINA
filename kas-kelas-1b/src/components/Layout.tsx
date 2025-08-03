import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  DollarSign, 
  FileText, 
  Bell, 
  Settings, 
  LogOut,
  Menu,
  X,
  CreditCard,
  BarChart3,
  Receipt,
  Send
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Siswa', href: '/students', icon: Users },
    { name: 'Jenis Pembayaran', href: '/payment-types', icon: CreditCard },
    { name: 'Transaksi', href: '/transactions', icon: DollarSign },
    { name: 'Pengeluaran', href: '/expenses', icon: Receipt },
    { name: 'Broadcast', href: '/broadcast', icon: Send },
    { name: 'Laporan', href: '/reports', icon: BarChart3 },
    { name: 'Pengingat', href: '/reminders', icon: Bell },
    { name: 'Riwayat WhatsApp', href: '/whatsapp-logs', icon: FileText },
    { name: 'Pengaturan', href: '/settings', icon: Settings },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
      toast.success('Berhasil keluar');
    } catch (error) {
      toast.error('Gagal keluar');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:static lg:inset-0`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-4 py-6 border-b">
            <h1 className="text-xl font-bold text-gray-800">Kas Kelas 1B</h1>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${
                    isActive ? 'text-blue-700' : 'text-gray-400'
                  }`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="px-4 py-4 border-t">
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5 text-gray-400" />
              Keluar
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">SD Islam Al Husna</span>
              <span className="text-sm font-medium text-gray-900">Tahun Ajaran 2025/2026</span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;