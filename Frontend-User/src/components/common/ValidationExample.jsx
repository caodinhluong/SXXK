import React, { useState } from 'react';
import { Form, Button, Card, Space, message, Divider } from 'antd';
import {
    FormInput,
    FormSelect,
    FormDatePicker,
    FormInputNumber,
    FormTextArea,
    FormError,
    FormLoading
} from './index';
import {
    required,
    minLength,
    maxLength,
    email,
    phone,
    positiveNumber,
    taxCode
} from '../../utils/validationRules';
import {
    validateDateAfter,
    validateUnique,
    validateStockAvailability,
    formatValidationErrors,
    scrollToFirstError
} from '../../utils/validationHelpers';

/**
 * Validation Example Component
 * Demonstrates all validation features and patterns
 */
const ValidationExample = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState([]);

    // Mock data
    const existingCodes = ['HD001', 'HD002', 'HD003'];
    const availableStock = 1000;
    const typeOptions = [
        { value: 'type1', label: 'Loại 1' },
        { value: 'type2', label: 'Loại 2' },
        { value: 'type3', label: 'Loại 3' }
    ];

    const handleSubmit = async (values) => {
        setLoading(true);
        setErrors([]);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            message.success('Validation thành công! Dữ liệu hợp lệ.');
            console.log('Form values:', values);
            
            // Reset form after success
            form.resetFields();
        } catch (error) {
            const errorMessages = formatValidationErrors(error);
            setErrors(errorMessages);
            scrollToFirstError(form);
        } finally {
            setLoading(false);
        }
    };

    const handleValidationFailed = ({ errorFields }) => {
        const errorMessages = errorFields.map(field => 
            `${field.name.join('.')}: ${field.errors.join(', ')}`
        );
        setErrors(errorMessages);
        message.error('Vui lòng kiểm tra lại thông tin!');
        scrollToFirstError(form);
    };

    return (
        <Card title="Validation Example - Tất cả các loại validation">
            <FormError
                errors={errors}
                title="Có lỗi xảy ra"
                closable
                onClose={() => setErrors([])}
            />

            <FormLoading loading={loading} message="Đang xử lý...">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    onFinishFailed={handleValidationFailed}
                >
                    <Divider orientation="left">1. Basic Validation</Divider>

                    {/* Required field */}
                    <FormInput
                        name="name"
                        label="Tên (Required)"
                        required
                        placeholder="Nhập tên..."
                        helpText="Trường bắt buộc"
                    />

                    {/* Min/Max length */}
                    <FormInput
                        name="code"
                        label="Mã (Min 3, Max 20 chars)"
                        required
                        minLength={3}
                        maxLength={20}
                        placeholder="Nhập mã..."
                        helpText="Mã phải từ 3-20 ký tự"
                    />

                    <Divider orientation="left">2. Format Validation</Divider>

                    {/* Email */}
                    <FormInput
                        name="email"
                        label="Email"
                        type="email"
                        rules={[required(), email()]}
                        placeholder="example@email.com"
                        helpText="Email hợp lệ"
                    />

                    {/* Phone */}
                    <FormInput
                        name="phone"
                        label="Số điện thoại"
                        rules={[required(), phone()]}
                        placeholder="0912345678"
                        helpText="Số điện thoại Việt Nam (10-11 số)"
                    />

                    {/* Tax code */}
                    <FormInput
                        name="tax_code"
                        label="Mã số thuế"
                        rules={[taxCode()]}
                        placeholder="0123456789"
                        helpText="Mã số thuế (10-13 số)"
                    />

                    <Divider orientation="left">3. Number Validation</Divider>

                    {/* Positive number */}
                    <FormInputNumber
                        name="price"
                        label="Giá (> 0)"
                        required
                        min={0.01}
                        precision={2}
                        suffix="VNĐ"
                        helpText="Giá phải lớn hơn 0"
                    />

                    {/* Number range */}
                    <FormInputNumber
                        name="quantity"
                        label="Số lượng (1-1000)"
                        required
                        min={1}
                        max={1000}
                        helpText="Số lượng từ 1 đến 1000"
                    />

                    {/* Stock validation */}
                    <FormInputNumber
                        name="quantity_out"
                        label={`Số lượng xuất (Tồn kho: ${availableStock})`}
                        required
                        min={0.01}
                        rules={[
                            {
                                validator: (_, value) => {
                                    if (!value) return Promise.resolve();
                                    return validateStockAvailability(
                                        value,
                                        availableStock,
                                        'sản phẩm này'
                                    );
                                }
                            }
                        ]}
                        helpText="Số lượng không được vượt quá tồn kho"
                    />

                    <Divider orientation="left">4. Select Validation</Divider>

                    {/* Select with search */}
                    <FormSelect
                        name="type"
                        label="Loại"
                        options={typeOptions}
                        required
                        showSearch
                        allowClear
                        helpText="Chọn loại từ danh sách"
                    />

                    <Divider orientation="left">5. Date Validation</Divider>

                    {/* Date required */}
                    <FormDatePicker
                        name="start_date"
                        label="Ngày bắt đầu"
                        required
                        format="DD/MM/YYYY"
                        helpText="Chọn ngày bắt đầu"
                    />

                    {/* Date after another date */}
                    <FormDatePicker
                        name="end_date"
                        label="Ngày kết thúc"
                        required
                        format="DD/MM/YYYY"
                        rules={[
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value) return Promise.resolve();
                                    const startDate = getFieldValue('start_date');
                                    return validateDateAfter(
                                        value,
                                        startDate,
                                        'Ngày kết thúc phải sau ngày bắt đầu'
                                    );
                                }
                            })
                        ]}
                        helpText="Ngày kết thúc phải sau ngày bắt đầu"
                    />

                    <Divider orientation="left">6. Unique Validation</Divider>

                    {/* Unique value */}
                    <FormInput
                        name="invoice_code"
                        label={`Mã hóa đơn (Đã tồn tại: ${existingCodes.join(', ')})`}
                        required
                        rules={[
                            {
                                validator: (_, value) => {
                                    if (!value) return Promise.resolve();
                                    return validateUnique(
                                        value,
                                        existingCodes,
                                        'Mã hóa đơn'
                                    );
                                }
                            }
                        ]}
                        placeholder="Nhập mã hóa đơn mới..."
                        helpText="Mã hóa đơn phải là duy nhất"
                    />

                    <Divider orientation="left">7. Text Area</Divider>

                    {/* Text area with max length */}
                    <FormTextArea
                        name="notes"
                        label="Ghi chú"
                        rows={4}
                        maxLength={500}
                        showCount
                        placeholder="Nhập ghi chú..."
                        helpText="Ghi chú tối đa 500 ký tự"
                    />

                    <Divider />

                    <Form.Item>
                        <Space>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                size="large"
                            >
                                Kiểm tra Validation
                            </Button>
                            <Button
                                onClick={() => {
                                    form.resetFields();
                                    setErrors([]);
                                }}
                                size="large"
                            >
                                Reset Form
                            </Button>
                            <Button
                                type="dashed"
                                onClick={() => {
                                    // Fill with valid data
                                    form.setFieldsValue({
                                        name: 'Nguyễn Văn A',
                                        code: 'ABC123',
                                        email: 'test@example.com',
                                        phone: '0912345678',
                                        tax_code: '0123456789',
                                        price: 100000,
                                        quantity: 50,
                                        quantity_out: 100,
                                        type: 'type1',
                                        start_date: new Date(),
                                        end_date: new Date(Date.now() + 86400000),
                                        invoice_code: 'HD999',
                                        notes: 'Đây là ghi chú mẫu'
                                    });
                                }}
                                size="large"
                            >
                                Fill Valid Data
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </FormLoading>

            <Card
                type="inner"
                title="Validation Features Demonstrated"
                style={{ marginTop: 24 }}
            >
                <ul>
                    <li>✅ Required field validation</li>
                    <li>✅ Min/Max length validation</li>
                    <li>✅ Email format validation</li>
                    <li>✅ Phone number validation (Vietnamese)</li>
                    <li>✅ Tax code validation (Vietnamese)</li>
                    <li>✅ Positive number validation</li>
                    <li>✅ Number range validation</li>
                    <li>✅ Stock availability validation</li>
                    <li>✅ Select with search validation</li>
                    <li>✅ Date required validation</li>
                    <li>✅ Date comparison validation (after/before)</li>
                    <li>✅ Unique value validation</li>
                    <li>✅ Text area with character count</li>
                    <li>✅ Form-level error display</li>
                    <li>✅ Loading states</li>
                    <li>✅ Scroll to first error</li>
                    <li>✅ Vietnamese error messages</li>
                </ul>
            </Card>
        </Card>
    );
};

export default ValidationExample;
