process.env.EJP_SERVE_WEB = '1';
process.env.EJP_API_PORT ||= process.env.PORT || process.env.EJP_WEB_PORT || '5173';
process.env.EJP_HOST ||= '0.0.0.0';
await import('./index.mjs');
