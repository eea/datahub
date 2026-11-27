const eeaWebsite = {
  target: 'https://www.eea.europa.eu',
  secure: true,
  changeOrigin: true,
  pathRewrite: { '^/eea-website': '/++api++/en/datahub' },
};

module.exports = {
  '/geonetwork': {
    target: 'http://localhost:7979',
    secure: true,
    logLevel: 'debug',
    changeOrigin: true,
  },
  '/eea-website/@actions': eeaWebsite,
  '/eea-website/@navigation': eeaWebsite,
};
