import api from '../utils/api';

/**
 * Template Service
 * All API calls related to templates
 */

export const templateService = {
  // Get all templates (summary view)
  getAllTemplates: async () => {
    const response = await api.get('/templates');
    return response.data;
  },

  // Get single template by ID (with full data)
  getTemplateById: async (id) => {
    const response = await api.get(`/templates/${id}`);
    return response.data;
  },

  // Get template by name
  getTemplateByName: async (name) => {
    const response = await api.get(`/templates/name/${encodeURIComponent(name)}`);
    return response.data;
  },

  // Create new template
  createTemplate: async (templateData) => {
    const response = await api.post('/templates', templateData);
    return response.data;
  },

  // Update existing template
  updateTemplate: async ({ name, data }) => {
    const response = await api.put('/templates', { name, ...data });
    return response.data;
  },

  // Delete template
  deleteTemplate: async (id) => {
    const response = await api.delete(`/templates/${id}`);
    return response.data;
  },
};

export default templateService;
