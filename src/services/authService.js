import { apiRequest } from "./api"

// ðŸ”¥ Đăng nhập
export const loginApi = (data) => {
    return apiRequest("/auth/login", "POST", data)
}

// 🔥 Lấy thông tin user hiện tại (nếu có API)
export const getMe = () => {
    return apiRequest("/auth/me", "GET")
}

// 🔥 Logout (optional - backend có thì dùng)
export const logoutApi = (refreshToken) => {
    return apiRequest("/auth/logout", "DELETE", { refreshToken })
}

export const requestPasswordResetApi = (data) => {
    return apiRequest("/auth/forgot-password", "POST", data)
}

export const resetPasswordApi = (data) => {
    return apiRequest("/auth/reset-password", "POST", data)
}


