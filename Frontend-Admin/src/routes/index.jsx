import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import ProtectedRoute from './ProtectedRoute';

// Pages
import Login from '../pages/Login';
import TongQuan from '../pages/TongQuan';
import DoanhNghiep from '../pages/DoanhNghiep';
import TienTe from '../pages/TienTe';
import DonViTinhHQ from '../pages/DonViTinhHQ';
import TaiKhoan from '../pages/TaiKhoan';
import CaiDat from '../pages/CaiDat';
import ChatbotAdmin from '../pages/ChatbotAdmin';


const router = createBrowserRouter([
  {
    path: '/login',
    element: <AuthLayout />,
    children: [{ index: true, element: <Login /> }],
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <TongQuan /> },
      { path: 'doanh-nghiep', element: <DoanhNghiep /> },
      { path: 'tien-te', element: <TienTe /> },
      { path: 'don-vi-tinh-hq', element: <DonViTinhHQ /> },
      { path: 'tai-khoan', element: <TaiKhoan /> },
      { path: 'cai-dat', element: <CaiDat /> },
      { path: 'chatbot-admin', element: <ChatbotAdmin /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);

export default router;