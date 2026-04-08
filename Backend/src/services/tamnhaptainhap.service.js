'use strict';

const db = require('../models');
const { Op } = require('sequelize');

const ToKhaiNhap = db.ToKhaiNhap;
const ToKhaiXuat = db.ToKhaiXuat;
const LoHang = db.LoHang;
const SanPham = db.SanPham;
const NguyenPhuLieu = db.NguyenPhuLieu;

const taoTamNhapTaiNhap = async ({ id_dn, id_lh, ma_to_khai, so_tk, ngay_tk, loai, items, ghi_chu }) => {
  const errors = [];

  if (!id_lh || !so_tk || !ngay_tk) {
    errors.push('Thiếu thông tin bắt buộc');
  }

  if (!['G13', 'G23'].includes(ma_to_khai)) {
    errors.push('Mã tờ khai phải là G13 (tạm nhập) hoặc G23 (tạm xuất)');
  }

  if (errors.length > 0) {
    throw new Error(`Lỗi: ${errors.join(', ')}`);
  }

  const loHang = await LoHang.findByPk(id_lh);
  if (!loHang || loHang.id_dn !== id_dn) {
    throw new Error('Lô hàng không tồn tại hoặc không thuộc doanh nghiệp');
  }

  const existing = await ToKhaiNhap.findOne({
    where: { so_tk, id_lh }
  });

  if (existing) {
    throw new Error(`Tờ khai số ${so_tk} đã tồn tại cho lô hàng này`);
  }

  const thoi_han_ngay = new Date(ngay_tk);
  thoi_han_ngay.setFullYear(thoi_han_ngay.getFullYear() + 1);

  const toKhai = await ToKhaiNhap.create({
    id_lh,
    so_tk,
    ngay_tk,
    ma_to_khai,
    loai_hang: loai || 'SanPham',
    ghi_chu: ghi_chu || `Tạm nhập - Hạn trả: ${thoi_han_ngay.toISOString().split('T')[0]}`,
    trang_thai: 'ChoXuLy'
  });

  const chiTietList = [];
  for (const item of items || []) {
    const idSp = item.id_sp || item.idSP;
    const idNpl = item.id_npl || item.idNPL;
    const soLuong = parseFloat(item.so_luong || item.soLuong || 0);

    if (!idSp && !idNpl) {
      continue;
    }

    const chiTiet = await db.ToKhaiNhapChiTiet.create({
      id_tkn: toKhai.id_tkn,
      id_sp: idSp,
      id_npl: idNpl,
      so_luong: soLuong
    });
    chiTietList.push(chiTiet);
  }

  return {
    id_tkn: toKhai.id_tkn,
    so_tk: toKhai.so_tk,
    ma_to_khai: toKhai.ma_to_khai,
    ngay_tk: toKhai.ngay_tk,
    thoi_han_tra: thoi_han_ngay.toISOString().split('T')[0],
    trang_thai: toKhai.trang_thai,
    chi_tiet: chiTietList
  };
};

