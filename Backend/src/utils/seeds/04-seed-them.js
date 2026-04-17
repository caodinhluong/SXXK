'use strict';

require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });

const db = require('../../models');
const {
    DinhMucSanPham, QuyDoiDonViSP, QuyDoiDonViDN, QuyDoiNPL,
    SanPham, NguyenPhuLieu, DonViTinhHQ, HopDong, LoHang,
    ToKhaiNhap, ToKhaiXuat, HoaDonNoiDia, HoaDonNoiDiaChiTiet,
    PhieuSanXuat, XuatKhoNPL, XuatKhoSP, NhapKhoSPChiTiet,
    DoiSoatNhap, DoiSoatNhapChiTiet, DoiSoatXuat, DoiSoatXuatChiTiet,
    DoiSoatDinhMuc, DoiSoatDinhMucChiTiet
} = db;

const seedMoreData = async () => {
    const transaction = await db.sequelize.transaction();
    try {
        console.log('➕ Seeding dữ liệu bổ sung...');

        const dn = await db.DoanhNghiep.findOne({ where: { ma_so_thue: '0312345678' } });
        if (!dn) throw new Error('Chưa seed doanh nghiệp!');
        const dnId = dn.id_dn;

        const sp1 = await SanPham.findOne({ where: { ma_sp: 'SP001' } });
        if (!sp1) throw new Error('Chưa seed sản phẩm!');
        
        const vnd = await db.TienTe.findOne({ where: { ma_tt: 'VND' } });
        if (!vnd) throw new Error('Chưa seed tiền tệ!');
        
        const kg = await DonViTinhHQ.findOne({ where: { ma_dvt: 'kg' } });

        const npl1 = await NguyenPhuLieu.findOne({ where: { id_dn: dnId } });
        const nhapKhoNPL = await db.NhapKhoNPL.findOne();
        const xuatKhoSP = await db.XuatKhoSP.findOne();
        const xuatKhoNPL = await db.XuatKhoNPL.findOne();
        
        const hopDong = await HopDong.findOne({ where: { id_dn: dnId } });
        
        const nhapKhoId = nhapKhoNPL ? nhapKhoNPL.id_nhap : null;
        const xuatKhoNPLId = xuatKhoNPL ? xuatKhoNPL.id_xuat : null;
        
        let xuatKhoSPId = xuatKhoSP ? xuatKhoSP.id_xuat : null;
        if (!xuatKhoSPId) {
            const khoSP = await db.Kho.findOne({ where: { id_dn: dnId, loai_kho: 'ThanhPham' } });
            if (khoSP) {
                const newXuatKhoSP = await db.XuatKhoSP.create({
                    id_kho: khoSP.id_kho,
                    ngay_xuat: '2026-04-01',
                    ca_kip: 'Ca 1',
                    ghi_chu: 'Xuất kho SP seed'
                }, { transaction });
                xuatKhoSPId = newXuatKhoSP.id_xuat;
            }
        }

        console.log('🏭 Additional Sản xuất...');
        const newPSX = await Promise.all([
            PhieuSanXuat.create({ id_dn: dnId, so_phieu: 'PSX2026-008', ngay_sx: '2026-04-20', ca_kip: 'Ca 1', id_xuat_npl: xuatKhoNPLId, id_sp: sp1.id_sp, so_luong_ke_hoach: 400, so_luong_thuc_te: 395, ty_le_hoan_thanh: 98.75, nguoi_phu_trach: 'Hoàng Văn H', trang_thai: 'HoanThanh' }, { transaction }),
            PhieuSanXuat.create({ id_dn: dnId, so_phieu: 'PSX2026-009', ngay_sx: '2026-04-22', ca_kip: 'Ca 2', id_xuat_npl: xuatKhoNPLId, id_sp: sp1.id_sp, so_luong_ke_hoach: 250, so_luong_thuc_te: 245, ty_le_hoan_thanh: 98, nguoi_phu_trach: 'Lê Văn I', trang_thai: 'HoanThanh' }, { transaction }),
            PhieuSanXuat.create({ id_dn: dnId, so_phieu: 'PSX2026-017', ngay_sx: '2026-05-15', ca_kip: 'Ca 3', id_xuat_npl: xuatKhoNPLId, id_sp: sp1.id_sp, so_luong_ke_hoach: 600, so_luong_thuc_te: 580, ty_le_hoan_thanh: 96.67, nguoi_phu_trach: 'Vũ Thị K', trang_thai: 'HoanThanh' }, { transaction }),
        ]);
        console.log(`✅ Added ${newPSX.length} phiếu sản xuất`);

        console.log('🔄 Seeding Đối soát...');
        
        console.log('  📥 DoiSoatNhap...');
        const tkn = await ToKhaiNhap.findOne();
        const dsNhap1 = await DoiSoatNhap.create({ 
            id_tkn: tkn ? tkn.id_tkn : null,
            id_nhap_kho: nhapKhoId,
            ngay_doi_soat: '2026-03-01',
            nguoi_doi_soat: 'Nguyễn Văn A',
            ket_qua: 'ChenhLech',
            chenh_lech_sl: -2,
            ly_do_chenh_lech: 'Hàng hóa bị hao hụt trong quá trình vận chuyển',
            trang_thai: 'HoanThanh',
            ghi_chu: 'Đối soát Nhap NPL tháng 2'
        }, { transaction });
        
        if (npl1 && npl1.id_npl) {
            await DoiSoatNhapChiTiet.create({
                id_ds: dsNhap1.id_ds,
                id_npl: npl1.id_npl,
                sl_to_khai: 100,
                sl_nhap_kho: 98,
                chenh_lech: -2,
                ly_do: 'Hàng hóa bị hao hụt trong quá trình vận chuyển'
            }, { transaction });
        }

        const dsNhap2 = await DoiSoatNhap.create({
            id_tkn: tkn ? tkn.id_tkn : null,
            id_nhap_kho: nhapKhoId,
            ngay_doi_soat: '2026-03-15',
            nguoi_doi_soat: 'Nguyễn Văn B',
            ket_qua: 'KhopDu',
            chenh_lech_sl: 0,
            trang_thai: 'HoanThanh',
            ghi_chu: 'Đối soát Nhap SP'
        }, { transaction });

        if (npl1) {
            await DoiSoatNhapChiTiet.create({
                id_ds: dsNhap2.id_ds,
                id_npl: npl1.id_npl,
                sl_to_khai: 480,
                sl_nhap_kho: 480,
                chenh_lech: 0
            }, { transaction });
        }

        console.log('  📤 DoiSoatXuat...');
        const tkx = await ToKhaiXuat.findOne();
        const dsXuat1 = await DoiSoatXuat.create({
            id_tkx: tkx ? tkx.id_tkx : null,
            id_xuat_kho: xuatKhoSPId,
            ma_doi_soat: 'DSX001',
            ngay_doi_soat: '2026-04-01',
            nguoi_doi_soat: 'Trần Văn C',
            ket_qua: 'KhopDu',
            chenh_lech_sl: 0,
            trang_thai: 'HoanThanh',
            ghi_chu: 'Đối soát Xuat SP'
        }, { transaction });

        if (sp1 && sp1.id_sp) {
            await DoiSoatXuatChiTiet.create({
                id_ds: dsXuat1.id_ds,
                id_sp: sp1.id_sp,
                sl_to_khai: 50,
                sl_xuat_kho: 50,
                chenh_lech: 0
            }, { transaction });
        }

        const dsXuat2 = await DoiSoatXuat.create({
            id_tkx: tkx ? tkx.id_tkx : null,
            id_xuat_kho: xuatKhoSPId,
            ma_doi_soat: 'DSX002',
            ngay_doi_soat: '2026-04-10',
            nguoi_doi_soat: 'Trần Văn D',
            ket_qua: 'ChenhLech',
            chenh_lech_sl: 5,
            ly_do_chenh_lech: 'Sai số do cân đo',
            trang_thai: 'DangXuLy',
            ghi_chu: 'Đối soát Xuat SP'
        }, { transaction });

        await DoiSoatXuatChiTiet.create({
            id_ds: dsXuat2.id_ds,
            id_sp: sp1.id_sp,
            sl_to_khai: 200,
            sl_xuat_kho: 195,
            chenh_lech: 5,
            ly_do: 'Sai số do cân đo'
        }, { transaction });

        console.log('  📊 DoiSoatDinhMuc...');
        const dmSP = await DinhMucSanPham.findOne({ where: { id_sp: sp1.id_sp } });
        const dsDM1 = await DoiSoatDinhMuc.create({
            id_dn: dnId,
            id_sp: sp1.id_sp,
            tu_ngay: '2026-04-01',
            den_ngay: '2026-04-20',
            sl_sp_san_xuat: 1000,
            ngay_doi_soat: '2026-04-20',
            nguoi_doi_soat: 'Lê Thị E',
            ket_luan: 'DatDinhMuc',
            ty_le_sai_lech: 2.5,
            ghi_chu: 'Định mức SP001'
        }, { transaction });

        // Skip DoiSoatDinhMucChiTiet - DB doesn't have required columns
        // The table only has: id_ct, id_ds, sl_dinh_muc, sl_thuc_te, chenh_lech, ty_le_chenh_lech

        console.log('✅ Added 6 Đối soát records (Nhap/Xuat/DinhMuc) + chi tiết');

        console.log('📄 Seeding Hóa đơn nội địa...');
        
        const hdNDs = await Promise.all([
            HoaDonNoiDia.create({
                id_dn: dnId,
                so_hd: 'HDND2026-001',
                ngay_hd: '2026-03-05',
                khach_hang: 'Công ty TNHH XYZ',
                ma_so_thue_kh: '0311111111',
                dia_chi_kh: '456 Nguyễn Huệ, Q1, TP.HCM',
                tong_tien: 50000000,
                thue_gtgt: 5000000,
                tong_thanh_toan: 55000000,
                trang_thai: 'DaThanhToan',
                ghi_chu: 'Hóa đơn bán hàng tháng 3'
            }, { transaction }),
            HoaDonNoiDia.create({
                id_dn: dnId,
                so_hd: 'HDND2026-002',
                ngay_hd: '2026-03-10',
                khach_hang: 'Công ty CP ABC',
                ma_so_thue_kh: '0312222222',
                dia_chi_kh: '789 Lê Lợi, Q3, TP.HCM',
                tong_tien: 30000000,
                thue_gtgt: 3000000,
                tong_thanh_toan: 33000000,
                trang_thai: 'DaThanhToan',
                ghi_chu: 'Hóa đơn bán hàng'
            }, { transaction }),
            HoaDonNoiDia.create({
                id_dn: dnId,
                so_hd: 'HDND2026-003',
                ngay_hd: '2026-03-15',
                khach_hang: 'Doanh nghiệp tư nhân DEF',
                ma_so_thue_kh: '0313333333',
                dia_chi_kh: '123 Trần Hưng Đạo, Q5, TP.HCM',
                tong_tien: 75000000,
                thue_gtgt: 7500000,
                tong_thanh_toan: 82500000,
                trang_thai: 'ChuaThanhToan',
                ghi_chu: 'Hóa đơn bán hàng chưa thanh toán'
            }, { transaction }),
            HoaDonNoiDia.create({
                id_dn: dnId,
                so_hd: 'HDND2026-004',
                ngay_hd: '2026-03-20',
                khach_hang: 'Công ty TNHH GHI',
                ma_so_thue_kh: '0314444444',
                dia_chi_kh: '321 Điện Biên Phủ, Q.Bình Thạnh, TP.HCM',
                tong_tien: 20000000,
                thue_gtgt: 2000000,
                tong_thanh_toan: 22000000,
                trang_thai: 'DaThanhToan',
                ghi_chu: 'Hóa đơn bán hàng'
            }, { transaction }),
            HoaDonNoiDia.create({
                id_dn: dnId,
                so_hd: 'HDND2026-005',
                ngay_hd: '2026-03-25',
                khach_hang: 'Công ty JKL',
                ma_so_thue_kh: '0315555555',
                dia_chi_kh: '567 Võ Văn Ngân, Q.Thủ Đức, TP.HCM',
                tong_tien: 45000000,
                thue_gtgt: 4500000,
                tong_thanh_toan: 49500000,
                trang_thai: 'DaThanhToan',
                ghi_chu: 'Hóa đơn bán hàng'
            }, { transaction }),
            HoaDonNoiDia.create({
                id_dn: dnId,
                so_hd: 'HDND2026-006',
                ngay_hd: '2026-04-01',
                khach_hang: 'Công ty MNP',
                ma_so_thue_kh: '0316666666',
                dia_chi_kh: '890 Nguyễn Oai, Q.9, TP.HCM',
                tong_tien: 60000000,
                thue_gtgt: 6000000,
                tong_thanh_toan: 66000000,
                trang_thai: 'DaThanhToan',
                ghi_chu: 'Hóa đơn bán hàng tháng 4'
            }, { transaction }),
        ]);

        const hdNDChiTiets = [];
        for (const hd of hdNDs) {
            hdNDChiTiets.push(
                { id_hd_nd: hd.id_hd_nd, id_sp: sp1.id_sp, so_luong: 50, don_gia: 1000000, thanh_tien: 50000000, thue_suat: 10 },
            );
            if (hdNDs.indexOf(hd) % 2 === 0) {
                hdNDChiTiets.push(
                    { id_hd_nd: hd.id_hd_nd, id_sp: sp1.id_sp, so_luong: 30, don_gia: 1000000, thanh_tien: 30000000, thue_suat: 10 },
                );
            }
        }
        
        await HoaDonNoiDiaChiTiet.bulkCreate(hdNDChiTiets, { transaction });
        console.log(`✅ Added ${hdNDs.length} HDND + chi tiết`);

        await transaction.commit();
        console.log('🎉 Seed bổ sung hoàn tất!');
    } catch (error) {
        await transaction.rollback();
        console.error('❌ Lỗi:', error);
        process.exit(1);
    }
    process.exit(0);
};

seedMoreData();
