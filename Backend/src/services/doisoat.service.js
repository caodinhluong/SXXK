'use strict';

const db = require('../models');
const { Op } = require('sequelize');
const { QueryTypes } = require('sequelize');

const DoiSoatNhap = db.DoiSoatNhap;
const DoiSoatNhapChiTiet = db.DoiSoatNhapChiTiet;
const DoiSoatXuat = db.DoiSoatXuat;
const DoiSoatXuatChiTiet = db.DoiSoatXuatChiTiet;
const DoiSoatDinhMuc = db.DoiSoatDinhMuc;
const DoiSoatDinhMucChiTiet = db.DoiSoatDinhMucChiTiet;
const ToKhaiNhap = db.ToKhaiNhap;
const ToKhaiNhapChiTiet = db.ToKhaiNhapChiTiet;
const ToKhaiXuat = db.ToKhaiXuat;
const ToKhaiXuatChiTiet = db.ToKhaiXuatChiTiet;
const NhapKhoNPL = db.NhapKhoNPL;
const NhapKhoNPLChiTiet = db.NhapKhoNPLChiTiet;
const XuatKhoSP = db.XuatKhoSP;
const XuatKhoSPChiTiet = db.XuatKhoSPChiTiet;
const PhieuSanXuat = db.PhieuSanXuat;
const XuatKhoNPL = db.XuatKhoNPL;
const XuatKhoNPLChiTiet = db.XuatKhoNPLChiTiet;
const DinhMucSanPham = db.DinhMucSanPham;
const NguyenPhuLieu = db.NguyenPhuLieu;
const SanPham = db.SanPham;

/**
 * DoiSoatService - Service for reconciliation operations
 * Handles reconciliation between customs declarations and warehouse operations
 */

// ========== API 1: Đối soát Nhập (Compare ToKhaiNhap vs NhapKhoNPL) ==========

/**
 * Perform import reconciliation between customs declaration and warehouse receipt
 * @param {Object} params - Reconciliation parameters
 * @param {number} params.id_tkn - ToKhaiNhap ID
 * @param {number} params.id_nhap_kho - NhapKhoNPL ID
 * @param {string} params.nguoi_doi_soat - Person performing reconciliation
 * @param {string} params.ngay_doi_soat - Reconciliation date (YYYY-MM-DD)
 * @returns {Promise<Object>} Reconciliation result with details
 */
