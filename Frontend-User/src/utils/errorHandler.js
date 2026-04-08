/**
 * Error Handler Utility
 * Extracts and formats error messages from API responses
 */

/**
 * Extract error message from various error response formats
 * @param {Object} error - Error object from API call
 * @returns {string} - Formatted error message
 */
export const extractErrorMessage = (error) => {
  if (!error) return 'Đã xảy ra lỗi không xác định';

  // Direct string error
  if (typeof error === 'string') return error;

  // Error with response data
  const errorData = error.response?.data || error.data || error;

  // Check for message field (most common)
  if (errorData.message) return errorData.message;

  // Check for error field
  if (errorData.error) {
    if (typeof errorData.error === 'string') return errorData.error;
    if (errorData.error.message) return errorData.error.message;
  }

  // Check for errors array (validation errors)
  if (errorData.errors) {
    if (Array.isArray(errorData.errors)) {
      return errorData.errors.map(err => {
        if (typeof err === 'string') return err;
        if (err.message) return err.message;
        if (err.msg) return err.msg;
        return JSON.stringify(err);
      }).join(', ');
    }
    if (typeof errorData.errors === 'object') {
      return Object.entries(errorData.errors)
        .map(([field, msg]) => `${field}: ${msg}`)
        .join(', ');
    }
  }

  // Check for detail field (some APIs use this)
  if (errorData.detail) return errorData.detail;

  // Fallback to error message property
  if (error.message) return error.message;

  // Last resort
  return 'Đã xảy ra lỗi không xác định';
};

/**
 * Extract validation errors from API response
 * @param {Object} error - Error object from API call
 * @returns {Object|Array|string|null} - Validation errors in various formats
 */
export const extractValidationErrors = (error) => {
  if (!error) return null;

  const errorData = error.response?.data || error.data || error;

  // Check for errors field
  if (errorData.errors) {
    return errorData.errors;
  }

  // Check for validationErrors field
  if (errorData.validationErrors) {
    return errorData.validationErrors;
  }

  // Check for details field (some validation libraries use this)
  if (errorData.details) {
    return errorData.details;
  }

  return null;
};

/**
 * Get HTTP status code from error
 * @param {Object} error - Error object from API call
 * @returns {number|null} - HTTP status code
 */
export const getErrorStatus = (error) => {
  if (!error) return null;
  return error.status || error.response?.status || null;
};

/**
 * Check if error is a specific HTTP status
 * @param {Object} error - Error object from API call
 * @param {number} status - HTTP status code to check
 * @returns {boolean}
 */
export const isErrorStatus = (error, status) => {
  return getErrorStatus(error) === status;
};

/**
 * Check if error is a validation error (400 or 422)
 * @param {Object} error - Error object from API call
 * @returns {boolean}
 */
export const isValidationError = (error) => {
  const status = getErrorStatus(error);
  return status === 400 || status === 422;
};

/**
 * Check if error is an authentication error (401)
 * @param {Object} error - Error object from API call
 * @returns {boolean}
 */
export const isAuthError = (error) => {
  return isErrorStatus(error, 401);
};

/**
 * Check if error is a forbidden error (403)
 * @param {Object} error - Error object from API call
 * @returns {boolean}
 */
export const isForbiddenError = (error) => {
  return isErrorStatus(error, 403);
};

/**
 * Check if error is a not found error (404)
 * @param {Object} error - Error object from API call
 * @returns {boolean}
 */
export const isNotFoundError = (error) => {
  return isErrorStatus(error, 404);
};

/**
 * Check if error is a server error (5xx)
 * @param {Object} error - Error object from API call
 * @returns {boolean}
 */
export const isServerError = (error) => {
  const status = getErrorStatus(error);
  return status >= 500 && status < 600;
};

/**
 * Check if error is a network error
 * @param {Object} error - Error object from API call
 * @returns {boolean}
 */
export const isNetworkError = (error) => {
  return error?.code === 'ERR_NETWORK' || 
         error?.message === 'Network Error' ||
         !error?.response;
};

/**
 * Format error for display
 * @param {Object} error - Error object from API call
 * @param {string} context - Context of the error (e.g., 'tải dữ liệu', 'lưu phiếu')
 * @returns {Object} - Formatted error with title and message
 */
export const formatError = (error, context = '') => {
  const status = getErrorStatus(error);
  const message = extractErrorMessage(error);

  let title = 'Đã xảy ra lỗi';
  let description = message;

  if (isValidationError(error)) {
    title = 'Dữ liệu không hợp lệ';
    const validationErrors = extractValidationErrors(error);
    if (validationErrors) {
      if (Array.isArray(validationErrors)) {
        description = validationErrors.join('\n');
      } else if (typeof validationErrors === 'object') {
        description = Object.entries(validationErrors)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join('\n');
      }
    }
  } else if (isAuthError(error)) {
    title = 'Phiên làm việc hết hạn';
    description = 'Vui lòng đăng nhập lại';
  } else if (isForbiddenError(error)) {
    title = 'Không có quyền truy cập';
    description = context 
      ? `Bạn không có quyền ${context}` 
      : 'Bạn không có quyền thực hiện thao tác này';
  } else if (isNotFoundError(error)) {
    title = 'Không tìm thấy';
    description = context 
      ? `Không tìm thấy ${context}` 
      : 'Dữ liệu không tồn tại hoặc đã bị xóa';
  } else if (isServerError(error)) {
    title = 'Lỗi máy chủ';
    description = 'Đã xảy ra lỗi trên máy chủ. Vui lòng thử lại sau.';
  } else if (isNetworkError(error)) {
    title = 'Lỗi kết nối';
    description = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet.';
  } else if (context) {
    description = `Lỗi khi ${context}: ${message}`;
  }

  return { title, description, status };
};

/**
 * Format error for service layer
 * @param {Object} error - Error object from API call
 * @param {string} defaultMessage - Default message if error extraction fails
 * @returns {Object} - Error object with message and status
 */
export const formatServiceError = (error, defaultMessage = 'Đã xảy ra lỗi') => {
  const message = extractErrorMessage(error) || defaultMessage;
  const status = getErrorStatus(error);
  
  return {
    message,
    status,
    error: message,
    ...error
  };
};

/**
 * Log error to console (for debugging)
 * @param {string} context - Context where error occurred
 * @param {Object} error - Error object
 */
export const logError = (context, error) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}]`, error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
};

export default {
  extractErrorMessage,
  extractValidationErrors,
  getErrorStatus,
  isErrorStatus,
  isValidationError,
  isAuthError,
  isForbiddenError,
  isNotFoundError,
  isServerError,
  isNetworkError,
  formatError,
  formatServiceError,
  logError
};
