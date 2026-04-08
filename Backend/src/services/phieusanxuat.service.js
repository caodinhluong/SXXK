'use strict';
const db = require('../models');
const PhieuSanXuat = db.PhieuSanXuat;
const DoanhNghiep = db.DoanhNghiep;
const XuatKhoNPL = db.XuatKhoNPL;
const SanPham = db.SanPham;
const NhapKhoSP = db.NhapKhoSP;

/**
 * Create a new PhieuSanXuat
 * @param {Object} data - PhieuSanXuat data
 * @returns {Promise<Object>} Created PhieuSanXuat
 */
const create = async (data) => {
  const { id_dn, so_phieu, ngay_sx, ca_kip, id_xuat_npl, id_sp, so_luong_ke_hoach, so_luong_thuc_te, nguoi_phu_trach, trang_thai, ghi_chu } = data;
  
  if (!id_dn || !so_phieu || !ngay_sx || !id_sp || !so_luong_ke_hoach) {
    throw new Error("Thiếu dữ liệu bắt buộc");
  }
  
  // Calculate completion rate if so_luong_thuc_te is provided
  let ty_le_hoan_thanh = null;
  if (so_luong_thuc_te && so_luong_ke_hoach > 0) {
    ty_le_hoan_thanh = (parseFloat(so_luong_thuc_te) / parseFloat(so_luong_ke_hoach)) * 100;
  }
  
  return await PhieuSanXuat.create({
    id_dn,
    so_phieu,
    ngay_sx,
    ca_kip,
    id_xuat_npl,
    id_sp,
    so_luong_ke_hoach,
    so_luong_thuc_te,
    ty_le_hoan_thanh,
    nguoi_phu_trach,
    trang_thai: trang_thai || 'KeHoach',
    ghi_chu
  });
};

/**
 * Get all PhieuSanXuat for a business with optional filters
 * @param {number} id_dn - Business ID
 * @param {Object} filters - Optional filters (trang_thai, ca_kip, from_date, to_date)
 * @returns {Promise<Array>} List of PhieuSanXuat
 */
const getAll = async (id_dn, filters = {}) => {
  const where = { id_dn };
  
  // Add status filter
  if (filters.trang_thai) {
    where.trang_thai = filters.trang_thai;
  }
  
  // Add ca_kip filter
  if (filters.ca_kip) {
    where.ca_kip = filters.ca_kip;
  }
  
  // Add date range filter
  if (filters.from_date || filters.to_date) {
    where.ngay_sx = {};
    if (filters.from_date) {
      where.ngay_sx[db.Sequelize.Op.gte] = filters.from_date;
    }
    if (filters.to_date) {
      where.ngay_sx[db.Sequelize.Op.lte] = filters.to_date;
    }
  }
  
  return await PhieuSanXuat.findAll({
    where,
    include: [
      { model: DoanhNghiep, as: 'doanhNghiep' },
      { model: XuatKhoNPL, as: 'xuatKhoNPL' },
      { model: SanPham, as: 'sanPham' },
      { model: NhapKhoSP, as: 'nhapKhoSP' }
    ],
    order: [['ngay_sx', 'DESC'], ['id_sx', 'DESC']]
  });
};

/**
 * Get PhieuSanXuat by ID
 * @param {number} id_sx - PhieuSanXuat ID
 * @returns {Promise<Object>} PhieuSanXuat
 */
const getById = async (id_sx) => {
  const phieu = await PhieuSanXuat.findByPk(id_sx, {
    include: [
      { model: DoanhNghiep, as: 'doanhNghiep' },
      { model: XuatKhoNPL, as: 'xuatKhoNPL' },
      { model: SanPham, as: 'sanPham' },
      { model: NhapKhoSP, as: 'nhapKhoSP' }
    ]
  });
  
  if (!phieu) {
    throw new Error("Không tìm thấy phiếu sản xuất");
  }
  
  return phieu;
};

/**
 * Update PhieuSanXuat
 * @param {number} id_sx - PhieuSanXuat ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} Updated PhieuSanXuat
 */
