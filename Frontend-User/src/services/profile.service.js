import { createApiInstance } from "./apiConfig";
import { formatServiceError, logError } from "../utils/errorHandler";

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/profile`;

const api = createApiInstance(API_BASE_URL);

// Lấy thông tin profile
export const getProfile = async () => {
  try {
    const response = await api.get('/');
    return response.data;
  } catch (error) {
    logError('getProfile', error);
    throw formatServiceError(error, 'Lỗi khi lấy thông tin profile');
  }
};

// Cập nhật thông tin profile
export const updateProfile = async (data) => {
  try {
    const response = await api.put('/', data);
    return response.data;
  } catch (error) {
    logError('updateProfile', error);
    throw formatServiceError(error, 'Lỗi khi cập nhật profile');
  }
};

// Đổi mật khẩu
export const changePassword = async (data) => {
  try {
    const response = await api.post('/change-password', data);
    return response.data;
  } catch (error) {
    logError('changePassword', error);
    throw formatServiceError(error, 'Lỗi khi đổi mật khẩu');
  }
};

export default {
  getProfile,
  updateProfile,
  changePassword
};
