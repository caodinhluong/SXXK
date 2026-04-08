import React from 'react';
import { Form, Input, Typography } from 'antd';

const { TextArea } = Input;
const { Text } = Typography;

/**
 * Reusable Form TextArea Component with built-in validation
 * @param {string} name - Form field name
 * @param {string} label - Field label
 * @param {string} placeholder - TextArea placeholder
 * @param {array} rules - Validation rules
 * @param {boolean} required - Whether field is required
 * @param {number} rows - Number of rows
 * @param {number} maxLength - Maximum character length
 * @param {number} minLength - Minimum character length
 * @param {boolean} showCount - Show character count
 * @param {boolean} disabled - Whether textarea is disabled
 * @param {boolean} autoSize - Auto resize height
 * @param {object} textAreaProps - Additional props for TextArea component
 * @param {string} helpText - Helper text below textarea
 */
const FormTextArea = ({
    name,
    label,
    placeholder,
    rules = [],
    required = false,
    rows = 4,
    maxLength,
    minLength,
    showCount = false,
    disabled = false,
    autoSize = false,
    textAreaProps = {},
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

    return (
        <Form.Item
            name={name}
            label={label}
            rules={validationRules}
            {...formItemProps}
        >
            <TextArea
                rows={rows}
                placeholder={placeholder || `Nhập ${label?.toLowerCase() || ''}...`}
                maxLength={maxLength}
                showCount={showCount}
                disabled={disabled}
                autoSize={autoSize}
                {...textAreaProps}
            />
            {helpText && (
                <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                    {helpText}
                </Text>
            )}
        </Form.Item>
    );
};

export default FormTextArea;
