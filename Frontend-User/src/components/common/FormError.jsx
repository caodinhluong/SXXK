import React from 'react';
import { Alert, Typography } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

/**
 * Reusable Form Error Display Component
 * @param {string|array} errors - Error message(s) to display
 * @param {string} type - Alert type (error, warning, info)
 * @param {boolean} showIcon - Show icon
 * @param {boolean} closable - Show close button
 * @param {function} onClose - Close handler
 * @param {string} title - Error title
 */
const FormError = ({
    errors,
    type = 'error',
    showIcon = true,
    closable = false,
    onClose,
    title = 'Có lỗi xảy ra'
}) => {
    if (!errors || (Array.isArray(errors) && errors.length === 0)) {
        return null;
    }

    // Convert single error to array
    const errorList = Array.isArray(errors) ? errors : [errors];

    // If only one error, show simple alert
    if (errorList.length === 1) {
        return (
            <Alert
                message={errorList[0]}
                type={type}
                showIcon={showIcon}
                closable={closable}
                onClose={onClose}
                style={{ marginBottom: 16 }}
            />
        );
    }

    // Multiple errors - show list
    return (
        <Alert
            message={title}
            description={
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {errorList.map((error, index) => (
                        <li key={index}>
                            <Text type="danger">{error}</Text>
                        </li>
                    ))}
                </ul>
            }
            type={type}
            showIcon={showIcon}
            closable={closable}
            onClose={onClose}
            style={{ marginBottom: 16 }}
        />
    );
};

/**
 * Inline error message component
 * @param {string} message - Error message
 * @param {boolean} show - Whether to show error
 */
export const InlineError = ({ message, show = true }) => {
    if (!show || !message) return null;

    return (
        <div style={{ marginTop: 4 }}>
            <Text type="danger" style={{ fontSize: '12px' }}>
                <ExclamationCircleOutlined style={{ marginRight: 4 }} />
                {message}
            </Text>
        </div>
    );
};

/**
 * Field error component for custom validation display
 * @param {string} message - Error message
 * @param {boolean} show - Whether to show error
 */
export const FieldError = ({ message, show = true }) => {
    if (!show || !message) return null;

    return (
        <Text type="danger" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
            ⚠️ {message}
        </Text>
    );
};

export default FormError;
