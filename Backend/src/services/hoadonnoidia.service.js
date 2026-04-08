'use strict';

const db = require('../models');
const { Op } = require('sequelize');

const HoaDonNoiDia = db.HoaDonNoiDia;
const HoaDonNoiDiaChiTiet = db.HoaDonNoiDiaChiTiet;
const DoanhNghiep = db.DoanhNghiep;
const SanPham = db.SanPham;
const NguyenPhuLieu = db.NguyenPhuLieu;
const DonViTinhHQ = db.DonViTinhHQ;

/**
 * Get all HoaDonNoiDia with optional filters
 * @param {Object} filters - Query filters
 * @param {Object} options - Pagination and sorting options
 * @returns {Promise<Object>} - List of invoices with pagination
 */
const getAll = async (filters = {}, options = {}) => {
  const { page = 1, limit = 10, sortBy = 'id_hd_nd', sortOrder = 'DESC' } = options;
  const offset = (page - 1) * limit;

  const where = buildWhereClause(filters);

  const { rows, count } = await HoaDonNoiDia.findAndCountAll({
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
 * Get single HoaDonNoiDia by ID
 * @param {number} id_hd_nd - Invoice ID
 * @returns {Promise<Object>} - Invoice details
 */
const getById = async (id_hd_nd) => {
  const invoice = await HoaDonNoiDia.findByPk(id_hd_nd, {
    include: [
      {
        model: DoanhNghiep,
        as: 'doanhNghiep',
        attributes: ['id_dn', 'ten_dn', 'ma_so_thue', 'dia_chi']
      },
      {
        model: HoaDonNoiDiaChiTiet,
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

  if (!invoice) {
    throw new Error(`Hóa đơn nội địa với ID ${id_hd_nd} không tồn tại`);
  }

  return invoice;
};

/**
 * Create new HoaDonNoiDia with chi tiet
 * @param {Object} data - Invoice data including chiTiets array
 * @returns {Promise<Object>} - Created invoice
 */
const create = async (data) => {
  // Validate input
  validate(data);

  const { chiTiets, ...invoiceData } = data;

  // Start transaction
  const transaction = await db.sequelize.transaction();

  try {
    // Validate chi tiet items
    if (chiTiets && chiTiets.length > 0) {
      chiTiets.forEach((item, index) => {
        validateChiTiet(item, index);
      });
    }

    // Calculate totals
    const { tong_tien, thue_gtgt, tong_thanh_toan } = calculateTotals(chiTiets || []);

    // Create invoice
    const invoice = await HoaDonNoiDia.create({
      ...invoiceData,
      tong_tien,
      thue_gtgt,
      tong_thanh_toan
    }, { transaction });

    // Create chi tiet items
    if (chiTiets && chiTiets.length > 0) {
      const chiTietData = chiTiets.map(item => ({
        id_hd_nd: invoice.id_hd_nd,
        id_sp: item.id_sp || null,
        id_npl: item.id_npl || null,
        so_luong: item.so_luong,
        don_gia: item.don_gia,
        thanh_tien: parseFloat(item.so_luong) * parseFloat(item.don_gia),
        thue_suat: item.thue_suat || 0
      }));

      await HoaDonNoiDiaChiTiet.bulkCreate(chiTietData, { transaction });
    }

    await transaction.commit();

    // Return created invoice with details
    return await getById(invoice.id_hd_nd);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Update existing HoaDonNoiDia
 * @param {number} id_hd_nd - Invoice ID
 * @param {Object} data - Updated invoice data
 * @returns {Promise<Object>} - Updated invoice
 */
const update = async (id_hd_nd, data) => {
  const invoice = await HoaDonNoiDia.findByPk(id_hd_nd);
  
  if (!invoice) {
    throw new Error(`Hóa đơn nội địa với ID ${id_hd_nd} không tồn tại`);
  }

  validate(data, true);

  const { chiTiets, ...invoiceData } = data;

  const transaction = await db.sequelize.transaction();

  try {
    // If chiTiets are provided, recalculate totals
    if (chiTiets) {
      // Validate chi tiet items
      chiTiets.forEach((item, index) => {
        validateChiTiet(item, index);
      });

      const { tong_tien, thue_gtgt, tong_thanh_toan } = calculateTotals(chiTiets);
      
      // Update invoice with new totals
      await invoice.update({
        ...invoiceData,
        tong_tien,
        thue_gtgt,
        tong_thanh_toan
      }, { transaction });

      // Delete old chi tiet items
      await HoaDonNoiDiaChiTiet.destroy({
        where: { id_hd_nd },
        transaction
      });

      // Create new chi tiet items
      const chiTietData = chiTiets.map(item => ({
        id_hd_nd,
        id_sp: item.id_sp || null,
        id_npl: item.id_npl || null,
        so_luong: item.so_luong,
        don_gia: item.don_gia,
        thanh_tien: parseFloat(item.so_luong) * parseFloat(item.don_gia),
        thue_suat: item.thue_suat || 0
      }));

      await HoaDonNoiDiaChiTiet.bulkCreate(chiTietData, { transaction });
    } else {
      // Update invoice only
      await invoice.update(invoiceData, { transaction });
    }

    await transaction.commit();

    return await getById(id_hd_nd);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Delete HoaDonNoiDia
 * @param {number} id_hd_nd - Invoice ID
 * @returns {Promise<boolean>} - Success status
 */
const deleteInvoice = async (id_hd_nd) => {
  const invoice = await HoaDonNoiDia.findByPk(id_hd_nd);
  
  if (!invoice) {
    throw new Error(`Hóa đơn nội địa với ID ${id_hd_nd} không tồn tại`);
  }

  const transaction = await db.sequelize.transaction();

  try {
    // Delete chi tiet items first
    await HoaDonNoiDiaChiTiet.destroy({
      where: { id_hd_nd },
      transaction
    });

    // Delete invoice
    await invoice.destroy({ transaction });

    await transaction.commit();
    return true;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Calculate tax and totals for invoice
 * @param {Array} chiTiets - Array of invoice line items
 * @returns {Object} - Calculated totals
 */
const calculateTotals = (chiTiets) => {
  let tong_tien = 0;
  let thue_gtgt = 0;

  chiTiets.forEach(item => {
    const thanh_tien = parseFloat(item.so_luong) * parseFloat(item.don_gia);
    const thue_suat = parseFloat(item.thue_suat || 0);
    
    tong_tien += thanh_tien;
    thue_gtgt += (thanh_tien * thue_suat) / 100;
  });

  const tong_thanh_toan = tong_tien + thue_gtgt;

  return {
    tong_tien: parseFloat(tong_tien.toFixed(2)),
    thue_gtgt: parseFloat(thue_gtgt.toFixed(2)),
    tong_thanh_toan: parseFloat(tong_thanh_toan.toFixed(2))
  };
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

  if (filters.so_hd) {
    where.so_hd = { [Op.like]: `%${filters.so_hd}%` };
  }

  if (filters.khach_hang) {
    where.khach_hang = { [Op.like]: `%${filters.khach_hang}%` };
  }

  if (filters.tu_ngay && filters.den_ngay) {
    where.ngay_hd = {
      [Op.between]: [filters.tu_ngay, filters.den_ngay]
    };
  } else if (filters.tu_ngay) {
    where.ngay_hd = { [Op.gte]: filters.tu_ngay };
  } else if (filters.den_ngay) {
    where.ngay_hd = { [Op.lte]: filters.den_ngay };
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
      model: HoaDonNoiDiaChiTiet,
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
 * Validate invoice data
 * @param {Object} data - Invoice data
 * @param {boolean} isUpdate - Whether this is an update operation
 */
const validate = (data, isUpdate = false) => {
  if (!isUpdate) {
    if (!data.id_dn) {
      throw new Error('id_dn là bắt buộc');
    }
    if (!data.so_hd) {
      throw new Error('so_hd là bắt buộc');
    }
    if (!data.ngay_hd) {
      throw new Error('ngay_hd là bắt buộc');
    }
    if (!data.khach_hang) {
      throw new Error('khach_hang là bắt buộc');
    }
  }

  // Validate trang_thai if provided
  if (data.trang_thai) {
    const validStatuses = ['ChuaThanhToan', 'DaThanhToan', 'Huy'];
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

  if (!item.don_gia || parseFloat(item.don_gia) <= 0) {
    throw new Error(`Chi tiết ${index + 1}: don_gia phải lớn hơn 0`);
  }

  if (item.thue_suat !== undefined && (parseFloat(item.thue_suat) < 0 || parseFloat(item.thue_suat) > 100)) {
    throw new Error(`Chi tiết ${index + 1}: thue_suat phải từ 0 đến 100`);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: deleteInvoice,
  calculateTotals
};
