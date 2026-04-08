import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Layout, Typography } from 'antd';
import Sidebar from '../components/layout/Sidebar';
import AppHeader from '../components/layout/Header';
import logo from '../assets/logo.png';

const { Content, Footer, Sider } = Layout;
const { Title } = Typography;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {isMobile && !collapsed && (
        <div
          onClick={() => setCollapsed(true)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 99,
            animation: 'fadeIn 0.3s ease-out',
          }}
        />
      )}

      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        width={260}
        collapsedWidth={isMobile ? 0 : 80}
        style={{
          overflowY: collapsed ? 'hidden' : 'auto',
          overflowX: 'hidden',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
          boxShadow: '4px 0 20px rgba(0, 0, 0, 0.15)',
          zIndex: 100,
          transform: isMobile && collapsed ? 'translateX(-100%)' : 'translateX(0)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        className="custom-sider"
      >
        <Link to="/tong-quan">
          <div
            style={{
              height: 72,
              display: 'flex',
              alignItems: 'center',
              justifyContent: collapsed ? 'center' : 'flex-start',
              padding: collapsed ? '0' : '0 24px',
              cursor: 'pointer',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                flexShrink: 0,
              }}
              className="hover-scale"
            >
              <img
                src={logo}
                alt="Logo"
                style={{
                  height: 28,
                  width: 28,
                  objectFit: 'contain',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            </div>
            <div 
              style={{ 
                marginLeft: collapsed ? 0 : 14,
                overflow: 'hidden',
                opacity: collapsed ? 0 : 1,
                width: collapsed ? 0 : 'auto',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                visibility: collapsed ? 'hidden' : 'visible',
              }}
            >
              <Title
                level={4}
                style={{
                  color: 'white',
                  margin: 0,
                  whiteSpace: 'nowrap',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                }}
              >
                SXXK
              </Title>
              <span style={{ 
                color: 'rgba(255, 255, 255, 0.6)', 
                fontSize: '11px',
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}>
                Doanh nghiệp
              </span>
            </div>
          </div>
        </Link>

        <div style={{ padding: '16px 0', height: 'calc(100vh - 72px)', overflowY: 'auto', overflowX: 'hidden' }}>
          <Sidebar collapsed={collapsed} />
        </div>
      </Sider>

      <Layout
        style={{
          marginLeft: isMobile ? 0 : (collapsed ? 80 : 260),
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          minHeight: '100vh',
          background: 'var(--bg-color)',
        }}
      >
        <AppHeader collapsed={collapsed} setCollapsed={setCollapsed} />

        <Content
          style={{
            margin: '24px',
            minHeight: 'calc(100vh - 64px - 70px)',
          }}
        >
          <div
            key={location.pathname}
            className="fade-in"
            style={{
              padding: 24,
              background: 'var(--bg-card)',
              borderRadius: '16px',
              boxShadow: 'var(--shadow-sm)',
              minHeight: '100%',
              color: 'var(--text-primary)',
            }}
          >
            <Outlet />
          </div>
        </Content>

        <Footer
          style={{
            textAlign: 'center',
            background: 'transparent',
            color: 'var(--text-secondary)',
            padding: '16px 24px',
            fontSize: '13px',
          }}
        >
          <span style={{ fontWeight: 500 }}>SXXK</span> ©{new Date().getFullYear()} - 
          Hệ thống Quản lý Xuất Nhập Khẩu
        </Footer>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
