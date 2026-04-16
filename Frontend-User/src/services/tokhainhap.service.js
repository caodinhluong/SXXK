import { createApiInstance } from "./apiConfig";
import { formatServiceError, logError } from "../utils/errorHandler";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/to-khai-nhap`;

const api = createApiInstance(API_BASE_URL);

/* ============================================================
   🟢 LẤY DANH SÁCH TẤT CẢ TỜ KHAI NHẬP
============================================================ */
export const getAllToKhaiNhap = async () => {
    try {
        const res = await api.get("/");
        // Backend returns { success: true, data: [...] }
        return res.data?.data || res.data || [];
    } catch (err) {
        logError("getAllToKhaiNhap", err);
        throw formatServiceError(err, "Lỗi khi lấy danh sách tờ khai nhập");
    }
};

/* ============================================================
   🟢 LẤY CHI TIẾT TỜ KHAI NHẬP THEO ID
============================================================ */
export const getToKhaiNhapById = async (id_tkn) => {
    try {
        const res = await api.get(`/${id_tkn}`);
        // Backend returns { success: true, data: {...} }
        return res.data?.data || res.data;
    } catch (err) {
        logError("getToKhaiNhapById", err);
        throw formatServiceError(err, "Lỗi khi lấy chi tiết tờ khai nhập");
    }
};

/* ============================================================
   🟢 TẠO MỚI TỜ KHAI NHẬP
   Payload structure:
   {
     id_lh: number (required) - Lô hàng ID,
     so_tk: string (required) - Số tờ khai,
     ngay_tk: date (required) - Ngày tờ khai,
     ma_to_khai: string (optional) - Mã tờ khai (G11, G12, G13, G14, G51),
     loai_hang: string (optional) - Loại hàng (NguyenLieu, SanPham, BanThanhPham),
     ngay_thong_quan: date (optional) - Ngày thông quan,
     cang_nhap: string (optional) - Cảng nhập,
     tong_tri_gia: number (optional) - Tổng trị giá,
     thue_nhap_khau: number (optional) - Thuế nhập khẩu,
     thue_gtgt: number (optional) - Thuế GTGT,
     id_tt: number (optional) - Tiền tệ ID,
     file_to_khai: string (optional) - File tờ khai,
     file_excel_import: string (optional) - File Excel import,
     ghi_chu: string (optional) - Ghi chú,
     nguoi_xu_ly: string (optional) - Người xử lý,
     ngay_xu_ly: date (optional) - Ngày xử lý,
     trang_thai: string (optional) - Trạng thái,
     chiTiets: [
       {
         id_npl: number | null - Either id_npl OR id_sp, not both,
         id_sp: number | null,
         so_luong: number (required, > 0),
         don_vi_tinh: string (optional),
         don_gia: number (optional),
         tri_gia: number (optional),
         so_luong_chuan: number (optional),
         dvt_chuan: string (optional)
       }
     ]
   }
============================================================ */
export const createToKhaiNhap = async (payload) => {
    try {
        const res = await api.post("/", payload);
        // Backend returns { success: true, message, data }
        return res.data;
    } catch (err) {
        logError("createToKhaiNhap", err);
        throw formatServiceError(err, "Lỗi khi tạo tờ khai nhập");
    }
};

/* ============================================================
   🟢 CẬP NHẬT TỜ KHAI NHẬP
   Payload structure: Same as createToKhaiNhap (all fields optional except chiTiets structure)
   Note: id_lh cannot be changed after creation
============================================================ */
export const updateToKhaiNhap = async (id_tkn, payload) => {
    try {
        const res = await api.put(`/${id_tkn}`, payload);
        // Backend returns { success: true, message, data }
        return res.data;
    } catch (err) {
        logError("updateToKhaiNhap", err);
        throw formatServiceError(err, "Lỗi khi cập nhật tờ khai nhập");
    }
};

/* ============================================================
   🟢 XÓA TỜ KHAI NHẬP
============================================================ */
export const deleteToKhaiNhap = async (id_tkn) => {
    try {
        const res = await api.delete(`/${id_tkn}`);
        // Backend returns { success: true, message }
        return res.data;
    } catch (err) {
        logError("deleteToKhaiNhap", err);
        throw formatServiceError(err, "Lỗi khi xóa tờ khai nhập");
    }
};

/* ============================================================
   🟢 IMPORT TỜ KHAI NHẬP TỪ EXCEL
   data: Array of objects from Excel
   id_lh: Lô hàng ID
============================================================ */
export const importToKhaiNhapFromExcel = async (data, id_lh) => {
    try {
        const res = await api.post("/import", { data, id_lh });
        return res.data;
    } catch (err) {
        logError("importToKhaiNhapFromExcel", err);
        throw formatServiceError(err, "Lỗi khi import tờ khai nhập từ Excel");
    }
};

/* ============================================================
   🟢 LẤY MẪU TEMPLATE TỜ KHAI NHẬP
============================================================ */
export const getTemplateToKhaiNhap = async () => {
    try {
        const res = await api.get("/template");
        return res.data;
    } catch (err) {
        logError("getTemplateToKhaiNhap", err);
        throw formatServiceError(err, "Lỗi khi lấy mẫu template");
    }
};

// Alias exports for compatibility
export const getAll = getAllToKhaiNhap;
export const getById = getToKhaiNhapById;
export const create = createToKhaiNhap;
export const update = updateToKhaiNhap;
export const remove = deleteToKhaiNhap;

export default {
    getAllToKhaiNhap,
    getToKhaiNhapById,
    createToKhaiNhap,
    updateToKhaiNhap,
    deleteToKhaiNhap,
    importToKhaiNhapFromExcel,
    getTemplateToKhaiNhap,
    // Aliases
    getAll: getAllToKhaiNhap,
    getById: getToKhaiNhapById,
    create: createToKhaiNhap,
    update: updateToKhaiNhap,
    remove: deleteToKhaiNhap,
};
