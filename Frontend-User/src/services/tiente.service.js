import { createApiInstance } from "./apiConfig";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/tiente`;

const api = createApiInstance(API_BASE_URL);

/* ============================================================
   🟢 LẤY DANH SÁCH TẤT CẢ TIỀN TỆ
============================================================ */
export const getAllTienTe = async () => {
    try {
        const res = await api.get("/", { params: { limit: 100 } });
        return res.data;
    } catch (err) {
        console.error("❌ Lỗi getAllTienTe:", err);
        throw err.response?.data || { message: "Lỗi khi lấy danh sách tiền tệ" };
    }
};

/* ============================================================
   🟢 LẤY CHI TIẾT TIỀN TỆ THEO ID
============================================================ */
export const getTienTeById = async (id_tt) => {
    try {
        const res = await api.get(`/${id_tt}`);
        return res.data; // { success, data }
    } catch (err) {
        console.error("❌ Lỗi getTienTeById:", err);
        throw err.response?.data || { message: "Lỗi khi lấy chi tiết tiền tệ" };
    }
};

export default {
    getAllTienTe,
    getTienTeById,
};
