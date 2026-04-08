import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

// Route Protection
import ProtectedRoute from './ProtectedRoute';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Error Pages
import NotFound from '../pages/error/NotFound';

// Dashboard Pages
import TongQuan from '../pages/dashboard/TongQuan';

// Danh Muc Pages
import SanPham from '../pages/danhmuc/SanPham';
import NguyenPhuLieu from '../pages/danhmuc/NguyenPhuLieu';
import DinhMuc from '../pages/danhmuc/DinhMuc';
import QuyDoiDonVi from '../pages/danhmuc/QuyDoiDonVi';
import TyGia from '../pages/danhmuc/TyGia';

// Hop Dong Pages
import HopDong from '../pages/hopdong/HopDong';
import LoHang from '../pages/hopdong/LoHang';

// To Khai Pages
// import ToKhai from '../pages/tokhai/ToKhai';
import QuanLyToKhaiNhap from '../pages/tokhai/QuanLyToKhaiNhap';
import QuanLyToKhaiXuat from '../pages/tokhai/QuanLyToKhaiXuat';
import NhapToKhaiNhap from '../pages/tokhai/NhapToKhaiNhap';
import NhapToKhaiXuat from '../pages/tokhai/NhapToKhaiXuat';

// Kho Pages
import Kho from '../pages/kho/Kho';
import NhapKhoNPL from '../pages/kho/NhapKhoNPL';
import XuatKhoNPL from '../pages/kho/XuatKhoNPL';
import NhapKhoSP from '../pages/kho/NhapKhoSP';
import XuatKhoSP from '../pages/kho/XuatKhoSP';
import TonKho from '../pages/kho/TonKho';
import LichSuTonKho from '../pages/kho/LichSuTonKho';

// San Xuat Pages
import PhieuSanXuat from '../pages/sanxuat/PhieuSanXuat';

// Doi Soat Pages
import DoiSoatNhap from '../pages/doisoat/DoiSoatNhap';
import DoiSoatXuat from '../pages/doisoat/DoiSoatXuat';
import DoiSoatDinhMuc from '../pages/doisoat/DoiSoatDinhMuc';
import SoKhop from '../pages/doisoat/SoKhop';

// Noi Dia Pages
import HoaDonNoiDia from '../pages/noidia/HoaDonNoiDia';

// Tieu Huy Pages
import BienBanTieuHuy from '../pages/tieuhuy/BienBanTieuHuy';

// Thanh Toan Pages
import ThanhKhoan from '../pages/thanhtoan/ThanhKhoan';

// He Thong Pages
import CanhBao from '../pages/hethong/CanhBao';
import LogHeThong from '../pages/hethong/LogHeThong';

// User Pages
import Profile from '../pages/user/Profile';

const router = createBrowserRouter([
  {
    // Các route cần bảo vệ sẽ nằm trong MainLayout
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      // Khi truy cập '/', tự động chuyển đến '/dashboard'
      { index: true, element: <Navigate to="/tong-quan" replace /> },    
      { path: 'tong-quan', element: <TongQuan /> },
      { path: 'hop-dong', element: <HopDong /> },
      { path: 'lo-hang', element: <LoHang /> },
      { path: 'san-pham', element: <SanPham /> },
      { path: 'nguyen-phu-lieu', element: <NguyenPhuLieu /> },
      { path: 'dinh-muc', element: <DinhMuc /> },
      // { path: 'to-khai', element: <ToKhai /> },
      { path: 'quan-ly-to-khai-nhap', element: <QuanLyToKhaiNhap /> },
      { path: 'quan-ly-to-khai-xuat', element: <QuanLyToKhaiXuat /> },
      { path: 'to-khai-nhap', element: <NhapToKhaiNhap /> },
      { path: 'to-khai-xuat', element: <NhapToKhaiXuat /> },
      { path: 'kho', element: <Kho /> },
      { path: 'kho/ton-kho', element: <TonKho /> },
      { path: 'kho/lich-su-ton-kho', element: <LichSuTonKho /> },
      { path: 'kho/nhap-npl', element: <NhapKhoNPL /> },
      { path: 'kho/xuat-npl', element: <XuatKhoNPL /> },
      { path: 'kho/nhap-sp', element: <NhapKhoSP /> },
      { path: 'kho/xuat-sp', element: <XuatKhoSP /> },
      { path: 'phieu-san-xuat', element: <PhieuSanXuat /> },
      { path: 'doi-soat-nhap', element: <DoiSoatNhap /> },
      { path: 'doi-soat-xuat', element: <DoiSoatXuat /> },
      { path: 'doi-soat-dinh-muc', element: <DoiSoatDinhMuc /> },
      { path: 'so-khop-155', element: <SoKhop /> },
      { path: 'hoa-don-noi-dia', element: <HoaDonNoiDia /> },
      { path: 'bien-ban-tieu-huy', element: <BienBanTieuHuy /> },
      { path: 'thanh-khoan', element: <ThanhKhoan /> },
      { path: 'ty-gia', element: <TyGia /> },
      { path: 'quy-doi-don-vi', element: <QuyDoiDonVi /> },
      { path: 'canh-bao', element: <CanhBao /> },
      { path: 'log-he-thong', element: <LogHeThong /> },
      { path: 'profile', element: <Profile /> },
    ],
  },
  {
    // Các route công khai sẽ nằm trong AuthLayout
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
    ],
  },
  // 404 Not Found - catch all invalid routes
  {
    path: '*',
    element: <NotFound />,
  }
]);

export default router;