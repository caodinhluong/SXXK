'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TonKhoDauKy extends Model {
    static associate(models) {
      TonKhoDauKy.belongsTo(models.DoanhNghiep, { foreignKey: 'id_dn', as: 'doanhNghiep' });
      TonKhoDauKy.belongsTo(models.Kho, { foreignKey: 'id_kho', as: 'kho' });
      TonKhoDauKy.belongsTo(models.NguyenPhuLieu, { foreignKey: 'id_npl', as: 'nguyenPhuLieu' });
      TonKhoDauKy.belongsTo(models.SanPham, { foreignKey: 'id_sp', as: 'sanPham' });
    }
  }

  TonKhoDauKy.init({
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    id_dn: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      comment: 'ID doanh nghiệp' 
    },
    id_kho: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      comment: 'ID kho' 
    },
    id_npl: { 
      type: DataTypes.INTEGER, 
      allowNull: true,
      comment: 'ID nguyên phụ liệu (nếu là tồn kho NPL)' 
    },
    id_sp: { 
      type: DataTypes.INTEGER, 
      allowNull: true,
      comment: 'ID sản phẩm (nếu là tồn kho SP)' 
    },
    loai_ton: { 
      type: DataTypes.ENUM('NguyenLieu', 'SanPham', 'BanThanhPham'), 
      allowNull: false,
      comment: 'Loại tồn kho' 
    },
    ky_bao_cao: { 
      type: DataTypes.STRING(7), 
      allowNull: false,
      comment: 'Kỳ báo cáo (format: YYYY-MM, ví dụ: 2026-01)' 
    },
    ngay_bat_dau: { 
      type: DataTypes.DATEONLY, 
      allowNull: false,
      comment: 'Ngày bắt đầu kỳ báo cáo' 
    },
    ngay_ket_thuc: { 
      type: DataTypes.DATEONLY, 
      allowNull: false,
      comment: 'Ngày kết thúc kỳ báo cáo' 
    },
    so_luong_dau_ky: { 
      type: DataTypes.DECIMAL(18, 3), 
      allowNull: false,
      defaultValue: 0,
      comment: 'Số lượng tồn đầu kỳ' 
    },
    don_vi_tinh: { 
      type: DataTypes.INTEGER, 
      allowNull: true,
      comment: 'ID đơn vị tính' 
    },
    ghi_chu: { 
      type: DataTypes.TEXT, 
      allowNull: true,
      comment: 'Ghi chú thêm' 
    },
    nguoi_tao: { 
      type: DataTypes.STRING(100), 
      allowNull: true,
      comment: 'Người tạo bản ghi' 
    },
    ngay_tao: { 
      type: DataTypes.DATE, 
      allowNull: false,
      defaultValue: DataTypes.NOW 
    }
  }, {
    sequelize,
    modelName: 'TonKhoDauKy',
    tableName: 'TonKhoDauKy',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['id_dn', 'id_kho', 'ky_bao_cao', 'loai_ton', 'id_npl', 'id_sp']
      }
    ]
  });

  return TonKhoDauKy;
};
