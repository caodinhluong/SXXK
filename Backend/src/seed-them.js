'use strict';

const db = require('./models');
const DinhMucSanPham = db.DinhMucSanPham;
const QuyDoiDonViSP = db.QuyDoiDonViSP;
const QuyDoiDonViDN = db.QuyDoiDonViDN;
const QuyDoiNPL = db.QuyDoiNPL;
const SanPham = db.SanPham;
const NguyenPhuLieu = db.NguyenPhuLieu;
const DonViTinhHQ = db.DonViTinhHQ;
const HopDong = db.HopDong;
const LoHang = db.LoHang;
const ToKhaiNhap = db.ToKhaiNhap;
const ToKhaiXuat = db.ToKhaiXuat;

const seedMoreData = async () => {
    try {
        // Add columns to LoHang table if not exist
        console.log('📦 Kiểm tra cấu trúc bảng...');
        try { await db.sequelize.query('ALTER TABLE LoHang ADD COLUMN so_lo VARCHAR(50)'); } catch (e) { }
        try { await db.sequelize.query('ALTER TABLE LoHang ADD COLUMN ngay_lo DATE'); } catch (e) { }
        try { await db.sequelize.query('ALTER TABLE LoHang ADD COLUMN so_luong DECIMAL(15,3)'); } catch (e) { }
        try { await db.sequelize.query('ALTER TABLE LoHang ADD COLUMN trang_thai VARCHAR(50)'); } catch (e) { }
        console.log('✅ Cấu trúc bảng sẵn sàng');

        const dn = await db.DoanhNghiep.findOne({ where: { ma_so_thue: '0312345678' } });
        if (!dn) { console.log('❌ Không tìm thấy doanh nghiệp!'); process.exit(); }
        const dnId = dn.id_dn;

        const sp1 = await SanPham.findOne({ where: { ma_sp: 'SP001' } });
        const sp2 = await SanPham.findOne({ where: { ma_sp: 'SP002' } });
        const sp3 = await SanPham.findOne({ where: { ma_sp: 'SP003' } });

        const npl1 = await NguyenPhuLieu.findOne({ where: { ma_phan_loai: 'NPL001' } });
        const npl2 = await NguyenPhuLieu.findOne({ where: { ma_phan_loai: 'NPL002' } });
        const npl3 = await NguyenPhuLieu.findOne({ where: { ma_phan_loai: 'NPL003' } });
        const npl5 = await NguyenPhuLieu.findOne({ where: { ma_phan_loai: 'NPL005' } });
        const npl6 = await NguyenPhuLieu.findOne({ where: { ma_phan_loai: 'NPL006' } });

        const hd1 = await HopDong.findOne({ where: { so_hd: 'HD2026-001' } });

        const kg = await DonViTinhHQ.findOne({ where: { ma_dvt: 'kg' } });
        const cai = await DonViTinhHQ.findOne({ where: { ma_dvt: 'cái' } });
        const thung = await DonViTinhHQ.findOne({ where: { ma_dvt: 'thùng' } });
        const cuon = await DonViTinhHQ.findOne({ where: { ma_dvt: 'cuộn' } });

        // 1. Create Định mức sản phẩm
        console.log('📦 Tạo Định mức sản phẩm...');
        const dinhMuc = await Promise.all([
            DinhMucSanPham.create({ id_dn: dnId, id_sp: sp1.id_sp, id_npl: npl1.id_npl, so_luong: 0.15, don_vi_tinh: 'kg' }),
            DinhMucSanPham.create({ id_dn: dnId, id_sp: sp1.id_sp, id_npl: npl5.id_npl, so_luong: 2, don_vi_tinh: 'cái' }),
            DinhMucSanPham.create({ id_dn: dnId, id_sp: sp1.id_sp, id_npl: npl6.id_npl, so_luong: 5, don_vi_tinh: 'cái' }),
            DinhMucSanPham.create({ id_dn: dnId, id_sp: sp2.id_sp, id_npl: npl2.id_npl, so_luong: 0.12, don_vi_tinh: 'kg' }),
            DinhMucSanPham.create({ id_dn: dnId, id_sp: sp2.id_sp, id_npl: npl5.id_npl, so_luong: 1, don_vi_tinh: 'cái' }),
            DinhMucSanPham.create({ id_dn: dnId, id_sp: sp3.id_sp, id_npl: npl1.id_npl, so_luong: 0.5, don_vi_tinh: 'kg' }),
            DinhMucSanPham.create({ id_dn: dnId, id_sp: sp3.id_sp, id_npl: npl5.id_npl, so_luong: 10, don_vi_tinh: 'cái' }),
            DinhMucSanPham.create({ id_dn: dnId, id_sp: sp3.id_sp, id_npl: npl6.id_npl, so_luong: 5, don_vi_tinh: 'cái' }),
        ]);
        console.log(`✅ Created ${dinhMuc.length} định mức`);

        // 2. Create Quy đổi đơn vị SP
        console.log('📦 Tạo Quy đổi đơn vị SP...');
        const quyDoiSP = await Promise.all([
            QuyDoiDonViSP.create({ id_dn: dnId, id_sp: sp1.id_sp, ten_dvt_sp: 'kg', id_dvt_hq: kg.id_dvt_hq, he_so: 0.001 }),
            QuyDoiDonViSP.create({ id_dn: dnId, id_sp: sp3.id_sp, ten_dvt_sp: 'thùng', id_dvt_hq: thung.id_dvt_hq, he_so: 0.05 }),
        ]);
        console.log(`✅ Created ${quyDoiSP.length} quy đổi SP`);

        // 3. Create Quy đổi đơn vị DN
        console.log('📦 Tạo Quy đổi đơn vị DN...');
        const quyDoiDN = await Promise.all([
            QuyDoiDonViDN.create({ id_dn: dnId, id_mat_hang: 1, ten_dvt_dn: 'kg', id_dvt_hq: kg.id_dvt_hq, he_so: 1 }),
            QuyDoiDonViDN.create({ id_dn: dnId, id_mat_hang: 2, ten_dvt_dn: 'thùng', id_dvt_hq: thung.id_dvt_hq, he_so: 50 }),
            QuyDoiDonViDN.create({ id_dn: dnId, id_mat_hang: 3, ten_dvt_dn: 'cuộn', id_dvt_hq: cuon.id_dvt_hq, he_so: 25 }),
        ]);
        console.log(`✅ Created ${quyDoiDN.length} quy đổi DN`);

        // 4. Create Quy đổi NPL
        console.log('📦 Tạo Quy đổi NPL...');
        const quyDoiNPLData = await Promise.all([
            QuyDoiNPL.create({ id_dn: dnId, id_npl: npl1.id_npl, ten_dvt_dn: 'bao', id_dvt_hq: kg.id_dvt_hq, he_so: 25 }),
            QuyDoiNPL.create({ id_dn: dnId, id_npl: npl2.id_npl, ten_dvt_dn: 'bao', id_dvt_hq: kg.id_dvt_hq, he_so: 25 }),
            QuyDoiNPL.create({ id_dn: dnId, id_npl: npl3.id_npl, ten_dvt_dn: 'cuộn', id_dvt_hq: kg.id_dvt_hq, he_so: 10 }),
            QuyDoiNPL.create({ id_dn: dnId, id_npl: npl5.id_npl, ten_dvt_dn: 'hộp', id_dvt_hq: cai.id_dvt_hq, he_so: 100 }),
        ]);
        console.log(`✅ Created ${quyDoiNPLData.length} quy đổi NPL`);

        // 5. Update LoHang with data
        console.log('📦 Cập nhật Lô hàng...');
        await LoHang.update({ so_lo: 'LH2026-001', ngay_lo: '2026-02-15', so_luong: 5000, trang_thai: 'DaNhapKho' }, { where: { id_hd: hd1.id_hd, id_lh: 1 } });
        await LoHang.update({ so_lo: 'LH2026-002', ngay_lo: '2026-03-10', so_luong: 5000, trang_thai: 'DangSanXuat' }, { where: { id_hd: hd1.id_hd, id_lh: 2 } });
        console.log('✅ Updated 2 lô hàng');

        // 6. Create ToKhaiNhap
        console.log('📦 Tạo Tờ khai nhập...');
        const toKhaiNhap = await Promise.all([
            ToKhaiNhap.create({ id_lh: 1, so_tk: 'TK2026-001', ngay_tk: '2026-02-25', ma_to_khai: 'G11', cang_nhap: 'Cảng Sài Gòn', tong_tri_gia: 25000, thue_nhap_khau: 2500, thue_gtgt: 2750, trang_thai: 'ThongQuan' }),
            ToKhaiNhap.create({ id_lh: 1, so_tk: 'TK2026-002', ngay_tk: '2026-03-05', ma_to_khai: 'G11', cang_nhap: 'Cảng Sài Gòn', tong_tri_gia: 15000, thue_nhap_khau: 1500, thue_gtgt: 1650, trang_thai: 'ChoXuLy' }),
        ]);
        console.log(`✅ Created ${toKhaiNhap.length} tờ khai nhập`);

        // 7. Create ToKhaiXuat
        console.log('📦 Tạo Tờ khai xuất...');
        const toKhaiXuat = await Promise.all([
            ToKhaiXuat.create({ id_lh: 1, so_tk: 'TKX2026-001', ngay_tk: '2026-03-10', ma_to_khai: 'G21', cang_xuat: 'Cảng Sài Gòn', tong_tri_gia: 30000, trang_thai: 'ThongQuan' }),
            ToKhaiXuat.create({ id_lh: 1, so_tk: 'TKX2026-002', ngay_tk: '2026-03-15', ma_to_khai: 'G21', cang_xuat: 'Cảng Sài Gòn', tong_tri_gia: 18000, trang_thai: 'KiemTraHoSo' }),
        ]);
        console.log(`✅ Created ${toKhaiXuat.length} tờ khai xuất`);

        console.log('\n🎉 Seed dữ liệu bổ sung hoàn tất!');
        console.log('Tổng quan:');
        console.log(`- Định mức: ${dinhMuc.length}`);
        console.log(`- Quy đổi SP: ${quyDoiSP.length}`);
        console.log(`- Quy đổi DN: ${quyDoiDN.length}`);
        console.log(`- Quy đổi NPL: ${quyDoiNPLData.length}`);
        console.log(`- Tờ khai nhập: ${toKhaiNhap.length}`);
        console.log(`- Tờ khai xuất: ${toKhaiXuat.length}`);

    } catch (error) {
        console.error('❌ Lỗi seed:', error);
    }
    process.exit();
};

seedMoreData();