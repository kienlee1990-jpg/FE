const AUTH_STORAGE_KEYS = [
  "token",
  "refreshToken",
  "user",
  "userId",
  "fullName",
  "email"
]

export const clearAuthSession = () => {
  AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key))
}

const decodeBase64Url = (value) => {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/")
  const padded = base64.padEnd(base64.length + ((4 - base64.length % 4) % 4), "=")
  return atob(padded)
}

export const getJwtPayload = (token) => {
  try {
    const payloadPart = String(token || "").split(".")[1]
    if (!payloadPart) return null
    return JSON.parse(decodeBase64Url(payloadPart))
  } catch {
    return null
  }
}

export const isTokenExpired = (token, clockSkewSeconds = 15) => {
  if (!token) return true

  const payload = getJwtPayload(token)
  if (!payload) return true

  const expiresAtSeconds = Number(payload.exp)
  if (!Number.isFinite(expiresAtSeconds)) return false

  return expiresAtSeconds * 1000 <= Date.now() + clockSkewSeconds * 1000
}

export const hasValidAuthToken = () => {
  const token = localStorage.getItem("token")
  if (!token) return false

  if (isTokenExpired(token)) {
    clearAuthSession()
    return false
  }

  return true
}

export const redirectToLogin = () => {
  if (window.location.pathname === "/login") return
  window.location.replace("/login")
}

export const expireAuthSession = ({ redirect = true } = {}) => {
  clearAuthSession()
  if (redirect) {
    redirectToLogin()
  }
}