const doiSoatNhap = async ({ id_tkn, id_nhap_kho, nguoi_doi_soat, ngay_doi_soat }) => {
  // Validate input
  if (!id_tkn || !id_nhap_kho || !nguoi_doi_soat) {
    throw new Error('Thiếu dữ liệu: id_tkn, id_nhap_kho, nguoi_doi_soat là bắt buộc');
  }

  // Check if ToKhaiNhap exists
  const toKhai = await ToKhaiNhap.findByPk(id_tkn, {
    include: [{ 
      model: ToKhaiNhapChiTiet, 
      as: 'chiTiets',
      include: [{ model: NguyenPhuLieu, as: 'nguyenPhuLieu' }]
    }]
  });

  if (!toKhai) {
    throw new Error('Tờ khai nhập không tồn tại');
  }

  // Check if NhapKhoNPL exists
  const nhapKho = await NhapKhoNPL.findByPk(id_nhap_kho, {
    include: [{ 
      model: NhapKhoNPLChiTiet, 
      as: 'chiTiets',
      include: [{ model: NguyenPhuLieu, as: 'nguyenPhuLieu' }]
    }]
  });

  if (!nhapKho) {
    throw new Error('Phiếu nhập kho không tồn tại');
  }

  // Check if reconciliation already exists
  const existingDoiSoat = await DoiSoatNhap.findOne({
    where: { id_tkn, id_nhap_kho }
  });

  if (existingDoiSoat) {
    throw new Error('Đã tồn tại đối soát cho tờ khai và phiếu nhập kho này');
  }

  // Build comparison map: id_npl -> { sl_to_khai, sl_nhap_kho }
  const comparisonMap = {};

  // Aggregate quantities from ToKhaiNhapChiTiet
  toKhai.chiTiets.forEach(ct => {
    if (ct.id_npl) {
      if (!comparisonMap[ct.id_npl]) {
        comparisonMap[ct.id_npl] = { sl_to_khai: 0, sl_nhap_kho: 0 };
      }
      comparisonMap[ct.id_npl].sl_to_khai += Number(ct.so_luong || 0);
    }
  });

  // Aggregate quantities from NhapKhoNPLChiTiet
  nhapKho.chiTiets.forEach(ct => {
    if (!comparisonMap[ct.id_npl]) {
      comparisonMap[ct.id_npl] = { sl_to_khai: 0, sl_nhap_kho: 0 };
    }
    comparisonMap[ct.id_npl].sl_nhap_kho += Number(ct.so_luong || 0);
  });

  // Calculate discrepancies
  const chiTietList = [];
  let totalChenhLechSL = 0;
  let totalChenhLechTien = 0;
  let hasDiscrepancy = false;

  for (const id_npl_str of Object.keys(comparisonMap)) {
    const id_npl = Number(id_npl_str);
    const data = comparisonMap[id_npl];
    const chenh_lech = data.sl_nhap_kho - data.sl_to_khai;

    // Determine reason for discrepancy
    let ly_do = null;
    if (Math.abs(chenh_lech) > 0.001) {
      hasDiscrepancy = true;
      if (chenh_lech > 0) {
        ly_do = 'Nhập kho nhiều hơn tờ khai';
      } else {
        ly_do = 'Nhập kho ít hơn tờ khai';
      }
    }

    totalChenhLechSL += Math.abs(chenh_lech);

    chiTietList.push({
      id_npl,
      sl_to_khai: data.sl_to_khai,
      sl_nhap_kho: data.sl_nhap_kho,
      chenh_lech,
      ly_do
    });
  }

  // Determine reconciliation result
  let ket_qua = 'KhopDu';
  if (hasDiscrepancy) {
    ket_qua = 'ChenhLech';
  }

  // Create DoiSoatNhap record
  const doiSoat = await DoiSoatNhap.create({
    id_tkn,
    id_nhap_kho,
    ngay_doi_soat: ngay_doi_soat || new Date(),
    nguoi_doi_soat,
    ket_qua,
    chenh_lech_sl: totalChenhLechSL,
    chenh_lech_tien: totalChenhLechTien,
    ly_do_chenh_lech: hasDiscrepancy ? 'Có chênh lệch giữa tờ khai và nhập kho' : null,
    trang_thai: 'ChuaXuLy'
  });

  // Create DoiSoatNhapChiTiet records
  for (const chiTiet of chiTietList) {
    await DoiSoatNhapChiTiet.create({
      id_ds: doiSoat.id_ds,
      ...chiTiet
    });
  }

  // Fetch complete result with associations
  const result = await DoiSoatNhap.findByPk(doiSoat.id_ds, {
    include: [
      { model: ToKhaiNhap, as: 'toKhaiNhap' },
      { model: NhapKhoNPL, as: 'nhapKho' },
      { 
        model: DoiSoatNhapChiTiet, 
        as: 'chiTiets',
        include: [{ model: NguyenPhuLieu, as: 'nguyenPhuLieu' }]
      }
    ]
  });

  return result;
};


// ========== API 2: Đối soát Xuất (Compare ToKhaiXuat vs XuatKhoSP) ==========

/**
 * Perform export reconciliation between customs declaration and warehouse shipment
 * Uses reconciliation code 155 (standard for export reconciliation)
 * @param {Object} params - Reconciliation parameters
 * @param {number} params.id_tkx - ToKhaiXuat ID
 * @param {number} params.id_xuat_kho - XuatKhoSP ID
 * @param {string} params.nguoi_doi_soat - Person performing reconciliation
 * @param {string} params.ngay_doi_soat - Reconciliation date (YYYY-MM-DD)
 * @param {string} params.ma_doi_soat - Reconciliation code (default: '155')
 * @returns {Promise<Object>} Reconciliation result with details
 */
