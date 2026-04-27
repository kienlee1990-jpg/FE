<template>
    <section class="login-page" :class="theme" @mousemove="handleMouseMove">

        <!-- ðŸ’Ž GLOW -->
        <div class="glow" :style="glowStyle"></div>

        <!-- LEFT PANEL -->
        <div class="left-panel">
            <div class="overlay"></div>
            <div class="content">
                <img class="hero-illustration" :src="policeIllustration" alt="Minh họa ngành công an" />
                <div class="hero-copy">
                    <h2>Hệ thống theo dõi chỉ tiêu công tác</h2>
                    <p>
                        Hỗ trợ giao chỉ tiêu, cập nhật kết quả thực hiện, tổng hợp số liệu và đánh giá phục vụ công tác
                        điều hành.
                    </p>
                </div>
            </div>
        </div>

        <!-- RIGHT PANEL -->
        <div class="right-panel">
            <div class="glass-card" :class="{ fadeOut: isSuccess }">

                <!-- ðŸŒ™ THEME TOGGLE -->
                <div class="theme-toggle" @click="toggleTheme">
                    {{ theme === 'dark' ? '🌙' : '☀️' }}
                </div>

                <h3 class="mb-4">Đăng nhập</h3>

                <form @submit.prevent="handleLogin">

                    <!-- USERNAME -->
                    <div class="mb-3">
                        <input v-model="username" class="form-control" placeholder="Tên đăng nhập" />
                        <small class="text-danger">{{ usernameError }}</small>
                    </div>

                    <!-- PASSWORD -->
                    <div class="mb-3 position-relative">
                        <input :type="showPassword ? 'text' : 'password'" v-model="password" class="form-control"
                            placeholder="Mật khẩu" />
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
                        {{ loading ? "Đang đăng nhập..." : "Đăng nhập" }}
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
    import policeIllustration from "../assets/police-login-illustration.svg"

    const router = useRouter()
    const { login, loading, error } = useAuth()

    const username = ref("")
    const password = ref("")
    const usernameError = ref("")
    const passwordError = ref("")
    const showPassword = ref(false)
    const isSuccess = ref(false)

    // ðŸŒ™ THEME
    const theme = ref(localStorage.getItem("theme") || "light")
    const toggleTheme = () => {
        theme.value = theme.value === "light" ? "dark" : "light"
        localStorage.setItem("theme", theme.value)
    }

    // ðŸ”¥ AUTO REDIRECT IF TOKEN EXISTS
    onMounted(() => {
        const token = localStorage.getItem("token")
        if (token) router.push("/dashboard")
    })

    // ðŸ’Ž GLOW EFFECT
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
            usernameError.value = "Vui lòng nhập tên đăng nhập"
            return
        }
        if (!password.value) {
            passwordError.value = "Vui lòng nhập mật khẩu"
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

    /* ðŸ’Ž GLOW */
    .glow {
        position: absolute;
        inset: 0;
        pointer-events: none;
        transition: 0.1s;
    }

    /* LEFT PANEL */
    .left-panel {
        flex: 1;
        background:
            radial-gradient(circle at top, rgba(255, 215, 120, 0.18), transparent 36%),
            linear-gradient(160deg, #08214a 0%, #0b3d7a 52%, #061731 100%);
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
    }

    .content {
        z-index: 2;
        text-align: center;
        width: min(100%, 520px);
        padding: 40px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 28px;
    }

    .overlay {
        position: absolute;
        inset: 0;
        background:
            linear-gradient(180deg, rgba(5, 16, 38, 0.15), rgba(5, 16, 38, 0.35)),
            radial-gradient(circle at 20% 20%, rgba(255, 232, 163, 0.16), transparent 22%);
    }

    .hero-illustration {
        width: min(100%, 420px);
        height: auto;
        display: block;
        filter: drop-shadow(0 24px 40px rgba(0, 0, 0, 0.28));
    }

    .hero-copy {
        max-width: 420px;
    }

    .hero-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 8px 16px;
        border-radius: 999px;
        background: rgba(255, 214, 102, 0.18);
        border: 1px solid rgba(255, 214, 102, 0.38);
        color: #fbe39c;
        font-size: 0.82rem;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        margin-bottom: 18px;
    }

    .hero-copy h2 {
        margin: 0 0 14px;
        font-size: 2rem;
        font-weight: 800;
        line-height: 1.25;
        color: #ffffff;
    }

    .hero-copy p {
        margin: 0;
        color: rgba(255, 255, 255, 0.84);
        font-size: 1rem;
        line-height: 1.7;
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

        .login-page {
            width: 100%;
            left: 0;
        }
    }
</style>

