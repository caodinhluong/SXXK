'use strict';

const db = require('../models');
const { Op } = require('sequelize');
const { QueryTypes } = require('sequelize');

const SanPham = db.SanPham;
const NguyenPhuLieu = db.NguyenPhuLieu;
const DinhMucSanPham = db.DinhMucSanPham;
const PhieuSanXuat = db.PhieuSanXuat;
const XuatKhoNPL = db.XuatKhoNPL;
const XuatKhoNPLChiTiet = db.XuatKhoNPLChiTiet;
const XuatKhoSP = db.XuatKhoSP;
const XuatKhoSPChiTiet = db.XuatKhoSPChiTiet;
const NhapKhoSP = db.NhapKhoSP;
const NhapKhoSPChiTiet = db.NhapKhoSPChiTiet;
const TonKhoNPL = db.TonKhoNPL;
const TonKhoSP = db.TonKhoSP;
const TonKhoDauKy = db.TonKhoDauKy;

const phatHienThatThoat = async ({ id_dn, id_sp, id_hd, tu_ngay, den_ngay }) => {
  const errors = [];
  
  if (!id_dn || (!id_sp && !id_hd)) {
    errors.push('Thiếu id_dn hoặc id_sp/id_hd');
  }
  
  if (errors.length > 0) {
    throw new Error(`Lỗi: ${errors.join(', ')}`);
  }

  const sp = await SanPham.findByPk(id_sp);
  if (!sp) {
    throw new Error('Sản phẩm không tồn tại');
  }

  const dinhMucList = await DinhMucSanPham.findAll({
    where: { id_sp },
    include: [{ model: NguyenPhuLieu, as: 'nguyenPhuLieu' }]
  });

  if (dinhMucList.length === 0) {
    return {
      id_sp,
      ten_sp: sp.ten_sp,
      co_dinh_muc: false,
      message: 'Sản phẩm chưa có định mức nguyên vật liệu',
      chi_tiet: []
    };
  }

  let tongSanXuat = 0;
  let tongXuatNPL = 0;

  const phieuSanXuatList = await PhieuSanXuat.findAll({
    where: {
      id_dn,
      id_sp,
      ngay_sx: { [Op.between]: [tu_ngay, den_ngay] },
      trang_thai: { [Op.in]: ['HoanThanh', 'DangSanXuat'] }
    }
  });

  for (const phieu of phieuSanXuatList) {
    tongSanXuat += parseFloat(phieu.so_luong_thuc_te || phieu.so_luong_ke_hoach || 0);
  }

  const nplIds = dinhMucList.map(dm => dm.id_npl);

  if (phieuSanXuatList.length > 0) {
    const xuatNPLIds = phieuSanXuatList
      .filter(p => p.id_xuat_npl)
      .map(p => p.id_xuat_npl);

    if (xuatNPLIds.length > 0) {
      const sql = `
        SELECT id_npl, SUM(so_luong) as total
        FROM XuatKhoNPLChiTiet
        WHERE id_xuat IN (?) AND id_npl IN (?)
        GROUP BY id_npl
      `;
      const xuatNPLList = await db.sequelize.query(sql, {
        replacements: [xuatNPLIds, nplIds],
        type: QueryTypes.SELECT
      });

      for (const item of xuatNPLList) {
        tongXuatNPL += parseFloat(item.total || 0);
      }
    }
  }

  const tongDinhMuc = dinhMucList.reduce((sum, dm) => {
    return sum + parseFloat(dm.so_luong || 0);
  }, 0);

  const nplDuKien = tongSanXuat * tongDinhMuc;

  const chenhLech = tongXuatNPL - nplDuKien;
  const tyLeChenhLech = nplDuKien > 0 ? ((chenhLech / nplDuKien) * 100).toFixed(2) : 0;

  let trangThai = 'HopLe';
  let canhBao = '';

  if (chenhLech < 0 && Math.abs(tyLeChenhLech) > 5) {
    trangThai = 'ThatThoat';
    canhBao = `Cảnh báo: Xuất NPL thấp hơn định mức ${Math.abs(tyLeChenhLech)}%. Có thể bị thất thoát hoặc thiếu hụt.`;
  } else if (chenhLech > 0 && parseFloat(tyLeChenhLech) > 10) {
    trangThai = 'VuotDinhMuc';
    canhBao = `Cảnh báo: Xuất NPL vượt định mức ${tyLeChenhLech}%. Kiểm tra lại quy trình sản xuất.`;
  }

  const chiTietList = [];
  for (const dm of dinhMucList) {
    const slDinhMuc = parseFloat(dm.so_luong || 0) * tongSanXuat;
    
    let slXuatThucTe = 0;
    if (phieuSanXuatList.length > 0) {
      const xuatNPLIds = phieuSanXuatList
        .filter(p => p.id_xuat_npl)
        .map(p => p.id_xuat_npl);
      
      if (xuatNPLIds.length > 0) {
        const sql = `
          SELECT COALESCE(SUM(so_luong), 0) as total
          FROM XuatKhoNPLChiTiet
          WHERE id_xuat IN (?) AND id_npl = ?
        `;
        const res = await db.sequelize.query(sql, {
          replacements: [xuatNPLIds, dm.id_npl],
          type: QueryTypes.SELECT
        });
        slXuatThucTe = parseFloat(res[0]?.total || 0);
      }
    }

    const cl = slXuatThucTe - slDinhMuc;
    const tl = slDinhMuc > 0 ? ((cl / slDinhMuc) * 100).toFixed(2) : 0;

    chiTietList.push({
      id_npl: dm.id_npl,
      ten_npl: dm.nguyenPhuLieu?.ten_npl,
      ma_npl: dm.nguyenPhuLieu?.ma_phan_loai,
      sl_dinh_muc: slDinhMuc,
      sl_xuat_thuc_te: slXuatThucTe,
      chenh_lech: cl,
      ty_le_chenh_lech: tl,
      trang_thai: Math.abs(parseFloat(tl)) > 5 ? (cl < 0 ? 'ThatThoat' : 'Vuot') : 'HopLe'
    });
  }

  return {
    id_sp,
    ten_sp: sp.ten_sp,
    co_dinh_muc: true,
    id_hd,
    tu_ngay,
    den_ngay,
    tong_san_xuat: tongSanXuat,
    tong_dinh_muc: tongDinhMuc,
    tong_xuat_npl: tongXuatNPL,
    npl_du_kien: nplDuKien,
    chenh_lech: chenhLech,
    ty_le_chenh_lech: tyLeChenhLech,
    trang_thai,
    canh_bao,
    chi_tiet: chiTietList
  };
};

