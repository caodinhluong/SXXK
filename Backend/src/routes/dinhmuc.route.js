'use strict';

const express = require('express');
const dmController = require('../controllers/dinhmuc.controller');
const { authenticateToken, authorizeRole } = require('../middlewares/auth.middleware');

const router = express.Router();

// Tất cả API đều yêu cầu xác thực và phân quyền theo id_dn
router.post('/', authenticateToken, authorizeRole(['business', 'Admin']), dmController.create);
router.get('/', authenticateToken, authorizeRole(['business', 'Admin']), dmController.getAll);
router.get('/san-pham', authenticateToken, authorizeRole(['business', 'Admin']), dmController.getSanPham);
router.get('/nguyen-lieu', authenticateToken, authorizeRole(['business', 'Admin']), dmController.getNguyenLieu);
router.get('/template', authenticateToken, authorizeRole(['business', 'Admin']), dmController.getTemplate);
router.post('/import', authenticateToken, authorizeRole(['business', 'Admin']), dmController.importExcel);
router.get('/:id_sp', authenticateToken, authorizeRole(['business', 'Admin']), dmController.getByProduct);
router.delete('/:id_dinhmuc', authenticateToken, authorizeRole(['business', 'Admin']), dmController.remove);

module.exports = router;
