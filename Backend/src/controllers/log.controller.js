'use strict';
const logService = require('../services/log.service');

/**
 * Create a new log entry
 * POST /api/logs
 */
const createLog = async (req, res) => {
  try {
    const {
      loai_nguoi_dung,
      id_nguoi_dung,
      hanh_dong,
      bang_lien_quan,
      id_ban_ghi,
      du_lieu_cu,
      du_lieu_moi,
      ip_address,
      user_agent,
      ghi_chu
    } = req.body;

    // Validate required fields
    if (!loai_nguoi_dung || !id_nguoi_dung || !hanh_dong) {
      return res.status(400).json({
        error: 'Thiếu dữ liệu bắt buộc: loai_nguoi_dung, id_nguoi_dung, hanh_dong'
      });
    }

    const logEntry = await logService.log(
      loai_nguoi_dung,
      id_nguoi_dung,
      hanh_dong,
      bang_lien_quan,
      id_ban_ghi,
      du_lieu_cu,
      du_lieu_moi,
      ip_address || req.ip,
      user_agent || req.get('user-agent'),
      ghi_chu
    );

    res.status(201).json({
      message: 'Tạo log thành công',
      data: logEntry
    });
  } catch (error) {
    console.error('Error in createLog:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * Query logs with filters
 * GET /api/logs
 */
const queryLogs = async (req, res) => {
  try {
    const {
      loai_nguoi_dung,
      id_nguoi_dung,
      hanh_dong,
      bang_lien_quan,
      id_ban_ghi,
      tu_ngay,
      den_ngay,
      ip_address,
      page = 1,
      limit = 50,
      sortBy = 'ngay_tao',
      sortOrder = 'DESC'
    } = req.query;

    const result = await logService.query({
      loai_nguoi_dung,
      id_nguoi_dung: id_nguoi_dung ? parseInt(id_nguoi_dung) : undefined,
      hanh_dong,
      bang_lien_quan,
      id_ban_ghi: id_ban_ghi ? parseInt(id_ban_ghi) : undefined,
      tu_ngay,
      den_ngay,
      ip_address,
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder
    });

    res.json(result);
  } catch (error) {
    console.error('Error in queryLogs:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get a single log entry by ID
 * GET /api/logs/:id_log
 */
const getLogById = async (req, res) => {
  try {
    const { id_log } = req.params;

    if (!id_log) {
      return res.status(400).json({ error: 'Thiếu id_log' });
    }

    const logEntry = await logService.getById(parseInt(id_log));
    res.json(logEntry);
  } catch (error) {
    console.error('Error in getLogById:', error);
    res.status(404).json({ error: error.message });
  }
};

/**
 * Get logs for a specific user
 * GET /api/logs/user/:loai_nguoi_dung/:id_nguoi_dung
 */
const getLogsByUser = async (req, res) => {
  try {
    const { loai_nguoi_dung, id_nguoi_dung } = req.params;
    const { page, limit, sortBy, sortOrder } = req.query;

    if (!loai_nguoi_dung || !id_nguoi_dung) {
      return res.status(400).json({
        error: 'Thiếu loai_nguoi_dung hoặc id_nguoi_dung'
      });
    }

    const result = await logService.getByUser(
      loai_nguoi_dung,
      parseInt(id_nguoi_dung),
      {
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 50,
        sortBy: sortBy || 'ngay_tao',
        sortOrder: sortOrder || 'DESC'
      }
    );

    res.json(result);
  } catch (error) {
    console.error('Error in getLogsByUser:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get logs for a specific action type
 * GET /api/logs/action/:hanh_dong
 */
const getLogsByAction = async (req, res) => {
  try {
    const { hanh_dong } = req.params;
    const { page, limit, sortBy, sortOrder } = req.query;

    if (!hanh_dong) {
      return res.status(400).json({ error: 'Thiếu hanh_dong' });
    }

    const result = await logService.getByAction(hanh_dong, {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
      sortBy: sortBy || 'ngay_tao',
      sortOrder: sortOrder || 'DESC'
    });

    res.json(result);
  } catch (error) {
    console.error('Error in getLogsByAction:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get audit trail for a specific record
 * GET /api/logs/audit/:bang_lien_quan/:id_ban_ghi
 */
const getAuditTrail = async (req, res) => {
  try {
    const { bang_lien_quan, id_ban_ghi } = req.params;
    const { page, limit, sortBy, sortOrder } = req.query;

    if (!bang_lien_quan || !id_ban_ghi) {
      return res.status(400).json({
        error: 'Thiếu bang_lien_quan hoặc id_ban_ghi'
      });
    }

    const result = await logService.getAuditTrail(
      bang_lien_quan,
      parseInt(id_ban_ghi),
      {
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 50,
        sortBy: sortBy || 'ngay_tao',
        sortOrder: sortOrder || 'DESC'
      }
    );

    res.json(result);
  } catch (error) {
    console.error('Error in getAuditTrail:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get log statistics
 * GET /api/logs/statistics
 */
const getStatistics = async (req, res) => {
  try {
    const { tu_ngay, den_ngay } = req.query;

    const statistics = await logService.getStatistics({
      tu_ngay,
      den_ngay
    });

    res.json(statistics);
  } catch (error) {
    console.error('Error in getStatistics:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Delete old logs (Admin only)
 * DELETE /api/logs/old/:days
 */
const deleteOldLogs = async (req, res) => {
  try {
    const { days } = req.params;

    if (!days || parseInt(days) < 30) {
      return res.status(400).json({
        error: 'Số ngày phải lớn hơn hoặc bằng 30'
      });
    }

    const deletedCount = await logService.deleteOldLogs(parseInt(days));

    res.json({
      message: `Đã xóa ${deletedCount} logs cũ hơn ${days} ngày`,
      deletedCount
    });
  } catch (error) {
    console.error('Error in deleteOldLogs:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createLog,
  queryLogs,
  getLogById,
  getLogsByUser,
  getLogsByAction,
  getAuditTrail,
  getStatistics,
  deleteOldLogs
};
