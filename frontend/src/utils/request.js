import api from './api';
import { API_ENDPOINTS } from './endpoints';

const handleError = (error) => {
  const message = error.response?.data?.message ||
    error.response?.data?.errors?.[0]?.msg ||
    error.message ||
    'An error occurred';
  throw new Error(message);
};

// ===== AUTH =====
export const authService = {
  login: async (data) => {
    try {
      const res = await api.post(API_ENDPOINTS.AUTH.LOGIN, data);
      return res.data;
    } catch (err) { handleError(err); }
  },
  register: async (data) => {
    try {
      const res = await api.post(API_ENDPOINTS.AUTH.REGISTER, data);
      return res.data;
    } catch (err) { handleError(err); }
  },
  getProfile: async () => {
    try {
      const res = await api.get(API_ENDPOINTS.AUTH.PROFILE);
      return res.data;
    } catch (err) { handleError(err); }
  },
  forgotPassword: async (data) => {
    try {
      const res = await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
      return res.data;
    } catch (err) { handleError(err); }
  },
  verifyResetToken: async (token) => {
    try {
      const res = await api.get(API_ENDPOINTS.AUTH.VERIFY_RESET_TOKEN(token));
      return res.data;
    } catch (err) { handleError(err); }
  },
  resetPassword: async (data) => {
    try {
      const res = await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
      return res.data;
    } catch (err) { handleError(err); }
  },
};

// ===== MATERIALS =====
export const materialsService = {
  getAll: async (params) => {
    try {
      const res = await api.get(API_ENDPOINTS.MATERIALS.LIST, { params });
      return res.data;
    } catch (err) { handleError(err); }
  },
  getById: async (id) => {
    try {
      const res = await api.get(API_ENDPOINTS.MATERIALS.DETAIL(id));
      return res.data;
    } catch (err) { handleError(err); }
  },
  create: async (formData) => {
    try {
      const res = await api.post(API_ENDPOINTS.MATERIALS.CREATE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    } catch (err) { handleError(err); }
  },
  update: async (id, formData) => {
    try {
      const res = await api.put(API_ENDPOINTS.MATERIALS.UPDATE(id), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    } catch (err) { handleError(err); }
  },
  delete: async (id) => {
    try {
      const res = await api.delete(API_ENDPOINTS.MATERIALS.DELETE(id));
      return res.data;
    } catch (err) { handleError(err); }
  },
  reorder: async (orders) => {
    try {
      const res = await api.put(API_ENDPOINTS.MATERIALS.REORDER, { orders });
      return res.data;
    } catch (err) { handleError(err); }
  },
  duplicate: async (id) => {
    try {
      const res = await api.post(API_ENDPOINTS.MATERIALS.DUPLICATE(id));
      return res.data;
    } catch (err) { handleError(err); }
  },
  uploadImage: async (formData) => {
    try {
      const res = await api.post(API_ENDPOINTS.MATERIALS.UPLOAD_IMAGE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    } catch (err) { handleError(err); }
  },
};

// ===== PROGRESS =====
export const progressService = {
  getMy: async () => {
    try {
      const res = await api.get(API_ENDPOINTS.PROGRESS.MY);
      return res.data;
    } catch (err) { handleError(err); }
  },
  start: async (id) => {
    try {
      const res = await api.post(API_ENDPOINTS.PROGRESS.START(id));
      return res.data;
    } catch (err) { handleError(err); }
  },
  complete: async (id, data) => {
    try {
      const res = await api.post(API_ENDPOINTS.PROGRESS.COMPLETE(id), data);
      return res.data;
    } catch (err) { handleError(err); }
  },
};

// ===== USERS =====
export const usersService = {
  getAll: async (params) => {
    try {
      const res = await api.get(API_ENDPOINTS.USERS.LIST, { params });
      return res.data;
    } catch (err) { handleError(err); }
  },
  getById: async (id) => {
    try {
      const res = await api.get(API_ENDPOINTS.USERS.DETAIL(id));
      return res.data;
    } catch (err) { handleError(err); }
  },
  create: async (data) => {
    try {
      const res = await api.post(API_ENDPOINTS.USERS.CREATE, data);
      return res.data;
    } catch (err) { handleError(err); }
  },
  update: async (id, data) => {
    try {
      const res = await api.put(API_ENDPOINTS.USERS.UPDATE(id), data);
      return res.data;
    } catch (err) { handleError(err); }
  },
  delete: async (id) => {
    try {
      const res = await api.delete(API_ENDPOINTS.USERS.DELETE(id));
      return res.data;
    } catch (err) { handleError(err); }
  },
  toggleActive: async (id) => {
    try {
      const res = await api.put(API_ENDPOINTS.USERS.TOGGLE_ACTIVE(id));
      return res.data;
    } catch (err) { handleError(err); }
  },
  resetPassword: async (id, data) => {
    try {
      const res = await api.put(API_ENDPOINTS.USERS.RESET_PASSWORD(id), data);
      return res.data;
    } catch (err) { handleError(err); }
  },
  updateProfile: async (formData) => {
    try {
      const res = await api.put(API_ENDPOINTS.USERS.UPDATE_PROFILE, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    } catch (err) { handleError(err); }
  },
  changePassword: async (data) => {
    try {
      const res = await api.put(API_ENDPOINTS.USERS.CHANGE_PASSWORD, data);
      return res.data;
    } catch (err) { handleError(err); }
  },
};

// ===== STATS =====
export const statsService = {
  getDashboard: async () => {
    try {
      const res = await api.get(API_ENDPOINTS.STATS.DASHBOARD);
      return res.data;
    } catch (err) { handleError(err); }
  },
};

// ===== SETTINGS =====
export const settingsService = {
  getEmailSettings: async () => {
    try {
      const res = await api.get(API_ENDPOINTS.SETTINGS.GET_EMAIL);
      return res.data;
    } catch (err) { handleError(err); }
  },
  updateEmailSettings: async (data) => {
    try {
      const res = await api.put(API_ENDPOINTS.SETTINGS.UPDATE_EMAIL, data);
      return res.data;
    } catch (err) { handleError(err); }
  },
  testEmail: async (data) => {
    try {
      const res = await api.post(API_ENDPOINTS.SETTINGS.TEST_EMAIL, data);
      return res.data;
    } catch (err) { handleError(err); }
  },
};

