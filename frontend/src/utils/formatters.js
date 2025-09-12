/**
 * Utility functions for formatting data display
 */

// Date Formatters
export const dateFormatters = {
  toBrazilian: (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      return '';
    }
  },

  toAPI: (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch (error) {
      return '';
    }
  },

  withTime: (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleString('pt-BR');
    } catch (error) {
      return '';
    }
  },

  relative: (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      const now = new Date();
      const diff = Math.abs(now - date);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      if (days === 0) return 'Hoje';
      if (days === 1) return '1 dia atrás';
      if (days < 30) return `${days} dias atrás`;
      const months = Math.floor(days / 30);
      if (months === 1) return '1 mês atrás';
      if (months < 12) return `${months} meses atrás`;
      const years = Math.floor(months / 12);
      return `${years} ano${years > 1 ? 's' : ''} atrás`;
    } catch (error) {
      return '';
    }
  }
};

// Name Formatters
export const nameFormatters = {
  titleCase: (name) => {
    if (!name || typeof name !== 'string') return '';
    return name
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  },

  initials: (name, maxInitials = 3) => {
    if (!name || typeof name !== 'string') return '';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, maxInitials)
      .join('');
  },

  firstLast: (name) => {
    if (!name || typeof name !== 'string') return '';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[parts.length - 1]}`;
  }
};

// Email Formatters
export const emailFormatters = {
  mask: (email) => {
    if (!email || typeof email !== 'string') return '';
    const [username, domain] = email.split('@');
    if (!username || !domain) return email;
    
    if (username.length <= 2) return email;
    
    const maskedUsername = username.charAt(0) + 
      '*'.repeat(Math.max(0, username.length - 2)) + 
      username.charAt(username.length - 1);
    
    return `${maskedUsername}@${domain}`;
  },

  getDomain: (email) => {
    if (!email || typeof email !== 'string') return '';
    return email.split('@')[1] || '';
  }
};

// Address Formatters
export const addressFormatters = {
  truncate: (address, maxLength = 50) => {
    if (!address || typeof address !== 'string') return '';
    if (address.length <= maxLength) return address;
    return address.substring(0, maxLength) + '...';
  },

  format: (address) => {
    if (!address || typeof address !== 'string') return '';
    return address.replace(/\s+/g, ' ').trim();
  }
};

// Number Formatters
export const numberFormatters = {
  currency: (value, currency = 'BRL') => {
    if (value === null || value === undefined) return '';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(value);
  },

  percentage: (value, decimals = 1) => {
    if (value === null || value === undefined) return '';
    return `${Number(value).toFixed(decimals)}%`;
  },

  integer: (value) => {
    if (value === null || value === undefined) return '';
    return new Intl.NumberFormat('pt-BR').format(value);
  }
};

// Age Formatters
export const ageFormatters = {
  fromBirthDate: (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return Math.max(0, age);
  },

  getGroup: (age) => {
    if (age < 18) return { label: 'Menor', color: 'info' };
    if (age >= 65) return { label: 'Idoso', color: 'warning' };
    return { label: 'Adulto', color: 'success' };
  },

  format: (age) => {
    if (age === null || age === undefined) return '';
    return `${age} ano${age !== 1 ? 's' : ''}`;
  }
};

// File Size Formatters
export const fileSizeFormatters = {
  bytes: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};

// Status Formatters
export const statusFormatters = {
  patient: (status) => {
    const statusMap = {
      active: { label: 'Ativo', color: 'success' },
      inactive: { label: 'Inativo', color: 'error' },
      pending: { label: 'Pendente', color: 'warning' }
    };
    return statusMap[status] || { label: 'Desconhecido', color: 'default' };
  }
};

// Phone Formatters
export const phoneFormatters = {
  mask: (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    
    return phone;
  }
};

// Export all formatters
export default {
  date: dateFormatters,
  name: nameFormatters,
  email: emailFormatters,
  address: addressFormatters,
  number: numberFormatters,
  age: ageFormatters,
  fileSize: fileSizeFormatters,
  status: statusFormatters,
  phone: phoneFormatters
};