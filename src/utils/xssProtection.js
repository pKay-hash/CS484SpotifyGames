import DOMPurify from 'dompurify';

export const sanitizeInput = (input) => {
  return typeof input === 'string' ? DOMPurify.sanitize(input) : input;
};

export const escapeHtml = (unsafe) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};