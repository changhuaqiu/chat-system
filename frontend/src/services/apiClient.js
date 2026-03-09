/**
 * API Client - 统一 HTTP 客户端封装
 *
 * 功能:
 * - 基于 axios.create 创建实例
 * - 统一 baseURL 和超时配置
 * - 响应拦截器处理错误
 * - 请求拦截器支持认证
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 可在此添加认证 token
    const token = localStorage.getItem('apiToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('[API Client] Request error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    // 直接返回 data，减少一层嵌套
    return response.data;
  },
  (error) => {
    // 统一错误处理
    if (error.response) {
      // 服务器返回错误响应
      const { status, data } = error.response;

      switch (status) {
        case 401:
          console.error('[API Client] Unauthorized - 请检查认证信息');
          // 可在此触发重新登录
          break;
        case 403:
          console.error('[API Client] Forbidden - 权限不足');
          break;
        case 404:
          console.error('[API Client] Not Found - 资源不存在');
          break;
        case 500:
          console.error('[API Client] Internal Server Error - 服务器错误');
          break;
        default:
          console.error(`[API Client] Error ${status}:`, data?.message || error.message);
      }

      // 附加状态码到错误对象
      error.status = status;
      error.apiData = data;
    } else if (error.request) {
      // 请求已发出但没有收到响应
      console.error('[API Client] No response received - 请检查网络连接');
      error.message = '网络连接失败，请检查服务器是否运行';
    } else {
      // 请求配置出错
      console.error('[API Client] Request config error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
