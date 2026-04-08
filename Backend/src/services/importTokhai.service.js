'use strict';

const db = require('../models');
const { Op } = require('sequelize');

const ToKhaiNhap = db.ToKhaiNhap;
const ToKhaiNhapChiTiet = db.ToKhaiNhapChiTiet;
const ToKhaiXuat = db.ToKhaiXuat;
const ToKhaiXuatChiTiet = db.ToKhaiXuatChiTiet;
const LoHang = db.LoHang;
const SanPham = db.SanPham;
const NguyenPhuLieu = db.NguyenPhuLieu;
const DonViTinhHQ = db.DonViTinhHQ;

const MA_TK_NHAP_MAP = {
  'G11': 'Nhập khẩu thông thường',
  'G12': 'Nhập khẩu ưu đãi',
  'G13': 'Tạm nhập tái xuất',
  'G14': 'Chuyển khẩu',
  'G51': 'Tái nhập'
};

const MA_TK_XUAT_MAP = {
  'G21': 'Xuất khẩu thông thường',
  'G22': 'Xuất khẩu ưu đãi',
  'G23': 'Tạm xuất tái nhập',
  'G24': 'Chuyển khẩu',
  'G61': 'Tái xuất'
};

const parseExcelToToKhaiNhap = async (dataExcel, id_lh, id_dn) => {
  const errors = [];
  const warnings = [];
  const chiTietList = [];

  if (!dataExcel.so_tk && !dataExcel.soToKhai) {
    errors.push('Thiếu số tờ khai');
  }
  if (!dataExcel.ngay_tk && !dataExcel.ngayToKhai) {
    errors.push('Thiếu ngày tờ khai');
  }
  if (!id_lh) {
    errors.push('Thiếu ID lô hàng');
  }

  if (errors.length > 0) {
    throw new Error(`Lỗi validate: ${errors.join(', ')}`);
  }

  const soTk = dataExcel.so_tk || dataExcel.soToKhai;
  const ngayTk = dataExcel.ngay_tk || dataExcel.ngayToKhai;
  const maTk = dataExcel.ma_to_khai?.toUpperCase() || dataExcel.maToKhai?.toUpperCase() || 'G11';
  const loaiHang = dataExcel.loai_hang || dataExcel.loaiHang || 'NguyenLieu';

  let thanhPhan = null;
  if (maTk === 'G51') {
    thanhPhan = dataExcel.thanh_phan || dataExcel.thanhPhan || 'SanPham';
  }

  const tongTriGia = parseFloat(dataExcel.tong_tri_gia || dataExcel.tongTriGia || 0);
  const thueNhapKhau = parseFloat(dataExcel.thue_nhap_khau || dataExcel.thueNhapKhau || 0);
  const thueGtgt = parseFloat(dataExcel.thue_gtgt || dataExcel.thueGtgt || 0);
  const cangNhap = dataExcel.cang_nhap || dataExcel.cangNhap || '';
  const ghiChu = dataExcel.ghi_chu || dataExcel.ghiChu || '';

  const existingTk = await ToKhaiNhap.findOne({
    where: { so_tk: soTk, id_lh }
  });

  if (existingTk) {
    throw new Error(`Tờ khai nhập số ${soTk} đã tồn tại cho lô hàng này`);
  }

  const toKhai = await ToKhaiNhap.create({
    id_lh,
    so_tk: soTk,
    ngay_tk: ngayTk,
    ma_to_khai: maTk,
    loai_hang: loaiHang,
    thanh_phan: thanhPhan,
    cang_nhap: cangNhap,
    tong_tri_gia: tongTriGia,
    thue_nhap_khau: thueNhapKhau,
    thue_gtgt: thueGtgt,
    ghi_chu: ghiChu,
    trang_thai: 'ChoXuLy'
  });

  if (dataExcel.chiTiet && Array.isArray(dataExcel.chiTiet)) {
    for (const item of dataExcel.chiTiet) {
      const idNpl = item.id_npl || item.idNPL;
      const idSp = item.id_sp || item.idSP;
      const soLuong = parseFloat(item.so_luong || item.soLuong || 0);
      const donGia = parseFloat(item.don_gia || item.donGia || 0);

      if (!idNpl && !idSp) {
        warnings.push(`Dòng chi tiết thiếu ID NPL/SP: ${JSON.stringify(item)}`);
        continue;
      }

      const chiTiet = await ToKhaiNhapChiTiet.create({
        id_tkn: toKhai.id_tkn,
        id_npl: idNpl || null,
        id_sp: idSp || null,
        so_luong: soLuong,
        don_gia: donGia,
        thanh_tien: soLuong * donGia
      });
      chiTietList.push(chiTiet);
    }
  }

  return {
    toKhai,
    chiTietList,
    warnings
  };
};

