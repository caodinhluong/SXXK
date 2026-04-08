'use strict';

const db = require('../models');
const { Op } = require('sequelize');
const { QueryTypes } = require('sequelize');

const TonKhoNPL = db.TonKhoNPL;
const TonKhoSP = db.TonKhoSP;
const TonKhoDauKy = db.TonKhoDauKy;
const NhapKhoNPL = db.NhapKhoNPL;
const NhapKhoNPLChiTiet = db.NhapKhoNPLChiTiet;
const NhapKhoSP = db.NhapKhoSP;
const NhapKhoSPChiTiet = db.NhapKhoSPChiTiet;
const XuatKhoNPL = db.XuatKhoNPL;
const XuatKhoNPLChiTiet = db.XuatKhoNPLChiTiet;
const XuatKhoSP = db.XuatKhoSP;
const XuatKhoSPChiTiet = db.XuatKhoSPChiTiet;

const getTonKhoNPL = async (id_dn, id_kho, id_npl) => {
  const tonKho = await TonKhoNPL.findOne({
    where: { id_kho, id_npl },
    include: [
      { model: db.Kho, as: 'kho', where: { id_dn } },
      { model: db.NguyenPhuLieu, as: 'nguyenPhuLieu' }
    ]
  });

  if (!tonKho) {
    return { id_npl, so_luong_ton: 0 };
  }

  return {
    id_kho: tonKho.id_kho,
    id_npl: tonKho.id_npl,
    so_luong_ton: tonKho.so_luong_ton,
    nguyenPhuLieu: tonKho.nguyenPhuLieu
  };
};

const getTonKhoSP = async (id_dn, id_kho, id_sp) => {
  const tonKho = await TonKhoSP.findOne({
    where: { id_kho, id_sp },
    include: [
      { model: db.Kho, as: 'kho', where: { id_dn } },
      { model: db.SanPham, as: 'sanPham' }
    ]
  });

  if (!tonKho) {
    return { id_sp, so_luong_ton: 0 };
  }

  return {
    id_kho: tonKho.id_kho,
    id_sp: tonKho.id_sp,
    so_luong_ton: tonKho.so_luong_ton,
    sanPham: tonKho.sanPham
  };
};

const tinhTonKhoTheoKy = async ({ id_dn, id_kho, id_npl, id_sp, tu_ngay, den_ngay }) => {
  const loai = id_npl ? 'NPL' : 'SP';
  const id = id_npl || id_sp;

  const dauKy = await TonKhoDauKy.findOne({
    where: {
      id_dn,
      id_kho,
      ky_bao_cao: tu_ngay.substring(0, 7),
      loai_ton: loai === 'NPL' ? 'NguyenLieu' : 'SanPham',
      [id_npl ? 'id_npl' : 'id_sp']: id
    }
  });

  const tonDauKy = dauKy ? parseFloat(dauKy.so_luong_dau_ky) : 0;

  let nhapTrongKy = 0;
  let xuatTrongKy = 0;

  if (loai === 'NPL') {
    const sqlNhap = `
      SELECT COALESCE(SUM(ct.so_luong), 0) as total
      FROM NhapKhoNPLChiTiet ct
      JOIN NhapKhoNPL p ON p.id_nhap = ct.id_nhap
      WHERE ct.id_npl = :id_npl AND p.id_kho = :id_kho 
        AND p.ngay_nhap BETWEEN :tu_ngay AND :den_ngay
    `;
    const resNhap = await db.sequelize.query(sqlNhap, {
      replacements: { id_npl: id, id_kho, tu_ngay, den_ngay },
      type: QueryTypes.SELECT
    });
    nhapTrongKy = parseFloat(resNhap[0]?.total || 0);

    const sqlXuat = `
      SELECT COALESCE(SUM(ct.so_luong), 0) as total
      FROM XuatKhoNPLChiTiet ct
      JOIN XuatKhoNPL p ON p.id_xuat = ct.id_xuat
      WHERE ct.id_npl = :id_npl AND p.id_kho = :id_kho 
        AND p.ngay_xuat BETWEEN :tu_ngay AND :den_ngay
    `;
    const resXuat = await db.sequelize.query(sqlXuat, {
      replacements: { id_npl: id, id_kho, tu_ngay, den_ngay },
      type: QueryTypes.SELECT
    });
    xuatTrongKy = parseFloat(resXuat[0]?.total || 0);
  } else {
    const sqlNhap = `
      SELECT COALESCE(SUM(ct.so_luong), 0) as total
      FROM NhapKhoSPChiTiet ct
      JOIN NhapKhoSP p ON p.id_nhap = ct.id_nhap
      WHERE ct.id_sp = :id_sp AND p.id_kho = :id_kho 
        AND p.ngay_nhap BETWEEN :tu_ngay AND :den_ngay
    `;
    const resNhap = await db.sequelize.query(sqlNhap, {
      replacements: { id_sp: id, id_kho, tu_ngay, den_ngay },
      type: QueryTypes.SELECT
    });
    nhapTrongKy = parseFloat(resNhap[0]?.total || 0);

    const sqlXuat = `
      SELECT COALESCE(SUM(ct.so_luong), 0) as total
      FROM XuatKhoSPChiTiet ct
      JOIN XuatKhoSP p ON p.id_xuat = ct.id_xuat
      WHERE ct.id_sp = :id_sp AND p.id_kho = :id_kho 
        AND p.ngay_xuat BETWEEN :tu_ngay AND :den_ngay
    `;
    const resXuat = await db.sequelize.query(sqlXuat, {
      replacements: { id_sp: id, id_kho, tu_ngay, den_ngay },
      type: QueryTypes.SELECT
    });
    xuatTrongKy = parseFloat(resXuat[0]?.total || 0);
  }

  const tonCuoiKy = tonDauKy + nhapTrongKy - xuatTrongKy;

  return {
    id_dn,
    id_kho,
    loai,
    id_npl: loai === 'NPL' ? id : null,
    id_sp: loai === 'SP' ? id : null,
    ky_bao_cao: tu_ngay.substring(0, 7),
    tu_ngay,
    den_ngay,
    ton_dau_ky: tonDauKy,
    nhap_trong_ky: nhapTrongKy,
    xuat_trong_ky: xuatTrongKy,
    ton_cuoi_ky: tonCuoiKy,
    ton_am: tonCuoiKy < 0
  };
};

