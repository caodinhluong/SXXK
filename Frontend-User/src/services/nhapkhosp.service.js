import { createApiInstance } from "./apiConfig";
import { formatServiceError, logError } from "../utils/errorHandler";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/nhapkho-sp`;

const api = createApiInstance(API_BASE_URL);

/* ============================================================
   🟢 LẤY TẤT CẢ PHIẾU NHẬP SẢN PHẨM
============================================================ */
export const getAllNhapKhoSP = async () => {
    try {
        const res = await api.get("/");
        // Backend returns { success: true, data: [...] }
        return res.data?.data || res.data || [];
    } catch (err) {
        logError("getAllNhapKhoSP", err);
        throw formatServiceError(err, "Lỗi khi lấy danh sách phiếu nhập SP");
    }
};

/* ============================================================
   🟢 LẤY CHI TIẾT PHIẾU NHẬP THEO ID
============================================================ */
export const getNhapKhoSPById = async (id_nhap) => {
    try {
        const res = await api.get(`/${id_nhap}`);
        // Backend returns { success: true, data: {...} }
        return res.data?.data || res.data;
    } catch (err) {
        logError("getNhapKhoSPById", err);
        throw formatServiceError(err, "Lỗi khi lấy chi tiết phiếu nhập SP");
    }
};

/* ============================================================
   🟢 TẠO MỚI PHIẾU NHẬP SẢN PHẨM
   Payload structure:
   {
     id_kho: number (required),
     id_phieu_sx: number (required),
     ngay_nhap: date (required),
     file_phieu: string (optional),
     chi_tiets: [
       {
         id_sp: number (required),
         so_luong_nhap: number (required) // NOTE: Use 'so_luong_nhap', not 'so_luong'
       }
     ]
   }
============================================================ */
export const createNhapKhoSP = async (payload) => {
    try {
        const res = await api.post("/", payload);
        // Backend returns { success: true, message, data }
        return res.data;
    } catch (err) {
        logError("createNhapKhoSP", err);
        throw formatServiceError(err, "Lỗi khi tạo phiếu nhập SP");
    }
};

/* ============================================================
   🟢 CẬP NHẬT PHIẾU NHẬP SẢN PHẨM
   Payload structure:
   {
     id_kho: number (optional),
     id_phieu_sx: number (optional),
     ngay_nhap: date (optional),
     file_phieu: string (optional),
     chi_tiets: [
       {
         id_sp: number (required),
         so_luong_nhap: number (required) // NOTE: Use 'so_luong_nhap', not 'so_luong'
       }
     ]
   }
============================================================ */
export const updateNhapKhoSP = async (id_nhap, payload) => {
    try {
        const res = await api.put(`/${id_nhap}`, payload);
        // Backend returns { success: true, message, data }
        return res.data;
    } catch (err) {
        logError("updateNhapKhoSP", err);
        throw formatServiceError(err, "Lỗi khi cập nhật phiếu nhập SP");
    }
};

/* ============================================================
   🟢 XÓA PHIẾU NHẬP SẢN PHẨM
============================================================ */
export const deleteNhapKhoSP = async (id_nhap) => {
    try {
        const res = await api.delete(`/${id_nhap}`);
        // Backend returns { success: true, message }
        return res.data;
    } catch (err) {
        logError("deleteNhapKhoSP", err);
        throw formatServiceError(err, "Lỗi khi xóa phiếu nhập SP");
    }
};

/* ============================================================
   🟢 THÊM CHI TIẾT PHIẾU NHẬP SẢN PHẨM
   body yêu cầu: { id_nhap, id_sp, so_luong_nhap }
   NOTE: Backend expects 'so_luong_nhap' field, not 'so_luong'
============================================================ */
export const addChiTietNhapKhoSP = async (id_nhap, payload) => {
    try {
        const res = await api.post(`/${id_nhap}/chi-tiet`, payload);
        // Backend returns { success: true, data }
        return res.data?.data || res.data;
    } catch (err) {
        logError("addChiTietNhapKhoSP", err);
        throw formatServiceError(err, "Lỗi khi thêm chi tiết phiếu nhập SP");
    }
};

/* ============================================================
   🟢 LẤY DANH SÁCH CHI TIẾT CỦA MỘT PHIẾU NHẬP
============================================================ */
export const getChiTietByPhieuNhapSP = async (id_nhap) => {
    try {
        const res = await api.get(`/${id_nhap}/chi-tiet`);
        // Backend returns { success: true, data: [...] }
        return res.data?.data || res.data || [];
    } catch (err) {
        logError("getChiTietByPhieuNhapSP", err);
        throw formatServiceError(err, "Lỗi khi lấy chi tiết phiếu nhập SP");
    }
};

/* ============================================================
   🟢 XÓA MỘT CHI TIẾT PHIẾU NHẬP
============================================================ */
export const deleteChiTietNhapKhoSP = async (id_ct) => {
    try {
        const res = await api.delete(`/chi-tiet/${id_ct}`);
        // Backend returns { success: true, message }
        return res.data;
    } catch (err) {
        logError("deleteChiTietNhapKhoSP", err);
        throw formatServiceError(err, "Lỗi khi xóa chi tiết phiếu nhập SP");
    }
};

export default {
    getAllNhapKhoSP,
    getNhapKhoSPById,
    createNhapKhoSP,
    updateNhapKhoSP,
    deleteNhapKhoSP,
    addChiTietNhapKhoSP,
    getChiTietByPhieuNhapSP,
    deleteChiTietNhapKhoSP,
};
