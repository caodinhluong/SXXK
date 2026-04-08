# Form Components Usage Guide

This guide demonstrates how to use the reusable form components in the Frontend-User application.

## Available Components

### 1. FormInput
Basic text input with built-in validation.

```jsx
import { FormInput } from '../../components/common';

<FormInput
    name="ten_npl"
    label="Tên nguyên phụ liệu"
    placeholder="Nhập tên..."
    required
    minLength={3}
    maxLength={100}
    helpText="Tên phải từ 3-100 ký tự"
/>
```

### 2. FormSelect
Select dropdown with search and validation.

```jsx
import { FormSelect } from '../../components/common';

<FormSelect
    name="id_kho"
    label="Kho"
    placeholder="Chọn kho..."
    options={khoList}
    valueKey="id_kho"
    labelKey="ten_kho"
    required
    showSearch
    allowClear
    helpText="Chọn kho nhận hàng"
/>
```

### 3. FormDatePicker
Date picker with validation.

```jsx
import { FormDatePicker } from '../../components/common';

<FormDatePicker
    name="ngay_nhap"
    label="Ngày nhập kho"
    placeholder="Chọn ngày..."
    required
    format="DD/MM/YYYY"
    helpText="Chọn ngày nhập kho"
/>
```

### 4. FormUpload
File upload with progress and validation.

```jsx
import { FormUpload } from '../../components/common';

<FormUpload
    name="file_phieu"
    label="File phiếu nhập"
    customRequest={handleUpload}
    maxCount={1}
    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
    maxSize={10}
    buttonText="Tải lên file"
    helpText="Chấp nhận PDF, DOC, DOCX, JPG, PNG (tối đa 10MB)"
/>
```

### 5. FormInputNumber
Number input with formatting and validation.

```jsx
import { FormInputNumber } from '../../components/common';

<FormInputNumber
    name="so_luong"
    label="Số lượng"
    placeholder="Nhập số lượng..."
    required
    min={0.01}
    max={1000000}
    precision={2}
    suffix="kg"
    helpText="Nhập số lượng cần nhập kho"
/>
```

### 6. FormTextArea
Multi-line text input with character count.

```jsx
import { FormTextArea } from '../../components/common';

<FormTextArea
    name="ghi_chu"
    label="Ghi chú"
    placeholder="Nhập ghi chú..."
    rows={4}
    maxLength={500}
    showCount
    helpText="Ghi chú thêm về phiếu nhập (tối đa 500 ký tự)"
/>
```

## Validation Helpers

Use the validation rules from `utils/validationRules.js`:

```jsx
import { required, minLength, email, phone, positiveNumber } from '../../utils/validationRules';

<FormInput
    name="email"
    label="Email"
    rules={[required(), email()]}
/>

<FormInput
    name="phone"
    label="Số điện thoại"
    rules={[required(), phone()]}
/>

<FormInputNumber
    name="gia"
    label="Giá"
    rules={[required(), positiveNumber()]}
/>
```

## Error Display

### FormError Component
Display form-level errors:

```jsx
import { FormError } from '../../components/common';

<FormError
    errors={["Số hóa đơn đã tồn tại", "Ngày không hợp lệ"]}
    title="Vui lòng kiểm tra lại thông tin"
    closable
    onClose={() => setErrors([])}
/>
```

### InlineError Component
Display inline field errors:

```jsx
import { InlineError } from '../../components/common';

<InlineError
    message="Số lượng vượt quá giới hạn"
    show={quantity > maxQuantity}
/>
```

### FieldError Component
Display field-level validation errors:

```jsx
import { FieldError } from '../../components/common';

<FieldError
    message="Số lượng phải lớn hơn 0"
    show={quantity <= 0}
/>
```

## Loading States

### FormLoading Component
Display loading state:

```jsx
import { FormLoading } from '../../components/common';

<FormLoading
    loading={isLoading}
    message="Đang tải dữ liệu..."
    size="large"
>
    {/* Your form content */}
</FormLoading>
```

