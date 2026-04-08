'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BaoCaoThanhKhoanNPL extends Model {
    static associate(models) {
      // Belongs to BaoCaoThanhKhoan
      BaoCaoThanhKhoanNPL.belongsTo(models.BaoCaoThanhKhoan, { 
        foreignKey: 'id_bc', 
        as: 'baoCaoThanhKhoan' 
      });
      
      // Belongs to NguyenPhuLieu
      BaoCaoThanhKhoanNPL.belongsTo(models.NguyenPhuLieu, { 
        foreignKey: 'id_npl', 
        as: 'nguyenPhuLieu' 
      });
    }
  }

  BaoCaoThanhKhoanNPL.init({
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
    id_npl: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'ID nguyên phụ liệu'
    },
    ton_dau_ky: {
      type: DataTypes.DECIMAL(15, 3),
      defaultValue: 0,
      comment: 'Tồn đầu kỳ'
    },
    nhap_trong_ky: {
      type: DataTypes.DECIMAL(15, 3),
      defaultValue: 0,
      comment: 'Nhập trong kỳ'
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
    ton_ly_thuyet: {
      type: DataTypes.DECIMAL(15, 3),
      defaultValue: 0,
      comment: 'Tồn lý thuyết (tính theo định mức)'
    },
    chenh_lech: {
      type: DataTypes.DECIMAL(15, 3),
      defaultValue: 0,
      comment: 'Chênh lệch giữa tồn thực tế và lý thuyết'
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
    modelName: 'BaoCaoThanhKhoanNPL',
    tableName: 'BaoCaoThanhKhoanNPL',
    timestamps: false
  });

  return BaoCaoThanhKhoanNPL;
};
