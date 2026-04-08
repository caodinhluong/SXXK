import React from 'react';
import { Form, Button, Card, Space, Typography } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import FormDatePicker from './FormDatePicker';
import FormUpload from './FormUpload';
import './FormComponents.css';

const { Title, Paragraph } = Typography;

/**
 * Demo page to showcase all enhanced form components
 * This is for demonstration purposes only
 */
const FormComponentsDemo = () => {
    const [form] = Form.useForm();

    const handleSubmit = (values) => {
        console.log('Form values:', values);
    };

    const sampleOptions = [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' },
    ];

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <Title level={2} className="gradient-text">
                📝 Enhanced Form Components Demo
            </Title>
            <Paragraph>
                This page demonstrates all the enhanced form components with beautiful and consistent UI.
            </Paragraph>

            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                {/* Basic Form Card */}
                <Card title="Basic Form with Enhanced Components" className="content-card">
                    <div className="form-card-wrapper">
                        <Form form={form} onFinish={handleSubmit} layout="vertical">
                            <div className="form-section-divider" data-title="Personal Information" />
                            
                            <div className="form-grid-2">
                                <FormInput
                                    name="fullname"
                                    label="Full Name"
                                    placeholder="Enter your full name..."
                                    required
                                    minLength={3}
                                    maxLength={100}
                                    prefix={<UserOutlined />}
                                    helpText="Your full name as it appears on official documents"
                                />
                                
                                <FormInput
                                    name="email"
                                    label="Email Address"
                                    type="email"
                                    placeholder="example@company.com"
                                    required
                                    prefix={<MailOutlined />}
                                    helpText="We'll never share your email"
                                />
                            </div>

                            <div className="form-grid-2">
                                <FormInput
                                    name="phone"
                                    label="Phone Number"
                                    placeholder="0123456789"
                                    required
                                    prefix={<PhoneOutlined />}
                                    rules={[
                                        { pattern: /^[0-9]{10,11}$/, message: 'Invalid phone number' }
                                    ]}
                                />
                                
                                <FormSelect
                                    name="country"
                                    label="Country"
                                    placeholder="Select your country..."
                                    options={sampleOptions}
                                    required
                                    showSearch
                                    allowClear
                                    helpText="Select your country of residence"
                                />
                            </div>

                            <div className="form-section-divider" data-title="Additional Information" />

                            <div className="form-grid-3">
                                <FormDatePicker
                                    name="birthdate"
                                    label="Date of Birth"
                                    placeholder="Select date..."
                                    required
                                    helpText="Your date of birth"
                                />
                                
                                <FormSelect
                                    name="gender"
                                    label="Gender"
                                    options={[
                                        { value: 'male', label: 'Male' },
                                        { value: 'female', label: 'Female' },
                                        { value: 'other', label: 'Other' }
                                    ]}
                                    required
                                />
                                
                                <FormSelect
                                    name="status"
                                    label="Status"
                                    options={[
                                        { value: 'active', label: 'Active' },
                                        { value: 'inactive', label: 'Inactive' }
                                    ]}
                                    required
                                />
                            </div>

                            <FormUpload
                                name="document"
                                label="Upload Document"
                                accept=".pdf,.doc,.docx"
                                maxSize={5}
                                buttonText="Choose File"
                                helpText="Accepted formats: PDF, DOC, DOCX (Max 5MB)"
                            />

                            <div className="form-actions">
                                <Button onClick={() => form.resetFields()}>
                                    Reset
                                </Button>
                                <Button type="primary" htmlType="submit">
                                    Submit
                                </Button>
                            </div>
                        </Form>
                    </div>
                </Card>

                {/* Form with Gradient Header */}
                <Card className="content-card">
                    <div className="form-with-gradient-header">
                        <div className="form-gradient-header">
                            <h3>Form with Gradient Header</h3>
                        </div>
                        <div className="form-gradient-body">
                            <Form layout="vertical">
                                <FormInput
                                    name="title"
                                    label="Title"
                                    placeholder="Enter title..."
                                    required
                                />
                                
                                <FormInput
                                    name="description"
                                    label="Description"
                                    placeholder="Enter description..."
                                    maxLength={200}
                                />

                                <div className="form-actions-centered">
                                    <Button type="primary" htmlType="submit">
                                        Save
                                    </Button>
                                </div>
                            </Form>
                        </div>
                    </div>
                </Card>

                {/* Features List */}
                <Card title="✨ Enhanced Features" className="content-card">
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <div>
                            <Title level={5}>🎨 Visual Enhancements</Title>
                            <ul>
                                <li>Smooth hover effects with shadows</li>
                                <li>Beautiful focus states with blue glow</li>
                                <li>Animated error messages with shake effect</li>
                                <li>Gradient backgrounds and borders</li>
                                <li>Professional color scheme</li>
                            </ul>
                        </div>

                        <div>
                            <Title level={5}>✅ Validation Features</Title>
                            <ul>
                                <li>Clear error messages</li>
                                <li>Success indicators</li>
                                <li>Real-time validation</li>
                                <li>Custom validation rules</li>
                                <li>Help text for guidance</li>
                            </ul>
                        </div>

                        <div>
                            <Title level={5}>📱 Responsive Design</Title>
                            <ul>
                                <li>Mobile-friendly layouts</li>
                                <li>Touch-optimized inputs</li>
                                <li>Adaptive grid systems</li>
                                <li>Flexible spacing</li>
                            </ul>
                        </div>

                        <div>
                            <Title level={5}>♿ Accessibility</Title>
                            <ul>
                                <li>Keyboard navigation support</li>
                                <li>Screen reader friendly</li>
                                <li>ARIA labels</li>
                                <li>Focus indicators</li>
                                <li>Color contrast compliance</li>
                            </ul>
                        </div>
                    </Space>
                </Card>
            </Space>
        </div>
    );
};

export default FormComponentsDemo;
