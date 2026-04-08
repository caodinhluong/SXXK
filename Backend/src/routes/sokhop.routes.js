'use strict';

const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middlewares/auth.middleware');
const sokhopService = require('../services/sokhop.service');

// So khớp tờ khai xuất với phiếu xuất kho (Mã 155)
router.post('/', authenticateToken, authorizeRole(['business', 'Admin']), async (req, res) => {
    try {
        const { id_tkx, id_xuat_kho, nguoi_khop, ngay_khop } = req.body;
        const result = await sokhopService.soKhopToKhaiXuatVoiPhieuXuat({
            id_tkx, id_xuat_kho, nguoi_khop, ngay_khop
        });
        res.json({ success: true, message: 'So khớp thành công', data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Lấy danh sách chưa khớp
router.get('/chua-khop', authenticateToken, authorizeRole(['business', 'Admin']), async (req, res) => {
    try {
        const { id_dn, loai } = req.query;
        const result = await sokhopService.getDanhSachChuaKhop(id_dn, loai);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Lấy báo cáo so khớp
router.get('/bao-cao', authenticateToken, authorizeRole(['business', 'Admin']), async (req, res) => {
    try {
        const { id_dn, tu_ngay, den_ngay } = req.query;
        const result = await sokhopService.getBaoCaoSoKhop(id_dn, tu_ngay, den_ngay);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Lấy chi tiết so khớp
router.get('/:id_ds', authenticateToken, authorizeRole(['business', 'Admin']), async (req, res) => {
    try {
        const result = await sokhopService.getChiTietSoKhop(req.params.id_ds);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
