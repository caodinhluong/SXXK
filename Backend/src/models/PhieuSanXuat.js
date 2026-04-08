'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PhieuSanXuat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // belongsTo DoanhNghiep
      PhieuSanXuat.belongsTo(models.DoanhNghiep, { 
        foreignKey: 'id_dn', 
        as: 'doanhNghiep' 
      });
      
      // belongsTo XuatKhoNPL
      PhieuSanXuat.belongsTo(models.XuatKhoNPL, { 
        foreignKey: 'id_xuat_npl', 
        as: 'xuatKhoNPL' 
      });
      
      // belongsTo SanPham
      PhieuSanXuat.belongsTo(models.SanPham, { 
        foreignKey: 'id_sp', 
        as: 'sanPham' 
      });
      
      // hasOne NhapKhoSP
      PhieuSanXuat.hasOne(models.NhapKhoSP, { 
        foreignKey: 'id_sx', 
        as: 'nhapKhoSP' 
      });
    }
  }

  PhieuSanXuat.init({
    id_sx: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true,
      comment: 'ID phiếu sản xuất'
    },
    id_dn: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      comment: 'ID doanh nghiệp'
    },
    so_phieu: { 
      type: DataTypes.STRING(50), 
      allowNull: false,
      comment: 'Số phiếu sản xuất'
    },
    ngay_sx: { 
      type: DataTypes.DATEONLY, 
      allowNull: false,
      comment: 'Ngày sản xuất'
    },
    ca_kip: { 
      type: DataTypes.STRING(50), 
      allowNull: true,
      comment: 'Ca kíp sản xuất'
    },
    id_xuat_npl: { 
      type: DataTypes.INTEGER, 
      allowNull: true,
      comment: 'ID phiếu xuất NPL liên quan'
    },
    id_sp: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      comment: 'ID sản phẩm được sản xuất'
    },
    so_luong_ke_hoach: { 
      type: DataTypes.DECIMAL(15, 3), 
      allowNull: false,
      comment: 'Số lượng kế hoạch sản xuất'
    },
    so_luong_thuc_te: { 
      type: DataTypes.DECIMAL(15, 3), 
      allowNull: true,
      comment: 'Số lượng thực tế sản xuất'
    },
    ty_le_hoan_thanh: { 
      type: DataTypes.DECIMAL(5, 2), 
      allowNull: true,
      comment: 'Tỷ lệ hoàn thành (%)'
    },
    nguoi_phu_trach: { 
      type: DataTypes.STRING(100), 
      allowNull: true,
      comment: 'Người phụ trách sản xuất'
    },
    trang_thai: { 
      type: DataTypes.ENUM('KeHoach', 'DangSanXuat', 'HoanThanh', 'Huy'), 
      allowNull: false,
      defaultValue: 'KeHoach',
      comment: 'Trạng thái phiếu sản xuất'
    },
    ghi_chu: { 
      type: DataTypes.TEXT, 
      allowNull: true,
      comment: 'Ghi chú'
    }
  }, {
    sequelize,
    modelName: 'PhieuSanXuat',
    tableName: 'PhieuSanXuat',
    timestamps: false
  });

  return PhieuSanXuat;
};
