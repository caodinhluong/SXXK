'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CanhBaoHeThong extends Model {
    static associate(models) {
      CanhBaoHeThong.belongsTo(models.DoanhNghiep, { 
        foreignKey: 'id_dn', 
        as: 'doanhNghiep' 
      });
    }
  }

  CanhBaoHeThong.init({
    id_cb: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    id_dn: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      comment: 'ID doanh nghiệp liên quan'
    },
    loai_canh_bao: { 
      type: DataTypes.ENUM(
        'TonAm',
        'VuotDinhMuc',
        'LechSoKho',
        'SapHetHan',
        'QuaHan',
        'ThieuHoSo',
        'Khac'
      ), 
      allowNull: false,
      comment: 'Loại cảnh báo hệ thống'
    },
    tieu_de: { 
      type: DataTypes.STRING(255), 
      allowNull: false,
      comment: 'Tiêu đề cảnh báo'
    },
    noi_dung: { 
      type: DataTypes.TEXT, 
      allowNull: false,
      comment: 'Nội dung chi tiết cảnh báo'
    },
    muc_do: { 
      type: DataTypes.ENUM('Thap', 'TrungBinh', 'Cao', 'KhanCap'), 
      allowNull: false,
      defaultValue: 'TrungBinh',
      comment: 'Mức độ ưu tiên của cảnh báo'
    },
    trang_thai: { 
      type: DataTypes.ENUM('ChuaXem', 'DaXem', 'DangXuLy', 'DaXuLy', 'BỏQua'), 
      allowNull: false,
      defaultValue: 'ChuaXem',
      comment: 'Trạng thái xử lý cảnh báo'
    },
    bang_lien_quan: { 
      type: DataTypes.STRING(100), 
      allowNull: true,
      comment: 'Tên bảng liên quan đến cảnh báo'
    },
    id_ban_ghi: { 
      type: DataTypes.INTEGER, 
      allowNull: true,
      comment: 'ID bản ghi liên quan'
    },
    nguoi_xu_ly: { 
      type: DataTypes.STRING(100), 
      allowNull: true,
      comment: 'Người xử lý cảnh báo'
    },
    ngay_xu_ly: { 
      type: DataTypes.DATE, 
      allowNull: true,
      comment: 'Ngày xử lý cảnh báo'
    },
    ghi_chu: { 
      type: DataTypes.TEXT, 
      allowNull: true,
      comment: 'Ghi chú thêm'
    },
    ngay_tao: { 
      type: DataTypes.DATE, 
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Ngày tạo cảnh báo'
    }
  }, {
    sequelize,
    modelName: 'CanhBaoHeThong',
    tableName: 'CanhBaoHeThong',
    timestamps: false
  });

  return CanhBaoHeThong;
};
