import { createApiInstance } from "./apiConfig";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/dinh-muc`;

const api = createApiInstance(API_BASE_URL);

export const getAllDinhMuc = async () => {
    try {
        const res = await api.get("/");
        return res.data;
    } catch (err) {
        console.error("❌ Lỗi getAllDinhMuc:", err);
        throw err.response?.data || { message: "Lỗi khi lấy danh sách định mức" };
    }
};

export const getDinhMucBySanPham = async (id_sp) => {
    try {
        const res = await api.get(`/${id_sp}`);
        return res.data;
    } catch (err) {
        console.error("❌ Lỗi getDinhMucBySanPham:", err);
        throw err.response?.data || { message: "Lỗi khi lấy định mức theo sản phẩm" };
    }
};

export const createDinhMuc = async (payload) => {
    try {
        const res = await api.post("/", payload);
        return res.data;
    } catch (err) {
        console.error("❌ Lỗi createDinhMuc:", err);
        throw err.response?.data || { message: "Lỗi khi tạo định mức sản phẩm" };
    }
};

export const deleteDinhMuc = async (id_dinhmuc) => {
    try {
        const res = await api.delete(`/${id_dinhmuc}`);
        return res.data;
    } catch (err) {
        console.error("❌ Lỗi deleteDinhMuc:", err);
        throw err.response?.data || { message: "Lỗi khi xóa định mức sản phẩm" };
    }
};

export const getSanPhamByDN = async () => {
    try {
        const res = await api.get("/san-pham");
        return res.data;
    } catch (err) {
        console.error("❌ Lỗi getSanPhamByDN:", err);
        throw err.response?.data || { message: "Lỗi khi lấy danh sách sản phẩm" };
    }
};

export const getNguyenLieuByDN = async () => {
    try {
        const res = await api.get("/nguyen-lieu");
        return res.data;
    } catch (err) {
        console.error("❌ Lỗi getNguyenLieuByDN:", err);
        throw err.response?.data || { message: "Lỗi khi lấy danh sách nguyên liệu" };
    }
};

export const importDinhMucFromExcel = async (data) => {
    try {
        const res = await api.post("/import", { data });
        return res.data;
    } catch (err) {
        console.error("❌ Lỗi importDinhMucFromExcel:", err);
        throw err.response?.data || { message: "Lỗi khi import định mức từ Excel" };
    }
};

export const getTemplateDinhMuc = async () => {
    try {
        const res = await api.get("/template");
        return res.data;
    } catch (err) {
        console.error("❌ Lỗi getTemplateDinhMuc:", err);
        throw err.response?.data || { message: "Lỗi khi lấy mẫu định mức" };
    }
};

export default {
    getAllDinhMuc,
    getDinhMucBySanPham,
    createDinhMuc,
    deleteDinhMuc,
    getSanPhamByDN,
    getNguyenLieuByDN,
    importDinhMucFromExcel,
    getTemplateDinhMuc
};