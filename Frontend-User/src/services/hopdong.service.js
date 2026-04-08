import { createApiInstance } from "./apiConfig";
import { formatServiceError, logError } from "../utils/errorHandler";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/hop-dong`;

const api = createApiInstance(API_BASE_URL);

/* ============================================================
   🟢 LẤY TOÀN BỘ HỢP ĐỒNG
============================================================ */
/**
 * @returns {Promise<Object>} Danh sách tất cả hợp đồng
 */
export const getAllHopDong = async () => {
    try {
        const res = await api.get("/");
        return res.data;
    } catch (err) {
        logError("getAllHopDong", err);
        throw formatServiceError(err, "Lỗi khi lấy danh sách hợp đồng");
    }
};

/* ============================================================
   🟢 LẤY CHI TIẾT HỢP ĐỒNG THEO ID
============================================================ */
/**
 * @param {string|number} id_hd - ID hợp đồng
 * @returns {Promise<Object>} Chi tiết hợp đồng
 */
export const getHopDongById = async (id_hd) => {
    try {
        const res = await api.get(`/${id_hd}`);
        return res.data; // { success, data }
    } catch (err) {
        logError("getHopDongById", err);
        throw formatServiceError(err, "Lỗi khi lấy chi tiết hợp đồng");
    }
};

/* ============================================================
   🟢 TẠO MỚI HỢP ĐỒNG
============================================================ */
/**
 * @param {Object} payload - Dữ liệu hợp đồng
 * @param {string|number} payload.id_dn - ID doanh nghiệp
 * @param {string} payload.so_hd - Số hợp đồng
 * @param {string} payload.ngay_ky - Ngày ký
 * @param {string} [payload.ngay_hieu_luc]
 * @param {string} [payload.ngay_het_han]
 * @param {number} [payload.gia_tri]
 * @param {number} [payload.id_tt]
 * @param {string|null} [payload.file_hop_dong] - Link file hợp đồng upload (có thể null)
 */
export const createHopDong = async (payload) => {
    try {
        const res = await api.post("/", payload);
        return res.data; // { success, message, data }
    } catch (err) {
        logError("createHopDong", err);
        throw formatServiceError(err, "Lỗi khi tạo hợp đồng");
    }
};

/* ============================================================
   🟢 CẬP NHẬT HỢP ĐỒNG
============================================================ */
/**
 * @param {string|number} id_hd - ID hợp đồng
 * @param {Object} payload - Dữ liệu cần cập nhật
 */
export const updateHopDong = async (id_hd, payload) => {
    try {
        const res = await api.put(`/${id_hd}`, payload);
        return res.data; // { success, message, data }
    } catch (err) {
        logError("updateHopDong", err);
        throw formatServiceError(err, "Lỗi khi cập nhật hợp đồng");
    }
};

/* ============================================================
   🟢 XÓA HỢP ĐỒNG
============================================================ */
/**
 * @param {string|number} id_hd - ID hợp đồng
 */
export const deleteHopDong = async (id_hd) => {
    try {
        const res = await api.delete(`/${id_hd}`);
        return res.data; // { success, message }
    } catch (err) {
        logError("deleteHopDong", err);
        throw formatServiceError(err, "Lỗi khi xóa hợp đồng");
    }
};

export default {
    getAllHopDong,
    getHopDongById,
    createHopDong,
    updateHopDong,
    deleteHopDong,
};
