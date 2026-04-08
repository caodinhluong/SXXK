/**
 * Validation Helper Functions
 * Additional validation utilities beyond basic rules
 */

/**
 * Validate that a date is after another date
 * @param {Date|string} date - Date to validate
 * @param {Date|string} compareDate - Date to compare against
 * @param {string} message - Custom error message
 * @returns {Promise}
 */
export const validateDateAfter = (date, compareDate, message) => {
    if (!date || !compareDate) return Promise.resolve();
    
    const d1 = new Date(date);
    const d2 = new Date(compareDate);
    
    if (d1 > d2) {
        return Promise.resolve();
    }
    
    return Promise.reject(new Error(message || 'Ngày phải sau ngày được chọn'));
};

/**
 * Validate that a date is before another date
 * @param {Date|string} date - Date to validate
 * @param {Date|string} compareDate - Date to compare against
 * @param {string} message - Custom error message
 * @returns {Promise}
 */
export const validateDateBefore = (date, compareDate, message) => {
    if (!date || !compareDate) return Promise.resolve();
    
    const d1 = new Date(date);
    const d2 = new Date(compareDate);
    
    if (d1 < d2) {
        return Promise.resolve();
    }
    
    return Promise.reject(new Error(message || 'Ngày phải trước ngày được chọn'));
};

/**
 * Validate that a number is within available stock
 * @param {number} quantity - Quantity to validate
 * @param {number} availableStock - Available stock
 * @param {string} itemName - Name of item for error message
 * @returns {Promise}
 */
export const validateStockAvailability = (quantity, availableStock, itemName = 'sản phẩm') => {
    if (!quantity) return Promise.resolve();
    
    if (quantity <= availableStock) {
        return Promise.resolve();
    }
    
    return Promise.reject(
        new Error(`Số lượng vượt quá tồn kho khả dụng (${availableStock.toLocaleString()}) của ${itemName}`)
    );
};

/**
 * Validate unique value in a list
 * @param {any} value - Value to check
 * @param {Array} existingList - List of existing values
 * @param {string} fieldName - Field name for error message
 * @returns {Promise}
 */
export const validateUnique = (value, existingList, fieldName = 'giá trị') => {
    if (!value) return Promise.resolve();
    
    const exists = existingList.some(item => 
        item === value || 
        (typeof item === 'object' && Object.values(item).includes(value))
    );
    
    if (!exists) {
        return Promise.resolve();
    }
    
    return Promise.reject(new Error(`${fieldName} "${value}" đã tồn tại trong hệ thống`));
};

/**
 * Validate no duplicate items in array
 * @param {Array} items - Array to check
 * @param {string} key - Key to check for duplicates
 * @param {string} fieldName - Field name for error message
 * @returns {Promise}
 */
export const validateNoDuplicates = (items, key, fieldName = 'mục') => {
    if (!items || items.length === 0) return Promise.resolve();
    
    const values = items.map(item => item[key]).filter(Boolean);
    const duplicates = values.filter((value, index) => values.indexOf(value) !== index);
    
    if (duplicates.length === 0) {
        return Promise.resolve();
    }
    
    return Promise.reject(
        new Error(`${fieldName} bị trùng lặp. Vui lòng kiểm tra lại`)
    );
};

/**
 * Validate minimum array length
 * @param {Array} items - Array to validate
 * @param {number} minLength - Minimum required length
 * @param {string} fieldName - Field name for error message
 * @returns {Promise}
 */
export const validateMinArrayLength = (items, minLength, fieldName = 'mục') => {
    if (!items) return Promise.reject(new Error(`Vui lòng thêm ít nhất ${minLength} ${fieldName}`));
    
    const validItems = items.filter(item => {
        // Check if item has required fields filled
        return Object.values(item).some(value => value !== null && value !== undefined && value !== '');
    });
    
    if (validItems.length >= minLength) {
        return Promise.resolve();
    }
    
    return Promise.reject(new Error(`Vui lòng thêm ít nhất ${minLength} ${fieldName} hợp lệ`));
};

/**
 * Validate that all items in array have required fields
 * @param {Array} items - Array to validate
 * @param {Array} requiredFields - Required field names
 * @param {string} fieldName - Field name for error message
 * @returns {Promise}
 */
export const validateArrayItemsComplete = (items, requiredFields, fieldName = 'mục') => {
    if (!items || items.length === 0) return Promise.resolve();
    
    const incompleteItems = items.filter(item => {
        return requiredFields.some(field => !item[field] || item[field] === 0);
    });
    
    if (incompleteItems.length === 0) {
        return Promise.resolve();
    }
    
    return Promise.reject(
        new Error(`Có ${incompleteItems.length} ${fieldName} chưa điền đầy đủ thông tin. Vui lòng kiểm tra lại`)
    );
};

