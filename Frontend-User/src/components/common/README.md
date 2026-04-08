# 📝 Form Components - Usage Guide

Beautiful and consistent reusable form components with built-in validation, error handling, and enhanced UI.

## 🎨 Features

- ✅ **Consistent UI**: All components follow the same design system
- ✅ **Built-in Validation**: Automatic validation with clear error messages
- ✅ **Enhanced Styling**: Beautiful hover, focus, and active states
- ✅ **Responsive**: Works perfectly on all screen sizes
- ✅ **Accessible**: Keyboard navigation and screen reader support
- ✅ **TypeScript Ready**: Full type definitions (coming soon)

## 📦 Components

### FormInput

Text input component with validation and enhanced styling.

```jsx
import { FormInput } from '../../components/common';

<FormInput
  name="ten_npl"
  label="Tên NPL"
  placeholder="Nhập tên nguyên liệu..."
  required
  minLength={3}
  maxLength={100}
  helpText="Tên nguyên liệu phải từ 3-100 ký tự"
/>
```

**Props:**
- `name` (string, required): Form field name
- `label` (string): Field label
- `placeholder` (string): Input placeholder
- `required` (boolean): Whether field is required
- `type` (string): Input type (text, password, email, etc.)
- `minLength` (number): Minimum character length
- `maxLength` (number): Maximum character length
- `disabled` (boolean): Whether input is disabled
- `prefix` (ReactNode): Prefix icon or text
- `suffix` (ReactNode): Suffix icon or text
- `helpText` (string): Helper text below input
- `rules` (array): Additional validation rules

### FormSelect

Select dropdown component with search and validation.

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
  helpText="Chọn kho để nhập nguyên liệu"
/>
```

**Props:**
- `name` (string, required): Form field name
- `label` (string): Field label
- `placeholder` (string): Select placeholder
- `options` (array, required): Array of options
- `valueKey` (string): Key for option value (default: 'value')
- `labelKey` (string): Key for option label (default: 'label')
- `required` (boolean): Whether field is required
- `showSearch` (boolean): Enable search functionality
- `allowClear` (boolean): Show clear button
- `disabled` (boolean): Whether select is disabled
- `mode` (string): Select mode (multiple, tags)
- `onChange` (function): Custom onChange handler
- `helpText` (string): Helper text below select
- `rules` (array): Additional validation rules

### FormDatePicker

Date picker component with validation and formatting.

```jsx
import { FormDatePicker } from '../../components/common';

<FormDatePicker
  name="ngay_nhap"
  label="Ngày nhập"
  placeholder="Chọn ngày nhập..."
  required
  format="DD/MM/YYYY"
  helpText="Chọn ngày thực hiện nhập kho"
/>
```

**Props:**
- `name` (string, required): Form field name
- `label` (string): Field label
- `placeholder` (string): DatePicker placeholder
- `required` (boolean): Whether field is required
- `format` (string): Date format (default: 'DD/MM/YYYY')
- `showTime` (boolean): Show time picker
- `disabled` (boolean): Whether datepicker is disabled
- `disabledDate` (function): Function to disable specific dates
- `picker` (string): Picker type (date, week, month, quarter, year)
- `helpText` (string): Helper text below datepicker
- `rules` (array): Additional validation rules

### FormUpload

File upload component with progress and preview.

```jsx
import { FormUpload } from '../../components/common';

<FormUpload
  name="file_excel"
  label="File Excel"
  required
  accept=".xlsx,.xls"
  maxSize={5}
  buttonText="Tải lên file Excel"
  customRequest={handleUpload}
  helpText="Chỉ chấp nhận file Excel (.xlsx, .xls), tối đa 5MB"
/>
```

**Props:**
- `name` (string, required): Form field name
- `label` (string): Field label
- `required` (boolean): Whether field is required
- `customRequest` (function): Custom upload handler
- `maxCount` (number): Maximum number of files (default: 1)
- `accept` (string): Accepted file types
- `maxSize` (number): Maximum file size in MB (default: 10)
- `showUploadList` (boolean): Show upload list (default: true)
- `buttonText` (string): Upload button text
- `helpText` (string): Helper text below upload
- `onFileChange` (function): Callback when file changes
- `rules` (array): Additional validation rules

## 🎨 Enhanced Styling

All components come with enhanced styling that includes:

### Hover Effects
- Smooth border color transition
- Subtle shadow on hover
- Visual feedback for better UX

### Focus States
- Clear focus indicator with blue glow
- Slight upward movement for depth
- Accessible keyboard navigation

### Validation States
- Success: Green border and checkmark
- Error: Red border with shake animation
- Warning: Orange border for warnings

### Loading States
- Spinner animation during upload
- Disabled state with reduced opacity
- Clear visual feedback

## 📐 Layout Utilities

### Form Grid Layout

```jsx
<div className="form-grid-2">
  <FormInput name="field1" label="Field 1" />
  <FormInput name="field2" label="Field 2" />
</div>

<div className="form-grid-3">
  <FormInput name="field1" label="Field 1" />
  <FormInput name="field2" label="Field 2" />
  <FormInput name="field3" label="Field 3" />
</div>
```

### Form Section Divider

```jsx
<div className="form-section-divider" data-title="Thông tin cơ bản" />
```

### Form Actions

```jsx
<div className="form-actions">
  <Button onClick={handleCancel}>Hủy</Button>
  <Button type="primary" htmlType="submit">Lưu</Button>
