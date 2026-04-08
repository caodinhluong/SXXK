'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class NhapKhoNPL extends Model {
    static associate(models) {
      NhapKhoNPL.belongsTo(models.Kho, { foreignKey: 'id_kho', as: 'kho' });
      NhapKhoNPL.belongsTo(models.HoaDonNhap, { foreignKey: 'id_hd_nhap', as: 'hoaDonNhap' });
      NhapKhoNPL.belongsTo(models.ToKhaiNhap, { foreignKey: 'id_tkn', as: 'toKhaiNhap' });
      NhapKhoNPL.hasMany(models.NhapKhoNPLChiTiet, { foreignKey: 'id_nhap', as: 'chiTiets' });
    }
  }

  NhapKhoNPL.init({
    id_nhap: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_kho: { type: DataTypes.INTEGER, allowNull: false },
    id_hd_nhap: { type: DataTypes.INTEGER, allowNull: false },
    id_tkn: { type: DataTypes.INTEGER, allowNull: true, comment: 'Foreign key to ToKhaiNhap' },
    ngay_nhap: { type: DataTypes.DATEONLY, allowNull: false },
    file_phieu: { type: DataTypes.STRING(255), allowNull: true }
  }, {
    sequelize,
    modelName: 'NhapKhoNPL',
    tableName: 'NhapKhoNPL',
    timestamps: false
  });

  return NhapKhoNPL;
};
