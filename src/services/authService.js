import { apiRequest } from "./api"

// 🔥 Login
export const loginApi = (data) => {
    return apiRequest("/auth/login", "POST", data)
}

// 🔥 Lấy thông tin user hiện tại (nếu có API)
export const getMe = () => {
    return apiRequest("/users/me", "GET")
}

// 🔥 Logout (optional - backend có thì dùng)
export const logoutApi = () => {
    return apiRequest("/auth/logout", "POST")
}