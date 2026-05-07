/**
 * Input sanitization utilities
 * Prevents NoSQL injection and XSS attacks
 */

/**
 * Sanitize user input to prevent NoSQL injection
 * Removes MongoDB operators and dangerous characters
 * 
 * @param input - Any user input
 * @returns Sanitized input
 * 
 * @example
 * const body = await req.json();
 * const safe = sanitizeInput(body);
 */
export function sanitizeInput(input: any): any {
  // Handle null/undefined
  if (input === null || input === undefined) {
    return input;
  }

  // Handle strings
  if (typeof input === 'string') {
    return input
      .replace(/[${}]/g, '') // Remove MongoDB operators
      .trim();
  }

  // Handle arrays
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }

  // Handle objects
  if (typeof input === 'object') {
    const sanitized: any = {};
    
    for (const [key, value] of Object.entries(input)) {
      // Skip keys starting with $ (MongoDB operators)
      if (key.startsWith('$')) {
        continue;
      }
      
      // Skip __proto__ and constructor (prototype pollution)
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }
      
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeInput(value);
    }
    
    return sanitized;
  }

  // Return primitives as-is (numbers, booleans)
  return input;
}

/**
 * Sanitize HTML to prevent XSS
 * Basic implementation - for production use DOMPurify
 * 
 * @param html - HTML string
 * @returns Sanitized HTML
 */
export function sanitizeHtml(html: string): string {
  return html
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize MongoDB query to prevent injection
 * 
 * @param query - MongoDB query object
 * @returns Sanitized query
 */
export function sanitizeMongoQuery(query: any): any {
  if (!query || typeof query !== 'object') {
    return query;
  }

  const sanitized: any = {};

  for (const [key, value] of Object.entries(query)) {
    // Allow specific MongoDB operators
    const allowedOperators = [
      '$eq', '$ne', '$gt', '$gte', '$lt', '$lte',
      '$in', '$nin', '$and', '$or', '$not',
      '$exists', '$regex', '$options'
    ];

    if (key.startsWith('$') && !allowedOperators.includes(key)) {
      continue; // Skip dangerous operators
    }

    // Recursively sanitize nested queries
    if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeMongoQuery(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Validate and sanitize email
 * 
 * @param email - Email string
 * @returns Sanitized email or null if invalid
 */
export function sanitizeEmail(email: string): string | null {
  if (typeof email !== 'string') return null;

  const sanitized = email.toLowerCase().trim();
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  return emailRegex.test(sanitized) ? sanitized : null;
}

/**
 * Sanitize phone number
 * 
 * @param phone - Phone number string
 * @returns Sanitized phone number (digits only)
 */
export function sanitizePhone(phone: string): string {
  if (typeof phone !== 'string') return '';
  
  // Remove all non-digit characters
  return phone.replace(/\D/g, '');
}

/**
 * Sanitize URL
 * 
 * @param url - URL string
 * @returns Sanitized URL or null if invalid
 */
export function sanitizeUrl(url: string): string | null {
  if (typeof url !== 'string') return null;

  try {
    const parsed = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    
    return parsed.toString();
  } catch {
    return null;
  }
}
