'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class XuatKhoSP extends Model {
    static associate(models) {
      XuatKhoSP.belongsTo(models.Kho, { foreignKey: 'id_kho', as: 'kho' });
      XuatKhoSP.belongsTo(models.HoaDonXuat, { foreignKey: 'id_hd_xuat', as: 'hoaDonXuat' });
      XuatKhoSP.belongsTo(models.ToKhaiXuat, { foreignKey: 'id_tkx', as: 'toKhaiXuat' });
      XuatKhoSP.hasMany(models.XuatKhoSPChiTiet, { foreignKey: 'id_xuat', as: 'chiTiets' });
    }
  }

  XuatKhoSP.init({
    id_xuat: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_kho: { type: DataTypes.INTEGER, allowNull: false },
    id_hd_xuat: { type: DataTypes.INTEGER, allowNull: true },
    id_tkx: { 
      type: DataTypes.INTEGER, 
      allowNull: true,
      comment: 'ID tờ khai xuất liên quan (để đối soát mã 155)' 
    },
    ngay_xuat: { type: DataTypes.DATEONLY, allowNull: false },
    ca_kip: { 
      type: DataTypes.STRING(50), 
      allowNull: true, 
      comment: 'Ca kíp sản xuất' 
    },
    ly_do_xuat: { 
      type: DataTypes.ENUM('XuatKhau', 'BanNoiDia', 'TamXuatTaiNhap', 'ChuyenKhau', 'TaiXuat', 'BanhThanhPham'), 
      allowNull: true,
      defaultValue: 'XuatKhau',
      comment: 'Lý do xuất kho: xuất khẩu, bán nội địa, tạm xuất tái nhập, chuyển khẩu, tái xuất, bán thành phẩm'
    },
    ghi_chu: { type: DataTypes.TEXT, allowNull: true },
    file_phieu: { type: DataTypes.STRING(255), allowNull: true }
  }, {
    sequelize,
    modelName: 'XuatKhoSP',
    tableName: 'XuatKhoSP',
    timestamps: false
  });

  return XuatKhoSP;
};
