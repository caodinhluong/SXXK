'use strict';

const db = require('../models');
const { Op } = require('sequelize');
const { QueryTypes } = require('sequelize');

const HopDong = db.HopDong;
const DoanhNghiep = db.DoanhNghiep;
const LoHang = db.LoHang;
const HoaDonNhap = db.HoaDonNhap;
const HoaDonNhapChiTiet = db.HoaDonNhapChiTiet;
const HoaDonXuat = db.HoaDonXuat;
const HoaDonXuatChiTiet = db.HoaDonXuatChiTiet;
const NhapKhoSP = db.NhapKhoSP;
const NhapKhoSPChiTiet = db.NhapKhoSPChiTiet;
const XuatKhoSP = db.XuatKhoSP;
const XuatKhoSPChiTiet = db.XuatKhoSPChiTiet;
const NhapKhoNPL = db.NhapKhoNPL;
const NhapKhoNPLChiTiet = db.NhapKhoNPLChiTiet;
const XuatKhoNPL = db.XuatKhoNPL;
const XuatKhoNPLChiTiet = db.XuatKhoNPLChiTiet;
const DinhMucSanPham = db.DinhMucSanPham;
const SanPham = db.SanPham;
const NguyenPhuLieu = db.NguyenPhuLieu;
const BaoCaoThanhKhoan = db.BaoCaoThanhKhoan;
const BaoCaoThanhKhoanNPL = db.BaoCaoThanhKhoanNPL;
const BaoCaoThanhKhoanSP = db.BaoCaoThanhKhoanSP;
const DonViTinhHQ = db.DonViTinhHQ;

// ========== Helper functions ==========

// SP: tổng nhập trước kỳ
const sumNhapSPBefore = async (id_sp, ngay) => {
  const sql = `
    SELECT COALESCE(SUM(ct.so_luong), 0) AS total
    FROM NhapKhoSPChiTiet ct
    JOIN NhapKhoSP p ON p.id_nhap = ct.id_nhap
    WHERE ct.id_sp = ?
      AND p.ngay_nhap < ?
  `;
  const rows = await db.sequelize.query(sql, {
    replacements: [id_sp, ngay],
    type: QueryTypes.SELECT
  });
  return Number(rows[0]?.total || 0);
};

// SP: tổng xuất trước kỳ
const sumXuatSPBefore = async (id_sp, ngay) => {
  const sql = `
    SELECT COALESCE(SUM(ct.so_luong), 0) AS total
    FROM XuatKhoSPChiTiet ct
    JOIN XuatKhoSP p ON p.id_xuat = ct.id_xuat
    WHERE ct.id_sp = ?
      AND p.ngay_xuat < ?
  `;
  const rows = await db.sequelize.query(sql, {
    replacements: [id_sp, ngay],
    type: QueryTypes.SELECT
  });
  return Number(rows[0]?.total || 0);
};

// SP: tổng nhập trong kỳ
const sumNhapSPInPeriod = async (id_sp, tu_ngay, den_ngay) => {
  const sql = `
    SELECT COALESCE(SUM(ct.so_luong), 0) AS total
    FROM NhapKhoSPChiTiet ct
    JOIN NhapKhoSP p ON p.id_nhap = ct.id_nhap
    WHERE ct.id_sp = ?
      AND p.ngay_nhap BETWEEN ? AND ?
  `;
  const rows = await db.sequelize.query(sql, {
    replacements: [id_sp, tu_ngay, den_ngay],
    type: QueryTypes.SELECT
  });
  return Number(rows[0]?.total || 0);
};

// NPL: tổng nhập trước kỳ (từ kho)
const sumNhapNPLBefore = async (id_npl, ngay) => {
  const sql = `
    SELECT COALESCE(SUM(ct.so_luong), 0) AS total
    FROM NhapKhoNPLChiTiet ct
    JOIN NhapKhoNPL p ON p.id_nhap = ct.id_nhap
    WHERE ct.id_npl = ?
      AND p.ngay_nhap < ?
  `;
  const rows = await db.sequelize.query(sql, {
    replacements: [id_npl, ngay],
    type: QueryTypes.SELECT
  });
  return Number(rows[0]?.total || 0);
};

// NPL: tổng xuất trước kỳ (từ kho)
const sumXuatNPLBefore = async (id_npl, ngay) => {
  const sql = `
    SELECT COALESCE(SUM(ct.so_luong), 0) AS total
    FROM XuatKhoNPLChiTiet ct
    JOIN XuatKhoNPL p ON p.id_xuat = ct.id_xuat
    WHERE ct.id_npl = ?
      AND p.ngay_xuat < ?
  `;
  const rows = await db.sequelize.query(sql, {
    replacements: [id_npl, ngay],
    type: QueryTypes.SELECT
  });
  return Number(rows[0]?.total || 0);
};

