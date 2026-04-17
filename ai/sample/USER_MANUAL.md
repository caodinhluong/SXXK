# HƯỚNG DẪN SỬ DỤNG HỆ THỐNG QUẢN LÝ XUẤT NHẬP KHẨU

---

## MỤC LỤC

1. [Đăng nhập và Khởi đầu](#1-đăng-nhập-và-khởi-đầu)
2. [Quản lý Hợp đồng](#2-quản-lý-hợp-đồng)
3. [Quản lý Lô hàng](#3-quản-lý-lô-hàng)
4. [Quản lý Tờ khai Hải quan](#4-quản-lý-tờ-khai-hải-quan)
5. [Quản lý Kho](#5-quản-lý-kho)
6. [Quản lý Sản phẩm](#6-quản-lý-sản-phẩm)
7. [Quản lý Nguyên phụ liệu](#7-quản-lý-nguyên-phụ-liệu)
8. [Quản lý Quy đổi đơn vị](#8-quản-lý-quy-đổi-đơn-vị)
9. [Nhập/Xuất Kho](#9-nhậpxuất-kho)
10. [Phiếu Sản xuất](#10-phiếu-sản-xuất)
11. [Đối soát](#11-đối-soát)
12. [Báo cáo Thanh khoản](#12-báo-cáo-thanh-khoản)
13. [Các thao tác thường dùng](#13-các-thao-tác-thường-dùng)
14. [Giải quyết sự cố](#14-giải-quyết-sự-cố)

---

## 1. ĐĂNG NHẬP VÀ KHỞI ĐẦU

### 1.1. Truy cập hệ thống

| Ứng dụng | Địa chỉ truy cập |
|----------|-----------------|
| Frontend Doanh nghiệp | http://localhost:5173 |
| Frontend Admin/Hải quan | http://localhost:5174 |
| Backend API | http://localhost:3000 |

### 1.2. Đăng nhập

**Bước 1**: Truy cập địa chỉ hệ thống
**Bước 2**: Nhập thông tin đăng nhập
- **Tên đăng nhập**: Mã số thuế doanh nghiệp
- **Mật khẩu**: Mật khẩu đã đăng ký
**Bước 3**: Click "Đăng nhập"

### 1.3. Đăng ký doanh nghiệp mới

**Bước 1**: Click "Đăng ký" trên trang đăng nhập
**Bước 2**: Nhập thông tin

| Trường | Yêu cầu | Ví dụ |
|--------|---------|-------|
| Tên doanh nghiệp | Bắt buộc | Công ty TNHH ABC |
| Mã số thuế | Bắt buộc, unique | 0123456789 |
| Địa chỉ | Bắt buộc | 123 Đường Nguyễn Trãi, Q1, TP.HCM |
| Email | Bắt buộc, đúng định dạng | info@abc.com |
| Số điện thoại | Tùy chọn | 0909123456 |
| Mật khẩu | Bắt buộc, tối thiểu 6 ký tự | ******** |
| Xác nhận mật khẩu | Bắt buộc, phải khớp | ******** |

**Bước 3**: Upload giấy phép kinh doanh (nếu có)
**Bước 4**: Click "Đăng ký"

### 1.4. Đăng xuất

Click vào avatar/username → Chọn "Đăng xuất"

---

## 2. QUẢN LÝ HỢP ĐỒNG

**Menu**: Hợp đồng

### 2.1. Tạo hợp đồng mới

**Bước 1**: Vào menu Hợp đồng
**Bước 2**: Click "Thêm mới" hoặc "+"

**Điền thông tin hợp đồng**:

| Trường | Yêu cầu | Mô tả | Ví dụ |
|--------|---------|-------|-------|
| Số hợp đồng | Bắt buộc | Số HD theo quy cách | HD-2026-001 |
| Ngày ký | Bắt buộc | Ngày ký hợp đồng | 15/01/2026 |
| Ngày hiệu lực | Tùy chọn | Ngày bắt đầu thực hiện | 01/02/2026 |
| Ngày hết hạn | Tùy chọn | Ngày kết thúc | 31/12/2026 |
| Đối tác | Bắt buộc | Tên công ty mua/bán | Công ty XYZ |
| Mã số thuế đối tác | Tùy chọn | MST bên mua/bán | 9876543210 |
| Địa chỉ đối tác | Tùy chọn | Địa chỉ đầy đủ | 456 Lê Lợi, Q1, TP.HCM |
| Sản phẩm | Tùy chọn | SP theo hợp đồng | Áo sơ mi |
| Số lượng đặt hàng | Tùy chọn | Số lượng SP | 10000 |
| Giá trị | Tùy chọn | Giá trị hợp đồng | 500000000 |
| Đơn vị tiền tệ | Tùy chọn | VND/USD/EUR | VND |
| Ghi chú | Tùy chọn | Thông tin thêm | Hợp đồng xuất khẩu |

**Bước 3**: Click "Lưu"

### 2.2. Xem danh sách hợp đồng

- Hiển thị danh sách tất cả hợp đồng
- Có thể tìm kiếm theo: số hợp đồng, tên đối tác, ngày ký
- Lọc theo trạng thái, ngày

### 2.3. Chi tiết hợp đồng

Click vào hợp đồng để xem chi tiết:
- Thông tin hợp đồng
- Danh sách lô hàng
- Danh sách tờ khai
- Báo cáo thanh khoản

### 2.4. Sửa hợp đồng

**Bước 1**: Click vào hợp đồng cần sửa
**Bước 2**: Click "Sửa"
**Bước 3**: Thay đổi thông tin
**Bước 4**: Click "Lưu"

### 2.5. Xóa hợp đồng

**Lưu ý**: Chỉ xóa được khi hợp đồng chưa có lô hàng

Click hợp đồng → Click "Xóa" → Xác nhận

---

## 3. QUẢN LÝ LÔ HÀNG

**Menu**: Lô hàng

### 3.1. Tạo lô hàng mới

**Bước 1**: Vào menu Lô hàng
**Bước 2**: Click "Thêm mới"

| Trường | Yêu cầu | Mô tả | Ví dụ |
|--------|---------|-------|-------|
| Số lô hàng | Bắt buộc | Mã lô hàng | LH-2026-001 |
| Hợp đồng | Bắt buộc | Chọn hợp đồng | HD-2026-001 |
| Ngày nhận | Tùy chọn | Ngày dự kiến nhận | 20/02/2026 |
| Số container | Tùy chọn | Số container | CN123456 |
| Trạng thái | Bắt buộc | Trạng thái lô hàng | ChoXuLy |

### 3.2. Trạng thái lô hàng

```
ChoXuLy → DangVanChuyen → DaNhapKho → HoanThanh
(Chờ xử lý) → (Đang vận chuyển) → (Đã nhập kho) → (Hoàn thành)
```

### 3.3. Danh sách lô hàng

- Xem theo hợp đồng
- Lọc theo trạng thái

---

## 4. QUẢN LÝ TỜ KHAI HẢI QUAN

**Menu**: Tờ khai

### 4.1. Tờ khai nhập

**Menu**: Tờ khai → Tờ khai nhập

#### Tạo tờ khai nhập mới

**Bước 1**: Vào Tờ khai → Tờ khai nhập
**Bước 2**: Click "Thêm mới"

| Trường | Yêu cầu | Mô tả | Ví dụ |
|--------|---------|-------|-------|
| Số tờ khai | Bắt buộc, unique | Số tờ khai HQ | TKND-2026-001 |
| Ngày tờ khai | Bắt buộc | Ngày nộp tờ khai | 15/02/2026 |
| Lô hàng | Bắt buộc | Chọn lô hàng | LH-2026-001 |
| Mã tờ khai | Bắt buộc | Loại tờ khai | G11 |
| Loại hàng | Tùy chọn | Loại hàng trong tờ khai | NguyenLieu |
| Cảng nhập | Tùy chọn | Cảng nhập hàng | Cảng Sài Gòn |
| Tổng trị giá | Tùy chọn | Giá trị hàng hóa | 100000000 |
| Thuế nhập khẩu | Tùy chọn | Số thuế NK | 10000000 |
| Thuế GTGT | Tùy chọn | Số thuế GTGT | 1000000 |
| Ghi chú | Tùy chọn | Ghi chú | Nhập khẩu nguyên liệu |

#### Mã tờ khai

| Mã | Tên gọi | Mô tả |
|-----|--------|-------|
| G11 | Nhập khẩu thông thường | Nhập khẩu thông thường |
| G12 | Nhập khẩu ưu đãi | Nhập khẩu hưởng ưu đãi |
| G13 | Tạm nhập tái xuất | Tạm nhập để tái xuất |
| G14 | Chuyển khẩu | Chuyển hàng sang nước khác |
| G51 | Tái nhập | Tái nhập hàng đã xuất |

#### Thêm chi tiết tờ khai

**Sau khi tạo tờ khai**, thêm chi tiết từng mặt hàng:

| Trường | Yêu cầu |
|--------|---------|
| Nguyên phụ liệu/Sản phẩm | Chọn mặt hàng |
| Số lượng | Số lượng |
| Đơn giá | Đơn giá |
| Trị giá | Trị giá (tự tính) |

**Bước 3**: Click "Lưu"

### 4.2. Tờ khai xuất

**Menu**: Tờ khai → Tờ khai xuất

Tương tự tờ khai nhập nhưng cho xuất khẩu

| Mã | Tên gọi |
|----|---------|
| G21 | Xuất khẩu thông thường |
| G22 | Xuất khẩu ưu đãi |
| G31 | Tạm xuất tái nhập |
| G32 | Chuyển khẩu |

### 4.3. Trạng thái tờ khai

```
ChoXuLy → ChoDuyet → ThongQuan → KiemTraHoSo → KiemTraThucTe → TaiXuat → TichThu
   ↓          ↓          ↓            ↓             ↓            ↓          ↓
Chờ xử lý Duyệt    Thông quan   Kiểm tra HS   Kiểm tra TT   Tái xuất    Tích thu
```

### 4.4. Import tờ khai từ Excel

**Bước 1**: Chuẩn bị file Excel theo template hệ thống
**Bước 2**: Trong trang tờ khai, click "Import Excel"
**Bước 3**: Upload file
**Bước 4**: Kiểm tra dữ liệu preview
**Bước 5**: Click "Lưu"

---

## 5. QUẢN LÝ KHO

**Menu**: Kho

### 5.1. Tạo kho mới

**Bước 1**: Vào menu Kho
**Bước 2**: Click "Thêm mới"

| Trường | Yêu cầu | Mô tả | Ví dụ |
|--------|---------|-------|-------|
| Tên kho | Bắt buộc | Tên kho | Kho Nguyên liệu Chính |
| Mã kho | Tùy chọn | Mã kho nội bộ | KHO-NL-01 |
| Địa chỉ | Tùy chọn | Địa chỉ kho | 123 Đường ABC |
| Loại kho | Bắt buộc | Loại kho | NguyenLieu |

**Các loại kho**:
- NguyenLieu: Kho nguyên liệu
- ThanhPham: Kho thành phẩm
- BanThanhPham: Kho bán thành phẩm
- TongHop: Kho tổng hợp

### 5.2. Xem tồn kho

**Menu**: Kho → Tồn kho

**Bước 1**: Chọn kho cần xem (hoặc "Tất cả")
**Bước 2**: Xem danh sách tồn kho

| Thông tin hiển thị |
|-------------------|
| Mã mặt hàng |
| Tên mặt hàng |
| Đơn vị tính |
| Số lượng tồn |

### 5.3. Báo cáo tồn kho theo kỳ

**Menu**: Kho → Báo cáo tồn kho

**Bước 1**: Chọn kho (hoặc "Tất cả")
**Bước 2**: Chọn loại (NPL / SP / Tất cả)
**Bước 3**: Chọn kỳ báo cáo
- Từ ngày: 01/04/2026
- Đến ngày: 30/04/2026

**Bước 4**: Click "Tạo báo cáo"

**Kết quả hiển thị**:

| Mã hàng | Tên | Tồn đầu kỳ | Nhập | Xuất | Tồn cuối kỳ |
|--------|-----|-----------|------|------|-----------|
| VL001 | Vải cotton | 100 | 50 | 30 | 120 |

---

## 6. QUẢN LÝ SẢN PHẨM

**Menu**: Sản phẩm

### 6.1. Thêm sản phẩm mới

**Bước 1**: Vào menu Sản phẩm
**Bước 2**: Click "Thêm mới"

| Trường | Yêu cầu | Mô tả | Ví dụ |
|--------|---------|-------|-------|
| Tên sản phẩm | Bắt buộc | Tên đầy đủ | Áo sơ mi nam |
| Mã sản phẩm | Tùy chọn | Mã nội bộ | ASM001 |
| Đơn vị tính HQ | Bắt buộc | Chọn đơn vị | Cái |
| Loại sản phẩm | Bắt buộc | Loại SP | ThanhPham |
| Mô tả | Tùy chọn | Mô tả chi tiết | Áo sơ mi nam cotton |

### 6.2. Quản lý định mức sản phẩm

**Menu**: Sản phẩm → Định mức

**Bước 1**: Chọn sản phẩm
**Bước 2**: Click "Thêm định mức"

| Trường | Yêu cầu |
|--------|---------|
| Nguyên phụ liệu | Chọn NPL |
| Số lượng | Số lượng cần cho 1 SP |

**Ví dụ**: Sản phẩm Áo sơ mi cần:
- Vải cotton: 1.5 mét/SP
- Nút áo: 5 cái/SP
- Chỉ may: 10 mét/SP

---

## 7. QUẢN LÝ NGUYÊN PHỤ LIỆU

**Menu**: Nguyên phụ liệu

### 7.1. Thêm nguyên phụ liệu

**Bước 1**: Vào menu Nguyên phụ liệu
**Bước 2**: Click "Thêm mới"

| Trường | Yêu cầu | Mô tả | Ví dụ |
|--------|---------|-------|-------|
| Tên NPL | Bắt buộc | Tên đầy đủ | Vải cotton 100% |
| Mã phân loại | Tùy chọn | Mã nội bộ | VC001 |
| Đơn vị tính HQ | Bắt buộc | Chọn đơn vị | Mét |
| Mô tả | Tùy chọn | Mô tả | Vải cotton mịn, trắng |

---

## 8. QUẢN LÝ QUY ĐỔI ĐƠN VỊ

**Menu**: Quản lý → Quy đổi đơn vị

### 8.1. Quy đổi NPL/SP với đơn vị HQ

**Bước 1**: Vào menu Quy đổi đơn vị
**Bước 2**: Click "Thêm mới"

| Trường | Yêu cầu | Ví dụ |
|--------|---------|-------|
| Nguyên phụ liệu | Chọn NPL | Vải cotton |
| Đơn vị DN | Đơn vị tính nội bộ | Mét |
| Đơn vị HQ | Chọn đơn vị HQ | Yard |
| Hệ số quy đổi | Hệ số chuyển đổi | 1.0936 |

**Cách tính**:
- 1 Yard = 1.0936 Mét
- Nhập kho: mét → Quy đổi sang yard để kê khai HQ

### 8.2. Quy đổi đơn vị doanh nghiệp

**Menu**: Quản lý → Quy đổi đơn vị DN

| Trường | Yêu cầu |
|--------|---------|
| Chọn NPL/SP |
| Đơn vị 1 |
| Đơn vị 2 |
| Hệ số |

---

## 9. NHẬP/XUẤT KHO

### 9.1. Nhập kho nguyên phụ liệu

**Menu**: Kho → Nhập kho NPL → Thêm mới

| Trường | Yêu cầu | Ví dụ |
|--------|---------|-------|
| Số phiếu | Bắt buộc | PN-2026-001 |
| Ngày nhập | Bắt buộc | 20/02/2026 |
| Kho | Bắt buộc | Kho Nguyên liệu |
| Hợp đồng | Tùy chọn | HD-2026-001 |
| Lô hàng | Tùy chọn | LH-2026-001 |

**Thêm chi tiết (danh sách NPL)**:

| NPL | Số lượng | Đơn giá | Trị giá |
|-----|---------|--------|--------|
| Vải cotton | 1000 | 50000 | 50000000 |
| Nút áo | 5000 | 500 | 2500000 |

**Click "Lưu"**

### 9.2. Xuất kho nguyên phụ liệu

**Menu**: Kho → Xuất kho NPL → Thêm mới

| Trường | Yêu cầu |
|--------|---------|
| Số phiếu |
| Ngày xuất |
| Kho |
| Phiếu sản xuất (liên kết) |

### 9.3. Nhập kho sản phẩm

**Menu**: Kho → Nhập kho SP → Thêm mới

- Nhập sản phẩm hoàn thành từ sản xuất

### 9.4. Xuất kho sản phẩm

**Menu**: Kho → Xuất kho SP → Thêm mới

- Xuất sản phẩm xuất khẩu

---

## 10. PHIẾU SẢN XUẤT

**Menu**: Sản xuất → Phiếu sản xuất

### 10.1. Tạo phiếu sản xuất

**Bước 1**: Vào menu Phiếu sản xuất
**Bước 2**: Click "Thêm mới"

| Trường | Yêu cầu | Ví dụ |
|--------|---------|-------|
| Số phiếu | Bắt buộc | PX-2026-001 |
| Ngày sản xuất | Bắt buộc | 25/02/2026 |
| Sản phẩm | Bắt buộc | Áo sơ mi |
| Số lượng kế hoạch | Bắt buộc | 1000 |
| Số lượng thực tế | Tùy chọn | 980 |
| Kho xuất | Bắt buộc | Kho Nguyên liệu |
| Ghi chú | Tùy chọn | Ca sáng |

**Bước 3**: Click "Lưu"

---

## 11. ĐỐI SOÁT

**Menu**: Đối soát

### 11.1. Đối soát nhập

**Mục đích**: So sánh số lượng trên tờ khai nhập vs số lượng thực nhập kho

**Menu**: Đối soát → Đối soát nhập → Tạo mới

**Bước 1**: Chọn tờ khai nhập cần đối soát
**Bước 2**: Chọn phiếu nhập kho tương ứng
**Bước 3**: Nhập thông tin

| Trường | Yêu cầu |
|--------|---------|
| Người đối soát | Tên người thực hiện |
| Ngày đối soát | Ngày thực hiện |

**Bước 4**: Click "Đối soát"

**Kết quả**:

| Kết quả | Ý nghĩa |
|--------|---------|
| Khớp đủ (KhopDu) | Số lượng tờ khai = Số lượng nhập kho |
| Chênh lệch (ChenhLech) | Có sự chênh lệch |

**Chi tiết chênh lệch**:

| Mặt hàng | Số tờ khai | Số nhập kho | Chênh lệch |
|---------|-----------|------------|-----------|
| Vải cotton | 1000 | 980 | -20 |

### 11.2. Đối soát xuất

**Menu**: Đối soát → Đối soát xuất

Tương tự đối soát nhập nhưng so sánh tờ khai xuất với phiếu xuất kho

**Mã đối soát mặc định**: 155

### 11.3. Đối soát định mức

**Mục đích**: So sánh định mức tiêu hao vs số lượng thực tế sử dụng

**Menu**: Đối soát → Đối soát định mức → Tạo mới

**Bước 1**: Chọn doanh nghiệp
**Bước 2**: Chọn sản phẩm cần đối soát
**Bước 3**: Chọn kỳ
- Từ ngày: 01/04/2026
- Đến ngày: 30/04/2026
**Bước 4**: Nhập người đối soát, ngày đối soát
**Bước 5**: Click "Đối soát"

**Công thức tính**:
```
Số lượng định mức = Số lượng SP sản xuất × Định mức/đơn vị
Sai lệch = Thực tế - Định mức
Tỷ lệ sai lệch = (Sai lệch / Định mức) × 100%
```

**Kết quả**:

| Kết luận | Điều kiện |
|----------|-----------|
| Đạt định mức (DatDinhMuc) | Sai lệch ≤ 5% |
| Vượt định mức (VuotDinhMuc) | Sử dụng nhiều hơn >5% |
| Dưới định mức (DuoiDinhMuc) | Sử dụng ít hơn >5% |

---

## 12. BÁO CÁO THANH KHOẢN

**Menu**: Báo cáo → Thanh khoản hợp đồng

### 12.1. Tạo báo cáo thanh khoản

**Bước 1**: Vào menu Báo cáo thanh khoản
**Bước 2**: Click "Tạo mới"

| Trường | Yêu cầu |
|--------|---------|
| Hợp đồng | Chọn hợp đồng |
| Từ ngày | Bắt đầu kỳ báo cáo |
| Đến ngày | Kết thúc kỳ báo cáo |

**Bước 3**: Click "Tạo báo cáo"

### 12.2. Nội dung báo cáo

**1. Tổng NPL nhập**
- Tổng số lượng NPL trong kỳ (từ hóa đơn nhập)

**2. Tổng sản phẩm xuất**
- Tổng số lượng SP xuất khẩu trong kỳ

**3. Tổng NPL sử dụng**
```
= Σ (Số lượng SP xuất × Định mức NPL/SP)
```

**Ví dụ**:
- Xuất 800 SP, định mức 1.5 kg/SP
- NPL sử dụng = 800 × 1.5 = 1200 kg

**4. Tồn NPL**
```
= Tổng NPL nhập - Tổng NPL đã sử dụng
```

### 12.3. Kết luận thanh khoản

| Kết luận | Điều kiện |
|----------|-----------|
| Hợp lệ (HopLe) | Tồn NPL ≥ 0 |
| Cảnh báo (CanhBao) | Cảnh báo |
| Vi phạm (ViPham) | Tồn NPL < 0 (sử dụng nhiều hơn nhập) |

### 12.4. Xuất báo cáo

- **Xuất PDF**: Click "Xuất PDF" → Tải file
- **Xuất Excel**: Click "Xuất Excel" → Tải file

---

## 13. CÁC THAO TÁC THƯỜNG DÙNG

### 13.1. Tìm kiếm

- Sử dụng ô tìm kiếm trên mỗi trang
- Tìm theo mã, tên, ngày

### 13.2. Lọc

- Lọc theo ngày, trạng thái, loại
- Sử dụng bộ lọc (filter)

### 13.3. Sắp xếp

- Click vào cột tiêu đề để sắp xếp
- Click lần 2 để đảo ngược

### 13.4. Export dữ liệu

**Xuất Excel**:
1. Chọn dữ liệu cần xuất
2. Click "Xuất Excel"
3. File được tải về

**Xuất PDF**:
1. Chọn dữ liệu cần xuất
2. Click "Xuất PDF"
3. File được tải về

### 13.5. Import dữ liệu

1. Chuẩn bị file Excel theo template
2. Click "Import"
3. Upload file
4. Kiểm tra dữ liệu preview
5. Click "Lưu"

### 13.6. In ấn

1. Click "In" hoặc Ctrl+P
2. Xem trước khi in
3. Chọn máy in

### 13.7. Xem lịch sử thao tác

Mỗi thao tác được ghi lại trong hệ thống:
- Ai làm
- Làm gì
- Khi nào

---

## 14. GIẢI QUYẾT SỰ CỐ

| Vấn đề | Nguyên nhân | Cách giải quyết |
|--------|------------|----------------|
| Không đăng nhập được | Sai mật khẩu | Liên hệ admin reset |
| | Tài khoản bị khóa | Liên hệ admin mở khóa |
| Không thấy dữ liệu | Chưa có dữ liệu | Tạo mới dữ liệu |
| | Quyền hạn chế | Liên hệ admin cấp quyền |
| Không lưu được | Validation lỗi | Kiểm tra các trường bắt buộc |
| | Trùng mã unique | Đổi mã khác |
| Tồn kho âm | Phiếu xuất nhiều hơn nhập | Kiểm tra phiếu nhập |
| | Lỗi nhập liệu | Kiểm tra lại số liệu |
| Đối soát không khớp | Số liệu tờ khai sai | Kiểm tra tờ khai |
| | Số liệu phiếu kho sai | Kiểm tra phiếu kho |
| Import lỗi | File sai template | Tải template và làm đúng |
| | Dữ liệu trùng | Xóa dữ liệu trùng |
| Báo cáo thanh khoản lỗi | Chưa có định mức | Thêm định mức cho SP |
| | Chưa có HD nhập/xuất | Kiểm tra hóa đơn |

### 14.1. Liên hệ hỗ trợ

| Kênh | Thông tin |
|------|----------|
| Email | support@xuatnhapkhau.com |
| Điện thoại | 1900xxxx |
| Ticket | Tạo ticket trong hệ thống |

---

## PHỤ LỤC

### A. DANH MỤC TRẠNG THÁI

**Tờ khai**:
- ChoXuLy, ChoDuyet, ThongQuan, KiemTraHoSo, KiemTraThucTe, TaiXuat, TichThu

**Lô hàng**:
- ChoXuLy, DangVanChuyen, DaNhapKho, HoanThanh

**Phiếu nhập/xuất kho**:
- ChoXuLy, DaHoanThanh, Huy

**Hợp đồng**:
- ChoXuLy, DangThucHien, HoanThanh, Huy

### B. DANH MỤC MÃ TỜ KHAI

| Mã | Tên | Loại |
|----|-----|------|
| G11 | Nhập khẩu thông thường | Nhập |
| G12 | Nhập khẩu ưu đãi | Nhập |
| G13 | Tạm nhập tái xuất | Nhập |
| G14 | Chuyển khẩu | Nhập |
| G51 | Tái nhập | Nhập |
| G21 | Xuất khẩu thông thường | Xuất |
| G22 | Xuất khẩu ưu đãi | Xuất |
| G31 | Tạm xuất tái nhập | Xuất |
| G32 | Chuyển khẩu | Xuất |

---

**Version**: 1.0
**Ngày cập nhật**: 17/04/2026
**Liên hệ hỗ trợ**: support@xuatnhapkhau.com