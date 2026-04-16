'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DoiSoatDinhMucChiTiet extends Model {
    static associate(models) {
      DoiSoatDinhMucChiTiet.belongsTo(models.DoiSoatDinhMuc, { 
        foreignKey: 'id_ds', 
        as: 'doiSoatDinhMuc' 
      });
      DoiSoatDinhMucChiTiet.belongsTo(models.NguyenPhuLieu, { 
        foreignKey: 'id_npl', 
        as: 'nguyenPhuLieu' 
      });
    }
  }

  DoiSoatDinhMucChiTiet.init({
    id_ct: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_ds: { type: DataTypes.INTEGER, allowNull: false },
    id_npl: { type: DataTypes.INTEGER, allowNull: true },
    sl_dinh_muc: { type: DataTypes.DECIMAL(18,3), allowNull: false, defaultValue: 0 },
    sl_thuc_te: { type: DataTypes.DECIMAL(18,3), allowNull: false, defaultValue: 0 },
    chenh_lech: { type: DataTypes.DECIMAL(18,3), allowNull: false, defaultValue: 0 },
    ty_le_chenh_lech: { type: DataTypes.DECIMAL(5,2), allowNull: true, defaultValue: 0 }
  }, {
    sequelize,
    modelName: 'DoiSoatDinhMucChiTiet',
    tableName: 'DoiSoatDinhMucChiTiet',
    timestamps: false
  });

  return DoiSoatDinhMucChiTiet;
};
