'use strict';

const ExcelJS = require('exceljs');

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

const MA_LOAI_HINH_HQ_MAP = {
  'E41': 'G21',
  'E42': 'G22',
  'E43': 'G23',
  'E44': 'G24',
  'E45': 'G22',
  'E61': 'G61',
  'E11': 'G11',
  'E12': 'G12',
  'E13': 'G13',
  'E14': 'G14',
  'E15': 'G12',
  'E51': 'G51'
};

const convertDateHaiQuan = (dateStr) => {
  if (!dateStr) return null;
  const cleaned = dateStr.toString().trim();
  const match = cleaned.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (match) {
    return `${match[3]}-${match[2]}-${match[1]}`;
  }
  if (cleaned.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return cleaned;
  }
  return cleaned;
};

const mapMaLoaiHinhHaiQuan = (maHQ) => {
  if (!maHQ) return 'G21';
  const trimmed = maHQ.toString().trim().toUpperCase();
  const match = trimmed.match(/^E(\d+)/);
  if (match) {
    const maChinh = 'E' + match[1];
    return MA_LOAI_HINH_HQ_MAP[maChinh] || 'G21';
  }
  return MA_LOAI_HINH_HQ_MAP[trimmed] || 'G21';
};

const parseExcelHaiQuanToSystem = (excelData) => {
  const data = {};
  for (const [key, value] of Object.entries(excelData)) {
    if (value !== null && value !== undefined && value.toString().trim()) {
      data[key] = value.toString().trim();
    }
  }
  const soTk = data['Số tờ khai'] || data['so_tk'] || data['soToKhai'] || data['Col5'];
  const ngayTk = convertDateHaiQuan(data['Ngày đăng ký'] || data['ngay_tk'] || data['ngayToKhai']);
  const maLoaiHinh = data['Mã loại hình'] || data['ma_to_khai'] || data['maToKhai'] || 'E42';
  const maTk = mapMaLoaiHinhHaiQuan(maLoaiHinh);
  const loaiHang = data['Loại hàng'] || data['loai_hang'] || 'SanPham';
  const loaiXuat = data['Loại xuất'] || data['loai_xuat'] || loaiHang;
  const cangXuat = data['Cơ quan Hải quan tiếp nhận'] || data['cang_xuat'] || data['ten_cang'] || '';
  const maSoThue = data['Mã số thuế đại diện'] || data['ma_so_thue'] || '';
  const coQuanHQ = data['Cơ quan Hải quan'] || data['co_quan_hq'] || '';
  const maBP = data['Mã bộ phận xử lý'] || data['ma_bp'] || '';
  return {
    so_tk: soTk,
    ngay_tk: ngayTk,
    ma_to_khai: maTk,
    loai_hang: loaiHang,
    loai_xuat: loaiXuat,
    cang_xuat: cangXuat,
    ma_so_thue: maSoThue,
    co_quan_hq: coQuanHQ,
    ma_bp: maBP,
    ma_loai_hinh_hq: maLoaiHinh,
    loai_xuat: loaiHang,
    trang_thai: 'ChoXuLy'
  };
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

const importToKhaiNhapFromExcel = async (data, id_lh, id_dn) => {
  const results = {
    thanh_cong: 0,
    that_bai: 0,
    chi_tiet: []
  };

  if (!Array.isArray(data)) {
    throw new Error('Dữ liệu Excel không hợp lệ');
  }

  for (const item of data) {
    try {
      const result = await parseExcelToToKhaiNhap(item, id_lh, id_dn);
      results.thanh_cong++;
      results.chi_tiet.push({
        so_tk: result.toKhai?.so_tk,
        trang_thai: 'thanh_cong'
      });
    } catch (err) {
      results.that_bai++;
      results.chi_tiet.push({
        so_tk: item.so_tk || item.soToKhai || 'Unknown',
        trang_thai: 'that_bai',
        loi: err.message
      });
    }
  }

  return results;
};

const importToKhaiXuatFromExcel = async (data, id_lh, id_dn) => {
  const results = {
    thanh_cong: 0,
    that_bai: 0,
    chi_tiet: []
  };

  if (!Array.isArray(data)) {
    throw new Error('Dữ liệu Excel không hợp lệ');
  }

  for (const item of data) {
    try {
      const result = await parseExcelToToKhaiXuat(item, id_lh, id_dn);
      results.thanh_cong++;
      results.chi_tiet.push({
        so_tk: result.toKhai?.so_tk,
        trang_thai: 'thanh_cong'
      });
    } catch (err) {
      results.that_bai++;
      results.chi_tiet.push({
        so_tk: item.so_tk || item.soToKhai || 'Unknown',
        trang_thai: 'that_bai',
        loi: err.message
      });
    }
  }

  return results;
};

const importToKhaiFromHaiQuanExcel = async (excelData, id_lh, id_dn, loai_xuat = true) => {
  const results = {
    thanh_cong: 0,
    that_bai: 0,
    chi_tiet: [],
    du_lieu_goc: excelData,
    du_lieu_da_chuyen_doi: null
  };

  if (!excelData || typeof excelData !== 'object') {
    throw new Error('Dữ liệu Excel không hợp lệ');
  }

  try {
    const dataChuyenDoi = parseExcelHaiQuanToSystem(excelData);

    if (!dataChuyenDoi.so_tk) {
      throw new Error('Thiếu số tờ khai');
    }
    if (!dataChuyenDoi.ngay_tk) {
      throw new Error('Thiếu ngày tờ khai');
    }
    if (!id_lh) {
      throw new Error('Thiếu ID lô hàng');
    }

    const existingTk = loai_xuat 
      ? await ToKhaiXuat.findOne({ where: { so_tk: dataChuyenDoi.so_tk, id_lh } })
      : await ToKhaiNhap.findOne({ where: { so_tk: dataChuyenDoi.so_tk, id_lh } });

    if (existingTk) {
      throw new Error(`Tờ khai số ${dataChuyenDoi.so_tk} đã tồn tại cho lô hàng này`);
    }

    let toKhai;
    if (loai_xuat) {
      toKhai = await ToKhaiXuat.create({
        id_lh,
        so_tk: dataChuyenDoi.so_tk,
        ngay_tk: dataChuyenDoi.ngay_tk,
        ma_to_khai: dataChuyenDoi.ma_to_khai,
        loai_hang: dataChuyenDoi.loai_hang,
        loai_xuat: dataChuyenDoi.loai_xuat,
        cang_xuat: dataChuyenDoi.cang_xuat,
        tong_tri_gia: dataChuyenDoi.tong_tri_gia || 0,
        ghi_chu: `Import từ HQ: Mã HQ ${dataChuyenDoi.ma_loai_hinh_hq}, MST: ${dataChuyenDoi.ma_so_thue}`,
        trang_thai: 'ChoXuLy'
      });
    } else {
      toKhai = await ToKhaiNhap.create({
        id_lh,
        so_tk: dataChuyenDoi.so_tk,
        ngay_tk: dataChuyenDoi.ngay_tk,
        ma_to_khai: dataChuyenDoi.ma_to_khai,
        loai_hang: dataChuyenDoi.loai_hang,
        cang_nhap: dataChuyenDoi.cang_xuat,
        tong_tri_gia: dataChuyenDoi.tong_tri_gia || 0,
        ghi_chu: `Import từ HQ: Mã HQ ${dataChuyenDoi.ma_loai_hinh_hq}, MST: ${dataChuyenDoi.ma_so_thue}`,
        trang_thai: 'ChoXuLy'
      });
    }

    results.thanh_cong = 1;
    results.chi_tiet.push({
      so_tk: toKhai.so_tk,
      ma_to_khai_goc: dataChuyenDoi.ma_loai_hinh_hq,
      ma_to_khai: toKhai.ma_to_khai,
      trang_thai: 'thanh_cong'
    });
    results.du_lieu_da_chuyen_doi = dataChuyenDoi;

  } catch (err) {
    results.that_bai = 1;
    results.chi_tiet.push({
      so_tk: excelData['Số tờ khai'] || 'Unknown',
      trang_thai: 'that_bai',
      loi: err.message
    });
  }

  return results;
};

const getTemplateHaiQuanExcel = () => {
  return {
    ten_mau: 'Tờ khai hải quan (VNACCS/VCIS)',
    mo_ta: 'Định dạng tờ khai xuất khẩu từ hệ thống hải quan',
    cac_cot_goc: [
      { ten: 'Số tờ khai', vi_tri: 'Col5', bat_buoc: true },
      { ten: 'Mã loại hình', vi_tri: 'Col12', ghi_chu: 'E41-E61 (mã hải quan)' },
      { ten: 'Ngày đăng ký', vi_tri: 'Col6', dinh_dang: 'DD/MM/YYYY HH:mm:ss' },
      { ten: 'Cơ quan Hải quan tiếp nhận', vi_tri: 'Col10' },
      { ten: 'Mã số thuế đại diện', vi_tri: 'Col25' },
      { ten: 'Mã bộ phận xử lý tờ khai', vi_tri: 'Col25' }
    ],
    cac_cot_chuyen_doi: [
      { ten_goc: 'Số tờ khai', ten_moi: 'so_tk' },
      { ten_goc: 'Ngày đăng ký', ten_moi: 'ngay_tk', dinh_dang: 'YYYY-MM-DD' },
      { ten_goc: 'Mã loại hình', ten_moi: 'ma_to_khai', ghi_chu: 'E41->G21, E42->G22...' }
    ],
    vi_du: {
      'Số tờ khai': '305648950740',
      'Mã loại hình': 'E42',
      'Ngày đăng ký': '07/07/2023 09:10:19'
    }
  };
};

module.exports = {
  parseExcelToToKhaiNhap,
  parseExcelToToKhaiXuat,
  importToKhaiNhapFromExcel,
  importToKhaiXuatFromExcel,
  importToKhaiFromHaiQuanExcel,
  parseExcelHaiQuanToSystem,
  xacDinhThanhPhan,
  xacDinhThanhPhanXuat,
  getTemplateExcelNhap,
  getTemplateExcelXuat,
  getTemplateHaiQuanExcel,
  MA_TK_NHAP_MAP,
  MA_TK_XUAT_MAP,
  MA_LOAI_HINH_HQ_MAP,
  mapMaLoaiHinhHaiQuan,
  convertDateHaiQuan
};

const readExcelFile = async (filePath) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  
  const worksheet = workbook.getWorksheet(1);
  const rows = [];
  
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const rowData = {};
    row.eachCell((cell, colNumber) => {
      const headerCell = worksheet.getCell(1, colNumber);
      rowData[headerCell.value] = cell.value;
    });
    rows.push(rowData);
  });
  
  return rows;
};

const readExcelBuffer = async (buffer) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  
  const worksheet = workbook.getWorksheet(1);
  const headers = [];
  
  worksheet.getRow(1).eachCell((cell) => {
    headers.push(cell.value);
  });
  
  const rows = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const rowData = {};
    row.eachCell((cell, colNumber) => {
      if (headers[colNumber - 1]) {
        rowData[headers[colNumber - 1]] = cell.value;
      }
    });
    rows.push(rowData);
  });
  
  return rows;
};

module.exports = {
  parseExcelToToKhaiNhap,
  parseExcelToToKhaiXuat,
  importToKhaiNhapFromExcel,
  importToKhaiXuatFromExcel,
  importToKhaiFromHaiQuanExcel,
  parseExcelHaiQuanToSystem,
  xacDinhThanhPhan,
  xacDinhThanhPhanXuat,
  getTemplateExcelNhap,
  getTemplateExcelXuat,
  getTemplateHaiQuanExcel,
  MA_TK_NHAP_MAP,
  MA_TK_XUAT_MAP,
  MA_LOAI_HINH_HQ_MAP,
  mapMaLoaiHinhHaiQuan,
  convertDateHaiQuan,
  readExcelFile,
  readExcelBuffer
};
