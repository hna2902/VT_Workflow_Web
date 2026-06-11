import axios from 'axios';

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
        const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
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
            originalRequest._retry = true; 

            try {
                const storage = localStorage.getItem('refresh_token') ? localStorage : sessionStorage;
                const refreshToken = storage.getItem('refresh_token');

                if (!refreshToken) throw new Error("No refresh token");

                // Request new tokens using base axios to avoid interceptor loops
                const res = await axios.post('http://localhost:8000/api/token/refresh/', {
                    refresh: refreshToken
                });

                // Save new tokens
                storage.setItem('access_token', res.data.access);
                if (res.data.refresh) {
                    storage.setItem('refresh_token', res.data.refresh);
                }

                // Update header and retry the original request
                originalRequest.headers['Authorization'] = `Bearer ${res.data.access}`;
                return axiosClient(originalRequest);

            } catch (err) {
                // Refresh token invalid or expired. Force logout.
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