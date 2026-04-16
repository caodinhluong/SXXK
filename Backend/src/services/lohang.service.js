'use strict';

const db = require('../models');
const LoHang = db.LoHang;
const HopDong = db.HopDong;

/**
 * ===============================
 *  DỊCH VỤ (SERVICE) LÔ HÀNG
 * ===============================
 */
const createLH = async ({ id_hd, ngay_dong_goi, ngay_xuat_cang, cang_xuat, cang_nhap, file_chung_tu }, id_dn, role) => {
  // --- Kiểm tra dữ liệu bắt buộc ---
  if (!id_hd) throw new Error('Thiếu ID hợp đồng');

  // --- Kiểm tra hợp đồng có tồn tại và thuộc doanh nghiệp ---
  const whereClause = role === 'Admin' ? { id_hd } : { id_hd, id_dn };
  const hopDong = await HopDong.findOne({ where: whereClause });
  if (!hopDong) throw new Error('Hợp đồng không tồn tại hoặc bạn không có quyền truy cập');

  // --- Tạo lô hàng ---
  const loHang = await LoHang.create({
    id_hd,
    ngay_dong_goi,
    ngay_xuat_cang,
    cang_xuat,
    cang_nhap,
    file_chung_tu
  });

  return loHang;
};

// ====================
// Lấy toàn bộ lô hàng
// ====================
const getAllLH = async (id_dn, role) => {
  const include = [{ model: HopDong, as: 'hopDong' }];
  
  if (role === 'Admin') {
    return await LoHang.findAll({
      include,
      order: [['id_lh', 'DESC']]
    });
  }
  
  // Lọc lô hàng theo doanh nghiệp thông qua HopDong
  return await LoHang.findAll({
    include: [{
      model: HopDong,
      as: 'hopDong',
      where: { id_dn },
      required: true
    }],
    order: [['id_lh', 'DESC']]
  });
};

// ======================
// Lấy lô hàng theo ID
// ======================
const getLHById = async (id_lh, id_dn, role) => {
  const include = [{ model: HopDong, as: 'hopDong' }];
  
  if (role === 'Admin') {
    const loHang = await LoHang.findByPk(id_lh, { include });
    if (!loHang) throw new Error(`Không tìm thấy lô hàng ID=${id_lh}`);
    return loHang;
  }

  // Lọc theo doanh nghiệp
  const loHang = await LoHang.findOne({
    where: { id_lh },
    include: [{
      model: HopDong,
      as: 'hopDong',
      where: { id_dn },
      required: true
    }]
  });

  if (!loHang) throw new Error(`Không tìm thấy lô hàng ID=${id_lh} hoặc bạn không có quyền truy cập`);
  return loHang;
};

// ====================================
// Lấy danh sách lô hàng theo hợp đồng
// ====================================
const getLHByHopDong = async (id_hd, id_dn, role) => {
  // Direct query for LoHang with id_hd
  const loHangs = await LoHang.findAll({
    where: { id_hd: id_hd },
    order: [['id_lh', 'DESC']]
  });
  
  return loHangs;
};

// ==========================
// Cập nhật thông tin lô hàng
// ==========================
const updateLH = async (id_lh, data, id_dn, role) => {
  // Tìm lô hàng và kiểm tra quyền
  const whereLoHang = { id_lh };
  const include = role === 'Admin' ? [] : [{
    model: HopDong,
    as: 'hopDong',
    where: { id_dn },
    required: true
  }];

  const loHang = await LoHang.findOne({
    where: whereLoHang,
    include
  });

  if (!loHang) throw new Error(`Không tìm thấy lô hàng ID=${id_lh} hoặc bạn không có quyền truy cập`);

  // Không cho phép thay đổi id_hd
  delete data.id_hd;

  await loHang.update(data);
  return loHang;
};

// ==================
// Xóa lô hàng
// ==================
const deleteLH = async (id_lh, id_dn, role) => {
  const include = role === 'Admin' ? [] : [{
    model: HopDong,
    as: 'hopDong',
    where: { id_dn },
    required: true
  }];

  const loHang = await LoHang.findOne({
    where: { id_lh },
    include
  });

  if (!loHang) throw new Error(`Không tìm thấy lô hàng ID=${id_lh} hoặc bạn không có quyền truy cập`);

  await loHang.destroy();
};

module.exports = { createLH, getAllLH, getLHById, getLHByHopDong, updateLH, deleteLH };
