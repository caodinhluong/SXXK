import { createApiInstance } from "./apiConfig";
import { formatServiceError, logError } from "../utils/errorHandler";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/thanh-khoan`;

const api = createApiInstance(API_BASE_URL);

// ==================== BÁO CÁO THANH KHOẢN ====================

// API 1: Lấy danh sách hợp đồng của doanh nghiệp
export const getAllHopDong = async () => {
    try {
        const response = await api.get('/hop-dong');
        // Backend may return array directly or { data: [...] }
        return response.data?.data || response.data || [];
    } catch (error) {
        logError("getAllHopDong", error);
        throw formatServiceError(error, "Lỗi khi lấy danh sách hợp đồng");
    }
};

// API 2: Tính toán và tạo dữ liệu Báo cáo Thanh khoản
export const calculateReport = async (data) => {
    try {
        const response = await api.post('/calculate', data);
        // Backend returns calculated report data
        return response.data;
    } catch (error) {
        logError("calculateReport", error);
        throw formatServiceError(error, "Lỗi khi tính toán báo cáo thanh khoản");
    }
};

// API 3: Lưu Báo cáo Thanh khoản
export const saveReport = async (data) => {
    try {
        const response = await api.post('/save', data);
        // Backend returns { message, id_bc }
        return response.data;
    } catch (error) {
        logError("saveReport", error);
        throw formatServiceError(error, "Lỗi khi lưu báo cáo thanh khoản");
    }
};

// Cập nhật báo cáo đã tồn tại
export const updateReport = async (id_bc, data) => {
    try {
        const response = await api.put(`/reports/${id_bc}`, data);
        // Backend returns { message, data }
        return response.data;
    } catch (error) {
        logError("updateReport", error);
        throw formatServiceError(error, "Lỗi khi cập nhật báo cáo thanh khoản");
    }
};

// Lấy danh sách báo cáo đã lưu (có phân trang và filter)
export const getAllReports = async (params = {}) => {
    try {
        const { page = 1, limit = 10, q, ket_luan_tong_the, trang_thai, id_hd } = params;
        const queryParams = new URLSearchParams();
        
        queryParams.append('page', page);
        queryParams.append('limit', limit);
        if (q) queryParams.append('q', q);
        if (ket_luan_tong_the) queryParams.append('ket_luan_tong_the', ket_luan_tong_the);
        if (trang_thai) queryParams.append('trang_thai', trang_thai);
        if (id_hd) queryParams.append('id_hd', id_hd);

        const response = await api.get(`/reports?${queryParams.toString()}`);
        return response.data;
    } catch (error) {
        logError("getAllReports", error);
        throw formatServiceError(error, "Lỗi khi lấy danh sách báo cáo");
    }
};

// Lấy chi tiết báo cáo theo ID
export const getReportById = async (id_bc) => {
    try {
        const response = await api.get(`/reports/${id_bc}`);
        // Backend returns report data
        return response.data;
    } catch (error) {
        logError("getReportById", error);
        throw formatServiceError(error, "Lỗi khi lấy chi tiết báo cáo");
    }
};

// Cập nhật trạng thái báo cáo
export const updateReportStatus = async (id_bc, trang_thai) => {
    try {
        const response = await api.patch(`/reports/${id_bc}/status`, { trang_thai });
        // Backend returns { message, data }
        return response.data;
    } catch (error) {
        logError("updateReportStatus", error);
        throw formatServiceError(error, "Lỗi khi cập nhật trạng thái báo cáo");
    }
};

// Xóa báo cáo thanh khoản
export const deleteReport = async (id_bc) => {
    try {
        const response = await api.delete(`/reports/${id_bc}`);
        // Backend returns { message }
        return response.data;
    } catch (error) {
        logError("deleteReport", error);
        throw formatServiceError(error, "Lỗi khi xóa báo cáo thanh khoản");
    }
};

export default {
    getAllHopDong,
    calculateReport,
    saveReport,
    updateReport,
    getAllReports,
    getReportById,
    updateReportStatus,
    deleteReport,
};
