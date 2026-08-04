// lib/axios.ts
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para manejar errores
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default axiosInstance;