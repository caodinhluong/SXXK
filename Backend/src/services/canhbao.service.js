'use strict';

const db = require('../models');
const { Op } = require('sequelize');

const CanhBaoHeThong = db.CanhBaoHeThong;
const DoanhNghiep = db.DoanhNghiep;

/**
 * CanhBaoService - Service for managing system alerts
 */
class CanhBaoService {
  /**
   * Create alert for negative inventory
   * @param {Object} data - Alert data
   * @param {number} data.id_dn - Enterprise ID
   * @param {string} data.loai_hang - Type of goods (NguyenLieu/SanPham)
   * @param {number} data.id_hang - ID of the goods (id_npl or id_sp)
   * @param {string} data.ten_hang - Name of the goods
   * @param {number} data.so_luong_am - Negative quantity
   * @param {string} data.bang_lien_quan - Related table name
   * @param {number} data.id_ban_ghi - Related record ID
   * @returns {Promise<Object>} Created alert
   */
  async createTonAmAlert(data) {
    const { id_dn, loai_hang, id_hang, ten_hang, so_luong_am, bang_lien_quan, id_ban_ghi } = data;

    // Validate required fields
    if (!id_dn || !loai_hang || !id_hang || !ten_hang) {
      throw new Error('Thiếu dữ liệu bắt buộc: id_dn, loai_hang, id_hang, ten_hang');
    }

    const tieu_de = `Cảnh báo tồn kho âm: ${ten_hang}`;
    const noi_dung = `${loai_hang === 'NguyenLieu' ? 'Nguyên phụ liệu' : 'Sản phẩm'} "${ten_hang}" có tồn kho âm (${so_luong_am || 'N/A'}). Vui lòng kiểm tra lại số liệu nhập/xuất kho.`;

    const alert = await CanhBaoHeThong.create({
      id_dn,
      loai_canh_bao: 'TonAm',
      tieu_de,
      noi_dung,
      muc_do: 'Cao',
      trang_thai: 'ChuaXem',
      bang_lien_quan: bang_lien_quan || null,
      id_ban_ghi: id_ban_ghi || null,
      ngay_tao: new Date()
    });

    return alert;
  }

  /**
   * Create alert for exceeding quota
   * @param {Object} data - Alert data
   * @param {number} data.id_dn - Enterprise ID
   * @param {number} data.id_sp - Product ID
   * @param {string} data.ten_sp - Product name
   * @param {number} data.id_npl - Material ID
   * @param {string} data.ten_npl - Material name
   * @param {number} data.dinh_muc - Quota amount
   * @param {number} data.thuc_te - Actual amount used
   * @param {number} data.ty_le_vuot - Percentage exceeded
   * @param {string} data.bang_lien_quan - Related table name
   * @param {number} data.id_ban_ghi - Related record ID
   * @returns {Promise<Object>} Created alert
   */
  async createVuotDinhMucAlert(data) {
    const { id_dn, id_sp, ten_sp, id_npl, ten_npl, dinh_muc, thuc_te, ty_le_vuot, bang_lien_quan, id_ban_ghi } = data;

    // Validate required fields
    if (!id_dn || !id_sp || !ten_sp || !id_npl || !ten_npl) {
      throw new Error('Thiếu dữ liệu bắt buộc: id_dn, id_sp, ten_sp, id_npl, ten_npl');
    }

    const tieu_de = `Cảnh báo vượt định mức: ${ten_sp}`;
    const noi_dung = `Sản phẩm "${ten_sp}" sử dụng nguyên phụ liệu "${ten_npl}" vượt định mức. Định mức: ${dinh_muc || 'N/A'}, Thực tế: ${thuc_te || 'N/A'}, Vượt: ${ty_le_vuot || 'N/A'}%.`;

    // Determine severity based on percentage exceeded
    let muc_do = 'TrungBinh';
    if (ty_le_vuot > 50) {
      muc_do = 'KhanCap';
    } else if (ty_le_vuot > 20) {
      muc_do = 'Cao';
    }

    const alert = await CanhBaoHeThong.create({
      id_dn,
      loai_canh_bao: 'VuotDinhMuc',
      tieu_de,
      noi_dung,
      muc_do,
      trang_thai: 'ChuaXem',
      bang_lien_quan: bang_lien_quan || null,
      id_ban_ghi: id_ban_ghi || null,
      ngay_tao: new Date()
    });

    return alert;
  }

