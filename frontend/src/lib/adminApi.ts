import apiClient from '@/lib/axios';

export const adminApi = {
    // Users
    async getAllUsers() {
        const response = await apiClient.get('/api/v1/admin/users');
        return Array.isArray(response.data) ? response.data : (response.data?.users || response.data?.content || []);
    },

    async toggleUserRestriction(userId: string, isRestricted: boolean) {
        const response = await apiClient.put(`/api/v1/admin/users/${userId}/restrict`, { isRestricted });
        return response.data;
    },

    // Skills
    async getAllSkills() {
        const response = await apiClient.get('/api/v1/admin/skills');
        return Array.isArray(response.data) ? response.data : (response.data?.skills || response.data?.content || []);
    },

    async createSkill(name: string) {
        const response = await apiClient.post('/api/v1/admin/skills', { name });
        return response.data;
    },

    async deleteSkill(id: string) {
        await apiClient.delete(`/api/v1/admin/skills/${id}`);
    },

    // Tags
    async getAllTags() {
        const response = await apiClient.get('/api/v1/admin/skills/tags');
        return Array.isArray(response.data) ? response.data : (response.data?.tags || response.data?.content || []);
    },

    async createTag(name: string) {
        const response = await apiClient.post('/api/v1/admin/skills/tags', { name });
        return response.data;
    },

    async deleteTag(id: string) {
        await apiClient.delete(`/api/v1/admin/skills/tags/${id}`);
    }
};