</div>

<div className="form-actions-centered">
  <Button type="primary" htmlType="submit">Lưu</Button>
</div>
```

### Form Card Wrapper

```jsx
<div className="form-card-wrapper">
  <Form>
    {/* Form fields */}
  </Form>
</div>
```

### Form with Gradient Header

```jsx
<div className="form-with-gradient-header">
  <div className="form-gradient-header">
    <h3>Tạo mới phiếu nhập</h3>
  </div>
  <div className="form-gradient-body">
    <Form>
      {/* Form fields */}
    </Form>
  </div>
</div>
```

## 🎯 Best Practices

### 1. Use Consistent Labels
```jsx
// ✅ Good
<FormInput name="ten_npl" label="Tên NPL" />

// ❌ Bad
<FormInput name="ten_npl" label="ten npl" />
```

### 2. Provide Helpful Placeholders
```jsx
// ✅ Good
<FormInput 
  name="email" 
  label="Email" 
  placeholder="example@company.com"
/>

// ❌ Bad
<FormInput name="email" label="Email" placeholder="Email" />
```

### 3. Add Help Text for Complex Fields
```jsx
// ✅ Good
<FormInput 
  name="ma_so_thue" 
  label="Mã số thuế"
  helpText="Mã số thuế gồm 10-13 chữ số"
/>
```

### 4. Use Validation Rules
```jsx
// ✅ Good
<FormInput 
  name="phone" 
  label="Số điện thoại"
  required
  rules={[
    { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ' }
  ]}
/>
```

### 5. Group Related Fields
```jsx
// ✅ Good
<div className="form-grid-2">
  <FormInput name="first_name" label="Họ" />
  <FormInput name="last_name" label="Tên" />
</div>
```

## 🎨 Customization

### Custom Validation Rules

```jsx
<FormInput
  name="custom_field"
  label="Custom Field"
  rules={[
    {
      validator: async (_, value) => {
        if (value && value.length < 5) {
          return Promise.reject('Phải có ít nhất 5 ký tự');
        }
        return Promise.resolve();
      }
    }
  ]}
/>
```

### Custom Upload Handler

```jsx
const handleCustomUpload = async ({ file, onSuccess, onError }) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await uploadService.upload(formData);
    onSuccess(response);
  } catch (error) {
    onError(error);
  }
};

<FormUpload
  name="file"
  label="File"
  customRequest={handleCustomUpload}
/>
```

## 📱 Responsive Design

All components are fully responsive and adapt to different screen sizes:

- **Desktop**: Full width with optimal spacing
- **Tablet**: Adjusted grid layouts
- **Mobile**: Single column layout with touch-friendly inputs

## ♿ Accessibility

All components follow accessibility best practices:

- Proper ARIA labels
- Keyboard navigation support
- Screen reader friendly
- Focus indicators
- Error announcements

## 🎨 Theme Integration

Components automatically adapt to the application theme:

- Light mode: Clean white backgrounds
- Dark mode: Dark backgrounds with proper contrast
- Custom colors: Uses CSS variables for easy theming

## 📚 Examples

### Complete Form Example

```jsx
import React from 'react';
import { Form, Button } from 'antd';
import { FormInput, FormSelect, FormDatePicker, FormUpload } from '../../components/common';

const MyForm = () => {
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    console.log('Form values:', values);
  };

  return (
    <div className="form-card-wrapper">
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        <div className="form-section-divider" data-title="Thông tin cơ bản" />
        
        <div className="form-grid-2">
          <FormInput
            name="ten"
            label="Tên"
            required
            minLength={3}
            maxLength={100}
          />
          
          <FormSelect
            name="loai"
            label="Loại"
            required
            options={[
              { value: 'type1', label: 'Loại 1' },
              { value: 'type2', label: 'Loại 2' }
            ]}
            showSearch
          />
        </div>

        <div className="form-grid-2">
          <FormDatePicker
            name="ngay"
            label="Ngày"
            required
          />
          
          <FormUpload
            name="file"
            label="File đính kèm"
            accept=".pdf,.doc,.docx"
            maxSize={5}
          />
        </div>

        <div className="form-actions">
          <Button onClick={() => form.resetFields()}>Hủy</Button>
          <Button type="primary" htmlType="submit">Lưu</Button>
        </div>
      </Form>
    </div>
  );
};

export default MyForm;
```

## 🔧 Troubleshooting

### Issue: Styles not applying
**Solution**: Make sure FormComponents.css is imported in your component or globally in index.css

### Issue: Validation not working
**Solution**: Ensure the Form component wraps your form fields and has a form instance

### Issue: Upload not working
**Solution**: Provide a customRequest handler or use the default behavior

## 📝 Notes

- All components use Ant Design as the base
- CSS variables are used for theming
- Components are optimized for performance
- Fully compatible with React 18+

## 🚀 Future Enhancements

- [ ] TypeScript definitions
- [ ] More validation helpers
- [ ] Additional form components (Radio, Checkbox, Switch)
- [ ] Form wizard component
- [ ] Advanced file upload with drag & drop
- [ ] Rich text editor component

---

**Version**: 1.0.0  
**Last Updated**: December 30, 2025  
**Maintainer**: Frontend Team
