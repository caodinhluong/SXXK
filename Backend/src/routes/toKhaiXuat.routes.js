const express = require('express');
const controller = require('../controllers/toKhaiXuat.controller');
const { authenticateToken, authorizeRole } = require('../middlewares/auth.middleware');
const importTokhaiService = require('../services/importTokhai.service');
const router = express.Router();

router.get('/template', authenticateToken, authorizeRole(['business', 'Admin']), async (req, res) => {
    try {
        const template = importTokhaiService.getTemplateExcelXuat();
        res.json({ success: true, data: template });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/', authenticateToken, authorizeRole(['business', 'Admin']), controller.getAll);
router.get('/:id', authenticateToken, authorizeRole(['business', 'Admin']), controller.getById);
router.post('/', authenticateToken, authorizeRole(['business', 'Admin']), controller.create);
router.put('/:id', authenticateToken, authorizeRole(['business', 'Admin']), controller.update);
router.delete('/:id', authenticateToken, authorizeRole(['business', 'Admin']), controller.delete);

module.exports = router;