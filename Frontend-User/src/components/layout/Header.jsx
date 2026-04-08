import { Layout, Avatar, Dropdown, Typography, Button, Tooltip } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { logout } from '../../services/auth.service';
import NotificationCenter from '../notification/NotificationCenter';
import AppBreadcrumb from './AppBreadcrumb';
import { showInfo } from '../notification';
import {
  User,
  LogOut,
  PanelLeftOpen,
  PanelLeftClose,
  Settings,
  HelpCircle,
  Sun,
  Moon,
} from 'lucide-react';

const { Header } = Layout;
const { Text } = Typography;

const AppHeader = ({ collapsed, setCollapsed }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    logout();
    showInfo('Đã đăng xuất', 'Hẹn gặp lại bạn');
    navigate('/auth/login');
  };

  const handleMenuClick = ({ key }) => {
    if (key === 'account') {
      navigate('/profile');
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      label: (
        <div style={{ padding: '4px 0' }}>
          <div style={{ fontWeight: 600, color: '#1e293b' }}>
            {user?.ten_dn || 'Doanh nghiệp'}
          </div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            {user?.email || 'user@example.com'}
          </div>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'account',
      label: 'Thông tin tài khoản',
      icon: <User size={16} />,
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      label: 'Cài đặt',
      icon: <Settings size={16} />,
    },
    { type: 'divider' },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogOut size={16} />,
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <Header
      style={{
        padding: '0 24px',
        background: 'var(--header-bg)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: 'var(--shadow-sm)',
        position: 'sticky',
        top: 0,
        zIndex: 99,
        height: 64,
        borderBottom: '1px solid var(--border-color)',
      }}
    >
      {/* Left Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Toggle Button */}
        <Button
          type="text"
          icon={collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          onClick={() => setCollapsed(!collapsed)}
          style={{
            fontSize: '18px',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '10px',
            color: '#64748b',
            transition: 'all 0.3s ease',
          }}
          className="hover-lift"
        />

        {/* Breadcrumb */}
        <AppBreadcrumb />
      </div>

      {/* Right Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Theme Toggle */}
        <Tooltip title={theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}>
          <Button
            type="text"
            icon={theme === 'dark' ? <Sun size={18} style={{ color: '#fbbf24' }} /> : <Moon size={18} />}
            onClick={toggleTheme}
            style={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              color: theme === 'dark' ? '#fbbf24' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
        </Tooltip>

        {/* Help Button */}
        <Tooltip title="Trợ giúp">
          <Button
            type="text"
            icon={<HelpCircle size={18} />}
            style={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
        </Tooltip>

        {/* Notification Center */}
        <NotificationCenter />

        {/* Divider */}
        <div
          style={{
            width: 1,
            height: 24,
            background: 'var(--border-color)',
            margin: '0 8px',
          }}
        />

        {/* User Dropdown */}
        <Dropdown
          menu={{ items: userMenuItems, onClick: handleMenuClick }}
          trigger={['click']}
          placement="bottomRight"
          overlayStyle={{ minWidth: 200 }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '6px 12px',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: 'transparent',
            }}
            className="hover-lift"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#f1f5f9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <Avatar
              size={38}
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%)',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
              }}
              icon={<User size={20} />}
            />
          </div>
        </Dropdown>
      </div>
    </Header>
  );
};

export default AppHeader;