const doiSoatXuat = async ({ id_tkx, id_xuat_kho, nguoi_doi_soat, ngay_doi_soat, ma_doi_soat = '155' }) => {
  // Validate input
  if (!id_tkx || !id_xuat_kho || !nguoi_doi_soat) {
    throw new Error('Thiếu dữ liệu: id_tkx, id_xuat_kho, nguoi_doi_soat là bắt buộc');
  }

  // Check if ToKhaiXuat exists
  const toKhai = await ToKhaiXuat.findByPk(id_tkx, {
    include: [{ 
      model: ToKhaiXuatChiTiet, 
      as: 'chiTiets',
      include: [{ model: SanPham, as: 'sanPham' }]
    }]
  });

  if (!toKhai) {
    throw new Error('Tờ khai xuất không tồn tại');
  }

  // Check if XuatKhoSP exists
  const xuatKho = await XuatKhoSP.findByPk(id_xuat_kho, {
    include: [{ 
      model: XuatKhoSPChiTiet, 
      as: 'chiTiets',
      include: [{ model: SanPham, as: 'sanPham' }]
    }]
  });

  if (!xuatKho) {
    throw new Error('Phiếu xuất kho không tồn tại');
  }

  // Check if reconciliation already exists
  const existingDoiSoat = await DoiSoatXuat.findOne({
    where: { id_tkx, id_xuat_kho }
  });

  if (existingDoiSoat) {
    throw new Error('Đã tồn tại đối soát cho tờ khai và phiếu xuất kho này');
  }

  // Build comparison map: id_sp -> { sl_to_khai, sl_xuat_kho }
  const comparisonMap = {};

  // Aggregate quantities from ToKhaiXuatChiTiet
  toKhai.chiTiets.forEach(ct => {
    if (ct.id_sp) {
      if (!comparisonMap[ct.id_sp]) {
        comparisonMap[ct.id_sp] = { sl_to_khai: 0, sl_xuat_kho: 0 };
      }
      comparisonMap[ct.id_sp].sl_to_khai += Number(ct.so_luong || 0);
    }
  });

  // Aggregate quantities from XuatKhoSPChiTiet
  xuatKho.chiTiets.forEach(ct => {
    if (!comparisonMap[ct.id_sp]) {
      comparisonMap[ct.id_sp] = { sl_to_khai: 0, sl_xuat_kho: 0 };
    }
    comparisonMap[ct.id_sp].sl_xuat_kho += Number(ct.so_luong || 0);
  });

  // Calculate discrepancies
  const chiTietList = [];
  let totalChenhLechSL = 0;
  let totalChenhLechTien = 0;
  let hasDiscrepancy = false;

  for (const id_sp_str of Object.keys(comparisonMap)) {
    const id_sp = Number(id_sp_str);
    const data = comparisonMap[id_sp];
    const chenh_lech = data.sl_xuat_kho - data.sl_to_khai;

    // Determine reason for discrepancy
    let ly_do = null;
    if (Math.abs(chenh_lech) > 0.001) {
      hasDiscrepancy = true;
      if (chenh_lech > 0) {
        ly_do = 'Xuất kho nhiều hơn tờ khai';
      } else {
        ly_do = 'Xuất kho ít hơn tờ khai';
      }
    }

    totalChenhLechSL += Math.abs(chenh_lech);

    chiTietList.push({
      id_sp,
      sl_to_khai: data.sl_to_khai,
      sl_xuat_kho: data.sl_xuat_kho,
      chenh_lech,
      ly_do
    });
  }

  // Determine reconciliation result
  let ket_qua = 'KhopDu';
  if (hasDiscrepancy) {
    ket_qua = 'ChenhLech';
  }

  // Create DoiSoatXuat record with ma_doi_soat = '155'
  const doiSoat = await DoiSoatXuat.create({
    id_tkx,
    id_xuat_kho,
    ma_doi_soat,
    ngay_doi_soat: ngay_doi_soat || new Date(),
    nguoi_doi_soat,
    ket_qua,
    chenh_lech_sl: totalChenhLechSL,
    chenh_lech_tien: totalChenhLechTien,
    ly_do_chenh_lech: hasDiscrepancy ? 'Có chênh lệch giữa tờ khai và xuất kho' : null,
    trang_thai: 'ChuaXuLy'
  });

  // Create DoiSoatXuatChiTiet records
  for (const chiTiet of chiTietList) {
    await DoiSoatXuatChiTiet.create({
      id_ds: doiSoat.id_ds,
      ...chiTiet
    });
  }

  // Fetch complete result with associations
  const result = await DoiSoatXuat.findByPk(doiSoat.id_ds, {
    include: [
      { model: ToKhaiXuat, as: 'toKhaiXuat' },
      { model: XuatKhoSP, as: 'xuatKho' },
      { 
        model: DoiSoatXuatChiTiet, 
        as: 'chiTiets',
        include: [{ model: SanPham, as: 'sanPham' }]
      }
    ]
  });

  return result;
};


