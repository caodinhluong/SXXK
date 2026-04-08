'use strict';
const db = require('../models');
const XuatKhoSP = db.XuatKhoSP;
const XuatKhoSPChiTiet = db.XuatKhoSPChiTiet;
const Kho = db.Kho;
const SanPham = db.SanPham;
const HoaDonXuat = db.HoaDonXuat;
const TonKhoSP = db.TonKhoSP;

// const createXuatSP = async ({ id_kho, id_hd_xuat, ngay_xuat, file_phieu }) => {
//   if (!id_kho || !ngay_xuat) throw new Error('Thiếu dữ liệu bắt buộc (id_kho, ngay_xuat)');
//   const kho = await Kho.findByPk(id_kho);
//   if (!kho) throw new Error(`Không tìm thấy kho ID=${id_kho}`);
//   if (id_hd_xuat) {
//     const hd = await HoaDonXuat.findByPk(id_hd_xuat);
//     if (!hd) throw new Error(`Không tìm thấy hóa đơn xuất ID=${id_hd_xuat}`);
//   }
//   const created = await XuatKhoSP.create({ id_kho, id_hd_xuat, ngay_xuat, file_phieu });
//   return created;
// };
const createXuatSP = async ({ id_kho, ngay_xuat, ca_kip, file_phieu, chi_tiets }) => {
  if (!id_kho || !ngay_xuat) throw new Error('Thiếu dữ liệu bắt buộc (id_kho, ngay_xuat)');
  if (!Array.isArray(chi_tiets) || chi_tiets.length === 0)
    throw new Error('Danh sách chi tiết xuất kho không hợp lệ');

  const kho = await Kho.findByPk(id_kho);
  if (!kho) throw new Error(`Không tìm thấy kho ID=${id_kho}`);

  const t = await db.sequelize.transaction();

  try {
    const phieu = await XuatKhoSP.create({ id_kho, ngay_xuat, ca_kip, file_phieu }, { transaction: t });

    for (const ct of chi_tiets) {
      const { id_sp, so_luong } = ct;
      if (!id_sp || !so_luong) throw new Error('Thiếu id_sp hoặc so_luong');

      const sp = await SanPham.findByPk(id_sp, { transaction: t });
      if (!sp) throw new Error(`Không tìm thấy SP ID=${id_sp}`);

      const tonKho = await TonKhoSP.findOne({ where: { id_kho, id_sp }, transaction: t });
      if (!tonKho)
        throw new Error(`Kho ID=${id_kho} chưa có tồn kho cho SP ID=${id_sp}`);

      if (tonKho.so_luong_ton < so_luong)
        throw new Error(`SP ID=${id_sp} không đủ tồn kho. Hiện có ${tonKho.so_luong_ton}`);

      await XuatKhoSPChiTiet.create(
        { id_xuat: phieu.id_xuat, id_sp, so_luong },
        { transaction: t }
      );

      await tonKho.decrement('so_luong_ton', { by: so_luong, transaction: t });
    }

    await t.commit();

    return await XuatKhoSP.findByPk(phieu.id_xuat, {
      include: [
        { model: XuatKhoSPChiTiet, as: 'chiTiets' },
        { model: Kho, as: 'kho' }
      ]
    });
  } catch (err) {
    if (!t.finished) await t.rollback();
    throw err;
  }
};

const getAllXuatSP = async (id_dn) => {
  return await XuatKhoSP.findAll({
    include: [
      { 
        model: Kho, 
        as: 'kho',
        where: { id_dn },
        required: true
      },
      { model: HoaDonXuat, as: 'hoaDonXuat' },
      { model: XuatKhoSPChiTiet, as: 'chiTiets', include: [{ model: SanPham, as: 'sanPham' }] }
    ],
    order: [['id_xuat', 'DESC']]
  });
};

const getXuatSPById = async (id_xuat) => {
  const rec = await XuatKhoSP.findByPk(id_xuat, {
    include: [
      { model: Kho, as: 'kho' },
      { model: HoaDonXuat, as: 'hoaDonXuat' },
      { model: XuatKhoSPChiTiet, as: 'chiTiets', include: [{ model: SanPham, as: 'sanPham' }] }
    ]
  });
  if (!rec) throw new Error(`Không tìm thấy phiếu xuất SP ID=${id_xuat}`);
  return rec;
};

