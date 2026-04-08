import React from 'react';
import { Form, DatePicker, Typography } from 'antd';
import dayjs from 'dayjs';
import './FormComponents.css';

const { Text } = Typography;

/**
 * Reusable Form DatePicker Component with built-in validation
 * @param {string} name - Form field name
 * @param {string} label - Field label
 * @param {string} placeholder - DatePicker placeholder
 * @param {array} rules - Validation rules
 * @param {boolean} required - Whether field is required
 * @param {string} format - Date format (default: 'DD/MM/YYYY')
 * @param {boolean} showTime - Show time picker
 * @param {boolean} disabled - Whether datepicker is disabled
 * @param {function} disabledDate - Function to disable specific dates
 * @param {string} picker - Picker type (date, week, month, quarter, year)
 * @param {object} datePickerProps - Additional props for DatePicker component
 * @param {string} helpText - Helper text below datepicker
 */
const FormDatePicker = ({
    name,
    label,
    placeholder,
    rules = [],
    required = false,
    format = 'DD/MM/YYYY',
    showTime = false,
    disabled = false,
    disabledDate,
    picker = 'date',
    datePickerProps = {},
    helpText,
    ...formItemProps
}) => {
    // Build validation rules
    const validationRules = [...rules];
    
    if (required) {
        validationRules.unshift({
            required: true,
            message: `Vui lòng chọn ${label?.toLowerCase() || 'ngày'}!`
        });
    }
    
    // Add date validation
    validationRules.push({
        validator: (_, value) => {
            if (!value) return Promise.resolve();
            if (!dayjs(value).isValid()) {
                return Promise.reject(new Error('Ngày không hợp lệ'));
            }
            return Promise.resolve();
        }
    });

    return (
        <Form.Item
            name={name}
            label={label}
            rules={validationRules}
            className="enhanced-form-item"
            {...formItemProps}
        >
            <div className="enhanced-datepicker-wrapper">
                <DatePicker
                    style={{ width: '100%' }}
                    placeholder={placeholder || `Chọn ${label?.toLowerCase() || 'ngày'}...`}
                    format={format}
                    showTime={showTime}
                    disabled={disabled}
                    disabledDate={disabledDate}
                    picker={picker}
                    {...datePickerProps}
                />
            </div>
            {helpText && (
                <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                    {helpText}
                </Text>
            )}
        </Form.Item>
    );
};

export default FormDatePicker;
