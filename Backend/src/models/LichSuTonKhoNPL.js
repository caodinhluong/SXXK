'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class LichSuTonKhoNPL extends Model {
    /**
     * Define associations for LichSuTonKhoNPL model
     * Represents historical inventory records for raw materials (NPL)
     */
    static associate(models) {
      // Belongs to Kho (warehouse)
      LichSuTonKhoNPL.belongsTo(models.Kho, { 
        foreignKey: 'id_kho', 
        as: 'kho' 
      });
      
      // Belongs to NguyenPhuLieu (raw material)
      LichSuTonKhoNPL.belongsTo(models.NguyenPhuLieu, { 
        foreignKey: 'id_npl', 
        as: 'nguyenPhuLieu' 
      });
      
      // Belongs to DonViTinhHQ (unit of measure)
      LichSuTonKhoNPL.belongsTo(models.DonViTinhHQ, { 
        foreignKey: 'don_vi_tinh', 
        as: 'donViTinh',
        targetKey: 'id_dvt_hq'
      });
    }
  }

  LichSuTonKhoNPL.init({
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
    id_npl: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      comment: 'Foreign key to NguyenPhuLieu table'
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
      comment: 'Total quantity received during period'
    },
    xuat_trong_ky: { 
      type: DataTypes.DECIMAL(15, 3), 
      allowNull: false,
      defaultValue: 0,
      comment: 'Total quantity issued during period'
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
    modelName: 'LichSuTonKhoNPL',
    tableName: 'LichSuTonKhoNPL',
    timestamps: false,
    indexes: [
      {
        name: 'idx_lichsu_kho_npl',
        fields: ['id_kho', 'id_npl']
      },
      {
        name: 'idx_lichsu_period',
        fields: ['tu_ngay', 'den_ngay']
      }
    ]
  });

  return LichSuTonKhoNPL;
};
