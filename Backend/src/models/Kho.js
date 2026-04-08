'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Kho extends Model {
    static associate(models) {
      Kho.belongsTo(models.DoanhNghiep, { foreignKey: 'id_dn', as: 'doanhNghiep' });
      Kho.hasMany(models.NhapKhoNPL, { foreignKey: 'id_kho', as: 'nhapKhoNPLs' });
      Kho.hasMany(models.XuatKhoNPL, { foreignKey: 'id_kho', as: 'xuatKhoNPLs' });
      Kho.hasMany(models.NhapKhoSP, { foreignKey: 'id_kho', as: 'nhapKhoSPs' });
      Kho.hasMany(models.XuatKhoSP, { foreignKey: 'id_kho', as: 'xuatKhoSPs' });
      Kho.hasMany(models.TonKhoNPL, { foreignKey: 'id_kho', as: 'tonKhoNPLs' });
      Kho.hasMany(models.TonKhoSP, { foreignKey: 'id_kho', as: 'tonKhoSPs' });
      Kho.hasMany(models.LichSuTonKhoNPL, { foreignKey: 'id_kho', as: 'lichSuTonKhoNPLs' });
      Kho.hasMany(models.LichSuTonKhoSP, { foreignKey: 'id_kho', as: 'lichSuTonKhoSPs' });
    }
  }

  Kho.init({
    id_kho: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_dn: { type: DataTypes.INTEGER, allowNull: false },
    ten_kho: { type: DataTypes.STRING(255), allowNull: false },
    dia_chi: { type: DataTypes.STRING(255), allowNull: true },
    ma_kho: { type: DataTypes.STRING(50), allowNull: true },
    loai_kho: { 
      type: DataTypes.ENUM('NguyenLieu', 'ThanhPham', 'BanThanhPham', 'TongHop'), 
      allowNull: true,
      defaultValue: 'TongHop'
    }
  }, {
    sequelize,
    modelName: 'Kho',
    tableName: 'Kho',
    timestamps: false
  });

  return Kho;
};