const parseExcelToToKhaiXuat = async (dataExcel, id_lh, id_dn) => {
  const errors = [];
  const warnings = [];
  const chiTietList = [];

  if (!dataExcel.so_tk && !dataExcel.soToKhai) {
    errors.push('Thiếu số tờ khai');
  }
  if (!dataExcel.ngay_tk && !dataExcel.ngayToKhai) {
    errors.push('Thiếu ngày tờ khai');
  }
  if (!id_lh) {
    errors.push('Thiếu ID lô hàng');
  }

  if (errors.length > 0) {
    throw new Error(`Lỗi validate: ${errors.join(', ')}`);
  }

  const soTk = dataExcel.so_tk || dataExcel.soToKhai;
  const ngayTk = dataExcel.ngay_tk || dataExcel.ngayToKhai;
  const maTk = dataExcel.ma_to_khai?.toUpperCase() || dataExcel.maToKhai?.toUpperCase() || 'G21';
  const loaiHang = dataExcel.loai_hang || dataExcel.loaiHang || 'SanPham';
  const loaiXuat = dataExcel.loai_xuat || dataExcel.loaiXuat || 'SanPham';

  let thanhPhan = null;
  if (maTk === 'G61') {
    thanhPhan = dataExcel.thanh_phan || dataExcel.thanhPhan || 'SanPham';
  }

  const tongTriGia = parseFloat(dataExcel.tong_tri_gia || dataExcel.tongTriGia || 0);
  const cangXuat = dataExcel.cang_xuat || dataExcel.cangXuat || '';
  const ghiChu = dataExcel.ghi_chu || dataExcel.ghiChu || '';

  const existingTk = await ToKhaiXuat.findOne({
    where: { so_tk: soTk, id_lh }
  });

  if (existingTk) {
    throw new Error(`Tờ khai xuất số ${soTk} đã tồn tại cho lô hàng này`);
  }

  const toKhai = await ToKhaiXuat.create({
    id_lh,
    so_tk: soTk,
    ngay_tk: ngayTk,
    ma_to_khai: maTk,
    loai_hang: loaiHang,
    loai_xuat: loaiXuat,
    thanh_phan: thanhPhan,
    cang_xuat: cangXuat,
    tong_tri_gia: tongTriGia,
    ghi_chu: ghiChu,
    trang_thai: 'ChoXuLy'
  });

  if (dataExcel.chiTiet && Array.isArray(dataExcel.chiTiet)) {
    for (const item of dataExcel.chiTiet) {
      const idNpl = item.id_npl || item.idNPL;
      const idSp = item.id_sp || item.idSP;
      const soLuong = parseFloat(item.so_luong || item.soLuong || 0);
      const donGia = parseFloat(item.don_gia || item.donGia || 0);

      if (!idNpl && !idSp) {
        warnings.push(`Dòng chi tiết thiếu ID NPL/SP: ${JSON.stringify(item)}`);
        continue;
      }

      const chiTiet = await ToKhaiXuatChiTiet.create({
        id_tkx: toKhai.id_tkx,
        id_npl: idNpl || null,
        id_sp: idSp || null,
        so_luong: soLuong,
        don_gia: donGia,
        thanh_tien: soLuong * donGia
      });
      chiTietList.push(chiTiet);
    }
  }

  return {
    toKhai,
    chiTietList,
    warnings
  };
};