// NPL: tổng nhập trong kỳ theo hợp đồng (qua hóa đơn nhập -> lô hàng)
const sumNhapNPLInPeriodByContract = async (id_npl, id_lhs, tu_ngay, den_ngay) => {
  if (!id_lhs || id_lhs.length === 0) return 0;
  
  const sql = `
    SELECT COALESCE(SUM(ct.so_luong), 0) AS total
    FROM HoaDonNhapChiTiet ct
    JOIN HoaDonNhap hd ON hd.id_hd_nhap = ct.id_hd_nhap
    WHERE ct.id_npl = ?
      AND hd.id_lh IN (?)
      AND hd.ngay_hd BETWEEN ? AND ?
  `;
  const rows = await db.sequelize.query(sql, {
    replacements: [id_npl, id_lhs, tu_ngay, den_ngay],
    type: QueryTypes.SELECT
  });
  return Number(rows[0]?.total || 0);
};

// ========== API 1: Lấy danh sách Hợp đồng theo Doanh nghiệp ==========
const getHopDongByDN = async (id_dn) => {
  return await HopDong.findAll({
    where: { id_dn },
    attributes: ['id_hd', 'so_hd'],
    order: [['id_hd', 'DESC']]
  });
};


// ========== API 2: Tính toán và tạo dữ liệu Báo cáo Thanh khoản ==========
const calculateBaoCao = async ({ id_hd, tu_ngay, den_ngay }, id_dn) => {
  // Validate input
  if (!id_hd || !tu_ngay || !den_ngay) {
    throw new Error('Thiếu dữ liệu: id_hd, tu_ngay, den_ngay là bắt buộc');
  }

  // Kiểm tra hợp đồng tồn tại và thuộc về doanh nghiệp
  const hopDong = await HopDong.findByPk(id_hd);
  if (!hopDong) {
    throw new Error('Hợp đồng không tồn tại');
  }
  if (hopDong.id_dn !== id_dn) {
    throw new Error('Hợp đồng không thuộc về doanh nghiệp này');
  }

  // 1. Thông tin chung - lấy từ DoanhNghiep
  const doanhNghiep = await DoanhNghiep.findByPk(id_dn);
  const thongTinChung = {
    ten_dn: doanhNghiep?.ten_dn || '',
    dia_chi: doanhNghiep?.dia_chi || '',
    ma_so_thue: doanhNghiep?.ma_so_thue || ''
  };

  const kyBaoCao = { 
    id_hd, 
    so_hd: hopDong.so_hd,
    tu_ngay, 
    den_ngay 
  };

  // Lấy tất cả lô hàng thuộc hợp đồng
  const loHangs = await LoHang.findAll({ where: { id_hd } });
  const id_lhs = loHangs.map((lh) => lh.id_lh);

  // Nếu không có lô hàng, trả về báo cáo rỗng
  if (id_lhs.length === 0) {
    return { 
      thongTinChung, 
      kyBaoCao, 
      baoCaoNXT_SP: [], 
      baoCaoSD_NPL: [], 
      dinhMucThucTe: [] 
    };
  }

  // ====== MẪU 15a: Báo cáo Nhập-Xuất-Tồn Sản phẩm ======
  
  // Bước 1: Lấy danh sách SP đã xuất khẩu trong kỳ thuộc hợp đồng
  const hoaDonXuatList = await HoaDonXuat.findAll({
    where: {
      id_lh: { [Op.in]: id_lhs },
      ngay_hd: { [Op.between]: [tu_ngay, den_ngay] }
    },
    include: [{ 
      model: HoaDonXuatChiTiet, 
      as: 'chiTiets',
      include: [{
        model: SanPham,
        as: 'sanPham',
        include: [{ model: DonViTinhHQ, as: 'donViTinhHQ' }]
      }]
    }]
  });

  // Tổng hợp số lượng xuất khẩu theo từng SP
  const sanPhamXuatMap = {}; // { id_sp: { so_luong, sanPham } }
  hoaDonXuatList.forEach((hd) => {
    hd.chiTiets.forEach((ct) => {
      if (!sanPhamXuatMap[ct.id_sp]) {
        sanPhamXuatMap[ct.id_sp] = {
          so_luong: 0,
          sanPham: ct.sanPham
        };
      }
      sanPhamXuatMap[ct.id_sp].so_luong += Number(ct.so_luong || 0);
    });
  });

  // Bước 2: Tính toán các cột cho mỗi SP
  const baoCaoNXT_SP = [];
  let sttSP = 1;

  for (const id_sp_str of Object.keys(sanPhamXuatMap)) {
    const id_sp = Number(id_sp_str);
    const spData = sanPhamXuatMap[id_sp];
    const sanPham = spData.sanPham;

    // (5) Tồn kho đầu kỳ = Tổng nhập trước kỳ - Tổng xuất trước kỳ
    const nhapTruocKy = await sumNhapSPBefore(id_sp, tu_ngay);
    const xuatTruocKy = await sumXuatSPBefore(id_sp, tu_ngay);
    const ton_dau_ky = nhapTruocKy - xuatTruocKy;

    // (6) Nhập kho trong kỳ
    const nhap_kho_trong_ky = await sumNhapSPInPeriod(id_sp, tu_ngay, den_ngay);

    // (7) Thay đổi mục đích - mặc định 0
    const chuyen_muc_dich = 0;

    // (8) Xuất khẩu - từ hóa đơn xuất thuộc hợp đồng
    const xuat_khau = spData.so_luong;

    // (9) Xuất khác - mặc định 0
    const xuat_khac = 0;

    // (10) Tồn kho cuối kỳ = (5) + (6) - (7) - (8) - (9)
    const ton_cuoi_ky = ton_dau_ky + nhap_kho_trong_ky - chuyen_muc_dich - xuat_khau - xuat_khac;

    // (11) Ghi chú - kiểm tra cảnh báo
    const ghiChuList = [];
    if (ton_cuoi_ky < 0) {
      ghiChuList.push('Cảnh báo: Tồn kho âm. Kiểm tra lại số liệu xuất/nhập.');
    }

    baoCaoNXT_SP.push({
      stt: sttSP++,
      id_sp,
      ma_sp: `SP-${id_sp}`,
      ten_sp: sanPham?.ten_sp || 'N/A',
      don_vi_tinh: sanPham?.donViTinhHQ?.ten_dvt || 'N/A',
      ton_dau_ky,
      nhap_kho_trong_ky,
      chuyen_muc_dich,
      xuat_khau,
      xuat_khac,
      ton_cuoi_ky,
      ghi_chu: ghiChuList.join(' ')
    });
  }


  // ====== MẪU 15b: Báo cáo Sử dụng Nguyên phụ liệu ======
  
  // Bước 1: Lấy danh sách NPL liên quan
  const nplIdSet = new Set();

  // NPL nhập theo hợp đồng (qua hóa đơn nhập -> lô hàng)
  const hoaDonNhapList = await HoaDonNhap.findAll({
    where: { id_lh: { [Op.in]: id_lhs } },
    include: [{ model: HoaDonNhapChiTiet, as: 'chiTiets' }]
  });
  hoaDonNhapList.forEach((hd) => {
    hd.chiTiets.forEach((ct) => nplIdSet.add(ct.id_npl));
  });

  // NPL từ định mức của các SP đã xuất
  const spIds = Object.keys(sanPhamXuatMap).map(Number);
  const dmList = await DinhMucSanPham.findAll({
    where: { id_sp: { [Op.in]: spIds } }
  });
  dmList.forEach((dm) => nplIdSet.add(dm.id_npl));

  // Bước 2: Tính toán các cột cho mỗi NPL
  const baoCaoSD_NPL = [];
  let sttNPL = 1;

  for (const id_npl of nplIdSet) {
    // Lấy thông tin NPL
    const npl = await NguyenPhuLieu.findByPk(id_npl, {
      include: [{ model: DonViTinhHQ, as: 'donViTinhHQ' }]
    });

    // (5) Tồn đầu kỳ = Tổng nhập kho trước kỳ - Tổng xuất kho trước kỳ
    const nhapKhoTruocKy = await sumNhapNPLBefore(id_npl, tu_ngay);
    const xuatKhoTruocKy = await sumXuatNPLBefore(id_npl, tu_ngay);
    const ton_dau_ky = nhapKhoTruocKy - xuatKhoTruocKy;

    // (6) Tái nhập - mặc định 0
    const tai_nhap = 0;

    // (7) Nhập khác (Nhập trong kỳ theo hợp đồng)
    const nhap_khac = await sumNhapNPLInPeriodByContract(id_npl, id_lhs, tu_ngay, den_ngay);

    // (8) Xuất sản phẩm (Xuất dùng cho sản xuất)
    // Công thức: SUM(Lượng SP đã xuất khẩu * Định mức NPL cho SP đó)
    let xuat_san_pham = 0;
    for (const spRow of baoCaoNXT_SP) {
      const dmRow = dmList.find((dm) => dm.id_sp === spRow.id_sp && dm.id_npl === Number(id_npl));
      if (dmRow) {
        xuat_san_pham += Number(dmRow.so_luong || 0) * Number(spRow.xuat_khau || 0);
      }
    }

    // (9) Thay đổi mục đích - mặc định 0
    const thay_doi_muc_dich = 0;

    // (10) Tồn kho cuối kỳ = (5) + (6) + (7) - (8) - (9)
    const ton_cuoi_ky = ton_dau_ky + tai_nhap + nhap_khac - xuat_san_pham - thay_doi_muc_dich;

    // (11) Ghi chú - kiểm tra cảnh báo
    const ghiChuList = [];
    
    // Kiểm tra tồn kho âm
    if (ton_cuoi_ky < 0) {
      ghiChuList.push('Cảnh báo: Tồn kho âm. Kiểm tra định mức hoặc phiếu xuất/nhập.');
    }
    
    // So sánh lượng sử dụng với tổng NPL khả dụng (tồn đầu + nhập trong kỳ)
    const tong_npl_kha_dung = ton_dau_ky + tai_nhap + nhap_khac;
    if (xuat_san_pham > tong_npl_kha_dung && tong_npl_kha_dung > 0) {
      ghiChuList.push('Cảnh báo: Lượng NPL sử dụng vượt quá tổng NPL khả dụng (có thể dùng NPL nội địa).');
    }
    
    // Cảnh báo nếu sử dụng nhiều nhưng không có NPL nhập theo hợp đồng
    if (xuat_san_pham > 0 && nhap_khac === 0 && ton_dau_ky <= 0) {
      ghiChuList.push('Cảnh báo: Sử dụng NPL nhưng không có nhập khẩu theo hợp đồng trong kỳ.');
    }

    baoCaoSD_NPL.push({
      stt: sttNPL++,
      id_npl: Number(id_npl),
      ma_npl: `NPL-${id_npl}`,
      ten_npl: npl?.ten_npl || 'N/A',
      don_vi_tinh: npl?.donViTinhHQ?.ten_dvt || 'N/A',
      ton_dau_ky,
      tai_nhap,
      nhap_khac,
      xuat_san_pham,
      thay_doi_muc_dich,
      ton_cuoi_ky,
      ghi_chu: ghiChuList.join(' ')
    });
  }


  // ====== MẪU 16: Định mức thực tế ======
  // Lấy định mức của các SP đã xuất khẩu
  const dinhMucRaw = await DinhMucSanPham.findAll({
    where: { id_sp: { [Op.in]: spIds } },
    include: [
      { 
        model: SanPham, 
        as: 'sanPham',
        include: [{ model: DonViTinhHQ, as: 'donViTinhHQ' }]
      },
      { 
        model: NguyenPhuLieu, 
        as: 'nguyenPhuLieu',
        include: [{ model: DonViTinhHQ, as: 'donViTinhHQ' }]
      }
    ]
  });

  const dinhMucThucTe = dinhMucRaw.map((dm, index) => ({
    stt: index + 1,
    id_sp: dm.id_sp,
    ma_sp: `SP-${dm.id_sp}`,
    ten_sp: dm.sanPham?.ten_sp || 'N/A',
    don_vi_tinh_sp: dm.sanPham?.donViTinhHQ?.ten_dvt || 'N/A',
    id_npl: dm.id_npl,
    ma_npl: `NPL-${dm.id_npl}`,
    ten_npl: dm.nguyenPhuLieu?.ten_npl || 'N/A',
    don_vi_tinh_npl: dm.nguyenPhuLieu?.donViTinhHQ?.ten_dvt || 'N/A',
    luong_sd: Number(dm.so_luong) || 0, // Định mức đã đăng ký
    ghi_chu: ''
  }));

  return {
    thongTinChung,
    kyBaoCao,
    baoCaoNXT_SP,
    baoCaoSD_NPL,
    dinhMucThucTe
  };
};

