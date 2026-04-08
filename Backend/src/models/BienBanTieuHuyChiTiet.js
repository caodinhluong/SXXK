'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BienBanTieuHuyChiTiet extends Model {
    /**
     * Define associations for BienBanTieuHuyChiTiet model
     * @param {Object} models - All models in the application
     */
    static associate(models) {
      // BienBanTieuHuyChiTiet belongs to BienBanTieuHuy
      BienBanTieuHuyChiTiet.belongsTo(models.BienBanTieuHuy, { 
        foreignKey: 'id_bb', 
        as: 'bienBanTieuHuy' 
      });
      
      // BienBanTieuHuyChiTiet belongs to SanPham (optional)
      BienBanTieuHuyChiTiet.belongsTo(models.SanPham, { 
        foreignKey: 'id_sp', 
        as: 'sanPham' 
      });
      
      // BienBanTieuHuyChiTiet belongs to NguyenPhuLieu (optional)
      BienBanTieuHuyChiTiet.belongsTo(models.NguyenPhuLieu, { 
        foreignKey: 'id_npl', 
        as: 'nguyenPhuLieu' 
      });
    }
  }

  BienBanTieuHuyChiTiet.init({
    id_ct: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true,
      comment: 'Primary key - Chi tiet ID'
    },
    id_bb: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      comment: 'Foreign key to BienBanTieuHuy'
    },
    id_sp: { 
      type: DataTypes.INTEGER, 
      allowNull: true,
      comment: 'Foreign key to SanPham (either id_sp OR id_npl, not both)'
    },
    id_npl: { 
      type: DataTypes.INTEGER, 
      allowNull: true,
      comment: 'Foreign key to NguyenPhuLieu (either id_sp OR id_npl, not both)'
    },
    so_luong: { 
      type: DataTypes.DECIMAL(18, 3), 
      allowNull: false,
      defaultValue: 0,
      comment: 'Quantity to be destroyed'
    },
    don_vi_tinh: { 
      type: DataTypes.STRING(50), 
      allowNull: true,
      comment: 'Unit of measurement'
    },
    ly_do_chi_tiet: { 
      type: DataTypes.TEXT, 
      allowNull: true,
      comment: 'Specific reason for destroying this item'
    }
  }, {
    sequelize,
    modelName: 'BienBanTieuHuyChiTiet',
    tableName: 'BienBanTieuHuyChiTiet',
    timestamps: false,
    validate: {
      /**
       * Ensure either id_sp OR id_npl is set, but not both
       */
      eitherSpOrNpl() {
        if ((this.id_sp && this.id_npl) || (!this.id_sp && !this.id_npl)) {
          throw new Error('Chi tiết biên bản tiêu hủy phải có id_sp HOẶC id_npl, không được cả hai hoặc không có');
        }
      }
    }
  });

  return BienBanTieuHuyChiTiet;
};
