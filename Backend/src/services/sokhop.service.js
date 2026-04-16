'use strict';

const db = require('../models');
const { Op } = require('sequelize');
const { QueryTypes } = require('sequelize');

const ToKhaiXuat = db.ToKhaiXuat;
const ToKhaiXuatChiTiet = db.ToKhaiXuatChiTiet;
const XuatKhoSP = db.XuatKhoSP;
const XuatKhoSPChiTiet = db.XuatKhoSPChiTiet;
const SanPham = db.SanPham;
const NguyenPhuLieu = db.NguyenPhuLieu;

const SO_KHOP_MA_155 = '155';

const soKhopToKhaiXuatVoiPhieuXuat = async ({ id_tkx, id_xuat_kho, nguoi_khop, ngay_khop }) => {
  const errors = [];

  if (!id_tkx || !id_xuat_kho) {
    errors.push('Thiếu id_tkx hoặc id_xuat_kho');
  }

  if (errors.length > 0) {
    throw new Error(`Lỗi: ${errors.join(', ')}`);
  }

  const toKhai = await ToKhaiXuat.findByPk(id_tkx, {
    include: [{ 
      model: ToKhaiXuatChiTiet, 
      as: 'chiTiets',
      include: [
        { model: SanPham, as: 'sanPham' },
        { model: NguyenPhuLieu, as: 'nguyenPhuLieu' }
      ]
    }]
  });

  if (!toKhai) {
    throw new Error('Tờ khai xuất không tồn tại');
  }

  const phieuXuat = await XuatKhoSP.findByPk(id_xuat_kho, {
    include: [{ 
      model: XuatKhoSPChiTiet, 
      as: 'chiTiets',
      include: [
        { model: SanPham, as: 'sanPham' },
        { model: NguyenPhuLieu, as: 'nguyenPhuLieu' }
      ]
    }]
  });

  if (!phieuXuat) {
    throw new Error('Phiếu xuất kho SP không tồn tại');
  }

  const existingLink = await db.DoiSoatXuat.findOne({
    where: { id_tkx, id_xuat_kho }
  });

  if (existingLink) {
    throw new Error(`Đã tồn tại bản ghi so khớp cho tờ khai ${id_tkx} và phiếu xuất ${id_xuat_kho}`);
  }

  const comparisonMap = {};

  for (const ct of toKhai.chiTiets) {
    const key = ct.id_sp ? `sp_${ct.id_sp}` : `npl_${ct.id_npl}`;
    if (!comparisonMap[key]) {
      comparisonMap[key] = {
        loai: ct.id_sp ? 'SP' : 'NPL',
        id_sp: ct.id_sp,
        id_npl: ct.id_npl,
        ten: ct.id_sp ? ct.sanPham?.ten_sp : ct.nguyenPhuLieu?.ten_npl,
        sl_to_khai: 0,
        sl_phieu_xuat: 0
      };
    }
    comparisonMap[key].sl_to_khai += parseFloat(ct.so_luong || 0);
  }

  for (const ct of phieuXuat.chiTiets) {
    const key = ct.id_sp ? `sp_${ct.id_sp}` : `npl_${ct.id_npl}`;
    if (!comparisonMap[key]) {
      comparisonMap[key] = {
        loai: ct.id_sp ? 'SP' : 'NPL',
        id_sp: ct.id_sp,
        id_npl: ct.id_npl,
        ten: ct.id_sp ? ct.sanPham?.ten_sp : ct.nguyenPhuLieu?.ten_npl,
        sl_to_khai: 0,
        sl_phieu_xuat: 0
      };
    }
    comparisonMap[key].sl_phieu_xuat += parseFloat(ct.so_luong || 0);
  }

  const chiTietList = [];
  let totalChenhLech = 0;
  let hasDiscrepancy = false;

  for (const key of Object.keys(comparisonMap)) {
    const item = comparisonMap[key];
    const chenhLech = item.sl_phieu_xuat - item.sl_to_khai;

    if (Math.abs(chenhLech) > 0.001) {
      hasDiscrepancy = true;
    }
    totalChenhLech += Math.abs(chenhLech);

    chiTietList.push({
      id_sp: item.id_sp,
      id_npl: item.id_npl,
      ten: item.ten,
      loai: item.loai,
      sl_to_khai: item.sl_to_khai,
      sl_phieu_xuat: item.sl_phieu_xuat,
      chenh_lech: chenhLech,
      ty_lech: item.sl_to_khai > 0 ? ((chenhLech / item.sl_to_kuai) * 100).toFixed(2) : 0
    });
  }

  let ketQua = 'KhopDu';
  if (hasDiscrepancy) {
    ketQua = 'ChenhLech';
  }

  const doiSoat = await db.DoiSoatXuat.create({
    id_tkx,
    id_xuat_kho,
    ma_doi_soat: SO_KHOP_MA_155,
    ngay_doi_soat: ngay_khop || new Date(),
    nguoi_doi_soat: nguoi_khop,
    ket_qua: ketQua,
    chenh_lech_sl: totalChenhLech,
    trang_thai: 'ChuaXuLy'
  });

  for (const ct of chiTietList) {
    await db.DoiSoatXuatChiTiet.create({
      id_ds: doiSoat.id_ds,
      id_sp: ct.id_sp,
      id_npl: ct.id_npl,
      sl_to_khai: ct.sl_to_khai,
      sl_xuat_kho: ct.sl_phieu_xuat,
      chenh_lech: ct.chenh_lech,
      ly_do: ct.chenh_lech !== 0 ? 'Chênh lệch giữa tờ khai và phiếu xuất' : null
    });
  }

  await XuatKhoSP.update(
    { id_tkx },
    { where: { id_xuat: id_xuat_kho } }
  );

  return {
    id_ds: doiSoat.id_ds,
    id_tkx,
    id_xuat_kho,
    ma_doi_soat: SO_KHOP_MA_155,
    ket_qua: ketQua,
    tong_chenh_lech: totalChenhLech,
    chi_tiet: chiTietList
  };
};