// ========== API 3: Lưu Báo cáo Thanh khoản ==========
const saveBaoCao = async ({ id_hd, tu_ngay, den_ngay, ket_luan_tong_the, data_snapshot, data_ton_dau_ky, data_nhap_trong_ky, data_xuat_trong_ky, data_ton_cuoi_ky, data_dinh_muc, data_doi_soat }) => {
  // Validate input
  if (!id_hd || !tu_ngay || !den_ngay) {
    throw new Error('Thiếu dữ liệu: id_hd, tu_ngay, den_ngay là bắt buộc');
  }

  // Kiểm tra hợp đồng tồn tại
  const hopDong = await HopDong.findByPk(id_hd);
  if (!hopDong) {
    throw new Error('Hợp đồng không tồn tại');
  }

  // Kiểm tra xem đã có báo cáo trùng lặp chưa (cùng hợp đồng, cùng kỳ báo cáo)
  const existingReport = await BaoCaoThanhKhoan.findOne({
    where: {
      id_hd,
      tu_ngay,
      den_ngay,
      trang_thai: { [Op.ne]: 'Huy' } // Không tính báo cáo đã hủy
    }
  });

  if (existingReport) {
    throw new Error('Đã tồn tại báo cáo cho hợp đồng và kỳ báo cáo này. Vui lòng kiểm tra lại hoặc cập nhật báo cáo cũ.');
  }

  // Xác định kết luận tổng thể nếu không được cung cấp
  let ketLuan = ket_luan_tong_the || 'HopLe';
  
  // Tự động xác định kết luận dựa trên data_snapshot
  if (data_snapshot) {
    const hasWarning = 
      (data_snapshot.baoCaoNXT_SP || []).some(sp => sp.ghi_chu && sp.ghi_chu.includes('Cảnh báo')) ||
      (data_snapshot.baoCaoSD_NPL || []).some(npl => npl.ghi_chu && npl.ghi_chu.includes('Cảnh báo'));
    
    if (hasWarning) {
      ketLuan = 'CanhBao';
    }
  }

  // Tạo bản ghi báo cáo mới
  const record = await BaoCaoThanhKhoan.create({
    id_hd,
    tu_ngay,
    den_ngay,
    thoi_gian_tao: new Date(),
    ket_luan_tong_the: ketLuan,
    data_snapshot,
    data_ton_dau_ky,
    data_nhap_trong_ky,
    data_xuat_trong_ky,
    data_ton_cuoi_ky,
    data_dinh_muc,
    data_doi_soat,
    trang_thai: 'HopLe'
  });

  return record;
};


