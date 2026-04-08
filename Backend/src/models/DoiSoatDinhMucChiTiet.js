'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DoiSoatDinhMucChiTiet extends Model {
    /**
     * Define associations for DoiSoatDinhMucChiTiet model
     * @param {Object} models - All models in the application
     */
    static associate(models) {
      // DoiSoatDinhMucChiTiet belongs to DoiSoatDinhMuc
      DoiSoatDinhMucChiTiet.belongsTo(models.DoiSoatDinhMuc, { 
        foreignKey: 'id_ds', 
        as: 'doiSoatDinhMuc' 
      });
      
      // DoiSoatDinhMucChiTiet belongs to NguyenPhuLieu
      DoiSoatDinhMucChiTiet.belongsTo(models.NguyenPhuLieu, { 
        foreignKey: 'id_npl', 
        as: 'nguyenPhuLieu' 
      });
    }
  }

  DoiSoatDinhMucChiTiet.init({
    id_ct: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true,
      comment: 'Primary key - Chi tiet ID'
    },
    id_ds: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      comment: 'Foreign key to DoiSoatDinhMuc'
    },
    id_npl: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      comment: 'Foreign key to NguyenPhuLieu'
    },
    sl_dinh_muc: { 
      type: DataTypes.DECIMAL(18,3), 
      allowNull: false,
      defaultValue: 0,
      comment: 'Quota quantity (from DinhMucSanPham)'
    },
    sl_thuc_te: { 
      type: DataTypes.DECIMAL(18,3), 
      allowNull: false,
      defaultValue: 0,
      comment: 'Actual quantity used'
    },
    chenh_lech: { 
      type: DataTypes.DECIMAL(18,3), 
      allowNull: false,
      defaultValue: 0,
      comment: 'Discrepancy (sl_thuc_te - sl_dinh_muc)'
    },
    ty_le_chenh_lech: { 
      type: DataTypes.DECIMAL(5,2), 
      allowNull: true,
      defaultValue: 0,
      comment: 'Discrepancy percentage'
    }
  }, {
    sequelize,
    modelName: 'DoiSoatDinhMucChiTiet',
    tableName: 'DoiSoatDinhMucChiTiet',
    timestamps: false
  });

  return DoiSoatDinhMucChiTiet;
};
