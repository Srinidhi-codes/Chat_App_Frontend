import httpProxy from 'http-proxy';

const proxy = httpProxy.createProxyServer();

export const config = {
    api: {
        bodyParser: false, // Important: disable Next.js body parsing to let proxy handle raw requests
    },
};

export default function handler(req, res) {
    return new Promise((resolve, reject) => {
        // Proxy to your backend
        proxy.web(req, res, { target: process.env.NEXT_PUBLIC_SOCKET_URL }, (err) => {
            if (err) {
                console.error('Proxy error:', err);
                reject(err);
            }
            resolve();
        });
    });
}
