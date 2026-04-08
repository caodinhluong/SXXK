'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ToKhaiNhapChiTiet extends Model {
    /**
     * Define associations for ToKhaiNhapChiTiet model
     * Each detail line belongs to a ToKhaiNhap and can reference either NPL or SP
     */
    static associate(models) {
      // Belongs to ToKhaiNhap
      ToKhaiNhapChiTiet.belongsTo(models.ToKhaiNhap, { 
        foreignKey: 'id_tkn', 
        as: 'toKhaiNhap' 
      });
      
      // Belongs to NguyenPhuLieu (optional - either NPL or SP)
      ToKhaiNhapChiTiet.belongsTo(models.NguyenPhuLieu, { 
        foreignKey: 'id_npl', 
        as: 'nguyenPhuLieu' 
      });
      
      // Belongs to SanPham (optional - either NPL or SP)
      ToKhaiNhapChiTiet.belongsTo(models.SanPham, { 
        foreignKey: 'id_sp', 
        as: 'sanPham' 
      });
      
      // Belongs to DonViTinhHQ for standard unit
      ToKhaiNhapChiTiet.belongsTo(models.DonViTinhHQ, { 
        foreignKey: 'dvt_chuan', 
        as: 'donViTinhChuan' 
      });
    }
  }
  
  ToKhaiNhapChiTiet.init({
    id_ct: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true,
      comment: 'ID chi tiết tờ khai nhập'
    },
    id_tkn: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      comment: 'ID tờ khai nhập'
    },
    id_npl: { 
      type: DataTypes.INTEGER, 
      allowNull: true,
      comment: 'ID nguyên phụ liệu (nếu nhập NPL)'
    },
    id_sp: { 
      type: DataTypes.INTEGER, 
      allowNull: true,
      comment: 'ID sản phẩm (nếu nhập SP)'
    },
    so_luong: { 
      type: DataTypes.DECIMAL(18, 4), 
      allowNull: false,
      comment: 'Số lượng nhập'
    },
    don_vi_tinh: { 
      type: DataTypes.STRING(50), 
      allowNull: true,
      comment: 'Đơn vị tính gốc'
    },
    don_gia: { 
      type: DataTypes.DECIMAL(18, 2), 
      allowNull: true,
      comment: 'Đơn giá'
    },
    tri_gia: { 
      type: DataTypes.DECIMAL(18, 2), 
      allowNull: true,
      comment: 'Trị giá (số lượng * đơn giá)'
    },
    so_luong_chuan: { 
      type: DataTypes.DECIMAL(18, 4), 
      allowNull: true,
      comment: 'Số lượng quy đổi về đơn vị chuẩn'
    },
    dvt_chuan: { 
      type: DataTypes.INTEGER, 
      allowNull: true,
      comment: 'ID đơn vị tính chuẩn (Hải quan)'
    }
  }, {
    sequelize,
    modelName: 'ToKhaiNhapChiTiet',
    tableName: 'ToKhaiNhapChiTiet',
    timestamps: false,
    comment: 'Chi tiết tờ khai nhập - danh sách hàng hóa trong tờ khai'
  });
  
  return ToKhaiNhapChiTiet;
};
