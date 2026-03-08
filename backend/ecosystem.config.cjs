// PM2 生态系统配置
module.exports = {
  apps: [
    {
      name: 'chat-backend',
      script: 'src/server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      error_file: '/var/log/chat-system/error.log',
      out_file: '/var/log/chat-system/out.log',
      log_file: '/var/log/chat-system/combined.log',
      time: true,
    },
  ],
};
