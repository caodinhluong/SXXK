'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DoiSoatNhapChiTiet extends Model {
    static associate(models) {
      DoiSoatNhapChiTiet.belongsTo(models.DoiSoatNhap, { 
        foreignKey: 'id_ds', 
        as: 'doiSoatNhap' 
      });
      DoiSoatNhapChiTiet.belongsTo(models.NguyenPhuLieu, { 
        foreignKey: 'id_npl', 
        as: 'nguyenPhuLieu' 
      });
      DoiSoatNhapChiTiet.belongsTo(models.SanPham, { 
        foreignKey: 'id_sp', 
        as: 'sanPham' 
      });
    }
  }

  DoiSoatNhapChiTiet.init({
    id_ct: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_ds: { type: DataTypes.INTEGER, allowNull: false },
    id_npl: { type: DataTypes.INTEGER, allowNull: true },
    id_sp: { type: DataTypes.INTEGER, allowNull: true },
    sl_to_khai: { type: DataTypes.DECIMAL(18,3), allowNull: false, defaultValue: 0 },
    sl_nhap_kho: { type: DataTypes.DECIMAL(18,3), allowNull: false, defaultValue: 0 },
    chenh_lech: { type: DataTypes.DECIMAL(18,3), allowNull: false, defaultValue: 0 },
    ly_do: { type: DataTypes.TEXT, allowNull: true }
  }, {
    sequelize,
    modelName: 'DoiSoatNhapChiTiet',
    tableName: 'DoiSoatNhapChiTiet',
    timestamps: false
  });

  return DoiSoatNhapChiTiet;
};
