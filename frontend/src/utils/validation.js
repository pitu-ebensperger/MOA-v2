
/**-------------------------------------------------------------------------------------------------------------------------------
 * VALIDA EMAIL FORMAT
 * @param {string} email - Email a validar
 * @returns {{ valid: boolean, error?: string }}
 */
export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return { valid: false, error: 'El correo electrónico es requerido' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Ingresa un correo electrónico válido' };
  }
  
  return { valid: true };
};

/**-------------------------------------------------------------------------------------------------------------------------------
 * VALIDA CONTRASEÑA
 * @param {string} password - Contraseña a validar
 * @param {Object} options - Opciones de validación
 * @param {number} options.minLength - Longitud mínima (default: 6)
 * @param {boolean} options.requireLetters - Requiere letras (default: false)
 * @param {boolean} options.requireNumbers - Requiere números (default: false)
 * @returns {{ valid: boolean, error?: string }}
 */
export const validatePassword = (password, options = {}) => {
  const {
    minLength = 6,
    requireLetters = false,
    requireNumbers = false,
  } = options;
  
  if (!password) {
    return { valid: false, error: 'La contraseña es requerida' };
  }
  
  if (password.length < minLength) {
    return { 
      valid: false, 
      error: `La contraseña debe tener al menos ${minLength} caracteres` 
    };
  }
  
  if (requireLetters && !/[A-Za-z]/.test(password)) {
    return { valid: false, error: 'La contraseña debe contener letras' };
  }
  
  if (requireNumbers && !/[0-9]/.test(password)) {
    return { valid: false, error: 'La contraseña debe contener números' };
  }
  
  if (requireLetters && requireNumbers && (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password))) {
    return { valid: false, error: 'La contraseña debe contener letras y números' };
  }
  
  return { valid: true };
};

/**-------------------------------------------------------------------------------------------------------------------------------
 * VALIDA NOMBRE COMPLETO
 * @param {string} name - Nombre a validar
 * @param {number} minLength - Longitud mínima (default: 3)
 * @returns {{ valid: boolean, error?: string }}
 */
export const validateName = (name, minLength = 3) => {
  if (!name || !name.trim()) {
    return { valid: false, error: 'El nombre es requerido' };
  }
  
  if (name.trim().length < minLength) {
    return { 
      valid: false, 
      error: `El nombre debe tener al menos ${minLength} caracteres` 
    };
  }
  
  return { valid: true };
};

/**-------------------------------------------------------------------------------------------------------------------------------
 * VALIDA NUM TEL
 * @param {string} phone - Teléfono a validar
 * @returns {{ valid: boolean, error?: string }}
 */
export const validatePhone = (phone) => {
  if (!phone || !phone.trim()) {
    return { valid: false, error: 'El teléfono es requerido' };
  }
  
  // Patrón flexible: +56 9 1234 5678, 912345678, etc.
  const phoneRegex = /^\+?\d[\d\s-]{7,}$/;
  if (!phoneRegex.test(phone)) {
    return { 
      valid: false, 
      error: 'Ingresa un número de teléfono válido (ej: +56 9 1234 5678)' 
    };
  }
  
  return { valid: true };
};

/**-------------------------------------------------------------------------------------------------------------------------------
 * VALIDA CONTRASEÑAS COINCIDEN
 * @param {string} password - Contraseña
 * @param {string} confirmPassword - Confirmación de contraseña
 * @returns {{ valid: boolean, error?: string }}
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  if (!confirmPassword) {
    return { valid: false, error: 'Debes confirmar tu contraseña' };
  }
  
  if (password !== confirmPassword) {
    return { valid: false, error: 'Las contraseñas no coinciden' };
  }
  
  return { valid: true };
};

/**-------------------------------------------------------------------------------------------------------------------------------
 * VALIDA SLUG (formato URL)
 * @param {string} slug - Slug a validar
 * @returns {{ valid: boolean, error?: string }}
 */
export const validateSlug = (slug) => {
  if (!slug || !slug.trim()) {
    return { valid: false, error: 'El slug es obligatorio' };
  }
  
  // Solo letras minúsculas, números y guiones
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!slugPattern.test(slug)) {
    return { 
      valid: false, 
      error: 'El slug solo puede contener letras minúsculas, números y guiones' 
    };
  }
  
  return { valid: true };
};

/**-------------------------------------------------------------------------------------------------------------------------------
 * VALIDA CAMPO REQUERIDO
 * @param {string} value - Valor a validar
 * @param {string} fieldName - Nombre del campo (para mensaje de error)
 * @returns {{ valid: boolean, error?: string }}
 */
export const validateRequired = (value, fieldName = 'Este campo') => {
  if (!value || !String(value).trim()) {
    return { valid: false, error: `${fieldName} es obligatorio` };
  }
  
  return { valid: true };
};

/**-------------------------------------------------------------------------------------------------------------------------------
 * VALIDA FORM FIELDS
 * @param {Object} fields - Objeto con los campos a validar
 * @param {Object} validators - Objeto con funciones validadoras por campo
 * @returns {Object} - Objeto con errores por campo { fieldName: errorMessage }
 */
export const validateFields = (fields, validators) => {
  const errors = {};
  
  Object.keys(validators).forEach((fieldName) => {
    const validator = validators[fieldName];
    const value = fields[fieldName];
    const result = validator(value);
    
    if (!result.valid) {
      errors[fieldName] = result.error;
    }
  });
  
  return errors;
};