// ========== API bổ sung: Cập nhật trạng thái báo cáo ==========
const updateTrangThaiBaoCao = async (id_bc, trang_thai) => {
  if (!id_bc) {
    throw new Error('Thiếu id_bc');
  }

  if (!['HopLe', 'TamKhoa', 'Huy'].includes(trang_thai)) {
    throw new Error('Trạng thái không hợp lệ. Chỉ chấp nhận: HopLe, TamKhoa, Huy');
  }

  const baoCao = await BaoCaoThanhKhoan.findByPk(id_bc);
  if (!baoCao) {
    throw new Error('Không tìm thấy báo cáo thanh khoản');
  }

  baoCao.trang_thai = trang_thai;
  await baoCao.save();

  return baoCao;
};

// ========== API bổ sung: Cập nhật báo cáo (thay vì tạo mới) ==========
const updateBaoCao = async (id_bc, { ket_luan_tong_the, data_snapshot, data_ton_dau_ky, data_nhap_trong_ky, data_xuat_trong_ky, data_ton_cuoi_ky, data_dinh_muc, data_doi_soat }) => {
  if (!id_bc) {
    throw new Error('Thiếu id_bc');
  }

  const baoCao = await BaoCaoThanhKhoan.findByPk(id_bc);
  if (!baoCao) {
    throw new Error('Không tìm thấy báo cáo thanh khoản');
  }

  // Xác định kết luận tổng thể
  let ketLuan = ket_luan_tong_the || 'HopLe';
  
  if (data_snapshot) {
    const hasWarning = 
      (data_snapshot.baoCaoNXT_SP || []).some(sp => sp.ghi_chu && sp.ghi_chu.includes('Cảnh báo')) ||
      (data_snapshot.baoCaoSD_NPL || []).some(npl => npl.ghi_chu && npl.ghi_chu.includes('Cảnh báo'));
    
    if (hasWarning) {
      ketLuan = 'CanhBao';
    }
  }

  // Cập nhật báo cáo
  baoCao.ket_luan_tong_the = ketLuan;
  baoCao.data_snapshot = data_snapshot;
  baoCao.data_ton_dau_ky = data_ton_dau_ky;
  baoCao.data_nhap_trong_ky = data_nhap_trong_ky;
  baoCao.data_xuat_trong_ky = data_xuat_trong_ky;
  baoCao.data_ton_cuoi_ky = data_ton_cuoi_ky;
  baoCao.data_dinh_muc = data_dinh_muc;
  baoCao.data_doi_soat = data_doi_soat;
  baoCao.thoi_gian_tao = new Date(); // Cập nhật thời gian
  await baoCao.save();

  return baoCao;
};

