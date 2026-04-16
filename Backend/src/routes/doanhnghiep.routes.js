'use strict';

const express = require('express');
const doanhnghiepController = require('../controllers/doanhnghiep.controller');
const { authenticateToken, authorizeRole } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', authenticateToken, authorizeRole(['business', 'Admin']), doanhnghiepController.getAll);
// router.get('/:id', categoryController.getById);
// router.put('/:id', authenticateToken, authorizeRole("admin"), categoryController.update);
// router.delete('/:id', authenticateToken, authorizeRole("admin"), categoryController.deleteCategory);
router.post('/update-status', doanhnghiepController.approveBussiness);

module.exports = router;


