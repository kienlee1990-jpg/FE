<template>
    <div class="app">
        <!-- TOPBAR -->
        <div class="topbar">
            <div class="left">
                <i class="fa fa-bars" @click="toggleSidebar"></i>
                <h3>KCLINIC</h3>
            </div>

            <div class="right">
                <div class="badge">🏠 Nơi làm việc: <b>PHÒNG TÀI CHÍNH</b></div>


                <div class="user" @click="toggleDropdown">
                    <i class="bi bi-person-circle"></i>
                    <span style="margin-left: 5px;">{{ user?.fullName }}</span>
                </div>

                <div v-if="dropdownOpen" class="dropdown-menu show dropdown">
                    <button class="dropdown-item" @click="changePassword">
                        Đổi mật khẩu
                    </button>
                    <button class="dropdown-item text-danger" @click="logout">
                        Đăng xuất
                    </button>
                </div>
            </div>
        </div>

        <!-- BODY -->
        <div class="layout">
            <!-- SIDEBAR -->
            <div :class="['sidebar', { collapse: isCollapsed }]">

                <div class="item" @click="toggleMenu('Trangchu')" style="background: #a5c6c6; ">
                    <router-link to="/dashboard" style="text-decoration: none;">
                        <span style="color: black;">
                            <i class="bi bi-house"></i> Trang chủ
                        </span>
                    </router-link>
                </div>
                <!-- CHỨC NĂNG -->
                <div class="menu-group">
                    <div class="item" @click="toggleMenu('chucnang')">
                        <div class="left">
                            <i class="bi bi-grid"></i>
                            <span>Chức năng</span>
                        </div>
                        <i :class="['bi', menus.chucnang ? 'bi-chevron-down' : 'bi-chevron-right']"></i>
                    </div>

                    <div v-if="menus.chucnang" class="sub-menu">
                        <div class="sub-item">
                            <i class="bi bi-person-plus"></i>
                            <span>Tiếp nhận bệnh nhân</span>
                        </div>

                        <div class="sub-item">
                            <i class="bi bi-clock-history"></i>
                            <span>Bệnh sử</span>
                        </div>

                        <div class="sub-item">
                            <i class="bi bi-hospital"></i>
                            <span>Khám bệnh</span>
                        </div>

                        <div class="sub-item">
                            <i class="bi bi-activity"></i>
                            <span>Xét nghiệm</span>
                        </div>

                        <div class="sub-item">
                            <i class="bi bi-file-earmark-arrow-up"></i>
                            <span>Import Xét nghiệm</span>
                        </div>

                        <div class="sub-item">
                            <i class="bi bi-image"></i>
                            <span>Chẩn đoán hình ảnh</span>
                        </div>
                    </div>
                </div>

                <!-- DƯỢC -->
                <div class="menu-group">
                    <!-- MENU CHA -->
                    <div class="item" @click="toggleMenu('duoc')">
                        <div class="left">
                            <i class="bi bi-capsule"></i>
                            <span>Dược</span>
                        </div>
                        <i :class="['bi', menus.duoc ? 'bi-chevron-down rotate' : 'bi-chevron-right']"></i>
                    </div>

                    <!-- DROPDOWN -->
                    <transition name="dropdown">
                        <div v-show="menus.duoc" class="sub-menu">

                            <!-- BÁN HÀNG -->
                            <div class="sub-title">Bán hàng</div>

                            <div class="sub-item">
                                <i class="bi bi-cart"></i>
                                <span>Bán thuốc tại quầy</span>
                            </div>

                            <div class="sub-item">
                                <i class="bi bi-arrow-return-left"></i>
                                <span>Trả thuốc tại quầy</span>
                            </div>

                            <!-- DANH MỤC -->
                            <div class="sub-title">Quản lí dược</div>

                            <div class="sub-item">
                                <i class="bi bi-people"></i>
                                <span>Nhóm dược</span>
                            </div>

                            <div class="sub-item">
                                <i class="bi bi-folder"></i>
                                <span>Danh mục chung</span>
                            </div>

                            <div class="sub-item">
                                <i class="bi bi-tags"></i>
                                <span>Dược - Đơn giá</span>
                            </div>

                            <div class="sub-item">
                                <i class="bi bi-box-seam"></i>
                                <span>Tồn kho dược</span>
                            </div>

                            <div class="sub-item">
                                <i class="bi bi-rulers"></i>
                                <span>Đơn vị tính</span>
                            </div>

                            <div class="sub-item">
                                <i class="bi bi-building"></i>
                                <span>Danh mục kho dược</span>
                            </div>

                            <div class="sub-item">
                                <i class="bi bi-sliders"></i>
                                <span>Dược - Set định dạng</span>
                            </div>

                            <!-- TOA THUỐC -->
                            <div class="sub-title">Toa thuốc</div>

                            <div class="sub-item active">
                                <i class="bi bi-file-earmark-medical"></i>
                                <span>Toa thuốc mẫu</span>
                            </div>

                            <div class="sub-item">
                                <i class="bi bi-journal-text"></i>
                                <span>Nội dung toa thuốc</span>
                            </div>

                            <!-- NHẬP XUẤT -->
                            <div class="sub-title">Nhập / Xuất</div>

                            <div class="sub-item">
                                <i class="bi bi-truck"></i>
                                <span>Nhập dược từ NCC</span>
                            </div>

                            <div class="sub-item">
                                <i class="bi bi-box-arrow-up"></i>
                                <span>Xuất dược</span>
                            </div>

                        </div>
                    </transition>
                </div>

                <!-- DANH MỤC -->
                <div class="item" @click="toggleMenu('danhmuc')">
                    <span>
                        <i class="bi bi-list"></i> Danh mục
                    </span>
                    <i :class="['bi', menus.danhmuc ? 'bi-chevron-down rotate' : 'bi-chevron-right']"></i>
                </div>
                <div v-if="menus.danhmuc" class="sub-menu">
                    <div class="sub-item">
                        <i class="bi bi-heart-pulse"></i> Bệnh
                    </div>
                    <div class="sub-item">
                        <i class="bi bi-person-badge"></i> Bác sĩ
                    </div>
                </div>

                <!-- HỆ THỐNG -->
                <div class="item" @click="toggleMenu('hethong')">
                    <span>
                        <i class="bi bi-gear"></i> Hệ thống
                    </span>
                    <i :class="['bi', menus.hethong ? 'bi-chevron-down rotate' : 'bi-chevron-right']"></i>
                </div>
                <div v-if="menus.hethong" class="sub-menu">
                    <div class="sub-item" @click="goToUsers">
                        <i class="bi bi-people"></i> Người dùng
                    </div>
                    <div class="sub-item" @click="goToPermissions">
                        <i class="bi bi-shield-lock"></i> Phân quyền
                    </div>
                </div>
                <div class="item" @click="toggleMenu('thungan')">
                    <span>
                        <i class="bi bi-cash"></i> Thu ngân
                    </span>
                </div>
            </div>

            <!-- MAIN -->
            <main class="main">
                <slot></slot>
            </main>
        </div>
    </div>
