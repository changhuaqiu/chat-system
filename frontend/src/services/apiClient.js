/**
 * API Client - 统一封装 axios
 * 
 * 功能:
 * 1. 统一 baseURL 配置
 * 2. 请求/响应拦截
 * 3. 统一错误处理
 * 4. 自动添加认证头
 */

import axios from 'axios';

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证 token
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    // 解构返回 data
    return response.data;
  },
  (error) => {
    console.error('API Error:', error.message);
    
    // 统一错误处理
    if (error.response) {
      // 服务器响应错误
      switch (error.response.status) {
        case 401:
          console.error('Unauthorized - Please login');
          break;
        case 403:
          console.error('Forbidden');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          console.error(`Error: ${error.response.status}`);
      }
    } else if (error.request) {
      // 请求已发出但没有响应
      console.error('No response from server');
    } else {
      // 设置请求时出错
      console.error('Error setting up request:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// 导出实例
export default apiClient;

// 辅助函数
export const apiGet = async (url, params = {}) => {
  const response = await apiClient.get(url, { params });
  return response;
};

export const apiPost = async (url, data = {}) => {
  const response = await apiClient.post(url, data);
  return response;
};

export const apiPut = async (url, data = {}) => {
  const response = await apiClient.put(url, data);
  return response;
};

export const apiDelete = async (url) => {
  const response = await apiClient.delete(url);
  return response;
};

// 导出默认配置
export const API_BASE_URL = apiClient.defaults.baseURL;
export const API_TIMEOUT = apiClient.defaults.timeout;
