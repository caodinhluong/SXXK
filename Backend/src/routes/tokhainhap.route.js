'use strict';
const express = require('express');
const controller = require('../controllers/tokhainhap.controller');
const { authenticateToken, authorizeRole } = require('../middlewares/auth.middleware');
const importTokhaiService = require('../services/importTokhai.service');

const router = express.Router();

router.get('/template', authenticateToken, authorizeRole(['business', 'Admin']), async (req, res) => {
    try {
        const template = importTokhaiService.getTemplateExcelNhap();
        res.json({ success: true, data: template });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.post('/', authenticateToken, authorizeRole(['business', 'Admin']), controller.create);
router.get('/', authenticateToken, authorizeRole(['business', 'Admin']), controller.getAll);
router.get('/:id_tkn', authenticateToken, authorizeRole(['business', 'Admin']), controller.getById);
router.put('/:id_tkn', authenticateToken, authorizeRole(['business', 'Admin']), controller.update);
router.delete('/:id_tkn', authenticateToken, authorizeRole(['business', 'Admin']), controller.remove);

module.exports = router;