const taoTaiNhap = async ({ id_dn, id_lh, so_tk, ngay_tk, id_tk_lien_quan, items, ghi_chu }) => {
  const errors = [];

  if (!id_lh || !so_tk || !ngay_tk || !id_tk_lien_quan) {
    errors.push('Thiếu thông tin bắt buộc');
  }

  if (errors.length > 0) {
    throw new Error(`Lỗi: ${errors.join(', ')}`);
  }

  const toKhaiGoc = await ToKhaiNhap.findByPk(id_tk_lien_quan);
  if (!toKhaiGoc) {
    throw new Error('Tờ khai gốc (tạm nhập) không tồn tại');
  }
  if (toKhaiGoc.ma_to_khai !== 'G13') {
    throw new Error('Tờ khai gốc phải là G13 (tạm nhập)');
  }

  const existing = await ToKhaiNhap.findOne({
    where: { so_tk, id_lh }
  });

  if (existing) {
    throw new Error(`Tờ khai số ${so_tk} đã tồn tại`);
  }

  const chiTietGoc = await db.ToKhaiNhapChiTiet.findAll({
    where: { id_tkn: id_tk_lien_quan }
  });

  const tongSoLuongGoc = chiTietGoc.reduce((sum, ct) => sum + parseFloat(ct.so_luong || 0), 0);
  const daTaiNhap = await ToKhaiNhap.findAll({
    where: { id_tk_lien_quan: id_tk_lien_quan, ma_to_khai: 'G51' },
    include: [{ model: db.ToKhaiNhapChiTiet, as: 'chiTiets' }]
  });

  let daTaiNhapSum = 0;
  for (const tk of daTaiNhap) {
    if (tk.chiTiets) {
      for (const ct of tk.chiTiets) {
        daTaiNhapSum += parseFloat(ct.so_luong || 0);
      }
    }
  }

  const conLai = tongSoLuongGoc - daTaiNhapSum;

  const toKhai = await ToKhaiNhap.create({
    id_lh,
    so_tk,
    ngay_tk,
    ma_to_khai: 'G51',
    loai_hang: toKhaiGoc.loai_hang,
    thanh_phan: toKhaiGoc.loai_hang,
    id_tk_lien_quan,
    ghi_chu: ghi_chu || `Tái nhập từ tờ khai ${toKhaiGoc.so_tk}`,
    trang_thai: 'ChoXuLy'
  });

  const chiTietList = [];
  if (items && items.length > 0) {
    for (const item of items) {
      const chiTiet = await db.ToKhaiNhapChiTiet.create({
        id_tkn: toKhai.id_tkn,
        id_sp: item.id_sp || item.idSP,
        id_npl: item.id_npl || item.idNPL,
        so_luong: parseFloat(item.so_luong || item.soLuong || 0)
      });
      chiTietList.push(chiTiet);
    }
  } else {
    for (const ct of chiTietGoc) {
      const chiTiet = await db.ToKhaiNhapChiTiet.create({
        id_tkn: toKhai.id_tkn,
        id_sp: ct.id_sp,
        id_npl: ct.id_npl,
        so_luong: ct.so_luong
      });
      chiTietList.push(chiTiet);
    }
  }

  return {
    id_tkn: toKhai.id_tkn,
    so_tk: toKhai.so_tk,
    ma_to_khai: toKhai.ma_to_khai,
    id_tk_lien_quan,
    to_khai_goc: toKhaiGoc.so_tk,
    tong_so_luong_goc: tongSoLuongGoc,
    da_tai_nhap: daTaiNhapSum,
    con_lai: conLai,
    trang_thai: toKhai.trang_thai,
    chi_tiet: chiTietList
  };
};

const taoTaiXuat = async ({ id_dn, id_lh, so_tk, ngay_tk, id_tk_lien_quan, items, ghi_chu }) => {
  const errors = [];

  if (!id_lh || !so_tk || !ngay_tk || !id_tk_lien_quan) {
    errors.push('Thiếu thông tin bắt buộc');
  }

  if (errors.length > 0) {
    throw new Error(`Lỗi: ${errors.join(', ')}`);
  }

  const toKhaiGoc = await ToKhaiXuat.findByPk(id_tk_lien_quan);
  if (!toKhaiGoc) {
    throw new Error('Tờ khai gốc (tạm xuất) không tồn tại');
  }
  if (toKhaiGoc.ma_to_khai !== 'G23') {
    throw new Error('Tờ khai gốc phải là G23 (tạm xuất)');
  }

  const existing = await ToKhaiXuat.findOne({
    where: { so_tk, id_lh }
  });

  if (existing) {
    throw new Error(`Tờ khai số ${so_tk} đã tồn tại`);
  }

  const chiTietGoc = await db.ToKhaiXuatChiTiet.findAll({
    where: { id_tkx: id_tk_lien_quan }
  });

  const toKhai = await ToKhaiXuat.create({
    id_lh,
    so_tk,
    ngay_tk,
    ma_to_khai: 'G61',
    loai_hang: toKhaiGoc.loai_hang,
    loai_xuat: toKhaiGoc.loai_xuat,
    thanh_phan: toKhaiGoc.loai_hang === 'NguyenLieu' ? 'NguyenLieu' : 'SanPham',
    id_tk_lien_quan,
    ghi_chu: ghi_chu || `Tái xuất từ tờ khai ${toKhaiGoc.so_tk}`,
    trang_thai: 'ChoXuLy'
  });

  const chiTietList = [];
  if (items && items.length > 0) {
    for (const item of items) {
      const chiTiet = await db.ToKhaiXuatChiTiet.create({
        id_tkx: toKhai.id_tkx,
        id_sp: item.id_sp || item.idSP,
        id_npl: item.id_npl || item.idNPL,
        so_luong: parseFloat(item.so_luong || item.soLuong || 0)
      });
      chiTietList.push(chiTiet);
    }
  } else {
    for (const ct of chiTietGoc) {
      const chiTiet = await db.ToKhaiXuatChiTiet.create({
        id_tkx: toKhai.id_tkx,
        id_sp: ct.id_sp,
        id_npl: ct.id_npl,
        so_luong: ct.so_luong
      });
      chiTietList.push(chiTiet);
    }
  }

  return {
    id_tkx: toKhai.id_tkx,
    so_tk: toKhai.so_tk,
    ma_to_khai: toKhai.ma_to_khai,
    id_tk_lien_quan,
    to_khai_goc: toKhaiGoc.so_tk,
    trang_thai: toKhai.trang_thai,
    chi_tiet: chiTietList
  };
};

