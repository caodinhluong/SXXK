/**
 * Custom Error Classes for the Application
 * These error classes provide structured error handling with appropriate HTTP status codes
 */

/**
 * ValidationError - Used when input validation fails
 * @extends Error
 */
class ValidationError extends Error {
  /**
   * @param {string} message - Error message describing the validation failure
   * @param {string} [field] - Optional field name that failed validation
   */
  constructor(message, field = null) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.statusCode = 400;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * NotFoundError - Used when a requested resource is not found
 * @extends Error
 */
class NotFoundError extends Error {
  /**
   * @param {string} resource - Name of the resource type (e.g., 'User', 'Product')
   * @param {number|string} id - ID of the resource that was not found
   */
  constructor(resource, id) {
    super(`${resource} with id ${id} not found`);
    this.name = 'NotFoundError';
    this.resource = resource;
    this.id = id;
    this.statusCode = 404;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * DatabaseError - Used when database operations fail
 * @extends Error
 */
class DatabaseError extends Error {
  /**
   * @param {string} message - Error message describing the database failure
   * @param {Error} [originalError] - Original error from the database driver
   */
  constructor(message, originalError = null) {
    super(message);
    this.name = 'DatabaseError';
    this.originalError = originalError;
    this.statusCode = 500;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * BusinessRuleError - Used when business logic rules are violated
 * @extends Error
 */
class BusinessRuleError extends Error {
  /**
   * @param {string} message - Error message describing the business rule violation
   */
  constructor(message) {
    super(message);
    this.name = 'BusinessRuleError';
    this.statusCode = 422;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  ValidationError,
  NotFoundError,
  DatabaseError,
  BusinessRuleError
};
