'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class NguyenPhuLieu extends Model {
    static associate(models) {
      NguyenPhuLieu.belongsTo(models.DoanhNghiep, { foreignKey: 'id_dn', as: 'doanhNghiep' });
      NguyenPhuLieu.belongsTo(models.DonViTinhHQ, { foreignKey: 'id_dvt_hq', as: 'donViTinhHQ' });
      NguyenPhuLieu.hasMany(models.DinhMucSanPham, { foreignKey: 'id_npl', as: 'dinhMucSanPhams' });
      NguyenPhuLieu.hasMany(models.HoaDonNhapChiTiet, { foreignKey: 'id_npl', as: 'hoaDonNhapChiTiets' });
      NguyenPhuLieu.hasMany(models.TonKhoNPL, { foreignKey: 'id_npl', as: 'tonKhoNPLs' });
      NguyenPhuLieu.hasMany(models.QuyDoiNPL, { foreignKey: 'id_npl', as: 'quyDoiNPLs' });
      NguyenPhuLieu.hasMany(models.LichSuTonKhoNPL, { foreignKey: 'id_npl', as: 'lichSuTonKhoNPLs' });
      NguyenPhuLieu.hasMany(models.HoaDonNoiDiaChiTiet, { foreignKey: 'id_npl', as: 'hoaDonNoiDiaChiTiets' });
    }
  }
  NguyenPhuLieu.init({
    id_npl: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ten_npl: { type: DataTypes.STRING(255), allowNull: false },
    mo_ta: { type: DataTypes.TEXT, allowNull: true },
    id_dvt_hq: { type: DataTypes.INTEGER, allowNull: false },
    id_dn: { type: DataTypes.INTEGER, allowNull: false },
    loai_npl: { 
      type: DataTypes.ENUM('NguyenLieu', 'PhuLieu', 'BaoBi'), 
      allowNull: true,
      defaultValue: 'NguyenLieu'
    },
    ma_phan_loai: { 
      type: DataTypes.STRING(50), 
      allowNull: true 
    }
  }, {
    sequelize,
    modelName: 'NguyenPhuLieu',
    tableName: 'NguyenPhuLieu',
    timestamps: false
  });
  return NguyenPhuLieu;
};


