import { Link, useLocation } from 'react-router-dom';
import { Menu, Tooltip } from 'antd';
import {
  LayoutDashboard,
  FileText,
  Package,
  Layers,
  Settings,
  TrendingUp,
  Container,
  ShoppingCart,
  FileBarChart,
  Warehouse,
  PackagePlus,
  PackageMinus,
  PackageCheck,
  PackageX,
  DollarSign,
  Calculator,
  Ruler,
  History,
  Factory,
  GitCompare,
  FileSpreadsheet,
  Trash2,
  Bell,
  ScrollText,
  Server,
} from 'lucide-react';

const menuItems = [
  {
    key: '/tong-quan',
    icon: <LayoutDashboard size={18} />,
    label: 'Tổng quan',
    path: '/tong-quan',
  },
  {
    key: 'sub1',
    icon: <Layers size={18} />,
    label: 'Quản lý Nghiệp vụ',
    children: [
      {
        key: '/hop-dong',
        icon: <FileText size={16} />,
        label: 'Hợp đồng',
        path: '/hop-dong',
      },
      // Tạm ẩn - xem lô hàng trong hợp đồng
      // {
      //   key: '/lo-hang',
      //   icon: <Package size={16} />,
      //   label: 'Quản lý Lô hàng',
      //   path: '/lo-hang',
      // },
      {
        key: '/san-pham',
        icon: <PackageCheck size={16} />,
        label: 'Sản phẩm',
        path: '/san-pham',
      },
      {
        key: '/nguyen-phu-lieu',
        icon: <Container size={16} />,
        label: 'Nguyên phụ liệu',
        path: '/nguyen-phu-lieu',
      },
      {
        key: '/dinh-muc',
        icon: <Calculator size={16} />,
        label: 'Định mức',
        path: '/dinh-muc',
      },
      {
        key: '/quy-doi-don-vi',
        icon: <Ruler size={16} />,
        label: 'Quy đổi đơn vị',
        path: '/quy-doi-don-vi',
      },
    ],
  },
  {
    key: 'sub2',
    icon: <FileBarChart size={18} />,
    label: 'Tờ khai Hải quan',
    children: [
      {
        key: '/to-khai-nhap',
        icon: <PackagePlus size={16} />,
        label: 'Nhập Tờ khai nhập',
        path: '/to-khai-nhap',
      },
      {
        key: '/to-khai-xuat',
        icon: <PackageMinus size={16} />,
        label: 'Nhập Tờ khai xuất',
        path: '/to-khai-xuat',
      },
      {
        key: '/quan-ly-to-khai-nhap',
        icon: <FileText size={16} />,
        label: 'Quản lý Tờ khai nhập',
        path: '/quan-ly-to-khai-nhap',
      },
      {
        key: '/quan-ly-to-khai-xuat',
        icon: <FileText size={16} />,
        label: 'Quản lý Tờ khai xuất',
        path: '/quan-ly-to-khai-xuat',
      },
    ],
  },
  {
    key: 'sub3',
    icon: <ShoppingCart size={18} />,
    label: 'Quản lý Kho',
    children: [
      {
        key: '/kho',
        icon: <Warehouse size={16} />,
        label: 'Danh sách kho',
        path: '/kho',
      },
      {
        key: '/kho/ton-kho',
        icon: <Package size={16} />,
        label: 'Theo dõi tồn kho',
        path: '/kho/ton-kho',
      },
      {
        key: '/kho/lich-su-ton-kho',
        icon: <History size={16} />,
        label: 'Lịch sử tồn kho',
        path: '/kho/lich-su-ton-kho',
      },
      {
        key: '/kho/nhap-npl',
        icon: <PackagePlus size={16} />,
        label: 'Nhập kho NPL',
        path: '/kho/nhap-npl',
      },
      {
        key: '/kho/xuat-npl',
        icon: <PackageMinus size={16} />,
        label: 'Xuất kho NPL',
        path: '/kho/xuat-npl',
      },
      {
        key: '/kho/nhap-sp',
        icon: <PackageCheck size={16} />,
        label: 'Nhập kho SP',
        path: '/kho/nhap-sp',
      },
      {
        key: '/kho/xuat-sp',
        icon: <PackageX size={16} />,
        label: 'Xuất kho SP',
        path: '/kho/xuat-sp',
      },
    ],
  },
  {
    key: 'sub4',
    icon: <Factory size={18} />,
    label: 'Sản xuất',
    children: [
      {
        key: '/phieu-san-xuat',
        icon: <FileSpreadsheet size={16} />,
        label: 'Phiếu sản xuất',
        path: '/phieu-san-xuat',
      },
    ],
  },
  {
    key: 'sub5',
    icon: <GitCompare size={18} />,
    label: 'Đối soát',
    children: [
      {
        key: '/doi-soat-nhap',
        icon: <PackagePlus size={16} />,
        label: 'Đối soát nhập',
        path: '/doi-soat-nhap',
      },
      {
        key: '/doi-soat-xuat',
        icon: <PackageMinus size={16} />,
        label: 'Đối soát xuất',
        path: '/doi-soat-xuat',
      },
      {
        key: '/doi-soat-dinh-muc',
        icon: <Calculator size={16} />,
        label: 'Đối soát định mức',
        path: '/doi-soat-dinh-muc',
      },
      {
        key: '/so-khop-155',
        icon: <GitCompare size={16} />,
        label: 'So khớp Mã 155',
        path: '/so-khop-155',
      },
    ],
  },
  {
    key: '/hoa-don-noi-dia',
    icon: <FileText size={18} />,
    label: 'Hóa đơn nội địa',
    path: '/hoa-don-noi-dia',
  },
  {
    key: '/bien-ban-tieu-huy',
    icon: <Trash2 size={18} />,
    label: 'Biên bản tiêu hủy',
    path: '/bien-ban-tieu-huy',
  },
  {
    key: '/thanh-khoan',
    icon: <TrendingUp size={18} />,
    label: 'Thanh khoản & Báo cáo',
    path: '/thanh-khoan',
  },
  {
    key: 'sub6',
    icon: <Server size={18} />,
    label: 'Hệ thống',
    children: [
      {
        key: '/canh-bao',
        icon: <Bell size={16} />,
        label: 'Cảnh báo',
        path: '/canh-bao',
      },
      {
        key: '/log-he-thong',
        icon: <ScrollText size={16} />,
        label: 'Log hệ thống',
        path: '/log-he-thong',
      },
    ],
  },
  {
    key: 'sub7',
    icon: <Settings size={18} />,
    label: 'Thiết lập',
    children: [
      {
        key: '/ty-gia',
        icon: <DollarSign size={16} />,
        label: 'Tỷ giá',
        path: '/ty-gia',
      },
    ],
  },
];

