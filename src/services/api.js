const BASE_URL = "https://localhost:5000/api"

export async function apiRequest(endpoint, method = "GET", body = null) {
    const token = localStorage.getItem("token")

    const res = await fetch(BASE_URL + endpoint, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` })
        },
        body: body ? JSON.stringify(body) : null
    })

    if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || "API error")
    }

    return res.json()
}