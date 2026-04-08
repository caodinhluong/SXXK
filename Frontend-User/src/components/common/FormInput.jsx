import React from 'react';
import { Form, Input, Typography } from 'antd';
import './FormComponents.css';

const { Text } = Typography;

/**
 * Reusable Form Input Component with built-in validation and error display
 * @param {string} name - Form field name
 * @param {string} label - Field label
 * @param {string} placeholder - Input placeholder
 * @param {array} rules - Validation rules
 * @param {boolean} required - Whether field is required
 * @param {string} type - Input type (text, password, email, etc.)
 * @param {number} maxLength - Maximum character length
 * @param {number} minLength - Minimum character length
 * @param {boolean} disabled - Whether input is disabled
 * @param {string} prefix - Prefix icon or text
 * @param {string} suffix - Suffix icon or text
 * @param {object} inputProps - Additional props for Input component
 * @param {string} helpText - Helper text below input
 */
const FormInput = ({
    name,
    label,
    placeholder,
    rules = [],
    required = false,
    type = 'text',
    maxLength,
    minLength,
    disabled = false,
    prefix,
    suffix,
    inputProps = {},
    helpText,
    ...formItemProps
}) => {
    // Build validation rules
    const validationRules = [...rules];
    
    if (required) {
        validationRules.unshift({
            required: true,
            message: `Vui lòng nhập ${label?.toLowerCase() || 'trường này'}!`
        });
    }
    
    if (minLength) {
        validationRules.push({
            min: minLength,
            message: `Tối thiểu ${minLength} ký tự`
        });
    }
    
    if (maxLength) {
        validationRules.push({
            max: maxLength,
            message: `Tối đa ${maxLength} ký tự`
        });
    }
    
    if (type === 'email') {
        validationRules.push({
            type: 'email',
            message: 'Email không hợp lệ'
        });
    }

    return (
        <Form.Item
            name={name}
            label={label}
            rules={validationRules}
            className="enhanced-form-item"
            {...formItemProps}
        >
            <div className="enhanced-input-wrapper">
                <Input
                    type={type}
                    placeholder={placeholder || `Nhập ${label?.toLowerCase() || ''}...`}
                    disabled={disabled}
                    maxLength={maxLength}
                    prefix={prefix}
                    suffix={suffix}
                    {...inputProps}
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

export default FormInput;
