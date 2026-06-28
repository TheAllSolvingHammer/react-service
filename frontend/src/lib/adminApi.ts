import apiClient from '@/lib/axios';

export const adminApi = {
    // Users
    async getAllUsers() {
        const response = await apiClient.get('/admin/users');
        return response.data;
    },

    async toggleUserRestriction(userId: string, isRestricted: boolean) {
        const response = await apiClient.put(`/admin/users/${userId}/restrict`, { isRestricted });
        return response.data;
    },

    // Skills
    async getAllSkills() {
        const response = await apiClient.get('/admin/skills');
        return response.data;
    },

    async createSkill(name: string) {
        const response = await apiClient.post('/admin/skills', { name });
        return response.data;
    },

    async deleteSkill(id: string) {
        await apiClient.delete(`/admin/skills/${id}`);
    },

    // Tags
    async getAllTags() {
        const response = await apiClient.get('/admin/skills/tags');
        return response.data;
    },

    async createTag(name: string) {
        const response = await apiClient.post('/admin/skills/tags', { name });
        return response.data;
    },

    async deleteTag(id: string) {
        await apiClient.delete(`/admin/skills/tags/${id}`);
    }
};