# Hệ thống Quản lý Xuất nhập khẩu (Export-Import Management System)

## Giới thiệu

Dự án quản lý toàn bộ quy trình xuất nhập khẩu hàng hóa bao gồm: quản lý hợp đồng, tờ khai hải quan, kho bãi, sản xuất, đối soát và báo cáo thanh khoản.

## Cấu trúc dự án

```
├── Backend/           # Node.js + Express API
├── Frontend-User/     # React + Vite (Doanh nghiệp)
└── Frontend-Admin/    # React + Vite (Hải quan/Admin)
```

## Yêu cầu hệ thống

- Node.js >= 18.x
- MySQL >= 8.0
- npm hoặc yarn

## Cài đặt

### 1. Clone dự án và cài đặt dependencies

```bash
# Backend
cd Backend
npm install

# Frontend User
cd Frontend-User
npm install

# Frontend Admin  
cd Frontend-Admin
npm install
```

### 2. Cấu hình database

- Tạo database MySQL: `xuatnhapkhau`
- Copy `Backend/.env.example` thành `Backend/.env`
- Cập nhật thông tin database trong `.env`

### 3. Khởi động

```bash
# Terminal 1 - Backend (port 3000)
cd Backend
npm start

# Terminal 2 - Frontend User (port 5173)
cd Frontend-User
npm run dev

# Terminal 3 - Frontend Admin (port 5174)
cd Frontend-Admin
npm run dev
```

## Công nghệ sử dụng

### Backend
- Node.js + Express.js
- Sequelize ORM
- MySQL
- JWT Authentication
- Multer (upload files)

### Frontend
- React 19 + Vite
- Ant Design 5
- React Router DOM 7
- Axios
- Recharts (biểu đồ)
- XLSX (Excel import/export)

## Tính năng chính

### Cho Doanh nghiệp (Frontend-User)
- Đăng nhập/Đăng ký
- Quản lý hợp đồng, lô hàng
- Quản lý sản phẩm, nguyên phụ liệu
- Quản lý tờ khai nhập/xuất
- Quản lý kho (nhập/xuất NPL, SP)
- Quản lý định mức, quy đổi đơn vị
- Đối soát nhập/xuất/định mức
- Báo cáo tồn kho, thanh khoản hợp đồng

### Cho Hải quan/Admin (Frontend-Admin)
- Quản lý doanh nghiệp
- Quản lý tiền tệ, tỷ giá
- Quản lý đơn vị tính HQ
- Theo dõi tờ khai
- Quản lý tài khoản

## API Documentation

Xem chi tiết tại: `Backend/README.md` (nếu có)

## Cấu trúc thư mục Backend

```
Backend/
├── src/
│   ├── config/         # Cấu hình (CORS, database)
│   ├── controllers/    # Xử lý request
│   ├── cron/          # Jobs chạy định kỳ
│   ├── middleware/    # Auth, validation
│   ├── models/        # Sequelize models
│   ├── routes/        # API routes
│   ├── services/      # Business logic
│   ├── utils/         # Helpers
│   └── index.js       # Entry point
├── uploads/           # File uploads
└── package.json
```

## Cấu trúc thư mục Frontend

```
Frontend-User/
├── src/
│   ├── components/    # Reusable components
│   ├── contexts/      # React contexts
│   ├── layouts/       # Page layouts
│   ├── pages/         # Page components
│   ├── routes/        # React Router config
│   ├── services/      # API calls
│   └── utils/         # Helpers
├── .env
└── package.json
```

## Giấy phép

ISC