'use strict';

const db = require('../models');
const { Op } = require('sequelize');

const DinhMucSanPham = db.DinhMucSanPham;
const SanPham = db.SanPham;
const NguyenPhuLieu = db.NguyenPhuLieu;

const getTemplateDinhMuc = () => {
  return {
    ten_mau: 'Mẫu định mức nguyên vật liệu cho sản phẩm',
    huong_dan: [
      'Cột id_sp: ID sản phẩm trong hệ thống (bắt buộc)',
      'Cột id_npl: ID nguyên phụ liệu trong hệ thống (bắt buộc)',
      'Cột so_luong: Định mức sử dụng (số lượng NPL cho 1 đơn vị SP)',
      'Cột don_vi_tinh: Đơn vị tính (tùy chọn)'
    ],
    cac_cot: [
      { ten: 'id_sp', mo_ta: 'ID sản phẩm', bat_buoc: true, vi_du: '1' },
      { ten: 'ten_sp', mo_ta: 'Tên sản phẩm (để tham khảo)', bat_buoc: false, vi_du: 'Sản phẩm A' },
      { ten: 'id_npl', mo_ta: 'ID nguyên phụ liệu', bat_buoc: true, vi_du: '5' },
      { ten: 'ten_npl', mo_ta: 'Tên NPL (để tham khảo)', bat_buoc: false, vi_du: 'Nguyên liệu X' },
      { ten: 'so_luong', mo_ta: 'Định mức', bat_buoc: true, vi_du: '1.5' },
      { ten: 'don_vi_tinh', mo_ta: 'Đơn vị tính', bat_buoc: false, vi_du: 'kg' }
    ],
    vi_du_data: [
      { id_sp: 1, ten_sp: 'Sản phẩm A', id_npl: 5, ten_npl: 'Vải Cotton', so_luong: 1.5, don_vi_tinh: 'm' },
      { id_sp: 1, ten_sp: 'Sản phẩm A', id_npl: 10, ten_npl: 'Chỉ may', so_luong: 20, don_vi_tinh: 'cuộn' },
      { id_sp: 2, ten_sp: 'Sản phẩm B', id_npl: 5, ten_npl: 'Vải Cotton', so_luong: 2.0, don_vi_tinh: 'm' }
    ]
  };
};

const importDinhMucFromArray = async (id_dn, items) => {
  const errors = [];
  const success = [];
  const warnings = [];

  for (const item of items) {
    const idSp = parseInt(item.id_sp) || item.id_sp;
    const idNpl = parseInt(item.id_npl) || item.id_npl;
    const soLuong = parseFloat(item.so_luong || item.soLuong);

    if (!idSp) {
      errors.push({ item, error: 'Thiếu id_sp' });
      continue;
    }
    if (!idNpl) {
      errors.push({ item, error: 'Thiếu id_npl' });
      continue;
    }
    if (!soLuong || soLuong <= 0) {
      errors.push({ item, error: 'so_luong phải lớn hơn 0' });
      continue;
    }

    const sp = await SanPham.findOne({ where: { id_sp: idSp, id_dn } });
    if (!sp) {
      errors.push({ item, error: `Không tìm thấy sản phẩm id_sp=${idSp}` });
      continue;
    }

    const npl = await NguyenPhuLieu.findOne({ where: { id_npl: idNpl, id_dn } });
    if (!npl) {
      errors.push({ item, error: `Không tìm thấy NPL id_npl=${idNpl}` });
      continue;
    }

    const existing = await DinhMucSanPham.findOne({
      where: { id_sp: idSp, id_npl: idNpl }
    });

    if (existing) {
      existing.so_luong = soLuong;
      await existing.save();
      success.push({
        id_sp: idSp,
        id_npl: idNpl,
        action: 'updated',
        so_luong: soLuong
      });
    } else {
      await DinhMucSanPham.create({
        id_sp: idSp,
        id_npl: idNpl,
        so_luong: soLuong
      });
      success.push({
        id_sp: idSp,
        id_npl: idNpl,
        action: 'created',
        so_luong: soLuong
      });
    }
  }

  return {
    success,
    errors,
    warnings,
    tong: items.length,
    thanh_cong: success.length,
    that_bai: errors.length
  };
};

const importDinhMucFromExcel = async (id_dn, dataExcel) => {
  if (!dataExcel || !Array.isArray(dataExcel)) {
    throw new Error('Dữ liệu Excel không hợp lệ');
  }

  return await importDinhMucFromArray(id_dn, dataExcel);
};

const getDanhSachDinhMuc = async (id_dn, id_sp) => {
  const where = { };
  if (id_sp) {
    where.id_sp = id_sp;
  }

  const spList = await SanPham.findAll({
    where: { id_dn },
    attributes: ['id_sp', 'ten_sp', 'ma_sp']
  });

  const results = [];
  for (const sp of spList) {
    const dmList = await DinhMucSanPham.findAll({
      where: { id_sp: sp.id_sp },
      include: [{ 
        model: NguyenPhuLieu, 
        as: 'nguyenPhuLieu',
        where: { id_dn },
        attributes: ['id_npl', 'ten_npl', 'ma_phan_loai']
      }]
    });

    if (dmList.length > 0) {
      results.push({
        id_sp: sp.id_sp,
        ten_sp: sp.ten_sp,
        ma_sp: sp.ma_sp,
        so_luong_dinh_muc: dmList.length,
        dinh_muc: dmList.map(dm => ({
          id_npl: dm.id_npl,
          ten_npl: dm.nguyenPhuLieu?.ten_npl,
          ma_npl: dm.nguyenPhuLieu?.ma_phan_loai,
          so_luong: dm.so_luong
        }))
      });
    }
  }

  return results;
};

const xoaDinhMuc = async (id_dm) => {
  const dm = await DinhMucSanPham.findByPk(id_dm);
  if (!dm) {
    throw new Error('Không tìm thấy định mức');
  }

  await dm.destroy();
  return { message: 'Đã xóa định mức thành công' };
};

const xoaTatCaDinhMucSP = async (id_sp) => {
  const result = await DinhMucSanPham.destroy({
    where: { id_sp }
  });

  return { message: `Đã xóa ${result} định mức cho sản phẩm id_sp=${id_sp}` };
};

module.exports = {
  getTemplateDinhMuc,
  importDinhMucFromArray,
  importDinhMucFromExcel,
  getDanhSachDinhMuc,
  xoaDinhMuc,
  xoaTatCaDinhMucSP
};
