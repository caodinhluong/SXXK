'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BaoCaoThanhKhoanSP extends Model {
    static associate(models) {
      // Belongs to BaoCaoThanhKhoan
      BaoCaoThanhKhoanSP.belongsTo(models.BaoCaoThanhKhoan, { 
        foreignKey: 'id_bc', 
        as: 'baoCaoThanhKhoan' 
      });
      
      // Belongs to SanPham
      BaoCaoThanhKhoanSP.belongsTo(models.SanPham, { 
        foreignKey: 'id_sp', 
        as: 'sanPham' 
      });
    }
  }

  BaoCaoThanhKhoanSP.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_bc: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID báo cáo thanh khoản'
    },
    id_sp: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID sản phẩm'
    },
    ton_dau_ky: {
      type: DataTypes.DECIMAL(15, 3),
      defaultValue: 0,
      comment: 'Tồn đầu kỳ'
    },
    san_xuat_trong_ky: {
      type: DataTypes.DECIMAL(15, 3),
      defaultValue: 0,
      comment: 'Sản xuất trong kỳ'
    },
    xuat_trong_ky: {
      type: DataTypes.DECIMAL(15, 3),
      defaultValue: 0,
      comment: 'Xuất trong kỳ'
    },
    ton_cuoi_ky: {
      type: DataTypes.DECIMAL(15, 3),
      defaultValue: 0,
      comment: 'Tồn cuối kỳ'
    },
    trang_thai: {
      type: DataTypes.ENUM('HopLe', 'CanhBao', 'ViPham'),
      defaultValue: 'HopLe',
      comment: 'Trạng thái đánh giá'
    },
    ghi_chu: {
      type: DataTypes.TEXT,
      comment: 'Ghi chú'
    }
  }, {
    sequelize,
    modelName: 'BaoCaoThanhKhoanSP',
    tableName: 'BaoCaoThanhKhoanSP',
    timestamps: false
  });

  return BaoCaoThanhKhoanSP;
};
