'use strict';

const db = require('../models');
const { Op } = require('sequelize');

const BienBanTieuHuy = db.BienBanTieuHuy;
const BienBanTieuHuyChiTiet = db.BienBanTieuHuyChiTiet;
const DoanhNghiep = db.DoanhNghiep;
const SanPham = db.SanPham;
const NguyenPhuLieu = db.NguyenPhuLieu;
const DonViTinhHQ = db.DonViTinhHQ;

/**
 * Get all BienBanTieuHuy with optional filters
 * @param {Object} filters - Query filters
 * @param {Object} options - Pagination and sorting options
 * @returns {Promise<Object>} - List of destruction reports with pagination
 */
const getAll = async (filters = {}, options = {}) => {
  const { page = 1, limit = 10, sortBy = 'id_bb', sortOrder = 'DESC' } = options;
  const offset = (page - 1) * limit;

  const where = buildWhereClause(filters);

  const { rows, count } = await BienBanTieuHuy.findAndCountAll({
    where,
    include: getDefaultIncludes(),
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [[sortBy, sortOrder]]
  });

  return {
    data: rows,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / limit)
    }
  };
};

/**
 * Get single BienBanTieuHuy by ID
 * @param {number} id_bb - Destruction report ID
 * @returns {Promise<Object>} - Destruction report details
 */
const getById = async (id_bb) => {
  const report = await BienBanTieuHuy.findByPk(id_bb, {
    include: [
      {
        model: DoanhNghiep,
        as: 'doanhNghiep',
        attributes: ['id_dn', 'ten_dn', 'ma_so_thue', 'dia_chi']
      },
      {
        model: BienBanTieuHuyChiTiet,
        as: 'chiTiets',
        include: [
          {
            model: SanPham,
            as: 'sanPham',
            attributes: ['id_sp', 'ten_sp'],
            include: [{ model: DonViTinhHQ, as: 'donViTinhHQ', attributes: ['ten_dvt'] }]
          },
          {
            model: NguyenPhuLieu,
            as: 'nguyenPhuLieu',
            attributes: ['id_npl', 'ten_npl'],
            include: [{ model: DonViTinhHQ, as: 'donViTinhHQ', attributes: ['ten_dvt'] }]
          }
        ]
      }
    ]
  });

  if (!report) {
    throw new Error(`Biên bản tiêu hủy với ID ${id_bb} không tồn tại`);
  }

  return report;
};

/**
 * Create new BienBanTieuHuy with chi tiet
 * @param {Object} data - Destruction report data including chiTiets array
 * @returns {Promise<Object>} - Created destruction report
 */
