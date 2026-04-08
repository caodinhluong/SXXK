import { createApiInstance } from "./apiConfig";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/quy-doi-chi-tiet`;

const api = createApiInstance(API_BASE_URL);

export const getDanhSachQuyDoi = async () => {
    try {
        const res = await api.get("/");
        return res.data;
    } catch (err) {
        console.error("❌ Lỗi getDanhSachQuyDoi:", err);
        throw err.response?.data || { message: "Lỗi khi lấy danh sách quy đổi" };
    }
};

export const taoQuyDoi = async (payload) => {
    try {
        const res = await api.post("/", payload);
        return res.data;
    } catch (err) {
        console.error("❌ Lỗi taoQuyDoi:", err);
        throw err.response?.data || { message: "Lỗi khi tạo quy đổi" };
    }
};

export const capNhatQuyDoi = async (id_qd, payload) => {
    try {
        const res = await api.put(`/${id_qd}`, payload);
        return res.data;
    } catch (err) {
        console.error("❌ Lỗi capNhatQuyDoi:", err);
        throw err.response?.data || { message: "Lỗi khi cập nhật quy đổi" };
    }
};

export const xoaQuyDoi = async (id_qd) => {
    try {
        const res = await api.delete(`/${id_qd}`);
        return res.data;
    } catch (err) {
        console.error("❌ Lỗi xoaQuyDoi:", err);
        throw err.response?.data || { message: "Lỗi khi xóa quy đổi" };
    }
};

export const quyDoiSoLuong = async (payload) => {
    try {
        const res = await api.post("/quy-doi-so-luong", payload);
        return res.data;
    } catch (err) {
        console.error("❌ Lỗi quyDoiSoLuong:", err);
        throw err.response?.data || { message: "Lỗi khi quy đổi số lượng" };
    }
};

export default {
    getDanhSachQuyDoi,
    taoQuyDoi,
    capNhatQuyDoi,
    xoaQuyDoi,
    quyDoiSoLuong
};
