import { createApiInstance } from "./apiConfig";

// ==================== QUY ĐỔI DOANH NGHIỆP (NPL) ====================
const API_BASE_URL_DN = `${import.meta.env.VITE_API_BASE_URL}/quy-doi-don-vi-doanh-nghiep`;
const apiDN = createApiInstance(API_BASE_URL_DN);

export const getAllQuyDoiDN = async () => {
    try {
        const res = await apiDN.get("/");
        return res.data;
    } catch (err) {
        console.error("❌ Lỗi getAllQuyDoiDN:", err);
        throw err.response?.data || { message: "Lỗi khi lấy danh sách quy đổi DN" };
    }
};

export const getQuyDoiDNById = async (id_qd) => {
    try {
        const res = await apiDN.get(`/${id_qd}`);
        return res.data;
    } catch (err) {
        console.error("❌ Lỗi getQuyDoiDNById:", err);
        throw err.response?.data || { message: "Lỗi khi lấy chi tiết quy đổi DN" };
    }
};

export const createQuyDoiDN = async (data) => {
    try {
        const res = await apiDN.post("/", data);
        return res.data;
    } catch (err) {
        console.error("❌ Lỗi createQuyDoiDN:", err);
        throw err.response?.data || { message: "Lỗi khi tạo quy đổi DN" };
    }
};

export const updateQuyDoiDN = async (id_qd, data) => {
    try {
        const res = await apiDN.put(`/${id_qd}`, data);
        return res.data;
    } catch (err) {
        console.error("❌ Lỗi updateQuyDoiDN:", err);
        throw err.response?.data || { message: "Lỗi khi cập nhật quy đổi DN" };
    }
};

export const deleteQuyDoiDN = async (id_qd) => {
    try {
        const res = await apiDN.delete(`/${id_qd}`);
        return res.data;
    } catch (err) {
        console.error("❌ Lỗi deleteQuyDoiDN:", err);
        throw err.response?.data || { message: "Lỗi khi xóa quy đổi DN" };
    }
};

// ==================== QUY ĐỔI SẢN PHẨM ====================
const API_BASE_URL_SP = `${import.meta.env.VITE_API_BASE_URL}/quy-doi-don-vi-san-pham`;
const apiSP = createApiInstance(API_BASE_URL_SP);

export const getAllQuyDoiSP = async () => {
    try {
        const res = await apiSP.get("/");
        return res.data;
    } catch (err) {
        console.error("❌ Lỗi getAllQuyDoiSP:", err);
        throw err.response?.data || { message: "Lỗi khi lấy danh sách quy đổi SP" };
    }
};

export const getQuyDoiSPById = async (id_qd) => {
    try {
        const res = await apiSP.get(`/${id_qd}`);
        return res.data;
    } catch (err) {
        console.error("❌ Lỗi getQuyDoiSPById:", err);
        throw err.response?.data || { message: "Lỗi khi lấy chi tiết quy đổi SP" };
    }
};

export const createQuyDoiSP = async (data) => {
    try {
        const res = await apiSP.post("/", data);
        return res.data;
    } catch (err) {
        console.error("❌ Lỗi createQuyDoiSP:", err);
        throw err.response?.data || { message: "Lỗi khi tạo quy đổi SP" };
    }
};

export const updateQuyDoiSP = async (id_qd, data) => {
    try {
        const res = await apiSP.put(`/${id_qd}`, data);
        return res.data;
    } catch (err) {
        console.error("❌ Lỗi updateQuyDoiSP:", err);
        throw err.response?.data || { message: "Lỗi khi cập nhật quy đổi SP" };
    }
};

export const deleteQuyDoiSP = async (id_qd) => {
    try {
        const res = await apiSP.delete(`/${id_qd}`);
        return res.data;
    } catch (err) {
        console.error("❌ Lỗi deleteQuyDoiSP:", err);
        throw err.response?.data || { message: "Lỗi khi xóa quy đổi SP" };
    }
};

// ==================== QUY ĐỔI NPL ====================
const API_BASE_URL_NPL = `${import.meta.env.VITE_API_BASE_URL}/quy-doi-don-vi-npl`;
const apiNPL = createApiInstance(API_BASE_URL_NPL);

export const getAllQuyDoiNPL = async () => {
    try {
        const res = await apiNPL.get("/");
        return res.data;
    } catch (err) {
        console.error("❌ Lỗi getAllQuyDoiNPL:", err);
        throw err.response?.data || { message: "Lỗi khi lấy danh sách quy đổi NPL" };
    }
};

export const getQuyDoiNPLById = async (id_qd) => {
    try {
        const res = await apiNPL.get(`/${id_qd}`);
        return res.data;
    } catch (err) {
        console.error("❌ Lỗi getQuyDoiNPLById:", err);
        throw err.response?.data || { message: "Lỗi khi lấy chi tiết quy đổi NPL" };
    }
};

export const createQuyDoiNPL = async (data) => {
    try {
        const res = await apiNPL.post("/", data);
        return res.data;
    } catch (err) {
        console.error("❌ Lỗi createQuyDoiNPL:", err);
        throw err.response?.data || { message: "Lỗi khi tạo quy đổi NPL" };
    }
};

export const updateQuyDoiNPL = async (id_qd, data) => {
    try {
        const res = await apiNPL.put(`/${id_qd}`, data);
        return res.data;
    } catch (err) {
        console.error("❌ Lỗi updateQuyDoiNPL:", err);
        throw err.response?.data || { message: "Lỗi khi cập nhật quy đổi NPL" };
    }
};

export const deleteQuyDoiNPL = async (id_qd) => {
    try {
        const res = await apiNPL.delete(`/${id_qd}`);
        return res.data;
    } catch (err) {
        console.error("❌ Lỗi deleteQuyDoiNPL:", err);
        throw err.response?.data || { message: "Lỗi khi xóa quy đổi NPL" };
    }
};

export default {
    // Quy đổi DN (NPL)
    getAllQuyDoiDN,
    getQuyDoiDNById,
    createQuyDoiDN,
    updateQuyDoiDN,
    deleteQuyDoiDN,
    // Quy đổi SP
    getAllQuyDoiSP,
    getQuyDoiSPById,
    createQuyDoiSP,
    updateQuyDoiSP,
    deleteQuyDoiSP,
    // Quy đổi NPL
    getAllQuyDoiNPL,
    getQuyDoiNPLById,
    createQuyDoiNPL,
    updateQuyDoiNPL,
    deleteQuyDoiNPL,
};