const getDanhSachTamNhap = async (id_dn) => {
  const sql = `
    SELECT 
      tk.id_tkn,
      tk.so_tk,
      tk.ngay_tk,
      tk.ma_to_khai,
      tk.trang_thai,
      tk.ghi_chu,
      lh.so_lo,
      hd.so_hd
    FROM ToKhaiNhap tk
    JOIN LoHang lh ON lh.id_lh = tk.id_lh
    JOIN HopDong hd ON hd.id_hd = lh.id_hd
    WHERE hd.id_dn = :id_dn AND tk.ma_to_khai = 'G13'
    ORDER BY tk.ngay_tk DESC
  `;

  const results = await db.sequelize.query(sql, {
    replacements: { id_dn },
    type: db.Sequelize.QueryTypes.SELECT
  });

  return results;
};

const getDanhSachTaiNhap = async (id_dn, id_tk_lien_quan) => {
  const where = { ma_to_khai: 'G51' };
  if (id_tk_lien_quan) {
    where.id_tk_lien_quan = id_tk_lien_quan;
  }

  const results = await ToKhaiNhap.findAll({
    where,
    include: [
      { model: LoHang, as: 'loHang' }
    ]
  });

  return results;
};

const getTrangThaiTamNhap = async (id_tkn) => {
  const toKhaiGoc = await ToKhaiNhap.findByPk(id_tkn, {
    include: [{ model: db.ToKhaiNhapChiTiet, as: 'chiTiets' }]
  });

  if (!toKhaiGoc || toKhaiGoc.ma_to_khai !== 'G13') {
    throw new Error('Tờ khai không tồn tại hoặc không phải tạm nhập');
  }

  const tongSoLuong = toKhaiGoc.chiTiets.reduce((sum, ct) => sum + parseFloat(ct.so_luong || 0), 0);

  const taiNhapList = await ToKhaiNhap.findAll({
    where: { id_tk_lien_quan: id_tkn, ma_to_khai: 'G51' },
    include: [{ model: db.ToKhaiNhapChiTiet, as: 'chiTiets' }]
  });

  let daTaiNhap = 0;
  for (const tk of taiNhapList) {
    if (tk.chiTiets) {
      for (const ct of tk.chiTiets) {
        daTaiNhap += parseFloat(ct.so_luong || 0);
      }
    }
  }

  const conLai = tongSoLuong - daTaiNhap;
  const tyLeTaiNhap = tongSoLuong > 0 ? ((daTaiNhap / tongSoLuong) * 100).toFixed(2) : 0;

  return {
    id_tkn: toKhaiGoc.id_tkn,
    so_tk: toKhaiGoc.so_tk,
    tong_so_luong: tongSoLuong,
    da_tai_nhap: daTaiNhap,
    con_lai: conLai,
    ty_le_tai_nhap: tyLeTaiNhap,
    trang_thai: conLai <= 0 ? 'DaTaiNhapXong' : 'ConLai',
    danh_sach_tai_nhap: taiNhapList
  };
};

module.exports = {
  taoTamNhapTaiNhap,
  taoTaiNhap,
  taoTaiXuat,
  getDanhSachTamNhap,
  getDanhSachTaiNhap,
  getTrangThaiTamNhap
};
