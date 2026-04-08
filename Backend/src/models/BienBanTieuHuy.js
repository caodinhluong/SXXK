'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BienBanTieuHuy extends Model {
    /**
     * Define associations for BienBanTieuHuy model
     * @param {Object} models - All models in the application
     */
    static associate(models) {
      // BienBanTieuHuy belongs to DoanhNghiep
      BienBanTieuHuy.belongsTo(models.DoanhNghiep, { 
        foreignKey: 'id_dn', 
        as: 'doanhNghiep' 
      });
      
      // BienBanTieuHuy has many BienBanTieuHuyChiTiet
      BienBanTieuHuy.hasMany(models.BienBanTieuHuyChiTiet, { 
        foreignKey: 'id_bb', 
        as: 'chiTiets' 
      });
    }
  }

  BienBanTieuHuy.init({
    id_bb: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true,
      comment: 'Primary key - Bien ban tieu huy ID'
    },
    id_dn: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      comment: 'Foreign key to DoanhNghiep'
    },
    so_bien_ban: { 
      type: DataTypes.STRING(50), 
      allowNull: false,
      comment: 'Destruction report number'
    },
    ngay_tieu_huy: { 
      type: DataTypes.DATEONLY, 
      allowNull: false,
      comment: 'Destruction date'
    },
    dia_diem: { 
      type: DataTypes.STRING(255), 
      allowNull: false,
      comment: 'Location of destruction'
    },
    ly_do: { 
      type: DataTypes.TEXT, 
      allowNull: false,
      comment: 'Reason for destruction'
    },
    thanh_phan_tham_gia: { 
      type: DataTypes.TEXT, 
      allowNull: true,
      comment: 'Participants in destruction process (JSON or text list)'
    },
    co_quan_chung_kien: { 
      type: DataTypes.STRING(255), 
      allowNull: true,
      comment: 'Witnessing authority/organization'
    },
    file_bien_ban: { 
      type: DataTypes.STRING(255), 
      allowNull: true,
      comment: 'Path to destruction report file'
    },
    file_hinh_anh: { 
      type: DataTypes.TEXT, 
      allowNull: true,
      comment: 'Paths to destruction images (JSON array or comma-separated)'
    },
    trang_thai: { 
      type: DataTypes.ENUM('ChuaThucHien', 'DangThucHien', 'HoanThanh', 'Huy'), 
      allowNull: false,
      defaultValue: 'ChuaThucHien',
      comment: 'Status of destruction process'
    }
  }, {
    sequelize,
    modelName: 'BienBanTieuHuy',
    tableName: 'BienBanTieuHuy',
    timestamps: false
  });

  return BienBanTieuHuy;
};
