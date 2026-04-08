'use strict';

const bienBanTieuHuyService = require('../services/bienbantieuHuy.service');

/**
 * Get all BienBanTieuHuy with filters and pagination
 * GET /api/user/bien-ban-tieu-huy
 */
const getAll = async (req, res) => {
  try {
    const id_dn = req.user?.id;
    if (!id_dn) {
      return res.status(401).json({ error: 'Không xác định được doanh nghiệp từ token' });
    }

    const { page, limit, sortBy, sortOrder, trang_thai, so_bien_ban, dia_diem, tu_ngay, den_ngay } = req.query;

    const filters = {
      id_dn,
      trang_thai,
      so_bien_ban,
      dia_diem,
      tu_ngay,
      den_ngay
    };

    const options = {
      page: page || 1,
      limit: limit || 10,
      sortBy: sortBy || 'id_bb',
      sortOrder: sortOrder || 'DESC'
    };

    const result = await bienBanTieuHuyService.getAll(filters, options);
    res.json(result);
  } catch (error) {
    console.error('Error in getAll:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get single BienBanTieuHuy by ID
 * GET /api/user/bien-ban-tieu-huy/:id_bb
 */
const getById = async (req, res) => {
  try {
    const { id_bb } = req.params;
    const id_dn = req.user?.id;

    if (!id_bb) {
      return res.status(400).json({ error: 'Thiếu id_bb' });
    }

    const report = await bienBanTieuHuyService.getById(id_bb);

    // Check if report belongs to the user's company
    if (report.id_dn !== id_dn) {
      return res.status(403).json({ error: 'Không có quyền truy cập biên bản tiêu hủy này' });
    }

    res.json(report);
  } catch (error) {
    console.error('Error in getById:', error);
    res.status(404).json({ error: error.message });
  }
};

/**
 * Create new BienBanTieuHuy
 * POST /api/user/bien-ban-tieu-huy
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

    const report = await bienBanTieuHuyService.create(data);
    
    res.status(201).json({
      message: 'Tạo biên bản tiêu hủy thành công',
      data: report
    });
  } catch (error) {
    console.error('Error in create:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * Update existing BienBanTieuHuy
 * PUT /api/user/bien-ban-tieu-huy/:id_bb
 */
const update = async (req, res) => {
  try {
    const { id_bb } = req.params;
    const id_dn = req.user?.id;

    if (!id_bb) {
      return res.status(400).json({ error: 'Thiếu id_bb' });
    }

    // Check if report exists and belongs to user's company
    const existingReport = await bienBanTieuHuyService.getById(id_bb);
    if (existingReport.id_dn !== id_dn) {
      return res.status(403).json({ error: 'Không có quyền cập nhật biên bản tiêu hủy này' });
    }

    const report = await bienBanTieuHuyService.update(id_bb, req.body);
    
    res.json({
      message: 'Cập nhật biên bản tiêu hủy thành công',
      data: report
    });
  } catch (error) {
    console.error('Error in update:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * Delete BienBanTieuHuy
 * DELETE /api/user/bien-ban-tieu-huy/:id_bb
 */
const deleteReport = async (req, res) => {
  try {
    const { id_bb } = req.params;
    const id_dn = req.user?.id;

    if (!id_bb) {
      return res.status(400).json({ error: 'Thiếu id_bb' });
    }

    // Check if report exists and belongs to user's company
    const existingReport = await bienBanTieuHuyService.getById(id_bb);
    if (existingReport.id_dn !== id_dn) {
      return res.status(403).json({ error: 'Không có quyền xóa biên bản tiêu hủy này' });
    }

    await bienBanTieuHuyService.delete(id_bb);
    
    res.json({
      message: 'Xóa biên bản tiêu hủy thành công'
    });
  } catch (error) {
    console.error('Error in delete:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * Upload file bien ban for destruction report
 * POST /api/user/bien-ban-tieu-huy/:id_bb/upload-bien-ban
 */
const uploadFileBienBan = async (req, res) => {
  try {
    const { id_bb } = req.params;
    const id_dn = req.user?.id;

    if (!id_bb) {
      return res.status(400).json({ error: 'Thiếu id_bb' });
    }

    // Check if report exists and belongs to user's company
    const existingReport = await bienBanTieuHuyService.getById(id_bb);
    if (existingReport.id_dn !== id_dn) {
      return res.status(403).json({ error: 'Không có quyền upload file cho biên bản tiêu hủy này' });
    }

    // File path should be provided in request body or from file upload middleware
    const filePath = req.body.file_bien_ban || req.file?.path;
    
    if (!filePath) {
      return res.status(400).json({ error: 'Thiếu file biên bản' });
    }

    const report = await bienBanTieuHuyService.uploadFileBienBan(id_bb, filePath);
    
    res.json({
      message: 'Upload file biên bản thành công',
      data: report
    });
  } catch (error) {
    console.error('Error in uploadFileBienBan:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * Upload images for destruction report
 * POST /api/user/bien-ban-tieu-huy/:id_bb/upload-images
 */
const uploadImages = async (req, res) => {
  try {
    const { id_bb } = req.params;
    const id_dn = req.user?.id;

    if (!id_bb) {
      return res.status(400).json({ error: 'Thiếu id_bb' });
    }

    // Check if report exists and belongs to user's company
    const existingReport = await bienBanTieuHuyService.getById(id_bb);
    if (existingReport.id_dn !== id_dn) {
      return res.status(403).json({ error: 'Không có quyền upload hình ảnh cho biên bản tiêu hủy này' });
    }

    // Image paths should be provided in request body or from file upload middleware
    const imagePaths = req.body.file_hinh_anh || (req.files ? req.files.map(f => f.path) : []);
    
    if (!imagePaths || imagePaths.length === 0) {
      return res.status(400).json({ error: 'Thiếu hình ảnh' });
    }

    const report = await bienBanTieuHuyService.uploadImages(id_bb, imagePaths);
    
    res.json({
      message: 'Upload hình ảnh thành công',
      data: report
    });
  } catch (error) {
    console.error('Error in uploadImages:', error);
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: deleteReport,
  uploadFileBienBan,
  uploadImages
};