</template>

<script setup>
    import { ref, onMounted, onUnmounted, computed } from 'vue'
    import { useRouter } from 'vue-router'
    import { useAuth } from "../composables/useAuth"
    import axios from 'axios'

    // ===== AUTH =====
    const { getMe, user } = useAuth()

    // ===== ROUTER =====
    const router = useRouter()
    const goToUsers = () => {
        router.push('/users') // route người dùng
    }

    const goToPermissions = () => {
        router.push('/permissions') // route phân quyền
    }

    // ===== TIME =====
    const now = ref(new Date())
    let timer = null

    onMounted(async () => {
        // realtime clock
        timer = setInterval(() => {
            now.value = new Date()
        }, 1000)

        // lấy user + check login
        try {
            await getMe()
            if (!user.value) {
                router.push('/login')
            }
        } catch (err) {
            router.push('/login')
        }

        // click outside dropdown
        document.addEventListener("click", handleClickOutside)
    })

    onUnmounted(() => {
        if (timer) clearInterval(timer)
        document.removeEventListener("click", handleClickOutside)
    })

    // ===== FORMAT DATE =====
    const currentDateTime = computed(() => {
        return now.value.toLocaleString('vi-VN', {
            weekday: 'long',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })
    })

    // ===== GREETING =====
    const greeting = computed(() => {
        const hour = now.value.getHours()
        if (hour < 12) return 'Chào buổi sáng ☀️'
        if (hour < 18) return 'Chào buổi chiều 🌤️'
        return 'Chào buổi tối 🌙'
    })

    // ===== UI STATE =====
    const dropdownOpen = ref(false)
    const isCollapsed = ref(false)

    // ===== DROPDOWN =====
    const toggleDropdown = (e) => {
        e.stopPropagation() // tránh bị click ngoài đóng luôn
        dropdownOpen.value = !dropdownOpen.value
    }

    // click ngoài -> đóng dropdown
    const handleClickOutside = () => {
        dropdownOpen.value = false
    }

    // ===== SIDEBAR =====
    const toggleSidebar = () => {
        isCollapsed.value = !isCollapsed.value
    }

    // ===== MENU =====
    const menus = ref({
        chucnang: false,
        duoc: false,
        danhmuc: false,
        hethong: false
    })

    const toggleMenu = (menu) => {
        menus.value[menu] = !menus.value[menu]
    }

    // ===== ACTION =====
    const changePassword = () => {
        alert('Đổi mật khẩu')
    }

    const logout = () => {
        localStorage.removeItem('token')

        // reset user (QUAN TRỌNG)
        user.value = null

        router.push('/login')
    }

    // ===== DATA =====
    const stats = [
        { label: 'Lượt tiếp nhận', value: 142, change: '+12% so với hôm qua', icon: '👥' },
        { label: 'Doanh thu ngày', value: '45.2M', change: '+5% so với tuần trước', icon: '💰' },
        { label: 'Lịch hẹn sắp tới', value: 28, change: 'Trong 3 ngày tới', icon: '📅' },
        { label: 'Chờ kết quả', value: 15, change: 'Xét nghiệm & CDHA', icon: '📊' }
    ]

    const chartData = [40, 30, 60, 55, 35, 70, 25]

    const appointments = [
        { time: '08:30', name: 'Nguyễn Văn An', note: 'Tái khám', status: 'done' },
        { time: '09:00', name: 'Lê Thị Bích', note: 'Khám mới', status: 'pending' },
        { time: '09:45', name: 'Hoàng Văn Cường', note: 'Tái khám', status: 'cancel' },
        { time: '10:15', name: 'Phạm Thu Hà', note: 'Tư vấn', status: 'done' }
    ]