// ========== API 3: Đối soát Định mức (Compare quota vs actual usage) ==========

/**
 * Perform quota reconciliation - compare defined material quota vs actual usage
 * @param {Object} params - Reconciliation parameters
 * @param {number} params.id_dn - DoanhNghiep ID
 * @param {number} params.id_sp - SanPham ID
 * @param {string} params.tu_ngay - Start date (YYYY-MM-DD)
 * @param {string} params.den_ngay - End date (YYYY-MM-DD)
 * @param {string} params.nguoi_doi_soat - Person performing reconciliation
 * @param {string} params.ngay_doi_soat - Reconciliation date (YYYY-MM-DD)
 * @returns {Promise<Object>} Reconciliation result with variance analysis
 */
const doiSoatDinhMuc = async ({ id_dn, id_sp, tu_ngay, den_ngay, nguoi_doi_soat, ngay_doi_soat }) => {
  // Validate input
  if (!id_dn || !id_sp || !tu_ngay || !den_ngay || !nguoi_doi_soat) {
    throw new Error('Thiếu dữ liệu: id_dn, id_sp, tu_ngay, den_ngay, nguoi_doi_soat là bắt buộc');
  }

  // Check if SanPham exists
  const sanPham = await SanPham.findByPk(id_sp);
  if (!sanPham) {
    throw new Error('Sản phẩm không tồn tại');
  }

  // Get quota definition for this product
  const dinhMucList = await DinhMucSanPham.findAll({
    where: { id_sp },
    include: [{ model: NguyenPhuLieu, as: 'nguyenPhuLieu' }]
  });

  if (dinhMucList.length === 0) {
    throw new Error('Không tìm thấy định mức cho sản phẩm này');
  }

  // Calculate total production quantity in the period
  // Sum from PhieuSanXuat where product matches and date is in range
  const phieuSanXuatList = await PhieuSanXuat.findAll({
    where: {
      id_dn,
      id_sp,
      ngay_sx: { [Op.between]: [tu_ngay, den_ngay] },
      trang_thai: { [Op.in]: ['HoanThanh', 'DangSanXuat'] }
    }
  });

  const sl_sp_san_xuat = phieuSanXuatList.reduce((sum, phieu) => {
    return sum + Number(phieu.so_luong_thuc_te || phieu.so_luong_ke_hoach || 0);
  }, 0);

  // For each NPL in the quota, calculate actual usage
  const chiTietList = [];
  let hasVariance = false;
  let maxVariancePercent = 0;

  for (const dinhMuc of dinhMucList) {
    const id_npl = dinhMuc.id_npl;
    const sl_dinh_muc_per_unit = Number(dinhMuc.so_luong || 0);

    // Expected usage based on quota: production quantity * quota per unit
    const sl_dinh_muc = sl_sp_san_xuat * sl_dinh_muc_per_unit;

    // Calculate actual usage from XuatKhoNPL in the period
    // Get all XuatKhoNPL linked to PhieuSanXuat for this product in the period
    const xuatNPLIds = phieuSanXuatList
      .filter(p => p.id_xuat_npl)
      .map(p => p.id_xuat_npl);

    let sl_thuc_te = 0;
    if (xuatNPLIds.length > 0) {
      const sql = `
        SELECT COALESCE(SUM(ct.so_luong), 0) AS total
        FROM XuatKhoNPLChiTiet ct
        WHERE ct.id_xuat IN (?)
          AND ct.id_npl = ?
      `;
      const rows = await db.sequelize.query(sql, {
        replacements: [xuatNPLIds, id_npl],
        type: QueryTypes.SELECT
      });
      sl_thuc_te = Number(rows[0]?.total || 0);
    }

    // Calculate discrepancy
    const chenh_lech = sl_thuc_te - sl_dinh_muc;
    let ty_le_chenh_lech = 0;
    if (sl_dinh_muc > 0) {
      ty_le_chenh_lech = (chenh_lech / sl_dinh_muc) * 100;
    }

    if (Math.abs(ty_le_chenh_lech) > 0.01) {
      hasVariance = true;
      maxVariancePercent = Math.max(maxVariancePercent, Math.abs(ty_le_chenh_lech));
    }

    chiTietList.push({
      id_npl,
      sl_dinh_muc,
      sl_thuc_te,
      chenh_lech,
      ty_le_chenh_lech: Number(ty_le_chenh_lech.toFixed(2))
    });
  }

  // Determine conclusion
  let ket_luan = 'DatDinhMuc';
  if (hasVariance) {
    // If variance is within acceptable range (e.g., ±5%), still considered met
    if (maxVariancePercent > 5) {
      if (chiTietList.some(ct => ct.chenh_lech > 0)) {
        ket_luan = 'VuotDinhMuc';
      } else {
        ket_luan = 'DuoiDinhMuc';
      }
    }
  }

  // Create DoiSoatDinhMuc record
  const doiSoat = await DoiSoatDinhMuc.create({
    id_dn,
    id_sp,
    tu_ngay,
    den_ngay,
    sl_sp_san_xuat,
    ngay_doi_soat: ngay_doi_soat || new Date(),
    nguoi_doi_soat,
    ket_luan,
    ty_le_sai_lech: Number(maxVariancePercent.toFixed(2)),
    ghi_chu: hasVariance ? 'Có sai lệch giữa định mức và thực tế sử dụng' : null
  });

  // Create DoiSoatDinhMucChiTiet records
  for (const chiTiet of chiTietList) {
    await DoiSoatDinhMucChiTiet.create({
      id_ds: doiSoat.id_ds,
      ...chiTiet
    });
  }

  // Fetch complete result with associations
  const result = await DoiSoatDinhMuc.findByPk(doiSoat.id_ds, {
    include: [
      { model: SanPham, as: 'sanPham' },
      { 
        model: DoiSoatDinhMucChiTiet, 
        as: 'chiTiets',
        include: [{ model: NguyenPhuLieu, as: 'nguyenPhuLieu' }]
      }
    ]
  });

  return result;
};


