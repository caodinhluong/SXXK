'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ToKhaiNhap extends Model {
    static associate(models) {
      ToKhaiNhap.belongsTo(models.LoHang, { foreignKey: 'id_lh', as: 'loHang' });
      ToKhaiNhap.belongsTo(models.TienTe, { foreignKey: 'id_tt', as: 'tienTe' });
      ToKhaiNhap.hasMany(models.ToKhaiNhapChiTiet, { foreignKey: 'id_tkn', as: 'chiTiets' });
      ToKhaiNhap.belongsTo(models.ToKhaiNhap, { 
        foreignKey: 'id_tk_lien_quan', 
        as: 'toKhaiLienQuan',
        targetKey: 'id_tkn'
      });
    }
  }
  ToKhaiNhap.init({
    id_tkn: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_lh: { type: DataTypes.INTEGER, allowNull: false },
    so_tk: { type: DataTypes.STRING(50), allowNull: false },
    ngay_tk: { type: DataTypes.DATEONLY, allowNull: false },
    ma_to_khai: { 
      type: DataTypes.ENUM('G11', 'G12', 'G13', 'G14', 'G51'), 
      allowNull: true,
      comment: 'G11: Nhập khẩu thông thường, G12: Nhập khẩu ưu đãi, G13: Tạm nhập tái xuất, G14: Chuyển khẩu, G51: Tái nhập'
    },
    loai_hang: { 
      type: DataTypes.ENUM('NguyenLieu', 'SanPham', 'BanThanhPham'), 
      allowNull: true,
      comment: 'Loại hàng trong tờ khai' 
    },
    thanh_phan: {
      type: DataTypes.ENUM('SanPham', 'NguyenLieu'),
      allowNull: true,
      comment: 'Thành phần bên trong tờ khai (áp dụng cho G51 tái nhập)'
    },
    id_tk_lien_quan: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID tờ khai liên quan (cho G13, G14)'
    },
    ngay_thong_quan: { type: DataTypes.DATEONLY, allowNull: true },
    cang_nhap: { type: DataTypes.STRING(100), allowNull: true },
    tong_tri_gia: { type: DataTypes.DECIMAL(18,2), allowNull: true },
    thue_nhap_khau: { type: DataTypes.DECIMAL(18,2), allowNull: true },
    thue_gtgt: { type: DataTypes.DECIMAL(18,2), allowNull: true },
    id_tt: { type: DataTypes.INTEGER, allowNull: true },
    file_to_khai: { type: DataTypes.STRING(255), allowNull: true },
    file_excel_import: { type: DataTypes.STRING(255), allowNull: true },
    ghi_chu: { type: DataTypes.TEXT, allowNull: true },
    nguoi_xu_ly: { type: DataTypes.STRING(100), allowNull: true },
    ngay_xu_ly: { type: DataTypes.DATEONLY, allowNull: true },
    trang_thai: { 
      type: DataTypes.ENUM('ChoXuLy', 'ChoDuyet', 'ThongQuan', 'KiemTraHoSo', 'KiemTraThucTe', 'TaiXuat', 'TichThu'), 
      allowNull: false, 
      defaultValue: 'ChoXuLy' 
    }
  }, {
    sequelize,
    modelName: 'ToKhaiNhap',
    tableName: 'ToKhaiNhap',
    timestamps: false
  });
  return ToKhaiNhap;
};
