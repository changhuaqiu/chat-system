import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { useNavigate } from 'react-router-dom';

// LLM Provider Configuration
const PROVIDER_CONFIG = {
  openai: {
    id: 'openai',
    label: 'OpenAI',
    icon: '🤖',
    baseUrl: 'https://api.openai.com/v1',
    models: [
      { id: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
      { id: 'gpt-4o', label: 'GPT-4o' },
      { id: 'gpt-4o-mini', label: 'GPT-4o Mini' },
      { id: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }
    ]
  },
  alibaba: {
    id: 'alibaba',
    label: '阿里通义千问',
    icon: '🐱',
    // 支持普通用户和 Coding Plan 用户不同 baseUrl
    variants: [
      {
        id: 'standard',
        label: '普通用户',
        baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        description: '适用于DashScope 普通用户'
      },
      {
        id: 'coding',
        label: 'Coding Plan 用户',
        baseUrl: 'https://coding.dashscope.aliyuncs.com/compatible-mode/v1',
        description: '适用于阿里云 Coding Plan 订阅用户'
      }
    ],
    models: [
      { id: 'qwen-max', label: 'Qwen Max' },
      { id: 'qwen-plus', label: 'Qwen Plus' },
      { id: 'qwen-turbo', label: 'Qwen Turbo' },
      { id: 'qwen-long', label: 'Qwen Long' }
    ]
  },
  deepseek: {
    id: 'deepseek',
    label: 'DeepSeek',
    icon: '🐋',
    baseUrl: 'https://api.deepseek.com',
    models: [
      { id: 'deepseek-chat', label: 'DeepSeek Chat' },
      { id: 'deepseek-coder', label: 'DeepSeek Coder' }
    ]
  },
  anthropic: {
    id: 'anthropic',
    label: 'Anthropic Claude',
    icon: '🧠',
    baseUrl: 'https://api.anthropic.com/v1',
    models: [
      { id: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
      { id: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
      { id: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku' }
    ]
  },
  gemini: {
    id: 'gemini',
    label: 'Google Gemini',
    icon: '✨',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    models: [
      { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
      { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
      { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' }
    ]
  }
};

function AdminPage() {
  const navigate = useNavigate();
  const [bots, setBots] = useState([]);
  const [showWizard, setShowWizard] = useState(false);

  // Wizard State
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProvider, setSelectedProvider] = useState(null); // 当前选中的厂商
  const [selectedVariant, setSelectedVariant] = useState('standard'); // 阿里云区分普通/Coding Plan
  const [wizardData, setWizardData] = useState({
    id: '',
    name: '',
    provider_type: '', // openclaw, claude, api, custom
    llm_provider: '', // openai, alibaba, deepseek, anthropic, gemini
    model: '',
    variant: 'standard', // alibaba 专属：standard 或 coding
    config: {}
  });
  const [testStatus, setTestStatus] = useState('idle'); // idle, connecting, success, error

  // Load Bots
  useEffect(() => {
    loadBots();
  }, []);

  const loadBots = async () => {
    try {
      const data = await apiService.getBots();
      setBots(data.bots || []);
    } catch (err) {
      console.error('Failed to load bots', err);
    }
  };

  const deleteBot = async (id) => {
      if (!window.confirm('确定要删除这个 Agent 吗？')) return;
      try {
          await apiService.deleteBot(id);
          loadBots();
      } catch (err) {
          alert('删除失败: ' + err.message);
      }
  };

  // Wizard Handlers
  const openWizard = () => {
    setWizardData({ id: '', name: '', provider_type: '', llm_provider: '', model: '', variant: 'standard', config: {} });
    setCurrentStep(1);
    setSelectedProvider(null);
    setSelectedVariant('standard');
    setTestStatus('idle');
    setShowWizard(true);
  };

  const closeWizard = () => {
    setShowWizard(false);
  };

  const selectType = (type) => {
    let defaultProvider = 'llm';
    if (type === 'openclaw') defaultProvider = 'openclaw';
    if (type === 'claude') defaultProvider = 'cli';
    if (type === 'api') defaultProvider = 'llm';

    setWizardData(prev => ({ ...prev, provider_type: defaultProvider }));
  };

  // 选择 LLM 厂商
  const selectProvider = (providerId) => {
    const provider = PROVIDER_CONFIG[providerId];
    setSelectedProvider(providerId);

    // 自动设置默认 variant（如果有）
    if (provider.variants) {
      const defaultVariant = provider.variants[0];
      setSelectedVariant(defaultVariant.id);
      setWizardData(prev => ({
        ...prev,
        llm_provider: providerId,
        model: provider.models[0]?.id || '',
        variant: defaultVariant.id,
        config: {
          ...prev.config,
          baseUrl: defaultVariant.baseUrl,
          model: provider.models[0]?.id || ''
        }
      }));
    } else {
      setWizardData(prev => ({
        ...prev,
        llm_provider: providerId,
        model: provider.models[0]?.id || '',
        config: {
          ...prev.config,
          baseUrl: provider.baseUrl,
          model: provider.models[0]?.id || ''
        }
      }));
    }
  };

  // 选择 Variant（阿里云普通/Coding Plan）
  const selectVariant = (variantId) => {
    setSelectedVariant(variantId);
    const provider = PROVIDER_CONFIG[wizardData.llm_provider];
    const variant = provider.variants?.find(v => v.id === variantId);

    if (variant) {
      setWizardData(prev => ({
        ...prev,
        variant: variantId,
        config: { ...prev.config, baseUrl: variant.baseUrl }
      }));
    }
  };

  // 选择模型
  const selectModel = (modelId) => {
    setWizardData(prev => ({
      ...prev,
      model: modelId,
      config: { ...prev.config, model: modelId }
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('config.')) {
      const configKey = name.split('.')[1];
      setWizardData(prev => ({
        ...prev,
        config: { ...prev.config, [configKey]: value }
      }));
    } else {
      setWizardData(prev => ({ ...prev, [name]: value }));
    }
  };

  const nextStep = async () => {
    if (currentStep === 1 && !wizardData.provider_type) return;
    
    if (currentStep < 4) {
      const next = currentStep + 1;
      setCurrentStep(next);
      
      if (next === 3) {
        // Start Test
        setTestStatus('connecting');
        
        try {
            const res = await apiService.testBotConnection({
                provider_type: wizardData.provider_type,
                config: wizardData.config
            });
            
            if (res.success) {
                setTestStatus('success');
            } else {
                setTestStatus('error');
                alert(`Connection failed: ${res.error || 'Unknown error'}`);
                // Optional: go back to step 2 automatically or let user click back
            }
        } catch (e) {
            setTestStatus('error');
            alert(`Connection failed: ${e.message}`);
        }
      }
      
      if (next === 4) {
        // Create Bot
        try {
            await apiService.createBot(wizardData);
            loadBots();
        } catch (e) {
            alert('Failed to create bot: ' + e.message);
            // Go back to step 2?
        }
      }
    } else {
      // Finish
      closeWizard();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // Helper to render step indicator
  const renderStepIndicator = (stepNum) => {
    let statusClass = 'bg-[#e5e5ea] text-[#8e8e93]'; // inactive
    let lineClass = 'bg-[#e5e5ea]';

    if (stepNum < currentStep) {
        statusClass = 'bg-[#34c759] text-white'; // completed
        lineClass = 'bg-[#34c759]';
    } else if (stepNum === currentStep) {
        statusClass = 'bg-[#007aff] text-white'; // active
    }

    return (
        <>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[15px] font-semibold transition-all duration-300 ${statusClass}`}>
                {stepNum < currentStep ? '✓' : stepNum}
            </div>
            {stepNum < 4 && <div className={`h-[2px] flex-1 mx-4 transition-all duration-300 ${lineClass}`}></div>}
        </>
    );
  };

  return (
    <>
        <header className="bg-white border-b border-gray-200 px-8 py-5 flex-shrink-0">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight">Agent 管理</h2>
                    <p className="text-sm text-gray-500 mt-1">连接并管理您的 AI 员工</p>
                </div>
                <button onClick={openWizard} className="bg-[#007aff] text-white px-5 py-2.5 rounded-[12px] hover:bg-[#0066cc] transition-all shadow-sm font-medium flex items-center space-x-2 transform active:scale-95">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    <span>添加 Agent</span>
                </button>
            </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
            {/* Filters */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <input type="text" placeholder="搜索..." className="w-80 px-4 py-2.5 pl-10 bg-[#f5f5f7] border-none rounded-[12px] focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" />
                        <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                    <select className="px-4 py-2.5 bg-[#f5f5f7] border-none rounded-[12px] outline-none text-sm font-medium text-gray-700">
                        <option>所有类型</option>
                        <option>OpenClaw</option>
                        <option>Claude Code</option>
                        <option>API</option>
                    </select>
                </div>
            </div>

            {/* Bot Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {bots.map(bot => (
                    <div key={bot.id} className="bg-white rounded-[18px] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center space-x-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
                                    {bot.avatar || bot.name[0]}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-900">{bot.name}</h3>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <span className="text-xs px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium uppercase">
                                            {bot.provider_type}
                                        </span>
                                        <div className="flex items-center space-x-1">
                                            <div className={`w-2 h-2 rounded-full ${bot.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                                            <span className="text-xs text-gray-400 capitalize">{bot.status}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
                            </button>
                        </div>
                        
                        <p className="mt-4 text-sm text-gray-500 line-clamp-2 h-10">
                            {bot.provider_type === 'cli' ? `Command: ${bot.config.command}` : 
                             bot.provider_type === 'llm' ? `Model: ${bot.config.model}` : 'OpenClaw Agent'}
                        </p>
                        
                        <div className="mt-5 pt-5 border-t border-gray-100 flex items-center justify-between">
                            <div className="flex items-center space-x-6">
                                <div className="text-center">
                                    <p className="text-lg font-semibold text-gray-900">{bot.stats?.requests || 0}</p>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">调用次数</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-semibold text-gray-900">{bot.stats?.latency ? `${bot.stats.latency}ms` : '-'}</p>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">延迟</p>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <button className="px-4 py-2 bg-[#f5f5f7] text-[#1d1d1f] text-sm font-medium rounded-xl hover:bg-[#e5e5ea] transition">配置</button>
                                <button onClick={() => deleteBot(bot.id)} className="px-4 py-2 text-red-600 text-sm font-medium hover:bg-red-50 rounded-xl transition">删除</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

      {/* Wizard Modal */}
      {showWizard && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-[24px] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Steps Header */}
                <div className="px-10 pt-8 pb-4">
                    <div className="flex items-center justify-between w-full relative">
                        {/* Connecting Line Background */}
                        <div className="absolute top-4 left-0 w-full h-[2px] bg-[#e5e5ea] -z-10"></div>
                        
                        {/* Connecting Line Progress */}
                        <div 
                            className="absolute top-4 left-0 h-[2px] bg-[#34c759] -z-10 transition-all duration-300"
                            style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                        ></div>

                        {[
                            { step: 1, label: '选择类型' },
                            { step: 2, label: '配置信息' },
                            { step: 3, label: '测试连接' },
                            { step: 4, label: '完成' }
                        ].map((item, index) => {
                            const isCompleted = item.step < currentStep;
                            const isActive = item.step === currentStep;
                            
                            return (
                                <div key={item.step} className="flex flex-col items-center bg-white px-2 z-10">
                                    <div 
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-[15px] font-semibold transition-all duration-300 mb-2
                                        ${isCompleted ? 'bg-[#34c759] text-white' : isActive ? 'bg-[#007aff] text-white' : 'bg-[#e5e5ea] text-[#8e8e93]'}`}
                                    >
                                        {isCompleted ? '✓' : item.step}
                                    </div>
                                    <span className={`text-xs font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                                        {item.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-10 py-6">
                    {/* Step 1: Type Selection */}
                    {currentStep === 1 && (
                        <div className="animate-slide-in">
                            <h3 className="text-2xl font-semibold mb-2">选择 Agent 类型</h3>
                            <p className="text-gray-500 mb-6">选择您想要接入的 Agent 方式</p>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { id: 'openclaw', icon: '🦀', title: 'OpenClaw 节点', desc: '本地原生 Agent' },
                                    { id: 'claude', icon: '🧠', title: 'Claude Code', desc: '编程助手 CLI' },
                                    { id: 'api', icon: '🔌', title: '大模型 API', desc: 'OpenAI / Anthropic' },
                                    { id: 'custom', icon: '⚙️', title: '自定义', desc: 'Webhook 集成' }
                                ].map(type => (
                                    <div 
                                        key={type.id}
                                        onClick={() => selectType(type.id)}
                                        className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                                            (type.id === 'openclaw' && wizardData.provider_type === 'openclaw') ||
                                            (type.id === 'claude' && wizardData.provider_type === 'cli') ||
                                            (type.id === 'api' && wizardData.provider_type === 'llm') 
                                            ? 'border-[#007aff] bg-blue-50' : 'border-gray-100 hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl mb-3">{type.icon}</div>
                                        <h4 className="font-semibold">{type.title}</h4>
                                        <p className="text-sm text-gray-500 mt-1">{type.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Configuration */}
                    {currentStep === 2 && (
                        <div className="animate-slide-in">
                            <h3 className="text-2xl font-semibold mb-2">配置信息</h3>
                            <p className="text-gray-500 mb-6">请输入连接详情</p>
                            
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Bot ID</label>
                                    <input name="id" value={wizardData.id} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#f5f5f7] border-none rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition" placeholder="例如: helper-bot" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">名称</label>
                                    <input name="name" value={wizardData.name} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#f5f5f7] border-none rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition" placeholder="例如: 助手机器人" />
                                </div>

                                {wizardData.provider_type === 'openclaw' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">网关地址</label>
                                            <input name="config.gateway" onChange={handleInputChange} className="w-full px-4 py-3 bg-[#f5f5f7] border-none rounded-xl outline-none" placeholder="http://localhost:8000" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Agent ID</label>
                                            <input name="config.agentId" onChange={handleInputChange} className="w-full px-4 py-3 bg-[#f5f5f7] border-none rounded-xl outline-none" placeholder="agent-123" />
                                        </div>
                                    </>
                                )}

                                {wizardData.provider_type === 'llm' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-3">选择模型服务商</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {Object.values(PROVIDER_CONFIG).map(provider => (
                                                    <div
                                                        key={provider.id}
                                                        onClick={() => selectProvider(provider.id)}
                                                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${wizardData.llm_provider === provider.id ? 'border-[#007aff] bg-blue-50' : 'border-gray-100 hover:border-gray-300'}`}
                                                    >
                                                        <div className="text-2xl mb-2">{provider.icon}</div>
                                                        <div className="font-medium text-gray-900">{provider.label}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Variant Selection for Alibaba */}
                                        {wizardData.llm_provider === 'alibaba' && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">账户类型</label>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {PROVIDER_CONFIG.alibaba.variants.map(variant => (
                                                        <div
                                                            key={variant.id}
                                                            onClick={() => selectVariant(variant.id)}
                                                            className={`cursor-pointer p-3 rounded-xl border-2 transition-all ${wizardData.variant === variant.id ? 'border-[#007aff] bg-blue-50' : 'border-gray-100 hover:border-gray-300'}`}
                                                        >
                                                            <div className="font-medium text-gray-900">{variant.label}</div>
                                                            <div className="text-xs text-gray-500 mt-1">{variant.description}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Model Selection */}
                                        {wizardData.llm_provider && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">选择模型</label>
                                                <select
                                                    value={wizardData.model}
                                                    onChange={(e) => selectModel(e.target.value)}
                                                    className="w-full px-4 py-3 bg-[#f5f5f7] border-none rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition appearance-none cursor-pointer"
                                                >
                                                    {PROVIDER_CONFIG[wizardData.llm_provider]?.models.map(model => (
                                                        <option key={model.id} value={model.id}>{model.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        {/* API Key Input */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">API Key <span className="text-red-500">*</span></label>
                                            <input
                                                name="config.apiKey"
                                                type="password"
                                                value={wizardData.config.apiKey || ''}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 bg-[#f5f5f7] border-none rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition"
                                                placeholder="sk-..."
                                                autoComplete="off"
                                            />
                                            <p className="text-xs text-gray-400 mt-1">
                                                请前往 {wizardData.llm_provider === 'openai' && 'OpenAI Platform'}
                                                {wizardData.llm_provider === 'alibaba' && '阿里云 DashScope 控制台'}
                                                {wizardData.llm_provider === 'deepseek' && 'DeepSeek 开放平台'}
                                                {wizardData.llm_provider === 'anthropic' && 'Anthropic Console'}
                                                {wizardData.llm_provider === 'gemini' && 'Google AI Studio'}
                                                {!wizardData.llm_provider && '服务商平台'} 获取 API Key
                                            </p>
                                        </div>
                                    </>
                                )}
                                )}

                                {wizardData.provider_type === 'cli' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">命令</label>
                                            <input name="config.command" onChange={handleInputChange} className="w-full px-4 py-3 bg-[#f5f5f7] border-none rounded-xl outline-none" placeholder="claude" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">工作目录</label>
                                            <input name="config.cwd" onChange={handleInputChange} className="w-full px-4 py-3 bg-[#f5f5f7] border-none rounded-xl outline-none" placeholder="/path/to/project" />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Test */}
                    {currentStep === 3 && (
                        <div className="animate-slide-in text-center py-8">
                            <h3 className="text-2xl font-semibold mb-2">连接测试</h3>
                            <p className="text-gray-500 mb-8">正在验证您的配置...</p>
                            
                            {testStatus === 'connecting' && (
                                <div>
                                    <div className="w-16 h-16 mx-auto rounded-full border-4 border-gray-200 border-t-[#007aff] animate-spin mb-6"></div>
                                    <p className="font-medium">连接中...</p>
                                </div>
                            )}
                            
                            {testStatus === 'success' && (
                                <div>
                                    <div className="w-16 h-16 mx-auto rounded-full bg-green-500 flex items-center justify-center text-white mb-6">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                    </div>
                                    <p className="font-medium text-green-600">连接成功</p>
                                    <p className="text-sm text-gray-500 mt-2">Agent 已准备就绪</p>
                                </div>
                            )}

                            {testStatus === 'error' && (
                                <div>
                                    <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center text-red-500 mb-6">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </div>
                                    <p className="font-medium text-red-600">连接失败</p>
                                    <p className="text-sm text-gray-500 mt-2">请检查配置后重试</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 4: Finish */}
                    {currentStep === 4 && (
                        <div className="animate-slide-in text-center py-8">
                            <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 flex items-center justify-center text-4xl mb-6">🎉</div>
                            <h3 className="text-2xl font-semibold mb-3">添加成功</h3>
                            <p className="text-gray-500 mb-8">您的新 Agent 已准备就绪</p>
                            
                            <div className="inline-flex items-center space-x-4 px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl">🤖</div>
                                <div className="text-left">
                                    <p className="font-semibold">{wizardData.name}</p>
                                    <p className="text-sm text-gray-500">{wizardData.provider_type}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-10 py-6 border-t border-gray-100 flex justify-between bg-gray-50/50">
                    <button 
                        onClick={prevStep} 
                        className={`px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-200/50 rounded-xl transition-all ${currentStep === 1 ? 'invisible' : ''}`}
                    >
                        上一步
                    </button>
                    <div className="flex space-x-3">
                        <button onClick={closeWizard} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-200/50 rounded-xl transition-all">取消</button>
                        <button 
                            onClick={nextStep}
                            disabled={currentStep === 1 && !wizardData.provider_type || (currentStep === 3 && testStatus !== 'success')}
                            className={`px-6 py-2.5 bg-[#007aff] text-white font-medium rounded-xl hover:bg-[#0066cc] shadow-lg shadow-blue-500/30 transition-all ${
                                (currentStep === 1 && !wizardData.provider_type) || (currentStep === 3 && testStatus !== 'success') 
                                ? 'opacity-50 cursor-not-allowed' : 'transform active:scale-95'
                            }`}
                        >
                            {currentStep === 4 ? '完成' : currentStep === 2 ? '测试连接' : '下一步'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </>
  );
}

export default AdminPage;
