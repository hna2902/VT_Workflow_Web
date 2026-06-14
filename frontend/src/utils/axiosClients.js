import axios from 'axios';
import { getUserStorage, setUserStorage } from './storage'; 

// Create Axios instance
const axiosClient = axios.create({
    baseURL: 'http://localhost:8000/api/',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach JWT token
axiosClient.interceptors.request.use(
    (config) => {
        const token = getUserStorage('access_token', null);
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 and Silent Refresh
axiosClient.interceptors.response.use(
    (response) => {
        return response; 
    },
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (originalRequest.url.includes('login')) {
                return Promise.reject(error);
            }
            originalRequest._retry = true; 
            try {
                const refreshToken = getUserStorage('refresh_token', null);
                if (!refreshToken) throw new Error("No refresh token");
                const res = await axios.post('http://localhost:8000/api/token/refresh/', {
                    refresh: refreshToken
                });
                setUserStorage('access_token', res.data.access);
                if (res.data.refresh) {
                    setUserStorage('refresh_token', res.data.refresh);
                }
                originalRequest.headers['Authorization'] = `Bearer ${res.data.access}`;
                return axiosClient(originalRequest);
            } catch (err) {
                // Refresh token invalid or expired
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = '/login';
                return Promise.reject(err);
            }
        }
        return Promise.reject(error);
    }
);

export default axiosClient;