import React, { useState } from 'react';
import { Form, Button, Card, Space, message, Row, Col } from 'antd';
import {
    FormInput,
    FormSelect,
    FormDatePicker,
    FormUpload,
    FormInputNumber,
    FormTextArea,
    FormError,
    FormLoading
} from './index';
import { required, minLength, email, phone, positiveNumber } from '../../utils/validationRules';

/**
 * Example component demonstrating the usage of reusable form components
 * This is for reference only - not used in production
 */
const FormExample = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState([]);

    // Mock data for select
    const khoList = [
        { id_kho: 1, ten_kho: 'Kho A' },
        { id_kho: 2, ten_kho: 'Kho B' },
        { id_kho: 3, ten_kho: 'Kho C' }
    ];

    const loaiHangOptions = [
        { value: 'NguyenLieu', label: 'Nguyên liệu' },
        { value: 'SanPham', label: 'Sản phẩm' },
        { value: 'BanThanhPham', label: 'Bán thành phẩm' }
    ];

    const handleUpload = async ({ file, onSuccess, onError }) => {
        try {
            // Simulate upload
            setTimeout(() => {
                message.success(`${file.name} uploaded successfully`);
                onSuccess({ url: URL.createObjectURL(file) }, file);
            }, 1000);
        } catch (error) {
            message.error('Upload failed');
            onError(error);
        }
    };

    const handleSubmit = async (values) => {
        console.log('Form values:', values);
        setLoading(true);
        setErrors([]);
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            message.success('Form submitted successfully!');
            form.resetFields();
        } catch (error) {
            setErrors(['An error occurred while submitting the form']);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="Form Components Example" style={{ maxWidth: 1200, margin: '20px auto' }}>
            <FormError 
                errors={errors} 
                closable 
                onClose={() => setErrors([])} 
            />
            
            <FormLoading loading={loading} message="Processing...">
                <Form 
                    form={form} 
                    layout="vertical" 
                    onFinish={handleSubmit}
                    initialValues={{
                        so_luong: 1
                    }}
                >
                    <Row gutter={24}>
                        <Col span={12}>
                            <FormInput
                                name="so_phieu"
                                label="Số phiếu"
                                placeholder="Nhập số phiếu..."
                                required
                                minLength={3}
                                maxLength={50}
                                helpText="Số phiếu phải từ 3-50 ký tự"
                            />
                        </Col>

                        <Col span={12}>
                            <FormInput
                                name="email"
                                label="Email"
                                type="email"
                                rules={[required(), email()]}
                                helpText="Nhập email hợp lệ"
                            />
                        </Col>

                        <Col span={12}>
                            <FormInput
                                name="phone"
                                label="Số điện thoại"
                                rules={[required(), phone()]}
                                helpText="Nhập số điện thoại 10-11 số"
                            />
                        </Col>

                        <Col span={12}>
                            <FormSelect
                                name="id_kho"
                                label="Kho"
                                options={khoList}
                                valueKey="id_kho"
                                labelKey="ten_kho"
                                required
                                showSearch
                                allowClear
                                helpText="Chọn kho nhận hàng"
                            />
                        </Col>

                        <Col span={12}>
                            <FormSelect
                                name="loai_hang"
                                label="Loại hàng"
                                options={loaiHangOptions}
                                required
                                helpText="Chọn loại hàng"
                            />
                        </Col>

                        <Col span={12}>
                            <FormDatePicker
                                name="ngay_nhap"
                                label="Ngày nhập"
                                required
                                format="DD/MM/YYYY"
                                helpText="Chọn ngày nhập kho"
                            />
                        </Col>

                        <Col span={12}>
                            <FormInputNumber
                                name="so_luong"
                                label="Số lượng"
                                required
                                min={0.01}
                                max={1000000}
                                precision={2}
                                suffix="kg"
                                helpText="Nhập số lượng (kg)"
                            />
                        </Col>

                        <Col span={12}>
                            <FormInputNumber
                                name="don_gia"
                                label="Đơn giá"
                                rules={[required(), positiveNumber()]}
                                min={0.01}
                                precision={2}
                                suffix="VND"
                                helpText="Nhập đơn giá"
                            />
                        </Col>

                        <Col span={24}>
                            <FormTextArea
                                name="ghi_chu"
                                label="Ghi chú"
                                rows={4}
                                maxLength={500}
                                showCount
                                helpText="Ghi chú thêm (tối đa 500 ký tự)"
                            />
                        </Col>

                        <Col span={24}>
                            <FormUpload
                                name="file_phieu"
                                label="File đính kèm"
                                customRequest={handleUpload}
                                maxCount={1}
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                maxSize={10}
                                buttonText="Tải lên file"
                                helpText="Chấp nhận PDF, DOC, DOCX, JPG, PNG (tối đa 10MB)"
                            />
                        </Col>
                    </Row>

                    <Form.Item style={{ marginTop: 24 }}>
                        <Space>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Submit Form
                            </Button>
                            <Button onClick={() => form.resetFields()}>
                                Reset
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </FormLoading>
        </Card>
    );
};

export default FormExample;
