'use strict';
const canhBaoService = require('../services/canhbao.service');

/**
 * Get alerts by enterprise with filters
 * GET /api/user/canh-bao
 */
const getAlerts = async (req, res) => {
  try {
    const id_dn = req.user?.id;
    if (!id_dn) {
      return res.status(401).json({ error: 'Không xác định được doanh nghiệp từ token' });
    }

    const { loai_canh_bao, trang_thai, muc_do, tu_ngay, den_ngay, page, limit } = req.query;

    const filters = {
      loai_canh_bao,
      trang_thai,
      muc_do,
      tu_ngay,
      den_ngay,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10
    };

    const data = await canhBaoService.getByDoanhNghiep(id_dn, filters);
    res.json(data);
  } catch (err) {
    console.error('Error in getAlerts:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get alert by ID
 * GET /api/user/canh-bao/:id_cb
 */
const getAlertById = async (req, res) => {
  try {
    const { id_cb } = req.params;

    if (!id_cb) {
      return res.status(400).json({ error: 'Thiếu id_cb' });
    }

    const data = await canhBaoService.getById(id_cb);
    res.json(data);
  } catch (err) {
    console.error('Error in getAlertById:', err);
    res.status(404).json({ error: err.message });
  }
};

/**
 * Create negative inventory alert
 * POST /api/user/canh-bao/ton-am
 */
const createTonAmAlert = async (req, res) => {
  try {
    const id_dn = req.user?.id;
    if (!id_dn) {
      return res.status(401).json({ error: 'Không xác định được doanh nghiệp từ token' });
    }

    const data = await canhBaoService.createTonAmAlert({ ...req.body, id_dn });
    res.status(201).json({
      message: 'Tạo cảnh báo tồn kho âm thành công',
      data
    });
  } catch (err) {
    console.error('Error in createTonAmAlert:', err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * Create quota exceeded alert
 * POST /api/user/canh-bao/vuot-dinh-muc
 */
const createVuotDinhMucAlert = async (req, res) => {
  try {
    const id_dn = req.user?.id;
    if (!id_dn) {
      return res.status(401).json({ error: 'Không xác định được doanh nghiệp từ token' });
    }

    const data = await canhBaoService.createVuotDinhMucAlert({ ...req.body, id_dn });
    res.status(201).json({
      message: 'Tạo cảnh báo vượt định mức thành công',
      data
    });
  } catch (err) {
    console.error('Error in createVuotDinhMucAlert:', err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * Create inventory discrepancy alert
 * POST /api/user/canh-bao/lech-so-kho
 */
const createLechSoKhoAlert = async (req, res) => {
  try {
    const id_dn = req.user?.id;
    if (!id_dn) {
      return res.status(401).json({ error: 'Không xác định được doanh nghiệp từ token' });
    }

    const data = await canhBaoService.createLechSoKhoAlert({ ...req.body, id_dn });
    res.status(201).json({
      message: 'Tạo cảnh báo lệch số kho thành công',
      data
    });
  } catch (err) {
    console.error('Error in createLechSoKhoAlert:', err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * Mark alert as read
 * PATCH /api/user/canh-bao/:id_cb/read
 */
const markAsRead = async (req, res) => {
  try {
    const { id_cb } = req.params;

    if (!id_cb) {
      return res.status(400).json({ error: 'Thiếu id_cb' });
    }

    const data = await canhBaoService.markAsRead(id_cb);
    res.json({
      message: 'Đánh dấu đã xem thành công',
      data
    });
  } catch (err) {
    console.error('Error in markAsRead:', err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * Mark alert as processed
 * PATCH /api/user/canh-bao/:id_cb/process
 */
const markAsProcessed = async (req, res) => {
  try {
    const { id_cb } = req.params;
    const { nguoi_xu_ly } = req.body;

    if (!id_cb) {
      return res.status(400).json({ error: 'Thiếu id_cb' });
    }

    if (!nguoi_xu_ly) {
      return res.status(400).json({ error: 'Thiếu thông tin người xử lý' });
    }

    const data = await canhBaoService.markAsProcessed(id_cb, nguoi_xu_ly);
    res.json({
      message: 'Đánh dấu đã xử lý thành công',
      data
    });
  } catch (err) {
    console.error('Error in markAsProcessed:', err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * Delete alert
 * DELETE /api/user/canh-bao/:id_cb
 */
const deleteAlert = async (req, res) => {
  try {
    const { id_cb } = req.params;

    if (!id_cb) {
      return res.status(400).json({ error: 'Thiếu id_cb' });
    }

    await canhBaoService.delete(id_cb);
    res.json({
      message: 'Xóa cảnh báo thành công'
    });
  } catch (err) {
    console.error('Error in deleteAlert:', err);
    res.status(400).json({ error: err.message });
  }
};

/**
 * Get alert statistics
 * GET /api/user/canh-bao/statistics
 */
const getStatistics = async (req, res) => {
  try {
    const id_dn = req.user?.id;
    if (!id_dn) {
      return res.status(401).json({ error: 'Không xác định được doanh nghiệp từ token' });
    }

    const data = await canhBaoService.getStatistics(id_dn);
    res.json(data);
  } catch (err) {
    console.error('Error in getStatistics:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAlerts,
  getAlertById,
  createTonAmAlert,
  createVuotDinhMucAlert,
  createLechSoKhoAlert,
  markAsRead,
  markAsProcessed,
  deleteAlert,
  getStatistics
};
