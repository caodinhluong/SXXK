import { createApiInstance } from "./apiConfig";
import { formatServiceError, logError } from "../utils/errorHandler";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/logs`;
const api = createApiInstance(API_BASE_URL);

/**
 * Query logs with filters
 * @param {Object} filters - Filter parameters
 * @returns {Promise} Response with logs data and pagination
 */
export const getAll = async (filters = {}) => {
    try {
        const res = await api.get("/", { params: filters });
        return res.data;
    } catch (err) {
        logError("getAll log", err);
        throw formatServiceError(err, "Lỗi khi lấy danh sách log");
    }
};

export const getById = async (id) => {
    try {
        const res = await api.get(`/${id}`);
        return res.data;
    } catch (err) {
        logError("getById log", err);
        throw formatServiceError(err, "Lỗi khi lấy chi tiết log");
    }
};

export const create = async (payload) => {
    try {
        const res = await api.post("/", payload);
        return res.data;
    } catch (err) {
        logError("create log", err);
        throw formatServiceError(err, "Lỗi khi tạo log");
    }
};

export const update = async (id, payload) => {
    try {
        const res = await api.put(`/${id}`, payload);
        return res.data;
    } catch (err) {
        logError("update log", err);
        throw formatServiceError(err, "Lỗi khi cập nhật log");
    }
};

export const remove = async (id) => {
    try {
        const res = await api.delete(`/${id}`);
        return res.data;
    } catch (err) {
        logError("delete log", err);
        throw formatServiceError(err, "Lỗi khi xóa log");
    }
};

/**
 * Get logs by user
 * @param {string} loaiNguoiDung - User type (Admin, DoanhNghiep, HaiQuan)
 * @param {number} idNguoiDung - User ID
 * @param {Object} options - Query options (page, limit, sortBy, sortOrder)
 * @returns {Promise} Response with logs data
 */
export const getByUser = async (loaiNguoiDung, idNguoiDung, options = {}) => {
    try {
        const res = await api.get(`/user/${loaiNguoiDung}/${idNguoiDung}`, { params: options });
        return res.data;
    } catch (err) {
        logError("getByUser log", err);
        throw formatServiceError(err, "Lỗi khi lấy log theo người dùng");
    }
};

/**
 * Get logs by action
 * @param {string} hanhDong - Action type
 * @param {Object} options - Query options (page, limit, sortBy, sortOrder)
 * @returns {Promise} Response with logs data
 */
export const getByAction = async (hanhDong, options = {}) => {
    try {
        const res = await api.get(`/action/${hanhDong}`, { params: options });
        return res.data;
    } catch (err) {
        logError("getByAction log", err);
        throw formatServiceError(err, "Lỗi khi lấy log theo hành động");
    }
};

/**
 * Get audit trail for a specific record
 * @param {string} bangLienQuan - Table name
 * @param {number} idBanGhi - Record ID
 * @param {Object} options - Query options (page, limit, sortBy, sortOrder)
 * @returns {Promise} Response with audit trail data
 */
export const getAuditTrail = async (bangLienQuan, idBanGhi, options = {}) => {
    try {
        const res = await api.get(`/audit/${bangLienQuan}/${idBanGhi}`, { params: options });
        return res.data;
    } catch (err) {
        logError("getAuditTrail log", err);
        throw formatServiceError(err, "Lỗi khi lấy lịch sử thay đổi");
    }
};

/**
 * Get log statistics
 * @param {Object} filters - Filter parameters (tu_ngay, den_ngay)
 * @returns {Promise} Response with statistics data
 */
export const getStatistics = async (filters = {}) => {
    try {
        const res = await api.get("/stats/summary", { params: filters });
        return res.data;
    } catch (err) {
        logError("getStatistics log", err);
        throw formatServiceError(err, "Lỗi khi lấy thống kê log");
    }
};

/**
 * Delete old logs (Admin only)
 * @param {number} days - Number of days (minimum 30)
 * @returns {Promise} Response with deleted count
 */
export const deleteOldLogs = async (days) => {
    try {
        const res = await api.delete(`/old/${days}`);
        return res.data;
    } catch (err) {
        logError("deleteOldLogs log", err);
        throw formatServiceError(err, "Lỗi khi xóa log cũ");
    }
};

export default { 
    getAll, 
    getById, 
    create, 
    update, 
    remove,
    getByUser,
    getByAction,
    getAuditTrail,
    getStatistics,
    deleteOldLogs
};
