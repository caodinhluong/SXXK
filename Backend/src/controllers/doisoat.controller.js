'use strict';
const doiSoatService = require('../services/doisoat.service');

// ========== Import Reconciliation Controllers ==========

/**
 * Create import reconciliation
 * POST /api/doisoat/nhap
 */
const createDoiSoatNhap = async (req, res) => {
  try {
    const { id_tkn, id_nhap_kho, nguoi_doi_soat, ngay_doi_soat } = req.body;

    if (!id_tkn || !id_nhap_kho || !nguoi_doi_soat) {
      return res.status(400).json({ 
        error: 'Thiếu dữ liệu: id_tkn, id_nhap_kho, nguoi_doi_soat là bắt buộc' 
      });
    }

    const result = await doiSoatService.doiSoatNhap(req.body);
    res.status(201).json({
      message: 'Đối soát nhập thành công',
      data: result
    });
  } catch (err) {
    console.error('Error in createDoiSoatNhap:', err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * Get all import reconciliations
 * GET /api/doisoat/nhap
 */
const getDoiSoatNhap = async (req, res) => {
  try {
    const filters = {
      ket_qua: req.query.ket_qua,
      trang_thai: req.query.trang_thai,
      tu_ngay: req.query.tu_ngay,
      den_ngay: req.query.den_ngay
    };

    const results = await doiSoatService.getDoiSoatNhap(filters);
    res.json(results);
  } catch (err) {
    console.error('Error in getDoiSoatNhap:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get import reconciliation by ID
 * GET /api/doisoat/nhap/:id
 */
const getDoiSoatNhapById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await doiSoatService.getDoiSoatNhapById(id);
    res.json(result);
  } catch (err) {
    console.error('Error in getDoiSoatNhapById:', err);
    res.status(404).json({ error: err.message });
  }
};

// ========== Export Reconciliation Controllers ==========

/**
 * Create export reconciliation
 * POST /api/doisoat/xuat
 */
const createDoiSoatXuat = async (req, res) => {
  try {
    const { id_tkx, id_xuat_kho, nguoi_doi_soat, ngay_doi_soat, ma_doi_soat } = req.body;

    if (!id_tkx || !id_xuat_kho || !nguoi_doi_soat) {
      return res.status(400).json({ 
        error: 'Thiếu dữ liệu: id_tkx, id_xuat_kho, nguoi_doi_soat là bắt buộc' 
      });
    }

    const result = await doiSoatService.doiSoatXuat(req.body);
    res.status(201).json({
      message: 'Đối soát xuất thành công',
      data: result
    });
  } catch (err) {
    console.error('Error in createDoiSoatXuat:', err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * Get all export reconciliations
 * GET /api/doisoat/xuat
 */
const getDoiSoatXuat = async (req, res) => {
  try {
    const filters = {
      ket_qua: req.query.ket_qua,
      trang_thai: req.query.trang_thai,
      tu_ngay: req.query.tu_ngay,
      den_ngay: req.query.den_ngay
    };

    const results = await doiSoatService.getDoiSoatXuat(filters);
    res.json(results);
  } catch (err) {
    console.error('Error in getDoiSoatXuat:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get export reconciliation by ID
 * GET /api/doisoat/xuat/:id
 */
const getDoiSoatXuatById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await doiSoatService.getDoiSoatXuatById(id);
    res.json(result);
  } catch (err) {
    console.error('Error in getDoiSoatXuatById:', err);
    res.status(404).json({ error: err.message });
  }
};

// ========== Quota Reconciliation Controllers ==========

/**
 * Create quota reconciliation
 * POST /api/doisoat/dinhmuc
 */
const createDoiSoatDinhMuc = async (req, res) => {
  try {
    const { id_dn, id_sp, tu_ngay, den_ngay, nguoi_doi_soat, ngay_doi_soat } = req.body;

    if (!id_dn || !id_sp || !tu_ngay || !den_ngay || !nguoi_doi_soat) {
      return res.status(400).json({ 
        error: 'Thiếu dữ liệu: id_dn, id_sp, tu_ngay, den_ngay, nguoi_doi_soat là bắt buộc' 
      });
    }

    const result = await doiSoatService.doiSoatDinhMuc(req.body);
    res.status(201).json({
      message: 'Đối soát định mức thành công',
      data: result
    });
  } catch (err) {
    console.error('Error in createDoiSoatDinhMuc:', err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * Get all quota reconciliations
 * GET /api/doisoat/dinhmuc
 */
const getDoiSoatDinhMuc = async (req, res) => {
  try {
    const filters = {
      id_dn: req.query.id_dn ? Number(req.query.id_dn) : undefined,
      id_sp: req.query.id_sp ? Number(req.query.id_sp) : undefined,
      ket_luan: req.query.ket_luan,
      tu_ngay: req.query.tu_ngay,
      den_ngay: req.query.den_ngay
    };

    const results = await doiSoatService.getDoiSoatDinhMuc(filters);
    res.json(results);
  } catch (err) {
    console.error('Error in getDoiSoatDinhMuc:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get quota reconciliation by ID
 * GET /api/doisoat/dinhmuc/:id
 */
const getDoiSoatDinhMucById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await doiSoatService.getDoiSoatDinhMucById(id);
    res.json(result);
  } catch (err) {
    console.error('Error in getDoiSoatDinhMucById:', err);
    res.status(404).json({ error: err.message });
  }
};

// ========== Common Controllers ==========

/**
 * Update reconciliation status
 * PUT /api/doisoat/:type/:id/status
 */
const updateTrangThai = async (req, res) => {
  try {
    const { type, id } = req.params;
    const { trang_thai } = req.body;

    if (!trang_thai) {
      return res.status(400).json({ error: 'Thiếu trạng thái mới' });
    }

    const result = await doiSoatService.updateTrangThai(type, id, trang_thai);
    res.json({
      message: 'Cập nhật trạng thái thành công',
      data: result
    });
  } catch (err) {
    console.error('Error in updateTrangThai:', err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * Delete reconciliation
 * DELETE /api/doisoat/:type/:id
 */
const deleteDoiSoat = async (req, res) => {
  try {
    const { type, id } = req.params;

    await doiSoatService.deleteDoiSoat(type, id);
    res.json({
      message: 'Xóa đối soát thành công'
    });
  } catch (err) {
    console.error('Error in deleteDoiSoat:', err);
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  // Import reconciliation
  createDoiSoatNhap,
  getDoiSoatNhap,
  getDoiSoatNhapById,
  
  // Export reconciliation
  createDoiSoatXuat,
  getDoiSoatXuat,
  getDoiSoatXuatById,
  
  // Quota reconciliation
  createDoiSoatDinhMuc,
  getDoiSoatDinhMuc,
  getDoiSoatDinhMucById,
  
  // Common operations
  updateTrangThai,
  deleteDoiSoat
};
