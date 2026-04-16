import { useState } from 'react';
import { Form, Input, Button, Checkbox, Typography } from 'antd';
import { UserOutlined, LockOutlined, ShopOutlined, ArrowRightOutlined, BarChartOutlined, ContainerOutlined, AuditOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginBusiness } from '../../services/auth.service';
import { showSuccess, showError } from '../../components/notification';

const { Title, Text } = Typography;

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    
    // Get the return URL from location state (set by ProtectedRoute)
    const from = location.state?.from?.pathname || '/';

    const onFinish = async (values) => {
        try {
            setLoading(true);
            await loginBusiness({
                ma_so_thue: values.ma_so_thue,
                mat_khau: values.mat_khau,
            });

            const token = localStorage.getItem('accessToken');
            if (!token) {
                throw new Error('Không lưu được token');
            }
            
            showSuccess('Đăng nhập thành công', 'Chào mừng bạn trở lại');
            setTimeout(() => navigate(from, { replace: true }), 500);
        } catch (error) {
            console.error('Login error:', error);
            const errorMessage = error?.response?.data?.message || error?.message || 'Mã số thuế hoặc mật khẩu không đúng';
            showError('Đăng nhập thất bại', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const features = [
        { icon: <ContainerOutlined />, title: 'Quản lý Kho & Tồn kho', desc: 'Theo dõi nhập xuất NPL, SP và tồn kho' },
        { icon: <AuditOutlined />, title: 'Tờ khai Hải quan', desc: 'Quản lý tờ khai nhập khẩu, xuất khẩu' },
        { icon: <BarChartOutlined />, title: 'Thanh khoản & Định mức', desc: 'Báo cáo thanh khoản hợp đồng gia công' },
    ];

    return (
        <div className="login-wrapper" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', overflow: 'hidden' }}>
            {/* Left Side */}
            <div
                className="left-panel"
                style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #0ea5e9 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '40px 80px',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <div className="bg-shapes">
                    <div className="shape shape-1" />
                    <div className="shape shape-2" />
                    <div className="shape shape-3" />
                </div>

                <div className="particles">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className={`particle particle-${i + 1}`} />
                    ))}
                </div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ marginBottom: '32px' }}>
                        <div
                            className="logo-icon"
                            style={{
                                width: '80px',
                                height: '80px',
                                background: 'rgba(255, 255, 255, 0.25)',
                                borderRadius: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '24px',
                                backdropFilter: 'blur(15px)',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                                border: '2px solid rgba(255, 255, 255, 0.3)',
                            }}
                        >
                            <ShopOutlined style={{ fontSize: '40px', color: 'white' }} />
                        </div>
                        <Title level={2} style={{ color: 'white', margin: 0, fontSize: '42px', fontWeight: 800, letterSpacing: '-0.5px' }}>
                            Doanh Nghiệp
                        </Title>
                        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '17px', fontWeight: 400 }}>
                            Hệ thống Thanh khoản hợp đồng Sản xuất xuất khẩu
                        </Text>
                    </div>

                    <div>
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="feature-item"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    marginBottom: '16px',
                                    padding: '14px 18px',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    borderRadius: '12px',
                                    backdropFilter: 'blur(10px)',
                                }}
                            >
                                <div
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        background: 'rgba(255, 255, 255, 0.2)',
                                        borderRadius: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '20px',
                                        color: 'white',
                                        flexShrink: 0,
                                    }}
                                >
                                    {feature.icon}
                                </div>
                                <div>
                                    <Text strong style={{ color: 'white', fontSize: '14px', display: 'block' }}>
                                        {feature.title}
                                    </Text>
                                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
                                        {feature.desc}
                                    </Text>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side */}
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '40px 80px',
                    background: '#fff',
                }}
            >
                <div className="login-form-container" style={{ width: '100%', maxWidth: '480px' }}>
                    <div style={{ marginBottom: '36px' }}>
                        <Title level={2} style={{ margin: '0 0 8px 0', color: '#0f172a', fontWeight: 800, fontSize: '36px', letterSpacing: '-0.5px' }}>
                            Đăng nhập
                        </Title>
                        <Text style={{ color: '#64748b', fontSize: '16px', fontWeight: 400 }}>
                            Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục.
                        </Text>
                    </div>

                    <Form form={form} name="login" onFinish={onFinish} layout="vertical" requiredMark={false} initialValues={{ remember: true }}>
                        <Form.Item
                            name="ma_so_thue"
                            label={<span style={{ fontWeight: 600, color: '#1e293b', fontSize: '15px' }}>Mã số thuế</span>}
                            rules={[{ required: true, message: 'Vui lòng nhập mã số thuế!' }]}
                            style={{ marginBottom: '20px' }}
                        >
                            <Input
                                prefix={<UserOutlined style={{ color: '#94a3b8', fontSize: '18px' }} />}
                                placeholder="Nhập mã số thuế"
                                className="login-input"
                                style={{ height: '52px', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '15px' }}
                            />
                        </Form.Item>

                        <Form.Item
                            name="mat_khau"
                            label={<span style={{ fontWeight: 600, color: '#1e293b', fontSize: '15px' }}>Mật khẩu</span>}
                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                            style={{ marginBottom: '20px' }}
                        >
                            <Input.Password
                                prefix={<LockOutlined style={{ color: '#94a3b8', fontSize: '18px' }} />}
                                placeholder="Nhập mật khẩu"
                                className="login-input"
                                style={{ height: '52px', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '15px' }}
                            />
                        </Form.Item>

                        <Form.Item style={{ marginBottom: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Form.Item name="remember" valuePropName="checked" noStyle>
                                    <Checkbox style={{ color: '#64748b', fontSize: '15px', fontWeight: 500 }}>Ghi nhớ đăng nhập</Checkbox>
                                </Form.Item>
                                <a href="#" style={{ color: '#2563eb', fontWeight: 600, fontSize: '15px' }} onClick={(e) => e.preventDefault()}>
                                    Quên mật khẩu?
                                </a>
                            </div>
                        </Form.Item>

                        <Form.Item style={{ marginBottom: '20px' }}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                block
                                className="login-btn"
                                style={{
                                    height: '56px',
                                    borderRadius: '12px',
                                    fontSize: '17px',
                                    fontWeight: 700,
                                    background: 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)',
                                    border: 'none',
                                    boxShadow: '0 10px 30px rgba(37, 99, 235, 0.35)',
                                    letterSpacing: '0.3px',
                                }}
                            >
                                {loading ? 'Đang đăng nhập...' : (
                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                        Đăng nhập <ArrowRightOutlined style={{ fontSize: '18px' }} />
                                    </span>
                                )}
                            </Button>
                        </Form.Item>

                        <div style={{ textAlign: 'center' }}>
                            <Text style={{ color: '#64748b', fontSize: '15px', fontWeight: 500 }}>
                                Chưa có tài khoản?{' '}
                                <Link to="/auth/register" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }} className="register-link">
                                    Đăng ký ngay!
                                </Link>
                            </Text>
                        </div>
                    </Form>

                    <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                        <Text style={{ color: '#94a3b8', fontSize: '12px' }}>© 2025 SXXK System</Text>
                    </div>
                </div>
            </div>

            <style>{`
                html, body, #root { margin: 0; padding: 0; height: 100%; width: 100%; overflow: hidden; }
                .login-wrapper { position: fixed; top: 0; left: 0; right: 0; bottom: 0; }
                .bg-shapes { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
                .shape { position: absolute; border-radius: 50%; background: rgba(255, 255, 255, 0.1); filter: blur(40px); }
                .shape-1 { width: 500px; height: 500px; top: -150px; left: -150px; animation: float 10s ease-in-out infinite; }
                .shape-2 { width: 400px; height: 400px; bottom: -100px; right: -100px; animation: float 12s ease-in-out infinite reverse; }
                .shape-3 { width: 300px; height: 300px; top: 40%; left: 50%; animation: float 15s ease-in-out infinite; }
                @keyframes float { 0%, 100% { transform: translate(0, 0) rotate(0deg); } 33% { transform: translate(30px, -30px) rotate(120deg); } 66% { transform: translate(-20px, 20px) rotate(240deg); } }
                .particles { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
                .particle { position: absolute; width: 6px; height: 6px; background: rgba(255, 255, 255, 0.5); border-radius: 50%; animation: rise 20s infinite; box-shadow: 0 0 10px rgba(255, 255, 255, 0.3); }
                .particle-1 { left: 10%; animation-delay: 0s; } .particle-2 { left: 20%; animation-delay: 2s; }
                .particle-3 { left: 30%; animation-delay: 4s; } .particle-4 { left: 40%; animation-delay: 6s; }
                .particle-5 { left: 50%; animation-delay: 8s; } .particle-6 { left: 60%; animation-delay: 10s; }
                .particle-7 { left: 70%; animation-delay: 12s; } .particle-8 { left: 80%; animation-delay: 14s; }
                .particle-9 { left: 90%; animation-delay: 16s; } .particle-10 { left: 95%; animation-delay: 1s; }
                @keyframes rise { 0% { transform: translateY(100vh) scale(0); opacity: 0; } 10% { opacity: 1; transform: scale(1); } 90% { opacity: 0.6; } 100% { transform: translateY(-100px) scale(0.5); opacity: 0; } }
                .logo-icon { animation: pulse 4s ease-in-out infinite; transition: all 0.3s ease; }
                .logo-icon:hover { transform: scale(1.1) rotate(5deg); }
                @keyframes pulse { 0%, 100% { transform: scale(1); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); } 50% { transform: scale(1.08); box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15); } }
                .feature-item { animation: slideIn 0.6s ease-out backwards; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; }
                .feature-item:hover { transform: translateX(12px) scale(1.02); background: rgba(255, 255, 255, 0.15) !important; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1); }
                .feature-item:nth-child(1) { animation-delay: 0.2s; }
                .feature-item:nth-child(2) { animation-delay: 0.4s; }
                .feature-item:nth-child(3) { animation-delay: 0.6s; }
                @keyframes slideIn { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: translateX(0); } }
                .login-form-container { animation: fadeIn 0.7s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
                .login-input { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important; }
                .login-input:focus { border-color: #2563eb !important; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12) !important; transform: translateY(-2px); }
                .login-input:hover { border-color: #60a5fa !important; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.08) !important; }
                .login-btn { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important; position: relative; overflow: hidden; }
                .login-btn::before { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent); transition: left 0.5s; }
                .login-btn:hover::before { left: 100%; }
                .login-btn:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 15px 35px rgba(37, 99, 235, 0.45) !important; }
                .login-btn:active { transform: translateY(-1px) scale(0.98); }
                .register-link { transition: all 0.2s ease; display: inline-block; }
                .register-link:hover { transform: translateX(3px); color: #1d4ed8 !important; }
                @media (max-width: 900px) { .left-panel { display: none !important; } }
            `}</style>
        </div>
    );
};

export default Login;