// ========== API bổ sung: Lấy danh sách báo cáo thanh khoản ==========
const getThanhKhoanReports = async ({ page = 1, limit = 10, q, ket_luan_tong_the, trang_thai, id_hd }) => {
  try {
    const offset = (page - 1) * limit;

    // WHERE conditions cho BaoCaoThanhKhoan
    const whereBC = {};
    if (ket_luan_tong_the) {
      whereBC.ket_luan_tong_the = ket_luan_tong_the;
    }
    if (trang_thai) {
      whereBC.trang_thai = trang_thai;
    }
    if (id_hd) {
      whereBC.id_hd = id_hd;
    }

    const { rows, count } = await BaoCaoThanhKhoan.findAndCountAll({
      where: whereBC,
      attributes: [
        'id_bc',
        'id_hd', // ← Thêm id_hd vào attributes
        'tu_ngay',
        'den_ngay',
        'thoi_gian_tao',
        'ket_luan_tong_the',
        'trang_thai'
      ],
      include: [
        {
          model: HopDong,
          as: 'hopdong',
          attributes: ['so_hd'],
          include: [
            {
              model: DoanhNghiep,
              as: 'doanhNghiep',
              attributes: ['ten_dn']
            }
          ]
        }
      ],
      order: [['thoi_gian_tao', 'DESC']],
      offset,
      limit,
      subQuery: false
    });

    // Filter by search query
    let filteredRows = rows;
    if (q) {
      const searchLower = q.toLowerCase();
      filteredRows = rows.filter(bc => {
        const soHd = bc.hopdong?.so_hd?.toLowerCase() || '';
        const tenDn = bc.hopdong?.doanhNghiep?.ten_dn?.toLowerCase() || '';
        return soHd.includes(searchLower) || tenDn.includes(searchLower);
      });
    }

    // Format response
    const data = filteredRows.map((bc) => ({
      id_bc: bc.id_bc,
      id_hd: bc.id_hd, // ← Thêm id_hd
      so_hd: bc.hopdong?.so_hd,
      ten_dn: bc.hopdong?.doanhNghiep?.ten_dn,
      tu_ngay: bc.tu_ngay,
      den_ngay: bc.den_ngay,
      thoi_gian_tao: bc.thoi_gian_tao,
      ket_luan_tong_the: bc.ket_luan_tong_the, // ← Sửa lại tên field
      trang_thai: bc.trang_thai
    }));

    return {
      data,
      pagination: {
        total: q ? filteredRows.length : count,
        page: Number(page),
        limit: Number(limit)
      }
    };
  } catch (error) {
    console.error('Error in getThanhKhoanReports:', error);
    throw error;
  }
};

