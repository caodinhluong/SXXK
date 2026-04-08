const express = require('express');
const router = express.Router();
const hoaDonNoiDiaController = require('../controllers/hoadonnoidia.controller');
const { authenticateToken, authorizeRole } = require('../middlewares/auth.middleware');

// ========== APIs cho Hóa đơn nội địa ==========

/**
 * Get all HoaDonNoiDia with filters and pagination
 * GET /api/user/hoa-don-noi-dia
 * Query params: page, limit, sortBy, sortOrder, trang_thai, so_hd, khach_hang, tu_ngay, den_ngay
 */
router.get(
  '/',
  authenticateToken,
  authorizeRole('business'),
  hoaDonNoiDiaController.getAll
);

/**
 * Get single HoaDonNoiDia by ID
 * GET /api/user/hoa-don-noi-dia/:id_hd_nd
 */
router.get(
  '/:id_hd_nd',
  authenticateToken,
  authorizeRole('business'),
  hoaDonNoiDiaController.getById
);

/**
 * Create new HoaDonNoiDia
 * POST /api/user/hoa-don-noi-dia
 * Body: { so_hd, ngay_hd, khach_hang, ma_so_thue_kh, dia_chi_kh, trang_thai, file_hoa_don, ghi_chu, chiTiets: [...] }
 */
router.post(
  '/',
  authenticateToken,
  authorizeRole('business'),
  hoaDonNoiDiaController.create
);

/**
 * Update existing HoaDonNoiDia
 * PUT /api/user/hoa-don-noi-dia/:id_hd_nd
 * Body: { so_hd, ngay_hd, khach_hang, ma_so_thue_kh, dia_chi_kh, trang_thai, file_hoa_don, ghi_chu, chiTiets: [...] }
 */
router.put(
  '/:id_hd_nd',
  authenticateToken,
  authorizeRole('business'),
  hoaDonNoiDiaController.update
);

/**
 * Delete HoaDonNoiDia
 * DELETE /api/user/hoa-don-noi-dia/:id_hd_nd
 */
router.delete(
  '/:id_hd_nd',
  authenticateToken,
  authorizeRole('business'),
  hoaDonNoiDiaController.delete
);

/**
 * Calculate tax for invoice items
 * POST /api/user/hoa-don-noi-dia/calculate-tax
 * Body: { chiTiets: [{ id_sp/id_npl, so_luong, don_gia, thue_suat }] }
 */
router.post(
  '/calculate-tax',
  authenticateToken,
  authorizeRole('business'),
  hoaDonNoiDiaController.calculateTax
);

module.exports = router;
