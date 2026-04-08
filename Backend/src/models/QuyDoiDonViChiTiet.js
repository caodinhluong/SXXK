'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class QuyDoiDonViChiTiet extends Model {
    static associate(models) {
      QuyDoiDonViChiTiet.belongsTo(models.DonViTinhHQ, { 
        foreignKey: 'id_dvt_nguon', 
        as: 'donViTinhNguon',
        targetKey: 'id_dvt_hq'
      });
      QuyDoiDonViChiTiet.belongsTo(models.DonViTinhHQ, { 
        foreignKey: 'id_dvt_dich', 
        as: 'donViTinhDich',
        targetKey: 'id_dvt_hq'
      });
      QuyDoiDonViChiTiet.belongsTo(models.DoanhNghiep, { foreignKey: 'id_dn', as: 'doanhNghiep' });
    }
  }

  QuyDoiDonViChiTiet.init({
    id_qd: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true,
      comment: 'ID quy đổi chi tiết'
    },
    id_dn: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      comment: 'ID doanh nghiệp' 
    },
    id_dvt_nguon: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      comment: 'ID đơn vị tính nguồn (mua vào)' 
    },
    id_dvt_dich: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      comment: 'ID đơn vị tính đích (lưu kho)' 
    },
    ty_le: { 
      type: DataTypes.DECIMAL(15,6), 
      allowNull: false,
      comment: 'Tỷ lệ quy đổi: 1 đơn vị nguồn = ty_le đơn vị đích' 
    },
    mo_ta: { 
      type: DataTypes.STRING(255), 
      allowNull: true,
      comment: 'Mô tả thêm về quy đổi' 
    },
    ngay_hieu_luc: { 
      type: DataTypes.DATEONLY, 
      allowNull: true,
      comment: 'Ngày hiệu lực của tỷ lệ quy đổi' 
    },
    ngay_het_han: { 
      type: DataTypes.DATEONLY, 
      allowNull: true,
      comment: 'Ngày hết hạn (nếu có)' 
    },
    trang_thai: { 
      type: DataTypes.ENUM('HoatDong', 'KhongHoatDong'), 
      allowNull: false,
      defaultValue: 'HoatDong' 
    }
  }, {
    sequelize,
    modelName: 'QuyDoiDonViChiTiet',
    tableName: 'QuyDoiDonViChiTiet',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['id_dn', 'id_dvt_nguon', 'id_dvt_dich']
      }
    ]
  });

  return QuyDoiDonViChiTiet;
};
