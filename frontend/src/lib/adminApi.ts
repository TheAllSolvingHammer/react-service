import apiClient from '@/lib/axios';

export const adminApi = {
    // Users
    async getAllUsers() {
        const response = await apiClient.get('/api/v1/admin/users');
        return response.data;
    },

    async toggleUserRestriction(userId: string, isRestricted: boolean) {
        const response = await apiClient.put(`/api/v1/admin/users/${userId}/restrict`, { isRestricted });
        return response.data;
    },

    // Skills
    async getAllSkills() {
        const response = await apiClient.get('/api/v1/admin/skills');
        return response.data;
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
        return response.data;
    },

    async createTag(name: string) {
        const response = await apiClient.post('/api/v1/admin/skills/tags', { name });
        return response.data;
    },

    async deleteTag(id: string) {
        await apiClient.delete(`/api/v1/admin/skills/tags/${id}`);
    }
};