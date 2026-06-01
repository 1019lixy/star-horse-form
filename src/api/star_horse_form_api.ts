import axios, {AxiosResponse, InternalAxiosRequestConfig} from "axios";
import {error, getFingerId, warning} from "star-horse-lowcode";
import {i18n} from "@/lang";

const TOKENCONST: string = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdGFyLWhvcnNlLWRldm9wcyIsInN1YiI6IjEwOTQ4IiwiaWF0IjoxNzgwMzAzNzg2LCJleHAiOjE3ODAzMDczODYsInVzZXJJZCI6IjEwOTQ4IiwidXNlcm5hbWUiOiJhZG1pbiIsIm5hbWUiOiLns7vnu5_nrqHnkIblkZgiLCJ0ZW5hbnRJZCI6ImNvbW1vbiIsImRldmljZVR5cGUiOiJwYyIsInNlc3Npb25JZCI6InNoYWRiNDNmMGY2NjBlNGI1NjllMzQ3NjllYzdlZDJmMTEifQ.bk0bhNpzG-BxUde9N4GLOItqDRPlvJubaZQU4BgsoJ0plcgSv26uSZk7S00RKc5Ebji0Nak77Spg3oVQHORfqAFncrDa3OKfo2jyI4Lk3X53-ed2yeEAqaX2D9mj7l-Gl2-kgN0koH8ALjyBV3vius2Nq8tmJUBYOm8VR-ekVina2WfsRqxlYIWGIMIAMQOcMFuX3-85tkopT_uLoVDZtysGuVT1PcdSTnjj_oeJQmIzI31xAKVtb12EmG7XZZKREUIcFSSupCVhJTtKxEyX1e819h7khGH1t7qw5M-9QUQzDNMPuJSQ7q7AqXJBxvRDkgqc_Xn3po6UPN-rJlQ6CA";
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
