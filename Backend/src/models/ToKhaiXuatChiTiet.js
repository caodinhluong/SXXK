'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ToKhaiXuatChiTiet extends Model {
    /**
     * Define associations for ToKhaiXuatChiTiet model
     * Each detail line belongs to a ToKhaiXuat and can reference either NPL or SP
     */
    static associate(models) {
      // Belongs to ToKhaiXuat
      ToKhaiXuatChiTiet.belongsTo(models.ToKhaiXuat, { 
        foreignKey: 'id_tkx', 
        as: 'toKhaiXuat' 
      });
      
      // Belongs to NguyenPhuLieu (optional - either NPL or SP)
      ToKhaiXuatChiTiet.belongsTo(models.NguyenPhuLieu, { 
        foreignKey: 'id_npl', 
        as: 'nguyenPhuLieu' 
      });
      
      // Belongs to SanPham (optional - either NPL or SP)
      ToKhaiXuatChiTiet.belongsTo(models.SanPham, { 
        foreignKey: 'id_sp', 
        as: 'sanPham' 
      });
      
      // Belongs to DonViTinhHQ for standard unit
      ToKhaiXuatChiTiet.belongsTo(models.DonViTinhHQ, { 
        foreignKey: 'dvt_chuan', 
        as: 'donViTinhChuan' 
      });
    }
  }
  
  ToKhaiXuatChiTiet.init({
    id_ct: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true,
      comment: 'ID chi tiết tờ khai xuất'
    },
    id_tkx: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      comment: 'ID tờ khai xuất'
    },
    id_npl: { 
      type: DataTypes.INTEGER, 
      allowNull: true,
      comment: 'ID nguyên phụ liệu (nếu xuất NPL)'
    },
    id_sp: { 
      type: DataTypes.INTEGER, 
      allowNull: true,
      comment: 'ID sản phẩm (nếu xuất SP)'
    },
    so_luong: { 
      type: DataTypes.DECIMAL(18, 4), 
      allowNull: false,
      comment: 'Số lượng xuất'
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
    modelName: 'ToKhaiXuatChiTiet',
    tableName: 'ToKhaiXuatChiTiet',
    timestamps: false,
    comment: 'Chi tiết tờ khai xuất - danh sách hàng hóa trong tờ khai'
  });
  
  return ToKhaiXuatChiTiet;
};
