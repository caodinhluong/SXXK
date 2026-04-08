import React from 'react';
import { Form, InputNumber, Typography } from 'antd';

const { Text } = Typography;

/**
 * Reusable Form InputNumber Component with built-in validation
 * @param {string} name - Form field name
 * @param {string} label - Field label
 * @param {string} placeholder - Input placeholder
 * @param {array} rules - Validation rules
 * @param {boolean} required - Whether field is required
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {number} step - Step value
 * @param {number} precision - Decimal precision
 * @param {boolean} disabled - Whether input is disabled
 * @param {string} prefix - Prefix text
 * @param {string} suffix - Suffix text (e.g., unit)
 * @param {function} formatter - Custom formatter function
 * @param {function} parser - Custom parser function
 * @param {object} inputNumberProps - Additional props for InputNumber component
 * @param {string} helpText - Helper text below input
 */
const FormInputNumber = ({
    name,
    label,
    placeholder,
    rules = [],
    required = false,
    min,
    max,
    step = 1,
    precision,
    disabled = false,
    prefix,
    suffix,
    formatter,
    parser,
    inputNumberProps = {},
    helpText,
    ...formItemProps
}) => {
    // Build validation rules
    const validationRules = [...rules];
    
    if (required) {
        validationRules.unshift({
            required: true,
            message: `Vui lòng nhập ${label?.toLowerCase() || 'số'}!`
        });
    }
    
    if (min !== undefined) {
        validationRules.push({
            type: 'number',
            min: min,
            message: `Giá trị phải >= ${min}`
        });
    }
    
    if (max !== undefined) {
        validationRules.push({
            type: 'number',
            max: max,
            message: `Giá trị phải <= ${max}`
        });
    }

    // Default formatter for Vietnamese number format
    const defaultFormatter = (value) => {
        if (!value) return '';
        return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const defaultParser = (value) => {
        return value.replace(/\./g, '');
    };

    return (
        <Form.Item
            name={name}
            label={label}
            rules={validationRules}
            {...formItemProps}
        >
            <InputNumber
                style={{ width: '100%' }}
                placeholder={placeholder || `Nhập ${label?.toLowerCase() || 'số'}...`}
                min={min}
                max={max}
                step={step}
                precision={precision}
                disabled={disabled}
                prefix={prefix}
                addonAfter={suffix}
                formatter={formatter || defaultFormatter}
                parser={parser || defaultParser}
                {...inputNumberProps}
            />
            {helpText && (
                <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                    {helpText}
                </Text>
            )}
        </Form.Item>
    );
};

export default FormInputNumber;
