'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DoiSoatDinhMuc extends Model {
    /**
     * Define associations for DoiSoatDinhMuc model
     * @param {Object} models - All models in the application
     */
    static associate(models) {
      // DoiSoatDinhMuc belongs to DoanhNghiep
      DoiSoatDinhMuc.belongsTo(models.DoanhNghiep, { 
        foreignKey: 'id_dn', 
        as: 'doanhNghiep' 
      });
      
      // DoiSoatDinhMuc belongs to SanPham
      DoiSoatDinhMuc.belongsTo(models.SanPham, { 
        foreignKey: 'id_sp', 
        as: 'sanPham' 
      });
      
      // DoiSoatDinhMuc has many DoiSoatDinhMucChiTiet
      DoiSoatDinhMuc.hasMany(models.DoiSoatDinhMucChiTiet, { 
        foreignKey: 'id_ds', 
        as: 'chiTiets' 
      });
    }
  }

  DoiSoatDinhMuc.init({
    id_ds: { 
      type: DataTypes.INTEGER, 
      primaryKey: true, 
      autoIncrement: true,
      comment: 'Primary key - Doi soat dinh muc ID'
    },
    id_dn: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      comment: 'Foreign key to DoanhNghiep'
    },
    id_sp: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
      comment: 'Foreign key to SanPham'
    },
    tu_ngay: { 
      type: DataTypes.DATEONLY, 
      allowNull: false,
      comment: 'Start date of reconciliation period'
    },
    den_ngay: { 
      type: DataTypes.DATEONLY, 
      allowNull: false,
      comment: 'End date of reconciliation period'
    },
    sl_sp_san_xuat: { 
      type: DataTypes.DECIMAL(18,3), 
      allowNull: false,
      defaultValue: 0,
      comment: 'Quantity of products manufactured during period'
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
    ket_luan: { 
      type: DataTypes.ENUM('DatDinhMuc', 'VuotDinhMuc', 'DuoiDinhMuc', 'CanXacMinh'), 
      allowNull: false,
      defaultValue: 'CanXacMinh',
      comment: 'Conclusion: DatDinhMuc (Met quota), VuotDinhMuc (Exceeded quota), DuoiDinhMuc (Below quota), CanXacMinh (Need verification)'
    },
    ty_le_sai_lech: { 
      type: DataTypes.DECIMAL(5,2), 
      allowNull: true,
      defaultValue: 0,
      comment: 'Variance percentage'
    },
    ghi_chu: { 
      type: DataTypes.TEXT, 
      allowNull: true,
      comment: 'Additional notes'
    },
    file_bao_cao: { 
      type: DataTypes.STRING(255), 
      allowNull: true,
      comment: 'Path to reconciliation report file'
    }
  }, {
    sequelize,
    modelName: 'DoiSoatDinhMuc',
    tableName: 'DoiSoatDinhMuc',
    timestamps: false
  });

  return DoiSoatDinhMuc;
};
