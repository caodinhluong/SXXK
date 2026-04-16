import { createApiInstance } from "./apiConfig";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/so-khop`;

const api = createApiInstance(API_BASE_URL);

export const soKhopToKhaiXuatVoiPhieuXuat = async (payload) => {
    try {
        const res = await api.post("/", payload);
        if (!res.data?.success) {
            throw new Error(res.data?.message || res.data?.error || "Lỗi khi so khớp");
        }
        return res.data;
    } catch (err) {
        console.error("❌ Lỗi soKhopToKhaiXuatVoiPhieuXuat:", err);
        throw err.response?.data || { message: "Lỗi khi so khớp" };
    }
};

export const getDanhSachChuaKhop = async (loai = 'all') => {
    try {
        const res = await api.get("/chua-khop", { params: { loai } });
        if (!res.data?.success) {
            throw new Error(res.data?.message || res.data?.error || "Lỗi lấy danh sách");
        }
        return res.data?.data || [];
    } catch (err) {
        console.error("❌ Lỗi getDanhSachChuaKhop:", err);
        throw err.response?.data || { message: "Lỗi khi lấy danh sách chưa khớp" };
    }
};

export const getBaoCaoSoKhop = async (params) => {
    try {
        const res = await api.get("/bao-cao", { params });
        if (!res.data?.success) {
            throw new Error(res.data?.message || res.data?.error || "Lỗi lấy báo cáo");
        }
        return res.data?.data || [];
    } catch (err) {
        console.error("❌ Lỗi getBaoCaoSoKhop:", err);
        throw err.response?.data || { message: "Lỗi khi lấy báo cáo so khớp" };
    }
};

export const getChiTietSoKhop = async (id_ds) => {
    try {
        const res = await api.get(`/${id_ds}`);
        if (!res.data?.success) {
            throw new Error(res.data?.message || res.data?.error || "Lỗi lấy chi tiết");
        }
        return res.data?.data;
    } catch (err) {
        console.error("❌ Lỗi getChiTietSoKhop:", err);
        throw err.response?.data || { message: "Lỗi khi lấy chi tiết so khớp" };
    }
};

export default {
    soKhopToKhaiXuatVoiPhieuXuat,
    getDanhSachChuaKhop,
    getBaoCaoSoKhop,
    getChiTietSoKhop
};