// ========== API bổ sung: Lấy chi tiết báo cáo theo ID ==========
const getBaoCaoById = async (id_bc) => {
  const baoCao = await BaoCaoThanhKhoan.findByPk(id_bc, {
    include: [
      {
        model: HopDong,
        as: 'hopdong',
        attributes: ['so_hd'],
        include: [
          {
            model: DoanhNghiep,
            as: 'doanhNghiep',
            attributes: ['ten_dn', 'dia_chi', 'ma_so_thue']
          }
        ]
      },
      {
        model: BaoCaoThanhKhoanNPL,
        as: 'chiTietNPL',
        include: [
          {
            model: NguyenPhuLieu,
            as: 'nguyenPhuLieu',
            attributes: ['ten_npl', 'ma_npl'],
            include: [
              {
                model: DonViTinhHQ,
                as: 'donViTinhHQ',
                attributes: ['ten_dvt']
              }
            ]
          }
        ]
      },
      {
        model: BaoCaoThanhKhoanSP,
        as: 'chiTietSP',
        include: [
          {
            model: SanPham,
            as: 'sanPham',
            attributes: ['ten_sp', 'ma_sp'],
            include: [
              {
                model: DonViTinhHQ,
                as: 'donViTinhHQ',
                attributes: ['ten_dvt']
              }
            ]
          }
        ]
      }
    ]
  });

  if (!baoCao) {
    throw new Error('Không tìm thấy báo cáo thanh khoản');
  }

  // Parse data_snapshot nếu là string
  let dataSnapshot = baoCao.data_snapshot;
  if (typeof dataSnapshot === 'string') {
    try {
      dataSnapshot = JSON.parse(dataSnapshot);
    } catch (e) {
      console.error('Error parsing data_snapshot:', e);
      dataSnapshot = null;
    }
  }

  return {
    id_bc: baoCao.id_bc,
    id_hd: baoCao.id_hd,
    so_hd: baoCao.hopdong?.so_hd,
    tu_ngay: baoCao.tu_ngay,
    den_ngay: baoCao.den_ngay,
    thoi_gian_tao: baoCao.thoi_gian_tao,
    ket_luan_tong_the: baoCao.ket_luan_tong_the,
    trang_thai: baoCao.trang_thai,
    file_bao_cao: baoCao.file_bao_cao,
    thongTinChung: {
      ten_dn: baoCao.hopdong?.doanhNghiep?.ten_dn,
      dia_chi: baoCao.hopdong?.doanhNghiep?.dia_chi,
      ma_so_thue: baoCao.hopdong?.doanhNghiep?.ma_so_thue
    },
    data_snapshot: dataSnapshot,
    data_ton_dau_ky: baoCao.data_ton_dau_ky,
    data_nhap_trong_ky: baoCao.data_nhap_trong_ky,
    data_xuat_trong_ky: baoCao.data_xuat_trong_ky,
    data_ton_cuoi_ky: baoCao.data_ton_cuoi_ky,
    data_dinh_muc: baoCao.data_dinh_muc,
    data_doi_soat: baoCao.data_doi_soat,
    chiTietNPL: baoCao.chiTietNPL,
    chiTietSP: baoCao.chiTietSP
  };
};

