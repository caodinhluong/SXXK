'use strict';

const hoaDonNoiDiaService = require('../services/hoadonnoidia.service');

/**
 * Get all HoaDonNoiDia with filters and pagination
 * GET /api/user/hoa-don-noi-dia
 */
const getAll = async (req, res) => {
  try {
    const id_dn = req.user?.id;
    if (!id_dn) {
      return res.status(401).json({ error: 'Không xác định được doanh nghiệp từ token' });
    }

    const { page, limit, sortBy, sortOrder, trang_thai, so_hd, khach_hang, tu_ngay, den_ngay } = req.query;

    const filters = {
      id_dn,
      trang_thai,
      so_hd,
      khach_hang,
      tu_ngay,
      den_ngay
    };

    const options = {
      page: page || 1,
      limit: limit || 10,
      sortBy: sortBy || 'id_hd_nd',
      sortOrder: sortOrder || 'DESC'
    };

    const result = await hoaDonNoiDiaService.getAll(filters, options);
    res.json(result);
  } catch (error) {
    console.error('Error in getAll:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get single HoaDonNoiDia by ID
 * GET /api/user/hoa-don-noi-dia/:id_hd_nd
 */
const getById = async (req, res) => {
  try {
    const { id_hd_nd } = req.params;
    const id_dn = req.user?.id;

    if (!id_hd_nd) {
      return res.status(400).json({ error: 'Thiếu id_hd_nd' });
    }

    const invoice = await hoaDonNoiDiaService.getById(id_hd_nd);

    // Check if invoice belongs to the user's company
    if (invoice.id_dn !== id_dn) {
      return res.status(403).json({ error: 'Không có quyền truy cập hóa đơn này' });
    }

    res.json(invoice);
  } catch (error) {
    console.error('Error in getById:', error);
    res.status(404).json({ error: error.message });
  }
};

/**
 * Create new HoaDonNoiDia
 * POST /api/user/hoa-don-noi-dia
 */
const create = async (req, res) => {
  try {
    const id_dn = req.user?.id;
    if (!id_dn) {
      return res.status(401).json({ error: 'Không xác định được doanh nghiệp từ token' });
    }

    // Add id_dn from authenticated user
    const data = {
      ...req.body,
      id_dn
    };

    const invoice = await hoaDonNoiDiaService.create(data);
    
    res.status(201).json({
      message: 'Tạo hóa đơn nội địa thành công',
      data: invoice
    });
  } catch (error) {
    console.error('Error in create:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * Update existing HoaDonNoiDia
 * PUT /api/user/hoa-don-noi-dia/:id_hd_nd
 */
const update = async (req, res) => {
  try {
    const { id_hd_nd } = req.params;
    const id_dn = req.user?.id;

    if (!id_hd_nd) {
      return res.status(400).json({ error: 'Thiếu id_hd_nd' });
    }

    // Check if invoice exists and belongs to user's company
    const existingInvoice = await hoaDonNoiDiaService.getById(id_hd_nd);
    if (existingInvoice.id_dn !== id_dn) {
      return res.status(403).json({ error: 'Không có quyền cập nhật hóa đơn này' });
    }

    const invoice = await hoaDonNoiDiaService.update(id_hd_nd, req.body);
    
    res.json({
      message: 'Cập nhật hóa đơn nội địa thành công',
      data: invoice
    });
  } catch (error) {
    console.error('Error in update:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * Delete HoaDonNoiDia
 * DELETE /api/user/hoa-don-noi-dia/:id_hd_nd
 */
const deleteInvoice = async (req, res) => {
  try {
    const { id_hd_nd } = req.params;
    const id_dn = req.user?.id;

    if (!id_hd_nd) {
      return res.status(400).json({ error: 'Thiếu id_hd_nd' });
    }

    // Check if invoice exists and belongs to user's company
    const existingInvoice = await hoaDonNoiDiaService.getById(id_hd_nd);
    if (existingInvoice.id_dn !== id_dn) {
      return res.status(403).json({ error: 'Không có quyền xóa hóa đơn này' });
    }

    await hoaDonNoiDiaService.delete(id_hd_nd);
    
    res.json({
      message: 'Xóa hóa đơn nội địa thành công'
    });
  } catch (error) {
    console.error('Error in delete:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * Calculate tax for invoice items
 * POST /api/user/hoa-don-noi-dia/calculate-tax
 */
const calculateTax = async (req, res) => {
  try {
    const { chiTiets } = req.body;

    if (!chiTiets || !Array.isArray(chiTiets) || chiTiets.length === 0) {
      return res.status(400).json({ error: 'Thiếu dữ liệu chi tiết hóa đơn' });
    }

    const totals = hoaDonNoiDiaService.calculateTotals(chiTiets);
    
    res.json(totals);
  } catch (error) {
    console.error('Error in calculateTax:', error);
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: deleteInvoice,
  calculateTax
};
