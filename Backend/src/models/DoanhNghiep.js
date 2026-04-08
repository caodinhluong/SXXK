'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DoanhNghiep extends Model {
    static associate(models) {
      DoanhNghiep.hasMany(models.HopDong, { foreignKey: 'id_dn', as: 'hopDongs' });
      DoanhNghiep.hasMany(models.QuyDoiDonViDN, { foreignKey: 'id_dn', as: 'quyDois' });
      DoanhNghiep.hasMany(models.QuyDoiDonViSP, { foreignKey: 'id_dn', as: 'quyDoiSPs' });
      DoanhNghiep.hasMany(models.QuyDoiNPL, { foreignKey: 'id_dn', as: 'quyDoiNPLs' });
      DoanhNghiep.hasMany(models.NguyenPhuLieu, { foreignKey: 'id_dn', as: 'nguyenPhuLieus' });
      DoanhNghiep.hasMany(models.SanPham, { foreignKey: 'id_dn', as: 'sanPhams' });
      DoanhNghiep.hasMany(models.HoaDonNoiDia, { foreignKey: 'id_dn', as: 'hoaDonNoiDias' });
    }
  }

  
  
  DoanhNghiep.init({
    id_dn: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    ten_dn: { type: DataTypes.STRING(255), allowNull: false },
    ma_so_thue: { type: DataTypes.STRING(50), unique: true, allowNull: false },
    dia_chi: DataTypes.STRING(255),
    email: { type: DataTypes.STRING(100), validate: { isEmail: true } },
    sdt: DataTypes.STRING(20),
    status: DataTypes.STRING(20),
    mat_khau: { type: DataTypes.STRING(255), allowNull: false },
    file_giay_phep: DataTypes.STRING(255),
  }, {
    sequelize,
    modelName: 'DoanhNghiep',
    tableName: 'DoanhNghiep',
    timestamps: false,
  });
  return DoanhNghiep;
};
