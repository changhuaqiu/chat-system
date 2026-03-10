/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 像素主题色 - 8-bit 复古调色板
        pixel: {
          black: '#000000',
          dark: '#1a1a2e',
          'gray-dark': '#374151',
          gray: '#6b7280',
          white: '#ffffff',
          primary: '#6366f1',
          'primary-dark': '#4f46e5',
          'accent-cyan': '#00f3ff',
          'accent-green': '#00ff88',
          'accent-pink': '#f43f5e',
          'accent-orange': '#f97316',
          'accent-purple': '#bc13fe',
        },
        // 背景色
        bg: {
          primary: '#0f0f23',
          secondary: '#1a1a2e',
          card: '#12121f',
          input: '#0a0a15',
        },
        // 边框色
        border: {
          DEFAULT: '#374151',
          light: '#4b5563',
          highlight: '#6366f1',
        },
        // 协作模式色
        'mode-war': '#ef4444',
        'mode-chat': '#3b82f6',
        'mode-panel': '#8b5cf6',
        'mode-standalone': '#10b981',
      },
      fontFamily: {
        'pixel-title': ['"Press Start 2P"', 'monospace'],
        'pixel-body': ['VT323', 'monospace'],
        'pixel': ['"Press Start 2P"', 'VT323', 'monospace'],
      },
      fontSize: {
        'pixel-xs': '12px',
        'pixel-sm': '14px',
        'pixel-base': '16px',
        'pixel-lg': '18px',
        'pixel-xl': '24px',
        'pixel-2xl': '32px',
        'pixel-3xl': '40px',
      },
      boxShadow: {
        // 像素硬边阴影
        'pixel-sm': '2px 2px 0 #374151',
        'pixel-md': '4px 4px 0 #374151',
        'pixel-lg': '6px 6px 0 #374151',
        'pixel-xl': '8px 8px 0 #374151',
        // 彩色像素阴影
        'pixel-primary-sm': '2px 2px 0 #4f46e5',
        'pixel-primary-md': '4px 4px 0 #4f46e5',
        'pixel-primary-lg': '6px 6px 0 #4f46e5',
        'pixel-cyan': '4px 4px 0 #00f3ff',
        'pixel-green': '4px 4px 0 #00ff88',
        'pixel-pink': '4px 4px 0 #f43f5e',
        'pixel-purple': '4px 4px 0 #bc13fe',
        // 内阴影效果
        'pixel-inset': 'inset 2px 2px 0 rgba(0,0,0,0.5)',
      },
      borderRadius: {
        'pixel': '2px',
        'none': '0',
      },
      borderWidth: {
        'pixel': '4px',
        'pixel-sm': '2px',
      },
      backgroundImage: {
        // 像素图案背景
        'pixel-pattern': 'linear-gradient(45deg, #1a1a2e 25%, transparent 25%), linear-gradient(-45deg, #1a1a2e 25%, transparent 25%)',
        'pixel-dots': 'radial-gradient(circle, #374151 1px, transparent 1px)',
        // 纯色渐变 (无渐变效果，保持兼容)
        'pixel-primary': 'linear-gradient(0deg, #6366f1 0%, #6366f1 100%)',
        'pixel-dark': 'linear-gradient(0deg, #0f0f23 0%, #0f0f23 100%)',
        // Avatar 纯色背景
        'avatar-1': 'linear-gradient(0deg, #6366f1 0%, #6366f1 100%)',
        'avatar-2': 'linear-gradient(0deg, #ec4899 0%, #ec4899 100%)',
        'avatar-3': 'linear-gradient(0deg, #10b981 0%, #10b981 100%)',
        'avatar-4': 'linear-gradient(0deg, #f59e0b 0%, #f59e0b 100%)',
        'avatar-ai': 'linear-gradient(0deg, #8b5cf6 0%, #8b5cf6 100%)',
      },
      backgroundSize: {
        'pixel-pattern': '4px 4px',
        'pixel-dots': '4px 4px',
      },
      keyframes: {
        // 像素闪烁效果
        'pixel-flicker': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.95' },
          '75%': { opacity: '0.98' },
        },
        // 像素抖动效果
        'pixel-shake': {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(1px, 0)' },
          '50%': { transform: 'translate(0, 1px)' },
          '75%': { transform: 'translate(-1px, 0)' },
        },
        // 像素按钮按下效果
        'pixel-press': {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(2px, 2px)' },
        },
        // 打字动画
        'typing-dot': {
          '0%, 60%, 100%': { transform: 'translateY(0)', opacity: '0.4' },
          '30%': { transform: 'translateY(-4px)', opacity: '1' },
        },
        // 淡入
        'fade-in': {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        // 像素弹出
        'pixel-pop': {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '70%': { transform: 'scale(1.05)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        // 在线状态脉冲
        'online-pulse': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.1)' },
        },
        // 扫描线
        'scanline-move': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        // 骨架屏
        'pixel-shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'pixel-flicker': 'pixel-flicker 0.1s infinite',
        'pixel-shake': 'pixel-shake 0.15s infinite',
        'pixel-press': 'pixel-press 0.1s ease-out',
        'pixel-pop': 'pixel-pop 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'typing-dot': 'typing-dot 1.4s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'online-pulse': 'online-pulse 2s ease-in-out infinite',
        'scanline': 'scanline-move 3s linear infinite',
        'pixel-shimmer': 'pixel-shimmer 1.5s ease-in-out infinite',
      },
      spacing: {
        'pixel-1': '4px',
        'pixel-2': '8px',
        'pixel-3': '12px',
        'pixel-4': '16px',
        'pixel-6': '24px',
        'pixel-8': '32px',
      },
    },
  },
  plugins: [],
}
