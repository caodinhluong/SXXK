const express = require('express');
const router = express.Router();
const doiSoatController = require('../controllers/doisoat.controller');
const { authenticateToken, authorizeRole } = require('../middlewares/auth.middleware');

// ========== Import Reconciliation Routes ==========

// Create import reconciliation
// POST /api/user/doisoat/nhap
router.post(
  '/nhap',
  authenticateToken,
  authorizeRole('business'),
  doiSoatController.createDoiSoatNhap
);

// Get all import reconciliations
// GET /api/user/doisoat/nhap
router.get(
  '/nhap',
  authenticateToken,
  authorizeRole('business'),
  doiSoatController.getDoiSoatNhap
);

// Get import reconciliation by ID
// GET /api/user/doisoat/nhap/:id
router.get(
  '/nhap/:id',
  authenticateToken,
  authorizeRole('business'),
  doiSoatController.getDoiSoatNhapById
);

// ========== Export Reconciliation Routes ==========

// Create export reconciliation
// POST /api/user/doisoat/xuat
router.post(
  '/xuat',
  authenticateToken,
  authorizeRole('business'),
  doiSoatController.createDoiSoatXuat
);

// Get all export reconciliations
// GET /api/user/doisoat/xuat
router.get(
  '/xuat',
  authenticateToken,
  authorizeRole('business'),
  doiSoatController.getDoiSoatXuat
);

// Get export reconciliation by ID
// GET /api/user/doisoat/xuat/:id
router.get(
  '/xuat/:id',
  authenticateToken,
  authorizeRole('business'),
  doiSoatController.getDoiSoatXuatById
);

// ========== Quota Reconciliation Routes ==========

// Create quota reconciliation
// POST /api/user/doisoat/dinhmuc
router.post(
  '/dinhmuc',
  authenticateToken,
  authorizeRole('business'),
  doiSoatController.createDoiSoatDinhMuc
);

// Get all quota reconciliations
// GET /api/user/doisoat/dinhmuc
router.get(
  '/dinhmuc',
  authenticateToken,
  authorizeRole('business'),
  doiSoatController.getDoiSoatDinhMuc
);

// Get quota reconciliation by ID
// GET /api/user/doisoat/dinhmuc/:id
router.get(
  '/dinhmuc/:id',
  authenticateToken,
  authorizeRole('business'),
  doiSoatController.getDoiSoatDinhMucById
);

// ========== Common Routes ==========

// Update reconciliation status
// PUT /api/user/doisoat/:type/:id/status
router.put(
  '/:type/:id/status',
  authenticateToken,
  authorizeRole('business'),
  doiSoatController.updateTrangThai
);

// Delete reconciliation
// DELETE /api/user/doisoat/:type/:id
router.delete(
  '/:type/:id',
  authenticateToken,
  authorizeRole('business'),
  doiSoatController.deleteDoiSoat
);

module.exports = router;
