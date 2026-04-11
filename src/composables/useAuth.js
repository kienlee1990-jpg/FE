import { ref } from "vue"
import { useRouter } from "vue-router"
import { loginApi, getMe as getMeApi } from "../services/authService"

export function useAuth() {
    const router = useRouter()
    const loading = ref(false)
    const error = ref("")
    const user = ref(null)

    // 🔑 LOGIN
    const login = async (username, password) => {
        error.value = ""
        loading.value = true

        try {
            const res = await loginApi({ email: username, password })

            const token = res.accessToken || res.token
            const userData = res.user || res

            if (!token) throw new Error("Không nhận được token")

            // ✅ Check isActive 1 lần
            if (userData.isActive === 0) {
                error.value = "Tài khoản đang bị khóa hoặc chưa kích hoạt!"
                return null
            }

            // Chỉ lưu token & user khi isActive === 1
            localStorage.setItem("token", token)
            localStorage.setItem("user", JSON.stringify(userData))
            user.value = userData

            router.push("/dashboard")
            return userData
        } catch (err) {
            error.value = err.message || "Login failed"
            return null
        } finally {
            loading.value = false
        }
    }

    const logout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        user.value = null
        router.push("/login")
    }

    const isAuthenticated = () => !!localStorage.getItem("token")

    const getMe = async () => {
        try {
            const data = await getMeApi()

            if (data.isActive === 0) {
                logout()
                return null
            }

            user.value = data
            localStorage.setItem("user", JSON.stringify(data))

            return data
        } catch (err) {
            console.log(err.message)
            logout()
            return null
        }
    }

    return { login, logout, getMe, user, isAuthenticated, loading, error }
}