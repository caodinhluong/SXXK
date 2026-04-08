import { createApiInstance } from "./apiConfig";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/nguyen-lieu`;

const api = createApiInstance(API_BASE_URL);

/* ============================================================
   🟢 LẤY DANH SÁCH TẤT CẢ NGUYÊN PHỤ LIỆU
============================================================ */
export const getAllNguyenPhuLieu = async () => {
    try {
        const res = await api.get("/");
        return res.data;
    } catch (err) {
        console.error("❌ Lỗi getAllNguyenPhuLieu:", err);
        throw err.response?.data || { message: "Lỗi khi lấy danh sách nguyên phụ liệu" };
    }
};

/* ============================================================
   🟢 LẤY CHI TIẾT NGUYÊN PHỤ LIỆU THEO ID
============================================================ */
export const getNguyenPhuLieuById = async (id_nguyenlieu) => {
    try {
        const res = await api.get(`/${id_nguyenlieu}`);
        return res.data; // { success, data }
    } catch (err) {
        console.error("❌ Lỗi getNguyenPhuLieuById:", err);
        throw err.response?.data || { message: "Lỗi khi lấy chi tiết nguyên phụ liệu" };
    }
};

/* ============================================================
   🟢 TẠO MỚI NGUYÊN PHỤ LIỆU
============================================================ */
export const createNguyenPhuLieu = async (payload) => {
    try {
        const res = await api.post("/", payload);
        return res.data; // { success, message, data }
    } catch (err) {
        console.error("❌ Lỗi createNguyenPhuLieu:", err);
        throw err.response?.data || { message: "Lỗi khi tạo nguyên phụ liệu" };
    }
};

/* ============================================================
   🟢 CẬP NHẬT NGUYÊN PHỤ LIỆU
============================================================ */
export const updateNguyenPhuLieu = async (id_nguyenlieu, payload) => {
    try {
        const res = await api.put(`/${id_nguyenlieu}`, payload);
        return res.data; // { success, message, data }
    } catch (err) {
        console.error("❌ Lỗi updateNguyenPhuLieu:", err);
        throw err.response?.data || { message: "Lỗi khi cập nhật nguyên phụ liệu" };
    }
};

/* ============================================================
   🟢 XÓA NGUYÊN PHỤ LIỆU
============================================================ */
export const deleteNguyenPhuLieu = async (id_nguyenlieu) => {
    try {
        const res = await api.delete(`/${id_nguyenlieu}`);
        return res.data; // { success, message }
    } catch (err) {
        console.error("❌ Lỗi deleteNguyenPhuLieu:", err);
        throw err.response?.data || { message: "Lỗi khi xóa nguyên phụ liệu" };
    }
};

// Alias exports for compatibility
export const getAll = getAllNguyenPhuLieu;
export const getById = getNguyenPhuLieuById;
export const create = createNguyenPhuLieu;
export const update = updateNguyenPhuLieu;
export const remove = deleteNguyenPhuLieu;

export default {
    getAllNguyenPhuLieu,
    getNguyenPhuLieuById,
    createNguyenPhuLieu,
    updateNguyenPhuLieu,
    deleteNguyenPhuLieu,
    // Aliases
    getAll: getAllNguyenPhuLieu,
    getById: getNguyenPhuLieuById,
    create: createNguyenPhuLieu,
    update: updateNguyenPhuLieu,
    remove: deleteNguyenPhuLieu,
};
