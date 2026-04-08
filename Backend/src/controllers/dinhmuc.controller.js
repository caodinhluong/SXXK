'use strict';

const dmService = require('../services/dinhmuc.service');

const create = async (req, res) => {
  try {
    const id_dn = req.user?.id;
    const role = req.user?.role;

    if (!id_dn && role !== 'Admin') {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin xác thực' });
    }

    const { id_sp, dinh_muc_chi_tiet } = req.body;
    const result = await dmService.createDinhMucSanPham({ id_sp, dinh_muc_chi_tiet }, id_dn, role);
    res.status(201).json({ success: true, message: "Tạo định mức sản phẩm thành công", data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getAll = async (req, res) => {
  try {
    const id_dn = req.user?.id;
    const role = req.user?.role;

    if (!id_dn && role !== 'Admin') {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin xác thực' });
    }

    const data = await dmService.getAllDinhMuc(id_dn, role);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getByProduct = async (req, res) => {
  try {
    const id_dn = req.user?.id;
    const role = req.user?.role;

    if (!id_dn && role !== 'Admin') {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin xác thực' });
    }

    const data = await dmService.getDinhMucByProduct(req.params.id_sp, id_dn, role);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    const id_dn = req.user?.id;
    const role = req.user?.role;

    if (!id_dn && role !== 'Admin') {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin xác thực' });
    }

    await dmService.deleteDinhMuc(req.params.id_dinhmuc, id_dn, role);
    res.status(200).json({ success: true, message: "Xóa định mức thành công" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Lấy danh sách sản phẩm theo doanh nghiệp (dropdown)
const getSanPham = async (req, res) => {
  try {
    const id_dn = req.user?.id;
    const role = req.user?.role;

    console.log('=== getSanPham DEBUG ===');
    console.log('req.user:', req.user);
    console.log('id_dn:', id_dn);
    console.log('role:', role);

    if (!id_dn && role !== 'Admin') {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin xác thực' });
    }

    const data = await dmService.getSanPhamByDN(id_dn, role);
    console.log('data:', data);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('getSanPham error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy danh sách nguyên liệu theo doanh nghiệp (dropdown)
const getNguyenLieu = async (req, res) => {
  try {
    const id_dn = req.user?.id;
    const role = req.user?.role;

    if (!id_dn && role !== 'Admin') {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin xác thực' });
    }

    const data = await dmService.getNguyenLieuByDN(id_dn, role);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Import định mức từ Excel
const importExcel = async (req, res) => {
  try {
    const id_dn = req.user?.id;
    const role = req.user?.role;

    if (!id_dn && role !== 'Admin') {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin xác thực' });
    }

    const { data } = req.body;
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ success: false, message: 'Dữ liệu Excel không hợp lệ' });
    }

    const result = await dmService.importDinhMucFromExcel(id_dn, data);
    res.status(200).json({ success: true, message: `Import hoàn tất: ${result.thanh_cong} thành công, ${result.that_bai} thất bại`, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy mẫu Excel
const getTemplate = async (req, res) => {
  try {
    const template = dmService.getTemplateDinhMuc();
    res.status(200).json({ success: true, data: template });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { create, getAll, getByProduct, remove, getSanPham, getNguyenLieu, importExcel, getTemplate };