const phatHienTonKhoAm = async (id_dn, id_kho) => {
  const results = {
    ton_kho_am: [],
    ton_kho_duoi_0: [],
    tat_ca: []
  };

  const khoCondition = id_kho ? { id_kho } : {};
  const khoList = await db.Kho.findAll({
    where: { id_dn, ...khoCondition },
    attributes: ['id_kho', 'ten_kho']
  });

  for (const kho of khoList) {
    const tonKhoNPL = await TonKhoNPL.findAll({
      where: { id_kho: kho.id_kho },
      include: [{ 
        model: NguyenPhuLieu, 
        as: 'nguyenPhuLieu',
        where: { id_dn }
      }]
    });

    for (const tk of tonKhoNPL) {
      const item = {
        id_kho: kho.id_kho,
        ten_kho: kho.ten_kho,
        loai: 'NPL',
        id: tk.id_npl,
        ten: tk.nguyenPhuLieu?.ten_npl,
        ma: tk.nguyenPhuLieu?.ma_phan_loai,
        so_luong_ton: parseFloat(tk.so_luong_ton)
      };
      results.tat_ca.push(item);
      
      if (parseFloat(tk.so_luong_ton) < 0) {
        item.trang_thai = 'TonAm';
        results.ton_kho_am.push(item);
      } else if (parseFloat(tk.so_luong_ton) === 0) {
        item.trang_thai = 'TonBang0';
        results.ton_kho_duoi_0.push(item);
      }
    }

    const tonKhoSP = await TonKhoSP.findAll({
      where: { id_kho: kho.id_kho },
      include: [{ 
        model: SanPham, 
        as: 'sanPham',
        where: { id_dn }
      }]
    });

    for (const tk of tonKhoSP) {
      const item = {
        id_kho: kho.id_kho,
        ten_kho: kho.ten_kho,
        loai: 'SP',
        id: tk.id_sp,
        ten: tk.sanPham?.ten_sp,
        ma: tk.sanPham?.ma_sp,
        so_luong_ton: parseFloat(tk.so_luong_ton)
      };
      results.tat_ca.push(item);
      
      if (parseFloat(tk.so_luong_ton) < 0) {
        item.trang_thai = 'TonAm';
        results.ton_kho_am.push(item);
      } else if (parseFloat(tk.so_luong_ton) === 0) {
        item.trang_thai = 'TonBang0';
        results.ton_kho_duoi_0.push(item);
      }
    }
  }

  return results;
};