// ========== Query Methods ==========

/**
 * Get all import reconciliations with filters
 * @param {Object} filters - Query filters
 * @param {number} filters.id_dn - Filter by DoanhNghiep (via ToKhaiNhap)
 * @param {string} filters.ket_qua - Filter by result (KhopDu, ChenhLech, CanXacMinh)
 * @param {string} filters.trang_thai - Filter by status
 * @param {string} filters.tu_ngay - Filter by date from
 * @param {string} filters.den_ngay - Filter by date to
 * @returns {Promise<Array>} List of reconciliations
 */
const getDoiSoatNhap = async (filters = {}) => {
  const where = {};
  
  if (filters.ket_qua) {
    where.ket_qua = filters.ket_qua;
  }
  if (filters.trang_thai) {
    where.trang_thai = filters.trang_thai;
  }
  if (filters.tu_ngay && filters.den_ngay) {
    where.ngay_doi_soat = { [Op.between]: [filters.tu_ngay, filters.den_ngay] };
  }

  const results = await DoiSoatNhap.findAll({
    where,
    include: [
      { model: ToKhaiNhap, as: 'toKhaiNhap' },
      { model: NhapKhoNPL, as: 'nhapKho' },
      { 
        model: DoiSoatNhapChiTiet, 
        as: 'chiTiets',
        include: [{ model: NguyenPhuLieu, as: 'nguyenPhuLieu' }]
      }
    ],
    order: [['ngay_doi_soat', 'DESC']]
  });

  return results;
};

