import axios from "axios"
import { expireAuthSession, isTokenExpired } from "../utils/authSession"

const BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.DEV ? "http://localhost:5000/api" : "/api")

const httpClient = axios.create({
    baseURL: BASE_URL
})

httpClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token")

    if (token && isTokenExpired(token)) {
        expireAuthSession()
        return Promise.reject(new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."))
    }

    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})

httpClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error?.response?.status === 401) {
            expireAuthSession()
        }

        return Promise.reject(error)
    }
)

export default httpClient