const getDanhSachChuaKhop = async (id_dn, loai = 'all') => {
  const { QueryTypes } = require('sequelize');

  let sql = '';
  const replacements = { id_dn };

  if (loai === 'to_khai') {
    sql = `
      SELECT 
        tk.id_tkx as id,
        tk.so_tk,
        tk.ngay_tk,
        tk.ma_to_khai,
        tk.loai_hang,
        tk.trang_thai,
        lh.so_lo,
        'ToKhaiXuat' as loai_ban_ghi
      FROM ToKhaiXuat tk
      JOIN LoHang lh ON lh.id_lh = tk.id_lh
      JOIN HopDong hd ON hd.id_hd = lh.id_hd
      WHERE hd.id_dn = :id_dn
        AND tk.trang_thai = 'ThongQuan'
        AND NOT EXISTS (
          SELECT 1 FROM DoiSoatXuat ds 
          WHERE ds.id_tkx = tk.id_tkx
        )
      ORDER BY tk.ngay_tk DESC
    `;
  } else if (loai === 'phieu_xuat') {
    sql = `
      SELECT 
        px.id_xuat as id,
        px.ngay_xuat,
        px.ca_kip,
        px.ly_do_xuat,
        k.ten_kho,
        'XuatKhoSP' as loai_ban_ghi
      FROM XuatKhoSP px
      JOIN Kho k ON k.id_kho = px.id_kho
      WHERE k.id_dn = :id_dn
        AND px.ly_do_xuat IN ('XuatKhau', 'TaiXuat')
        AND px.id_tkx IS NULL
      ORDER BY px.ngay_xuat DESC
    `;
  } else {
    sql = `
      SELECT 
        tk.id_tkx as id,
        tk.so_tk,
        tk.ngay_tk,
        tk.ma_to_khai,
        'ToKhaiXuat' as loai_ban_ghi
      FROM ToKhaiXuat tk
      JOIN LoHang lh ON lh.id_lh = tk.id_lh
      JOIN HopDong hd ON hd.id_hd = lh.id_hd
      WHERE hd.id_dn = :id_dn
        AND tk.trang_thai = 'ThongQuan'
        AND NOT EXISTS (
          SELECT 1 FROM DoiSoatXuat ds 
          WHERE ds.id_tkx = tk.id_tkx
        )
      ORDER BY tk.ngay_tk DESC
      LIMIT 50
    `;
  }

  const results = await db.sequelize.query(sql, {
    replacements,
    type: QueryTypes.SELECT
  });

  return results;
};

const getBaoCaoSoKhop = async (id_dn, tu_ngay, den_ngay) => {
  const sql = `
    SELECT 
      ds.id_ds,
      ds.ngay_doi_soat,
      ds.ma_doi_soat,
      ds.ket_qua,
      ds.chenh_lech_sl,
      tk.so_tk as so_to_khai,
      px.id_xuat as so_phieu_xuat,
      ds.nguoi_doi_soat
    FROM DoiSoatXuat ds
    JOIN ToKhaiXuat tk ON tk.id_tkx = ds.id_tkx
    JOIN XuatKhoSP px ON px.id_xuat = ds.id_xuat
    JOIN LoHang lh ON lh.id_lh = tk.id_lh
    JOIN HopDong hd ON hd.id_hd = lh.id_hd
    WHERE hd.id_dn = :id_dn
      AND ds.ngay_doi_soat BETWEEN :tu_ngay AND :den_ngay
    ORDER BY ds.ngay_doi_soat DESC
  `;

  const results = await db.sequelize.query(sql, {
    replacements: { id_dn, tu_ngay, den_ngay },
    type: QueryTypes.SELECT
  });

  const summary = {
    tong_so: results.length,
    khop_du: results.filter(r => r.ket_qua === 'KhopDu').length,
    chenh_lech: results.filter(r => r.ket_qua === 'ChenhLech').length,
    can_xac_minh: results.filter(r => r.ket_qua === 'CanXacMinh').length
  };

  return { results, summary };
};

const getChiTietSoKhop = async (id_ds) => {
  const doiSoat = await db.DoiSoatXuat.findByPk(id_ds, {
    include: [
      { model: ToKhaiXuat, as: 'toKhaiXuat' },
      { model: XuatKhoSP, as: 'xuatKho' },
      { 
        model: db.DoiSoatXuatChiTiet, 
        as: 'chiTiets',
        include: [
          { model: SanPham, as: 'sanPham' },
          { model: NguyenPhuLieu, as: 'nguyenPhuLieu' }
        ]
      }
    ]
  });

  if (!doiSoat) {
    throw new Error('Không tìm thấy bản ghi so khớp');
  }

  return doiSoat;
};

module.exports = {
  soKhopToKhaiXuatVoiPhieuXuat,
  getDanhSachChuaKhop,
  getBaoCaoSoKhop,
  getChiTietSoKhop,
  SO_KHOP_MA_155
};
