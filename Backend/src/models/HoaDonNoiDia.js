'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class HoaDonNoiDia extends Model {
    static associate(models) {
      HoaDonNoiDia.belongsTo(models.DoanhNghiep, { foreignKey: 'id_dn', as: 'doanhNghiep' });
      HoaDonNoiDia.hasMany(models.HoaDonNoiDiaChiTiet, { foreignKey: 'id_hd_nd', as: 'chiTiets' });
    }
  }

  HoaDonNoiDia.init({
    id_hd_nd: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    id_dn: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      comment: 'Foreign key to DoanhNghiep'
    },
    so_hd: { 
      type: DataTypes.STRING(50), 
      allowNull: false,
      comment: 'Invoice number'
    },
    ngay_hd: { 
      type: DataTypes.DATEONLY, 
      allowNull: false,
      comment: 'Invoice date'
    },
    khach_hang: { 
      type: DataTypes.STRING(255), 
      allowNull: false,
      comment: 'Customer name'
    },
    ma_so_thue_kh: { 
      type: DataTypes.STRING(50), 
      allowNull: true,
      comment: 'Customer tax code'
    },
    dia_chi_kh: { 
      type: DataTypes.STRING(255), 
      allowNull: true,
      comment: 'Customer address'
    },
    tong_tien: { 
      type: DataTypes.DECIMAL(18, 2), 
      allowNull: false,
      defaultValue: 0,
      comment: 'Total amount before tax'
    },
    thue_gtgt: { 
      type: DataTypes.DECIMAL(18, 2), 
      allowNull: false,
      defaultValue: 0,
      comment: 'VAT amount'
    },
    tong_thanh_toan: { 
      type: DataTypes.DECIMAL(18, 2), 
      allowNull: false,
      defaultValue: 0,
      comment: 'Total amount including tax'
    },
    trang_thai: { 
      type: DataTypes.ENUM('ChuaThanhToan', 'DaThanhToan', 'Huy'), 
      allowNull: false,
      defaultValue: 'ChuaThanhToan',
      comment: 'Invoice status'
    },
    file_hoa_don: { 
      type: DataTypes.STRING(255), 
      allowNull: true,
      comment: 'Path to invoice file'
    },
    ghi_chu: { 
      type: DataTypes.TEXT, 
      allowNull: true,
      comment: 'Notes'
    }
  }, {
    sequelize,
    modelName: 'HoaDonNoiDia',
    tableName: 'HoaDonNoiDia',
    timestamps: false
  });

  return HoaDonNoiDia;
};
