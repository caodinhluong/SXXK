import React from 'react';
import { Spin, Space, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const { Text } = Typography;

/**
 * Reusable Form Loading Component
 * @param {boolean} loading - Loading state
 * @param {string} message - Loading message
 * @param {string} size - Spinner size (small, default, large)
 * @param {boolean} fullScreen - Show as full screen overlay
 * @param {ReactNode} children - Content to show when not loading
 */
const FormLoading = ({
    loading = false,
    message = 'Đang tải...',
    size = 'default',
    fullScreen = false,
    children
}) => {
    const antIcon = <LoadingOutlined style={{ fontSize: size === 'large' ? 48 : size === 'small' ? 16 : 24 }} spin />;

    if (!loading) {
        return children || null;
    }

    const loadingContent = (
        <Space direction="vertical" align="center" style={{ width: '100%' }}>
            <Spin indicator={antIcon} size={size} />
            {message && <Text type="secondary">{message}</Text>}
        </Space>
    );

    if (fullScreen) {
        return (
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    zIndex: 9999
                }}
            >
                {loadingContent}
            </div>
        );
    }

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 0',
                minHeight: '200px'
            }}
        >
            {loadingContent}
        </div>
    );
};

/**
 * Button loading state component
 * @param {boolean} loading - Loading state
 * @param {string} loadingText - Text to show when loading
 * @param {string} defaultText - Text to show when not loading
 */
export const ButtonLoading = ({ loading, loadingText = 'Đang xử lý...', defaultText = 'Xác nhận' }) => {
    return loading ? loadingText : defaultText;
};

/**
 * Inline loading indicator
 * @param {boolean} loading - Loading state
 * @param {string} message - Loading message
 */
export const InlineLoading = ({ loading, message = 'Đang tải...' }) => {
    if (!loading) return null;

    return (
        <Space size="small" style={{ marginLeft: 8 }}>
            <Spin size="small" />
            <Text type="secondary" style={{ fontSize: '12px' }}>{message}</Text>
        </Space>
    );
};

export default FormLoading;
