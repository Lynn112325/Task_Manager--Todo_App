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

export default axios;