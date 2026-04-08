import { createApiInstance } from "./apiConfig";
import { formatServiceError, logError } from "../utils/errorHandler";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/doi-soat`;
const api = createApiInstance(API_BASE_URL);

// ========== Import Reconciliation (Đối soát Nhập) ==========

export const getAllNhap = async (filters = {}) => {
    try {
        const res = await api.get("/nhap", { params: filters });
        return res.data?.data || res.data || [];
    } catch (err) {
        logError("getAllNhap doisoat", err);
        throw formatServiceError(err, "Lỗi khi lấy danh sách đối soát nhập");
    }
};

export const getNhapById = async (id) => {
    try {
        const res = await api.get(`/nhap/${id}`);
        return res.data?.data || res.data;
    } catch (err) {
        logError("getNhapById doisoat", err);
        throw formatServiceError(err, "Lỗi khi lấy chi tiết đối soát nhập");
    }
};

export const createNhap = async (payload) => {
    try {
        const res = await api.post("/nhap", payload);
        return res.data;
    } catch (err) {
        logError("createNhap doisoat", err);
        throw formatServiceError(err, "Lỗi khi tạo đối soát nhập");
    }
};

export const updateTrangThaiNhap = async (id, trang_thai) => {
    try {
        const res = await api.put(`/nhap/${id}/status`, { trang_thai });
        return res.data;
    } catch (err) {
        logError("updateTrangThaiNhap doisoat", err);
        throw formatServiceError(err, "Lỗi khi cập nhật trạng thái đối soát nhập");
    }
};

export const removeNhap = async (id) => {
    try {
        const res = await api.delete(`/nhap/${id}`);
        return res.data;
    } catch (err) {
        logError("removeNhap doisoat", err);
        throw formatServiceError(err, "Lỗi khi xóa đối soát nhập");
    }
};

// ========== Export Reconciliation (Đối soát Xuất) ==========

export const getAllXuat = async (filters = {}) => {
    try {
        const res = await api.get("/xuat", { params: filters });
        return res.data?.data || res.data || [];
    } catch (err) {
        logError("getAllXuat doisoat", err);
        throw formatServiceError(err, "Lỗi khi lấy danh sách đối soát xuất");
    }
};

export const getXuatById = async (id) => {
    try {
        const res = await api.get(`/xuat/${id}`);
        return res.data?.data || res.data;
    } catch (err) {
        logError("getXuatById doisoat", err);
        throw formatServiceError(err, "Lỗi khi lấy chi tiết đối soát xuất");
    }
};

export const createXuat = async (payload) => {
    try {
        const res = await api.post("/xuat", payload);
        return res.data;
    } catch (err) {
        logError("createXuat doisoat", err);
        throw formatServiceError(err, "Lỗi khi tạo đối soát xuất");
    }
};

export const updateTrangThaiXuat = async (id, trang_thai) => {
    try {
        const res = await api.put(`/xuat/${id}/status`, { trang_thai });
        return res.data;
    } catch (err) {
        logError("updateTrangThaiXuat doisoat", err);
        throw formatServiceError(err, "Lỗi khi cập nhật trạng thái đối soát xuất");
    }
};

export const removeXuat = async (id) => {
    try {
        const res = await api.delete(`/xuat/${id}`);
        return res.data;
    } catch (err) {
        logError("removeXuat doisoat", err);
        throw formatServiceError(err, "Lỗi khi xóa đối soát xuất");
    }
};

// ========== Quota Reconciliation (Đối soát Định mức) ==========

export const getAllDinhMuc = async (filters = {}) => {
    try {
        const res = await api.get("/dinhmuc", { params: filters });
        return res.data?.data || res.data || [];
    } catch (err) {
        logError("getAllDinhMuc doisoat", err);
        throw formatServiceError(err, "Lỗi khi lấy danh sách đối soát định mức");
    }
};

export const getDinhMucById = async (id) => {
    try {
        const res = await api.get(`/dinhmuc/${id}`);
        return res.data?.data || res.data;
    } catch (err) {
        logError("getDinhMucById doisoat", err);
        throw formatServiceError(err, "Lỗi khi lấy chi tiết đối soát định mức");
    }
};

export const createDinhMuc = async (payload) => {
    try {
        const res = await api.post("/dinhmuc", payload);
        return res.data;
    } catch (err) {
        logError("createDinhMuc doisoat", err);
        throw formatServiceError(err, "Lỗi khi tạo đối soát định mức");
    }
};

export const removeDinhMuc = async (id) => {
    try {
        const res = await api.delete(`/dinhmuc/${id}`);
        return res.data;
    } catch (err) {
        logError("removeDinhMuc doisoat", err);
        throw formatServiceError(err, "Lỗi khi xóa đối soát định mức");
    }
};

// Legacy exports for backward compatibility
export const getAll = getAllNhap;
export const getById = getNhapById;
export const create = createNhap;
export const update = updateTrangThaiNhap;
export const remove = removeNhap;

export default { 
    // Import reconciliation
    getAllNhap, 
    getNhapById, 
    createNhap, 
    updateTrangThaiNhap, 
    removeNhap,
    // Export reconciliation
    getAllXuat,
    getXuatById,
    createXuat,
    updateTrangThaiXuat,
    removeXuat,
    // Quota reconciliation
    getAllDinhMuc,
    getDinhMucById,
    createDinhMuc,
    removeDinhMuc,
    // Legacy
    getAll, 
    getById, 
    create, 
    update, 
    remove 
};
