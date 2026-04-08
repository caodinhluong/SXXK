'use strict';
const db = require('../models');
const Kho = db.Kho;
const DoanhNghiep = db.DoanhNghiep;
const TonKhoNPL = db.TonKhoNPL;
const TonKhoSP = db.TonKhoSP;
const NguyenPhuLieu = db.NguyenPhuLieu;
const SanPham = db.SanPham;
const DonViTinhHQ = db.DonViTinhHQ;

const createKho = async ({ id_dn, ten_kho, dia_chi, ma_kho, loai_kho }) => {
  if (!id_dn || !ten_kho) throw new Error("Thiếu dữ liệu bắt buộc");
  return await Kho.create({ id_dn, ten_kho, dia_chi, ma_kho, loai_kho });
};

const getAllKho = async (id_dn, filters = {}) => {
  const where = { id_dn };
  
  // Add loai_kho filter if provided
  if (filters.loai_kho) {
    where.loai_kho = filters.loai_kho;
  }
  
  return await Kho.findAll({  
    where, 
    include: [{ model: DoanhNghiep, as: 'doanhNghiep' }] 
  });
};

const getKhoById = async (id_kho) => {
  return await Kho.findByPk(id_kho, { include: [{ model: DoanhNghiep, as: 'doanhNghiep' }] });
};

const updateKho = async (id_kho, data) => {
  const kho = await Kho.findByPk(id_kho);
  if (!kho) throw new Error("Không tìm thấy kho");
  await kho.update(data);
  return kho;
};

const deleteKho = async (id_kho) => {
  const kho = await Kho.findByPk(id_kho);
  if (!kho) throw new Error("Không tìm thấy kho");
  await kho.destroy();
};

// Lấy tồn kho NPL theo kho
const getTonKhoNPLByKho = async (id_kho, id_dn) => {
  // Convert sang số để đảm bảo query đúng
  const khoId = parseInt(id_kho, 10);
  const dnId = parseInt(id_dn, 10);
  
  // Kiểm tra kho thuộc doanh nghiệp
  const kho = await Kho.findOne({ where: { id_kho: khoId, id_dn: dnId } });
  if (!kho) throw new Error("Kho không tồn tại hoặc bạn không có quyền truy cập");
  
  const tonKhoList = await TonKhoNPL.findAll({
    where: { id_kho: khoId },
    include: [{
      model: NguyenPhuLieu,
      as: 'nguyenPhuLieu',
      include: [
        {
          model: DonViTinhHQ,
          as: 'donViTinhHQ'
        },
        {
          model: db.QuyDoiNPL,
          as: 'quyDoiNPLs',
          required: false
        }
      ]
    }]
  });
  
  // Map lại data và filter quy đổi theo doanh nghiệp
  return tonKhoList.map(item => {
    // Tìm quy đổi của doanh nghiệp hiện tại
    const quyDoiDN = item.nguyenPhuLieu?.quyDoiNPLs?.find(qd => qd.id_dn === dnId);
    
    return {
      id: item.id,
      id_kho: item.id_kho,
      id_npl: item.id_npl,
      so_luong_ton: item.so_luong_ton,
      nguyenPhuLieu: item.nguyenPhuLieu ? {
        id_npl: item.nguyenPhuLieu.id_npl,
        ten_npl: item.nguyenPhuLieu.ten_npl,
        donViTinhHQ: item.nguyenPhuLieu.donViTinhHQ ? {
          ten_dvt: item.nguyenPhuLieu.donViTinhHQ.ten_dvt
        } : null,
        quyDoiDN: quyDoiDN ? {
          ten_dvt: quyDoiDN.ten_dvt_dn,
          he_so: quyDoiDN.he_so
        } : null
      } : null
    };
  });
};

// Lấy tồn kho SP theo kho
const getTonKhoSPByKho = async (id_kho, id_dn) => {
  const khoId = parseInt(id_kho, 10);
  const dnId = parseInt(id_dn, 10);
  
  // Kiểm tra kho tồn tại
  const kho = await Kho.findByPk(khoId);
  if (!kho) throw new Error("Kho không tồn tại");
  
  const tonKhoList = await TonKhoSP.findAll({
    where: { id_kho: khoId },
    include: [{
      model: SanPham,
      as: 'sanPham',
      include: [
        {
          model: DonViTinhHQ,
          as: 'donViTinhHQ'
        },
        {
          model: db.QuyDoiDonViSP,
          as: 'quyDoiDonViSPs',
          required: false
        }
      ]
    }]
  });
  
  // Map lại data và filter quy đổi theo doanh nghiệp
  return tonKhoList.map(item => {
    // Tìm quy đổi của doanh nghiệp hiện tại
    const quyDoiDN = item.sanPham?.quyDoiDonViSPs?.find(qd => qd.id_dn === dnId);
    
    return {
      id: item.id,
      id_kho: item.id_kho,
      id_sp: item.id_sp,
      so_luong_ton: item.so_luong_ton,
      sanPham: item.sanPham ? {
        id_sp: item.sanPham.id_sp,
        ten_sp: item.sanPham.ten_sp,
        donViTinhHQ: item.sanPham.donViTinhHQ ? {
          ten_dvt: item.sanPham.donViTinhHQ.ten_dvt
        } : null,
        quyDoiDN: quyDoiDN ? {
          ten_dvt: quyDoiDN.ten_dvt_sp,
          he_so: quyDoiDN.he_so
        } : null
      } : null
    };
  });
};

module.exports = { createKho, getAllKho, getKhoById, updateKho, deleteKho, getTonKhoNPLByKho, getTonKhoSPByKho };
