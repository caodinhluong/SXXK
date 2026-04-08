'use strict';

const db = require('../models');
const { Op } = require('sequelize');

const LogHeThong = db.LogHeThong;

/**
 * LogService - Service for managing system logs and audit trail
 * Handles logging of all important system actions and provides query capabilities
 */
class LogService {
  /**
   * Create a new log entry
   * @param {string} loai_nguoi_dung - User type: 'Admin', 'DoanhNghiep', 'HaiQuan'
   * @param {number} id_nguoi_dung - User ID (depends on user type)
   * @param {string} hanh_dong - Action performed (CREATE, UPDATE, DELETE, LOGIN, etc.)
   * @param {string} bang_lien_quan - Related table name (optional)
   * @param {number} id_ban_ghi - Related record ID (optional)
   * @param {Object} du_lieu_cu - Old data before change (optional, JSON)
   * @param {Object} du_lieu_moi - New data after change (optional, JSON)
   * @param {string} ip_address - User's IP address (optional)
   * @param {string} user_agent - User's browser/device info (optional)
   * @param {string} ghi_chu - Additional notes (optional)
   * @returns {Promise<Object>} Created log entry
   */
  async log(
    loai_nguoi_dung,
    id_nguoi_dung,
    hanh_dong,
    bang_lien_quan = null,
    id_ban_ghi = null,
    du_lieu_cu = null,
    du_lieu_moi = null,
    ip_address = null,
    user_agent = null,
    ghi_chu = null
  ) {
    // Validate required fields
    if (!loai_nguoi_dung || !id_nguoi_dung || !hanh_dong) {
      throw new Error('Thiếu dữ liệu bắt buộc: loai_nguoi_dung, id_nguoi_dung, hanh_dong');
    }

    // Validate loai_nguoi_dung
    const validUserTypes = ['Admin', 'DoanhNghiep', 'HaiQuan'];
    if (!validUserTypes.includes(loai_nguoi_dung)) {
      throw new Error(`loai_nguoi_dung không hợp lệ. Chỉ chấp nhận: ${validUserTypes.join(', ')}`);
    }

    try {
      const logEntry = await LogHeThong.create({
        loai_nguoi_dung,
        id_nguoi_dung,
        hanh_dong,
        bang_lien_quan,
        id_ban_ghi,
        du_lieu_cu,
        du_lieu_moi,
        ip_address,
        user_agent,
        ghi_chu,
        ngay_tao: new Date()
      });

      return logEntry;
    } catch (error) {
      console.error('Error creating log entry:', error);
      throw new Error(`Không thể tạo log: ${error.message}`);
    }
  }

  /**
   * Query logs with various filters
   * @param {Object} filters - Query filters
   * @param {string} filters.loai_nguoi_dung - Filter by user type
   * @param {number} filters.id_nguoi_dung - Filter by user ID
   * @param {string} filters.hanh_dong - Filter by action type
   * @param {string} filters.bang_lien_quan - Filter by related table
   * @param {number} filters.id_ban_ghi - Filter by record ID
   * @param {Date|string} filters.tu_ngay - Start date for date range
   * @param {Date|string} filters.den_ngay - End date for date range
   * @param {string} filters.ip_address - Filter by IP address
   * @param {number} filters.page - Page number (default: 1)
   * @param {number} filters.limit - Records per page (default: 50)
   * @param {string} filters.sortBy - Sort field (default: 'ngay_tao')
   * @param {string} filters.sortOrder - Sort order: 'ASC' or 'DESC' (default: 'DESC')
   * @returns {Promise<Object>} Paginated log entries with metadata
   */
  async query(filters = {}) {
    const {
      loai_nguoi_dung,
      id_nguoi_dung,
      hanh_dong,
      bang_lien_quan,
      id_ban_ghi,
      tu_ngay,
      den_ngay,
      ip_address,
      page = 1,
      limit = 50,
      sortBy = 'ngay_tao',
      sortOrder = 'DESC'
    } = filters;

    try {
      // Build WHERE clause
      const where = {};

      if (loai_nguoi_dung) {
        where.loai_nguoi_dung = loai_nguoi_dung;
      }

      if (id_nguoi_dung) {
        where.id_nguoi_dung = id_nguoi_dung;
      }

      if (hanh_dong) {
        where.hanh_dong = hanh_dong;
      }

      if (bang_lien_quan) {
        where.bang_lien_quan = bang_lien_quan;
      }

      if (id_ban_ghi) {
        where.id_ban_ghi = id_ban_ghi;
      }

      if (ip_address) {
        where.ip_address = ip_address;
      }

      // Date range filter
      if (tu_ngay || den_ngay) {
        where.ngay_tao = {};
        if (tu_ngay) {
          where.ngay_tao[Op.gte] = new Date(tu_ngay);
        }
        if (den_ngay) {
          // Add 1 day to include the entire end date
          const endDate = new Date(den_ngay);
          endDate.setDate(endDate.getDate() + 1);
          where.ngay_tao[Op.lt] = endDate;
        }
      }

      // Calculate offset
      const offset = (page - 1) * limit;

      // Query logs
      const { rows, count } = await LogHeThong.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset,
        order: [[sortBy, sortOrder.toUpperCase()]],
        raw: false
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
    } catch (error) {
      console.error('Error querying logs:', error);
      throw new Error(`Không thể truy vấn logs: ${error.message}`);
    }
  }

