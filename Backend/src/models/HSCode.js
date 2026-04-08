'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class HSCode extends Model {
    static associate(models) {
      // HSCode is a reference table, typically no associations needed
      // Can be referenced by NguyenPhuLieu or SanPham if needed in future
    }
  }

  HSCode.init({
    id_hs: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    ma_hs: { 
      type: DataTypes.STRING(20), 
      allowNull: false,
      unique: true,
      comment: 'Mã HS Code (Harmonized System Code)'
    },
    ten_hang_hoa: { 
      type: DataTypes.STRING(500), 
      allowNull: false,
      comment: 'Tên hàng hóa theo HS Code'
    },
    mo_ta: { 
      type: DataTypes.TEXT, 
      allowNull: true,
      comment: 'Mô tả chi tiết hàng hóa'
    },
    thue_nhap_khau: { 
      type: DataTypes.DECIMAL(5, 2), 
      allowNull: true,
      defaultValue: 0,
      comment: 'Thuế suất nhập khẩu (%)'
    },
    thue_xuat_khau: { 
      type: DataTypes.DECIMAL(5, 2), 
      allowNull: true,
      defaultValue: 0,
      comment: 'Thuế suất xuất khẩu (%)'
    }
  }, {
    sequelize,
    modelName: 'HSCode',
    tableName: 'HSCode',
    timestamps: false
  });

  return HSCode;
};
