'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class XuatKhoNPL extends Model {
    static associate(models) {
      XuatKhoNPL.belongsTo(models.Kho, { foreignKey: 'id_kho', as: 'kho' });
      XuatKhoNPL.hasMany(models.XuatKhoNPLChiTiet, { foreignKey: 'id_xuat', as: 'chiTiets' });
    }
  }

  XuatKhoNPL.init({
    id_xuat: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_kho: { type: DataTypes.INTEGER, allowNull: false },
    ngay_xuat: { type: DataTypes.DATEONLY, allowNull: false },
    ca_kip: { type: DataTypes.STRING(50), allowNull: true, comment: 'Ca kíp sản xuất' },
    file_phieu: { type: DataTypes.STRING(255), allowNull: true }
  }, {
    sequelize,
    modelName: 'XuatKhoNPL',
    tableName: 'XuatKhoNPL',
    timestamps: false
  });

  return XuatKhoNPL;
};