  /**
   * Get a single log entry by ID
   * @param {number} id_log - Log entry ID
   * @returns {Promise<Object>} Log entry
   */
  async getById(id_log) {
    if (!id_log) {
      throw new Error('Thiếu id_log');
    }

    try {
      const logEntry = await LogHeThong.findByPk(id_log);

      if (!logEntry) {
        throw new Error(`Không tìm thấy log với id ${id_log}`);
      }

      return logEntry;
    } catch (error) {
      console.error('Error getting log by ID:', error);
      throw error;
    }
  }

  /**
   * Get logs for a specific user
   * @param {string} loai_nguoi_dung - User type
   * @param {number} id_nguoi_dung - User ID
   * @param {Object} options - Additional query options
   * @returns {Promise<Object>} User's log entries
   */
  async getByUser(loai_nguoi_dung, id_nguoi_dung, options = {}) {
    if (!loai_nguoi_dung || !id_nguoi_dung) {
      throw new Error('Thiếu loai_nguoi_dung hoặc id_nguoi_dung');
    }

    return await this.query({
      loai_nguoi_dung,
      id_nguoi_dung,
      ...options
    });
  }

  /**
   * Get logs for a specific action type
   * @param {string} hanh_dong - Action type
   * @param {Object} options - Additional query options
   * @returns {Promise<Object>} Action logs
   */
  async getByAction(hanh_dong, options = {}) {
    if (!hanh_dong) {
      throw new Error('Thiếu hanh_dong');
    }

    return await this.query({
      hanh_dong,
      ...options
    });
  }

  /**
   * Get logs for a specific table and record
   * @param {string} bang_lien_quan - Table name
   * @param {number} id_ban_ghi - Record ID
   * @param {Object} options - Additional query options
   * @returns {Promise<Object>} Record audit trail
   */
  async getAuditTrail(bang_lien_quan, id_ban_ghi, options = {}) {
    if (!bang_lien_quan || !id_ban_ghi) {
      throw new Error('Thiếu bang_lien_quan hoặc id_ban_ghi');
    }

    return await this.query({
      bang_lien_quan,
      id_ban_ghi,
      ...options
    });
  }

  /**
   * Delete old logs (for maintenance)
   * @param {number} days - Delete logs older than this many days
   * @returns {Promise<number>} Number of deleted logs
   */
  async deleteOldLogs(days = 365) {
    if (!days || days < 30) {
      throw new Error('Số ngày phải lớn hơn hoặc bằng 30');
    }

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const deletedCount = await LogHeThong.destroy({
        where: {
          ngay_tao: {
            [Op.lt]: cutoffDate
          }
        }
      });

      return deletedCount;
    } catch (error) {
      console.error('Error deleting old logs:', error);
      throw new Error(`Không thể xóa logs cũ: ${error.message}`);
    }
  }

  /**
   * Get log statistics
   * @param {Object} filters - Query filters (same as query method)
   * @returns {Promise<Object>} Statistics about logs
   */
  async getStatistics(filters = {}) {
    try {
      const { tu_ngay, den_ngay } = filters;
      const where = {};

      // Date range filter
      if (tu_ngay || den_ngay) {
        where.ngay_tao = {};
        if (tu_ngay) {
          where.ngay_tao[Op.gte] = new Date(tu_ngay);
        }
        if (den_ngay) {
          const endDate = new Date(den_ngay);
          endDate.setDate(endDate.getDate() + 1);
          where.ngay_tao[Op.lt] = endDate;
        }
      }

      // Get total count
      const totalLogs = await LogHeThong.count({ where });

      // Get count by user type
      const byUserType = await LogHeThong.findAll({
        where,
        attributes: [
          'loai_nguoi_dung',
          [db.sequelize.fn('COUNT', db.sequelize.col('id_log')), 'count']
        ],
        group: ['loai_nguoi_dung'],
        raw: true
      });

      // Get count by action
      const byAction = await LogHeThong.findAll({
        where,
        attributes: [
          'hanh_dong',
          [db.sequelize.fn('COUNT', db.sequelize.col('id_log')), 'count']
        ],
        group: ['hanh_dong'],
        order: [[db.sequelize.fn('COUNT', db.sequelize.col('id_log')), 'DESC']],
        limit: 10,
        raw: true
      });

      // Get count by table
      const byTable = await LogHeThong.findAll({
        where: {
          ...where,
          bang_lien_quan: { [Op.ne]: null }
        },
        attributes: [
          'bang_lien_quan',
          [db.sequelize.fn('COUNT', db.sequelize.col('id_log')), 'count']
        ],
        group: ['bang_lien_quan'],
        order: [[db.sequelize.fn('COUNT', db.sequelize.col('id_log')), 'DESC']],
        limit: 10,
        raw: true
      });

      return {
        totalLogs,
        byUserType,
        byAction,
        byTable
      };
    } catch (error) {
      console.error('Error getting log statistics:', error);
      throw new Error(`Không thể lấy thống kê logs: ${error.message}`);
    }
  }
}

module.exports = new LogService();
