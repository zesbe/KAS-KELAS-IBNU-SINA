export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) {
      return '-';
    }
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(d);
  } catch (error) {
    return '-';
  }
};

export const formatDateTime = (date: string | Date): string => {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) {
      return '-';
    }
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  } catch (error) {
    return '-';
  }
};

export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-numeric characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Format Indonesian phone number
  if (cleaned.startsWith('+62')) {
    const number = cleaned.substring(3);
    const parts = [];
    
    if (number.length >= 3) parts.push(number.substring(0, 3));
    if (number.length >= 7) parts.push(number.substring(3, 7));
    if (number.length >= 10) parts.push(number.substring(7, 10));
    if (number.length > 10) parts.push(number.substring(10));
    
    return '+62 ' + parts.join('-');
  }
  
  return phone;
};

export const getStatusBadgeClass = (status: string): string => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  
  switch (status) {
    case 'completed':
    case 'paid':
      return `${baseClasses} bg-green-100 text-green-800`;
    case 'pending':
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    case 'failed':
    case 'cancelled':
      return `${baseClasses} bg-red-100 text-red-800`;
    case 'sent':
      return `${baseClasses} bg-blue-100 text-blue-800`;
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`;
  }
};

export const getPaymentMethodLabel = (method: string): string => {
  const methods: { [key: string]: string } = {
    qris: 'QRIS',
    bank_transfer: 'Transfer Bank',
    cash: 'Tunai',
    ewallet: 'E-Wallet'
  };
  
  return methods[method] || method;
};