'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class BanThanhPham extends Model {
    static associate(models) {
      BanThanhPham.belongsTo(models.DoanhNghiep, { foreignKey: 'id_dn', as: 'doanhNghiep' });
      BanThanhPham.belongsTo(models.Kho, { foreignKey: 'id_kho', as: 'kho' });
      BanThanhPham.belongsTo(models.SanPham, { foreignKey: 'id_sp', as: 'sanPham' });
      BanThanhPham.belongsTo(models.HoaDonNoiDia, { foreignKey: 'id_hd_nd', as: 'hoaDonNoiDia' });
      BanThanhPham.belongsTo(models.BienBanTieuHuy, { foreignKey: 'id_bb_th', as: 'bienBanTieuHuy' });
    }
  }

  BanThanhPham.init({
    id_btp: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    id_dn: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      comment: 'ID doanh nghiệp' 
    },
    id_sp: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      comment: 'ID sản phẩm/bán thành phẩm' 
    },
    id_kho: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      comment: 'ID kho xuất' 
    },
    so_phieu: { 
      type: DataTypes.STRING(50), 
      allowNull: false,
      comment: 'Số phiếu bán thành phẩm' 
    },
    ngay_xuat: { 
      type: DataTypes.DATEONLY, 
      allowNull: false,
      comment: 'Ngày xuất bán thành phẩm' 
    },
    ca_kip: { 
      type: DataTypes.STRING(50), 
      allowNull: true,
      comment: 'Ca kíp sản xuất' 
    },
    so_luong: { 
      type: DataTypes.DECIMAL(15, 3), 
      allowNull: false,
      comment: 'Số lượng xuất' 
    },
    don_gia: { 
      type: DataTypes.DECIMAL(18, 2), 
      allowNull: true,
      comment: 'Đơn giá' 
    },
    tong_tien: { 
      type: DataTypes.DECIMAL(18, 2), 
      allowNull: true,
      comment: 'Tổng tiền' 
    },
    loai_giao_dich: { 
      type: DataTypes.ENUM('BanNoiDia', 'TieuHuy'), 
      allowNull: false,
      defaultValue: 'BanNoiDia',
      comment: 'Loại giao dịch: bán nội địa hoặc tiêu hủy' 
    },
    id_hd_nd: { 
      type: DataTypes.INTEGER, 
      allowNull: true,
      comment: 'ID hóa đơn nội địa (nếu bán nội địa)' 
    },
    id_bb_th: { 
      type: DataTypes.INTEGER, 
      allowNull: true,
      comment: 'ID biên bản tiêu hủy (nếu tiêu hủy)' 
    },
    ghi_chu: { 
      type: DataTypes.TEXT, 
      allowNull: true,
      comment: 'Ghi chú' 
    },
    trang_thai: { 
      type: DataTypes.ENUM('ChoXuLy', 'DaXuat', 'DaHuy'), 
      allowNull: false,
      defaultValue: 'ChoXuLy' 
    },
    nguoi_tao: { 
      type: DataTypes.STRING(100), 
      allowNull: true 
    },
    ngay_tao: { 
      type: DataTypes.DATE, 
      allowNull: false,
      defaultValue: DataTypes.NOW 
    }
  }, {
    sequelize,
    modelName: 'BanThanhPham',
    tableName: 'BanThanhPham',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['id_dn', 'so_phieu']
      }
    ]
  });

  return BanThanhPham;
};