const Sidebar = ({ collapsed }) => {
  const location = useLocation();

  const getSelectedKey = () => {
    const path = location.pathname;
    let selectedKey = path;
    
    menuItems.forEach(item => {
      if (item.children) {
        item.children.forEach(child => {
          if (child.path === path) {
            selectedKey = child.key;
          }
        });
      } else if (item.path === path) {
        selectedKey = item.key;
      }
    });
    
    return [selectedKey];
  };

  const getOpenKeys = () => {
    const path = location.pathname;
    const openKeys = [];
    
    menuItems.forEach(item => {
      if (item.children) {
        item.children.forEach(child => {
          if (child.path === path) {
            openKeys.push(item.key);
          }
        });
      }
    });
    
    return openKeys;
  };

  const convertToMenuItems = (items) => {
    return items.map((item) => {
      if (item.children) {
        return {
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
          label: collapsed ? null : <span className="sidebar-text-animate">{item.label}</span>,
          children: collapsed ? null : convertToMenuItems(item.children),
        };
      }

      return {
        key: item.key,
        icon: item.icon ? (
          collapsed ? (
            <Tooltip title={item.label} placement="right">
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.icon}
              </span>
            </Tooltip>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center' }}>
              {item.icon}
            </span>
          )
        ) : null,
        label: collapsed ? null : (
          <Link to={item.path} style={{ color: 'inherit' }}>
            <span className="sidebar-text-animate">{item.label}</span>
          </Link>
        ),
        onClick: collapsed && item.path ? () => window.location.href = item.path : undefined,
      };
    });
  };

  return (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={getSelectedKey()}
      defaultOpenKeys={getOpenKeys()}
      items={convertToMenuItems(menuItems)}
      style={{
        background: 'transparent',
        border: 'none',
      }}
    />
  );
};

export default Sidebar;