  /**
   * Create alert for inventory discrepancies
   * @param {Object} data - Alert data
   * @param {number} data.id_dn - Enterprise ID
   * @param {string} data.loai_hang - Type of goods (NguyenLieu/SanPham)
   * @param {number} data.id_hang - ID of the goods
   * @param {string} data.ten_hang - Name of the goods
   * @param {number} data.so_luong_ly_thuyet - Theoretical quantity
   * @param {number} data.so_luong_thuc_te - Actual quantity
   * @param {number} data.chenh_lech - Discrepancy amount
   * @param {string} data.bang_lien_quan - Related table name
   * @param {number} data.id_ban_ghi - Related record ID
   * @returns {Promise<Object>} Created alert
   */
  async createLechSoKhoAlert(data) {
    const { id_dn, loai_hang, id_hang, ten_hang, so_luong_ly_thuyet, so_luong_thuc_te, chenh_lech, bang_lien_quan, id_ban_ghi } = data;

    // Validate required fields
    if (!id_dn || !loai_hang || !id_hang || !ten_hang) {
      throw new Error('Thiếu dữ liệu bắt buộc: id_dn, loai_hang, id_hang, ten_hang');
    }

    const tieu_de = `Cảnh báo lệch số kho: ${ten_hang}`;
    const noi_dung = `${loai_hang === 'NguyenLieu' ? 'Nguyên phụ liệu' : 'Sản phẩm'} "${ten_hang}" có chênh lệch giữa số lý thuyết và thực tế. Lý thuyết: ${so_luong_ly_thuyet || 'N/A'}, Thực tế: ${so_luong_thuc_te || 'N/A'}, Chênh lệch: ${chenh_lech || 'N/A'}.`;

    // Determine severity based on discrepancy percentage
    let muc_do = 'TrungBinh';
    if (so_luong_ly_thuyet > 0) {
      const ty_le_chenh_lech = Math.abs((chenh_lech / so_luong_ly_thuyet) * 100);
      if (ty_le_chenh_lech > 30) {
        muc_do = 'Cao';
      } else if (ty_le_chenh_lech > 50) {
        muc_do = 'KhanCap';
      }
    }

    const alert = await CanhBaoHeThong.create({
      id_dn,
      loai_canh_bao: 'LechSoKho',
      tieu_de,
      noi_dung,
      muc_do,
      trang_thai: 'ChuaXem',
      bang_lien_quan: bang_lien_quan || null,
      id_ban_ghi: id_ban_ghi || null,
      ngay_tao: new Date()
    });

    return alert;
  }

