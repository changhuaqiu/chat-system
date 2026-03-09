import { useState, useEffect } from 'react';
import { PROVIDER_CONFIG } from '../constants';

export const useBotForm = (initialProvider = 'openai') => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    provider: initialProvider,
    variant: 'default',
    model: '',
    apiKey: '',
    baseUrl: 'https://api.openai.com/v1',
    roomId: ''
  });

  // 当 Provider 改变时，重置 Variant, Model 和 BaseURL
  useEffect(() => {
    const providerConfig = PROVIDER_CONFIG[formData.provider];
    if (providerConfig) {
      const defaultVariant = providerConfig.variants[0];
      setFormData(prev => ({
        ...prev,
        variant: defaultVariant.id,
        baseUrl: defaultVariant.baseUrl,
        model: providerConfig.models.length > 0 ? providerConfig.models[0].id : ''
      }));
    }
  }, [formData.provider]);

  // 当 Variant 改变时，更新 BaseURL
  useEffect(() => {
    const providerConfig = PROVIDER_CONFIG[formData.provider];
    const variantConfig = providerConfig?.variants.find(v => v.id === formData.variant);
    if (variantConfig) {
      setFormData(prev => ({
        ...prev,
        baseUrl: variantConfig.baseUrl
      }));
    }
  }, [formData.variant]);

  return {
    formData,
    setFormData
  };
};
