'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class HopDong extends Model {
    static associate(models) {
      HopDong.belongsTo(models.DoanhNghiep, { foreignKey: 'id_dn', as: 'doanhNghiep' });
      HopDong.belongsTo(models.TienTe, { foreignKey: 'id_tt', as: 'tienTe' });
      HopDong.belongsTo(models.SanPham, { foreignKey: 'id_sp', as: 'sanPham' });
      HopDong.hasMany(models.LoHang, { foreignKey: 'id_hd', as: 'loHangs' });
      HopDong.hasMany(models.BaoCaoThanhKhoan, { foreignKey: 'id_hd', as: 'baoCaoThanhKhoans' });
    }
  }
  HopDong.init({
    id_hd: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_dn: { type: DataTypes.INTEGER, allowNull: false },
    so_hd: { type: DataTypes.STRING(50), allowNull: false },
    ngay_ky: { type: DataTypes.DATEONLY, allowNull: false },
    ngay_hieu_luc: { type: DataTypes.DATEONLY, allowNull: true },
    ngay_het_han: { type: DataTypes.DATEONLY, allowNull: true },
    gia_tri: { type: DataTypes.DECIMAL(18,2), allowNull: true },
    id_tt: { type: DataTypes.INTEGER, allowNull: true },
    file_hop_dong: { type: DataTypes.STRING(255), allowNull: true },
    ten_doi_tac: { 
      type: DataTypes.STRING(255), 
      allowNull: true,
      comment: 'Tên đối tác mua hàng' 
    },
    dia_chi_doi_tac: { 
      type: DataTypes.STRING(255), 
      allowNull: true,
      comment: 'Địa chỉ đối tác' 
    },
    ma_so_thue_doi_tac: { 
      type: DataTypes.STRING(50), 
      allowNull: true,
      comment: 'Mã số thuế đối tác' 
    },
    so_luong_dat_hang: { 
      type: DataTypes.DECIMAL(15,3), 
      allowNull: true,
      comment: 'Số lượng sản phẩm đặt mua theo hợp đồng' 
    },
    id_sp: { 
      type: DataTypes.INTEGER, 
      allowNull: true,
      comment: 'ID sản phẩm đặt mua' 
    }
  }, {
    sequelize,
    modelName: 'HopDong',
    tableName: 'HopDong',
    timestamps: false
  });
  return HopDong;
};