  /**
   * Get alerts by enterprise with optional filters
   * @param {number} id_dn - Enterprise ID
   * @param {Object} filters - Optional filters
   * @param {string} filters.loai_canh_bao - Alert type filter
   * @param {string} filters.trang_thai - Status filter
   * @param {string} filters.muc_do - Severity filter
   * @param {Date} filters.tu_ngay - From date filter
   * @param {Date} filters.den_ngay - To date filter
   * @param {number} filters.page - Page number (default: 1)
   * @param {number} filters.limit - Items per page (default: 10)
   * @returns {Promise<Object>} Paginated alerts
   */
  async getByDoanhNghiep(id_dn, filters = {}) {
    if (!id_dn) {
      throw new Error('Thiếu id_dn');
    }

    const { 
      loai_canh_bao, 
      trang_thai, 
      muc_do, 
      tu_ngay, 
      den_ngay, 
      page = 1, 
      limit = 10 
    } = filters;

    // Build where clause
    const where = { id_dn };

    if (loai_canh_bao) {
      where.loai_canh_bao = loai_canh_bao;
    }

    if (trang_thai) {
      where.trang_thai = trang_thai;
    }

    if (muc_do) {
      where.muc_do = muc_do;
    }

    if (tu_ngay || den_ngay) {
      where.ngay_tao = {};
      if (tu_ngay) {
        where.ngay_tao[Op.gte] = tu_ngay;
      }
      if (den_ngay) {
        where.ngay_tao[Op.lte] = den_ngay;
      }
    }

    // Query with pagination
    const offset = (page - 1) * limit;
    const { rows, count } = await CanhBaoHeThong.findAndCountAll({
      where,
      include: [
        {
          model: DoanhNghiep,
          as: 'doanhNghiep',
          attributes: ['ten_dn']
        }
      ],
      order: [['ngay_tao', 'DESC']],
      limit: Number(limit),
      offset: Number(offset)
    });

    return {
      data: rows,
      pagination: {
        total: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Mark alert as read
   * @param {number} id_cb - Alert ID
   * @returns {Promise<Object>} Updated alert
   */
  async markAsRead(id_cb) {
    if (!id_cb) {
      throw new Error('Thiếu id_cb');
    }

    const alert = await CanhBaoHeThong.findByPk(id_cb);
    if (!alert) {
      throw new Error('Không tìm thấy cảnh báo');
    }

    // Only update if not already read
    if (alert.trang_thai === 'ChuaXem') {
      alert.trang_thai = 'DaXem';
      await alert.save();
    }

    return alert;
  }

  /**
   * Mark alert as processed
   * @param {number} id_cb - Alert ID
   * @param {string} nguoi_xu_ly - Person who processed the alert
   * @returns {Promise<Object>} Updated alert
   */
  async markAsProcessed(id_cb, nguoi_xu_ly) {
    if (!id_cb) {
      throw new Error('Thiếu id_cb');
    }

    if (!nguoi_xu_ly) {
      throw new Error('Thiếu thông tin người xử lý');
    }

    const alert = await CanhBaoHeThong.findByPk(id_cb);
    if (!alert) {
      throw new Error('Không tìm thấy cảnh báo');
    }

    alert.trang_thai = 'DaXuLy';
    alert.nguoi_xu_ly = nguoi_xu_ly;
    alert.ngay_xu_ly = new Date();
    await alert.save();

    return alert;
  }

  /**
   * Get alert by ID
   * @param {number} id_cb - Alert ID
   * @returns {Promise<Object>} Alert details
   */
  async getById(id_cb) {
    if (!id_cb) {
      throw new Error('Thiếu id_cb');
    }

    const alert = await CanhBaoHeThong.findByPk(id_cb, {
      include: [
        {
          model: DoanhNghiep,
          as: 'doanhNghiep',
          attributes: ['ten_dn', 'ma_so_thue']
        }
      ]
    });

    if (!alert) {
      throw new Error('Không tìm thấy cảnh báo');
    }

    return alert;
  }

  /**
   * Delete alert
   * @param {number} id_cb - Alert ID
   * @returns {Promise<boolean>} Success status
   */
  async delete(id_cb) {
    if (!id_cb) {
      throw new Error('Thiếu id_cb');
    }

    const alert = await CanhBaoHeThong.findByPk(id_cb);
    if (!alert) {
      throw new Error('Không tìm thấy cảnh báo');
    }

    await alert.destroy();
    return true;
  }

  /**
   * Get alert statistics for enterprise
   * @param {number} id_dn - Enterprise ID
   * @returns {Promise<Object>} Alert statistics
   */
  async getStatistics(id_dn) {
    if (!id_dn) {
      throw new Error('Thiếu id_dn');
    }

    const total = await CanhBaoHeThong.count({ where: { id_dn } });
    const chuaXem = await CanhBaoHeThong.count({ where: { id_dn, trang_thai: 'ChuaXem' } });
    const daXem = await CanhBaoHeThong.count({ where: { id_dn, trang_thai: 'DaXem' } });
    const dangXuLy = await CanhBaoHeThong.count({ where: { id_dn, trang_thai: 'DangXuLy' } });
    const daXuLy = await CanhBaoHeThong.count({ where: { id_dn, trang_thai: 'DaXuLy' } });

    const byType = await CanhBaoHeThong.findAll({
      where: { id_dn },
      attributes: [
        'loai_canh_bao',
        [db.sequelize.fn('COUNT', db.sequelize.col('id_cb')), 'count']
      ],
      group: ['loai_canh_bao']
    });

    const bySeverity = await CanhBaoHeThong.findAll({
      where: { id_dn },
      attributes: [
        'muc_do',
        [db.sequelize.fn('COUNT', db.sequelize.col('id_cb')), 'count']
      ],
      group: ['muc_do']
    });

    return {
      total,
      byStatus: {
        chuaXem,
        daXem,
        dangXuLy,
        daXuLy
      },
      byType: byType.reduce((acc, item) => {
        acc[item.loai_canh_bao] = Number(item.dataValues.count);
        return acc;
      }, {}),
      bySeverity: bySeverity.reduce((acc, item) => {
        acc[item.muc_do] = Number(item.dataValues.count);
        return acc;
      }, {})
    };
  }
}

module.exports = new CanhBaoService();
