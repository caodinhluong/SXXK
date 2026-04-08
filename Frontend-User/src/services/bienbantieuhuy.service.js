import { createApiInstance } from "./apiConfig";
import { formatServiceError, logError } from "../utils/errorHandler";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/bienbantieuhuy`;
const api = createApiInstance(API_BASE_URL);

export const getAll = async () => {
    try {
        const res = await api.get("/");
        return res.data?.data || res.data || [];
    } catch (err) {
        logError("getAll bienbantieuhuy", err);
        throw formatServiceError(err, "Lỗi khi lấy danh sách biên bản tiêu hủy");
    }
};

export const getById = async (id) => {
    try {
        const res = await api.get(`/${id}`);
        return res.data;
    } catch (err) {
        logError("getById bienbantieuhuy", err);
        throw formatServiceError(err, "Lỗi khi lấy chi tiết biên bản tiêu hủy");
    }
};

export const create = async (payload) => {
    try {
        const res = await api.post("/", payload);
        return res.data;
    } catch (err) {
        logError("create bienbantieuhuy", err);
        throw formatServiceError(err, "Lỗi khi tạo biên bản tiêu hủy");
    }
};

export const update = async (id, payload) => {
    try {
        const res = await api.put(`/${id}`, payload);
        return res.data;
    } catch (err) {
        logError("update bienbantieuhuy", err);
        throw formatServiceError(err, "Lỗi khi cập nhật biên bản tiêu hủy");
    }
};

export const remove = async (id) => {
    try {
        const res = await api.delete(`/${id}`);
        return res.data;
    } catch (err) {
        logError("delete bienbantieuhuy", err);
        throw formatServiceError(err, "Lỗi khi xóa biên bản tiêu hủy");
    }
};

export default { getAll, getById, create, update, remove };