### ButtonLoading
Dynamic button text based on loading state:

```jsx
import { ButtonLoading } from '../../components/common';

<Button type="primary" htmlType="submit" loading={submitting}>
    <ButtonLoading
        loading={submitting}
        loadingText="Đang lưu..."
        defaultText="Lưu phiếu"
    />
</Button>
```

### InlineLoading
Inline loading indicator:

```jsx
import { InlineLoading } from '../../components/common';

<div>
    Đang xử lý
    <InlineLoading loading={processing} message="Vui lòng đợi..." />
</div>
```

## Complete Example

Here's a complete form example using all components:

```jsx
import React, { useState } from 'react';
import { Form, Button, Card, Space } from 'antd';
import {
    FormInput,
    FormSelect,
    FormDatePicker,
    FormUpload,
    FormInputNumber,
    FormTextArea,
    FormError,
    FormLoading
} from '../../components/common';
import { required, minLength, positiveNumber } from '../../utils/validationRules';

const MyForm = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState([]);

    const handleSubmit = async (values) => {
        setLoading(true);
        setErrors([]);
        
        try {
            // Your API call here
            await createRecord(values);
            message.success('Tạo thành công!');
            form.resetFields();
        } catch (error) {
            setErrors([error.message]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="Tạo phiếu nhập">
            <FormError errors={errors} closable onClose={() => setErrors([])} />
            
            <FormLoading loading={loading} message="Đang tải...">
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <FormInput
                        name="so_phieu"
                        label="Số phiếu"
                        required
                        minLength={3}
                        maxLength={50}
                    />

                    <FormSelect
                        name="id_kho"
                        label="Kho"
                        options={khoList}
                        valueKey="id_kho"
                        labelKey="ten_kho"
                        required
                        showSearch
                    />

                    <FormDatePicker
                        name="ngay_nhap"
                        label="Ngày nhập"
                        required
                    />

                    <FormInputNumber
                        name="so_luong"
                        label="Số lượng"
                        required
                        min={0.01}
                        suffix="kg"
                    />

                    <FormTextArea
                        name="ghi_chu"
                        label="Ghi chú"
                        maxLength={500}
                        showCount
                    />

                    <FormUpload
                        name="file_phieu"
                        label="File đính kèm"
                        customRequest={handleUpload}
                    />

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                Lưu
                            </Button>
                            <Button onClick={() => form.resetFields()}>
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </FormLoading>
        </Card>
    );
};

export default MyForm;
```

## Benefits

1. **Consistent UI**: All forms look and behave the same way
2. **Built-in Validation**: Common validation rules included
3. **Better Error Display**: Clear, user-friendly error messages
4. **Loading States**: Consistent loading indicators
5. **Less Code**: Reduce boilerplate in form components
6. **Easy Maintenance**: Update validation rules in one place
7. **Type Safety**: Props are well-documented
8. **Accessibility**: ARIA labels and keyboard navigation included

## Migration Guide

To migrate existing forms to use these components:

1. Import the components:
```jsx
import { FormInput, FormSelect, FormDatePicker } from '../../components/common';
```

2. Replace Ant Design Form.Item + Input with FormInput:
```jsx
// Before
<Form.Item name="name" label="Name" rules={[{ required: true }]}>
    <Input placeholder="Enter name" />
</Form.Item>

// After
<FormInput name="name" label="Name" required />
```

3. Replace Select with FormSelect:
```jsx
// Before
<Form.Item name="id" label="Select" rules={[{ required: true }]}>
    <Select>
        {options.map(opt => <Option key={opt.id} value={opt.id}>{opt.name}</Option>)}
    </Select>
</Form.Item>

// After
<FormSelect name="id" label="Select" options={options} required />
```

4. Use validation helpers:
```jsx
import { required, email, phone } from '../../utils/validationRules';

<FormInput name="email" label="Email" rules={[required(), email()]} />
```
