/**
 * Utility function to format dates
 */
export function formatDate(date: Date, format: string = 'dd/MM/yyyy'): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return format
    .replace('dd', day)
    .replace('MM', month)
    .replace('yyyy', year.toString());
}

/**
 * Utility function to format time
 */
export function formatTime(date: Date, format: 'h12' | 'h24' = 'h24'): string {
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  if (format === 'h12') {
    const period = parseInt(hours) >= 12 ? 'PM' : 'AM';
    const h12 = String(parseInt(hours) % 12 || 12).padStart(2, '0');
    return `${h12}:${minutes}:${seconds} ${period}`;
  }

  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Utility function to calculate days between two dates
 */
export function calculateDaysBetween(startDate: Date, endDate: Date): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Utility function to validate email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Utility function to validate phone number
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

/**
 * Utility function to format currency
 */
export function formatCurrency(amount: number, currencyCode: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode
  }).format(amount);
}

/**
 * Utility function to parse query parameters from URL
 */
export function parseQueryParams(url: string): Record<string, string> {
  const params = new URLSearchParams(new URL(url).search);
  const result: Record<string, string> = {};

  params.forEach((value, key) => {
    result[key] = value;
  });

  return result;
}

/**
 * Utility function to debounce function calls
 */
export function debounce(func: Function, delay: number): (...args: any[]) => void {
  let timeoutId: any;

  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Utility function to throttle function calls
 */
export function throttle(func: Function, limit: number): (...args: any[]) => void {
  let inThrottle: boolean;

  return (...args: any[]) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Utility to generate random unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
