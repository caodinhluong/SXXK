'use strict';

const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middlewares/auth.middleware');
const importTokhaiService = require('../services/importTokhai.service');

// Import Tờ khai nhập từ Excel
// POST /api/to-khai-nhap/import
router.post('/', authenticateToken, authorizeRole(['business', 'Admin']), async (req, res) => {
    try {
        const { data, id_lh } = req.body;
        const id_dn = req.user.id;

        if (!data || !Array.isArray(data)) {
            return res.status(400).json({ success: false, message: 'Dữ liệu Excel không hợp lệ' });
        }

        const result = await importTokhaiService.importToKhaiNhapFromExcel(data, id_lh, id_dn);
        res.json({ 
            success: true, 
            message: `Import hoàn tất: ${result.thanh_cong} thành công, ${result.that_bai} thất bại`,
            data: result 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get template Tờ khai nhập
// GET /api/to-khai-nhap/template
router.get('/template', authenticateToken, authorizeRole(['business', 'Admin']), async (req, res) => {
    try {
        const template = importTokhaiService.getTemplateExcelNhap();
        res.json({ success: true, data: template });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;