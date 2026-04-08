'use strict';
const phieuSanXuatService = require('../services/phieusanxuat.service');

/**
 * Create a new PhieuSanXuat
 */
exports.create = async (req, res) => {
  try {
    const id_dn = req.user?.id;
    if (!id_dn) {
      return res.status(400).json({
        success: false,
        message: "Thiếu id_dn trong token!"
      });
    }
    
    const data = await phieuSanXuatService.create({ ...req.body, id_dn });
    res.status(201).json({ 
      success: true,
      message: 'Tạo phiếu sản xuất thành công', 
      data 
    });
  } catch (err) {
    res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }
};

/**
 * Get all PhieuSanXuat for the authenticated business
 */
exports.getAll = async (req, res) => {
  try {
    const id_dn = req.user?.id;
    if (!id_dn) {
      return res.status(400).json({
        success: false,
        message: "Thiếu id_dn trong token!"
      });
    }
    
    // Extract filters from query parameters
    const filters = {};
    if (req.query.trang_thai) {
      filters.trang_thai = req.query.trang_thai;
    }
    if (req.query.ca_kip) {
      filters.ca_kip = req.query.ca_kip;
    }
    if (req.query.from_date) {
      filters.from_date = req.query.from_date;
    }
    if (req.query.to_date) {
      filters.to_date = req.query.to_date;
    }
    
    const data = await phieuSanXuatService.getAll(id_dn, filters);
    res.json({ 
      success: true, 
      data 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

/**
 * Get PhieuSanXuat by ID
 */
exports.getById = async (req, res) => {
  try {
    const data = await phieuSanXuatService.getById(req.params.id);
    res.json({ 
      success: true, 
      data 
    });
  } catch (err) {
    res.status(404).json({ 
      success: false,
      error: err.message 
    });
  }
};

/**
 * Update PhieuSanXuat
 */
exports.update = async (req, res) => {
  try {
    const data = await phieuSanXuatService.update(req.params.id, req.body);
    res.json({ 
      success: true,
      message: 'Cập nhật phiếu sản xuất thành công', 
      data 
    });
  } catch (err) {
    res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }
};

/**
 * Delete PhieuSanXuat
 */
exports.delete = async (req, res) => {
  try {
    await phieuSanXuatService.delete(req.params.id);
    res.json({ 
      success: true,
      message: 'Xóa phiếu sản xuất thành công' 
    });
  } catch (err) {
    res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }
};

/**
 * Calculate completion rate for a PhieuSanXuat
 */
exports.calculateCompletionRate = async (req, res) => {
  try {
    const rate = await phieuSanXuatService.calculateCompletionRate(req.params.id);
    res.json({ 
      success: true,
      message: 'Tính toán tỷ lệ hoàn thành thành công',
      data: { ty_le_hoan_thanh: rate }
    });
  } catch (err) {
    res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }
};

/**
 * Link PhieuSanXuat to XuatKhoNPL
 */
exports.linkToXuatNPL = async (req, res) => {
  try {
    const { id_xuat_npl } = req.body;
    if (!id_xuat_npl) {
      return res.status(400).json({
        success: false,
        message: "Thiếu id_xuat_npl"
      });
    }
    
    const data = await phieuSanXuatService.linkToXuatNPL(req.params.id, id_xuat_npl);
    res.json({ 
      success: true,
      message: 'Liên kết phiếu xuất NPL thành công',
      data 
    });
  } catch (err) {
    res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }
};

/**
 * Link PhieuSanXuat to NhapKhoSP
 */
exports.linkToNhapSP = async (req, res) => {
  try {
    const { id_nhap } = req.body;
    if (!id_nhap) {
      return res.status(400).json({
        success: false,
        message: "Thiếu id_nhap"
      });
    }
    
    const data = await phieuSanXuatService.linkToNhapSP(req.params.id, id_nhap);
    res.json({ 
      success: true,
      message: 'Liên kết phiếu nhập SP thành công',
      data 
    });
  } catch (err) {
    res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }
};
