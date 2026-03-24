import axios from 'axios';


const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

api.defaults.withCredentials = true;

let retryCount = 0;
const MAX_RETRIES = 3;

api.interceptors.response.use(
    (response) => {
        retryCount = 0;
        return response;
    },
    async (error) => {
        const config = error.config;

        if (!config || !error.response) {
            return Promise.reject(error);
        }

        if (error.response.status === 429 && retryCount < MAX_RETRIES) {
            retryCount++;
            const retryAfter = error.response.headers['retry-after'];
            const delay = retryAfter ? parseInt(retryAfter) * 1000 : Math.min(1000 * Math.pow(2, retryCount), 10000);

            await new Promise(resolve => setTimeout(resolve, delay));
            return api(config);
        }

        if (error.response.status >= 500 && retryCount < MAX_RETRIES) {
            retryCount++;
            const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);

            await new Promise(resolve => setTimeout(resolve, delay));
            return api(config);
        }

        retryCount = 0;
        return Promise.reject(error);
    }
);

export default api;