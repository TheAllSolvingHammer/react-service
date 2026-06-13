import axios from 'axios';

const apiClient = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const currentUserId = localStorage.getItem('userId');
        if (currentUserId) {
            config.headers['X-User-Id'] = currentUserId;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// THIS IS THE CRUCIAL LINE
export default apiClient;