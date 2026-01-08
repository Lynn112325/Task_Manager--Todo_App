import axios from 'axios';
import Cookies from "js-cookie";

axios.defaults.baseURL = "http://localhost:8080";
axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = "XSRF-TOKEN";
axios.defaults.xsrfHeaderName = "X-XSRF-TOKEN";

const csrfToken = Cookies.get("XSRF-TOKEN");
// console.log("CSRF:", csrfToken);

axios.interceptors.request.use((config) => {
    const token = Cookies.get("XSRF-TOKEN");
    if (token) {
        config.headers["X-XSRF-TOKEN"] = token;
    }
    return config;
});

axios.interceptors.response.use(
    (response) => response,
    (error) => {
        const { status, config } = error.response || {};

        if (status === 401) {
            // Skip redirect if the failed request is a status check or login
            const silentApis = ['/api/user/me', '/api/csrf', '/login'];
            const isSilent = silentApis.some(url => config.url.includes(url));
            if (!isSilent) {
                console.warn("Session expired, redirecting to login...");
                sessionStorage.removeItem("currentUser");
                window.location.hash = "/";
            }
        }

        // Always reject the promise so the caller (e.g., LoginPage) can handle it
        return Promise.reject(error);
    }
);


export default axios;