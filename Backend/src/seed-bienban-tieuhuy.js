'use strict';

require('dotenv').config({ path: __dirname + '/../../Backend/.env' });

const db = require('./models');
const BienBanTieuHuy = db.BienBanTieuHuy;
const BienBanTieuHuyChiTiet = db.BienBanTieuHuyChiTiet;
const SanPham = db.SanPham;
const NguyenPhuLieu = db.NguyenPhuLieu;

const seedBienBanTieuHuy = async () => {
    try {
        console.log('🔄 Bắt đầu seed Biên bản tiêu hủy...\n');

        const dn = await db.DoanhNghiep.findOne({ where: { ma_so_thue: '0312345678' } });
        if (!dn) {
            console.log('❌ Không tìm thấy Doanh nghiệp!');
            process.exit(1);
        }
        const dnId = dn.id_dn;
        console.log(`📋 Doanh nghiệp: ${dn.ten_dn} (ID: ${dnId})`);

        // Lấy danh sách sản phẩm và nguyên phụ liệu
        const sanPhams = await SanPham.findAll({ where: { id_dn: dnId }, limit: 10 });
        const nguyenLieus = await NguyenPhuLieu.findAll({ where: { id_dn: dnId }, limit: 20 });

        console.log(`📦 Tìm thấy ${sanPhams.length} sản phẩm và ${nguyenLieus.length} nguyên phụ liệu`);

        // 1. Biên bản tiêu hủy nguyên phụ liệu hết hạn
        console.log('\n📝 Tạo Biên bản tiêu hủy #1 - Nguyên phụ liệu hết hạn...');
        const bb1 = await BienBanTieuHuy.create({
            id_dn: dnId,
            so_bien_ban: 'BBTH2026-001',
            ngay_tieu_huy: '2026-03-28',
            dia_diem: 'Kho Nguyên liệu chính - Khu công nghiệp Linh Xuân, TP.HCM',
            ly_do: 'Nguyên phụ liệu hết hạn sử dụng, không đảm bảo chất lượng sản xuất',
            thanh_phan_tham_gia: 'Nguyễn Văn A (Quản lý kho), Trần Thị B (QC), Lê Văn C (Kế toán)',
            co_quan_chung_kien: 'Chi cục Hải quan TP.HCM',
            trang_thai: 'HoanThanh'
        });

        await BienBanTieuHuyChiTiet.bulkCreate([
            { id_bb: bb1.id_bb, id_npl: nguyenLieus[0].id_npl, so_luong: 25, don_vi_tinh: 'kg', ly_do_chi_tiet: 'Hết hạn sử dụng tháng 03/2026' },
            { id_bb: bb1.id_bb, id_npl: nguyenLieus[1].id_npl, so_luong: 15, don_vi_tinh: 'kg', ly_do_chi_tiet: 'Hết hạn sử dụng tháng 03/2026' },
            { id_bb: bb1.id_bb, id_npl: nguyenLieus[4].id_npl, so_luong: 50, don_vi_tinh: 'cái', ly_do_chi_tiet: 'Hết hạn sử dụng, bao bì xuống cấp' },
        ]);
        console.log('✅ Tạo BBTH #1 với 3 chi tiết');

        // 2. Biên bản tiêu hủy sản phẩm lỗi
        console.log('\n📝 Tạo Biên bản tiêu hủy #2 - Sản phẩm lỗi...');
        const bb2 = await BienBanTieuHuy.create({
            id_dn: dnId,
            so_bien_ban: 'BBTH2026-002',
            ngay_tieu_huy: '2026-04-05',
            dia_diem: 'Kho Thành phẩm - Khu công nghiệp Linh Xuân, TP.HCM',
            ly_do: 'Sản phẩm bị lỗi trong quá trình sản xuất, không đạt tiêu chuẩn chất lượng xuất khẩu',
            thanh_phan_tham_gia: 'Phạm Thị D (Trưởng phòng QC), Nguyễn Văn E (Sản xuất), Trần Văn F (Bảo vệ)',
            co_quan_chung_kien: 'Chi cục Hải quan Khu vực II',
            trang_thai: 'HoanThanh'
        });

        await BienBanTieuHuyChiTiet.bulkCreate([
            { id_bb: bb2.id_bb, id_sp: sanPhams[0].id_sp, so_luong: 20, don_vi_tinh: 'cái', ly_do_chi_tiet: 'Sản phẩm bị biến dạng, không đạt tiêu chuẩn' },
            { id_bb: bb2.id_bb, id_sp: sanPhams[1].id_sp, so_luong: 15, don_vi_tinh: 'cái', ly_do_chi_tiet: 'Sản phẩm có vết trầy xước, không xuất khẩu được' },
            { id_bb: bb2.id_bb, id_sp: sanPhams[2].id_sp, so_luong: 10, don_vi_tinh: 'cái', ly_do_chi_tiet: 'Sản phẩm sai quy cách, không đóng gói được' },
        ]);
        console.log('✅ Tạo BBTH #2 với 3 chi tiết');

        // 3. Biên bản tiêu hủy nguyên phụ liệu bị ẩm mốc
        console.log('\n📝 Tạo Biên bản tiêu hủy #3 - Nguyên phụ liệu bị ẩm mốc...');
        const bb3 = await BienBanTieuHuy.create({
            id_dn: dnId,
            so_bien_ban: 'BBTH2026-003',
            ngay_tieu_huy: '2026-04-10',
            dia_diem: 'Kho Linh kiện điện tử - Khu chế xuất Tân Thuận, TP.HCM',
            ly_do: 'Nguyên phụ liệu bị ẩm mốc do thời tiết mùa nồm ẩm, không thể sử dụng',
            thanh_phan_tham_gia: 'Lê Thị G (Quản lý kho), Trần Văn H (Kỹ thuật), Nguyễn Thị I (QC)',
            co_quan_chung_kien: 'Chi cục Hải quan Khu chế xuất Tân Thuận',
            trang_thai: 'HoanThanh'
        });

        await BienBanTieuHuyChiTiet.bulkCreate([
            { id_bb: bb3.id_bb, id_npl: nguyenLieus[2].id_npl, so_luong: 8, don_vi_tinh: 'kg', ly_do_chi_tiet: 'Vải bị ẩm mốc, không thể sử dụng' },
            { id_bb: bb3.id_bb, id_npl: nguyenLieus[3].id_npl, so_luong: 5, don_vi_tinh: 'kg', ly_do_chi_tiet: 'Vải bị ố vàng, mất màu' },
            { id_bb: bb3.id_bb, id_npl: nguyenLieus[12].id_npl, so_luong: 20, don_vi_tinh: 'cái', ly_do_chi_tiet: 'Phụ kiện bị gỉ sét do ẩm' },
        ]);
        console.log('✅ Tạo BBTH #3 với 3 chi tiết');

        // 4. Biên bản tiêu hủy sản phẩm quá hạn
        console.log('\n📝 Tạo Biên bản tiêu hủy #4 - Sản phẩm quá hạn...');
        const bb4 = await BienBanTieuHuy.create({
            id_dn: dnId,
            so_bien_ban: 'BBTH2026-004',
            ngay_tieu_huy: '2026-04-12',
            dia_diem: 'Kho Hàng đại lý - Khu logistics Bình Dương',
            ly_do: 'Sản phẩm tồn kho quá lâu, vượt thời hạn sử dụng cho phép',
            thanh_phan_tham_gia: 'Nguyễn Văn J (Kinh doanh), Trần Thị K (Kho), Lê Văn L (Bảo vệ)',
            co_quan_chung_kien: 'Chi cục Hải quan Bình Dương',
            trang_thai: 'HoanThanh'
        });

        await BienBanTieuHuyChiTiet.bulkCreate([
            { id_bb: bb4.id_bb, id_sp: sanPhams[3].id_sp, so_luong: 30, don_vi_tinh: 'cái', ly_do_chi_tiet: 'Sản phẩm hết hạn sử dụng' },
            { id_bb: bb4.id_bb, id_sp: sanPhams[4].id_sp, so_luong: 25, don_vi_tinh: 'cái', ly_do_chi_tiet: 'Sản phẩm hết hạn sử dụng' },
        ]);
        console.log('✅ Tạo BBTH #4 với 2 chi tiết');

        // 5. Biên bản tiêu hủy vật tư hư hỏng (đang thực hiện)
        console.log('\n📝 Tạo Biên bản tiêu hủy #5 - Vật tư hư hỏng (đang xử lý)...');
        const bb5 = await BienBanTieuHuy.create({
            id_dn: dnId,
            so_bien_ban: 'BBTH2026-005',
            ngay_tieu_huy: '2026-04-15',
            dia_diem: 'Kho Bao bì - Quận Bình Tân, TP.HCM',
            ly_do: 'Vật tư đóng gói bị hư hỏng trong quá trình vận chuyển nội bộ',
            thanh_phan_tham_gia: 'Phạm Văn M (Vật tư), Nguyễn Thị N (Kế toán)',
            co_quan_chung_kien: 'Chờ xác nhận',
            trang_thai: 'DangThucHien'
        });

        await BienBanTieuHuyChiTiet.bulkCreate([
            { id_bb: bb5.id_bb, id_npl: nguyenLieus[5].id_npl, so_luong: 100, don_vi_tinh: 'cái', ly_do_chi_tiet: 'Thùng carton bị méo, không sử dụng được' },
            { id_bb: bb5.id_bb, id_npl: nguyenLieus[6].id_npl, so_luong: 50, don_vi_tinh: 'cái', ly_do_chi_tiet: 'Hộp giấy bị rách, không đóng gói được' },
        ]);
        console.log('✅ Tạo BBTH #5 với 2 chi tiết (đang xử lý)');

        // 6. Biên bản tiêu hủy nguyên phụ liệu từ lô hàng kém chất lượng
        console.log('\n📝 Tạo Biên bản tiêu hủy #6 - Lô hàng kém chất lượng...');
        const bb6 = await BienBanTieuHuy.create({
            id_dn: dnId,
            so_bien_ban: 'BBTH2026-006',
            ngay_tieu_huy: '2026-04-14',
            dia_diem: 'Kho Nguyên liệu chính - Khu công nghiệp Linh Xuân, TP.HCM',
            ly_do: 'Lô nguyên phụ liệu nhập về không đạt tiêu chuẩn chất lượng theo hợp đồng, đã hoàn trả nhà cung cấp một phần',
            thanh_phan_tham_gia: 'Trần Văn O (Mua hàng), Nguyễn Thị P (QC), Lê Văn Q (Kho)',
            co_quan_chung_kien: 'Chi cục Hải quan TP.HCM',
            trang_thai: 'HoanThanh'
        });

        await BienBanTieuHuyChiTiet.bulkCreate([
            { id_bb: bb6.id_bb, id_npl: nguyenLieus[7].id_npl, so_luong: 30, don_vi_tinh: 'cái', ly_do_chi_tiet: 'Hàng không đúng quy cách, nhà cung cấp không đổi trả' },
            { id_bb: bb6.id_bb, id_npl: nguyenLieus[8].id_npl, so_luong: 20, don_vi_tinh: 'kg', ly_do_chi_tiet: 'Chất lượng không đạt, không phù hợp sản xuất' },
            { id_bb: bb6.id_bb, id_npl: nguyenLieus[9].id_npl, so_luong: 10, don_vi_tinh: 'kg', ly_do_chi_tiet: 'Màu sắc không đồng nhất' },
        ]);
        console.log('✅ Tạo BBTH #6 với 3 chi tiết');

        // Tổng kết
        const tongBB = await BienBanTieuHuy.count({ where: { id_dn: dnId } });
        const tongCT = await BienBanTieuHuyChiTiet.count({
            include: [{
                model: BienBanTieuHuy,
                as: 'bienBanTieuHuy',
                where: { id_dn: dnId }
            }]
        });

        console.log('\n🎉 Seed Biên bản tiêu hủy hoàn tất!');
        console.log(`📊 Tổng Biên bản: ${tongBB}`);
        console.log(`📊 Tổng Chi tiết: ${tongCT}`);

    } catch (error) {
        console.error('❌ Lỗi seed Biên bản tiêu hủy:', error);
    }
    process.exit();
};

seedBienBanTieuHuy();