module.exports = {
  apps: [
    {
      name: 'stock-study-web',
      script: 'npm',
      args: 'run dev',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3090,
      },
      // 로그 설정
      output: './logs/out.log',
      error: './logs/error.log',
      log: './logs/combined.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // 로그 로테이션 설정
      log_type: 'json',
      // PM2 Plus 설정 (선택사항)
      pmx: true,
      automation: false,
    },
  ],
};
