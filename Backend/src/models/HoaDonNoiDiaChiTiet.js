'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class HoaDonNoiDiaChiTiet extends Model {
    static associate(models) {
      HoaDonNoiDiaChiTiet.belongsTo(models.HoaDonNoiDia, { foreignKey: 'id_hd_nd', as: 'hoaDonNoiDia' });
      HoaDonNoiDiaChiTiet.belongsTo(models.SanPham, { foreignKey: 'id_sp', as: 'sanPham' });
      HoaDonNoiDiaChiTiet.belongsTo(models.NguyenPhuLieu, { foreignKey: 'id_npl', as: 'nguyenPhuLieu' });
    }
  }

  HoaDonNoiDiaChiTiet.init({
    id_ct: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    id_hd_nd: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      comment: 'Foreign key to HoaDonNoiDia'
    },
    id_sp: { 
      type: DataTypes.INTEGER, 
      allowNull: true,
      comment: 'Foreign key to SanPham (either id_sp OR id_npl, not both)'
    },
    id_npl: { 
      type: DataTypes.INTEGER, 
      allowNull: true,
      comment: 'Foreign key to NguyenPhuLieu (either id_sp OR id_npl, not both)'
    },
    so_luong: { 
      type: DataTypes.DECIMAL(18, 3), 
      allowNull: false,
      defaultValue: 0,
      comment: 'Quantity'
    },
    don_gia: { 
      type: DataTypes.DECIMAL(18, 2), 
      allowNull: false,
      defaultValue: 0,
      comment: 'Unit price'
    },
    thanh_tien: { 
      type: DataTypes.DECIMAL(18, 2), 
      allowNull: false,
      defaultValue: 0,
      comment: 'Line total (so_luong * don_gia)'
    },
    thue_suat: { 
      type: DataTypes.DECIMAL(5, 2), 
      allowNull: false,
      defaultValue: 0,
      comment: 'Tax rate (e.g., 10 for 10%)'
    }
  }, {
    sequelize,
    modelName: 'HoaDonNoiDiaChiTiet',
    tableName: 'HoaDonNoiDiaChiTiet',
    timestamps: false,
    validate: {
      eitherSpOrNpl() {
        // Ensure either id_sp OR id_npl is set, but not both
        if ((this.id_sp && this.id_npl) || (!this.id_sp && !this.id_npl)) {
          throw new Error('Chi tiết hóa đơn phải có id_sp HOẶC id_npl, không được cả hai hoặc không có');
        }
      }
    }
  });

  return HoaDonNoiDiaChiTiet;
};
