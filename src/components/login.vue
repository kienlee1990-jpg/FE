<template>
    <section class="login-page" :class="theme" @mousemove="handleMouseMove">
        <div class="glow" :style="glowStyle"></div>
        <div class="aurora aurora-one"></div>
        <div class="aurora aurora-two"></div>
        <div class="aurora aurora-three"></div>
        <div class="hex-grid"></div>
        <div class="hud-ring hud-ring-left"></div>
        <div class="hud-ring hud-ring-right"></div>
        <div class="digital-code digital-code-left">0101 KPI DATA 1100 AI REPORT 0011</div>
        <div class="digital-code digital-code-right">CAND SYSTEM 1010 SECURE 0110</div>
        <div class="particle-field" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
        </div>
        <div class="tech-grid tech-grid-left"></div>
        <div class="tech-grid tech-grid-right"></div>
        <div class="circuit-lines circuit-lines-left"></div>
        <div class="circuit-lines circuit-lines-bottom"></div>

        <div class="login-shell">
            <div class="ai-orb">
                <span></span>
            </div>

            <div class="glass-card" :class="{ fadeOut: isSuccess }">
                <div class="card-shine"></div>
                <div class="scan-line"></div>
                <button class="theme-toggle" type="button" @click="toggleTheme" aria-label="Đổi giao diện">
                    {{ theme === "dark" ? "Sáng" : "Tối" }}
                </button>

                <div class="brand-mark">
                    <img src="/logo.png" alt="Công an nhân dân" />
                </div>

                <div class="login-heading">
                    <h1>Hệ thống theo dõi đánh giá kết quả chỉ tiêu</h1>
                    <div class="heading-subtitle">
                        <span>Công an thành phố Đà Nẵng</span>
                        <span>Quản lý giao chỉ tiêu - theo dõi tiến độ - tổng hợp đánh giá</span>
                    </div>
                </div>

                <form @submit.prevent="handleLogin">
                    <div class="field-group">
                        <label class="field-control">
                            <span class="field-icon">
                                <i class="bi bi-person-fill"></i>
                            </span>
                            <input v-model="username" class="form-control" placeholder="Tên đăng nhập" />
                        </label>
                        <small class="text-danger">{{ usernameError }}</small>
                    </div>

                    <div class="field-group">
                        <label class="field-control field-control-dark">
                            <span class="field-icon">
                                <i class="bi bi-lock-fill"></i>
                            </span>
                            <input :type="showPassword ? 'text' : 'password'" v-model="password" class="form-control"
                                placeholder="Mật khẩu" />
                            <button class="toggle-password" type="button" @click="showPassword = !showPassword"
                                aria-label="Hiện hoặc ẩn mật khẩu">
                                <i :class="showPassword ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill'"></i>
                            </button>
                        </label>
                        <small class="text-danger">{{ passwordError }}</small>
                    </div>

                    <div v-if="error" class="alert alert-danger py-2">
                        {{ error }}
                    </div>

                    <div class="action-row">
                        <button class="btn-login" type="submit" :disabled="loading">
                            <span v-if="loading" class="spinner"></span>
                            {{ loading ? "Đang đăng nhập..." : "Đăng nhập" }}
                        </button>
                    </div>
                </form>

                <div class="login-slogan">
                    <strong>Công an nhân dân</strong>
                    <span>Vì nước quên thân, vì dân phục vụ</span>
                    <em>Làm việc khoa học - tăng tốc tiến độ - về đích đúng hạn</em>
                </div>
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

    const theme = ref(localStorage.getItem("theme") || "light")
    const toggleTheme = () => {
        theme.value = theme.value === "light" ? "dark" : "light"
        localStorage.setItem("theme", theme.value)
    }

    onMounted(() => {
        const token = localStorage.getItem("token")
        if (token) router.push("/dashboard")
    })

    const x = ref(0)
    const y = ref(0)
    const handleMouseMove = (e) => {
        x.value = e.clientX
        y.value = e.clientY
    }
    const glowStyle = computed(() => ({
        background: `radial-gradient(circle at ${x.value}px ${y.value}px, rgba(113, 255, 226, 0.22), transparent 38%)`
    }))

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
        }
    }
