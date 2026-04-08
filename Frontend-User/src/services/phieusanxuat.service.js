import { createApiInstance } from "./apiConfig";
import { formatServiceError, logError } from "../utils/errorHandler";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/phieu-san-xuat`;
const api = createApiInstance(API_BASE_URL);

export const getAll = async () => {
    try {
        const res = await api.get("/");
        return res.data?.data || res.data || [];
    } catch (err) {
        logError("getAll phieusanxuat", err);
        throw formatServiceError(err, "Lỗi khi lấy danh sách phiếu sản xuất");
    }
};

export const getById = async (id) => {
    try {
        const res = await api.get(`/${id}`);
        return res.data;
    } catch (err) {
        logError("getById phieusanxuat", err);
        throw formatServiceError(err, "Lỗi khi lấy chi tiết phiếu sản xuất");
    }
};

export const create = async (payload) => {
    try {
        const res = await api.post("/", payload);
        return res.data;
    } catch (err) {
        logError("create phieusanxuat", err);
        throw formatServiceError(err, "Lỗi khi tạo phiếu sản xuất");
    }
};

export const update = async (id, payload) => {
    try {
        const res = await api.put(`/${id}`, payload);
        return res.data;
    } catch (err) {
        logError("update phieusanxuat", err);
        throw formatServiceError(err, "Lỗi khi cập nhật phiếu sản xuất");
    }
};

export const remove = async (id) => {
    try {
        const res = await api.delete(`/${id}`);
        return res.data;
    } catch (err) {
        logError("delete phieusanxuat", err);
        throw formatServiceError(err, "Lỗi khi xóa phiếu sản xuất");
    }
};

export default { getAll, getById, create, update, remove };
