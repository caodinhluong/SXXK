import { createApiInstance } from "./apiConfig";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/doanh-nghiep`;

const api = createApiInstance(API_BASE_URL);

/* ============================================================
   🟢 LẤY DANH SÁCH TẤT CẢ DOANH NGHIỆP
============================================================ */
export const getAll = async () => {
    try {
        const res = await api.get("/");
        return res.data;
    } catch (err) {
        console.error("❌ Lỗi getAll doanh nghiệp:", err);
        throw err.response?.data || { message: "Lỗi khi lấy danh sách doanh nghiệp" };
    }
};

/* ============================================================
   🟢 LẤY CHI TIẾT DOANH NGHIỆP THEO ID
============================================================ */
export const getById = async (id_dn) => {
    try {
        const res = await api.get(`/${id_dn}`);
        return res.data;
    } catch (err) {
        console.error("❌ Lỗi getById doanh nghiệp:", err);
        throw err.response?.data || { message: "Lỗi khi lấy chi tiết doanh nghiệp" };
    }
};

/* ============================================================
   🟢 TẠO MỚI DOANH NGHIỆP
============================================================ */
export const create = async (payload) => {
    try {
        const res = await api.post("/", payload);
        return res.data;
    } catch (err) {
        console.error("❌ Lỗi create doanh nghiệp:", err);
        throw err.response?.data || { message: "Lỗi khi tạo doanh nghiệp" };
    }
};

/* ============================================================
   🟢 CẬP NHẬT DOANH NGHIỆP
============================================================ */
export const update = async (id_dn, payload) => {
    try {
        const res = await api.put(`/${id_dn}`, payload);
        return res.data;
    } catch (err) {
        console.error("❌ Lỗi update doanh nghiệp:", err);
        throw err.response?.data || { message: "Lỗi khi cập nhật doanh nghiệp" };
    }
};

/* ============================================================
   🟢 XÓA DOANH NGHIỆP
============================================================ */
export const remove = async (id_dn) => {
    try {
        const res = await api.delete(`/${id_dn}`);
        return res.data;
    } catch (err) {
        console.error("❌ Lỗi remove doanh nghiệp:", err);
        throw err.response?.data || { message: "Lỗi khi xóa doanh nghiệp" };
    }
};

/* ============================================================
   🟢 CẬP NHẬT TRẠNG THÁI DOANH NGHIỆP
============================================================ */
export const updateStatus = async (id_dn, status) => {
    try {
        const res = await api.post("/update-status", { id_dn, status });
        return res.data;
    } catch (err) {
        console.error("❌ Lỗi updateStatus doanh nghiệp:", err);
        throw err.response?.data || { message: "Lỗi khi cập nhật trạng thái doanh nghiệp" };
    }
};

export default {
    getAll,
    getById,
    create,
    update,
    remove,
    updateStatus,
};
