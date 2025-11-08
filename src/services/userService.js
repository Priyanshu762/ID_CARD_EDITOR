import api from '../utils/api';

/**
 * User Service
 * All API calls related to users
 */

export const userService = {
  // Get all users (with optional pagination and filters)
  getAllUsers: async (params = {}) => {
    const response = await api.get('/users', { params });
    return response;
  },

  // Get single user by ID
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Get user by name (searches in userData)
  getUserByName: async (name) => {
    const response = await api.get(`/users/name/${encodeURIComponent(name)}`);
    return response.data;
  },

  // Create new user
  createUser: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  // Update existing user
  updateUser: async ({ id, data }) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  // Delete user
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

export default userService;
