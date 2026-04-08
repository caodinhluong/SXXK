'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class LichSuTonKhoSP extends Model {
    /**
     * Define associations for LichSuTonKhoSP model
     * Represents historical inventory records for products (SP)
     */
    static associate(models) {
      // Belongs to Kho (warehouse)
      LichSuTonKhoSP.belongsTo(models.Kho, { 
        foreignKey: 'id_kho', 
        as: 'kho' 
      });
      
      // Belongs to SanPham (product)
      LichSuTonKhoSP.belongsTo(models.SanPham, { 
        foreignKey: 'id_sp', 
        as: 'sanPham' 
      });
      
      // Belongs to DonViTinhHQ (unit of measure)
      LichSuTonKhoSP.belongsTo(models.DonViTinhHQ, { 
        foreignKey: 'don_vi_tinh', 
        as: 'donViTinh',
        targetKey: 'id_dvt_hq'
      });
    }
  }

  LichSuTonKhoSP.init({
    id: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true,
      comment: 'Primary key for inventory history record'
    },
    id_kho: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      comment: 'Foreign key to Kho table'
    },
    id_sp: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      comment: 'Foreign key to SanPham table'
    },
    tu_ngay: { 
      type: DataTypes.DATEONLY, 
      allowNull: false,
      comment: 'Start date of the inventory period'
    },
    den_ngay: { 
      type: DataTypes.DATEONLY, 
      allowNull: false,
      comment: 'End date of the inventory period'
    },
    ton_dau_ky: { 
      type: DataTypes.DECIMAL(15, 3), 
      allowNull: false,
      defaultValue: 0,
      comment: 'Opening balance quantity'
    },
    nhap_trong_ky: { 
      type: DataTypes.DECIMAL(15, 3), 
      allowNull: false,
      defaultValue: 0,
      comment: 'Total quantity received during period (from production)'
    },
    xuat_trong_ky: { 
      type: DataTypes.DECIMAL(15, 3), 
      allowNull: false,
      defaultValue: 0,
      comment: 'Total quantity issued during period (exports, domestic sales)'
    },
    ton_cuoi_ky: { 
      type: DataTypes.DECIMAL(15, 3), 
      allowNull: false,
      defaultValue: 0,
      comment: 'Closing balance quantity (ton_dau_ky + nhap_trong_ky - xuat_trong_ky)'
    },
    don_vi_tinh: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      comment: 'Foreign key to DonViTinhHQ table'
    },
    ngay_khoa_so: { 
      type: DataTypes.DATE, 
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Date when the inventory period was closed/locked'
    }
  }, {
    sequelize,
    modelName: 'LichSuTonKhoSP',
    tableName: 'LichSuTonKhoSP',
    timestamps: false,
    indexes: [
      {
        name: 'idx_lichsu_kho_sp',
        fields: ['id_kho', 'id_sp']
      },
      {
        name: 'idx_lichsu_sp_period',
        fields: ['tu_ngay', 'den_ngay']
      }
    ]
  });

  return LichSuTonKhoSP;
};