// ========== API bổ sung: Xóa báo cáo thanh khoản ==========
const deleteBaoCao = async (id_bc) => {
  if (!id_bc) {
    throw new Error('Thiếu id_bc');
  }

  const baoCao = await BaoCaoThanhKhoan.findByPk(id_bc);
  if (!baoCao) {
    throw new Error('Không tìm thấy báo cáo thanh khoản');
  }

  await baoCao.destroy();
  return { message: 'Xóa báo cáo thành công' };
};

// ========== API mới: Generate snapshot với JSON fields ==========
const generateSnapshot = async ({ id_hd, tu_ngay, den_ngay }, id_dn) => {
  // Tính toán báo cáo
  const reportData = await calculateBaoCao({ id_hd, tu_ngay, den_ngay }, id_dn);

  // Tạo các JSON fields từ dữ liệu báo cáo
  const data_ton_dau_ky = {
    npl: reportData.baoCaoSD_NPL.map(item => ({
      id_npl: item.id_npl,
      ma_npl: item.ma_npl,
      ten_npl: item.ten_npl,
      ton_dau_ky: item.ton_dau_ky,
      don_vi_tinh: item.don_vi_tinh
    })),
    sp: reportData.baoCaoNXT_SP.map(item => ({
      id_sp: item.id_sp,
      ma_sp: item.ma_sp,
      ten_sp: item.ten_sp,
      ton_dau_ky: item.ton_dau_ky,
      don_vi_tinh: item.don_vi_tinh
    }))
  };

  const data_nhap_trong_ky = {
    npl: reportData.baoCaoSD_NPL.map(item => ({
      id_npl: item.id_npl,
      ma_npl: item.ma_npl,
      ten_npl: item.ten_npl,
      tai_nhap: item.tai_nhap,
      nhap_khac: item.nhap_khac,
      don_vi_tinh: item.don_vi_tinh
    })),
    sp: reportData.baoCaoNXT_SP.map(item => ({
      id_sp: item.id_sp,
      ma_sp: item.ma_sp,
      ten_sp: item.ten_sp,
      nhap_kho_trong_ky: item.nhap_kho_trong_ky,
      don_vi_tinh: item.don_vi_tinh
    }))
  };

  const data_xuat_trong_ky = {
    npl: reportData.baoCaoSD_NPL.map(item => ({
      id_npl: item.id_npl,
      ma_npl: item.ma_npl,
      ten_npl: item.ten_npl,
      xuat_san_pham: item.xuat_san_pham,
      thay_doi_muc_dich: item.thay_doi_muc_dich,
      don_vi_tinh: item.don_vi_tinh
    })),
    sp: reportData.baoCaoNXT_SP.map(item => ({
      id_sp: item.id_sp,
      ma_sp: item.ma_sp,
      ten_sp: item.ten_sp,
      xuat_khau: item.xuat_khau,
      xuat_khac: item.xuat_khac,
      chuyen_muc_dich: item.chuyen_muc_dich,
      don_vi_tinh: item.don_vi_tinh
    }))
  };

  const data_ton_cuoi_ky = {
    npl: reportData.baoCaoSD_NPL.map(item => ({
      id_npl: item.id_npl,
      ma_npl: item.ma_npl,
      ten_npl: item.ten_npl,
      ton_cuoi_ky: item.ton_cuoi_ky,
      don_vi_tinh: item.don_vi_tinh
    })),
    sp: reportData.baoCaoNXT_SP.map(item => ({
      id_sp: item.id_sp,
      ma_sp: item.ma_sp,
      ten_sp: item.ten_sp,
      ton_cuoi_ky: item.ton_cuoi_ky,
      don_vi_tinh: item.don_vi_tinh
    }))
  };

  const data_dinh_muc = {
    items: reportData.dinhMucThucTe.map(item => ({
      id_sp: item.id_sp,
      ma_sp: item.ma_sp,
      ten_sp: item.ten_sp,
      don_vi_tinh_sp: item.don_vi_tinh_sp,
      id_npl: item.id_npl,
      ma_npl: item.ma_npl,
      ten_npl: item.ten_npl,
      don_vi_tinh_npl: item.don_vi_tinh_npl,
      luong_sd: item.luong_sd
    }))
  };

  const data_doi_soat = {
    npl: reportData.baoCaoSD_NPL.filter(item => item.ghi_chu && item.ghi_chu.includes('Cảnh báo')).map(item => ({
      id_npl: item.id_npl,
      ma_npl: item.ma_npl,
      ten_npl: item.ten_npl,
      ghi_chu: item.ghi_chu
    })),
    sp: reportData.baoCaoNXT_SP.filter(item => item.ghi_chu && item.ghi_chu.includes('Cảnh báo')).map(item => ({
      id_sp: item.id_sp,
      ma_sp: item.ma_sp,
      ten_sp: item.ten_sp,
      ghi_chu: item.ghi_chu
    }))
  };

  return {
    ...reportData,
    data_ton_dau_ky,
    data_nhap_trong_ky,
    data_xuat_trong_ky,
    data_ton_cuoi_ky,
    data_dinh_muc,
    data_doi_soat
  };
};

