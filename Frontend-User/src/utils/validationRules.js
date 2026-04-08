/**
 * Common validation rules for forms
 * These can be used with Ant Design Form.Item rules prop
 */

// Required field
export const required = (message = 'Trường này là bắt buộc') => ({
    required: true,
    message
});

// Minimum length
export const minLength = (min, message) => ({
    min,
    message: message || `Tối thiểu ${min} ký tự`
});

// Maximum length
export const maxLength = (max, message) => ({
    max,
    message: message || `Tối đa ${max} ký tự`
});

// Email validation
export const email = () => ({
    type: 'email',
    message: 'Email không hợp lệ'
});

// Phone number validation (Vietnamese format)
export const phone = () => ({
    pattern: /^[0-9]{10,11}$/,
    message: 'Số điện thoại không hợp lệ (10-11 số)'
});

// Positive number (> 0)
export const positiveNumber = (message) => ({
    type: 'number',
    min: 0.01,
    message: message || 'Số phải lớn hơn 0'
});

// Non-negative number (>= 0)
export const nonNegativeNumber = (message) => ({
    type: 'number',
    min: 0,
    message: message || 'Số phải >= 0'
});

// Tax code validation (Vietnamese format)
export const taxCode = () => ({
    pattern: /^[0-9]{10,13}$/,
    message: 'Mã số thuế không hợp lệ (10-13 số)'
});

// URL validation
export const url = () => ({
    type: 'url',
    message: 'URL không hợp lệ'
});

// Number range validation
export const numberRange = (min, max, message) => ({
    type: 'number',
    min,
    max,
    message: message || `Giá trị phải từ ${min} đến ${max}`
});

// Custom pattern validation
export const pattern = (regex, message) => ({
    pattern: regex,
    message
});

// Whitespace validation
export const noWhitespace = () => ({
    whitespace: true,
    message: 'Không được chỉ chứa khoảng trắng'
});

// Custom validator
export const customValidator = (validator, message) => ({
    validator: (_, value) => {
        if (validator(value)) {
            return Promise.resolve();
        }
        return Promise.reject(new Error(message));
    }
});

// Date validation - must be in the past
export const pastDate = (message) => ({
    validator: (_, value) => {
        if (!value) return Promise.resolve();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (new Date(value) <= today) {
            return Promise.resolve();
        }
        return Promise.reject(new Error(message || 'Ngày phải trong quá khứ'));
    }
});

// Date validation - must be in the future
export const futureDate = (message) => ({
    validator: (_, value) => {
        if (!value) return Promise.resolve();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (new Date(value) >= today) {
            return Promise.resolve();
        }
        return Promise.reject(new Error(message || 'Ngày phải trong tương lai'));
    }
});

// Date validation - must be after another date
export const dateAfter = (compareDate, message) => ({
    validator: (_, value) => {
        if (!value || !compareDate) return Promise.resolve();
        if (new Date(value) > new Date(compareDate)) {
            return Promise.resolve();
        }
        return Promise.reject(new Error(message || 'Ngày phải sau ngày được chọn'));
    }
});

// Date validation - must be before another date
export const dateBefore = (compareDate, message) => ({
    validator: (_, value) => {
        if (!value || !compareDate) return Promise.resolve();
        if (new Date(value) < new Date(compareDate)) {
            return Promise.resolve();
        }
        return Promise.reject(new Error(message || 'Ngày phải trước ngày được chọn'));
    }
});

// Match another field (e.g., password confirmation)
export const matchField = (fieldName, fieldLabel, form) => ({
    validator: (_, value) => {
        if (!value || form.getFieldValue(fieldName) === value) {
            return Promise.resolve();
        }
        return Promise.reject(new Error(`${fieldLabel} không khớp`));
    }
});

// Vietnamese ID card validation
export const idCard = () => ({
    pattern: /^[0-9]{9,12}$/,
    message: 'Số CMND/CCCD không hợp lệ (9-12 số)'
});

// Alphanumeric only
export const alphanumeric = () => ({
    pattern: /^[a-zA-Z0-9]+$/,
    message: 'Chỉ được chứa chữ cái và số'
});

// No special characters
export const noSpecialChars = () => ({
    pattern: /^[a-zA-Z0-9\s]+$/,
    message: 'Không được chứa ký tự đặc biệt'
});

// Vietnamese characters allowed
export const vietnameseText = () => ({
    pattern: /^[a-zA-ZÀ-ỹ\s]+$/,
    message: 'Chỉ được chứa chữ cái tiếng Việt'
});

// Integer validation
export const integer = (message) => ({
    validator: (_, value) => {
        if (!value) return Promise.resolve();
        if (Number.isInteger(value)) {
            return Promise.resolve();
        }
        return Promise.reject(new Error(message || 'Phải là số nguyên'));
    }
});

// Decimal validation with specific precision
export const decimal = (precision, message) => ({
    validator: (_, value) => {
        if (!value) return Promise.resolve();
        const regex = new RegExp(`^\\d+(\\.\\d{1,${precision}})?$`);
        if (regex.test(String(value))) {
            return Promise.resolve();
        }
        return Promise.reject(new Error(message || `Tối đa ${precision} chữ số thập phân`));
    }
});

// Port number validation
export const portNumber = () => ({
    validator: (_, value) => {
        if (!value) return Promise.resolve();
        const port = Number(value);
        if (Number.isInteger(port) && port >= 1 && port <= 65535) {
            return Promise.resolve();
        }
        return Promise.reject(new Error('Cổng phải từ 1 đến 65535'));
    }
});

// Container number validation (shipping)
export const containerNumber = () => ({
    pattern: /^[A-Z]{4}[0-9]{7}$/,
    message: 'Số container không hợp lệ (VD: ABCD1234567)'
});

// HS Code validation (customs)
export const hsCode = () => ({
    pattern: /^[0-9]{6,10}$/,
    message: 'Mã HS không hợp lệ (6-10 số)'
});

// Percentage validation (0-100)
export const percentage = (message) => ({
    type: 'number',
    min: 0,
    max: 100,
    message: message || 'Phần trăm phải từ 0 đến 100'
});

// Required select field (for Ant Design Select)
export const requiredSelectRule = (fieldName) => ({
    required: true,
    message: `Vui lòng chọn ${fieldName}`
});

// Past date rules (for date picker - allows past and today)
export const pastDateRules = (fieldName) => [
    {
        required: true,
        message: `Vui lòng chọn ${fieldName}`
    },
    {
        validator: (_, value) => {
            if (!value) return Promise.resolve();
            const today = new Date();
            today.setHours(23, 59, 59, 999); // End of today
            const selectedDate = new Date(value);
            if (selectedDate <= today) {
                return Promise.resolve();
            }
            return Promise.reject(new Error(`${fieldName} không được là ngày tương lai`));
        }
    }
];

// Export all as default object
export default {
    required,
    minLength,
    maxLength,
    email,
    phone,
    positiveNumber,
    nonNegativeNumber,
    taxCode,
    url,
    numberRange,
    pattern,
    noWhitespace,
    customValidator,
    pastDate,
    futureDate,
    dateAfter,
    dateBefore,
    matchField,
    idCard,
    alphanumeric,
    noSpecialChars,
    vietnameseText,
    integer,
    decimal,
    portNumber,
    containerNumber,
    hsCode,
    percentage,
    requiredSelectRule,
    pastDateRules
};
