const express = require('express');
const router = express.Router();
const logController = require('../controllers/log.controller');
const { authenticateToken, authorizeRole } = require('../middlewares/auth.middleware');

// ========== Public/Internal APIs (for logging from other services) ==========

/**
 * Create a new log entry
 * POST /api/logs
 * Body: { loai_nguoi_dung, id_nguoi_dung, hanh_dong, bang_lien_quan, id_ban_ghi, du_lieu_cu, du_lieu_moi, ip_address, user_agent, ghi_chu }
 */
router.post(
  '/',
  authenticateToken,
  logController.createLog
);

// ========== Query APIs (Admin and authorized users) ==========

/**
 * Query logs with filters
 * GET /api/logs
 * Query params: loai_nguoi_dung, id_nguoi_dung, hanh_dong, bang_lien_quan, id_ban_ghi, tu_ngay, den_ngay, ip_address, page, limit, sortBy, sortOrder
 */
router.get(
  '/',
  authenticateToken,
  authorizeRole('admin'),
  logController.queryLogs
);

/**
 * Get a single log entry by ID
 * GET /api/logs/:id_log
 */
router.get(
  '/:id_log',
  authenticateToken,
  authorizeRole('admin'),
  logController.getLogById
);

/**
 * Get log statistics
 * GET /api/logs/statistics
 * Query params: tu_ngay, den_ngay
 */
router.get(
  '/stats/summary',
  authenticateToken,
  authorizeRole('admin'),
  logController.getStatistics
);

/**
 * Get logs for a specific user
 * GET /api/logs/user/:loai_nguoi_dung/:id_nguoi_dung
 * Query params: page, limit, sortBy, sortOrder
 */
router.get(
  '/user/:loai_nguoi_dung/:id_nguoi_dung',
  authenticateToken,
  authorizeRole('admin'),
  logController.getLogsByUser
);

/**
 * Get logs for a specific action type
 * GET /api/logs/action/:hanh_dong
 * Query params: page, limit, sortBy, sortOrder
 */
router.get(
  '/action/:hanh_dong',
  authenticateToken,
  authorizeRole('admin'),
  logController.getLogsByAction
);

/**
 * Get audit trail for a specific record
 * GET /api/logs/audit/:bang_lien_quan/:id_ban_ghi
 * Query params: page, limit, sortBy, sortOrder
 */
router.get(
  '/audit/:bang_lien_quan/:id_ban_ghi',
  authenticateToken,
  authorizeRole('admin'),
  logController.getAuditTrail
);

// ========== Maintenance APIs (Admin only) ==========

/**
 * Delete old logs
 * DELETE /api/logs/old/:days
 * Params: days (minimum 30)
 */
router.delete(
  '/old/:days',
  authenticateToken,
  authorizeRole('admin'),
  logController.deleteOldLogs
);

module.exports = router;