// ========== API mới: Generate report với NPL và SP details ==========
const generateReport = async ({ id_hd, tu_ngay, den_ngay }, id_dn) => {
  // Tính toán báo cáo với snapshot
  const snapshotData = await generateSnapshot({ id_hd, tu_ngay, den_ngay }, id_dn);

  // Lưu báo cáo chính
  const baoCao = await saveBaoCao({
    id_hd,
    tu_ngay,
    den_ngay,
    data_snapshot: {
      thongTinChung: snapshotData.thongTinChung,
      kyBaoCao: snapshotData.kyBaoCao,
      baoCaoNXT_SP: snapshotData.baoCaoNXT_SP,
      baoCaoSD_NPL: snapshotData.baoCaoSD_NPL,
      dinhMucThucTe: snapshotData.dinhMucThucTe
    },
    data_ton_dau_ky: snapshotData.data_ton_dau_ky,
    data_nhap_trong_ky: snapshotData.data_nhap_trong_ky,
    data_xuat_trong_ky: snapshotData.data_xuat_trong_ky,
    data_ton_cuoi_ky: snapshotData.data_ton_cuoi_ky,
    data_dinh_muc: snapshotData.data_dinh_muc,
    data_doi_soat: snapshotData.data_doi_soat
  });

  // Lưu chi tiết NPL
  const nplDetails = snapshotData.baoCaoSD_NPL.map(item => ({
    id_bc: baoCao.id_bc,
    id_npl: item.id_npl,
    ton_dau_ky: item.ton_dau_ky,
    nhap_trong_ky: item.tai_nhap + item.nhap_khac,
    xuat_trong_ky: item.xuat_san_pham + item.thay_doi_muc_dich,
    ton_cuoi_ky: item.ton_cuoi_ky,
    ton_ly_thuyet: 0, // Có thể tính toán thêm nếu cần
    chenh_lech: 0,
    trang_thai: item.ghi_chu && item.ghi_chu.includes('Cảnh báo') ? 'CanhBao' : 'HopLe',
    ghi_chu: item.ghi_chu
  }));

  if (nplDetails.length > 0) {
    await BaoCaoThanhKhoanNPL.bulkCreate(nplDetails);
  }

  // Lưu chi tiết SP
  const spDetails = snapshotData.baoCaoNXT_SP.map(item => ({
    id_bc: baoCao.id_bc,
    id_sp: item.id_sp,
    ton_dau_ky: item.ton_dau_ky,
    san_xuat_trong_ky: item.nhap_kho_trong_ky, // Nhập kho = sản xuất
    xuat_trong_ky: item.xuat_khau + item.xuat_khac + item.chuyen_muc_dich,
    ton_cuoi_ky: item.ton_cuoi_ky,
    trang_thai: item.ghi_chu && item.ghi_chu.includes('Cảnh báo') ? 'CanhBao' : 'HopLe',
    ghi_chu: item.ghi_chu
  }));

  if (spDetails.length > 0) {
    await BaoCaoThanhKhoanSP.bulkCreate(spDetails);
  }

  return baoCao;
};

module.exports = { 
  getHopDongByDN, 
  calculateBaoCao, 
  saveBaoCao, 
  updateTrangThaiBaoCao,
  updateBaoCao,
  getThanhKhoanReports,
  getBaoCaoById,
  deleteBaoCao,
  generateSnapshot,
  generateReport
};
