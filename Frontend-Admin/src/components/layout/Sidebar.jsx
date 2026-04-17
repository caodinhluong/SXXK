import { Link, useLocation } from 'react-router-dom';
import { Menu, Tooltip } from 'antd';
import {
  LayoutDashboard,
  Building2,
  DollarSign,
  Package,
  Bot,
} from 'lucide-react';

const menuItems = [
  {
    key: '/',
    icon: <LayoutDashboard size={18} />,
    label: 'Tổng quan',
    path: '/',
  },
  {
    key: '/doanh-nghiep',
    icon: <Building2 size={18} />,
    label: 'Doanh nghiệp',
    path: '/doanh-nghiep',
  },
  {
    key: '/tien-te',
    icon: <DollarSign size={18} />,
    label: 'Tiền tệ',
    path: '/tien-te',
  },
  {
    key: '/don-vi-tinh-hq',
    icon: <Package size={18} />,
    label: 'Đơn vị tính HQ',
    path: '/don-vi-tinh-hq',
  },
  {
    key: '/chatbot-admin',
    icon: <Bot size={18} />,
    label: 'Quản lý Chatbot',
    path: '/chatbot-admin',
  },
];

const Sidebar = ({ collapsed }) => {
  const location = useLocation();

  const getSelectedKey = () => {
    const path = location.pathname;
    const item = menuItems.find(item => item.path === path);
    return item ? [item.key] : ['/'];
  };

  const items = menuItems.map((item) => ({
    key: item.key,
    icon: collapsed ? (
      <Tooltip title={item.label} placement="right">
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {item.icon}
        </span>
      </Tooltip>
    ) : (
      <span style={{ display: 'flex', alignItems: 'center' }}>
        {item.icon}
      </span>
    ),
    label: collapsed ? null : (
      <Link to={item.path} style={{ color: 'inherit' }}>
        <span className="sidebar-text-animate">{item.label}</span>
      </Link>
    ),
    onClick: collapsed ? () => window.location.href = item.path : undefined,
  }));

  return (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={getSelectedKey()}
      items={items}
      style={{
        background: 'transparent',
        border: 'none',
      }}
    />
  );
};

export default Sidebar;