const xacDinhThanhPhan = async (id_tkn) => {
  const toKhai = await ToKhaiNhap.findByPk(id_tkn, {
    include: [{ model: ToKhaiNhapChiTiet, as: 'chiTiets' }]
  });

  if (!toKhai) {
    throw new Error('Tờ khai không tồn tại');
  }

  if (toKhai.ma_to_khai !== 'G51') {
    return {
      message: 'Chỉ áp dụng cho tờ khai G51 tái nhập',
      thanh_phan: null
    };
  }

  let coSP = false;
  let coNPL = false;

  for (const ct of toKhai.chiTiets) {
    if (ct.id_sp) coSP = true;
    if (ct.id_npl) coNPL = true;
  }

  let thanhPhan = null;
  if (coSP && !coNPL) {
    thanhPhan = 'SanPham';
  } else if (!coSP && coNPL) {
    thanhPhan = 'NguyenLieu';
  } else if (coSP && coNPL) {
    thanhPhan = 'SanPham';
    console.warn('Tờ khai G51 có cả SP và NPL, mặc định gán là SanPham');
  }

  if (thanhPhan) {
    toKhai.thanh_phan = thanhPhan;
    await toKhai.save();
  }

  return {
    id_tkn: toKhai.id_tkn,
    so_tk: toKhai.so_tk,
    ma_to_khai: toKhai.ma_to_khai,
    thanh_phan: thanhPhan,
    co_sp: coSP,
    co_npl: coNPL
  };
};

const xacDinhThanhPhanXuat = async (id_tkx) => {
  const toKhai = await ToKhaiXuat.findByPk(id_tkx, {
    include: [{ model: ToKhaiXuatChiTiet, as: 'chiTiets' }]
  });

  if (!toKhai) {
    throw new Error('Tờ khai không tồn tại');
  }

  if (toKhai.ma_to_khai !== 'G61') {
    return {
      message: 'Chỉ áp dụng cho tờ khai G61 tái xuất',
      thanh_phan: null
    };
  }

  let coSP = false;
  let coNPL = false;

  for (const ct of toKhai.chiTiets) {
    if (ct.id_sp) coSP = true;
    if (ct.id_npl) coNPL = true;
  }

  let thanhPhan = null;
  if (coSP && !coNPL) {
    thanhPhan = 'SanPham';
  } else if (!coSP && coNPL) {
    thanhPhan = 'NguyenLieu';
  } else if (coSP && coNPL) {
    thanhPhan = 'SanPham';
    console.warn('Tờ khai G61 có cả SP và NPL, mặc định gán là SanPham');
  }

  if (thanhPhan) {
    toKhai.thanh_phan = thanhPhan;
    await toKhai.save();
  }

  return {
    id_tkx: toKhai.id_tkx,
    so_tk: toKhai.so_tk,
    ma_to_khai: toKhai.ma_to_khai,
    thanh_phan: thanhPhan,
    co_sp: coSP,
    co_npl: coNPL
  };
};

