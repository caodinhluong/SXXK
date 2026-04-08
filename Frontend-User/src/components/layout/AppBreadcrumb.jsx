import { Breadcrumb } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { getBreadcrumbItems } from '../../utils/breadcrumbConfig';
import { ChevronRight } from 'lucide-react';

const AppBreadcrumb = () => {
  const location = useLocation();
  const breadcrumbItems = getBreadcrumbItems(location.pathname);

  // Convert to Ant Design Breadcrumb format
  const antdItems = breadcrumbItems.map((item, index) => {
    const isLast = index === breadcrumbItems.length - 1;
    const Icon = item.icon;

    return {
      title: isLast ? (
        // Last item - not clickable
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-primary)',
            fontWeight: 600,
          }}
        >
          {Icon && <Icon size={14} />}
          {item.title}
        </span>
      ) : (
        // Other items - clickable
        <Link
          to={item.path}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-secondary)',
            transition: 'color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--primary-color)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          {Icon && <Icon size={14} />}
          {item.title}
        </Link>
      ),
    };
  });

  return (
    <Breadcrumb
      separator={<ChevronRight size={14} style={{ color: 'var(--text-tertiary)' }} />}
      items={antdItems}
      style={{
        fontSize: '14px',
      }}
    />
  );
};

export default AppBreadcrumb;
