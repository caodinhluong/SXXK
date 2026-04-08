'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DoiSoatXuatChiTiet extends Model {
    /**
     * Define associations for DoiSoatXuatChiTiet model
     * @param {Object} models - All models in the application
     */
    static associate(models) {
      // DoiSoatXuatChiTiet belongs to DoiSoatXuat
      DoiSoatXuatChiTiet.belongsTo(models.DoiSoatXuat, { 
        foreignKey: 'id_ds', 
        as: 'doiSoatXuat' 
      });
      
      // DoiSoatXuatChiTiet belongs to SanPham
      DoiSoatXuatChiTiet.belongsTo(models.SanPham, { 
        foreignKey: 'id_sp', 
        as: 'sanPham' 
      });
    }
  }

  DoiSoatXuatChiTiet.init({
    id_ct: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true,
      comment: 'Primary key - Chi tiet ID'
    },
    id_ds: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      comment: 'Foreign key to DoiSoatXuat'
    },
    id_sp: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      comment: 'Foreign key to SanPham'
    },
    sl_to_khai: { 
      type: DataTypes.DECIMAL(18,3), 
      allowNull: false,
      defaultValue: 0,
      comment: 'Quantity declared in customs declaration'
    },
    sl_xuat_kho: { 
      type: DataTypes.DECIMAL(18,3), 
      allowNull: false,
      defaultValue: 0,
      comment: 'Quantity actually exported from warehouse'
    },
    chenh_lech: { 
      type: DataTypes.DECIMAL(18,3), 
      allowNull: false,
      defaultValue: 0,
      comment: 'Discrepancy (sl_xuat_kho - sl_to_khai)'
    },
    ly_do: { 
      type: DataTypes.TEXT, 
      allowNull: true,
      comment: 'Reason for discrepancy'
    }
  }, {
    sequelize,
    modelName: 'DoiSoatXuatChiTiet',
    tableName: 'DoiSoatXuatChiTiet',
    timestamps: false
  });

  return DoiSoatXuatChiTiet;
};
