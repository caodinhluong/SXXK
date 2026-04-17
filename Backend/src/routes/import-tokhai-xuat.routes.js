'use strict';

const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middlewares/auth.middleware');
const importTokhaiService = require('../services/importTokhai.service');

// Import Tờ khai xuất từ Excel
// POST /api/to-khai-xuat/import
router.post('/', authenticateToken, authorizeRole(['business', 'Admin']), async (req, res) => {
    try {
        const { data, id_lh } = req.body;
        const id_dn = req.user.id;

        if (!data || !Array.isArray(data)) {
            return res.status(400).json({ success: false, message: 'Dữ liệu Excel không hợp lệ' });
        }

        const result = await importTokhaiService.importToKhaiXuatFromExcel(data, id_lh, id_dn);
        res.json({ 
            success: true, 
            message: `Import hoàn tất: ${result.thanh_cong} thành công, ${result.that_bai} thất bại`,
            data: result 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Import Tờ khai xuất từ định dạng hải quan (VNACCS/VCIS)
// POST /api/to-khai-xuat/import-hai-quan
router.post('/import-hai-quan', authenticateToken, authorizeRole(['business', 'Admin']), async (req, res) => {
    try {
        const { data, id_lh, loai_xuat } = req.body;
        const id_dn = req.user.id;
        const isXuat = loai_xuat !== false;

        if (!data || typeof data !== 'object') {
            return res.status(400).json({ success: false, message: 'Dữ liệu Excel không hợp lệ' });
        }

        const result = await importTokhaiService.importToKhaiFromHaiQuanExcel(data, id_lh, id_dn, isXuat);
        res.json({ 
            success: result.thanh_cong > 0, 
            message: result.thanh_cong > 0 
                ? `Import thành công tờ khai ${result.chi_tiet[0]?.so_tk}`
                : `Import thất bại: ${result.chi_tiet[0]?.loi}`,
            data: result 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get template Tờ khai xuất
// GET /api/to-khai-xuat/template
router.get('/template', authenticateToken, authorizeRole(['business', 'Admin']), async (req, res) => {
    try {
        const template = importTokhaiService.getTemplateExcelXuat();
        res.json({ success: true, data: template });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get template định dạng hải quan
// GET /api/to-khai-xuat/template-hai-quan
router.get('/template-hai-quan', authenticateToken, authorizeRole(['business', 'Admin']), async (req, res) => {
    try {
        const template = importTokhaiService.getTemplateHaiQuanExcel();
        res.json({ success: true, data: template });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Parse preview tờ khai hải quan (không lưu vào DB)
// POST /api/to-khai-xuat/parse-hai-quan
router.post('/parse-hai-quan', authenticateToken, authorizeRole(['business', 'Admin']), async (req, res) => {
    try {
        const { data } = req.body;

        if (!data || typeof data !== 'object') {
            return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ' });
        }

        const parsed = importTokhaiService.parseExcelHaiQuanToSystem(data);
        res.json({ 
            success: true, 
            data: parsed 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;