import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors (token expired or invalid)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me')
};

// Users API
export const usersAPI = {
  updateProfile: (profileData) => api.put('/users/profile', profileData),
  uploadProfilePicture: (formData) => api.post('/users/profile/picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  getAllUsers: (token) => api.get('/admin/users', {
    headers: { 'x-auth-token': token }
  })
};

// Problems API
export const problemsAPI = {
  getProblems: (params) => api.get('/problems', { params }),
  getProblem: (id) => api.get(`/problems/${id}`),
  getSolvedProblems: () => api.get('/problems/user/solved'),
  getTopics: () => api.get('/problems/topics/all'),
  createProblem: (problemData) => api.post('/problems', problemData),
  getNotes: async (problemId) => {
    return axios.get(`/api/problems/${problemId}/notes`, {
      headers: { 'x-auth-token': localStorage.getItem('token') }
    });
  },
  updateNotes: async (problemId, notes) => {
    return axios.put(`/api/problems/${problemId}/notes`, 
      { notes },
      { headers: { 'x-auth-token': localStorage.getItem('token') } }
    );
  }
};

// Submissions API
export const submissionsAPI = {
  getSubmissions: (params) => api.get('/submissions', { params }),
  getSubmission: (id) => api.get(`/submissions/${id}`),
  getProblemSubmissions: (problemId) => api.get(`/submissions/problem/${problemId}`),
  createSubmission: (submissionData) => api.post('/submissions', submissionData),
  updateSubmission: (id, submissionData) => api.put(`/submissions/${id}`, submissionData)
};

// Analytics API
export const analyticsAPI = {
  getSummary: (token, params) => {
    return api.get('/analytics/summary', { params });
  },
  getTopics: (token, params) => {
    return api.get('/analytics/topics', { params });
  },
  getActivity: (token, params) => {
    return api.get('/analytics/activity', { params });
  },
  getTopicsMistakes: (token, params) => {
    return api.get('/analytics/topics-mistakes', { params });
  },
  getRatings: (token, params) => {
    return api.get('/analytics/ratings', { params });
  }
};

// Platforms API
export const platformsAPI = {
  getAccounts: () => api.get('/platforms/accounts'),
  connectPlatform: (platformData) => api.post('/platforms/connect', platformData),
  disconnectPlatform: (platform) => api.delete(`/platforms/${platform}`),
  syncPlatform: (platform) => api.post(`/platforms/sync/${platform}`)
};

export default api;

