const express = require('express');
const router = express.Router();
const bienBanTieuHuyController = require('../controllers/bienbantieuHuy.controller');
const { authenticateToken, authorizeRole } = require('../middlewares/auth.middleware');

// ========== APIs cho Biên bản tiêu hủy ==========

/**
 * Get all BienBanTieuHuy with filters and pagination
 * GET /api/user/bien-ban-tieu-huy
 * Query params: page, limit, sortBy, sortOrder, trang_thai, so_bien_ban, dia_diem, tu_ngay, den_ngay
 */
router.get(
  '/',
  authenticateToken,
  authorizeRole('business'),
  bienBanTieuHuyController.getAll
);

/**
 * Get single BienBanTieuHuy by ID
 * GET /api/user/bien-ban-tieu-huy/:id_bb
 */
router.get(
  '/:id_bb',
  authenticateToken,
  authorizeRole('business'),
  bienBanTieuHuyController.getById
);

/**
 * Create new BienBanTieuHuy
 * POST /api/user/bien-ban-tieu-huy
 * Body: { so_bien_ban, ngay_tieu_huy, dia_diem, ly_do, thanh_phan_tham_gia, co_quan_chung_kien, trang_thai, chiTiets: [...] }
 */
router.post(
  '/',
  authenticateToken,
  authorizeRole('business'),
  bienBanTieuHuyController.create
);

/**
 * Update existing BienBanTieuHuy
 * PUT /api/user/bien-ban-tieu-huy/:id_bb
 * Body: { so_bien_ban, ngay_tieu_huy, dia_diem, ly_do, thanh_phan_tham_gia, co_quan_chung_kien, trang_thai, chiTiets: [...] }
 */
router.put(
  '/:id_bb',
  authenticateToken,
  authorizeRole('business'),
  bienBanTieuHuyController.update
);

/**
 * Delete BienBanTieuHuy
 * DELETE /api/user/bien-ban-tieu-huy/:id_bb
 */
router.delete(
  '/:id_bb',
  authenticateToken,
  authorizeRole('business'),
  bienBanTieuHuyController.delete
);

/**
 * Upload file bien ban for destruction report
 * POST /api/user/bien-ban-tieu-huy/:id_bb/upload-bien-ban
 * Body: { file_bien_ban: "path/to/file" } or use multipart/form-data with file upload middleware
 */
router.post(
  '/:id_bb/upload-bien-ban',
  authenticateToken,
  authorizeRole('business'),
  bienBanTieuHuyController.uploadFileBienBan
);

/**
 * Upload images for destruction report
 * POST /api/user/bien-ban-tieu-huy/:id_bb/upload-images
 * Body: { file_hinh_anh: ["path1", "path2"] } or use multipart/form-data with file upload middleware
 */
router.post(
  '/:id_bb/upload-images',
  authenticateToken,
  authorizeRole('business'),
  bienBanTieuHuyController.uploadImages
);

module.exports = router;