const updateXuatSP = async (id_xuat, data) => {
  const { id_kho, ngay_xuat, ca_kip, file_phieu, chi_tiets } = data;
  
  const rec = await XuatKhoSP.findByPk(id_xuat, {
    include: [{ model: XuatKhoSPChiTiet, as: 'chiTiets' }]
  });
  if (!rec) throw new Error(`Không tìm thấy phiếu xuất SP ID=${id_xuat}`);

  const t = await db.sequelize.transaction();

  try {
    // Hoàn trả tồn kho cũ (cộng lại vì đã trừ khi xuất)
    const oldChiTiets = rec.chiTiets || [];
    for (const oldCt of oldChiTiets) {
      const tonKho = await TonKhoSP.findOne({ 
        where: { id_kho: rec.id_kho, id_sp: oldCt.id_sp }, 
        transaction: t 
      });
      if (tonKho) {
        await tonKho.increment('so_luong_ton', { by: oldCt.so_luong, transaction: t });
      }
    }

    // Cập nhật thông tin phiếu xuất
    await rec.update({ id_kho, ngay_xuat, ca_kip, file_phieu }, { transaction: t });

    // Xóa chi tiết cũ
    await XuatKhoSPChiTiet.destroy({ where: { id_xuat }, transaction: t });

    // Thêm chi tiết mới và cập nhật tồn kho
    if (Array.isArray(chi_tiets)) {
      const id_kho_new = id_kho || rec.id_kho;
      
      for (const ct of chi_tiets) {
        const { id_sp, so_luong } = ct;
        if (!id_sp || !so_luong) continue;

        const sp = await SanPham.findByPk(id_sp, { transaction: t });
        if (!sp) throw new Error(`Không tìm thấy SP ID=${id_sp}`);

        // Kiểm tra tồn kho
        const tonKho = await TonKhoSP.findOne({ 
          where: { id_kho: id_kho_new, id_sp }, 
          transaction: t 
        });
        if (!tonKho) throw new Error(`Kho ID=${id_kho_new} chưa có tồn kho cho SP ID=${id_sp}`);
        if (tonKho.so_luong_ton < so_luong) 
          throw new Error(`SP ID=${id_sp} không đủ tồn kho. Hiện có ${tonKho.so_luong_ton}`);

        await XuatKhoSPChiTiet.create(
          { id_xuat, id_sp, so_luong },
          { transaction: t }
        );

        // Trừ tồn kho
        await tonKho.decrement('so_luong_ton', { by: so_luong, transaction: t });
      }
    }

    await t.commit();

    return await XuatKhoSP.findByPk(id_xuat, {
      include: [
        { model: XuatKhoSPChiTiet, as: 'chiTiets' },
        { model: Kho, as: 'kho' }
      ]
    });
  } catch (err) {
    if (!t.finished) await t.rollback();
    throw err;
  }
};

const deleteXuatSP = async (id_xuat) => {
  const rec = await XuatKhoSP.findByPk(id_xuat);
  if (!rec) throw new Error(`Không tìm thấy phiếu xuất SP ID=${id_xuat}`);
  await XuatKhoSPChiTiet.destroy({ where: { id_xuat } });
  await rec.destroy();
};

// chi tiết
const addChiTiet = async ({ id_xuat, id_sp, so_luong }) => {
  if (!id_xuat || !id_sp || so_luong == null) throw new Error('Thiếu dữ liệu chi tiết (id_xuat, id_sp, so_luong)');
  const phieu = await XuatKhoSP.findByPk(id_xuat);
  if (!phieu) throw new Error(`Không tìm thấy phiếu xuất ID=${id_xuat}`);
  const sp = await SanPham.findByPk(id_sp);
  if (!sp) throw new Error(`Không tìm thấy sản phẩm ID=${id_sp}`);

  return await XuatKhoSPChiTiet.create({ id_xuat, id_sp, so_luong });
};

const getChiTietByPhieu = async (id_xuat) => {
  return await XuatKhoSPChiTiet.findAll({
    where: { id_xuat },
    include: [{ model: SanPham, as: 'sanPham' }]
  });
};

const deleteChiTiet = async (id_ct) => {
  const ct = await XuatKhoSPChiTiet.findByPk(id_ct);
  if (!ct) throw new Error(`Không tìm thấy chi tiết ID=${id_ct}`);
  await ct.destroy();
};

module.exports = {
  createXuatSP, getAllXuatSP, getXuatSPById, updateXuatSP, deleteXuatSP,
  addChiTiet, getChiTietByPhieu, deleteChiTiet
};
