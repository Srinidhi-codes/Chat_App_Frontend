// pages/api/graphql.js
import httpProxy from 'http-proxy';

const proxy = httpProxy.createProxyServer();

export const config = {
    api: {
        bodyParser: false,  // Important! Let proxy handle the raw body
    },
};

export default function handler(req, res) {
    return new Promise((resolve, reject) => {
        // Forward the request to your backend
        proxy.web(req, res, {
            target: 'https://chat-app-backend-g8as.onrender.com',
            changeOrigin: true,
            secure: true,
        }, (err) => {
            if (err) {
                console.error('Proxy error:', err);
                reject(err);
            }
            resolve();
        });
    });
}
