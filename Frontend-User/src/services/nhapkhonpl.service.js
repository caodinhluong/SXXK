import { createApiInstance } from "./apiConfig";
import { formatServiceError, logError } from "../utils/errorHandler";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/nhapkho-npl`;

const api = createApiInstance(API_BASE_URL);

/* ============================================================
   🟢 LẤY TẤT CẢ PHIẾU NHẬP NPL
============================================================ */
export const getAllNhapKhoNPL = async () => {
    try {
        const res = await api.get("/");
        // Backend trả về { success: true, data: [...] }
        return res.data?.data || res.data || [];
    } catch (err) {
        logError("getAllNhapKhoNPL", err);
        throw formatServiceError(err, "Lỗi khi lấy danh sách phiếu nhập NPL");
    }
};

/* ============================================================
   🟢 LẤY CHI TIẾT PHIẾU NHẬP THEO ID
============================================================ */
export const getNhapKhoNPLById = async (id_nhap) => {
    try {
        const res = await api.get(`/${id_nhap}`);
        // Backend returns { success: true, data: {...} }
        return res.data?.data || res.data;
    } catch (err) {
        logError("getNhapKhoNPLById", err);
        throw formatServiceError(err, "Lỗi khi lấy chi tiết phiếu nhập NPL");
    }
};

/* ============================================================
   🟢 TẠO MỚI PHIẾU NHẬP NPL
   Payload structure:
   {
     id_kho: number (required),
     id_hd_nhap: number (required),
     ngay_nhap: date (required),
     file_phieu: string (optional),
     chi_tiets: [
       {
         id_npl: number (required),
         so_luong_nhap: number (required) // NOTE: Use 'so_luong_nhap', not 'so_luong'
       }
     ]
   }
============================================================ */
export const createNhapKhoNPL = async (payload) => {
    try {
        const res = await api.post("/", payload);
        // Backend returns { success: true, message, data }
        return res.data;
    } catch (err) {
        logError("createNhapKhoNPL", err);
        throw formatServiceError(err, "Lỗi khi tạo phiếu nhập NPL");
    }
};

/* ============================================================
   🟢 CẬP NHẬT PHIẾU NHẬP NPL
   Payload structure:
   {
     id_kho: number (optional),
     id_hd_nhap: number (optional),
     ngay_nhap: date (optional),
     file_phieu: string (optional),
     chi_tiets: [
       {
         id_npl: number (required),
         so_luong_nhap: number (required) // NOTE: Use 'so_luong_nhap', not 'so_luong'
       }
     ]
   }
============================================================ */
export const updateNhapKhoNPL = async (id_nhap, payload) => {
    try {
        const res = await api.put(`/${id_nhap}`, payload);
        // Backend returns { success: true, message, data }
        return res.data;
    } catch (err) {
        logError("updateNhapKhoNPL", err);
        throw formatServiceError(err, "Lỗi khi cập nhật phiếu nhập NPL");
    }
};

/* ============================================================
   🟢 XÓA PHIẾU NHẬP NPL
============================================================ */
export const deleteNhapKhoNPL = async (id_nhap) => {
    try {
        const res = await api.delete(`/${id_nhap}`);
        // Backend returns { success: true, message }
        return res.data;
    } catch (err) {
        logError("deleteNhapKhoNPL", err);
        throw formatServiceError(err, "Lỗi khi xóa phiếu nhập NPL");
    }
};

/* ============================================================
   🟢 THÊM CHI TIẾT PHIẾU NHẬP NPL
   body yêu cầu: { id_nhap, id_npl, so_luong_nhap }
   NOTE: Backend expects 'so_luong_nhap' field, not 'so_luong'
============================================================ */
export const addChiTietNhapKhoNPL = async (id_nhap, payload) => {
    try {
        const res = await api.post(`/${id_nhap}/chi-tiet`, payload);
        // Backend returns { success: true, data }
        return res.data?.data || res.data;
    } catch (err) {
        logError("addChiTietNhapKhoNPL", err);
        throw formatServiceError(err, "Lỗi khi thêm chi tiết phiếu nhập NPL");
    }
};

/* ============================================================
   🟢 LẤY DANH SÁCH CHI TIẾT CỦA MỘT PHIẾU NHẬP
============================================================ */
export const getChiTietByPhieuNhap = async (id_nhap) => {
    try {
        const res = await api.get(`/${id_nhap}/chi-tiet`);
        // Backend returns { success: true, data: [...] }
        return res.data?.data || res.data || [];
    } catch (err) {
        logError("getChiTietByPhieuNhap", err);
        throw formatServiceError(err, "Lỗi khi lấy chi tiết phiếu nhập NPL");
    }
};

/* ============================================================
   🟢 XÓA MỘT CHI TIẾT PHIẾU NHẬP
============================================================ */
export const deleteChiTietNhapKhoNPL = async (id_ct) => {
    try {
        const res = await api.delete(`/chi-tiet/${id_ct}`);
        // Backend returns { success: true, message }
        return res.data;
    } catch (err) {
        logError("deleteChiTietNhapKhoNPL", err);
        throw formatServiceError(err, "Lỗi khi xóa chi tiết phiếu nhập NPL");
    }
};

/* ============================================================
   🟢 LẤY SỐ LƯỢNG NPL CÓ THỂ NHẬP THEO HÓA ĐƠN NHẬP
   Trả về: [{ id_npl, ten_npl, so_luong_hd, da_nhap, co_the_nhap }]
============================================================ */
export const getSoLuongCoTheNhap = async (id_hd_nhap) => {
    try {
        const res = await api.get(`/so-luong-co-the-nhap/${id_hd_nhap}`);
        return res.data?.data || []; // { success, data }
    } catch (err) {
        logError("getSoLuongCoTheNhap", err);
        throw formatServiceError(err, "Lỗi khi lấy số lượng có thể nhập");
    }
};

// Alias exports for compatibility
export const getAll = getAllNhapKhoNPL;
export const getById = getNhapKhoNPLById;
export const create = createNhapKhoNPL;
export const update = updateNhapKhoNPL;
export const remove = deleteNhapKhoNPL;

export default {
    getAllNhapKhoNPL,
    getNhapKhoNPLById,
    createNhapKhoNPL,
    updateNhapKhoNPL,
    deleteNhapKhoNPL,
    addChiTietNhapKhoNPL,
    getChiTietByPhieuNhap,
    deleteChiTietNhapKhoNPL,
    getSoLuongCoTheNhap,
    // Aliases
    getAll: getAllNhapKhoNPL,
    getById: getNhapKhoNPLById,
    create: createNhapKhoNPL,
    update: updateNhapKhoNPL,
    remove: deleteNhapKhoNPL,
};
