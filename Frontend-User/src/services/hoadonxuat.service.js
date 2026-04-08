import { createApiInstance } from "./apiConfig";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/hoa-don-xuat`;

const api = createApiInstance(API_BASE_URL);

/* ============================================================
   LẤY TẤT CẢ HÓA ĐƠN XUẤT
============================================================ */
export const getAllHoaDonXuat = async () => {
    try {
        const res = await api.get("/");
        // Backend returns { success: true, data: [...] }
        return res.data?.data || res.data || [];
    } catch (err) {
        console.error("❌ Lỗi getAllHoaDonXuat:", err);
        throw err.response?.data || { message: "Lỗi khi lấy danh sách hóa đơn xuất" };
    }
};

/* ============================================================
   🟢 TẠO MỚI HÓA ĐƠN XUẤT
============================================================ */
export const createHoaDonXuat = async (payload) => {
    try {
        const res = await api.post("/", payload);
        // Backend returns { success: true, data }
        return res.data;
    } catch (err) {
        console.error("❌ Lỗi createHoaDonXuat:", err);
        throw err.response?.data || { message: "Lỗi khi tạo hóa đơn xuất" };
    }
};

export default {
    getAllHoaDonXuat,
    createHoaDonXuat,
};
