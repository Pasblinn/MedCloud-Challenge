const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://backend:3001',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api'
      },
      onError: function(err, req, res) {
        console.error('Proxy error:', err);
        res.status(500).send('Proxy error');
      },
      logLevel: 'warn'
    })
  );
};