/**
 * Get import reconciliation by ID
 * @param {number} id_ds - DoiSoatNhap ID
 * @returns {Promise<Object>} Reconciliation details
 */
const getDoiSoatNhapById = async (id_ds) => {
  const result = await DoiSoatNhap.findByPk(id_ds, {
    include: [
      { model: ToKhaiNhap, as: 'toKhaiNhap' },
      { model: NhapKhoNPL, as: 'nhapKho' },
      { 
        model: DoiSoatNhapChiTiet, 
        as: 'chiTiets',
        include: [{ model: NguyenPhuLieu, as: 'nguyenPhuLieu' }]
      }
    ]
  });

  if (!result) {
    throw new Error('Không tìm thấy đối soát nhập');
  }

  return result;
};

/**
 * Get all export reconciliations with filters
 * @param {Object} filters - Query filters
 * @returns {Promise<Array>} List of reconciliations
 */
const getDoiSoatXuat = async (filters = {}) => {
  const where = {};
  
  if (filters.ket_qua) {
    where.ket_qua = filters.ket_qua;
  }
  if (filters.trang_thai) {
    where.trang_thai = filters.trang_thai;
  }
  if (filters.tu_ngay && filters.den_ngay) {
    where.ngay_doi_soat = { [Op.between]: [filters.tu_ngay, filters.den_ngay] };
  }

  const results = await DoiSoatXuat.findAll({
    where,
    include: [
      { model: ToKhaiXuat, as: 'toKhaiXuat' },
      { model: XuatKhoSP, as: 'xuatKho' },
      { 
        model: DoiSoatXuatChiTiet, 
        as: 'chiTiets',
        include: [{ model: SanPham, as: 'sanPham' }]
      }
    ],
    order: [['ngay_doi_soat', 'DESC']]
  });

  return results;
};

/**
 * Get export reconciliation by ID
 * @param {number} id_ds - DoiSoatXuat ID
 * @returns {Promise<Object>} Reconciliation details
 */
const getDoiSoatXuatById = async (id_ds) => {
  const result = await DoiSoatXuat.findByPk(id_ds, {
    include: [
      { model: ToKhaiXuat, as: 'toKhaiXuat' },
      { model: XuatKhoSP, as: 'xuatKho' },
      { 
        model: DoiSoatXuatChiTiet, 
        as: 'chiTiets',
        include: [{ model: SanPham, as: 'sanPham' }]
      }
    ]
  });

  if (!result) {
    throw new Error('Không tìm thấy đối soát xuất');
  }

  return result;
};

/**
 * Get all quota reconciliations with filters
 * @param {Object} filters - Query filters
 * @returns {Promise<Array>} List of reconciliations
 */
