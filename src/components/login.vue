<template>
    <section class="login-page" :class="theme" @mousemove="handleMouseMove">

        <!-- 💎 GLOW -->
        <div class="glow" :style="glowStyle"></div>

        <!-- LEFT PANEL -->
        <div class="left-panel">
            <div class="overlay"></div>
            <div class="content">
                <!-- Logo hoặc hình ảnh có thể đặt ở đây -->
            </div>
        </div>

        <!-- RIGHT PANEL -->
        <div class="right-panel">
            <div class="glass-card" :class="{ fadeOut: isSuccess }">

                <!-- 🌙 THEME TOGGLE -->
                <div class="theme-toggle" @click="toggleTheme">
                    {{ theme === 'dark' ? '🌙' : '☀️' }}
                </div>

                <h3 class="mb-4">Sign in</h3>

                <form @submit.prevent="handleLogin">

                    <!-- USERNAME -->
                    <div class="mb-3">
                        <input v-model="username" class="form-control" placeholder="Username" />
                        <small class="text-danger">{{ usernameError }}</small>
                    </div>

                    <!-- PASSWORD -->
                    <div class="mb-3 position-relative">
                        <input :type="showPassword ? 'text' : 'password'" v-model="password" class="form-control"
                            placeholder="Password" />
                        <span class="toggle-password" @click="showPassword = !showPassword">
                            <i :class="showPassword ? 'fa fa-eye-slash' : 'fa fa-eye'"></i>
                        </span>
                        <small class="text-danger">{{ passwordError }}</small>
                    </div>

                    <!-- ERROR MESSAGE -->
                    <div v-if="error" class="alert alert-danger py-2">
                        {{ error }}
                    </div>

                    <!-- LOGIN BUTTON -->
                    <button class="btn-login" type="submit" :disabled="loading">
                        <span v-if="loading" class="spinner"></span>
                        {{ loading ? "Logging in..." : "Login" }}
                    </button>

                </form>
            </div>
        </div>

    </section>
</template>

<script setup>
    import { ref, onMounted, computed } from "vue"
    import { useRouter } from "vue-router"
    import { useAuth } from "../composables/useAuth"

    const router = useRouter()
    const { login, loading, error } = useAuth()

    const username = ref("")
    const password = ref("")
    const usernameError = ref("")
    const passwordError = ref("")
    const showPassword = ref(false)
    const isSuccess = ref(false)

    // 🌙 THEME
    const theme = ref(localStorage.getItem("theme") || "light")
    const toggleTheme = () => {
        theme.value = theme.value === "light" ? "dark" : "light"
        localStorage.setItem("theme", theme.value)
    }

    // 🔥 AUTO REDIRECT IF TOKEN EXISTS
    onMounted(() => {
        const token = localStorage.getItem("token")
        if (token) router.push("/dashboard")
    })

    // 💎 GLOW EFFECT
    const x = ref(0)
    const y = ref(0)
    const handleMouseMove = (e) => {
        x.value = e.clientX
        y.value = e.clientY
    }
    const glowStyle = computed(() => ({
        background: `radial-gradient(circle at ${x.value}px ${y.value}px, rgba(99,102,241,0.25), transparent 40%)`
    }))

    // ✅ HANDLE LOGIN
    const handleLogin = async () => {
        usernameError.value = ""
        passwordError.value = ""

        if (!username.value) {
            usernameError.value = "Username required"
            return
        }
        if (!password.value) {
            passwordError.value = "Password required"
            return
        }

        const loggedUser = await login(username.value, password.value)

        if (loggedUser) {
            isSuccess.value = true
            // ❌ Không router.push ở đây, đã xử lý trong useAuth
        }
    }
</script>

<style scoped>
    html,
    body {
        margin: 0;
        height: 100%;
    }

    /* PAGE */
    .login-page {
        display: flex;
        min-height: 100vh;
        width: 70%;
        position: absolute;
        left: 15%;
        overflow: hidden;
    }

    /* 💎 GLOW */
    .glow {
        position: absolute;
        inset: 0;
        pointer-events: none;
        transition: 0.1s;
    }

    /* LEFT PANEL */
    .left-panel {
        flex: 1;
        background: url("https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/img3.webp") center/cover;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
    }

    .content {
        z-index: 2;
        text-align: center;
    }

    /* RIGHT PANEL */
    .right-panel {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    /* CARD */
    .glass-card {
        width: 100%;
        max-width: 360px;
        padding: 40px;
        border-radius: 20px;
        backdrop-filter: blur(12px);
        transition: 0.4s;
        position: relative;
    }

    /* LIGHT THEME */
    .light .right-panel {
        background: linear-gradient(135deg, #f8fafc, #e2e8f0);
    }

    .light .glass-card {
        background: rgba(255, 255, 255, 0.7);
        color: #1e293b;
    }

    /* DARK THEME */
    .dark .right-panel {
        background: #0f172a;
    }

    .dark .glass-card {
        background: rgba(255, 255, 255, 0.05);
        color: white;
    }

    /* INPUT */
    .form-control {
        width: 100%;
        padding: 12px;
        border-radius: 10px;
        border: none;
        margin-bottom: 10px;
    }

    /* BUTTON */
    .btn-login {
        width: 100%;
        padding: 12px;
        border-radius: 10px;
        background: linear-gradient(135deg, #4f46e5, #6366f1);
        color: white;
        border: none;
    }

    /* TOGGLE PASSWORD */
    .toggle-password {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        cursor: pointer;
        color: #64748b;
    }

    /* SPINNER */
    .spinner {
        width: 16px;
        height: 16px;
        border: 2px solid white;
        border-top: 2px solid transparent;
        border-radius: 50%;
        display: inline-block;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    /* FADE ANIMATION */
    .fadeOut {
        opacity: 0;
        transform: scale(0.95);
    }

    /* THEME TOGGLE */
    .theme-toggle {
        position: absolute;
        top: 15px;
        right: 20px;
        cursor: pointer;
    }

    /* RESPONSIVE */
    @media (max-width: 768px) {
        .left-panel {
            display: none;
        }
    }
</style>