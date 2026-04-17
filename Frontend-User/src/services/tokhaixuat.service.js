import { createApiInstance } from "./apiConfig";
import { formatServiceError, logError } from "../utils/errorHandler";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/to-khai-xuat`;

const api = createApiInstance(API_BASE_URL);

/* ============================================================
   LẤY DANH SÁCH TẤT CẢ TỜ KHAI XUẤT
============================================================ */
export const getAllToKhaiXuat = async () => {
    try {
        const res = await api.get("/");
        // Backend returns { success: true, data: [...] }
        return res.data?.data || res.data || [];
    } catch (err) {
        logError("getAllToKhaiXuat", err);
        throw formatServiceError(err, "Lỗi khi lấy danh sách tờ khai xuất");
    }
};

/* ============================================================
   TẠO MỚI TỜ KHAI XUẤT
   Payload structure:
   {
     id_lh: number (required) - Lô hàng ID,
     so_tk: string (required) - Số tờ khai,
     ngay_tk: date (required) - Ngày tờ khai,
     ma_to_khai: string (optional) - Mã tờ khai (G21, G22, G23, G24, G61),
     loai_hang: string (optional) - Loại hàng (NguyenLieu, SanPham, BanThanhPham),
     ngay_thong_quan: date (optional) - Ngày thông quan,
     cang_xuat: string (optional) - Cảng xuất,
     tong_tri_gia: number (optional) - Tổng trị giá,
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
export const createToKhaiXuat = async (payload) => {
    try {
        const res = await api.post("/", payload);
        // Backend returns { success: true, message, data }
        return res.data;
    } catch (err) {
        logError("createToKhaiXuat", err);
        throw formatServiceError(err, "Lỗi khi tạo tờ khai xuất");
    }
};

/* ============================================================
   CẬP NHẬT TỜ KHAI XUẤT
   Payload structure: Same as createToKhaiXuat (all fields optional except chiTiets structure)
   Note: id_lh cannot be changed after creation
============================================================ */
export const updateToKhaiXuat = async (id_tkx, payload) => {
    try {
        const res = await api.put(`/${id_tkx}`, payload);
        // Backend returns { success: true, message, data }
        return res.data;
    } catch (err) {
        logError("updateToKhaiXuat", err);
        throw formatServiceError(err, "Lỗi khi cập nhật tờ khai xuất");
    }
};

/* ============================================================
   XÓA TỜ KHAI XUẤT
============================================================ */
export const deleteToKhaiXuat = async (id_tkx) => {
    try {
        const res = await api.delete(`/${id_tkx}`);
        // Backend returns { success: true, message }
        return res.data;
    } catch (err) {
        logError("deleteToKhaiXuat", err);
        throw formatServiceError(err, "Lỗi khi xóa tờ khai xuất");
    }
};

/* ============================================================
   IMPORT TỜ KHAI XUẤT TỪ EXCEL
   data: Array of objects from Excel
   id_lh: Lô hàng ID
============================================================ */
export const importToKhaiXuatFromExcel = async (data, id_lh) => {
    try {
        const res = await api.post("/import", { data, id_lh });
        return res.data;
    } catch (err) {
        logError("importToKhaiXuatFromExcel", err);
        throw formatServiceError(err, "Lỗi khi import tờ khai xuất từ Excel");
    }
};

/* ============================================================
   LẤY MẪU TEMPLATE TỜ KHAI XUẤT
============================================================ */
export const getTemplateToKhaiXuat = async () => {
    try {
        const res = await api.get("/template");
        return res.data;
    } catch (err) {
        logError("getTemplateToKhaiXuat", err);
        throw formatServiceError(err, "Lỗi khi lấy mẫu template");
    }
};

/* ============================================================
   IMPORT TỜ KHAI TỪ ĐỊNH DẠNG HẢI QUAN (VNACCS/VCIS)
   data: Object từ Excel hải quan
   id_lh: Lô hàng ID
   loai_xuat: true cho xuất, false cho nhập
============================================================ */
export const importToKhaiFromHaiQuanExcel = async (data, id_lh, loai_xuat = true) => {
    try {
        const res = await api.post("/import-hai-quan", { data, id_lh, loai_xuat });
        return res.data;
    } catch (err) {
        logError("importToKhaiFromHaiQuanExcel", err);
        throw formatServiceError(err, "Lỗi khi import từ file hải quan");
    }
};

/* ============================================================
   PARSE TỜ KHAI HẢI QUAN (Preview không lưu)
============================================================ */
export const parseToKhaiHaiQuan = async (data) => {
    try {
        const res = await api.post("/parse-hai-quan", { data });
        return res.data;
    } catch (err) {
        logError("parseToKhaiHaiQuan", err);
        throw formatServiceError(err, "Lỗi khi parse dữ liệu hải quan");
    }
};

/* ============================================================
   LẤY TEMPLATE ĐỊNH DẠNG HẢI QUAN
============================================================ */
export const getTemplateHaiQuanExcel = async () => {
    try {
        const res = await api.get("/template-hai-quan");
        return res.data;
    } catch (err) {
        logError("getTemplateHaiQuanExcel", err);
        throw formatServiceError(err, "Lỗi khi lấy template hải quan");
    }
};

export default {
    getAllToKhaiXuat,
    createToKhaiXuat,
    updateToKhaiXuat,
    deleteToKhaiXuat,
    importToKhaiXuatFromExcel,
    importToKhaiFromHaiQuanExcel,
    parseToKhaiHaiQuan,
    getTemplateToKhaiXuat,
    getTemplateHaiQuanExcel,
};
