'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DoiSoatNhap extends Model {
    /**
     * Define associations for DoiSoatNhap model
     * @param {Object} models - All models in the application
     */
    static associate(models) {
      // DoiSoatNhap belongs to ToKhaiNhap
      DoiSoatNhap.belongsTo(models.ToKhaiNhap, { 
        foreignKey: 'id_tkn', 
        as: 'toKhaiNhap' 
      });
      
      // DoiSoatNhap belongs to NhapKhoNPL
      DoiSoatNhap.belongsTo(models.NhapKhoNPL, { 
        foreignKey: 'id_nhap_kho', 
        as: 'nhapKho' 
      });
      
      // DoiSoatNhap has many DoiSoatNhapChiTiet
      DoiSoatNhap.hasMany(models.DoiSoatNhapChiTiet, { 
        foreignKey: 'id_ds', 
        as: 'chiTiets' 
      });
    }
  }

  DoiSoatNhap.init({
    id_ds: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true,
      comment: 'Primary key - Doi soat nhap ID'
    },
    id_tkn: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      comment: 'Foreign key to ToKhaiNhap'
    },
    id_nhap_kho: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      comment: 'Foreign key to NhapKhoNPL'
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
    modelName: 'DoiSoatNhap',
    tableName: 'DoiSoatNhap',
    timestamps: false
  });

  return DoiSoatNhap;
};