/**
 * Validate Vietnamese phone number
 * @param {string} phone - Phone number to validate
 * @returns {Promise}
 */
export const validateVietnamesePhone = (phone) => {
    if (!phone) return Promise.resolve();
    
    const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
    
    if (phoneRegex.test(phone.replace(/\s/g, ''))) {
        return Promise.resolve();
    }
    
    return Promise.reject(new Error('Số điện thoại không hợp lệ (VD: 0912345678)'));
};

/**
 * Validate Vietnamese tax code
 * @param {string} taxCode - Tax code to validate
 * @returns {Promise}
 */
export const validateVietnameseTaxCode = (taxCode) => {
    if (!taxCode) return Promise.resolve();
    
    const taxCodeRegex = /^[0-9]{10}(-[0-9]{3})?$/;
    
    if (taxCodeRegex.test(taxCode)) {
        return Promise.resolve();
    }
    
    return Promise.reject(new Error('Mã số thuế không hợp lệ (10 số hoặc 10-3 số)'));
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {Promise}
 */
export const validateEmail = (email) => {
    if (!email) return Promise.resolve();
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (emailRegex.test(email)) {
        return Promise.resolve();
    }
    
    return Promise.reject(new Error('Email không hợp lệ'));
};

/**
 * Validate positive number
 * @param {number} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @returns {Promise}
 */
export const validatePositiveNumber = (value, fieldName = 'Số') => {
    if (value === null || value === undefined) return Promise.resolve();
    
    if (value > 0) {
        return Promise.resolve();
    }
    
    return Promise.reject(new Error(`${fieldName} phải lớn hơn 0`));
};

/**
 * Validate non-negative number
 * @param {number} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @returns {Promise}
 */
export const validateNonNegativeNumber = (value, fieldName = 'Số') => {
    if (value === null || value === undefined) return Promise.resolve();
    
    if (value >= 0) {
        return Promise.resolve();
    }
    
    return Promise.reject(new Error(`${fieldName} phải >= 0`));
};

/**
 * Validate number range
 * @param {number} value - Value to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {string} fieldName - Field name for error message
 * @returns {Promise}
 */
export const validateNumberRange = (value, min, max, fieldName = 'Giá trị') => {
    if (value === null || value === undefined) return Promise.resolve();
    
    if (value >= min && value <= max) {
        return Promise.resolve();
    }
    
    return Promise.reject(new Error(`${fieldName} phải từ ${min.toLocaleString()} đến ${max.toLocaleString()}`));
};

/**
 * Format validation error messages for display
 * @param {Object} error - Error object from API
 * @returns {Array} Array of error messages
 */
export const formatValidationErrors = (error) => {
    if (!error) return [];
    
    // If error is a string
    if (typeof error === 'string') {
        return [error];
    }
    
    // If error has message property
    if (error.message) {
        return [error.message];
    }
    
    // If error has errors array (from backend validation)
    if (error.errors && Array.isArray(error.errors)) {
        return error.errors.map(err => err.message || err.msg || String(err));
    }
    
    // If error has data.errors object (field-specific errors)
    if (error.data && error.data.errors) {
        return Object.values(error.data.errors).flat();
    }
    
    // Default
    return ['Có lỗi xảy ra. Vui lòng thử lại'];
};

/**
 * Check if form has validation errors
 * @param {Object} form - Ant Design form instance
 * @returns {boolean}
 */
export const hasFormErrors = (form) => {
    const errors = form.getFieldsError();
    return errors.some(({ errors }) => errors.length > 0);
};

/**
 * Get all form error messages
 * @param {Object} form - Ant Design form instance
 * @returns {Array} Array of error messages
 */
export const getFormErrors = (form) => {
    const errors = form.getFieldsError();
    return errors
        .filter(({ errors }) => errors.length > 0)
        .map(({ name, errors }) => `${name.join('.')}: ${errors.join(', ')}`);
};

/**
 * Scroll to first error field
 * @param {Object} form - Ant Design form instance
 */
export const scrollToFirstError = (form) => {
    const errors = form.getFieldsError();
    const firstError = errors.find(({ errors }) => errors.length > 0);
    
    if (firstError) {
        const fieldName = Array.isArray(firstError.name) ? firstError.name.join('_') : firstError.name;
        const element = document.querySelector(`[name="${fieldName}"]`);
        
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.focus();
        }
    }
};

export default {
    validateDateAfter,
    validateDateBefore,
    validateStockAvailability,
    validateUnique,
    validateNoDuplicates,
    validateMinArrayLength,
    validateArrayItemsComplete,
    validateVietnamesePhone,
    validateVietnameseTaxCode,
    validateEmail,
    validatePositiveNumber,
    validateNonNegativeNumber,
    validateNumberRange,
    formatValidationErrors,
    hasFormErrors,
    getFormErrors,
    scrollToFirstError
};
