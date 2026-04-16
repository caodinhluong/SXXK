import { createApiInstance } from "./apiConfig";
import { formatServiceError, logError } from "../utils/errorHandler";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/hoa-don-noi-dia`;
const api = createApiInstance(API_BASE_URL);

export const getAll = async () => {
    try {
        const res = await api.get("/");
        return res.data;
    } catch (err) {
        logError("getAll hoadonnoidia", err);
        throw formatServiceError(err, "Lỗi khi lấy danh sách hóa đơn nội địa");
    }
};

export const getById = async (id) => {
    try {
        const res = await api.get(`/${id}`);
        return res.data;
    } catch (err) {
        logError("getById hoadonnoidia", err);
        throw formatServiceError(err, "Lỗi khi lấy chi tiết hóa đơn nội địa");
    }
};

export const create = async (payload) => {
    try {
        const res = await api.post("/", payload);
        return res.data;
    } catch (err) {
        logError("create hoadonnoidia", err);
        throw formatServiceError(err, "Lỗi khi tạo hóa đơn nội địa");
    }
};

export const update = async (id, payload) => {
    try {
        const res = await api.put(`/${id}`, payload);
        return res.data;
    } catch (err) {
        logError("update hoadonnoidia", err);
        throw formatServiceError(err, "Lỗi khi cập nhật hóa đơn nội địa");
    }
};

export const remove = async (id) => {
    try {
        const res = await api.delete(`/${id}`);
        return res.data;
    } catch (err) {
        logError("delete hoadonnoidia", err);
        throw formatServiceError(err, "Lỗi khi xóa hóa đơn nội địa");
    }
};

export default { getAll, getById, create, update, remove };
