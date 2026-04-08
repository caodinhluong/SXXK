'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DoiSoatXuat extends Model {
    /**
     * Define associations for DoiSoatXuat model
     * @param {Object} models - All models in the application
     */
    static associate(models) {
      // DoiSoatXuat belongs to ToKhaiXuat
      DoiSoatXuat.belongsTo(models.ToKhaiXuat, { 
        foreignKey: 'id_tkx', 
        as: 'toKhaiXuat' 
      });
      
      // DoiSoatXuat belongs to XuatKhoSP
      DoiSoatXuat.belongsTo(models.XuatKhoSP, { 
        foreignKey: 'id_xuat_kho', 
        as: 'xuatKho' 
      });
      
      // DoiSoatXuat has many DoiSoatXuatChiTiet
      DoiSoatXuat.hasMany(models.DoiSoatXuatChiTiet, { 
        foreignKey: 'id_ds', 
        as: 'chiTiets' 
      });
    }
  }

  DoiSoatXuat.init({
    id_ds: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true,
      comment: 'Primary key - Doi soat xuat ID'
    },
    id_tkx: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      comment: 'Foreign key to ToKhaiXuat'
    },
    id_xuat_kho: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      comment: 'Foreign key to XuatKhoSP'
    },
    ma_doi_soat: { 
      type: DataTypes.STRING(10), 
      allowNull: false,
      defaultValue: '155',
      comment: 'Reconciliation code (default 155 for export reconciliation)'
    },
    ngay_doi_soat: { 
      type: DataTypes.DATEONLY, 
      allowNull: false,
      comment: 'Reconciliation date'
    },
    nguoi_doi_soat: { 
      type: DataTypes.STRING(100), 
      allowNull: false,
      comment: 'Person who performed reconciliation'
    },
    ket_qua: { 
      type: DataTypes.ENUM('KhopDu', 'ChenhLech', 'CanXacMinh'), 
      allowNull: false,
      defaultValue: 'CanXacMinh',
      comment: 'Reconciliation result: KhopDu (Match), ChenhLech (Discrepancy), CanXacMinh (Need verification)'
    },
    chenh_lech_sl: { 
      type: DataTypes.DECIMAL(18,3), 
      allowNull: true,
      defaultValue: 0,
      comment: 'Quantity discrepancy'
    },
    chenh_lech_tien: { 
      type: DataTypes.DECIMAL(18,2), 
      allowNull: true,
      defaultValue: 0,
      comment: 'Value discrepancy'
    },
    ly_do_chenh_lech: { 
      type: DataTypes.TEXT, 
      allowNull: true,
      comment: 'Reason for discrepancy'
    },
    trang_thai: { 
      type: DataTypes.ENUM('ChuaXuLy', 'DangXuLy', 'HoanThanh', 'CanBoSung'), 
      allowNull: false,
      defaultValue: 'ChuaXuLy',
      comment: 'Processing status'
    },
    file_bao_cao: { 
      type: DataTypes.STRING(255), 
      allowNull: true,
      comment: 'Path to reconciliation report file'
    },
    ghi_chu: { 
      type: DataTypes.TEXT, 
      allowNull: true,
      comment: 'Additional notes'
    }
  }, {
    sequelize,
    modelName: 'DoiSoatXuat',
    tableName: 'DoiSoatXuat',
    timestamps: false
  });

  return DoiSoatXuat;
};
