import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { apiService } from '../services/api';

const AgentContext = createContext();

export const AgentProvider = ({ children }) => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getAgents();
      setAgents(response.agents || []);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error('Failed to load agents:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAgent = useCallback((agentId, updates) => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId ? { ...agent, ...updates } : agent
    ));
  }, []);

  const removeAgent = useCallback((agentId) => {
    setAgents(prev => prev.filter(agent => agent.id !== agentId));
  }, []);

  const value = useMemo(() => ({
    agents,
    loading,
    error,
    lastUpdate,
    loadAgents,
    updateAgent,
    removeAgent
  }), [agents, loading, error, lastUpdate, loadAgents, updateAgent, removeAgent]);

  return (
    <AgentContext.Provider value={value}>
      {children}
    </AgentContext.Provider>
  );
};

export const useAgents = () => {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error('useAgents must be used within an AgentProvider');
  }
  return context;
};

export default AgentContext;