</script>

<style scoped>
    html,
    body,
    #app {
        height: 100%;
        margin: 0;
    }

    /* ===== LAYOUT ===== */
    .app {
        display: flex;
        flex-direction: column;
        height: 100vh;
        width: 100%;
    }

    .layout {
        display: flex;
        flex: 1;
        overflow: hidden;
    }

    /* ===== TOPBAR ===== */
    .topbar {
        height: 60px;
        background: #0f9d8a;
        color: #fff;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 20px;
    }

    .left,
    .right {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .badge {
        background: rgba(255, 255, 255, 0.2);
        padding: 6px 12px;
        border-radius: 8px;
    }

    /* ===== DROPDOWN USER ===== */
    .dropdown {
        position: absolute;
        top: 60px;
        right: 10px;
        background: #fff;
        color: #000;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }

    /* ===== SIDEBAR ===== */
    .sidebar {
        width: 230px;
        background: #fff;
        border-right: 1px solid #eee;
        overflow-y: auto;
    }

    .sidebar.collapse {
        width: 70px;
    }

    /* ===== MENU ITEM ===== */
    .item {
        padding: 12px 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        user-select: none;
        color: #374151;
    }

    .item:hover {
        background: #f3f4f6;
    }

    .item.active {
        background: #e6f4f1;
        border-left: 4px solid #0f9d8a;
    }

    .item span,
    .item .left {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    /* ===== SUB MENU ===== */
    .menu-group {
        margin-bottom: 5px;
    }

    .sub-menu {
        background: #f9fafb;
        padding-left: 10px;
    }

    .sub-title {
        padding: 8px 20px;
        font-size: 12px;
        color: #9ca3af;
        text-transform: uppercase;
        font-weight: 600;
    }

    .sub-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 15px 10px 25px;
        font-size: 14px;
        color: #4b5563;
        cursor: pointer;
        user-select: none;
    }

    .sub-item i {
        font-size: 16px;
        color: #9ca3af;
    }

    .sub-item:hover {
        background: #e6f4f1;
    }

    .sub-item.active {
        background: #e6f4f1;
        color: #0f9d8a;
    }

    /* ===== MAIN CONTENT ===== */
    .main {
        flex: 1;
        background: linear-gradient(135deg, #d1f2eb, #e8f8f5);
        overflow-y: auto;
        padding: 20px;
    }

    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    /* ===== BUTTON ===== */
    .btn {
        padding: 6px 12px;
        border-radius: 6px;
        border: none;
    }

    .btn.outline {
        background: #fff;
        border: 1px solid #ccc;
    }

    .btn.primary {
        background: #0f9d8a;
        color: #fff;
    }

    /* ===== STATS ===== */
    .stats {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 15px;
        margin-top: 15px;
    }

    .card {
        background: #fff;
        padding: 15px;
        border-radius: 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
    }

    .icon {
        font-size: 24px;
        background: #e6f4f1;
        padding: 10px;
        border-radius: 50%;
    }

    .change {
        color: green;
        font-size: 12px;
    }

    /* ===== CONTENT ===== */
    .content {
        display: flex;
        gap: 20px;
        margin-top: 20px;
    }

    .chart-card,
    .appt-card {
        background: #fff;
        padding: 15px;
        border-radius: 12px;
        flex: 1;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
    }

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    /* ===== CHART ===== */
    .chart {
        display: flex;
        align-items: flex-end;
        height: 220px;
        gap: 12px;
        margin-top: 15px;
    }

    .chart div {
        width: 25px;
        background: #3b82f6;
        border-radius: 6px 6px 0 0;
    }

    /* ===== APPOINTMENT ===== */
    .appt {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 0;
        border-bottom: 1px solid #eee;
    }

    .time {
        background: #eef2ff;
        padding: 6px 8px;
        border-radius: 6px;
        font-size: 12px;
    }

    .status {
        margin-left: auto;
        width: 10px;
        height: 10px;
        border-radius: 50%;
    }

    .status.done {
        background: green;
    }

    .status.pending {
        background: orange;
    }

    .status.cancel {
        background: red;
    }

    .user {
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        user-select: none;
        /* tránh chọn text */
    }

    .user:hover {
        background: rgba(0, 0, 0, 0.05);
    }
</style>