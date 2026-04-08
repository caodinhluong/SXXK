import React, { useState } from 'react';
import { Form, Upload, Button, Typography, message } from 'antd';
import { UploadOutlined, LoadingOutlined, CheckCircleOutlined } from '@ant-design/icons';
import './FormComponents.css';

const { Text } = Typography;

/**
 * Reusable Form Upload Component with built-in validation and progress
 * @param {string} name - Form field name
 * @param {string} label - Field label
 * @param {array} rules - Validation rules
 * @param {boolean} required - Whether field is required
 * @param {function} customRequest - Custom upload handler
 * @param {number} maxCount - Maximum number of files
 * @param {string} accept - Accepted file types
 * @param {number} maxSize - Maximum file size in MB
 * @param {boolean} showUploadList - Show upload list
 * @param {string} buttonText - Upload button text
 * @param {object} uploadProps - Additional props for Upload component
 * @param {string} helpText - Helper text below upload
 * @param {function} onFileChange - Callback when file changes
 */
const FormUpload = ({
    name,
    label,
    rules = [],
    required = false,
    customRequest,
    maxCount = 1,
    accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls',
    maxSize = 10, // MB
    showUploadList = true,
    buttonText = 'Tải lên file',
    uploadProps = {},
    helpText,
    onFileChange,
    ...formItemProps
}) => {
    const [uploading, setUploading] = useState(false);
    const [fileUrl, setFileUrl] = useState(null);

    // Build validation rules
    const validationRules = [...rules];
    
    if (required) {
        validationRules.unshift({
            required: true,
            message: `Vui lòng tải lên ${label?.toLowerCase() || 'file'}!`
        });
    }

    // File size validation
    const beforeUpload = (file) => {
        const isLtMaxSize = file.size / 1024 / 1024 < maxSize;
        if (!isLtMaxSize) {
            message.error(`File phải nhỏ hơn ${maxSize}MB!`);
            return false;
        }
        return true;
    };

    // Handle upload with loading state
    const handleUpload = async ({ file, onSuccess, onError }) => {
        try {
            setUploading(true);
            
            if (customRequest) {
                await customRequest({ file, onSuccess, onError });
            } else {
                // Default behavior - just mark as success
                setTimeout(() => {
                    onSuccess({ url: URL.createObjectURL(file) }, file);
                }, 1000);
            }
            
            setFileUrl(URL.createObjectURL(file));
            if (onFileChange) {
                onFileChange(file);
            }
        } catch (error) {
            console.error('Upload error:', error);
            message.error('Tải file thất bại!');
            if (onError) onError(error);
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setFileUrl(null);
        if (onFileChange) {
            onFileChange(null);
        }
    };

    return (
        <Form.Item
            name={name}
            label={label}
            rules={validationRules}
            valuePropName="fileList"
            getValueFromEvent={(e) => {
                if (Array.isArray(e)) {
                    return e;
                }
                return e?.fileList;
            }}
            className="enhanced-form-item"
            {...formItemProps}
        >
            <div className="enhanced-upload-wrapper">
                <Upload
                    customRequest={handleUpload}
                    maxCount={maxCount}
                    accept={accept}
                    beforeUpload={beforeUpload}
                    showUploadList={showUploadList}
                    onRemove={handleRemove}
                    {...uploadProps}
                >
                    <Button 
                        icon={uploading ? <LoadingOutlined /> : fileUrl ? <CheckCircleOutlined /> : <UploadOutlined />} 
                        loading={uploading}
                        disabled={fileUrl && maxCount === 1}
                    >
                        {uploading ? 'Đang tải lên...' : fileUrl ? 'Đã tải lên' : buttonText}
                    </Button>
                </Upload>
                {helpText && (
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: '4px' }}>
                        {helpText}
                    </Text>
                )}
                {fileUrl && (
                    <div style={{ marginTop: 8 }}>
                        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="file-preview-link">
                            <CheckCircleOutlined style={{ color: 'inherit' }} />
                            Xem file đã tải lên
                        </a>
                    </div>
                )}
            </div>
        </Form.Item>
    );
};

export default FormUpload;
