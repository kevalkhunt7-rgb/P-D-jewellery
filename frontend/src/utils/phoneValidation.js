// Shared mobile-number helpers for all frontend phone inputs.
// Currently validates Indian-style mobile numbers: 10 digits, starting with 6-9.

export const sanitizePhone = (value) => {
  if (value === null || value === undefined) return '';
  return String(value).replace(/\D/g, '').slice(0, 10);
};

export const isValidPhone = (phone) => {
  return /^[6-9]\d{9}$/.test(String(phone || '').trim());
};

export const PHONE_ERROR_MESSAGE = 'Please enter a valid 10-digit mobile number';
