'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class LogHeThong extends Model {
    static associate(models) {
      // LogHeThong is an audit trail table
      // Can optionally associate with DoanhNghiep if needed
    }
  }

  LogHeThong.init({
    id_log: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true 
    },
    loai_nguoi_dung: { 
      type: DataTypes.ENUM('Admin', 'DoanhNghiep', 'HaiQuan'), 
      allowNull: false,
      comment: 'Loại người dùng thực hiện hành động'
    },
    id_nguoi_dung: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      comment: 'ID người dùng (tùy theo loại)'
    },
    hanh_dong: { 
      type: DataTypes.STRING(100), 
      allowNull: false,
      comment: 'Hành động thực hiện (CREATE, UPDATE, DELETE, LOGIN, etc.)'
    },
    bang_lien_quan: { 
      type: DataTypes.STRING(100), 
      allowNull: true,
      comment: 'Tên bảng bị tác động'
    },
    id_ban_ghi: { 
      type: DataTypes.INTEGER, 
      allowNull: true,
      comment: 'ID bản ghi bị tác động'
    },
    du_lieu_cu: { 
      type: DataTypes.JSON, 
      allowNull: true,
      comment: 'Dữ liệu trước khi thay đổi (JSON)'
    },
    du_lieu_moi: { 
      type: DataTypes.JSON, 
      allowNull: true,
      comment: 'Dữ liệu sau khi thay đổi (JSON)'
    },
    ip_address: { 
      type: DataTypes.STRING(45), 
      allowNull: true,
      comment: 'Địa chỉ IP của người dùng'
    },
    user_agent: { 
      type: DataTypes.TEXT, 
      allowNull: true,
      comment: 'Thông tin trình duyệt/thiết bị'
    },
    ngay_tao: { 
      type: DataTypes.DATE, 
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Thời điểm thực hiện hành động'
    },
    ghi_chu: { 
      type: DataTypes.TEXT, 
      allowNull: true,
      comment: 'Ghi chú thêm'
    }
  }, {
    sequelize,
    modelName: 'LogHeThong',
    tableName: 'LogHeThong',
    timestamps: false
  });

  return LogHeThong;
};
