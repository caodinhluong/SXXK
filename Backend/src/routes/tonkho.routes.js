'use strict';

const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middlewares/auth.middleware');
const tonkhoService = require('../services/tonkho.service');

// Lấy báo cáo tồn kho
router.get('/bao-cao', authenticateToken, authorizeRole(['business', 'Admin']), async (req, res) => {
    try {
        const { id_dn, id_kho, tu_ngay, den_ngay, loai } = req.query;
        const result = await tonkhoService.getBaoCaoTonKho({ id_dn, id_kho, tu_ngay, den_ngay, loai });
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Lấy tồn đầu kỳ
router.get('/dau-ky', authenticateToken, authorizeRole(['business', 'Admin']), async (req, res) => {
    try {
        const { id_dn, ky_bao_cao } = req.query;
        const result = await tonkhoService.getTonDauKy(id_dn, ky_bao_cao);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Nhập tồn đầu kỳ
router.post('/dau-ky', authenticateToken, authorizeRole(['business', 'Admin']), async (req, res) => {
    try {
        const result = await tonkhoService.nhapTonDauKy(req.body);
        res.json({ success: true, message: 'Nhập tồn đầu kỳ thành công', data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Lấy tồn kho hiện tại
router.get('/', authenticateToken, authorizeRole(['business', 'Admin']), async (req, res) => {
    try {
        const { id_dn, id_kho, loai } = req.query;
        const result = loai === 'NPL' 
            ? await tonkhoService.getTonKhoNPLAll(id_dn, id_kho)
            : loai === 'SP'
            ? await tonkhoService.getTonKhoSPAll(id_dn, id_kho)
            : await tonkhoService.getBaoCaoTonKho({ id_dn, id_kho });
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Lấy tồn kho NPL
router.get('/npl', authenticateToken, authorizeRole(['business', 'Admin']), async (req, res) => {
    try {
        const { id_dn, id_kho } = req.query;
        const result = await tonkhoService.getTonKhoNPLAll(id_dn, id_kho);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Lấy tồn kho SP
router.get('/sp', authenticateToken, authorizeRole(['business', 'Admin']), async (req, res) => {
    try {
        const { id_dn, id_kho } = req.query;
        const result = await tonkhoService.getTonKhoSPAll(id_dn, id_kho);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
