import axios, {AxiosResponse, InternalAxiosRequestConfig} from "axios";
import {error, getFingerId, warning} from "star-horse-lowcode";
import {i18n} from "@/lang";

const TOKENCONST: string = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdGFyLWhvcnNlLWRldm9wcyIsInN1YiI6IjEwOTQ4IiwiaWF0IjoxNzgyMjcxODk5LCJleHAiOjE3ODIyNzU0OTksInVzZXJJZCI6IjEwOTQ4IiwidXNlcm5hbWUiOiJhZG1pbiIsIm5hbWUiOiLns7vnu5_nrqHnkIblkZgiLCJ0ZW5hbnRJZCI6ImNvbW1vbiIsImRldmljZVR5cGUiOiJwYyIsInNlc3Npb25JZCI6ImM0ZDU4NmU5MjNjODQxM2Y4ZjgxZjM5MjczNDY5N2Y0In0.Z9mzOBp4HJO0lt-cdDd_wOozs71xcdFoEirYr_v6Y6i0R12w7jx3fvuYwAM3VQ35Olw_ZcEyUhySQQwQJzBPQ7VuAmuMUSCqozSpqlO8vM0-bsCIw5cquqOqzfr6BhEfgO0WPCMkqs3u8Z_Vcs80iQpUmyy8XLHRNz74CgqeEx_exY1xxW8lkw84tEg9XgRuyqdcSvkii3v1kuifDQuUzo8sk2n1YfbymzRzLwE-EaDwg3ut7EdbNo2gUnrW3efvbkKWZRrySHgSNmyU5bwfks18DY5U8gFFv8HvpKG7b74mQwwY_E8T8uJcWUFhoUnIMx4dl5ztC1-mYdzuWevlxQ";
const axiosInstance = axios.create({
    baseURL: "/",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json; charset=utf-8",
    },
    withCredentials: true,

});
// 添加请求拦截器
axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = TOKENCONST;
        const fingerToken = getFingerId();
        // 请求头带上token
        if (token && config.headers) {
            config.headers.token = token;
            config.headers["Authorization"] = `Bearer ${token}`;
            config.headers["Finger-Token"] = fingerToken;
            config.headers["menuPosition"] = "";
            config.headers["lang"] = "zh_Cn";
        }
        return config;
    },
    (error: any) => {
        // 对请求错误做些什么
        return Promise.reject(error);
    },
);


// 添加响应拦截器
axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
        const code = response.data?.code;
        // 401 未登录
        if (code === 401) {
            warning(i18n("dyform.api.sessionExpired"))
        } else {
            return response;
        }
    },
    (err) => {
        let data = err?.response?.status ?? err.toString().toLowerCase();
        data = String(data);
        if (data === "401" || data?.includes("status code 401")) {
            warning(i18n("dyform.api.sessionExpired"))
        } else if (data === "500" || data?.includes("status code 500")) {
            error(i18n("dyform.api.serverError"));
            return Promise.reject(err);
        } else {
            // 对响应错误做点什么
            return Promise.reject(err);
        }
    },
);
export {axiosInstance};
