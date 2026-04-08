'use strict';
const db = require('../models');
const ToKhaiXuat = db.ToKhaiXuat;
const ToKhaiXuatChiTiet = db.ToKhaiXuatChiTiet;
const LoHang = db.LoHang;
const TienTe = db.TienTe;
const HopDong = db.HopDong;
const NguyenPhuLieu = db.NguyenPhuLieu;
const SanPham = db.SanPham;
const DonViTinhHQ = db.DonViTinhHQ;

/**
 * Validate ma_to_khai value for export declarations
 * @param {string} ma_to_khai 
 */
const validateMaToKhai = (ma_to_khai) => {
  const validValues = ['G21', 'G22', 'G23', 'G24', 'G61'];
  if (ma_to_khai && !validValues.includes(ma_to_khai)) {
    throw new Error(`Mã tờ khai không hợp lệ. Chỉ chấp nhận: ${validValues.join(', ')}`);
  }
};

/**
 * Validate loai_hang value
 * @param {string} loai_hang 
 */
const validateLoaiHang = (loai_hang) => {
  const validValues = ['NguyenLieu', 'SanPham', 'BanThanhPham'];
  if (loai_hang && !validValues.includes(loai_hang)) {
    throw new Error(`Loại hàng không hợp lệ. Chỉ chấp nhận: ${validValues.join(', ')}`);
  }
};

/**
 * Validate chi tiet items
 * @param {Array} chiTiets 
 */
const validateChiTiets = (chiTiets) => {
  if (!chiTiets || !Array.isArray(chiTiets)) return;
  
  chiTiets.forEach((item, index) => {
    // Must have either id_npl or id_sp, not both
    if (!item.id_npl && !item.id_sp) {
      throw new Error(`Chi tiết ${index + 1}: Phải có id_npl hoặc id_sp`);
    }
    if (item.id_npl && item.id_sp) {
      throw new Error(`Chi tiết ${index + 1}: Không thể có cả id_npl và id_sp`);
    }
    // Must have so_luong
    if (!item.so_luong || item.so_luong <= 0) {
      throw new Error(`Chi tiết ${index + 1}: Số lượng phải lớn hơn 0`);
    }
  });
};