const getDoiSoatDinhMuc = async (filters = {}) => {
  const where = {};
  
  if (filters.id_dn) {
    where.id_dn = filters.id_dn;
  }
  if (filters.id_sp) {
    where.id_sp = filters.id_sp;
  }
  if (filters.ket_luan) {
    where.ket_luan = filters.ket_luan;
  }
  if (filters.tu_ngay && filters.den_ngay) {
    where.ngay_doi_soat = { [Op.between]: [filters.tu_ngay, filters.den_ngay] };
  }

  const results = await DoiSoatDinhMuc.findAll({
    where,
    include: [
      { model: SanPham, as: 'sanPham' },
      { 
        model: DoiSoatDinhMucChiTiet, 
        as: 'chiTiets',
        include: [{ model: NguyenPhuLieu, as: 'nguyenPhuLieu' }]
      }
    ],
    order: [['ngay_doi_soat', 'DESC']]
  });

  return results;
};

/**
 * Get quota reconciliation by ID
 * @param {number} id_ds - DoiSoatDinhMuc ID
 * @returns {Promise<Object>} Reconciliation details
 */
const getDoiSoatDinhMucById = async (id_ds) => {
  const result = await DoiSoatDinhMuc.findByPk(id_ds, {
    include: [
      { model: SanPham, as: 'sanPham' },
      { 
        model: DoiSoatDinhMucChiTiet, 
        as: 'chiTiets',
        include: [{ model: NguyenPhuLieu, as: 'nguyenPhuLieu' }]
      }
    ]
  });

  if (!result) {
    throw new Error('Không tìm thấy đối soát định mức');
  }

  return result;
};

/**
 * Update reconciliation status
 * @param {string} type - Type of reconciliation ('nhap', 'xuat', 'dinhmuc')
 * @param {number} id_ds - Reconciliation ID
 * @param {string} trang_thai - New status
 * @returns {Promise<Object>} Updated reconciliation
 */
const updateTrangThai = async (type, id_ds, trang_thai) => {
  const validStatuses = ['ChuaXuLy', 'DangXuLy', 'HoanThanh', 'CanBoSung'];
  if (!validStatuses.includes(trang_thai)) {
    throw new Error('Trạng thái không hợp lệ');
  }

  let model;
  switch (type) {
    case 'nhap':
      model = DoiSoatNhap;
      break;
    case 'xuat':
      model = DoiSoatXuat;
      break;
    case 'dinhmuc':
      // DoiSoatDinhMuc doesn't have trang_thai field
      throw new Error('Đối soát định mức không có trường trạng thái');
    default:
      throw new Error('Loại đối soát không hợp lệ');
  }

  const record = await model.findByPk(id_ds);
  if (!record) {
    throw new Error('Không tìm thấy đối soát');
  }

  record.trang_thai = trang_thai;
  await record.save();

  return record;
};

/**
 * Delete reconciliation
 * @param {string} type - Type of reconciliation ('nhap', 'xuat', 'dinhmuc')
 * @param {number} id_ds - Reconciliation ID
 * @returns {Promise<boolean>} Success status
 */
const deleteDoiSoat = async (type, id_ds) => {
  let model;
  switch (type) {
    case 'nhap':
      model = DoiSoatNhap;
      break;
    case 'xuat':
      model = DoiSoatXuat;
      break;
    case 'dinhmuc':
      model = DoiSoatDinhMuc;
      break;
    default:
      throw new Error('Loại đối soát không hợp lệ');
  }

  const record = await model.findByPk(id_ds);
  if (!record) {
    throw new Error('Không tìm thấy đối soát');
  }

  await record.destroy();
  return true;
};

module.exports = {
  // Main reconciliation methods
  doiSoatNhap,
  doiSoatXuat,
  doiSoatDinhMuc,
  
  // Query methods
  getDoiSoatNhap,
  getDoiSoatNhapById,
  getDoiSoatXuat,
  getDoiSoatXuatById,
  getDoiSoatDinhMuc,
  getDoiSoatDinhMucById,
  
  // Update/Delete methods
  updateTrangThai,
  deleteDoiSoat
};