const getBaoCaoThatThoatTongHop = async ({ id_dn, tu_ngay, den_ngay }) => {
  const spList = await SanPham.findAll({
    where: { id_dn },
    attributes: ['id_sp', 'ten_sp', 'ma_sp']
  });

  const results = [];
  let tongThatThoat = 0;
  let tongVuotDinhMuc = 0;

  for (const sp of spList) {
    try {
      const result = await phatHienThatThoat({
        id_dn,
        id_sp: sp.id_sp,
        tu_ngay,
        den_ngay
      });

      if (result.trang_thai === 'ThatThoat') {
        tongThatThoat++;
      } else if (result.trang_thai === 'VuotDinhMuc') {
        tongVuotDinhMuc++;
      }

      results.push({
        id_sp: sp.id_sp,
        ma_sp: sp.ma_sp,
        ten_sp: sp.ten_sp,
        co_dinh_muc: result.co_dinh_muc,
        tong_san_xuat: result.tong_san_xuat,
        tong_xuat_npl: result.tong_xuat_npl,
        npl_du_kien: result.npl_du_kien,
        chenh_lech: result.chenh_lech,
        ty_le_chenh_lech: result.ty_le_chenh_lech,
        trang_thai: result.trang_thai,
        canh_bao: result.canh_bao
      });
    } catch (error) {
      console.error(`Lỗi khi phân tích SP ${sp.id_sp}:`, error.message);
    }
  }

  return {
    tu_ngay,
    den_ngay,
    tong_sp: results.length,
    tong_that_thoat: tongThatThoat,
    tong_vuot_dinh_muc: tongVuotDinhMuc,
    hop_le: results.length - tongThatThoat - tongVuotDinhMuc,
    chi_tiet: results
  };
};

const taoCanhBaoThatThoat = async ({ id_dn, id_sp, tu_ngay, den_ngay }) => {
  const result = await phatHienThatThoat({ id_dn, id_sp, tu_ngay, den_ngay });

  if (result.trang_thai === 'ThatThoat' || result.trang_thai === 'VuotDinhMuc') {
    const existing = await db.CanhBaoHeThong.findOne({
      where: {
        id_dn,
        loai_canh_bao: result.trang_thai === 'ThatThoat' ? 'TonAm' : 'VuotDinhMuc',
        bang_lien_quan: 'SanPham',
        id_ban_ghi: id_sp,
        trang_thai: { [Op.ne]: 'DaXuLy' }
      }
    });

    if (!existing) {
      await db.CanhBaoHeThong.create({
        id_dn,
        loai_canh_bao: result.trang_thai === 'ThatThoat' ? 'TonAm' : 'VuotDinhMuc',
        tieu_de: `Cảnh báo ${result.trang_thai === 'ThatThoat' ? 'thất thoát' : 'vượt định mức'} - ${result.ten_sp}`,
        noi_dung: result.canh_bao,
        muc_do: Math.abs(parseFloat(result.ty_le_chenh_lech)) > 20 ? 'Cao' : 'TrungBinh',
        bang_lien_quan: 'SanPham',
        id_ban_ghi: id_sp,
        trang_thai: 'ChuaXem'
      });
    }
  }

  return result;
};

module.exports = {
  phatHienThatThoat,
  phatHienTonKhoAm,
  getBaoCaoThatThoatTongHop,
  taoCanhBaoThatThoat
};
