/**
 * Utility helper functions for the POS system
 */

/**
 * Format number as currency
 */
export function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(value);
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  return total > 0 ? (value / total) * 100 : 0;
}

/**
 * Calculate profit margin
 */
export function calculateProfitMargin(price: number, cost: number): number {
  return price > 0 ? ((price - cost) / price) * 100 : 0;
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
}

/**
 * Round to 2 decimal places
 */
export function roundToTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Calculate tax
 */
export function calculateTax(amount: number, taxRate: number = 0.1): number {
  return roundToTwo(amount * taxRate);
}

/**
 * Format SKU
 */
export function formatSKU(sku: string): string {
  return sku.toUpperCase().trim();
}

/**
 * Get status badge color
 */
export function getStatusColor(status: string): string {
  const colors: { [key: string]: string } = {
    'active': 'bg-green-500/20 text-green-400',
    'inactive': 'bg-red-500/20 text-red-400',
    'completed': 'bg-green-500/20 text-green-400',
    'pending': 'bg-yellow-500/20 text-yellow-400',
    'cancelled': 'bg-red-500/20 text-red-400'
  };
  return colors[status] || 'bg-slate-500/20 text-slate-400';
}

/**
 * Debounce function
 */
export function debounce(func: Function, delay: number) {
  let timeoutId: any;
  return function (...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Throttle function
 */
export function throttle(func: Function, limit: number) {
  let inThrottle: boolean;
  return function (...args: any[]) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
