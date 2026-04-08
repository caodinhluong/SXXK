import { createApiInstance } from "./apiConfig";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/ton-kho`;

const api = createApiInstance(API_BASE_URL);

export const getBaoCaoTonKho = async (params) => {
    try {
        const res = await api.get("/bao-cao", { params });
        return res.data;
    } catch (err) {
        console.error("❌ Lỗi getBaoCaoTonKho:", err);
        throw err.response?.data || { message: "Lỗi khi lấy báo cáo tồn kho" };
    }
};

export const getTonDauKy = async (ky_bao_cao) => {
    try {
        const res = await api.get("/dau-ky", { params: { ky_bao_cao } });
        return res.data;
    } catch (err) {
        console.error("❌ Lỗi getTonDauKy:", err);
        throw err.response?.data || { message: "Lỗi khi lấy tồn đầu kỳ" };
    }
};

export const nhapTonDauKy = async (payload) => {
    try {
        const res = await api.post("/dau-ky", payload);
        return res.data;
    } catch (err) {
        console.error("❌ Lỗi nhapTonDauKy:", err);
        throw err.response?.data || { message: "Lỗi khi nhập tồn đầu kỳ" };
    }
};

export const getTonKhoHienTai = async (id_kho, loai) => {
    try {
        const res = await api.get("/", { params: { id_kho, loai } });
        return res.data;
    } catch (err) {
        console.error("❌ Lỗi getTonKhoHienTai:", err);
        throw err.response?.data || { message: "Lỗi khi lấy tồn kho hiện tại" };
    }
};

export default {
    getBaoCaoTonKho,
    getTonDauKy,
    nhapTonDauKy,
    getTonKhoHienTai
};
