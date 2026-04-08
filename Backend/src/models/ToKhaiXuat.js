'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ToKhaiXuat extends Model {
    static associate(models) {
      ToKhaiXuat.belongsTo(models.LoHang, { foreignKey: 'id_lh', as: 'loHang' });
      ToKhaiXuat.belongsTo(models.TienTe, { foreignKey: 'id_tt', as: 'tienTe' });
      ToKhaiXuat.hasMany(models.ToKhaiXuatChiTiet, { foreignKey: 'id_tkx', as: 'chiTiets' });
      ToKhaiXuat.belongsTo(models.ToKhaiXuat, { 
        foreignKey: 'id_tk_lien_quan', 
        as: 'toKhaiLienQuan',
        targetKey: 'id_tkx'
      });
    }
  }
  ToKhaiXuat.init({
    id_tkx: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_lh: { type: DataTypes.INTEGER, allowNull: false },
    so_tk: { type: DataTypes.STRING(50), allowNull: false },
    ngay_tk: { type: DataTypes.DATEONLY, allowNull: false },
    ma_to_khai: { 
      type: DataTypes.ENUM('G21', 'G22', 'G23', 'G24', 'G61'), 
      allowNull: true,
      comment: 'G21: Xuất khẩu thông thường, G22: Xuất khẩu ưu đãi, G23: Tạm xuất tái nhập, G24: Chuyển khẩu, G61: Tái xuất'
    },
    loai_hang: { 
      type: DataTypes.ENUM('NguyenLieu', 'SanPham', 'BanThanhPham'), 
      allowNull: true,
      comment: 'Loại hàng trong tờ khai' 
    },
    loai_xuat: {
      type: DataTypes.ENUM('SanPham', 'NguyenLieu', 'BanThanhPham'),
      allowNull: true,
      comment: 'Xác định loại xuất: sản phẩm, nguyên liệu, hoặc bán thành phẩm'
    },
    thanh_phan: {
      type: DataTypes.ENUM('SanPham', 'NguyenLieu'),
      allowNull: true,
      comment: 'Thành phần bên trong tờ khai (áp dụng cho G61 tái xuất)'
    },
    id_tk_lien_quan: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID tờ khai liên quan (cho G23, G24)'
    },
    ngay_thong_quan: { type: DataTypes.DATEONLY, allowNull: true },
    cang_xuat: { type: DataTypes.STRING(100), allowNull: true },
    tong_tri_gia: { type: DataTypes.DECIMAL(18,2), allowNull: true },
    id_tt: { type: DataTypes.INTEGER, allowNull: true },
    file_to_khai: { type: DataTypes.STRING(255), allowNull: true },
    file_excel_import: { type: DataTypes.STRING(255), allowNull: true },
    ghi_chu: { type: DataTypes.TEXT, allowNull: true },
    nguoi_xu_ly: { type: DataTypes.STRING(100), allowNull: true },
    ngay_xu_ly: { type: DataTypes.DATEONLY, allowNull: true },
    trang_thai: { 
      type: DataTypes.ENUM('ChoXuLy', 'ChoDuyet', 'ThongQuan', 'KiemTraHoSo', 'KiemTraThucTe', 'TichThu'), 
      allowNull: false, 
      defaultValue: 'ChoXuLy' 
    }
  }, {
    sequelize,
    modelName: 'ToKhaiXuat',
    tableName: 'ToKhaiXuat',
    timestamps: false
  });
  return ToKhaiXuat;
};