const getBaoCaoTonKho = async ({ id_dn, id_kho, tu_ngay, den_ngay, loai }) => {
  const results = [];

  const khoList = id_kho ? [{ id_kho }] : await db.Kho.findAll({
    where: { id_dn },
    attributes: ['id_kho', 'ten_kho', 'loai_kho']
  });

  for (const kho of khoList) {
    if (loai === 'NPL' || !loai) {
      const sql = `
        SELECT 
          npl.id_npl,
          npl.ten_npl,
          npl.ma_phan_loai,
          dvt.ten_dvt as don_vi_tinh,
          COALESCE(tk.so_luong_ton, 0) as ton_hien_tai
        FROM NguyenPhuLieu npl
        LEFT JOIN TonKhoNPL tk ON tk.id_npl = npl.id_npl AND tk.id_kho = :id_kho
        LEFT JOIN DonViTinhHQ dvt ON dvt.id_dvt_hq = npl.id_dvt_hq
        WHERE npl.id_dn = :id_dn
        ORDER BY npl.ten_npl
      `;
      const nplList = await db.sequelize.query(sql, {
        replacements: { id_dn, id_kho: kho.id_kho },
        type: QueryTypes.SELECT
      });

      for (const npl of nplList) {
        const tonKy = await tinhTonKhoTheoKy({
          id_dn,
          id_kho: kho.id_kho,
          id_npl: npl.id_npl,
          tu_ngay,
          den_ngay
        });

        results.push({
          loai: 'NguyenLieu',
          id_kho: kho.id_kho,
          ten_kho: kho.ten_kho,
          id: npl.id_npl,
          ma: npl.ma_phan_loai,
          ten: npl.ten_npl,
          don_vi_tinh: npl.don_vi_tinh,
          ton_dau_ky: tonKy.ton_dau_ky,
          nhap_trong_ky: tonKy.nhap_trong_ky,
          xuat_trong_ky: tonKy.xuat_trong_ky,
          ton_cuoi_ky: tonKy.ton_cuoi_ky,
          ton_am: tonKy.ton_am
        });
      }
    }

    if (loai === 'SP' || !loai) {
      const sql = `
        SELECT 
          sp.id_sp,
          sp.ten_sp,
          sp.ma_sp,
          dvt.ten_dvt as don_vi_tinh,
          COALESCE(tk.so_luong_ton, 0) as ton_hien_tai
        FROM SanPham sp
        LEFT JOIN TonKhoSP tk ON tk.id_sp = sp.id_sp AND tk.id_kho = :id_kho
        LEFT JOIN DonViTinhHQ dvt ON dvt.id_dvt_hq = sp.id_dvt_hq
        WHERE sp.id_dn = :id_dn
        ORDER BY sp.ten_sp
      `;
      const spList = await db.sequelize.query(sql, {
        replacements: { id_dn, id_kho: kho.id_kho },
        type: QueryTypes.SELECT
      });

      for (const sp of spList) {
        const tonKy = await tinhTonKhoTheoKy({
          id_dn,
          id_kho: kho.id_kho,
          id_sp: sp.id_sp,
          tu_ngay,
          den_ngay
        });

        results.push({
          loai: 'SanPham',
          id_kho: kho.id_kho,
          ten_kho: kho.ten_kho,
          id: sp.id_sp,
          ma: sp.ma_sp,
          ten: sp.ten_sp,
          don_vi_tinh: sp.don_vi_tinh,
          ton_dau_ky: tonKy.ton_dau_ky,
          nhap_trong_ky: tonKy.nhap_trong_ky,
          xuat_trong_ky: tonKy.xuat_trong_ky,
          ton_cuoi_ky: tonKy.ton_cuoi_ky,
          ton_am: tonKy.ton_am
        });
      }
    }
  }

  return results;
};

