const express = require('express');
const router = express.Router();
const canhBaoController = require('../controllers/canhbao.controller');
const { authenticateToken, authorizeRole } = require('../middlewares/auth.middleware');

// ========== Alert Management Routes ==========

/**
 * Get alert statistics
 * GET /api/user/canh-bao/statistics
 */
router.get(
  '/statistics',
  authenticateToken,
  authorizeRole('business'),
  canhBaoController.getStatistics
);

/**
 * Get all alerts with filters
 * GET /api/user/canh-bao
 * Query params: loai_canh_bao, trang_thai, muc_do, tu_ngay, den_ngay, page, limit
 */
router.get(
  '/',
  authenticateToken,
  authorizeRole('business'),
  canhBaoController.getAlerts
);

/**
 * Get alert by ID
 * GET /api/user/canh-bao/:id_cb
 */
router.get(
  '/:id_cb',
  authenticateToken,
  authorizeRole('business'),
  canhBaoController.getAlertById
);

/**
 * Create negative inventory alert
 * POST /api/user/canh-bao/ton-am
 */
router.post(
  '/ton-am',
  authenticateToken,
  authorizeRole('business'),
  canhBaoController.createTonAmAlert
);

/**
 * Create quota exceeded alert
 * POST /api/user/canh-bao/vuot-dinh-muc
 */
router.post(
  '/vuot-dinh-muc',
  authenticateToken,
  authorizeRole('business'),
  canhBaoController.createVuotDinhMucAlert
);

/**
 * Create inventory discrepancy alert
 * POST /api/user/canh-bao/lech-so-kho
 */
router.post(
  '/lech-so-kho',
  authenticateToken,
  authorizeRole('business'),
  canhBaoController.createLechSoKhoAlert
);

/**
 * Mark alert as read
 * PATCH /api/user/canh-bao/:id_cb/read
 */
router.patch(
  '/:id_cb/read',
  authenticateToken,
  authorizeRole('business'),
  canhBaoController.markAsRead
);

/**
 * Mark alert as processed
 * PATCH /api/user/canh-bao/:id_cb/process
 */
router.patch(
  '/:id_cb/process',
  authenticateToken,
  authorizeRole('business'),
  canhBaoController.markAsProcessed
);

/**
 * Delete alert
 * DELETE /api/user/canh-bao/:id_cb
 */
router.delete(
  '/:id_cb',
  authenticateToken,
  authorizeRole('business'),
  canhBaoController.deleteAlert
);

module.exports = router;
