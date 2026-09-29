/**
 * Utility functions for currency, dates, and calculations
 */

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Format a number as currency (defaults to INR ₹)
 */
export function formatCurrency(amount, currency = '₹') {
  const num = Number(amount) || 0;
  return `${currency}${num.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format timestamp or date string to readable format
 */
export function formatDate(dateInput) {
  if (!dateInput) return 'N/A';
  
  // Handle Firestore Timestamp
  let date;
  if (dateInput?.toDate && typeof dateInput.toDate === 'function') {
    date = dateInput.toDate();
  } else if (dateInput?.seconds) {
    date = new Date(dateInput.seconds * 1000);
  } else {
    date = new Date(dateInput);
  }

  if (isNaN(date.getTime())) return 'Invalid Date';

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Format datetime with hours and minutes
 */
export function formatDateTime(dateInput) {
  if (!dateInput) return 'N/A';
  
  let date;
  if (dateInput?.toDate && typeof dateInput.toDate === 'function') {
    date = dateInput.toDate();
  } else if (dateInput?.seconds) {
    date = new Date(dateInput.seconds * 1000);
  } else {
    date = new Date(dateInput);
  }

  if (isNaN(date.getTime())) return 'Invalid Date';

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Calculate electricity charge: units * unitRate
 */
export function calculateElectricityCharge(units, rate) {
  const u = parseFloat(units) || 0;
  const r = parseFloat(rate) || 0;
  return Math.round(u * r * 100) / 100;
}

/**
 * Calculate total monthly dues
 */
export function calculateTotalAmount(baseRent, electricityUnits, unitRate, otherCharges = 0) {
  const rent = parseFloat(baseRent) || 0;
  const elec = calculateElectricityCharge(electricityUnits, unitRate);
  const other = parseFloat(otherCharges) || 0;
  return rent + elec + other;
}

/**
 * Status styling configurations
 */
export const STATUS_CONFIG = {
  pending: {
    label: 'Pending Approval',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    dotClass: 'bg-amber-500',
  },
  approved: {
    label: 'Verified & Approved',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    dotClass: 'bg-emerald-500',
  },
  rejected: {
    label: 'Rejected',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
    dotClass: 'bg-rose-500',
  },
};

