'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DonViTinhHQ extends Model {
    static associate(models) {
      DonViTinhHQ.hasMany(models.SanPham, { foreignKey: 'id_dvt_hq', as: 'sanPhams' });
      DonViTinhHQ.hasMany(models.NguyenPhuLieu, { foreignKey: 'id_dvt_hq', as: 'nguyenPhuLieus' });
      DonViTinhHQ.hasMany(models.QuyDoiDonViDN, { foreignKey: 'id_dvt_hq', as: 'quyDoiDonVis' });
      DonViTinhHQ.hasMany(models.QuyDoiDonViSP, { foreignKey: 'id_dvt_hq', as: 'quyDoiDonViSPs' });
      DonViTinhHQ.hasMany(models.QuyDoiNPL, { foreignKey: 'id_dvt_hq', as: 'quyDoiNPLs' });
      DonViTinhHQ.belongsTo(models.DonViTinhHQ, { foreignKey: 'id_dvt_dich', as: 'donViTinhDich' });
    }
  }
  
  DonViTinhHQ.init({
    id_dvt_hq: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ten_dvt: { type: DataTypes.STRING(50), allowNull: false },
    ma_dvt: { 
      type: DataTypes.STRING(20), 
      allowNull: true,
      comment: 'Mã đơn vị tính (ví dụ: kg, cái, bộ)' 
    },
    mo_ta: { type: DataTypes.TEXT, allowNull: true },
    loai_dvt: { 
      type: DataTypes.ENUM('TatCa', 'DonViNguon', 'DonViDich'), 
      allowNull: false,
      defaultValue: 'TatCa',
      comment: 'Loại đơn vị tính: nguồn (mua vào), đích (kho), hoặc cả hai' 
    },
    id_dvt_dich: { 
      type: DataTypes.INTEGER, 
      allowNull: true,
      comment: 'ID đơn vị tính đích để quy đổi (nếu loai_dvt là DonViNguon)' 
    },
    ty_le_quy_doi: { 
      type: DataTypes.DECIMAL(15,6), 
      allowNull: true,
      defaultValue: 1,
      comment: 'Tỷ lệ quy đổi từ đơn vị nguồn sang đơn vị đích' 
    }
  }, {
    sequelize,
    modelName: 'DonViTinhHQ',
    tableName: 'DonViTinhHQ',
    timestamps: false
  });
  return DonViTinhHQ;
};

