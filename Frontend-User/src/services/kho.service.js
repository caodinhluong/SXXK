import { createApiInstance } from "./apiConfig";
import { formatServiceError, logError } from "../utils/errorHandler";

// 🔹 Base URL cho API kho
const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/kho`;

// 🔹 Tạo instance axios với interceptors
const api = createApiInstance(API_BASE_URL);

// =======================
// 📦 Các hàm CRUD cho Kho
// =======================

// 🟢 Tạo kho mới
// Payload structure:
// {
//   ten_kho: string (required) - Tên kho,
//   ma_kho: string (optional) - Mã kho,
//   loai_kho: string (optional) - Loại kho,
//   dia_chi: string (optional) - Địa chỉ,
//   id_dn: number (optional) - Doanh nghiệp ID (auto-filled from auth)
// }
export const createKho = async (data) => {
    try {
        const res = await api.post("/", data);
        // Backend returns { message, data }
        return res.data;
    } catch (err) {
        logError("createKho", err);
        throw formatServiceError(err, "Lỗi khi tạo kho");
    }
};

// 🟡 Lấy danh sách tất cả kho
export const getAllKho = async () => {
    try {
        const res = await api.get("/");
        // Backend trả về { success: true, data: [...] }
        const data = res.data?.data || res.data || [];
        return { data: Array.isArray(data) ? data : [] };
    } catch (err) {
        logError("getAllKho", err);
        throw formatServiceError(err, "Lỗi khi lấy danh sách kho");
    }
};

// 🔵 Lấy chi tiết kho theo ID
export const getKhoById = async (id_kho) => {
    try {
        const res = await api.get(`/${id_kho}`);
        // Backend returns { success: true, data: {...} }
        return res.data?.data || res.data;
    } catch (err) {
        logError("getKhoById", err);
        throw formatServiceError(err, "Lỗi khi lấy chi tiết kho");
    }
};

// 🟣 Cập nhật kho
// Payload structure: Same as createKho (all fields optional)
export const updateKho = async (id_kho, data) => {
    try {
        const res = await api.put(`/${id_kho}`, data);
        // Backend returns { message, data }
        return res.data;
    } catch (err) {
        logError("updateKho", err);
        throw formatServiceError(err, "Lỗi khi cập nhật kho");
    }
};

// 🔴 Xóa kho
export const deleteKho = async (id_kho) => {
    try {
        const res = await api.delete(`/${id_kho}`);
        // Backend returns { message }
        return res.data;
    } catch (err) {
        logError("deleteKho", err);
        throw formatServiceError(err, "Lỗi khi xóa kho");
    }
};

// =======================
// 📦 Tồn kho
// =======================

// 🟢 Lấy tồn kho NPL theo kho
export const getTonKhoNPLByKho = async (id_kho) => {
    try {
        const res = await api.get(`/${id_kho}/ton-kho-npl`);
        const data = res.data?.data || res.data || [];
        return { data: Array.isArray(data) ? data : [] };
    } catch (err) {
        logError("getTonKhoNPLByKho", err);
        throw formatServiceError(err, "Lỗi khi lấy tồn kho NPL");
    }
};

// 🟢 Lấy tồn kho SP theo kho
export const getTonKhoSPByKho = async (id_kho) => {
    try {
        const res = await api.get(`/${id_kho}/ton-kho-sp`);
        const data = res.data?.data || res.data || [];
        return { data: Array.isArray(data) ? data : [] };
    } catch (err) {
        logError("getTonKhoSPByKho", err);
        throw formatServiceError(err, "Lỗi khi lấy tồn kho SP");
    }
};

// =======================
// 📤 Xuất các hàm
// =======================
export default {
    createKho,
    getAllKho,
    getKhoById,
    updateKho,
    deleteKho,
    getTonKhoNPLByKho,
    getTonKhoSPByKho,
};
