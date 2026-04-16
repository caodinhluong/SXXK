'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LoHang extends Model {
    static associate(models) {
      LoHang.belongsTo(models.HopDong, { foreignKey: 'id_hd', as: 'hopDong' });
      LoHang.hasMany(models.VanDonNhap, { foreignKey: 'id_lh', as: 'vanDonNhaps' });
      LoHang.hasMany(models.VanDonXuat, { foreignKey: 'id_lh', as: 'vanDonXuats' });
      LoHang.hasMany(models.HoaDonNhap, { foreignKey: 'id_lh', as: 'hoaDonNhaps' });
      LoHang.hasMany(models.HoaDonXuat, { foreignKey: 'id_lh', as: 'hoaDonXuats' });
      LoHang.hasMany(models.ToKhaiNhap, { foreignKey: 'id_lh', as: 'toKhaiNhaps' });
      LoHang.hasMany(models.ToKhaiXuat, { foreignKey: 'id_lh', as: 'toKhaiXuats' });
    }
  }
  LoHang.init({
    id_lh: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_hd: { type: DataTypes.INTEGER, allowNull: false },
    so_lo: { type: DataTypes.STRING(50), allowNull: true },
    ngay_lo: { type: DataTypes.DATEONLY, allowNull: true },
    so_luong: { type: DataTypes.DECIMAL(15, 3), allowNull: true },
    ngay_dong_goi: { type: DataTypes.DATEONLY, allowNull: true },
    ngay_xuat_cang: { type: DataTypes.DATEONLY, allowNull: true },
    cang_xuat: { type: DataTypes.STRING(255), allowNull: true },
    cang_nhap: { type: DataTypes.STRING(255), allowNull: true },
    file_chung_tu: { type: DataTypes.STRING(255), allowNull: true },
    trang_thai: { type: DataTypes.STRING(50), allowNull: true }
  }, {
    sequelize,
    modelName: 'LoHang',
    tableName: 'LoHang',
    timestamps: false
  });
  return LoHang;
};
