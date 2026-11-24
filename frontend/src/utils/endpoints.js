export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
    FORGOT_PASSWORD: '/auth/forgot-password',
    VERIFY_RESET_TOKEN: (token) => `/auth/verify-reset-token/${token}`,
    RESET_PASSWORD: '/auth/reset-password',
  },

  MATERIALS: {
    LIST: '/materials',
    DETAIL: (id) => `/materials/${id}`,
    CREATE: '/materials',
    UPDATE: (id) => `/materials/${id}`,
    DELETE: (id) => `/materials/${id}`,
    REORDER: '/materials/action/reorder',
    DUPLICATE: (id) => `/materials/${id}/duplicate`,
    UPLOAD_IMAGE: '/materials/upload-image',
  },

  PROGRESS: {
    MY: '/progress/my',
    START: (id) => `/progress/start/${id}`,
    COMPLETE: (id) => `/progress/complete/${id}`,
  },

  USERS: {
    LIST: '/users',
    DETAIL: (id) => `/users/${id}`,
    CREATE: '/users',
    UPDATE: (id) => `/users/${id}`,
    DELETE: (id) => `/users/${id}`,
    TOGGLE_ACTIVE: (id) => `/users/${id}/toggle-active`,
    RESET_PASSWORD: (id) => `/users/${id}/reset-password`,
    UPDATE_PROFILE: '/users/profile/update',
    CHANGE_PASSWORD: '/users/profile/change-password',
  },

  STATS: {
    DASHBOARD: '/stats',
  },

  SETTINGS: {
    GET_EMAIL: '/settings/email',
    UPDATE_EMAIL: '/settings/email',
    TEST_EMAIL: '/settings/email/test',
  },

  POLLS: {
    LIST: '/polls',
    DETAIL: (id) => `/polls/${id}`,
    CREATE: '/polls',
    UPDATE: (id) => `/polls/${id}`,
    DELETE: (id) => `/polls/${id}`,
    TOGGLE_STATUS: (id) => `/polls/${id}/toggle-status`,
    VOTERS: (id) => `/polls/${id}/voters`,
    MEMBER_ACTIVE: '/polls/member/active',
    BY_MATERIAL: (materialId) => `/polls/material/${materialId}`,
    VOTE: (id) => `/polls/${id}/vote`,
  },
};

