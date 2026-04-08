import { createApiInstance } from "./apiConfig";
import { formatServiceError, logError } from "../utils/errorHandler";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/van-don-nhap`;

const api = createApiInstance(API_BASE_URL);

/* ============================================================
   🟢 LẤY DANH SÁCH TẤT CẢ VẬN ĐƠN NHẬP
============================================================ */
export const getAllVanDonNhap = async () => {
    try {
        const res = await api.get("/");
        // Backend returns { success: true, data: [...] }
        return res.data?.data || res.data || [];
    } catch (err) {
        logError("getAllVanDonNhap", err);
        throw formatServiceError(err, "Lỗi khi lấy danh sách vận đơn nhập");
    }
};

/* ============================================================
   🟢 LẤY CHI TIẾT VẬN ĐƠN NHẬP THEO ID
============================================================ */
export const getVanDonNhapById = async (id_vd) => {
    try {
        const res = await api.get(`/${id_vd}`);
        // Backend returns { success: true, data: {...} }
        return res.data?.data || res.data;
    } catch (err) {
        logError("getVanDonNhapById", err);
        throw formatServiceError(err, "Lỗi khi lấy chi tiết vận đơn nhập");
    }
};

/* ============================================================
   🟢 TẠO MỚI VẬN ĐƠN NHẬP
============================================================ */
export const createVanDonNhap = async (payload) => {
    try {
        const res = await api.post("/", payload);
        // Backend returns { success: true, message, data }
        return res.data;
    } catch (err) {
        logError("createVanDonNhap", err);
        throw formatServiceError(err, "Lỗi khi tạo vận đơn nhập");
    }
};

/* ============================================================
   🟢 CẬP NHẬT VẬN ĐƠN NHẬP
============================================================ */
export const updateVanDonNhap = async (id_vd, payload) => {
    try {
        const res = await api.put(`/${id_vd}`, payload);
        // Backend returns { success: true, message, data }
        return res.data;
    } catch (err) {
        logError("updateVanDonNhap", err);
        throw formatServiceError(err, "Lỗi khi cập nhật vận đơn nhập");
    }
};

/* ============================================================
   🟢 XÓA VẬN ĐƠN NHẬP
============================================================ */
export const deleteVanDonNhap = async (id_vd) => {
    try {
        const res = await api.delete(`/${id_vd}`);
        // Backend returns { success: true, message }
        return res.data;
    } catch (err) {
        logError("deleteVanDonNhap", err);
        throw formatServiceError(err, "Lỗi khi xóa vận đơn nhập");
    }
};

export default {
    getAllVanDonNhap,
    getVanDonNhapById,
    createVanDonNhap,
    updateVanDonNhap,
    deleteVanDonNhap,
};