</script>

<style scoped>
    html,
    body {
        margin: 0;
        height: 100%;
    }

    .login-page {
        isolation: isolate;
        min-height: 100vh;
        width: 100%;
        position: relative;
        overflow: hidden;
        display: grid;
        place-items: center;
        padding: 20px;
        background:
            radial-gradient(circle at 18% 18%, rgba(80, 245, 216, 0.26), transparent 22%),
            radial-gradient(circle at 50% 8%, rgba(255, 239, 165, 0.18), transparent 18%),
            radial-gradient(circle at 82% 30%, rgba(67, 205, 176, 0.30), transparent 28%),
            linear-gradient(120deg, #102b37 0%, #0b5f58 48%, #1da276 100%);
        color: #ffffff;
    }

    .login-page::before,
    .login-page::after {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: -2;
    }

    .login-page::before {
        background:
            linear-gradient(90deg, rgba(132, 255, 226, 0.09) 1px, transparent 1px),
            linear-gradient(180deg, rgba(132, 255, 226, 0.07) 1px, transparent 1px);
        background-size: 84px 84px;
        mask-image: radial-gradient(circle at center, rgba(0, 0, 0, 0.76), transparent 76%);
    }

    .login-page::after {
        background:
            linear-gradient(110deg, transparent 0 18%, rgba(98, 244, 218, 0.18) 18.2% 18.6%, transparent 18.8% 35%, rgba(98, 244, 218, 0.20) 35.2% 35.6%, transparent 35.8% 100%),
            radial-gradient(circle at 50% 55%, rgba(18, 66, 59, 0.40), transparent 52%),
            repeating-linear-gradient(135deg, rgba(255, 255, 255, 0.035) 0 1px, transparent 1px 18px);
        animation: bgDrift 16s ease-in-out infinite alternate;
    }

    .glow {
        position: absolute;
        inset: 0;
        pointer-events: none;
        transition: 0.1s;
        z-index: -1;
    }

    .aurora {
        position: absolute;
        pointer-events: none;
        z-index: -1;
        border-radius: 999px;
        filter: blur(22px);
        mix-blend-mode: screen;
        opacity: 0.78;
        animation: auroraFloat 9s ease-in-out infinite alternate;
    }

    .aurora-one {
        width: 560px;
        height: 160px;
        top: 12%;
        left: 10%;
        background: linear-gradient(90deg, transparent, rgba(112, 255, 224, 0.42), rgba(255, 222, 119, 0.22), transparent);
        transform: rotate(-12deg);
    }

    .aurora-two {
        width: 640px;
        height: 190px;
        right: 3%;
        bottom: 18%;
        background: linear-gradient(90deg, transparent, rgba(38, 214, 187, 0.32), rgba(141, 255, 230, 0.34), transparent);
        animation-delay: -2.6s;
        transform: rotate(16deg);
    }

    .aurora-three {
        width: 360px;
        height: 360px;
        left: 42%;
        top: 30%;
        background: radial-gradient(circle, rgba(255, 234, 133, 0.16), rgba(79, 255, 219, 0.16), transparent 70%);
        animation-delay: -4.2s;
    }

    .hex-grid {
        position: absolute;
        inset: -10%;
        pointer-events: none;
        z-index: -1;
        opacity: 0.24;
        background:
            linear-gradient(30deg, rgba(133, 255, 231, 0.72) 12%, transparent 12.5%, transparent 87%, rgba(133, 255, 231, 0.72) 87.5%, rgba(133, 255, 231, 0.72)),
            linear-gradient(150deg, rgba(133, 255, 231, 0.72) 12%, transparent 12.5%, transparent 87%, rgba(133, 255, 231, 0.72) 87.5%, rgba(133, 255, 231, 0.72)),
            linear-gradient(30deg, rgba(133, 255, 231, 0.72) 12%, transparent 12.5%, transparent 87%, rgba(133, 255, 231, 0.72) 87.5%, rgba(133, 255, 231, 0.72)),
            linear-gradient(150deg, rgba(133, 255, 231, 0.72) 12%, transparent 12.5%, transparent 87%, rgba(133, 255, 231, 0.72) 87.5%, rgba(133, 255, 231, 0.72)),
            linear-gradient(60deg, rgba(255, 224, 115, 0.24) 25%, transparent 25.5%, transparent 75%, rgba(255, 224, 115, 0.24) 75%, rgba(255, 224, 115, 0.24)),
            linear-gradient(60deg, rgba(255, 224, 115, 0.24) 25%, transparent 25.5%, transparent 75%, rgba(255, 224, 115, 0.24) 75%, rgba(255, 224, 115, 0.24));
        background-position: 0 0, 0 0, 36px 63px, 36px 63px, 0 0, 36px 63px;
        background-size: 72px 126px;
        mask-image: radial-gradient(circle at 50% 50%, transparent 0 24%, rgba(0, 0, 0, 0.85) 40%, transparent 83%);
        animation: hexDrift 28s linear infinite;
    }

    .hud-ring {
        position: absolute;
        width: 330px;
        height: 330px;
        border-radius: 50%;
        pointer-events: none;
        z-index: -1;
        opacity: 0.46;
        background:
            conic-gradient(from 0deg, rgba(114, 255, 226, 0), rgba(114, 255, 226, 0.75), rgba(255, 222, 109, 0.45), rgba(114, 255, 226, 0)),
            repeating-conic-gradient(from 0deg, rgba(137, 255, 232, 0.48) 0deg 3deg, transparent 3deg 11deg);
        mask: radial-gradient(circle, transparent 0 48%, #000 49% 51%, transparent 52% 62%, #000 63% 65%, transparent 66%);
        filter: drop-shadow(0 0 18px rgba(104, 255, 225, 0.38));
        animation: hudSpin 18s linear infinite;
    }

    .hud-ring-left {
        left: 5%;
        top: 8%;
    }

    .hud-ring-right {
        right: 4%;
        bottom: 10%;
        width: 420px;
        height: 420px;
        opacity: 0.34;
        animation-duration: 24s;
        animation-direction: reverse;
    }

    .digital-code {
        position: absolute;
        pointer-events: none;
        z-index: -1;
        color: rgba(184, 255, 240, 0.28);
        font-family: "Courier New", monospace;
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 0.36em;
        text-transform: uppercase;
        text-shadow: 0 0 14px rgba(108, 255, 226, 0.46);
        white-space: nowrap;
        animation: codeFloat 12s ease-in-out infinite alternate;
    }

    .digital-code-left {
        left: 4%;
        bottom: 16%;
        transform: rotate(-90deg);
        transform-origin: left center;
    }

    .digital-code-right {
        right: -2%;
        top: 18%;
        transform: rotate(90deg);
        transform-origin: right center;
        animation-delay: -5s;
    }

    .particle-field {
        position: absolute;
        inset: 0;
        pointer-events: none;
        overflow: hidden;
        z-index: -1;
    }

    .particle-field span {
        position: absolute;
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: #a8fff0;
        box-shadow: 0 0 12px #7effe6, 0 0 30px rgba(255, 224, 107, 0.45);
        opacity: 0.72;
        animation: particleRise 8s linear infinite;
    }

    .particle-field span:nth-child(1) {
        left: 8%;
        top: 84%;
        animation-delay: -1s;
        animation-duration: 9s;
    }

    .particle-field span:nth-child(2) {
        left: 14%;
        top: 48%;
        animation-delay: -4s;
        animation-duration: 11s;
    }

    .particle-field span:nth-child(3) {
        left: 23%;
        top: 70%;
        animation-delay: -2s;
        animation-duration: 7s;
    }

    .particle-field span:nth-child(4) {
        left: 31%;
        top: 28%;
        animation-delay: -6s;
        animation-duration: 10s;
    }

    .particle-field span:nth-child(5) {
        left: 44%;
        top: 88%;
        animation-delay: -3s;
        animation-duration: 12s;
    }

    .particle-field span:nth-child(6) {
        left: 52%;
        top: 20%;
        animation-delay: -5s;
        animation-duration: 8s;
    }

    .particle-field span:nth-child(7) {
        left: 61%;
        top: 76%;
        animation-delay: -7s;
        animation-duration: 10s;
    }

    .particle-field span:nth-child(8) {
        left: 70%;
        top: 34%;
        animation-delay: -1.5s;
        animation-duration: 9s;
    }

    .particle-field span:nth-child(9) {
        left: 78%;
        top: 66%;
        animation-delay: -4.5s;
        animation-duration: 13s;
    }

    .particle-field span:nth-child(10) {
        left: 86%;
        top: 26%;
        animation-delay: -8s;
        animation-duration: 10s;
    }

    .particle-field span:nth-child(11) {
        left: 92%;
        top: 82%;
        animation-delay: -2.8s;
        animation-duration: 8s;
    }

    .particle-field span:nth-child(12) {
        left: 38%;
        top: 52%;
        animation-delay: -7.2s;
        animation-duration: 11s;
    }

    .tech-grid {
        position: absolute;
        width: 360px;
        height: 640px;
        opacity: 0.42;
        pointer-events: none;
        z-index: -1;
        background:
            linear-gradient(65deg, transparent 48%, rgba(118, 255, 226, 0.95) 49%, transparent 51%),
            linear-gradient(-65deg, transparent 48%, rgba(118, 255, 226, 0.75) 49%, transparent 51%),
            linear-gradient(0deg, transparent 48%, rgba(118, 255, 226, 0.50) 49%, transparent 51%);
        background-size: 42px 42px;
        filter: drop-shadow(0 0 12px rgba(98, 244, 218, 0.28));
    }

    .tech-grid-left {
        left: -170px;
        top: 92px;
        transform: rotate(10deg);
        clip-path: ellipse(46% 48% at 45% 52%);
    }

    .tech-grid-right {
        right: -160px;
        top: 130px;
        transform: rotate(-16deg);
        clip-path: polygon(45% 0, 100% 16%, 78% 100%, 20% 88%, 0 24%);
    }

    .circuit-lines {
        position: absolute;
        pointer-events: none;
        z-index: -1;
        opacity: 0.46;
        background:
            linear-gradient(90deg, rgba(120, 255, 226, 0.76) 0 32%, transparent 32% 38%, rgba(120, 255, 226, 0.76) 38% 58%, transparent 58% 100%),
            radial-gradient(circle, rgba(120, 255, 226, 0.9) 0 5px, transparent 6px);
        background-size: 210px 4px, 210px 56px;
        filter: drop-shadow(0 0 12px rgba(91, 244, 216, 0.34));
    }

    .circuit-lines-left {
        left: -28px;
        top: 248px;
        width: 420px;
        height: 280px;
        transform: skewY(-8deg);
    }

    .circuit-lines-bottom {
        bottom: 78px;
        left: 35%;
        width: 420px;
        height: 260px;
        transform: rotate(90deg);
    }

    .login-shell {
        position: relative;
        width: min(100%, 620px);
        display: grid;
        place-items: center;
        animation: cardIn 0.5s ease-out both;
    }

    .ai-orb {
        position: absolute;
        top: 22px;
        left: 38px;
        width: 78px;
        height: 78px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        z-index: 2;
        border: 1px solid rgba(130, 255, 229, 0.38);
        background:
            radial-gradient(circle, rgba(158, 255, 233, 0.24), rgba(15, 84, 78, 0.12) 58%, transparent 59%),
            repeating-radial-gradient(circle, rgba(128, 255, 226, 0.24) 0 2px, transparent 2px 8px);
        box-shadow: 0 0 28px rgba(86, 241, 211, 0.35);
        color: rgba(236, 255, 251, 0.92);
        font-size: 1.7rem;
        font-weight: 900;
        letter-spacing: 0.04em;
        animation: orbPulse 3.2s ease-in-out infinite;
    }

    .glass-card {
        width: 100%;
        min-height: auto;
        padding: 42px 58px 28px;
        border-radius: 36px;
        border: 2px solid rgba(113, 255, 224, 0.48);
        background:
            linear-gradient(180deg, rgba(23, 113, 102, 0.72), rgba(16, 79, 74, 0.72)),
            radial-gradient(circle at 50% 0%, rgba(167, 255, 235, 0.22), transparent 38%);
        backdrop-filter: blur(10px);
        box-shadow:
            0 34px 90px rgba(0, 0, 0, 0.32),
            0 0 54px rgba(109, 255, 224, 0.15),
            inset 0 0 34px rgba(126, 255, 226, 0.13);
        transition: 0.4s;
        position: relative;
        text-align: center;
        overflow: hidden;
    }

    .glass-card::before {
        content: "";
        position: absolute;
        inset: 20px;
        border-radius: 34px;
        border: 1px solid rgba(180, 255, 238, 0.16);
        pointer-events: none;
    }

    .glass-card::after {
        content: "";
        position: absolute;
        inset: -2px;
        border-radius: inherit;
        padding: 2px;
        background: linear-gradient(130deg, rgba(255, 230, 118, 0.72), rgba(121, 255, 228, 0.92), transparent 38%, rgba(84, 245, 215, 0.72));
        mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
        mask-composite: exclude;
        pointer-events: none;
        opacity: 0.78;
        animation: borderGlow 4.5s linear infinite;
    }

    .card-shine {
        position: absolute;
        inset: -40% -25%;
        pointer-events: none;
        background: linear-gradient(115deg, transparent 42%, rgba(255, 255, 255, 0.13) 49%, transparent 56%);
        transform: translateX(-34%);
        animation: shineSweep 5.8s ease-in-out infinite;
    }

    .scan-line {
        position: absolute;
        left: 8%;
        right: 8%;
        top: 20%;
        height: 1px;
        pointer-events: none;
        background: linear-gradient(90deg, transparent, rgba(156, 255, 233, 0.82), transparent);
        box-shadow: 0 0 18px rgba(128, 255, 226, 0.8);
        opacity: 0;
        animation: scanMove 4.8s ease-in-out infinite;
    }

    .brand-mark {
        display: inline-grid;
        place-items: center;
        width: 72px;
        height: 58px;
        margin-bottom: 12px;
    }

    .brand-mark img {
        width: 72px;
        height: 72px;
        object-fit: contain;
        filter: drop-shadow(0 8px 12px rgba(0, 0, 0, 0.20));
    }

    .login-heading {
        margin-bottom: 24px;
        text-transform: uppercase;
        color: rgba(247, 255, 252, 0.94);
        text-shadow: 0 0 18px rgba(126, 255, 226, 0.20);
        position: relative;
        padding-bottom: 14px;
    }

    .login-heading h1 {
        max-width: 520px;
        margin: 0 auto 12px;
        font-size: clamp(1.16rem, 2.6vw, 1.52rem);
        font-weight: 900;
        letter-spacing: 0.045em;
        line-height: 1.26;
        background: linear-gradient(180deg, #ffffff 0%, #eafffa 48%, #b9fff0 100%);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
        text-wrap: balance;
        text-shadow: none;
    }

    .heading-subtitle {
        display: grid;
        gap: 6px;
        justify-items: center;
    }

    .heading-subtitle span {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: fit-content;
        max-width: 100%;
        padding: 4px 14px;
        border-radius: 999px;
        border: 1px solid rgba(149, 255, 232, 0.18);
        background: rgba(6, 72, 67, 0.22);
        color: #f4fffc;
        font-weight: 900;
        line-height: 1.35;
        text-wrap: balance;
        text-shadow:
            0 2px 10px rgba(0, 0, 0, 0.22),
            0 0 24px rgba(118, 255, 226, 0.24);
    }

    .heading-subtitle span:first-child {
        color: #ffe27b;
        font-size: clamp(0.78rem, 1.55vw, 0.9rem);
        letter-spacing: 0.16em;
    }

    .heading-subtitle span:last-child {
        color: rgba(235, 255, 250, 0.92);
        font-size: clamp(0.68rem, 1.35vw, 0.8rem);
        letter-spacing: 0.075em;
    }

    .login-heading::after {
        content: "";
        position: absolute;
        left: 50%;
        bottom: 0;
        width: min(72%, 340px);
        height: 2px;
        border-radius: 999px;
        background: linear-gradient(90deg, transparent, rgba(255, 220, 94, 0.85), rgba(126, 255, 226, 0.90), transparent);
        transform: translateX(-50%);
        box-shadow: 0 0 18px rgba(126, 255, 226, 0.42);
    }

    form {
        position: relative;
        z-index: 1;
    }

    .field-group {
        margin-bottom: 12px;
        text-align: left;
    }

    .field-control {
        min-height: 50px;
        border-radius: 999px;
        display: flex;
        align-items: center;
        overflow: hidden;
        background: rgba(246, 249, 249, 0.92);
        backdrop-filter: blur(8px);
        box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.70),
            inset 0 2px 12px rgba(6, 45, 43, 0.10);
        border: 1px solid rgba(255, 255, 255, 0.62);
        transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
    }

    .field-control-dark {
        background: transparent;
        border-color: rgba(161, 255, 235, 0.42);
        box-shadow:
            inset 0 0 0 1px rgba(255, 255, 255, 0.04),
            0 0 18px rgba(105, 255, 225, 0.10);
    }

    .field-control:focus-within {
        transform: translateY(-1px);
        border-color: rgba(255, 225, 112, 0.72);
        box-shadow:
            inset 0 2px 8px rgba(7, 48, 46, 0.12),
            0 0 0 4px rgba(115, 255, 225, 0.12),
            0 0 24px rgba(115, 255, 225, 0.22);
    }

    .field-icon {
        width: 56px;
        height: 50px;
        display: grid;
        place-items: center;
        flex: 0 0 56px;
        color: #39bfa3;
        font-size: 1.25rem;
        border-right: 1px solid rgba(17, 125, 109, 0.16);
    }

    .field-control-dark .field-icon {
        color: #6bf4d2;
        border-right-color: rgba(139, 255, 231, 0.16);
    }

    .form-control {
        width: 100%;
        height: 50px;
        padding: 0 22px;
        border-radius: 0;
        border: none;
        margin: 0;
        background: transparent;
        color: #274f4d;
        outline: none;
        font-weight: 700;
        font-size: 1rem;
    }

    .field-control-dark .form-control {
        appearance: none;
        background: transparent !important;
        background-color: transparent !important;
        background-image: none !important;
        box-shadow: none !important;
        color: #ecfffb;
        caret-color: #ecfffb;
    }

    .field-control-dark .form-control:-webkit-autofill,
    .field-control-dark .form-control:-webkit-autofill:hover,
    .field-control-dark .form-control:-webkit-autofill:focus,
    .field-control-dark .form-control:-webkit-autofill:active {
        -webkit-text-fill-color: #ecfffb !important;
        caret-color: #ecfffb;
        background: transparent !important;
        background-color: transparent !important;
        box-shadow: 0 0 0 1000px rgba(10, 70, 66, 0.01) inset !important;
        transition: background-color 999999s ease-in-out 0s;
    }

    .form-control::placeholder {
        color: rgba(39, 79, 77, 0.54);
        font-weight: 600;
    }

    .field-control-dark .form-control::placeholder {
        color: rgba(225, 255, 249, 0.76);
    }

    .action-row {
        display: flex;
        justify-content: center;
        gap: 12px;
        margin-top: 16px;
    }

    .btn-login {
        min-width: 142px;
        min-height: 40px;
        padding: 0 28px;
        border-radius: 999px;
        background: linear-gradient(180deg, #1f7d73 0%, #0c5d58 100%);
        color: #ffffff;
        border: 1px solid rgba(148, 255, 231, 0.28);
        box-shadow: 0 12px 26px rgba(7, 46, 44, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.14);
        font-weight: 800;
        letter-spacing: 0.01em;
        transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
        position: relative;
        overflow: hidden;
    }

    .btn-login::before {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(90deg, transparent, rgba(255, 234, 127, 0.28), transparent);
        transform: translateX(-120%);
        transition: transform 0.55s ease;
    }

    .btn-login:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 16px 30px rgba(7, 46, 44, 0.34), 0 0 28px rgba(116, 255, 226, 0.22);
    }

    .btn-login:hover:not(:disabled)::before {
        transform: translateX(120%);
    }

    .btn-login:disabled {
        opacity: 0.72;
        cursor: not-allowed;
    }

    .login-slogan {
        position: relative;
        z-index: 1;
        width: min(100%, 520px);
        margin: 24px auto 0;
        padding: 18px 14px 4px;
        border-top: 1px solid rgba(179, 255, 235, 0.18);
        text-transform: uppercase;
        line-height: 1.45;
        color: #ffd75a;
        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.22);
    }

    .login-slogan::before {
        content: "";
        position: absolute;
        left: 50%;
        top: 10px;
        width: min(72%, 330px);
        height: 62px;
        border-radius: 18px;
        background:
            linear-gradient(90deg, transparent, rgba(111, 255, 225, 0.10), transparent),
            rgba(72, 171, 150, 0.12);
        transform: translateX(-50%);
        box-shadow: 0 0 24px rgba(108, 255, 226, 0.08);
        pointer-events: none;
    }

    .login-slogan strong,
    .login-slogan span,
    .login-slogan em {
        position: relative;
        display: block;
        font-weight: 900;
        font-style: normal;
        text-wrap: balance;
    }

    .login-slogan strong {
        font-size: clamp(0.9rem, 1.85vw, 1.04rem);
        letter-spacing: 0.08em;
        color: #ffe27a;
    }

    .login-slogan span {
        margin-top: 2px;
        font-size: clamp(0.78rem, 1.55vw, 0.9rem);
        letter-spacing: 0.045em;
        color: #ffdd69;
    }

    .login-slogan em {
        margin: 8px auto 0;
        width: fit-content;
        max-width: 100%;
        padding: 5px 12px;
        border-radius: 999px;
        border: 1px solid rgba(255, 223, 104, 0.18);
        background: rgba(11, 83, 77, 0.24);
        color: rgba(255, 235, 148, 0.96);
        font-size: clamp(0.66rem, 1.28vw, 0.76rem);
        letter-spacing: 0.055em;
    }

    .toggle-password {
        width: 52px;
        height: 50px;
        border: none;
        background: transparent;
        cursor: pointer;
        color: rgba(216, 255, 247, 0.78);
        font-size: 1.1rem;
    }

    .spinner {
        width: 16px;
        height: 16px;
        border: 2px solid white;
        border-top: 2px solid transparent;
        border-radius: 50%;
        display: inline-block;
        animation: spin 0.8s linear infinite;
    }

    .text-danger {
        display: block;
        margin: 7px 0 0 22px;
        color: #ffd5d5 !important;
        font-weight: 700;
    }

    .alert-danger {
        border: 1px solid rgba(255, 203, 203, 0.38);
        border-radius: 14px;
        background: rgba(128, 24, 24, 0.36);
        color: #fff4f4;
        text-align: left;
        font-weight: 700;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    @keyframes bgDrift {
        from {
            transform: translate3d(-14px, -8px, 0) scale(1.01);
        }

        to {
            transform: translate3d(14px, 10px, 0) scale(1.03);
        }
    }

    @keyframes auroraFloat {
        from {
            transform: translate3d(-18px, -8px, 0) rotate(-10deg);
        }

        to {
            transform: translate3d(18px, 12px, 0) rotate(12deg);
        }
    }

    @keyframes particleRise {
        0% {
            transform: translate3d(0, 42px, 0) scale(0.7);
            opacity: 0;
        }

        18%,
        80% {
            opacity: 0.78;
        }

        100% {
            transform: translate3d(34px, -120px, 0) scale(1.25);
            opacity: 0;
        }
    }

    @keyframes hexDrift {
        from {
            transform: translate3d(0, 0, 0);
        }

        to {
            transform: translate3d(72px, 126px, 0);
        }
    }

    @keyframes hudSpin {
        to {
            rotate: 360deg;
        }
    }

    @keyframes codeFloat {
        from {
            opacity: 0.18;
            filter: blur(0.2px);
        }

        to {
            opacity: 0.42;
            filter: blur(0);
        }
    }

    @keyframes orbPulse {

        0%,
        100% {
            box-shadow: 0 0 28px rgba(86, 241, 211, 0.35);
        }

        50% {
            box-shadow: 0 0 42px rgba(86, 241, 211, 0.58), 0 0 72px rgba(255, 221, 97, 0.18);
        }
    }

    @keyframes borderGlow {

        0%,
        100% {
            opacity: 0.55;
        }

        50% {
            opacity: 0.95;
        }
    }

    @keyframes shineSweep {

        0%,
        45% {
            transform: translateX(-42%);
            opacity: 0;
        }

        55% {
            opacity: 1;
        }

        100% {
            transform: translateX(42%);
            opacity: 0;
        }
    }

    @keyframes scanMove {

        0%,
        12% {
            top: 18%;
            opacity: 0;
        }

        24% {
            opacity: 0.85;
        }

        80% {
            top: 86%;
            opacity: 0.55;
        }

        100% {
            top: 90%;
            opacity: 0;
        }
    }

    @keyframes cardIn {
        from {
            opacity: 0;
            transform: translateY(14px) scale(0.98);
        }

        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }

    .fadeOut {
        opacity: 0;
        transform: scale(0.95);
    }

    .theme-toggle {
        position: absolute;
        top: 18px;
        right: 22px;
        z-index: 2;
        border: 1px solid rgba(162, 255, 233, 0.24);
        background: rgba(9, 72, 68, 0.42);
        color: rgba(236, 255, 251, 0.86);
        border-radius: 999px;
        padding: 7px 12px;
        font-size: 0.78rem;
        font-weight: 800;
        cursor: pointer;
    }

    .dark.login-page {
        background:
            radial-gradient(circle at 18% 18%, rgba(66, 227, 207, 0.18), transparent 22%),
            radial-gradient(circle at 82% 30%, rgba(34, 164, 142, 0.18), transparent 28%),
            linear-gradient(120deg, #07151d 0%, #0b3d3c 48%, #0b6d58 100%);
    }

    .dark .glass-card {
        background:
            linear-gradient(180deg, rgba(15, 77, 76, 0.78), rgba(9, 45, 47, 0.78)),
            radial-gradient(circle at 50% 0%, rgba(118, 255, 226, 0.18), transparent 38%);
    }

    @media (max-width: 768px) {
        .login-page {
            padding: 20px;
            align-items: start;
        }

        .login-shell {
            width: 100%;
        }

        .glass-card {
            min-height: auto;
            padding: 58px 22px 28px;
            border-radius: 28px;
        }

        .ai-orb {
            width: 70px;
            height: 70px;
            top: 18px;
            left: 22px;
            font-size: 1.45rem;
        }

        .brand-mark {
            margin-top: 12px;
        }

        .field-icon {
            width: 54px;
            flex-basis: 54px;
        }

        .tech-grid,
        .circuit-lines {
            opacity: 0.22;
        }
    }
</style>