const getTemplateExcelNhap = () => {
  return {
    ten_mau: 'Mẫu tờ khai nhập khẩu',
    cac_cot: [
      { ten: 'so_tk', mo_ta: 'Số tờ khai', bat_buoc: true },
      { ten: 'ngay_tk', mo_ta: 'Ngày tờ khai (YYYY-MM-DD)', bat_buoc: true },
      { ten: 'ma_to_khai', mo_ta: 'Mã tờ khai: G11, G12, G13, G14, G51', bat_buoc: true },
      { ten: 'loai_hang', mo_ta: 'Loại hàng: NguyenLieu, SanPham, BanThanhPham', bat_buoc: false },
      { ten: 'cang_nhap', mo_ta: 'Cảng nhập', bat_buoc: false },
      { ten: 'tong_tri_gia', mo_cha: 'Tổng trị giá', bat_buoc: false },
      { ten: 'thue_nhap_khau', mo_ta: 'Thuế nhập khẩu', bat_buoc: false },
      { ten: 'thue_gtgt', mo_ta: 'Thuế GTGT', bat_buoc: false },
      { ten: 'ghi_chu', mo_ta: 'Ghi chú', bat_buoc: false }
    ],
    chi_tiet: {
      ten_sheet: 'ChiTiet',
      cac_cot: [
        { ten: 'stt', mo_ta: 'Số thứ tự' },
        { ten: 'id_npl', mo_ta: 'ID nguyên phụ liệu (nếu là NPL)' },
        { ten: 'id_sp', mo_ta: 'ID sản phẩm (nếu là SP)' },
        { ten: 'so_luong', mo_ta: 'Số lượng', bat_buoc: true },
        { ten: 'don_gia', mo_ta: 'Đơn giá' },
        { ten: 'thanh_tien', mo_ta: 'Thành tiền' }
      ]
    },
    vi_du: {
      so_tk: 'TK20260001',
      ngay_tk: '2026-01-15',
      ma_to_khai: 'G11',
      loai_hang: 'NguyenLieu',
      cang_nhap: 'Cảng Sài Gòn',
      tong_tri_gia: 100000000,
      thue_nhap_khau: 10000000,
      thue_gtgt: 11000000
    }
  };
};

const getTemplateExcelXuat = () => {
  return {
    ten_mau: 'Mẫu tờ khai xuất khẩu',
    cac_cot: [
      { ten: 'so_tk', mo_ta: 'Số tờ khai', bat_buoc: true },
      { ten: 'ngay_tk', mo_ta: 'Ngày tờ khai (YYYY-MM-DD)', bat_buoc: true },
      { ten: 'ma_to_khai', mo_ta: 'Mã tờ khai: G21, G22, G23, G24, G61', bat_buoc: true },
      { ten: 'loai_hang', mo_ta: 'Loại hàng: NguyenLieu, SanPham, BanThanhPham', bat_buoc: false },
      { ten: 'loai_xuat', mo_ta: 'Loại xuất: SanPham, NguyenLieu, BanThanhPham', bat_buoc: false },
      { ten: 'cang_xuat', mo_ta: 'Cảng xuất', bat_buoc: false },
      { ten: 'tong_tri_gia', mo_ta: 'Tổng trị giá', bat_buoc: false },
      { ten: 'ghi_chu', mo_ta: 'Ghi chú', bat_buoc: false }
    ],
    chi_tiet: {
      ten_sheet: 'ChiTiet',
      cac_cot: [
        { ten: 'stt', mo_ta: 'Số thứ tự' },
        { ten: 'id_npl', mo_ta: 'ID nguyên phụ liệu (nếu là NPL)' },
        { ten: 'id_sp', mo_ta: 'ID sản phẩm (nếu là SP)' },
        { ten: 'so_luong', mo_ta: 'Số lượng', bat_buoc: true },
        { ten: 'don_gia', mo_ta: 'Đơn giá' },
        { ten: 'thanh_tien', mo_ta: 'Thành tiền' }
      ]
    },
    vi_du: {
      so_tk: 'TKX20260001',
      ngay_tk: '2026-02-15',
      ma_to_khai: 'G21',
      loai_hang: 'SanPham',
      loai_xuat: 'SanPham',
      cang_xuat: 'Cảng Sài Gòn',
      tong_tri_gia: 200000000,
      ghi_chu: 'Xuất khẩu theo hợp đồng số HD20260001'
    }
  };
};

module.exports = {
  parseExcelToToKhaiNhap,
  parseExcelToToKhaiXuat,
  xacDinhThanhPhan,
  xacDinhThanhPhanXuat,
  getTemplateExcelNhap,
  getTemplateExcelXuat,
  MA_TK_NHAP_MAP,
  MA_TK_XUAT_MAP
};
