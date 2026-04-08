'use strict';

const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middlewares/auth.middleware');
const phantichService = require('../services/phantich.service');

// Phát hiện thất thoát theo sản phẩm
router.get('/that-thoat', authenticateToken, authorizeRole(['business', 'Admin']), async (req, res) => {
    try {
        const { id_dn, id_sp, id_hd, tu_ngay, den_ngay } = req.query;
        const result = await phantichService.phatHienThatThoat({ id_dn, id_sp, id_hd, tu_ngay, den_ngay });
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Phát hiện tồn kho âm
router.get('/ton-kho-am', authenticateToken, authorizeRole(['business', 'Admin']), async (req, res) => {
    try {
        const { id_dn, id_kho } = req.query;
        const result = await phantichService.phatHienTonKhoAm(id_dn, id_kho);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Báo cáo thất thoát tổng hợp
router.get('/bao-cao-that-thoat', authenticateToken, authorizeRole(['business', 'Admin']), async (req, res) => {
    try {
        const { id_dn, tu_ngay, den_ngay } = req.query;
        const result = await phantichService.getBaoCaoThatThoatTongHop({ id_dn, tu_ngay, den_ngay });
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Tạo cảnh báo thất thoát
router.post('/canh-bao', authenticateToken, authorizeRole(['business', 'Admin']), async (req, res) => {
    try {
        const { id_dn, id_sp, tu_ngay, den_ngay } = req.body;
        const result = await phantichService.taoCanhBaoThatThoat({ id_dn, id_sp, tu_ngay, den_ngay });
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
