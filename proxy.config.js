module.exports = {
  '/geonetwork': {
    target: 'http://localhost:7979',
    secure: true,
    logLevel: 'debug',
    changeOrigin: true,
  },
  '/eea-website': {
    target: 'https://www.eea.europa.eu',
    secure: true,
    changeOrigin: true,
    pathRewrite: { '^/eea-website': '/++api++/en/datahub' },
  },
};
