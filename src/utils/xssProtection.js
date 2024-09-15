import DOMPurify from 'dompurify';

// Import your existing sanitizeInput function
import { sanitizeInput as basicSanitize } from './inputValidation';

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // First, apply the basic sanitization
  let sanitized = basicSanitize(input);
  
  // Then, apply DOMPurify
  sanitized = DOMPurify.sanitize(sanitized, {
    ALLOWED_TAGS: [], // This disallows all HTML tags
    ALLOWED_ATTR: [] // This disallows all HTML attributes
  });
  
  return sanitized;
};

// You can also create a version that allows some safe HTML if needed
export const sanitizeHtml = (input) => {
  if (typeof input !== 'string') return input;
  
  // First, apply the basic sanitization
  let sanitized = basicSanitize(input);
  
  // Then, apply DOMPurify with some allowed tags
  sanitized = DOMPurify.sanitize(sanitized, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href']
  });
  
  return sanitized;
};