'use strict';

const db = require('../models');
const DinhMucSanPham = db.DinhMucSanPham;
const NguyenPhuLieu = db.NguyenPhuLieu;
const SanPham = db.SanPham;
const DoanhNghiep = db.DoanhNghiep;

const createDinhMucSanPham = async ({ id_sp, dinh_muc_chi_tiet }, id_dn, role) => {
  if (!id_sp || !Array.isArray(dinh_muc_chi_tiet) || dinh_muc_chi_tiet.length === 0)
    throw new Error("Thiếu dữ liệu định mức");

  // Kiểm tra sản phẩm thuộc doanh nghiệp
  const whereClauseSP = role === 'Admin' ? { id_sp } : { id_sp, id_dn };
  const sp = await SanPham.findOne({ where: whereClauseSP });
  if (!sp) throw new Error("Sản phẩm không tồn tại hoặc bạn không có quyền truy cập");

  const records = [];
  for (const item of dinh_muc_chi_tiet) {
    const { id_nguyen_lieu, so_luong, ghi_chu } = item;

    // Kiểm tra nguyên liệu thuộc doanh nghiệp
    const whereClauseNPL = role === 'Admin' ? { id_npl: id_nguyen_lieu } : { id_npl: id_nguyen_lieu, id_dn };
    const nl = await NguyenPhuLieu.findOne({ where: whereClauseNPL });
    if (!nl) throw new Error(`Nguyên liệu ID=${id_nguyen_lieu} không tồn tại hoặc bạn không có quyền truy cập`);

    const created = await DinhMucSanPham.create({ id_sp, id_npl: id_nguyen_lieu, so_luong, ghi_chu });
    records.push(created);
  }

  return records;
};

const getAllDinhMuc = async (id_dn, role) => {
  if (role === 'Admin') {
    return await DinhMucSanPham.findAll({
      include: [
        { model: SanPham, as: 'sanPham', include: [{ model: DoanhNghiep, as: 'doanhNghiep' }] },
        { model: NguyenPhuLieu, as: 'nguyenPhuLieu' }
      ],
      order: [['id_dm', 'DESC']]
    });
  }

  // Lọc định mức theo sản phẩm của doanh nghiệp
  return await DinhMucSanPham.findAll({
    include: [
      {
        model: SanPham,
        as: 'sanPham',
        where: { id_dn },
        required: true,
        include: [{ model: DoanhNghiep, as: 'doanhNghiep' }]
      },
      { model: NguyenPhuLieu, as: 'nguyenPhuLieu' }
    ],
    order: [['id_dm', 'DESC']]
  });
};

const getDinhMucByProduct = async (id_sp, id_dn, role) => {
  // Kiểm tra sản phẩm thuộc doanh nghiệp
  const whereClauseSP = role === 'Admin' ? { id_sp } : { id_sp, id_dn };
  const sp = await SanPham.findOne({ where: whereClauseSP });
  if (!sp) throw new Error("Sản phẩm không tồn tại hoặc bạn không có quyền truy cập");

  return await DinhMucSanPham.findAll({
    where: { id_sp },
    include: [{ model: NguyenPhuLieu, as: 'nguyenPhuLieu' }]
  });
};

const deleteDinhMuc = async (id_dm, id_dn, role) => {
  let dm;

  if (role === 'Admin') {
    dm = await DinhMucSanPham.findByPk(id_dm);
  } else {
    // Kiểm tra định mức thuộc sản phẩm của doanh nghiệp
    dm = await DinhMucSanPham.findOne({
      where: { id_dm },
      include: [{
        model: SanPham,
        as: 'sanPham',
        where: { id_dn },
        required: true
      }]
    });
  }

  if (!dm) throw new Error("Không tìm thấy định mức hoặc bạn không có quyền truy cập");
  await dm.destroy();
};

// Lấy danh sách sản phẩm theo doanh nghiệp (để dropdown)
const getSanPhamByDN = async (id_dn, role) => {
  const whereClause = role === 'Admin' ? {} : { id_dn };
  return await SanPham.findAll({
    where: whereClause,
    attributes: ['id_sp', 'ten_sp'],
    order: [['ten_sp', 'ASC']]
  });
};

// Lấy danh sách nguyên liệu theo doanh nghiệp (để dropdown)
const getNguyenLieuByDN = async (id_dn, role) => {
  const whereClause = role === 'Admin' ? {} : { id_dn };
  return await NguyenPhuLieu.findAll({
    where: whereClause,
    attributes: ['id_npl', 'ten_npl'],
    order: [['ten_npl', 'ASC']]
  });
};

// Import định mức từ Excel (MỚI)
const importDinhMucFromExcel = async (id_dn, dataExcel) => {
  if (!dataExcel || !Array.isArray(dataExcel)) {
    throw new Error('Dữ liệu Excel không hợp lệ');
  }

  const errors = [];
  const success = [];

  for (const item of dataExcel) {
    const idSp = parseInt(item.id_sp) || item.id_sp;
    const idNpl = parseInt(item.id_npl) || item.id_npl;
    const soLuong = parseFloat(item.so_luong || item.soLuong);

    if (!idSp || !idNpl || !soLuong || soLuong <= 0) {
      errors.push({ item, error: 'Thiếu id_sp, id_npl hoặc so_luong không hợp lệ' });
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
      success.push({ id_sp: idSp, id_npl: idNpl, action: 'updated', so_luong: soLuong });
    } else {
      await DinhMucSanPham.create({ id_sp: idSp, id_npl: idNpl, so_luong: soLuong });
      success.push({ id_sp: idSp, id_npl: idNpl, action: 'created', so_luong: soLuong });
    }
  }

  return { success, errors, thanh_cong: success.length, that_bai: errors.length };
};

// Lấy mẫu Excel định mức (MỚI)
const getTemplateDinhMuc = () => {
  return {
    ten_mau: 'Mẫu định mức nguyên vật liệu cho sản phẩm',
    cac_cot: [
      { ten: 'id_sp', mo_ta: 'ID sản phẩm (bắt buộc)', vi_du: '1' },
      { ten: 'id_npl', mo_ta: 'ID nguyên phụ liệu (bắt buộc)', vi_du: '5' },
      { ten: 'so_luong', mo_ta: 'Định mức sử dụng (bắt buộc)', vi_du: '1.5' }
    ],
    vi_du_data: [
      { id_sp: 1, id_npl: 5, so_luong: 1.5 },
      { id_sp: 1, id_npl: 10, so_luong: 20 },
      { id_sp: 2, id_npl: 5, so_luong: 2.0 }
    ]
  };
};

module.exports = {
  createDinhMucSanPham,
  getAllDinhMuc,
  getDinhMucByProduct,
  deleteDinhMuc,
  getSanPhamByDN,
  getNguyenLieuByDN,
  importDinhMucFromExcel,
  getTemplateDinhMuc
};
