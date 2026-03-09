/**
 * useSocketStatus - Socket 连接状态监控 Hook
 *
 * 功能:
 * - 监控 Socket 连接状态
 * - 自动重连通知
 * - 连接质量统计
 */

import { useState, useEffect } from 'react';
import { socket } from '../services/api';

export const useSocketStatus = () => {
  const [isConnected, setIsConnected] = useState(socket?.connected || false);
  const [lastDisconnect, setLastDisconnect] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [connectionQuality, setConnectionQuality] = useState('good'); // good, fair, poor

  useEffect(() => {
    if (!socket) return;

    const onConnect = () => {
      setIsConnected(true);
      setLastDisconnect(null);
      console.log('[SocketStatus] Connected');
    };

    const onDisconnect = (reason) => {
      setIsConnected(false);
      setLastDisconnect(new Date());
      console.log('[SocketStatus] Disconnected:', reason);
    };

    const onReconnect = (attemptNumber) => {
      setReconnectAttempts(attemptNumber);
      console.log('[SocketStatus] Reconnected after', attemptNumber, 'attempts');
    };

    const onReconnectAttempt = (attemptNumber) => {
      setReconnectAttempts(attemptNumber);
      // 根据重连次数评估连接质量
      if (attemptNumber >= 5) {
        setConnectionQuality('poor');
      } else if (attemptNumber >= 3) {
        setConnectionQuality('fair');
      } else {
        setConnectionQuality('good');
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('reconnect', onReconnect);
    socket.on('reconnect_attempt', onReconnectAttempt);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('reconnect', onReconnect);
      socket.off('reconnect_attempt', onReconnectAttempt);
    };
  }, []);

  return {
    isConnected,
    lastDisconnect,
    reconnectAttempts,
    connectionQuality
  };
};

export default useSocketStatus;
