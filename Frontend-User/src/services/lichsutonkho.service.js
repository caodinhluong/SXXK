import { createApiInstance } from "./apiConfig";
import { formatServiceError, logError } from "../utils/errorHandler";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/lichsutonkho`;
const api = createApiInstance(API_BASE_URL);

export const getAll = async (filters = {}) => {
    try {
        const res = await api.get("/", { params: filters });
        return res.data?.data || res.data || [];
    } catch (err) {
        logError("getAll lichsutonkho", err);
        throw formatServiceError(err, "Lỗi khi lấy danh sách lịch sử tồn kho");
    }
};

export const getById = async (id) => {
    try {
        const res = await api.get(`/${id}`);
        return res.data;
    } catch (err) {
        logError("getById lichsutonkho", err);
        throw formatServiceError(err, "Lỗi khi lấy chi tiết lịch sử tồn kho");
    }
};

export const create = async (payload) => {
    try {
        const res = await api.post("/", payload);
        return res.data;
    } catch (err) {
        logError("create lichsutonkho", err);
        throw formatServiceError(err, "Lỗi khi tạo lịch sử tồn kho");
    }
};

export const update = async (id, payload) => {
    try {
        const res = await api.put(`/${id}`, payload);
        return res.data;
    } catch (err) {
        logError("update lichsutonkho", err);
        throw formatServiceError(err, "Lỗi khi cập nhật lịch sử tồn kho");
    }
};

export const remove = async (id) => {
    try {
        const res = await api.delete(`/${id}`);
        return res.data;
    } catch (err) {
        logError("delete lichsutonkho", err);
        throw formatServiceError(err, "Lỗi khi xóa lịch sử tồn kho");
    }
};

export default { getAll, getById, create, update, remove };
