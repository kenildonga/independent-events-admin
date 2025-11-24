// utils/axios.ts
import axios from 'axios';

const axiosInstance = axios.create({
    // baseURL: 'http://193.233.202.172:5551/api/v1/admin/', // Set base URL here
    baseURL: 'http://localhost:3030/api/admin/',
    timeout: 30000,
    headers: {
        'x-api-key': 'your_api_key_here',
        'Content-Type': 'application/json'
    }
});

// Optional: Add interceptors for request/response
axiosInstance.interceptors.request.use(
    (config) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token && config.headers) {
            config.headers.token = token;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle global errors here
        console.error('API Error:', error);

        // Handle 401 Unauthorized - redirect to login
        if (error.response?.status === 401) {
            // Clear any stored auth token
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('adminId');
                // Clear cookies as well
                document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                document.cookie = 'adminId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                // Redirect to login page
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

// Helper function to set authentication cookies
export const setAuthCookies = (token: string, adminId: string) => {
    if (typeof window !== 'undefined') {
        // Set cookies with expiration (7 days)
        const expires = new Date();
        expires.setDate(expires.getDate() + 7);

        document.cookie = `token=${token}; expires=${expires.toUTCString()}; path=/; secure; samesite=strict`;
        document.cookie = `adminId=${adminId}; expires=${expires.toUTCString()}; path=/; secure; samesite=strict`;
    }
};

// Helper function to clear authentication cookies
export const clearAuthCookies = () => {
    if (typeof window !== 'undefined') {
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'adminId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
};

export default axiosInstance;