const nhapTonDauKy = async (data) => {
  const { id_dn, id_kho, id_npl, id_sp, ky_bao_cao, ngay_bat_dau, ngay_ket_thuc, so_luong_dau_ky, don_vi_tinh, ghi_chu, nguoi_tao } = data;

  if (!id_kho || !ky_bao_cao || !so_luong_dau_ky) {
    throw new Error('Thiếu thông tin bắt buộc');
  }

  const loaiTon = id_npl ? 'NguyenLieu' : (id_sp ? 'SanPham' : null);
  if (!loaiTon) {
    throw new Error('Phải cung cấp id_npl hoặc id_sp');
  }

  const existing = await TonKhoDauKy.findOne({
    where: {
      id_dn,
      id_kho,
      ky_bao_cao,
      loai_ton: loaiTon,
      [id_npl ? 'id_npl' : 'id_sp']: id_npl || id_sp
    }
  });

  if (existing) {
    existing.so_luong_dau_ky = so_luong_dau_ky;
    existing.don_vi_tinh = don_vi_tinh;
    existing.ghi_chu = ghi_chu;
    existing.nguoi_tao = nguoi_tao;
    await existing.save();
    return existing;
  }

  return await TonKhoDauKy.create({
    id_dn,
    id_kho,
    id_npl,
    id_sp,
    loai_ton: loaiTon,
    ky_bao_cao,
    ngay_bat_dau: ngay_bat_dau || `${ky_bao_cao}-01`,
    ngay_ket_thuc: ngay_ket_thuc || `${ky_bao_cao}-31`,
    so_luong_dau_ky,
    don_vi_tinh,
    ghi_chu,
    nguoi_tao
  });
};

const getTonDauKy = async (id_dn, ky_bao_cao) => {
  return await TonKhoDauKy.findAll({
    where: { id_dn, ky_bao_cao },
    include: [
      { model: db.Kho, as: 'kho', attributes: ['ten_kho'] },
      { model: db.NguyenPhuLieu, as: 'nguyenPhuLieu', attributes: ['ten_npl', 'ma_phan_loai'] },
      { model: db.SanPham, as: 'sanPham', attributes: ['ten_sp', 'ma_sp'] }
    ]
  });
};

const capNhatTonKho = async ({ id_kho, id_npl, id_sp, so_luong }) => {
  if (id_npl) {
    const [tonKho, created] = await TonKhoNPL.findOrCreate({
      where: { id_kho, id_npl },
      defaults: { so_luong_ton: 0 }
    });
    tonKho.so_luong_ton = so_luong;
    await tonKho.save();
    return { loai: 'NPL', ...tonKho.toJSON() };
  } else if (id_sp) {
    const [tonKho, created] = await TonKhoSP.findOrCreate({
      where: { id_kho, id_sp },
      defaults: { so_luong_ton: 0 }
    });
    tonKho.so_luong_ton = so_luong;
    await tonKho.save();
    return { loai: 'SP', ...tonKho.toJSON() };
  }
  throw new Error('Phải cung cấp id_npl hoặc id_sp');
};

const getTonKhoNPLAll = async (id_dn, id_kho) => {
  const sql = `
    SELECT 
      tk.id_kho,
      tk.id_npl,
      npl.ten_npl,
      npl.ma_phan_loai,
      dvt.ten_dvt as don_vi_tinh,
      COALESCE(tk.so_luong_ton, 0) as so_luong_ton
    FROM NguyenPhuLieu npl
    LEFT JOIN TonKhoNPL tk ON tk.id_npl = npl.id_npl AND tk.id_kho = :id_kho
    LEFT JOIN DonViTinhHQ dvt ON dvt.id_dvt_hq = npl.id_dvt_hq
    WHERE npl.id_dn = :id_dn
    ORDER BY npl.ten_npl
  `;
  
  return await db.sequelize.query(sql, {
    replacements: { id_dn, id_kho },
    type: QueryTypes.SELECT
  });
};

const getTonKhoSPAll = async (id_dn, id_kho) => {
  const sql = `
    SELECT 
      tk.id_kho,
      tk.id_sp,
      sp.ten_sp,
      sp.ma_sp,
      dvt.ten_dvt as don_vi_tinh,
      COALESCE(tk.so_luong_ton, 0) as so_luong_ton
    FROM SanPham sp
    LEFT JOIN TonKhoSP tk ON tk.id_sp = sp.id_sp AND tk.id_kho = :id_kho
    LEFT JOIN DonViTinhHQ dvt ON dvt.id_dvt_hq = sp.id_dvt_hq
    WHERE sp.id_dn = :id_dn
    ORDER BY sp.ten_sp
  `;
  
  return await db.sequelize.query(sql, {
    replacements: { id_dn, id_kho },
    type: QueryTypes.SELECT
  });
};

module.exports = {
  getTonKhoNPL,
  getTonKhoSP,
  getTonKhoNPLAll,
  getTonKhoSPAll,
  tinhTonKhoTheoKy,
  getBaoCaoTonKho,
  nhapTonDauKy,
  getTonDauKy,
  capNhatTonKho
};
