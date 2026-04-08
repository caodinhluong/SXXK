import { createApiInstance } from "./apiConfig";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/van-don-xuat`;

const api = createApiInstance(API_BASE_URL);

/* ============================================================
   LẤY TẤT CẢ VẬN ĐƠN XUẤT
============================================================ */
export const getAllVanDonXuat = async () => {
    try {
        const res = await api.get("/");
        // Backend returns { success: true, data: [...] }
        return res.data?.data || res.data || [];
    } catch (err) {
        console.error("❌ Lỗi getAllVanDonXuat:", err);
        throw err.response?.data || { message: "Lỗi khi lấy danh sách vận đơn xuất" };
    }
};

/* ============================================================
   TẠO MỚI VẬN ĐƠN XUẤT
============================================================ */
export const createVanDonXuat = async (payload) => {
    try {
        const res = await api.post("/", payload);
        // Backend returns { success: true, data }
        return res.data;
    } catch (err) {
        console.error("❌ Lỗi createVanDonXuat:", err);
        throw err.response?.data || { message: "Lỗi khi tạo vận đơn xuất" };
    }
};

export default {
    getAllVanDonXuat,
    createVanDonXuat,
};
