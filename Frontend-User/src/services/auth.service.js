import { createApiInstance } from "./apiConfig";
import { formatServiceError, logError } from "../utils/errorHandler";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/auth`;

const api = createApiInstance(API_BASE_URL);

// Đăng ký doanh nghiệp
export const registerBusiness = async (data) => {
    try {
        const res = await api.post("/register", data);
        return res.data;
    } catch (err) {
        logError("registerBusiness", err);
        throw formatServiceError(err, "Lỗi khi đăng ký doanh nghiệp");
    }
};

// Đăng nhập doanh nghiệp
export const loginBusiness = async (data) => {
    try {
        const res = await api.post("/login", data);

        // BE trả về kiểu nào thì lấy đúng key đó
        const { token, refreshToken, DoanhNghiep } = res.data?.data || {};

        if (token) localStorage.setItem("accessToken", token);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
        if (DoanhNghiep) localStorage.setItem("user", JSON.stringify(DoanhNghiep));

        return res.data;
    } catch (err) {
        logError("loginBusiness", err);
        throw formatServiceError(err, "Lỗi khi đăng nhập");
    }
};

// Đăng nhập hải quan
export const loginHaiQuan = async (data) => {
    try {
        const res = await api.post("/login-haiquan", data);

        const { token, refreshToken, HaiQuan } = res.data?.data || {};

        if (token) localStorage.setItem("accessToken", token);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
        if (HaiQuan) localStorage.setItem("user", JSON.stringify(HaiQuan));

        return res.data;
    } catch (err) {
        logError("loginHaiQuan", err);
        throw formatServiceError(err, "Lỗi khi đăng nhập hải quan");
    }
};

// Làm mới access token
export const refreshAccessToken = async () => {
    try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("Thiếu refresh token");

        const res = await api.post("/refresh", { refreshToken });

        const { accessToken, refreshToken: newRefresh, user } = res.data?.data || {};

        if (accessToken) localStorage.setItem("accessToken", accessToken);
        if (newRefresh) localStorage.setItem("refreshToken", newRefresh);
        if (user) localStorage.setItem("user", JSON.stringify(user));

        return res.data;
    } catch (err) {
        logError("refreshAccessToken", err);
        // Nếu refresh fail thì xóa token
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        throw formatServiceError(err, "Lỗi khi làm mới token");
    }
};

// Đăng xuất
export const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
};

export default {
    registerBusiness,
    loginBusiness,
    loginHaiQuan,
    refreshAccessToken,
    logout,
};
