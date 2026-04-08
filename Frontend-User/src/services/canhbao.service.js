import { createApiInstance } from "./apiConfig";
import { formatServiceError, logError } from "../utils/errorHandler";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/canh-bao`;
const api = createApiInstance(API_BASE_URL);

export const getAll = async (filters = {}) => {
    try {
        const res = await api.get("/", { params: filters });
        return res.data?.data || res.data || [];
    } catch (err) {
        logError("getAll canhbao", err);
        throw formatServiceError(err, "Lỗi khi lấy danh sách cảnh báo");
    }
};

export const getById = async (id) => {
    try {
        const res = await api.get(`/${id}`);
        return res.data;
    } catch (err) {
        logError("getById canhbao", err);
        throw formatServiceError(err, "Lỗi khi lấy chi tiết cảnh báo");
    }
};

export const create = async (payload) => {
    try {
        const res = await api.post("/", payload);
        return res.data;
    } catch (err) {
        logError("create canhbao", err);
        throw formatServiceError(err, "Lỗi khi tạo cảnh báo");
    }
};

export const update = async (id, payload) => {
    try {
        const res = await api.put(`/${id}`, payload);
        return res.data;
    } catch (err) {
        logError("update canhbao", err);
        throw formatServiceError(err, "Lỗi khi cập nhật cảnh báo");
    }
};

export const remove = async (id) => {
    try {
        const res = await api.delete(`/${id}`);
        return res.data;
    } catch (err) {
        logError("delete canhbao", err);
        throw formatServiceError(err, "Lỗi khi xóa cảnh báo");
    }
};

export default { getAll, getById, create, update, remove };
