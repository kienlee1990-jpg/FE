import { expireAuthSession, isTokenExpired } from "../utils/authSession"

const BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.DEV ? "http://localhost:5000/api" : "/api")

const PUBLIC_AUTH_ENDPOINTS = [
    "/auth/login",
    "/auth/forgot-password",
    "/auth/reset-password"
]

const isPublicAuthEndpoint = (endpoint) => {
    const normalized = String(endpoint || "").split("?")[0].toLowerCase()
    return PUBLIC_AUTH_ENDPOINTS.some(path => normalized === path)
}

const getPayloadCode = (payload) =>
    String(payload?.code || payload?.Code || payload?.error || payload?.Error || "").toUpperCase()

const getPayloadMessage = (payload) =>
    String(payload?.message || payload?.Message || payload?.title || payload?.Title || "").toUpperCase()

const shouldExpireSession = (status, payload) => {
    if (status === 401) return true
    if (status !== 403) return false

    const authSignal = `${getPayloadCode(payload)} ${getPayloadMessage(payload)}`
    return /ACCOUNT_INACTIVE|SESSION_EXPIRED|TOKEN_EXPIRED|INVALID_TOKEN|HET HAN|HẾT HẠN|BI KHOA|BỊ KHÓA/.test(authSignal)
}

async function parseResponse(res) {
    if (res.status === 204) {
        return null
    }

    const contentType = res.headers.get("content-type") || ""

    if (contentType.includes("application/json")) {
        return res.json()
    }

    const text = await res.text()
    return text ? { message: text } : null
}

export async function apiRequest(endpoint, method = "GET", body = null) {
    const token = localStorage.getItem("token")
    const isPublicEndpoint = isPublicAuthEndpoint(endpoint)

    if (!isPublicEndpoint && token && isTokenExpired(token)) {
        expireAuthSession()
        throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.")
    }

    const res = await fetch(BASE_URL + endpoint, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` })
        },
        body: body ? JSON.stringify(body) : null
    })

    const payload = await parseResponse(res)

    if (!res.ok) {
        if (!isPublicEndpoint && shouldExpireSession(res.status, payload)) {
            expireAuthSession()
        }

        const error = new Error(
            payload?.message ||
            payload?.Message ||
            payload?.title ||
            "API error"
        )
        error.status = res.status
        error.code = payload?.code || payload?.Code || ""
        throw error
    }

    return payload
}


