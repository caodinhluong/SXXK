'use strict';

require('dotenv').config({ path: __dirname + '/../../Backend/.env' });

const db = require('./models');
const DoanhNghiep = db.DoanhNghiep;
const Kho = db.Kho;
const SanPham = db.SanPham;
const NguyenPhuLieu = db.NguyenPhuLieu;
const HopDong = db.HopDong;
const LoHang = db.LoHang;
const DonViTinhHQ = db.DonViTinhHQ;
const TienTe = db.TienTe;
const QuyDoiNPL = db.QuyDoiNPL;
const DinhMucSanPham = db.DinhMucSanPham;
const HoaDonNhap = db.HoaDonNhap;
const NhapKhoNPL = db.NhapKhoNPL;
const NhapKhoNPLChiTiet = db.NhapKhoNPLChiTiet;
const XuatKhoNPL = db.XuatKhoNPL;
const PhieuSanXuat = db.PhieuSanXuat;
const NhapKhoSP = db.NhapKhoSP;

const seedBusinessData = async () => {
    try {
        // 1. Get or create DoanhNghiep (Company)
        console.log('📦 Tìm/Tạo Doanh nghiệp...');
        let dn = await DoanhNghiep.findOne({ where: { ma_so_thue: '0312345678' } });
        if (!dn) {
            dn = await DoanhNghiep.create({
                ten_dn: 'Công ty TNHH Sản xuất Thương mại ABC',
                ma_so_thue: '0312345678',
                dia_chi: '123 Đường Nguyễn Trãi, Quận 1, TP.HCM',
                email: 'info@abccorp.vn',
                sdt: '02838234567',
                mat_khau: 'admin123',
                status: 'APPROVED',
            });
            console.log(`✅ Created: ${dn.ten_dn}`);
        } else {
            console.log(`⏭️  Already exists: ${dn.ten_dn} (ID: ${dn.id_dn})`);
        }
        const dnId = dn.id_dn;

        // // Check if data already exists, if so skip
        // const existingProducts = await SanPham.count({ where: { id_dn: dnId } });
        // if (existingProducts > 0) {
        //     console.log('⚠️  Dữ liệu đã tồn tại! Tạm dừng để tránh trùng lặp.');
        //     process.exit();
        // }

        // 2. Create Warehouses (Kho)
        console.log('📦 Tạo Kho...');
        const khos = await Promise.all([
            Kho.create({ id_dn: dnId, ten_kho: 'Kho Nguyên liệu chính', loai_kho: 'NguyenLieu', dia_chi: 'Khu công nghiệp Linh Xuân, TP.HCM' }),
            Kho.create({ id_dn: dnId, ten_kho: 'Kho Thành phẩm', loai_kho: 'ThanhPham', dia_chi: 'Khu công nghiệp Linh Xuân, TP.HCM' }),
            Kho.create({ id_dn: dnId, ten_kho: 'Kho Xuất khẩu', loai_kho: 'TongHop', dia_chi: 'Cảng Sài Gòn, TP.HCM' }),
            Kho.create({ id_dn: dnId, ten_kho: 'Kho Linh kiện điện tử', loai_kho: 'NguyenLieu', dia_chi: 'Khu chế xuất Tân Thuận, TP.HCM' }),
            Kho.create({ id_dn: dnId, ten_kho: 'Kho Bao bì', loai_kho: 'NguyenLieu', dia_chi: 'Quận Bình Tân, TP.HCM' }),
            Kho.create({ id_dn: dnId, ten_kho: 'Kho Hàng đại lý', loai_kho: 'TongHop', dia_chi: 'Khu logistics Bình Dương' }),
        ]);
        console.log(`✅ Created ${khos.length} warehouses`);

        const khoNPL = khos[0].id_kho;
        const khoSP = khos[1].id_kho;

        // 3. Get currency and unit IDs
        const vnd = await TienTe.findOne({ where: { ma_tt: 'VND' } });
        const usd = await TienTe.findOne({ where: { ma_tt: 'USD' } });
        const kg = await DonViTinhHQ.findOne({ where: { ma_dvt: 'kg' } });
        const cai = await DonViTinhHQ.findOne({ where: { ma_dvt: 'cái' } });
        const thung = await DonViTinhHQ.findOne({ where: { ma_dvt: 'thùng' } });

        const id_tt_vnd = vnd.id_tt;
        const id_tt_usd = usd.id_tt;
        const id_dvt_kg = kg.id_dvt_hq;
        const id_dvt_cai = cai.id_dvt_hq;
        const id_dvt_thung = thung.id_dvt_hq;

        // 4. Create SanPham (Products)
        console.log('📦 Tạo Sản phẩm...');
        const sanPhams = await Promise.all([
            SanPham.create({ id_dn: dnId, id_dvt_hq: id_dvt_cai, id_tt: id_tt_usd, ma_sp: 'SP001', ten_sp: 'Linh kiện điện tử PCB-A', mo_ta: 'Bo mạch in điện tử loại A', quy_cach: '100x150mm' }),
            SanPham.create({ id_dn: dnId, id_dvt_hq: id_dvt_cai, id_tt: id_tt_usd, ma_sp: 'SP002', ten_sp: 'Linh kiện điện tử PCB-B', mo_ta: 'Bo mạch in điện tử loại B', quy_cach: '80x120mm' }),
            SanPham.create({ id_dn: dnId, id_dvt_hq: id_dvt_thung, id_tt: id_tt_usd, ma_sp: 'SP003', ten_sp: 'Bộ Kit điện tử DIY', mo_ta: 'Bộ linh kiện DIY hoàn chỉnh', quy_cach: '20x30x40cm' }),
            SanPham.create({ id_dn: dnId, id_dvt_hq: id_dvt_cai, id_tt: id_tt_usd, ma_sp: 'SP004', ten_sp: 'Đồng hồ điện tử DT-01', mo_ta: 'Đồng hồ hiển thị điện tử', quy_cach: '50x70mm' }),
            SanPham.create({ id_dn: dnId, id_dvt_hq: id_dvt_cai, id_tt: id_tt_usd, ma_sp: 'SP005', ten_sp: 'Cảm biến nhiệt độ SENSOR-T1', mo_ta: 'Cảm biến nhiệt độ công nghiệp', quy_cach: '30x30x10mm' }),
            SanPham.create({ id_dn: dnId, id_dvt_hq: id_dvt_cai, id_tt: id_tt_usd, ma_sp: 'SP006', ten_sp: 'Bộ nguồn Switching 12V/2A', mo_ta: 'Bộ nguồn chuyển mạch công suất cao', quy_cach: '85x45x35mm' }),
            SanPham.create({ id_dn: dnId, id_dvt_hq: id_dvt_cai, id_tt: id_tt_usd, ma_sp: 'SP007', ten_sp: 'Module Wifi ESP8266', mo_ta: 'Modulewifi giao tiếp UART', quy_cach: '25x25x3mm' }),
            SanPham.create({ id_dn: dnId, id_dvt_hq: id_dvt_cai, id_tt: id_tt_usd, ma_sp: 'SP008', ten_sp: 'Module Bluetooth HC-05', mo_ta: 'Module Bluetooth SPP', quy_cach: '27x13x2mm' }),
            SanPham.create({ id_dn: dnId, id_dvt_hq: id_dvt_cai, id_tt: id_tt_usd, ma_sp: 'SP009', ten_sp: 'Màn hình LCD 16x2', mo_ta: 'Màn hình LCD hiển thị ký tự', quy_cach: '80x36x10mm' }),
            SanPham.create({ id_dn: dnId, id_dvt_hq: id_dvt_cai, id_tt: id_tt_usd, ma_sp: 'SP010', ten_sp: 'Màn hình OLED 0.96 inch', mo_ta: 'Màn hình OLED giao tiếp I2C', quy_cach: '27x27x4mm' }),
            SanPham.create({ id_dn: dnId, id_dvt_hq: id_dvt_cai, id_tt: id_tt_usd, ma_sp: 'SP011', ten_sp: 'Loa Buzzerr 5V', mo_ta: 'Loa báo hiệu âm thanh', quy_cach: '12x9.5x9mm' }),
            SanPham.create({ id_dn: dnId, id_dvt_hq: id_dvt_cai, id_tt: id_tt_usd, ma_sp: 'SP012', ten_sp: 'Relay 5V SRD-05VDC', mo_ta: 'Relay công suất nhỏ', quy_cach: '20x15x15mm' }),
            SanPham.create({ id_dn: dnId, id_dvt_hq: id_dvt_cai, id_tt: id_tt_usd, ma_sp: 'SP013', ten_sp: 'Jack DC 5.5x2.1mm', mo_ta: 'Jack cắm nguồn DC', quy_cach: '14x11x8mm' }),
            SanPham.create({ id_dn: dnId, id_dvt_hq: id_dvt_cai, id_tt: id_tt_usd, ma_sp: 'SP014', ten_sp: 'USB Type-A Female', mo_ta: 'Cổng USB Type-A chân cắm', quy_cach: '14x12x8mm' }),
            SanPham.create({ id_dn: dnId, id_dvt_hq: id_dvt_cai, id_tt: id_tt_usd, ma_sp: 'SP015', ten_sp: 'Pin sạc Lithium 18650', mo_ta: 'Pin sạc Lithium 3.7V 2600mAh', quy_cach: '18x65mm' }),
        ]);
        console.log(`✅ Created ${sanPhams.length} products`);

        // 5. Create NguyenPhuLieu (Raw Materials)
        console.log('📦 Tạo Nguyên phụ liệu...');
        const nguyenLieus = await Promise.all([
            NguyenPhuLieu.create({ id_dn: dnId, id_dvt_hq: id_dvt_kg, id_tt: id_tt_vnd, ma_phan_loai: 'NPL001', ten_npl: 'Nhựa ABS nguyên sinh', mo_ta: 'Nhựa ABS hạt màu trắng', quy_cach: '25kg/bao', gia_mua: 45000 }),
            NguyenPhuLieu.create({ id_dn: dnId, id_dvt_hq: id_dvt_kg, id_tt: id_tt_vnd, ma_phan_loai: 'NPL002', ten_npl: 'Nhựa PVC hạt', mo_ta: 'Nhựa PVC dẻo hạt', quy_cach: '25kg/bao', gia_mua: 38000 }),
            NguyenPhuLieu.create({ id_dn: dnId, id_dvt_hq: id_dvt_kg, id_tt: id_tt_vnd, ma_phan_loai: 'NPL003', ten_npl: 'Đồng phôi tròn', mo_ta: 'Đồng phôi tròn đường kính 8mm', quy_cach: '10kg/cuộn', gia_mua: 380000 }),
            NguyenPhuLieu.create({ id_dn: dnId, id_dvt_hq: id_dvt_kg, id_tt: id_tt_vnd, ma_phan_loai: 'NPL004', ten_npl: 'Nhôm lá', mo_ta: 'Nhôm lá dày 0.1mm', quy_cach: '5kg/cuộn', gia_mua: 120000 }),
            NguyenPhuLieu.create({ id_dn: dnId, id_dvt_hq: id_dvt_cai, id_tt: id_tt_vnd, ma_phan_loai: 'NPL005', ten_npl: 'IC AT89C51', mo_ta: 'Vi xử lý 8-bit', quy_cach: '100 con/hộp', gia_mua: 15000 }),
            NguyenPhuLieu.create({ id_dn: dnId, id_dvt_hq: id_dvt_cai, id_tt: id_tt_vnd, ma_phan_loai: 'NPL006', ten_npl: 'IC LM7805', mo_ta: 'IC ổn áp 5V', quy_cach: '100 con/hộp', gia_mua: 5000 }),
            NguyenPhuLieu.create({ id_dn: dnId, id_dvt_hq: id_dvt_cai, id_tt: id_tt_vnd, ma_phan_loai: 'NPL007', ten_npl: 'Điện trở 10K Ohm', mo_ta: 'Điện trở SMD 0805', quy_cach: '1000 con/trống', gia_mua: 500 }),
            NguyenPhuLieu.create({ id_dn: dnId, id_dvt_hq: id_dvt_cai, id_tt: id_tt_vnd, ma_phan_loai: 'NPL008', ten_npl: 'Tụ điện 100uF 25V', mo_ta: 'Tụ hóa 100uF 25V', quy_cach: '500 con/hộp', gia_mua: 2000 }),
            NguyenPhuLieu.create({ id_dn: dnId, id_dvt_hq: id_dvt_kg, id_tt: id_tt_vnd, ma_phan_loai: 'NPL009', ten_npl: 'Nhựa PP nguyên sinh', mo_ta: 'Nhựa PP hạt trong suốt', quy_cach: '25kg/bao', gia_mua: 52000 }),
            NguyenPhuLieu.create({ id_dn: dnId, id_dvt_hq: id_dvt_kg, id_tt: id_tt_vnd, ma_phan_loai: 'NPL010', ten_npl: 'Nhựa PC trong suốt', mo_ta: 'Nhựa Polycarbonate trong', quy_cach: '25kg/bao', gia_mua: 85000 }),
            NguyenPhuLieu.create({ id_dn: dnId, id_dvt_hq: id_dvt_kg, id_tt: id_tt_vnd, ma_phan_loai: 'NPL011', ten_npl: 'Thép không gỉ lá', mo_ta: 'Thép không gỉ SUS304 dày 0.3mm', quy_cach: '5kg/cuộn', gia_mua: 180000 }),
            NguyenPhuLieu.create({ id_dn: dnId, id_dvt_hq: id_dvt_kg, id_tt: id_tt_vnd, ma_phan_loai: 'NPL012', ten_npl: 'Đồng dây tròn', mo_ta: 'Đồng dây đường kính 1mm', quy_cach: '10kg/cuộn', gia_mua: 420000 }),
            NguyenPhuLieu.create({ id_dn: dnId, id_dvt_hq: id_dvt_cai, id_tt: id_tt_vnd, ma_phan_loai: 'NPL013', ten_npl: 'IC ATmega328P', mo_ta: 'Vi xử lý AVR 8-bit', quy_cach: '50 con/hộp', gia_mua: 45000 }),
            NguyenPhuLieu.create({ id_dn: dnId, id_dvt_hq: id_dvt_cai, id_tt: id_tt_vnd, ma_phan_loai: 'NPL014', ten_npl: 'IC ESP32-WROOM', mo_ta: 'Vi xử lý WiFi/BT dual-core', quy_cach: '50 con/hộp', gia_mua: 65000 }),
            NguyenPhuLieu.create({ id_dn: dnId, id_dvt_hq: id_dvt_cai, id_tt: id_tt_vnd, ma_phan_loai: 'NPL015', ten_npl: 'IC STM32F103C8T6', mo_ta: 'Vi xử lý ARM Cortex-M3', quy_cach: '50 con/hộp', gia_mua: 35000 }),
            NguyenPhuLieu.create({ id_dn: dnId, id_dvt_hq: id_dvt_cai, id_tt: id_tt_vnd, ma_phan_loai: 'NPL016', ten_npl: 'Điện trở 220 Ohm 1/4W', mo_ta: 'Điện trở than 220 Ohm', quy_cach: '1000 con/trống', gia_mua: 300 }),
            NguyenPhuLieu.create({ id_dn: dnId, id_dvt_hq: id_dvt_cai, id_tt: id_tt_vnd, ma_phan_loai: 'NPL017', ten_npl: 'Điện trở 1K Ohm 1/4W', mo_ta: 'Điện trở than 1K Ohm', quy_cach: '1000 con/trống', gia_mua: 300 }),
            NguyenPhuLieu.create({ id_dn: dnId, id_dvt_hq: id_dvt_cai, id_tt: id_tt_vnd, ma_phan_loai: 'NPL018', ten_npl: 'Tụ gốm 104 50V', mo_ta: 'Tụ gốm 0.1uF 50V', quy_cach: '1000 con/trống', gia_mua: 800 }),
            NguyenPhuLieu.create({ id_dn: dnId, id_dvt_hq: id_dvt_cai, id_tt: id_tt_vnd, ma_phan_loai: 'NPL019', ten_npl: 'Tụ hóa 470uF 25V', mo_ta: 'Tụ hóa 470uF 25V', quy_cach: '200 con/hộp', gia_mua: 3500 }),
            NguyenPhuLieu.create({ id_dn: dnId, id_dvt_hq: id_dvt_cai, id_tt: id_tt_vnd, ma_phan_loai: 'NPL020', ten_npl: 'Diode 1N4007', mo_ta: 'Diode chỉnh lưu 1A', quy_cach: '1000 con/trống', gia_mua: 400 }),
        ]);
        console.log(`✅ Created ${nguyenLieus.length} raw materials`);

        // 6. Create HopDong (Contracts)
        console.log('📦 Tạo Hợp đồng...');
        const hopDongs = await Promise.all([
            HopDong.create({ id_dn: dnId, id_tt: id_tt_usd, id_sp: sanPhams[0].id_sp, so_hd: 'HD2026-001', ngay_ky: '2026-01-10', ngay_hieu_luc: '2026-01-15', ngay_het_han: '2026-12-31', gia_tri: 500000, ten_doi_tac: 'Công ty Xuất nhập khẩu Tech' }),
            HopDong.create({ id_dn: dnId, id_tt: id_tt_usd, id_sp: sanPhams[1].id_sp, so_hd: 'HD2026-002', ngay_ky: '2026-02-01', ngay_hieu_luc: '2026-02-05', ngay_het_han: '2026-06-30', gia_tri: 300000, ten_doi_tac: 'Công ty Điện tử Hoàng Gia' }),
            HopDong.create({ id_dn: dnId, id_tt: id_tt_usd, id_sp: sanPhams[2].id_sp, so_hd: 'HD2026-003', ngay_ky: '2026-02-15', ngay_hieu_luc: '2026-02-20', ngay_het_han: '2026-12-20', gia_tri: 200000, ten_doi_tac: 'Trung tâm Đào tạo STEM' }),
            HopDong.create({ id_dn: dnId, id_tt: id_tt_vnd, id_sp: sanPhams[3].id_sp, so_hd: 'HD2026-004', ngay_ky: '2026-03-01', ngay_hieu_luc: '2026-03-05', ngay_het_han: '2026-09-30', gia_tri: 150000000, ten_doi_tac: 'Công ty M&E Việt Nam' }),
            HopDong.create({ id_dn: dnId, id_tt: id_tt_usd, id_sp: sanPhams[5].id_sp, so_hd: 'HD2026-005', ngay_ky: '2026-01-15', ngay_hieu_luc: '2026-01-20', ngay_het_han: '2026-12-31', gia_tri: 250000, ten_doi_tac: 'Công ty Điện tử Quốc Việt' }),
            HopDong.create({ id_dn: dnId, id_tt: id_tt_usd, id_sp: sanPhams[6].id_sp, so_hd: 'HD2026-006', ngay_ky: '2026-02-10', ngay_hieu_luc: '2026-02-15', ngay_het_han: '2026-08-15', gia_tri: 180000, ten_doi_tac: 'Công ty IoT Việt Nam' }),
            HopDong.create({ id_dn: dnId, id_tt: id_tt_usd, id_sp: sanPhams[7].id_sp, so_hd: 'HD2026-007', ngay_ky: '2026-02-20', ngay_hieu_luc: '2026-02-25', ngay_het_han: '2026-10-20', gia_tri: 150000, ten_doi_tac: 'Trung tâm Nghiên cứu Điện tử' }),
            HopDong.create({ id_dn: dnId, id_tt: id_tt_usd, id_sp: sanPhams[8].id_sp, so_hd: 'HD2026-008', ngay_ky: '2026-03-05', ngay_hieu_luc: '2026-03-10', ngay_het_han: '2026-09-05', gia_tri: 120000, ten_doi_tac: 'Công ty Hi-tech Sài Gòn' }),
            HopDong.create({ id_dn: dnId, id_tt: id_tt_usd, id_sp: sanPhams[9].id_sp, so_hd: 'HD2026-009', ngay_ky: '2026-03-10', ngay_hieu_luc: '2026-03-15', ngay_het_han: '2026-12-31', gia_tri: 95000, ten_doi_tac: 'Công ty Smart Home VN' }),
            HopDong.create({ id_dn: dnId, id_tt: id_tt_usd, id_sp: sanPhams[10].id_sp, so_hd: 'HD2026-010', ngay_ky: '2026-03-15', ngay_hieu_luc: '2026-03-20', ngay_het_han: '2026-11-15', gia_tri: 85000, ten_doi_tac: 'Trường ĐH Bách Khoa TP.HCM' }),
            HopDong.create({ id_dn: dnId, id_tt: id_tt_usd, id_sp: sanPhams[11].id_sp, so_hd: 'HD2026-011', ngay_ky: '2026-03-20', ngay_hieu_luc: '2026-03-25', ngay_het_han: '2026-12-20', gia_tri: 220000, ten_doi_tac: 'Công ty Tự động hóa Minh Châu' }),
            HopDong.create({ id_dn: dnId, id_tt: id_tt_vnd, id_sp: sanPhams[14].id_sp, so_hd: 'HD2026-012', ngay_ky: '2026-03-25', ngay_hieu_luc: '2026-03-30', ngay_het_han: '2026-10-25', gia_tri: 80000000, ten_doi_tac: 'Công ty Pin Năng lượng Xanh' }),
        ]);
        console.log(`✅ Created ${hopDongs.length} contracts`);

        // 7. Create LoHang (Shipments)
        console.log('📦 Tạo Lô hàng...');
        const loHangs = await Promise.all([
            LoHang.create({ id_hd: hopDongs[0].id_hd, so_lo: 'LH2026-001', ngay_lo: '2026-02-15', so_luong: 5000 }),
            LoHang.create({ id_hd: hopDongs[0].id_hd, so_lo: 'LH2026-002', ngay_lo: '2026-03-10', so_luong: 5000 }),
            LoHang.create({ id_hd: hopDongs[1].id_hd, so_lo: 'LH2026-003', ngay_lo: '2026-02-20', so_luong: 2500 }),
            LoHang.create({ id_hd: hopDongs[1].id_hd, so_lo: 'LH2026-004', ngay_lo: '2026-03-15', so_luong: 2500 }),
            LoHang.create({ id_hd: hopDongs[2].id_hd, so_lo: 'LH2026-005', ngay_lo: '2026-03-01', so_luong: 1000 }),
            LoHang.create({ id_hd: hopDongs[3].id_hd, so_lo: 'LH2026-006', ngay_lo: '2026-03-05', so_luong: 1500 }),
            LoHang.create({ id_hd: hopDongs[4].id_hd, so_lo: 'LH2026-007', ngay_lo: '2026-02-25', so_luong: 3000 }),
            LoHang.create({ id_hd: hopDongs[4].id_hd, so_lo: 'LH2026-008', ngay_lo: '2026-03-20', so_luong: 3500 }),
            LoHang.create({ id_hd: hopDongs[5].id_hd, so_lo: 'LH2026-009', ngay_lo: '2026-03-01', so_luong: 2000 }),
            LoHang.create({ id_hd: hopDongs[5].id_hd, so_lo: 'LH2026-010', ngay_lo: '2026-03-25', so_luong: 2000 }),
            LoHang.create({ id_hd: hopDongs[6].id_hd, so_lo: 'LH2026-011', ngay_lo: '2026-03-05', so_luong: 1800 }),
            LoHang.create({ id_hd: hopDongs[7].id_hd, so_lo: 'LH2026-012', ngay_lo: '2026-03-10', so_luong: 1500 }),
            LoHang.create({ id_hd: hopDongs[8].id_hd, so_lo: 'LH2026-013', ngay_lo: '2026-03-15', so_luong: 1200 }),
            LoHang.create({ id_hd: hopDongs[8].id_hd, so_lo: 'LH2026-014', ngay_lo: '2026-04-01', so_luong: 1200 }),
            LoHang.create({ id_hd: hopDongs[9].id_hd, so_lo: 'LH2026-015', ngay_lo: '2026-03-20', so_luong: 1000 }),
            LoHang.create({ id_hd: hopDongs[10].id_hd, so_lo: 'LH2026-016', ngay_lo: '2026-03-25', so_luong: 800 }),
            LoHang.create({ id_hd: hopDongs[11].id_hd, so_lo: 'LH2026-017', ngay_lo: '2026-04-01', so_luong: 2500 }),
            LoHang.create({ id_hd: hopDongs[11].id_hd, so_lo: 'LH2026-018', ngay_lo: '2026-04-10', so_luong: 2500 }),
        ]);
        console.log(`✅ Created ${loHangs.length} shipments`);

        // 8. Create QuyDoiNPL (Raw Material Unit Conversion)
        console.log('📦 Tạo Quy đổi đơn vị nguyên phụ liệu...');
        const quyDoiNPLs = await Promise.all([
            QuyDoiNPL.create({ id_dn: dnId, id_npl: nguyenLieus[0].id_npl, ten_dvt_dn: 'Bao', id_dvt_hq: id_dvt_kg, he_so: 25 }),
            QuyDoiNPL.create({ id_dn: dnId, id_npl: nguyenLieus[1].id_npl, ten_dvt_dn: 'Bao', id_dvt_hq: id_dvt_kg, he_so: 25 }),
            QuyDoiNPL.create({ id_dn: dnId, id_npl: nguyenLieus[2].id_npl, ten_dvt_dn: 'Cuộn', id_dvt_hq: id_dvt_kg, he_so: 10 }),
            QuyDoiNPL.create({ id_dn: dnId, id_npl: nguyenLieus[3].id_npl, ten_dvt_dn: 'Cuộn', id_dvt_hq: id_dvt_kg, he_so: 5 }),
            QuyDoiNPL.create({ id_dn: dnId, id_npl: nguyenLieus[4].id_npl, ten_dvt_dn: 'Hộp', id_dvt_hq: id_dvt_cai, he_so: 100 }),
            QuyDoiNPL.create({ id_dn: dnId, id_npl: nguyenLieus[5].id_npl, ten_dvt_dn: 'Hộp', id_dvt_hq: id_dvt_cai, he_so: 100 }),
            QuyDoiNPL.create({ id_dn: dnId, id_npl: nguyenLieus[6].id_npl, ten_dvt_dn: 'Trống', id_dvt_hq: id_dvt_cai, he_so: 1000 }),
            QuyDoiNPL.create({ id_dn: dnId, id_npl: nguyenLieus[7].id_npl, ten_dvt_dn: 'Hộp', id_dvt_hq: id_dvt_cai, he_so: 500 }),
            QuyDoiNPL.create({ id_dn: dnId, id_npl: nguyenLieus[8].id_npl, ten_dvt_dn: 'Bao', id_dvt_hq: id_dvt_kg, he_so: 25 }),
            QuyDoiNPL.create({ id_dn: dnId, id_npl: nguyenLieus[9].id_npl, ten_dvt_dn: 'Bao', id_dvt_hq: id_dvt_kg, he_so: 25 }),
            QuyDoiNPL.create({ id_dn: dnId, id_npl: nguyenLieus[10].id_npl, ten_dvt_dn: 'Cuộn', id_dvt_hq: id_dvt_kg, he_so: 5 }),
            QuyDoiNPL.create({ id_dn: dnId, id_npl: nguyenLieus[11].id_npl, ten_dvt_dn: 'Cuộn', id_dvt_hq: id_dvt_kg, he_so: 10 }),
            QuyDoiNPL.create({ id_dn: dnId, id_npl: nguyenLieus[12].id_npl, ten_dvt_dn: 'Hộp', id_dvt_hq: id_dvt_cai, he_so: 50 }),
            QuyDoiNPL.create({ id_dn: dnId, id_npl: nguyenLieus[13].id_npl, ten_dvt_dn: 'Hộp', id_dvt_hq: id_dvt_cai, he_so: 50 }),
            QuyDoiNPL.create({ id_dn: dnId, id_npl: nguyenLieus[14].id_npl, ten_dvt_dn: 'Hộp', id_dvt_hq: id_dvt_cai, he_so: 50 }),
            QuyDoiNPL.create({ id_dn: dnId, id_npl: nguyenLieus[15].id_npl, ten_dvt_dn: 'Trống', id_dvt_hq: id_dvt_cai, he_so: 1000 }),
            QuyDoiNPL.create({ id_dn: dnId, id_npl: nguyenLieus[16].id_npl, ten_dvt_dn: 'Trống', id_dvt_hq: id_dvt_cai, he_so: 1000 }),
            QuyDoiNPL.create({ id_dn: dnId, id_npl: nguyenLieus[17].id_npl, ten_dvt_dn: 'Trống', id_dvt_hq: id_dvt_cai, he_so: 1000 }),
            QuyDoiNPL.create({ id_dn: dnId, id_npl: nguyenLieus[18].id_npl, ten_dvt_dn: 'Hộp', id_dvt_hq: id_dvt_cai, he_so: 200 }),
            QuyDoiNPL.create({ id_dn: dnId, id_npl: nguyenLieus[19].id_npl, ten_dvt_dn: 'Trống', id_dvt_hq: id_dvt_cai, he_so: 1000 }),
        ]);
        console.log(`✅ Created ${quyDoiNPLs.length} unit conversions`);

        // 9. Create DinhMucSanPham (Product Standards)
        console.log('📦 Tạo Định mức sản phẩm...');
        const dinhMucSPs = await Promise.all([
            DinhMucSanPham.create({ id_sp: sanPhams[0].id_sp, id_npl: nguyenLieus[0].id_npl, so_luong: 0.5 }),
            DinhMucSanPham.create({ id_sp: sanPhams[0].id_sp, id_npl: nguyenLieus[4].id_npl, so_luong: 2 }),
            DinhMucSanPham.create({ id_sp: sanPhams[0].id_sp, id_npl: nguyenLieus[6].id_npl, so_luong: 10 }),
            DinhMucSanPham.create({ id_sp: sanPhams[1].id_sp, id_npl: nguyenLieus[0].id_npl, so_luong: 0.4 }),
            DinhMucSanPham.create({ id_sp: sanPhams[1].id_sp, id_npl: nguyenLieus[4].id_npl, so_luong: 1 }),
            DinhMucSanPham.create({ id_sp: sanPhams[1].id_sp, id_npl: nguyenLieus[6].id_npl, so_luong: 8 }),
            DinhMucSanPham.create({ id_sp: sanPhams[2].id_sp, id_npl: nguyenLieus[0].id_npl, so_luong: 2 }),
            DinhMucSanPham.create({ id_sp: sanPhams[2].id_sp, id_npl: nguyenLieus[4].id_npl, so_luong: 5 }),
            DinhMucSanPham.create({ id_sp: sanPhams[2].id_sp, id_npl: nguyenLieus[12].id_npl, so_luong: 1 }),
            DinhMucSanPham.create({ id_sp: sanPhams[3].id_sp, id_npl: nguyenLieus[1].id_npl, so_luong: 1 }),
            DinhMucSanPham.create({ id_sp: sanPhams[3].id_sp, id_npl: nguyenLieus[5].id_npl, so_luong: 2 }),
            DinhMucSanPham.create({ id_sp: sanPhams[3].id_sp, id_npl: nguyenLieus[7].id_npl, so_luong: 5 }),
            DinhMucSanPham.create({ id_sp: sanPhams[4].id_sp, id_npl: nguyenLieus[2].id_npl, so_luong: 0.2 }),
            DinhMucSanPham.create({ id_sp: sanPhams[4].id_sp, id_npl: nguyenLieus[13].id_npl, so_luong: 1 }),
            DinhMucSanPham.create({ id_sp: sanPhams[5].id_sp, id_npl: nguyenLieus[1].id_npl, so_luong: 3 }),
            DinhMucSanPham.create({ id_sp: sanPhams[5].id_sp, id_npl: nguyenLieus[5].id_npl, so_luong: 1 }),
            DinhMucSanPham.create({ id_sp: sanPhams[6].id_sp, id_npl: nguyenLieus[13].id_npl, so_luong: 1 }),
            DinhMucSanPham.create({ id_sp: sanPhams[6].id_sp, id_npl: nguyenLieus[14].id_npl, so_luong: 1 }),
            DinhMucSanPham.create({ id_sp: sanPhams[7].id_sp, id_npl: nguyenLieus[14].id_npl, so_luong: 1 }),
            DinhMucSanPham.create({ id_sp: sanPhams[7].id_sp, id_npl: nguyenLieus[15].id_npl, so_luong: 5 }),
            DinhMucSanPham.create({ id_sp: sanPhams[8].id_sp, id_npl: nguyenLieus[8].id_npl, so_luong: 1 }),
            DinhMucSanPham.create({ id_sp: sanPhams[8].id_sp, id_npl: nguyenLieus[17].id_npl, so_luong: 20 }),
            DinhMucSanPham.create({ id_sp: sanPhams[9].id_sp, id_npl: nguyenLieus[8].id_npl, so_luong: 0.5 }),
            DinhMucSanPham.create({ id_sp: sanPhams[9].id_sp, id_npl: nguyenLieus[17].id_npl, so_luong: 10 }),
            DinhMucSanPham.create({ id_sp: sanPhams[10].id_sp, id_npl: nguyenLieus[7].id_npl, so_luong: 1 }),
            DinhMucSanPham.create({ id_sp: sanPhams[10].id_sp, id_npl: nguyenLieus[18].id_npl, so_luong: 2 }),
            DinhMucSanPham.create({ id_sp: sanPhams[11].id_sp, id_npl: nguyenLieus[5].id_npl, so_luong: 1 }),
            DinhMucSanPham.create({ id_sp: sanPhams[11].id_sp, id_npl: nguyenLieus[11].id_npl, so_luong: 0.1 }),
            DinhMucSanPham.create({ id_sp: sanPhams[12].id_sp, id_npl: nguyenLieus[3].id_npl, so_luong: 0.05 }),
            DinhMucSanPham.create({ id_sp: sanPhams[12].id_sp, id_npl: nguyenLieus[19].id_npl, so_luong: 4 }),
            DinhMucSanPham.create({ id_sp: sanPhams[13].id_sp, id_npl: nguyenLieus[3].id_npl, so_luong: 0.02 }),
            DinhMucSanPham.create({ id_sp: sanPhams[13].id_sp, id_npl: nguyenLieus[19].id_npl, so_luong: 2 }),
            DinhMucSanPham.create({ id_sp: sanPhams[14].id_sp, id_npl: nguyenLieus[9].id_npl, so_luong: 5 }),
            DinhMucSanPham.create({ id_sp: sanPhams[14].id_sp, id_npl: nguyenLieus[10].id_npl, so_luong: 2 }),
        ]);
        console.log(`✅ Created ${dinhMucSPs.length} product standards`);

        // 10. Create HoaDonNhap (Purchase Invoices)
        console.log('📦 Tạo Hóa đơn nhập...');
        const hoaDonNhaps = await Promise.all([
            HoaDonNhap.create({ id_lh: loHangs[0].id_lh, so_hd: 'HDN2026-001', ngay_hd: '2026-02-10', id_tt: id_tt_usd, tong_tien: 125000 }),
            HoaDonNhap.create({ id_lh: loHangs[1].id_lh, so_hd: 'HDN2026-002', ngay_hd: '2026-03-05', id_tt: id_tt_usd, tong_tien: 125000 }),
            HoaDonNhap.create({ id_lh: loHangs[2].id_lh, so_hd: 'HDN2026-003', ngay_hd: '2026-02-18', id_tt: id_tt_usd, tong_tien: 75000 }),
            HoaDonNhap.create({ id_lh: loHangs[4].id_lh, so_hd: 'HDN2026-004', ngay_hd: '2026-02-25', id_tt: id_tt_usd, tong_tien: 90000 }),
            HoaDonNhap.create({ id_lh: loHangs[6].id_lh, so_hd: 'HDN2026-005', ngay_hd: '2026-03-15', id_tt: id_tt_usd, tong_tien: 180000 }),
        ]);
        console.log(`✅ Created ${hoaDonNhaps.length} purchase invoices`);

        // 11. Create NhapKhoNPL (Raw Material Import)
        console.log('📦 Tạo Phiếu nhập kho NPL...');
        const nhapKhoNPLs = await Promise.all([
            NhapKhoNPL.create({ id_kho: khos[0].id_kho, id_hd_nhap: hoaDonNhaps[0].id_hd_nhap, ngay_nhap: '2026-02-12', file_phieu: 'PN-NPL-001.pdf' }),
            NhapKhoNPL.create({ id_kho: khos[0].id_kho, id_hd_nhap: hoaDonNhaps[1].id_hd_nhap, ngay_nhap: '2026-03-07', file_phieu: 'PN-NPL-002.pdf' }),
            NhapKhoNPL.create({ id_kho: khos[0].id_kho, id_hd_nhap: hoaDonNhaps[2].id_hd_nhap, ngay_nhap: '2026-02-20', file_phieu: 'PN-NPL-003.pdf' }),
            NhapKhoNPL.create({ id_kho: khos[3].id_kho, id_hd_nhap: hoaDonNhaps[3].id_hd_nhap, ngay_nhap: '2026-02-28', file_phieu: 'PN-NPL-004.pdf' }),
            NhapKhoNPL.create({ id_kho: khos[3].id_kho, id_hd_nhap: hoaDonNhaps[4].id_hd_nhap, ngay_nhap: '2026-03-18', file_phieu: 'PN-NPL-005.pdf' }),
        ]);
        console.log(`✅ Created ${nhapKhoNPLs.length} raw material import slips`);

        // 12. Create NhapKhoNPLChiTiet (Raw Material Import Details)
        console.log('📦 Tạo Chi tiết nhập kho NPL...');
        const nhapKhoNPLChiTiets = await Promise.all([
            NhapKhoNPLChiTiet.create({ id_nhap: nhapKhoNPLs[0].id_nhap, id_npl: nguyenLieus[0].id_npl, so_luong: 100 }),
            NhapKhoNPLChiTiet.create({ id_nhap: nhapKhoNPLs[0].id_nhap, id_npl: nguyenLieus[4].id_npl, so_luong: 50 }),
            NhapKhoNPLChiTiet.create({ id_nhap: nhapKhoNPLs[0].id_nhap, id_npl: nguyenLieus[6].id_npl, so_luong: 100 }),
            NhapKhoNPLChiTiet.create({ id_nhap: nhapKhoNPLs[1].id_nhap, id_npl: nguyenLieus[1].id_npl, so_luong: 80 }),
            NhapKhoNPLChiTiet.create({ id_nhap: nhapKhoNPLs[1].id_nhap, id_npl: nguyenLieus[5].id_npl, so_luong: 60 }),
            NhapKhoNPLChiTiet.create({ id_nhap: nhapKhoNPLs[2].id_nhap, id_npl: nguyenLieus[2].id_npl, so_luong: 25 }),
            NhapKhoNPLChiTiet.create({ id_nhap: nhapKhoNPLs[2].id_nhap, id_npl: nguyenLieus[12].id_npl, so_luong: 30 }),
            NhapKhoNPLChiTiet.create({ id_nhap: nhapKhoNPLs[3].id_nhap, id_npl: nguyenLieus[13].id_npl, so_luong: 40 }),
            NhapKhoNPLChiTiet.create({ id_nhap: nhapKhoNPLs[4].id_nhap, id_npl: nguyenLieus[14].id_npl, so_luong: 35 }),
            NhapKhoNPLChiTiet.create({ id_nhap: nhapKhoNPLs[4].id_nhap, id_npl: nguyenLieus[15].id_npl, so_luong: 200 }),
        ]);
        console.log(`✅ Created ${nhapKhoNPLChiTiets.length} raw material import details`);

        // 13. Create XuatKhoNPL (Raw Material Export)
        console.log('📦 Tạo Phiếu xuất kho NPL...');
        const xuatKhoNPLs = await Promise.all([
            XuatKhoNPL.create({ id_kho: khos[0].id_kho, ngay_xuat: '2026-02-15', ca_kip: 'Ca 1', file_phieu: 'PX-NPL-001.pdf' }),
            XuatKhoNPL.create({ id_kho: khos[0].id_kho, ngay_xuat: '2026-03-01', ca_kip: 'Ca 2', file_phieu: 'PX-NPL-002.pdf' }),
            XuatKhoNPL.create({ id_kho: khos[3].id_kho, ngay_xuat: '2026-03-10', ca_kip: 'Ca 1', file_phieu: 'PX-NPL-003.pdf' }),
            XuatKhoNPL.create({ id_kho: khos[0].id_kho, ngay_xuat: '2026-03-20', ca_kip: 'Ca 3', file_phieu: 'PX-NPL-004.pdf' }),
            XuatKhoNPL.create({ id_kho: khos[3].id_kho, ngay_xuat: '2026-04-01', ca_kip: 'Ca 2', file_phieu: 'PX-NPL-005.pdf' }),
        ]);
        console.log(`✅ Created ${xuatKhoNPLs.length} raw material export slips`);

        // 14. Create PhieuSanXuat (Production Orders)
        console.log('📦 Tạo Phiếu sản xuất...');
        const phieuSanXuats = await Promise.all([
            PhieuSanXuat.create({ id_dn: dnId, so_phieu: 'PSX2026-001', ngay_sx: '2026-02-15', ca_kip: 'Ca 1', id_xuat_npl: xuatKhoNPLs[0].id_xuat, id_sp: sanPhams[0].id_sp, so_luong_ke_hoach: 500, so_luong_thuc_te: 480, ty_le_hoan_thanh: 96, nguoi_phu_trach: 'Nguyễn Văn A', trang_thai: 'HoanThanh' }),
            PhieuSanXuat.create({ id_dn: dnId, so_phieu: 'PSX2026-002', ngay_sx: '2026-03-01', ca_kip: 'Ca 2', id_xuat_npl: xuatKhoNPLs[1].id_xuat, id_sp: sanPhams[1].id_sp, so_luong_ke_hoach: 300, so_luong_thuc_te: 295, ty_le_hoan_thanh: 98.33, nguoi_phu_trach: 'Trần Thị B', trang_thai: 'HoanThanh' }),
            PhieuSanXuat.create({ id_dn: dnId, so_phieu: 'PSX2026-003', ngay_sx: '2026-03-10', ca_kip: 'Ca 1', id_xuat_npl: xuatKhoNPLs[2].id_xuat, id_sp: sanPhams[2].id_sp, so_luong_ke_hoach: 100, so_luong_thuc_te: 100, ty_le_hoan_thanh: 100, nguoi_phu_trach: 'Lê Văn C', trang_thai: 'HoanThanh' }),
            PhieuSanXuat.create({ id_dn: dnId, so_phieu: 'PSX2026-004', ngay_sx: '2026-03-20', ca_kip: 'Ca 3', id_sp: sanPhams[5].id_sp, so_luong_ke_hoach: 200, so_luong_thuc_te: 190, ty_le_hoan_thanh: 95, nguoi_phu_trach: 'Phạm Thị D', trang_thai: 'HoanThanh' }),
            PhieuSanXuat.create({ id_dn: dnId, so_phieu: 'PSX2026-005', ngay_sx: '2026-04-01', ca_kip: 'Ca 2', id_xuat_npl: xuatKhoNPLs[4].id_xuat, id_sp: sanPhams[6].id_sp, so_luong_ke_hoach: 150, so_luong_thuc_te: 145, ty_le_hoan_thanh: 96.67, nguoi_phu_trach: 'Nguyễn Văn E', trang_thai: 'HoanThanh' }),
            PhieuSanXuat.create({ id_dn: dnId, so_phieu: 'PSX2026-006', ngay_sx: '2026-04-10', ca_kip: 'Ca 1', id_sp: sanPhams[3].id_sp, so_luong_ke_hoach: 80, so_luong_thuc_te: null, ty_le_hoan_thanh: null, nguoi_phu_trach: 'Trần Văn F', trang_thai: 'DangSanXuat' }),
            PhieuSanXuat.create({ id_dn: dnId, so_phieu: 'PSX2026-007', ngay_sx: '2026-04-15', ca_kip: 'Ca 2', id_sp: sanPhams[7].id_sp, so_luong_ke_hoach: 100, so_luong_thuc_te: null, ty_le_hoan_thanh: null, nguoi_phu_trach: 'Lê Thị G', trang_thai: 'KeHoach' }),
        ]);
        console.log(`✅ Created ${phieuSanXuats.length} production orders`);

        // 15. Create NhapKhoSP (Product Import)
        console.log('📦 Tạo Phiếu nhập kho SP...');
        const nhapKhoSPs = await Promise.all([
            NhapKhoSP.create({ id_kho: khos[1].id_kho, id_sx: phieuSanXuats[0].id_sx, ngay_nhap: '2026-02-16', file_phieu: 'PN-SP-001.pdf' }),
            NhapKhoSP.create({ id_kho: khos[1].id_kho, id_sx: phieuSanXuats[1].id_sx, ngay_nhap: '2026-03-02', file_phieu: 'PN-SP-002.pdf' }),
            NhapKhoSP.create({ id_kho: khos[1].id_kho, id_sx: phieuSanXuats[2].id_sx, ngay_nhap: '2026-03-11', file_phieu: 'PN-SP-003.pdf' }),
            NhapKhoSP.create({ id_kho: khos[1].id_kho, id_sx: phieuSanXuats[3].id_sx, ngay_nhap: '2026-03-21', file_phieu: 'PN-SP-004.pdf' }),
            NhapKhoSP.create({ id_kho: khos[2].id_kho, id_sx: phieuSanXuats[4].id_sx, ngay_nhap: '2026-04-02', file_phieu: 'PN-SP-005.pdf' }),
        ]);
        console.log(`✅ Created ${nhapKhoSPs.length} product import slips`);

        console.log('\n🎉 Seed dữ liệu nghiệp vụ hoàn tất!');

    } catch (error) {
        console.error('❌ Lỗi seed:', error);
    }
    process.exit();
};

seedBusinessData();