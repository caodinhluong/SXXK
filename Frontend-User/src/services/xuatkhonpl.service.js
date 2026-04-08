import { createApiInstance } from "./apiConfig";
import { formatServiceError, logError } from "../utils/errorHandler";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/xuatkho-npl`;

const api = createApiInstance(API_BASE_URL);

/* ============================================================
   🟢 LẤY TẤT CẢ PHIẾU XUẤT KHO NPL
============================================================ */
export const getAllXuatKhoNPL = async () => {
    try {
        const res = await api.get("/");
        // Backend returns { success: true, data: [...] }
        return res.data?.data || res.data || [];
    } catch (err) {
        logError("getAllXuatKhoNPL", err);
        throw formatServiceError(err, "Lỗi khi lấy danh sách phiếu xuất NPL");
    }
};

/* ============================================================
   🟢 LẤY CHI TIẾT PHIẾU XUẤT THEO ID
============================================================ */
export const getXuatKhoNPLById = async (id_xuat) => {
    try {
        const res = await api.get(`/${id_xuat}`);
        // Backend returns { success: true, data: {...} }
        return res.data?.data || res.data;
    } catch (err) {
        logError("getXuatKhoNPLById", err);
        throw formatServiceError(err, "Lỗi khi lấy chi tiết phiếu xuất NPL");
    }
};

/* ============================================================
   🟢 TẠO MỚI PHIẾU XUẤT NPL
   Payload structure:
   {
     id_kho: number (required),
     ngay_xuat: date (required),
     ca_kip: string (optional) - Ca kíp làm việc,
     file_phieu: string (optional),
     chi_tiets: [
       {
         id_npl: number (required),
         so_luong: number (required)
       }
     ]
   }
============================================================ */
export const createXuatKhoNPL = async (payload) => {
    try {
        const res = await api.post("/", payload);
        // Backend returns { success: true, message, data }
        return res.data;
    } catch (err) {
        logError("createXuatKhoNPL", err);
        throw formatServiceError(err, "Lỗi khi tạo phiếu xuất NPL");
    }
};

/* ============================================================
   🟢 CẬP NHẬT PHIẾU XUẤT NPL
   Payload structure:
   {
     id_kho: number (optional),
     ngay_xuat: date (optional),
     ca_kip: string (optional) - Ca kíp làm việc,
     file_phieu: string (optional),
     chi_tiets: [
       {
         id_npl: number (required),
         so_luong: number (required)
       }
     ]
   }
============================================================ */
export const updateXuatKhoNPL = async (id_xuat, payload) => {
    try {
        const res = await api.put(`/${id_xuat}`, payload);
        // Backend returns { success: true, message, data }
        return res.data;
    } catch (err) {
        logError("updateXuatKhoNPL", err);
        throw formatServiceError(err, "Lỗi khi cập nhật phiếu xuất NPL");
    }
};

/* ============================================================
   🟢 XÓA PHIẾU XUẤT NPL
============================================================ */
export const deleteXuatKhoNPL = async (id_xuat) => {
    try {
        const res = await api.delete(`/${id_xuat}`);
        // Backend returns { success: true, message }
        return res.data;
    } catch (err) {
        logError("deleteXuatKhoNPL", err);
        throw formatServiceError(err, "Lỗi khi xóa phiếu xuất NPL");
    }
};

/* ============================================================
   🟢 THÊM CHI TIẾT PHIẾU XUẤT
   backend yêu cầu: { id_xuat, id_npl, so_luong }
============================================================ */
export const addChiTietXuatKhoNPL = async (id_xuat, payload) => {
    try {
        // 👇 backend cần cả id_xuat trong body
        const data = { id_xuat, ...payload };
        const res = await api.post(`/${id_xuat}/chi-tiet`, data);
        // Backend returns { success: true, data }
        return res.data?.data || res.data;
    } catch (err) {
        logError("addChiTietXuatKhoNPL", err);
        throw formatServiceError(err, "Lỗi khi thêm chi tiết phiếu xuất NPL");
    }
};

/* ============================================================
   🟢 LẤY DANH SÁCH CHI TIẾT CỦA MỘT PHIẾU XUẤT
============================================================ */
export const getChiTietByPhieuXuat = async (id_xuat) => {
    try {
        const res = await api.get(`/${id_xuat}/chi-tiet`);
        // Backend returns { success: true, data: [...] }
        return res.data?.data || res.data || [];
    } catch (err) {
        logError("getChiTietByPhieuXuat", err);
        throw formatServiceError(err, "Lỗi khi lấy chi tiết phiếu xuất NPL");
    }
};

/* ============================================================
   🟢 XÓA MỘT CHI TIẾT PHIẾU XUẤT
============================================================ */
export const deleteChiTietXuatKhoNPL = async (id_ct) => {
    try {
        const res = await api.delete(`/chi-tiet/${id_ct}`);
        // Backend returns { success: true, message }
        return res.data;
    } catch (err) {
        logError("deleteChiTietXuatKhoNPL", err);
        throw formatServiceError(err, "Lỗi khi xóa chi tiết phiếu xuất NPL");
    }
};

export default {
    getAllXuatKhoNPL,
    getXuatKhoNPLById,
    createXuatKhoNPL,
    updateXuatKhoNPL,
    deleteXuatKhoNPL,
    addChiTiet: addChiTietXuatKhoNPL, // Alias for consistency with design doc
    addChiTietXuatKhoNPL,
    getChiTietByPhieuXuat,
    deleteChiTietXuatKhoNPL,
};
