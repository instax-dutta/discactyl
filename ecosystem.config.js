module.exports = {
  apps: [{
    name: 'discactyl',
    script: 'dist/index.js',
    instances: 1,
    restart_delay: 5000,
    max_restarts: 10,
    env: {
      NODE_ENV: 'production',
    },
  }],
};