const update = async (id_sx, data) => {
  const phieu = await PhieuSanXuat.findByPk(id_sx);
  
  if (!phieu) {
    throw new Error("Không tìm thấy phiếu sản xuất");
  }
  
  // Recalculate completion rate if quantities are updated
  if (data.so_luong_thuc_te !== undefined || data.so_luong_ke_hoach !== undefined) {
    const so_luong_thuc_te = data.so_luong_thuc_te !== undefined ? data.so_luong_thuc_te : phieu.so_luong_thuc_te;
    const so_luong_ke_hoach = data.so_luong_ke_hoach !== undefined ? data.so_luong_ke_hoach : phieu.so_luong_ke_hoach;
    
    if (so_luong_thuc_te && so_luong_ke_hoach > 0) {
      data.ty_le_hoan_thanh = (parseFloat(so_luong_thuc_te) / parseFloat(so_luong_ke_hoach)) * 100;
    }
  }
  
  await phieu.update(data);
  return phieu;
};

/**
 * Delete PhieuSanXuat
 * @param {number} id_sx - PhieuSanXuat ID
 * @returns {Promise<boolean>} Success status
 */
const deletePhieu = async (id_sx) => {
  const phieu = await PhieuSanXuat.findByPk(id_sx);
  
  if (!phieu) {
    throw new Error("Không tìm thấy phiếu sản xuất");
  }
  
  await phieu.destroy();
  return true;
};

/**
 * Calculate completion rate for a PhieuSanXuat
 * @param {number} id_sx - PhieuSanXuat ID
 * @returns {Promise<number>} Completion rate percentage
 */
const calculateCompletionRate = async (id_sx) => {
  const phieu = await PhieuSanXuat.findByPk(id_sx);
  
  if (!phieu) {
    throw new Error("Không tìm thấy phiếu sản xuất");
  }
  
  if (!phieu.so_luong_thuc_te || phieu.so_luong_ke_hoach <= 0) {
    return 0;
  }
  
  const rate = (parseFloat(phieu.so_luong_thuc_te) / parseFloat(phieu.so_luong_ke_hoach)) * 100;
  
  // Update the record with calculated rate
  await phieu.update({ ty_le_hoan_thanh: rate });
  
  return rate;
};

/**
 * Link PhieuSanXuat to XuatKhoNPL
 * @param {number} id_sx - PhieuSanXuat ID
 * @param {number} id_xuat_npl - XuatKhoNPL ID
 * @returns {Promise<Object>} Updated PhieuSanXuat
 */
const linkToXuatNPL = async (id_sx, id_xuat_npl) => {
  const phieu = await PhieuSanXuat.findByPk(id_sx);
  
  if (!phieu) {
    throw new Error("Không tìm thấy phiếu sản xuất");
  }
  
  // Verify XuatKhoNPL exists
  const xuatKho = await XuatKhoNPL.findByPk(id_xuat_npl);
  if (!xuatKho) {
    throw new Error("Không tìm thấy phiếu xuất NPL");
  }
  
  await phieu.update({ id_xuat_npl });
  return phieu;
};

/**
 * Link PhieuSanXuat to NhapKhoSP
 * @param {number} id_sx - PhieuSanXuat ID
 * @param {number} id_nhap - NhapKhoSP ID
 * @returns {Promise<Object>} Updated NhapKhoSP
 */
const linkToNhapSP = async (id_sx, id_nhap) => {
  const phieu = await PhieuSanXuat.findByPk(id_sx);
  
  if (!phieu) {
    throw new Error("Không tìm thấy phiếu sản xuất");
  }
  
  // Verify NhapKhoSP exists
  const nhapKho = await NhapKhoSP.findByPk(id_nhap);
  if (!nhapKho) {
    throw new Error("Không tìm thấy phiếu nhập SP");
  }
  
  // Update NhapKhoSP to link to this PhieuSanXuat
  await nhapKho.update({ id_sx });
  return nhapKho;
};

module.exports = {
  create,
  getAll,
  getById,
  update,
  delete: deletePhieu,
  calculateCompletionRate,
  linkToXuatNPL,
  linkToNhapSP
};
