'use strict';
const db = require('../models');
const ToKhaiNhap = db.ToKhaiNhap;
const ToKhaiNhapChiTiet = db.ToKhaiNhapChiTiet;
const LoHang = db.LoHang;
const TienTe = db.TienTe;
const HopDong = db.HopDong;
const NguyenPhuLieu = db.NguyenPhuLieu;
const SanPham = db.SanPham;
const DonViTinhHQ = db.DonViTinhHQ;

/**
 * Validate ma_to_khai value
 * @param {string} ma_to_khai 
 */
const validateMaToKhai = (ma_to_khai) => {
  const validValues = ['G11', 'G12', 'G13', 'G14', 'G51'];
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

const createTKN = async (data, id_dn, role) => {
  const { 
    id_lh, so_tk, ngay_tk, ma_to_khai, loai_hang, ngay_thong_quan, cang_nhap,
    tong_tri_gia, thue_nhap_khau, thue_gtgt, id_tt, file_to_khai, file_excel_import,
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
  const exists = await ToKhaiNhap.findOne({ where: { so_tk } });
  if (exists) throw new Error(`Số tờ khai "${so_tk}" đã tồn tại`);

  // Create ToKhaiNhap with transaction
  const transaction = await db.sequelize.transaction();
  
  try {
    const toKhaiNhap = await ToKhaiNhap.create({ 
      id_lh, so_tk, ngay_tk, ma_to_khai, loai_hang, ngay_thong_quan, cang_nhap,
      tong_tri_gia, thue_nhap_khau, thue_gtgt, id_tt, file_to_khai, file_excel_import,
      ghi_chu, nguoi_xu_ly, ngay_xu_ly, trang_thai 
    }, { transaction });

    // Create chi tiets if provided
    if (chiTiets && chiTiets.length > 0) {
      const chiTietData = chiTiets.map(ct => ({
        id_tkn: toKhaiNhap.id_tkn,
        id_npl: ct.id_npl || null,
        id_sp: ct.id_sp || null,
        so_luong: ct.so_luong,
        don_vi_tinh: ct.don_vi_tinh || null,
        don_gia: ct.don_gia || null,
        tri_gia: ct.tri_gia || null,
        so_luong_chuan: ct.so_luong_chuan || null,
        dvt_chuan: ct.dvt_chuan || null
      }));
      
      await ToKhaiNhapChiTiet.bulkCreate(chiTietData, { transaction });
    }

    await transaction.commit();
    
    // Return with chi tiets
    return await ToKhaiNhap.findByPk(toKhaiNhap.id_tkn, {
      include: [
        { model: ToKhaiNhapChiTiet, as: 'chiTiets' },
        { model: LoHang, as: 'loHang' },
        { model: TienTe, as: 'tienTe' }
      ]
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const getAllTKN = async (id_dn, role) => {
  const includeModels = [
    { 
      model: ToKhaiNhapChiTiet, 
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
    return await ToKhaiNhap.findAll({
      include: [
        ...includeModels,
        { model: LoHang, as: 'loHang', include: [{ model: HopDong, as: 'hopDong' }] }
      ],
      order: [['id_tkn', 'DESC']]
    });
  }

  // Lọc theo doanh nghiệp qua LoHang → HopDong
  return await ToKhaiNhap.findAll({
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
    order: [['id_tkn', 'DESC']]
  });
};

const getTKNById = async (id_tkn, id_dn, role) => {
  const includeModels = [
    { 
      model: ToKhaiNhapChiTiet, 
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
    return await ToKhaiNhap.findByPk(id_tkn, {
      include: [
        ...includeModels,
        { model: LoHang, as: 'loHang', include: [{ model: HopDong, as: 'hopDong' }] }
      ]
    });
  }

  return await ToKhaiNhap.findOne({
    where: { id_tkn },
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

const updateTKN = async (id_tkn, data, id_dn, role) => {
  const { chiTiets, ma_to_khai, loai_hang, ...mainData } = data;
  
  // Validate ma_to_khai and loai_hang
  validateMaToKhai(ma_to_khai);
  validateLoaiHang(loai_hang);
  validateChiTiets(chiTiets);

  let record;

  if (role === 'Admin') {
    record = await ToKhaiNhap.findByPk(id_tkn);
  } else {
    record = await ToKhaiNhap.findOne({
      where: { id_tkn },
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

  if (!record) throw new Error('Không tìm thấy tờ khai nhập hoặc bạn không có quyền truy cập');

  const transaction = await db.sequelize.transaction();
  
  try {
    // Không cho phép thay đổi id_lh
    delete mainData.id_lh;
    
    // Update main record
    await record.update({ ...mainData, ma_to_khai, loai_hang }, { transaction });

    // Update chi tiets if provided
    if (chiTiets && Array.isArray(chiTiets)) {
      // Delete existing chi tiets
      await ToKhaiNhapChiTiet.destroy({ 
        where: { id_tkn }, 
        transaction 
      });
      
      // Create new chi tiets
      if (chiTiets.length > 0) {
        const chiTietData = chiTiets.map(ct => ({
          id_tkn: id_tkn,
          id_npl: ct.id_npl || null,
          id_sp: ct.id_sp || null,
          so_luong: ct.so_luong,
          don_vi_tinh: ct.don_vi_tinh || null,
          don_gia: ct.don_gia || null,
          tri_gia: ct.tri_gia || null,
          so_luong_chuan: ct.so_luong_chuan || null,
          dvt_chuan: ct.dvt_chuan || null
        }));
        
        await ToKhaiNhapChiTiet.bulkCreate(chiTietData, { transaction });
      }
    }

    await transaction.commit();
    
    // Return updated record with chi tiets
    return await ToKhaiNhap.findByPk(id_tkn, {
      include: [
        { 
          model: ToKhaiNhapChiTiet, 
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

const deleteTKN = async (id_tkn, id_dn, role) => {
  let record;

  if (role === 'Admin') {
    record = await ToKhaiNhap.findByPk(id_tkn);
  } else {
    record = await ToKhaiNhap.findOne({
      where: { id_tkn },
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

  if (!record) throw new Error('Không tìm thấy tờ khai nhập hoặc bạn không có quyền truy cập');
  
  const transaction = await db.sequelize.transaction();
  
  try {
    // Delete chi tiets first
    await ToKhaiNhapChiTiet.destroy({ 
      where: { id_tkn }, 
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
 * Import ToKhaiNhap from Excel file
 * @param {Object} excelData - Parsed Excel data
 * @param {number} id_dn - Doanh nghiep ID
 * @param {string} role - User role
 * @returns {Promise<Object>} Created ToKhaiNhap with chi tiets
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

  // Prepare data for createTKN
  const data = {
    ...header,
    chiTiets: items || []
  };

  // Use existing createTKN method which handles validation and transaction
  return await createTKN(data, id_dn, role);
};

module.exports = { 
  createTKN, 
  getAllTKN, 
  getTKNById, 
  updateTKN, 
  deleteTKN,
  importFromExcel,
  validateMaToKhai,
  validateLoaiHang,
  validateChiTiets
};
