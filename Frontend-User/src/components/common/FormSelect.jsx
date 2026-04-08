import React from 'react';
import { Form, Select, Typography } from 'antd';
import './FormComponents.css';

const { Option } = Select;
const { Text } = Typography;

/**
 * Reusable Form Select Component with built-in validation
 * @param {string} name - Form field name
 * @param {string} label - Field label
 * @param {string} placeholder - Select placeholder
 * @param {array} options - Array of options [{value, label}] or [{id, name}]
 * @param {string} valueKey - Key for option value (default: 'value')
 * @param {string} labelKey - Key for option label (default: 'label')
 * @param {array} rules - Validation rules
 * @param {boolean} required - Whether field is required
 * @param {boolean} showSearch - Enable search functionality
 * @param {boolean} allowClear - Show clear button
 * @param {boolean} disabled - Whether select is disabled
 * @param {string} mode - Select mode (multiple, tags)
 * @param {function} onChange - Custom onChange handler
 * @param {object} selectProps - Additional props for Select component
 * @param {string} helpText - Helper text below select
 */
const FormSelect = ({
    name,
    label,
    placeholder,
    options = [],
    valueKey = 'value',
    labelKey = 'label',
    rules = [],
    required = false,
    showSearch = false,
    allowClear = false,
    disabled = false,
    mode,
    onChange,
    selectProps = {},
    helpText,
    ...formItemProps
}) => {
    // Build validation rules
    const validationRules = [...rules];
    
    if (required) {
        validationRules.unshift({
            required: true,
            message: `Vui lòng chọn ${label?.toLowerCase() || 'trường này'}!`
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
            <div className="enhanced-select-wrapper">
                <Select
                    placeholder={placeholder || `Chọn ${label?.toLowerCase() || ''}...`}
                    showSearch={showSearch}
                    allowClear={allowClear}
                    disabled={disabled}
                    mode={mode}
                    onChange={onChange}
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                        (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    {...selectProps}
                >
                    {options.map((option) => {
                        const value = option[valueKey] || option.value || option.id;
                        const label = option[labelKey] || option.label || option.name || option.ten || value;
                        
                        return (
                            <Option key={value} value={value}>
                                {label}
                            </Option>
                        );
                    })}
                </Select>
            </div>
            {helpText && (
                <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                    {helpText}
                </Text>
            )}
        </Form.Item>
    );
};

export default FormSelect;
