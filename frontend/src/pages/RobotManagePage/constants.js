export const PROVIDER_CONFIG = {
  openai: {
    id: 'openai',
    label: 'OpenAI',
    icon: '🤖',
    variants: [
      { id: 'default', label: '默认 (Default)', baseUrl: 'https://api.openai.com/v1' }
    ],
    models: [
      { id: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
      { id: 'gpt-4o', label: 'GPT-4o' },
      { id: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }
    ]
  },
  alibaba: {
    id: 'alibaba',
    label: '阿里通义千问 (Alibaba)',
    icon: '🐱',
    variants: [
      { id: 'standard', label: '普通用户 (Standard)', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1' },
      { id: 'coding_plan', label: 'Coding Plan 用户', baseUrl: 'https://coding.dashscope.aliyuncs.com/compatible-mode/v1' }
    ],
    models: [
      { id: 'qwen-max', label: 'Qwen Max' },
      { id: 'qwen-turbo', label: 'Qwen Turbo' },
      { id: 'qwen-plus', label: 'Qwen Plus' },
      { id: 'qwen-long', label: 'Qwen Long' }
    ]
  },
  deepseek: {
    id: 'deepseek',
    label: 'DeepSeek',
    icon: '🐋',
    variants: [
      { id: 'default', label: '默认 (Default)', baseUrl: 'https://api.deepseek.com' }
    ],
    models: [
      { id: 'deepseek-chat', label: 'DeepSeek Chat' },
      { id: 'deepseek-coder', label: 'DeepSeek Coder' }
    ]
  },
  anthropic: {
    id: 'anthropic',
    label: 'Anthropic Claude',
    icon: '🧠',
    variants: [
      { id: 'default', label: '默认 (Default)', baseUrl: 'https://api.anthropic.com/v1' }
    ],
    models: [
      { id: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
      { id: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet' },
      { id: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku' }
    ]
  }
};
