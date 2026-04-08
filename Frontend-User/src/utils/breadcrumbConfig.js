import { Home, Package, FileText, Warehouse, Factory, FileSpreadsheet, DollarSign, AlertTriangle, FileSearch, User, GitCompare, Trash2 } from 'lucide-react';

/**
 * Breadcrumb configuration for all routes
 * Each route can have:
 * - title: Display text for the breadcrumb
 * - icon: Icon component (optional)
 * - parent: Parent route path (optional, for nested routes)
 */
export const breadcrumbConfig = {
  '/tong-quan': {
    title: 'Tổng Quan',
    icon: Home,
  },
  '/hop-dong': {
    title: 'Hợp Đồng',
    icon: FileText,
  },
  '/lo-hang': {
    title: 'Lô Hàng',
    icon: Package,
  },
  '/san-pham': {
    title: 'Sản Phẩm',
    icon: Package,
  },
  '/nguyen-phu-lieu': {
    title: 'Nguyên Phụ Liệu',
    icon: Package,
  },
  '/dinh-muc': {
    title: 'Định Mức',
    icon: FileText,
  },
  '/quy-doi-don-vi': {
    title: 'Quy Đổi Đơn Vị',
    icon: FileText,
  },
  '/ty-gia': {
    title: 'Tỷ Giá',
    icon: DollarSign,
  },
  '/quan-ly-to-khai-nhap': {
    title: 'Quản Lý Tờ Khai Nhập',
    icon: FileText,
  },
  '/quan-ly-to-khai-xuat': {
    title: 'Quản Lý Tờ Khai Xuất',
    icon: FileText,
  },
  '/to-khai-nhap': {
    title: 'Nhập Tờ Khai Nhập',
    icon: FileText,
  },
  '/to-khai-xuat': {
    title: 'Nhập Tờ Khai Xuất',
    icon: FileText,
  },
  '/kho': {
    title: 'Kho',
    icon: Warehouse,
  },
  '/kho/ton-kho': {
    title: 'Tồn Kho',
    icon: Warehouse,
    parent: '/kho',
  },
  '/kho/lich-su-ton-kho': {
    title: 'Lịch Sử Tồn Kho',
    icon: FileSearch,
    parent: '/kho',
  },
  '/kho/nhap-npl': {
    title: 'Nhập Kho NPL',
    icon: Warehouse,
    parent: '/kho',
  },
  '/kho/xuat-npl': {
    title: 'Xuất Kho NPL',
    icon: Warehouse,
    parent: '/kho',
  },
  '/kho/nhap-sp': {
    title: 'Nhập Kho SP',
    icon: Warehouse,
    parent: '/kho',
  },
  '/kho/xuat-sp': {
    title: 'Xuất Kho SP',
    icon: Warehouse,
    parent: '/kho',
  },
  '/phieu-san-xuat': {
    title: 'Phiếu Sản Xuất',
    icon: Factory,
  },
  '/doi-soat-nhap': {
    title: 'Đối Soát Nhập',
    icon: GitCompare,
  },
  '/doi-soat-xuat': {
    title: 'Đối Soát Xuất',
    icon: GitCompare,
  },
  '/doi-soat-dinh-muc': {
    title: 'Đối Soát Định Mức',
    icon: GitCompare,
  },
  '/hoa-don-noi-dia': {
    title: 'Hóa Đơn Nội Địa',
    icon: FileSpreadsheet,
  },
  '/bien-ban-tieu-huy': {
    title: 'Biên Bản Tiêu Hủy',
    icon: Trash2,
  },
  '/thanh-khoan': {
    title: 'Thanh Khoản',
    icon: DollarSign,
  },
  '/canh-bao': {
    title: 'Cảnh Báo',
    icon: AlertTriangle,
  },
  '/log-he-thong': {
    title: 'Log Hệ Thống',
    icon: FileSearch,
  },
  '/profile': {
    title: 'Thông Tin Tài Khoản',
    icon: User,
  },
};

/**
 * Generate breadcrumb items for a given pathname
 * @param {string} pathname - Current route pathname
 * @returns {Array} Array of breadcrumb items with title, path, and icon
 */
export const getBreadcrumbItems = (pathname) => {
  const items = [];
  
  // Always add home as first item
  items.push({
    title: 'Trang Chủ',
    path: '/tong-quan',
    icon: Home,
  });

  // If we're on home page, return just home
  if (pathname === '/' || pathname === '/tong-quan') {
    return items;
  }

  // Get config for current path
  const currentConfig = breadcrumbConfig[pathname];
  
  if (!currentConfig) {
    // If no config found, try to generate from path segments
    const segments = pathname.split('/').filter(Boolean);
    segments.forEach((segment, index) => {
      const path = '/' + segments.slice(0, index + 1).join('/');
      const config = breadcrumbConfig[path];
      
      if (config) {
        items.push({
          title: config.title,
          path: path,
          icon: config.icon,
        });
      } else {
        // Fallback: capitalize segment
        items.push({
          title: segment.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' '),
          path: path,
        });
      }
    });
  } else {
    // Build breadcrumb trail from parent hierarchy
    const trail = [];
    let current = pathname;
    
    while (current && breadcrumbConfig[current]) {
      const config = breadcrumbConfig[current];
      trail.unshift({
        title: config.title,
        path: current,
        icon: config.icon,
      });
      current = config.parent;
    }
    
    items.push(...trail);
  }

  return items;
};
