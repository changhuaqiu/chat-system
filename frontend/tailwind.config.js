/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 赛博主题色
        cyber: {
          primary: '#6366f1',
          'primary-light': '#818cf8',
          'primary-dark': '#4f46e5',
        },
        neon: {
          blue: '#00f3ff',
          purple: '#bc13fe',
          pink: '#f43f5e',
          green: '#00ff88',
          orange: '#f97316',
          red: '#ff3860',
        },
        // 背景色
        bg: {
          dark: '#0a0a12',
          darker: '#050508',
          light: '#12121f',
        },
        // 协作模式色
        'mode-war': '#ef4444',
        'mode-chat': '#3b82f6',
        'mode-panel': '#8b5cf6',
        'mode-standalone': '#10b981',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        'gradient-bg': 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
        'mode-war-room': 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(249, 115, 22, 0.15) 100%)',
        'mode-chat-room': 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(14, 165, 233, 0.15) 100%)',
        'mode-panel': 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(168, 85, 247, 0.15) 100%)',
        'mode-standalone': 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(6, 182, 212, 0.15) 100%)',
        'avatar-1': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        'avatar-2': 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
        'avatar-3': 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
        'avatar-4': 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
        'avatar-ai': 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #d946ef 100%)',
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(99, 102, 241, 0.3)',
        'glow-md': '0 0 20px rgba(99, 102, 241, 0.4)',
        'glow-lg': '0 0 40px rgba(99, 102, 241, 0.5)',
        'glow-xl': '0 0 60px rgba(99, 102, 241, 0.6)',
        'neon-blue': '0 0 20px rgba(0, 243, 255, 0.5)',
        'neon-purple': '0 0 20px rgba(188, 19, 254, 0.5)',
        'neon-green': '0 0 20px rgba(0, 255, 136, 0.5)',
      },
      backdropBlur: {
        'glass': '20px',
      },
      borderColor: {
        'glass': 'rgba(255, 255, 255, 0.08)',
        'glass-light': 'rgba(255, 255, 255, 0.05)',
        'primary': 'rgba(99, 102, 241, 0.3)',
        'primary-light': 'rgba(99, 102, 241, 0.5)',
      },
      backgroundColor: {
        'glass': 'rgba(255, 255, 255, 0.05)',
        'card': 'rgba(255, 255, 255, 0.03)',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(16, 185, 129, 0.8)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '0.8' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
        'typing-dot': {
          '0%, 60%, 100%': { transform: 'translateY(0)', opacity: '0.4' },
          '30%': { transform: 'translateY(-4px)', opacity: '1' },
        },
        'fade-in': {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        'fade-in-up': {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-scale': {
          'from': { opacity: '0', transform: 'scale(0.95)' },
          'to': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-left': {
          'from': { opacity: '0', transform: 'translateX(-30px)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-right': {
          'from': { opacity: '0', transform: 'translateX(30px)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '70%': { transform: 'scale(1.05)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 2s ease-out infinite',
        'typing-dot': 'typing-dot 1.4s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-in-up': 'fade-in-up 0.4s ease-out',
        'fade-in-scale': 'fade-in-scale 0.3s ease-out',
        'slide-in-left': 'slide-in-left 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'pop-in': 'pop-in 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
