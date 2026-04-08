'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SanPham extends Model {
    static associate(models) {
      SanPham.belongsTo(models.DoanhNghiep, { foreignKey: 'id_dn', as: 'doanhNghiep' });
      SanPham.belongsTo(models.DonViTinhHQ, { foreignKey: 'id_dvt_hq', as: 'donViTinhHQ' });
      SanPham.hasMany(models.DinhMucSanPham, { foreignKey: 'id_sp', as: 'dinhMucs' });
      SanPham.hasMany(models.QuyDoiDonViSP, { foreignKey: 'id_sp', as: 'quyDoiDonViSPs' });
      SanPham.hasMany(models.HoaDonXuatChiTiet, { foreignKey: 'id_sp', as: 'hoaDonXuatChiTiets' });
      SanPham.hasMany(models.TonKhoSP, { foreignKey: 'id_sp', as: 'tonKhoSPs' });
      SanPham.hasMany(models.LichSuTonKhoSP, { foreignKey: 'id_sp', as: 'lichSuTonKhoSPs' });
      SanPham.hasMany(models.HoaDonNoiDiaChiTiet, { foreignKey: 'id_sp', as: 'hoaDonNoiDiaChiTiets' });
      SanPham.hasMany(models.BanThanhPham, { foreignKey: 'id_sp', as: 'banThanhPhams' });
    }
  }
  SanPham.init({
    id_sp: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ten_sp: { type: DataTypes.STRING(255), allowNull: false },
    ma_sp: { type: DataTypes.STRING(50), allowNull: true, comment: 'Mã sản phẩm' },
    mo_ta: { type: DataTypes.TEXT, allowNull: true },
    id_dvt_hq: { type: DataTypes.INTEGER, allowNull: false },
    id_dn: { type: DataTypes.INTEGER, allowNull: false },
    loai_sp: { 
      type: DataTypes.ENUM('ThanhPham', 'BanThanhPham'), 
      allowNull: true,
      defaultValue: 'ThanhPham'
    }
  }, {
    sequelize,
    modelName: 'SanPham',
    tableName: 'SanPham',
    timestamps: false
  });
  return SanPham;
};