const createTKX = async (data, id_dn, role) => {
  const { 
    id_lh, so_tk, ngay_tk, ma_to_khai, loai_hang, ngay_thong_quan, cang_xuat,
    tong_tri_gia, id_tt, file_to_khai, file_excel_import,
    ghi_chu, nguoi_xu_ly, ngay_xu_ly, trang_thai, chiTiets 
  } = data;
  
  if (!id_lh || !so_tk || !ngay_tk) throw new Error('Thiếu dữ liệu bắt buộc');

  // Validate ma_to_khai and loai_hang
  validateMaToKhai(ma_to_khai);
  validateLoaiHang(loai_hang);
  validateChiTiets(chiTiets);

  // Kiểm tra lô hàng thuộc doanh nghiệp
  const whereLoHang = role === 'Admin' ? { id_lh } : { id_lh };
  const includeHopDong = role === 'Admin' ? [] : [{
    model: HopDong,
    as: 'hopDong',
    where: { id_dn },
    required: true
  }];

  const lh = await LoHang.findOne({
    where: whereLoHang,
    include: includeHopDong
  });

  if (!lh) throw new Error(`Không tìm thấy lô hàng ID=${id_lh} hoặc bạn không có quyền truy cập`);

  // Kiểm tra số tờ khai trùng
  const exists = await ToKhaiXuat.findOne({ where: { so_tk } });
  if (exists) throw new Error(`Số tờ khai "${so_tk}" đã tồn tại`);

  // Create ToKhaiXuat with transaction
  const transaction = await db.sequelize.transaction();
  
  try {
    const toKhaiXuat = await ToKhaiXuat.create({ 
      id_lh, so_tk, ngay_tk, ma_to_khai, loai_hang, ngay_thong_quan, cang_xuat,
      tong_tri_gia, id_tt, file_to_khai, file_excel_import,
      ghi_chu, nguoi_xu_ly, ngay_xu_ly, trang_thai 
    }, { transaction });

    // Create chi tiets if provided
    if (chiTiets && chiTiets.length > 0) {
      const chiTietData = chiTiets.map(ct => ({
        id_tkx: toKhaiXuat.id_tkx,
        id_npl: ct.id_npl || null,
        id_sp: ct.id_sp || null,
        so_luong: ct.so_luong,
        don_vi_tinh: ct.don_vi_tinh || null,
        don_gia: ct.don_gia || null,
        tri_gia: ct.tri_gia || null,
        so_luong_chuan: ct.so_luong_chuan || null,
        dvt_chuan: ct.dvt_chuan || null
      }));
      
      await ToKhaiXuatChiTiet.bulkCreate(chiTietData, { transaction });
    }

    await transaction.commit();
    
    // Return with chi tiets
    return await ToKhaiXuat.findByPk(toKhaiXuat.id_tkx, {
      include: [
        { model: ToKhaiXuatChiTiet, as: 'chiTiets' },
        { model: LoHang, as: 'loHang' },
        { model: TienTe, as: 'tienTe' }
      ]
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const getAllTKX = async (id_dn, role) => {
  const includeModels = [
    { 
      model: ToKhaiXuatChiTiet, 
      as: 'chiTiets',
      include: [
        { model: NguyenPhuLieu, as: 'nguyenPhuLieu' },
        { model: SanPham, as: 'sanPham' },
        { model: DonViTinhHQ, as: 'donViTinhChuan' }
      ]
    },
    { model: TienTe, as: 'tienTe' }
  ];

  if (role === 'Admin') {
    return await ToKhaiXuat.findAll({
      include: [
        ...includeModels,
        { model: LoHang, as: 'loHang', include: [{ model: HopDong, as: 'hopDong' }] }
      ],
      order: [['id_tkx', 'DESC']]
    });
  }

  // Lọc theo doanh nghiệp qua LoHang → HopDong
  return await ToKhaiXuat.findAll({
    include: [
      ...includeModels,
      {
        model: LoHang,
        as: 'loHang',
        required: true,
        include: [{
          model: HopDong,
          as: 'hopDong',
          where: { id_dn },
          required: true
        }]
      }
    ],
    order: [['id_tkx', 'DESC']]
  });
};

const getTKXById = async (id_tkx, id_dn, role) => {
  const includeModels = [
    { 
      model: ToKhaiXuatChiTiet, 
      as: 'chiTiets',
      include: [
        { model: NguyenPhuLieu, as: 'nguyenPhuLieu' },
        { model: SanPham, as: 'sanPham' },
        { model: DonViTinhHQ, as: 'donViTinhChuan' }
      ]
    },
    { model: TienTe, as: 'tienTe' }
  ];

  if (role === 'Admin') {
    return await ToKhaiXuat.findByPk(id_tkx, {
      include: [
        ...includeModels,
        { model: LoHang, as: 'loHang', include: [{ model: HopDong, as: 'hopDong' }] }
      ]
    });
  }

  return await ToKhaiXuat.findOne({
    where: { id_tkx },
    include: [
      ...includeModels,
      {
        model: LoHang,
        as: 'loHang',
        required: true,
        include: [{
          model: HopDong,
          as: 'hopDong',
          where: { id_dn },
          required: true
        }]
      }
    ]
  });
};

const updateTKX = async (id_tkx, data, id_dn, role) => {
  const { chiTiets, ma_to_khai, loai_hang, ...mainData } = data;
  
  // Validate ma_to_khai and loai_hang
  validateMaToKhai(ma_to_khai);
  validateLoaiHang(loai_hang);
  validateChiTiets(chiTiets);

  let record;

  if (role === 'Admin') {
    record = await ToKhaiXuat.findByPk(id_tkx);
  } else {
    record = await ToKhaiXuat.findOne({
      where: { id_tkx },
      include: [{
        model: LoHang,
        as: 'loHang',
        required: true,
        include: [{
          model: HopDong,
          as: 'hopDong',
          where: { id_dn },
          required: true
        }]
      }]
    });
  }

  if (!record) throw new Error('Không tìm thấy tờ khai xuất hoặc bạn không có quyền truy cập');

  const transaction = await db.sequelize.transaction();
  
  try {
    // Không cho phép thay đổi id_lh
    delete mainData.id_lh;
    
    // Update main record
    await record.update({ ...mainData, ma_to_khai, loai_hang }, { transaction });

    // Update chi tiets if provided
    if (chiTiets && Array.isArray(chiTiets)) {
      // Delete existing chi tiets
      await ToKhaiXuatChiTiet.destroy({ 
        where: { id_tkx }, 
        transaction 
      });
      
      // Create new chi tiets
      if (chiTiets.length > 0) {
        const chiTietData = chiTiets.map(ct => ({
          id_tkx: id_tkx,
          id_npl: ct.id_npl || null,
          id_sp: ct.id_sp || null,
          so_luong: ct.so_luong,
          don_vi_tinh: ct.don_vi_tinh || null,
          don_gia: ct.don_gia || null,
          tri_gia: ct.tri_gia || null,
          so_luong_chuan: ct.so_luong_chuan || null,
          dvt_chuan: ct.dvt_chuan || null
        }));
        
        await ToKhaiXuatChiTiet.bulkCreate(chiTietData, { transaction });
      }
    }

    await transaction.commit();
    
    // Return updated record with chi tiets
    return await ToKhaiXuat.findByPk(id_tkx, {
      include: [
        { 
          model: ToKhaiXuatChiTiet, 
          as: 'chiTiets',
          include: [
            { model: NguyenPhuLieu, as: 'nguyenPhuLieu' },
            { model: SanPham, as: 'sanPham' },
            { model: DonViTinhHQ, as: 'donViTinhChuan' }
          ]
        },
        { model: LoHang, as: 'loHang' },
        { model: TienTe, as: 'tienTe' }
      ]
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const deleteTKX = async (id_tkx, id_dn, role) => {
  let record;

  if (role === 'Admin') {
    record = await ToKhaiXuat.findByPk(id_tkx);
  } else {
    record = await ToKhaiXuat.findOne({
      where: { id_tkx },
      include: [{
        model: LoHang,
        as: 'loHang',
        required: true,
        include: [{
          model: HopDong,
          as: 'hopDong',
          where: { id_dn },
          required: true
        }]
      }]
    });
  }

  if (!record) throw new Error('Không tìm thấy tờ khai xuất hoặc bạn không có quyền truy cập');
  
  const transaction = await db.sequelize.transaction();
  
  try {
    // Delete chi tiets first
    await ToKhaiXuatChiTiet.destroy({ 
      where: { id_tkx }, 
      transaction 
    });
    
    // Delete main record
    await record.destroy({ transaction });
    
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Import ToKhaiXuat from Excel file
 * @param {Object} excelData - Parsed Excel data
 * @param {number} id_dn - Doanh nghiep ID
 * @param {string} role - User role
 * @returns {Promise<Object>} Created ToKhaiXuat with chi tiets
 */
const importFromExcel = async (excelData, id_dn, role) => {
  // Expected excelData structure:
  // {
  //   header: { id_lh, so_tk, ngay_tk, ma_to_khai, loai_hang, ... },
  //   items: [{ id_npl, id_sp, so_luong, don_vi_tinh, don_gia, ... }]
  // }
  
  if (!excelData || !excelData.header) {
    throw new Error('Dữ liệu Excel không hợp lệ');
  }

  const { header, items } = excelData;
  
  // Validate required fields
  if (!header.id_lh || !header.so_tk || !header.ngay_tk) {
    throw new Error('Thiếu thông tin bắt buộc trong header (id_lh, so_tk, ngay_tk)');
  }

  // Prepare data for createTKX
  const data = {
    ...header,
    chiTiets: items || []
  };

  // Use existing createTKX method which handles validation and transaction
  return await createTKX(data, id_dn, role);
};

// Backward compatibility - keep old method names
const toKhaiXuatService = {
  getAll: getAllTKX,
  getById: getTKXById,
  create: createTKX,
  update: updateTKX,
  delete: deleteTKX,
  importFromExcel,
  validateMaToKhai,
  validateLoaiHang,
  validateChiTiets
};

module.exports = toKhaiXuatService;

