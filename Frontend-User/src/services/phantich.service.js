import { createApiInstance } from "./apiConfig";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/phantich`;

const api = createApiInstance(API_BASE_URL);

export const phatHienThatThoat = async (params) => {
    try {
        const res = await api.get("/that-thoat", { params });
        return res.data;
    } catch (err) {
        console.error("❌ Lỗi phatHienThatThoat:", err);
        throw err.response?.data || { message: "Lỗi khi phát hiện thất thoát" };
    }
};

export const phatHienTonKhoAm = async () => {
    try {
        const res = await api.get("/ton-kho-am");
        return res.data;
    } catch (err) {
        console.error("❌ Lỗi phatHienTonKhoAm:", err);
        throw err.response?.data || { message: "Lỗi khi phát hiện tồn kho âm" };
    }
};

export const getBaoCaoThatThoatTongHop = async (params) => {
    try {
        const res = await api.get("/bao-cao-that-thoat", { params });
        return res.data;
    } catch (err) {
        console.error("❌ Lỗi getBaoCaoThatThoatTongHop:", err);
        throw err.response?.data || { message: "Lỗi khi lấy báo cáo thất thoát" };
    }
};

export const taoCanhBaoThatThoat = async (params) => {
    try {
        const res = await api.post("/canh-bao", params);
        return res.data;
    } catch (err) {
        console.error("❌ Lỗi taoCanhBaoThatThoat:", err);
        throw err.response?.data || { message: "Lỗi khi tạo cảnh báo thất thoát" };
    }
};

export default {
    phatHienThatThoat,
    phatHienTonKhoAm,
    getBaoCaoThatThoatTongHop,
    taoCanhBaoThatThoat
};
