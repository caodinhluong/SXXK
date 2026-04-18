'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DoiSoatXuatChiTiet extends Model {
    static associate(models) {
      DoiSoatXuatChiTiet.belongsTo(models.DoiSoatXuat, { 
        foreignKey: 'id_ds', 
        as: 'doiSoatXuat' 
      });
      DoiSoatXuatChiTiet.belongsTo(models.SanPham, { 
        foreignKey: 'id_sp', 
        as: 'sanPham' 
      });
      DoiSoatXuatChiTiet.belongsTo(models.NguyenPhuLieu, { 
        foreignKey: 'id_npl', 
        as: 'nguyenPhuLieu' 
      });
    }
  }

  DoiSoatXuatChiTiet.init({
    id_ct: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_ds: { type: DataTypes.INTEGER, allowNull: false },
    id_sp: { type: DataTypes.INTEGER, allowNull: true },
    id_npl: { type: DataTypes.INTEGER, allowNull: true },
    sl_to_khai: { type: DataTypes.DECIMAL(18,3), allowNull: false, defaultValue: 0 },
    sl_xuat_kho: { type: DataTypes.DECIMAL(18,3), allowNull: false, defaultValue: 0 },
    chenh_lech: { type: DataTypes.DECIMAL(18,3), allowNull: false, defaultValue: 0 },
    ly_do: { type: DataTypes.TEXT, allowNull: true }
  }, {
    sequelize,
    modelName: 'DoiSoatXuatChiTiet',
    tableName: 'DoiSoatXuatChiTiet',
    timestamps: false
  });

  return DoiSoatXuatChiTiet;
};
