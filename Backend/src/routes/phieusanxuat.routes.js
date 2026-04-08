const express = require('express');
const router = express.Router();
const phieuSanXuatController = require('../controllers/phieusanxuat.controller');
const { authenticateToken, authorizeRole } = require('../middlewares/auth.middleware');

// All routes require authentication and business/Admin role
router.use(authenticateToken);
router.use(authorizeRole(['business', 'Admin']));

// CRUD operations
router.post('/', phieuSanXuatController.create);
router.get('/', phieuSanXuatController.getAll);
router.get('/:id', phieuSanXuatController.getById);
router.put('/:id', phieuSanXuatController.update);
router.delete('/:id', phieuSanXuatController.delete);

// Special operations - place before /:id routes to avoid conflicts
router.post('/:id/calculate-completion', phieuSanXuatController.calculateCompletionRate);
router.post('/:id/link-xuat-npl', phieuSanXuatController.linkToXuatNPL);
router.post('/:id/link-nhap-sp', phieuSanXuatController.linkToNhapSP);

module.exports = router;
