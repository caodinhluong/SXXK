'use strict';

const db = require('../models');
const { Op } = require('sequelize');

const DonViTinhHQ = db.DonViTinhHQ;
const QuyDoiDonViChiTiet = db.QuyDoiDonViChiTiet;
const QuyDoiNPL = db.QuyDoiNPL;
const QuyDoiDonViSP = db.QuyDoiDonViSP;
const QuyDoiDonViDN = db.QuyDoiDonViDN;

const layTyLeQuyDoi = async (id_dn, id_dvt_nguon, id_dvt_dich) => {
  const quyDoiChitiet = await QuyDoiDonViChiTiet.findOne({
    where: {
      id_dn,
      id_dvt_nguon,
      id_dvt_dich,
      trang_thai: 'HoatDong',
      ngay_hieu_luc: { [Op.lte]: new Date() },
      [Op.or]: [
        { ngay_het_han: null },
        { ngay_het_han: { [Op.gte]: new Date() } }
      ]
    }
  });

  if (quyDoiChitiet) {
    return {
      nguon: id_dvt_nguon,
      dich: id_dvt_dich,
      ty_le: parseFloat(quyDoiChitiet.ty_le),
      loai: 'ChiTiet'
    };
  }

  const dvtNguon = await DonViTinhHQ.findByPk(id_dvt_nguon);
  if (dvtNguon && dvtNguon.id_dvt_dich && dvtNguon.id_dvt_dich === id_dvt_dich) {
    return {
      nguon: id_dvt_nguon,
      dich: id_dvt_dich,
      ty_le: parseFloat(dvtNguon.ty_le_quy_doi || 1),
      loai: 'DonViTinhHQ'
    };
  }

  return null;
};

const quyDoiSoLuong = async (id_dn, soLuong, id_dvt_nguon, id_dvt_dich) => {
  if (!id_dvt_nguon || !id_dvt_dich) {
    return soLuong;
  }

  if (id_dvt_nguon === id_dvt_dich) {
    return soLuong;
  }

  const tyLe = await layTyLeQuyDoi(id_dn, id_dvt_nguon, id_dvt_dich);

  if (!tyLe) {
    throw new Error(`Không tìm thấy tỷ lệ quy đổi từ đơn vị ${id_dvt_nguon} sang ${id_dvt_dich}`);
  }

  return soLuong * tyLe.ty_le;
};

const quyDoiNhapKho = async ({ id_dn, id_kho, items, id_dvt_nguon_mac_dinh }) => {
  const results = [];
  const errors = [];

  for (const item of items) {
    const idNpl = item.id_npl || item.idNPL;
    const idSp = item.id_sp || item.idSP;
    const soLuongNhap = parseFloat(item.so_luong || item.soLuong || 0);
    const idDvtNguon = item.id_dvt || item.idDvt || id_dvt_nguon_mac_dinh;
    const idDvtDich = item.id_dvt_dich || item.idDvtDich;

    if (!idDvtDich) {
      if (idNpl) {
        const npl = await db.NguyenPhuLieu.findByPk(idNpl);
        if (npl) {
          item.id_dvt_dich = npl.id_dvt_hq;
        }
      } else if (idSp) {
        const sp = await db.SanPham.findByPk(idSp);
        if (sp) {
          item.id_dvt_dich = sp.id_dvt_hq;
        }
      }
    }

    try {
      if (idDvtNguon && item.id_dvt_dich && idDvtNguon !== item.id_dvt_dich) {
        const soLuongQuyDoi = await quyDoiSoLuong(id_dn, soLuongNhap, idDvtNguon, item.id_dvt_dich);
        results.push({
          id_npl: idNpl,
          id_sp: idSp,
          so_luong_nhap: soLuongNhap,
          so_luong_quy_doi: soLuongQuyDoi,
          id_dvt_nguon: idDvtNguon,
          id_dvt_dich: item.id_dvt_dich,
          da_quy_doi: true
        });
      } else {
        results.push({
          id_npl: idNpl,
          id_sp: idSp,
          so_luong_nhap: soLuongNhap,
          so_luong_quy_doi: soLuongNhap,
          id_dvt_nguon: idDvtNguon,
          id_dvt_dich: item.id_dvt_dich,
          da_quy_doi: false
        });
      }
    } catch (error) {
      errors.push({
        id_npl: idNpl,
        id_sp: idSp,
        error: error.message
      });
      results.push({
        id_npl: idNpl,
        id_sp: idSp,
        so_luong_nhap: soLuongNhap,
        so_luong_quy_doi: soLuongNhap,
        id_dvt_nguon: idDvtNguon,
        id_dvt_dich: item.id_dvt_dich,
        da_quy_doi: false,
        error: error.message
      });
    }
  }

  return {
    results,
    errors,
    tong_so_luong_nhap: results.reduce((sum, r) => sum + r.so_luong_nhap, 0),
    tong_so_luong_quy_doi: results.reduce((sum, r) => sum + r.so_luong_quy_doi, 0)
  };
};

