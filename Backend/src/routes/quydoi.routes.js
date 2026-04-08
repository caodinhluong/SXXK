'use strict';

const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middlewares/auth.middleware');
const quydoiService = require('../services/quydoi.service');

// Lấy danh sách quy đổi
router.get('/', authenticateToken, authorizeRole(['business', 'Admin']), async (req, res) => {
    try {
        const { id_dn } = req.query;
        const result = await quydoiService.getDanhSachQuyDoi(id_dn);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Tạo mới quy đổi
router.post('/', authenticateToken, authorizeRole(['business', 'Admin']), async (req, res) => {
    try {
        const result = await quydoiService.taoQuyDoi(req.body);
        res.json({ success: true, message: 'Tạo quy đổi thành công', data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Cập nhật quy đổi
router.put('/:id_qd', authenticateToken, authorizeRole(['business', 'Admin']), async (req, res) => {
    try {
        const result = await quydoiService.capNhatQuyDoi(req.params.id_qd, req.body);
        res.json({ success: true, message: 'Cập nhật thành công', data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Xóa quy đổi (vô hiệu hóa)
router.delete('/:id_qd', authenticateToken, authorizeRole(['business', 'Admin']), async (req, res) => {
    try {
        const result = await quydoiService.xoaQuyDoi(req.params.id_qd);
        res.json({ success: true, message: 'Đã vô hiệu hóa quy đổi' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Quy đổi số lượng
router.post('/quy-doi-so-luong', authenticateToken, authorizeRole(['business', 'Admin']), async (req, res) => {
    try {
        const { id_dn, so_luong, id_dvt_nguon, id_dvt_dich } = req.body;
        const result = await quydoiService.quyDoiSoLuong(id_dn, so_luong, id_dvt_nguon, id_dvt_dich);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
