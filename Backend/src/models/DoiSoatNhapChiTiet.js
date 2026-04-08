'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DoiSoatNhapChiTiet extends Model {
    /**
     * Define associations for DoiSoatNhapChiTiet model
     * @param {Object} models - All models in the application
     */
    static associate(models) {
      // DoiSoatNhapChiTiet belongs to DoiSoatNhap
      DoiSoatNhapChiTiet.belongsTo(models.DoiSoatNhap, { 
        foreignKey: 'id_ds', 
        as: 'doiSoatNhap' 
      });
      
      // DoiSoatNhapChiTiet belongs to NguyenPhuLieu
      DoiSoatNhapChiTiet.belongsTo(models.NguyenPhuLieu, { 
        foreignKey: 'id_npl', 
        as: 'nguyenPhuLieu' 
      });
    }
  }

  DoiSoatNhapChiTiet.init({
    id_ct: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true,
      comment: 'Primary key - Chi tiet ID'
    },
    id_ds: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      comment: 'Foreign key to DoiSoatNhap'
    },
    id_npl: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      comment: 'Foreign key to NguyenPhuLieu'
    },
    sl_to_khai: { 
      type: DataTypes.DECIMAL(18,3), 
      allowNull: false,
      defaultValue: 0,
      comment: 'Quantity declared in customs declaration'
    },
    sl_nhap_kho: { 
      type: DataTypes.DECIMAL(18,3), 
      allowNull: false,
      defaultValue: 0,
      comment: 'Quantity actually received in warehouse'
    },
    chenh_lech: { 
      type: DataTypes.DECIMAL(18,3), 
      allowNull: false,
      defaultValue: 0,
      comment: 'Discrepancy (sl_nhap_kho - sl_to_khai)'
    },
    ly_do: { 
      type: DataTypes.TEXT, 
      allowNull: true,
      comment: 'Reason for discrepancy'
    }
  }, {
    sequelize,
    modelName: 'DoiSoatNhapChiTiet',
    tableName: 'DoiSoatNhapChiTiet',
    timestamps: false
  });

  return DoiSoatNhapChiTiet;
};