const kiemTraSaiDinhTinh = async (id_dn, id_kho, id_npl, id_sp, soLuongThucTe, idDvtThucTe) => {
  const result = {
    isValid: true,
    warnings: [],
    errors: []
  };

  let dvtChuan = null;
  let soLuongChuan = null;

  if (id_npl) {
    const npl = await db.NguyenPhuLieu.findByPk(id_npl, {
      include: [{ model: DonViTinhHQ, as: 'donViTinhHQ' }]
    });
    if (npl) {
      dvtChuan = npl.id_dvt_hq;
    }
  } else if (id_sp) {
    const sp = await db.SanPham.findByPk(id_sp, {
      include: [{ model: DonViTinhHQ, as: 'donViTinhHQ' }]
    });
    if (sp) {
      dvtChuan = sp.id_dvt_hq;
    }
  }

  if (!dvtChuan) {
    result.errors.push('Không tìm thấy đơn vị tính chuẩn');
    result.isValid = false;
    return result;
  }

  if (idDvtThucTe && idDvtThucTe !== dvtChuan) {
    try {
      soLuongChuan = await quyDoiSoLuong(id_dn, soLuongThucTe, idDvtThucTe, dvtChuan);
      result.warnings.push(
        `Đơn vị tính thực tế (${idDvtThucTe}) khác đơn vị tính chuẩn (${dvtChuan}). Đã quy đổi về ${soLuongChuan}`
      );
    } catch (error) {
      result.errors.push(`Không thể quy đổi: ${error.message}`);
      result.isValid = false;
    }
  } else {
    soLuongChuan = soLuongThucTe;
  }

  result.so_luong_chuan = soLuongChuan;
  result.dvt_chuan = dvtChuan;

  return result;
};

const getDanhSachQuyDoi = async (id_dn) => {
  const quyDois = await QuyDoiDonViChiTiet.findAll({
    where: { id_dn, trang_thai: 'HoatDong' },
    include: [
      { model: DonViTinhHQ, as: 'donViTinhNguon', attributes: ['id_dvt_hq', 'ten_dvt', 'ma_dvt'] },
      { model: DonViTinhHQ, as: 'donViTinhDich', attributes: ['id_dvt_hq', 'ten_dvt', 'ma_dvt'] }
    ],
    order: [['ngay_hieu_luc', 'DESC']]
  });

  return quyDois.map(qd => ({
    id: qd.id_qd,
    id_dvt_nguon: qd.id_dvt_nguon,
    ten_dvt_nguon: qd.donViTinhNguon?.ten_dvt,
    ma_dvt_nguon: qd.donViTinhNguon?.ma_dvt,
    id_dvt_dich: qd.id_dvt_dich,
    ten_dvt_dich: qd.donViTinhDich?.ten_dvt,
    ma_dvt_dich: qd.donViTinhDich?.ma_dvt,
    ty_le: qd.ty_le,
    mo_ta: qd.mo_ta,
    ngay_hieu_luc: qd.ngay_hieu_luc,
    ngay_het_han: qd.ngay_het_han
  }));
};

const taoQuyDoi = async (data) => {
  const { id_dn, id_dvt_nguon, id_dvt_dich, ty_le, mo_ta, ngay_hieu_luc, ngay_het_han } = data;

  const existing = await QuyDoiDonViChiTiet.findOne({
    where: {
      id_dn,
      id_dvt_nguon,
      id_dvt_dich,
      trang_thai: 'HoatDong'
    }
  });

  if (existing) {
    existing.ty_le = ty_le;
    existing.mo_ta = mo_ta;
    existing.ngay_hieu_luc = ngay_hieu_luc;
    existing.ngay_het_han = ngay_het_han;
    await existing.save();
    return existing;
  }

  return await QuyDoiDonViChiTiet.create({
    id_dn,
    id_dvt_nguon,
    id_dvt_dich,
    ty_le,
    mo_ta,
    ngay_hieu_luc: ngay_hieu_luc || new Date(),
    ngay_het_han,
    trang_thai: 'HoatDong'
  });
};

const capNhatQuyDoi = async (id_qd, data) => {
  const quyDoi = await QuyDoiDonViChiTiet.findByPk(id_qd);
  if (!quyDoi) {
    throw new Error('Không tìm thấy bản ghi quy đổi');
  }

  if (data.ty_le) quyDoi.ty_le = data.ty_le;
  if (data.mo_ta !== undefined) quyDoi.mo_ta = data.mo_ta;
  if (data.ngay_hieu_luc) quyDoi.ngay_hieu_luc = data.ngay_hieu_luc;
  if (data.ngay_het_han !== undefined) quyDoi.ngay_het_han = data.ngay_het_han;
  if (data.trang_thai) quyDoi.trang_thai = data.trang_thai;

  await quyDoi.save();
  return quyDoi;
};

const xoaQuyDoi = async (id_qd) => {
  const quyDoi = await QuyDoiDonViChiTiet.findByPk(id_qd);
  if (!quyDoi) {
    throw new Error('Không tìm thấy bản ghi quy đổi');
  }

  quyDoi.trang_thai = 'KhongHoatDong';
  await quyDoi.save();
  return { message: 'Đã vô hiệu hóa bản ghi quy đổi' };
};

module.exports = {
  layTyLeQuyDoi,
  quyDoiSoLuong,
  quyDoiNhapKho,
  kiemTraSaiDinhTinh,
  getDanhSachQuyDoi,
  taoQuyDoi,
  capNhatQuyDoi,
  xoaQuyDoi
};