const create = async (data) => {
  // Validate input
  validate(data);

  const { chiTiets, ...reportData } = data;

  // Start transaction
  const transaction = await db.sequelize.transaction();

  try {
    // Validate chi tiet items
    if (chiTiets && chiTiets.length > 0) {
      chiTiets.forEach((item, index) => {
        validateChiTiet(item, index);
      });
    }

    // Create destruction report
    const report = await BienBanTieuHuy.create(reportData, { transaction });

    // Create chi tiet items
    if (chiTiets && chiTiets.length > 0) {
      const chiTietData = chiTiets.map(item => ({
        id_bb: report.id_bb,
        id_sp: item.id_sp || null,
        id_npl: item.id_npl || null,
        so_luong: item.so_luong,
        don_vi_tinh: item.don_vi_tinh || null,
        ly_do_chi_tiet: item.ly_do_chi_tiet || null
      }));

      await BienBanTieuHuyChiTiet.bulkCreate(chiTietData, { transaction });
    }

    await transaction.commit();

    // Return created report with details
    return await getById(report.id_bb);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Update existing BienBanTieuHuy
 * @param {number} id_bb - Destruction report ID
 * @param {Object} data - Updated destruction report data
 * @returns {Promise<Object>} - Updated destruction report
 */
const update = async (id_bb, data) => {
  const report = await BienBanTieuHuy.findByPk(id_bb);
  
  if (!report) {
    throw new Error(`Biên bản tiêu hủy với ID ${id_bb} không tồn tại`);
  }

  validate(data, true);

  const { chiTiets, ...reportData } = data;

  const transaction = await db.sequelize.transaction();

  try {
    // Update report
    await report.update(reportData, { transaction });

    // If chiTiets are provided, update them
    if (chiTiets) {
      // Validate chi tiet items
      chiTiets.forEach((item, index) => {
        validateChiTiet(item, index);
      });

      // Delete old chi tiet items
      await BienBanTieuHuyChiTiet.destroy({
        where: { id_bb },
        transaction
      });

      // Create new chi tiet items
      const chiTietData = chiTiets.map(item => ({
        id_bb,
        id_sp: item.id_sp || null,
        id_npl: item.id_npl || null,
        so_luong: item.so_luong,
        don_vi_tinh: item.don_vi_tinh || null,
        ly_do_chi_tiet: item.ly_do_chi_tiet || null
      }));

      await BienBanTieuHuyChiTiet.bulkCreate(chiTietData, { transaction });
    }

    await transaction.commit();

    return await getById(id_bb);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Delete BienBanTieuHuy
 * @param {number} id_bb - Destruction report ID
 * @returns {Promise<boolean>} - Success status
 */
const deleteReport = async (id_bb) => {
  const report = await BienBanTieuHuy.findByPk(id_bb);
  
  if (!report) {
    throw new Error(`Biên bản tiêu hủy với ID ${id_bb} không tồn tại`);
  }

  const transaction = await db.sequelize.transaction();

  try {
    // Delete chi tiet items first
    await BienBanTieuHuyChiTiet.destroy({
      where: { id_bb },
      transaction
    });

    // Delete report
    await report.destroy({ transaction });

    await transaction.commit();
    return true;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Upload file bien ban for destruction report
 * @param {number} id_bb - Destruction report ID
 * @param {string} filePath - Path to uploaded file
 * @returns {Promise<Object>} - Updated destruction report
 */
const uploadFileBienBan = async (id_bb, filePath) => {
  const report = await BienBanTieuHuy.findByPk(id_bb);
  
  if (!report) {
    throw new Error(`Biên bản tiêu hủy với ID ${id_bb} không tồn tại`);
  }

  await report.update({ file_bien_ban: filePath });
  
  return await getById(id_bb);
};

/**
 * Upload images for destruction report
 * @param {number} id_bb - Destruction report ID
 * @param {Array<string>} imagePaths - Array of image file paths
 * @returns {Promise<Object>} - Updated destruction report
 */
const uploadImages = async (id_bb, imagePaths) => {
  const report = await BienBanTieuHuy.findByPk(id_bb);
  
  if (!report) {
    throw new Error(`Biên bản tiêu hủy với ID ${id_bb} không tồn tại`);
  }

  // Store as JSON array
  const fileHinhAnh = JSON.stringify(imagePaths);
  
  await report.update({ file_hinh_anh: fileHinhAnh });
  
  return await getById(id_bb);
};

// ========== Helper Methods ==========

/**
 * Build WHERE clause from filters
 * @param {Object} filters - Filter object
 * @returns {Object} - Sequelize WHERE clause
 */
const buildWhereClause = (filters) => {
  const where = {};

  if (filters.id_dn) {
    where.id_dn = filters.id_dn;
  }

  if (filters.trang_thai) {
    where.trang_thai = filters.trang_thai;
  }

  if (filters.so_bien_ban) {
    where.so_bien_ban = { [Op.like]: `%${filters.so_bien_ban}%` };
  }

  if (filters.dia_diem) {
    where.dia_diem = { [Op.like]: `%${filters.dia_diem}%` };
  }

  if (filters.tu_ngay && filters.den_ngay) {
    where.ngay_tieu_huy = {
      [Op.between]: [filters.tu_ngay, filters.den_ngay]
    };
  } else if (filters.tu_ngay) {
    where.ngay_tieu_huy = { [Op.gte]: filters.tu_ngay };
  } else if (filters.den_ngay) {
    where.ngay_tieu_huy = { [Op.lte]: filters.den_ngay };
  }

  return where;
};

/**
 * Get default includes for queries
 * @returns {Array} - Array of Sequelize include objects
 */
const getDefaultIncludes = () => {
  return [
    {
      model: DoanhNghiep,
      as: 'doanhNghiep',
      attributes: ['id_dn', 'ten_dn', 'ma_so_thue']
    },
    {
      model: BienBanTieuHuyChiTiet,
      as: 'chiTiets',
      include: [
        {
          model: SanPham,
          as: 'sanPham',
          attributes: ['id_sp', 'ten_sp']
        },
        {
          model: NguyenPhuLieu,
          as: 'nguyenPhuLieu',
          attributes: ['id_npl', 'ten_npl']
        }
      ]
    }
  ];
};

/**
 * Validate destruction report data
 * @param {Object} data - Destruction report data
 * @param {boolean} isUpdate - Whether this is an update operation
 */
const validate = (data, isUpdate = false) => {
  if (!isUpdate) {
    if (!data.id_dn) {
      throw new Error('id_dn là bắt buộc');
    }
    if (!data.so_bien_ban) {
      throw new Error('so_bien_ban là bắt buộc');
    }
    if (!data.ngay_tieu_huy) {
      throw new Error('ngay_tieu_huy là bắt buộc');
    }
    if (!data.dia_diem) {
      throw new Error('dia_diem là bắt buộc');
    }
    if (!data.ly_do) {
      throw new Error('ly_do là bắt buộc');
    }
  }

  // Validate trang_thai if provided
  if (data.trang_thai) {
    const validStatuses = ['ChuaThucHien', 'DangThucHien', 'HoanThanh', 'Huy'];
    if (!validStatuses.includes(data.trang_thai)) {
      throw new Error(`trang_thai phải là một trong: ${validStatuses.join(', ')}`);
    }
  }
};

/**
 * Validate chi tiet item
 * @param {Object} item - Chi tiet item
 * @param {number} index - Item index for error messages
 */
const validateChiTiet = (item, index) => {
  // Ensure either id_sp OR id_npl is set, but not both
  if ((item.id_sp && item.id_npl) || (!item.id_sp && !item.id_npl)) {
    throw new Error(`Chi tiết ${index + 1}: Phải có id_sp HOẶC id_npl, không được cả hai hoặc không có`);
  }

  if (!item.so_luong || parseFloat(item.so_luong) <= 0) {
    throw new Error(`Chi tiết ${index + 1}: so_luong phải lớn hơn 0`);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: deleteReport,
  uploadFileBienBan,
  uploadImages
};
