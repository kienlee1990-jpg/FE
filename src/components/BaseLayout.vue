<template>
    <div class="app-shell">
        <aside :class="['sidebar', { collapsed: isCollapsed }]">
            <div class="brand">
                <button class="icon-btn" @click="toggleSidebar" aria-label="Thu gọn menu">
                    <i class="bi bi-list"></i>
                </button>
                <div v-if="!isCollapsed" class="brand-text">
                    <h1>Công an TP Đà Nẵng</h1>
                    <p>Theo dõi đánh giá kết quả thực hiện chỉ tiêu công tác</p>
                </div>
            </div>

            <!-- Tổng quan -->
            <nav class="nav-section">
                <p v-if="!isCollapsed" class="section-label">Tổng quan</p>
                <RouterLink to="/dashboard" class="nav-item" active-class="active">
                    <span class="nav-left">
                        <i class="bi bi-grid-1x2"></i>
                        <span v-if="!isCollapsed">Bảng điều khiển</span>
                    </span>
                </RouterLink>
            </nav>

            <!-- Nghiệp vụ -->
            <nav class="nav-section">
                <p v-if="!isCollapsed" class="section-label">Nghiệp vụ</p>

                <!-- Quản lý chỉ tiêu -->
                <div class="nav-group">
                    <button class="nav-item nav-toggle" @click="toggleMenu('quanLyChiTieu')">
                        <span class="nav-left">
                            <i class="bi bi-journal-text"></i>
                            <span v-if="!isCollapsed">Quản lý chỉ tiêu</span>
                        </span>
                        <i v-if="!isCollapsed"
                            :class="['bi', menus.quanLyChiTieu ? 'bi-chevron-down' : 'bi-chevron-right']"></i>
                    </button>
                    <div v-show="menus.quanLyChiTieu && !isCollapsed" class="sub-menu">
                        <RouterLink to="/danh-muc-chi-tieu" class="sub-item" active-class="active">
                            Danh mục chỉ tiêu
                        </RouterLink>
                        <RouterLink to="/chi-tieu-bo-giao" class="sub-item" active-class="active">
                            Chỉ tiêu cho CATP
                        </RouterLink>
                        <RouterLink to="/chi-tieu-thanh-pho-giao" class="sub-item" active-class="active">
                            Chỉ tiêu cho các đơn vị CADP
                        </RouterLink>
                        <RouterLink to="/ky-bao-cao" class="sub-item" active-class="active">
                            Kỳ báo cáo
                        </RouterLink>
                        <RouterLink to="/don-vi" class="sub-item" active-class="active">
                            Danh mục đơn vị
                        </RouterLink>
                    </div>
                </div>

                <!-- Giao chỉ tiêu -->
                <div class="nav-group">
                    <button class="nav-item nav-toggle" @click="toggleMenu('giaoChiTieu')">
                        <span class="nav-left">
                            <i class="bi bi-send-check"></i>
                            <span v-if="!isCollapsed">Giao chỉ tiêu</span>
                        </span>
                        <i v-if="!isCollapsed"
                            :class="['bi', menus.giaoChiTieu ? 'bi-chevron-down' : 'bi-chevron-right']"></i>
                    </button>
                    <div v-show="menus.giaoChiTieu && !isCollapsed" class="sub-menu">
                        <RouterLink to="/dot-giao-chi-tieu" class="sub-item" active-class="active">
                            Đợt giao chỉ tiêu
                        </RouterLink>
                        <RouterLink to="/phan-ra-chi-tieu-bo-giao" class="sub-item" active-class="active">
                            Cấu hình đánh giá chỉ tiêu
                        </RouterLink>
                        <RouterLink to="/giao-chi-tieu-don-vi" class="sub-item" active-class="active">
                            Giao chỉ tiêu cho đơn vị
                        </RouterLink>
                    </div>
                </div>

                <!-- Theo dõi và giám sát -->
                <div class="nav-group">
                    <button class="nav-item nav-toggle" @click="toggleMenu('theoDoiGiamSat')">
                        <span class="nav-left">
                            <i class="bi bi-clipboard-data"></i>
                            <span v-if="!isCollapsed">Theo dõi và giám sát</span>
                        </span>
                        <i v-if="!isCollapsed"
                            :class="['bi', menus.theoDoiGiamSat ? 'bi-chevron-down' : 'bi-chevron-right']"></i>
                    </button>
                    <div v-show="menus.theoDoiGiamSat && !isCollapsed" class="sub-menu">
                        <RouterLink to="/nhap-ket-qua" class="sub-item" active-class="active">
                            Nhập kết quả
                        </RouterLink>
                        <RouterLink to="/tien-do-thuc-hien" class="sub-item" active-class="active">
                            Tiến độ thực hiện
                        </RouterLink>
                        <RouterLink to="/don-vi-chua-cap-nhat" class="sub-item" active-class="active">
                            Đơn vị chưa cập nhật
                        </RouterLink>
                        <RouterLink to="/canh-bao-rui-ro" class="sub-item" active-class="active">
                            Cảnh báo rủi ro
                        </RouterLink>
                        <RouterLink to="/so-sanh-don-vi" class="sub-item" active-class="active">
                            So sánh đơn vị
                        </RouterLink>
                    </div>
                </div>

                <!-- Đánh giá và báo cáo -->
                <div class="nav-group">
                    <button class="nav-item nav-toggle" @click="toggleMenu('danhGiaBaoCao')">
                        <span class="nav-left">
                            <i class="bi bi-bar-chart-line"></i>
                            <span v-if="!isCollapsed">Đánh giá và báo cáo</span>
                        </span>
                        <i v-if="!isCollapsed"
                            :class="['bi', menus.danhGiaBaoCao ? 'bi-chevron-down' : 'bi-chevron-right']"></i>
                    </button>
                    <div v-show="menus.danhGiaBaoCao && !isCollapsed" class="sub-menu">
                        <RouterLink to="/tong-hop-danh-gia" class="sub-item" active-class="active">
                            Tổng hợp đánh giá
                        </RouterLink>
                        <RouterLink to="/xep-hang-don-vi" class="sub-item" active-class="active">
                            Xếp hạng đơn vị
                        </RouterLink>
                        <RouterLink to="/bao-cao-tong-hop" class="sub-item" active-class="active">
                            Báo cáo tổng hợp
                        </RouterLink>
                        <RouterLink to="/bao-cao-theo-don-vi" class="sub-item" active-class="active">
                            Báo cáo theo đơn vị
                        </RouterLink>
                        <RouterLink to="/bao-cao-theo-chi-tieu" class="sub-item" active-class="active">
                            Báo cáo theo chỉ tiêu
                        </RouterLink>
                        <RouterLink to="/xuat-bao-cao" class="sub-item" active-class="active">
                            Xuất Excel / PDF
                        </RouterLink>
                    </div>
                </div>
            </nav>

            <!-- Quản trị -->
            <nav class="nav-section">
                <p v-if="!isCollapsed" class="section-label">Quản trị</p>
                <div class="nav-group">
                    <button class="nav-item nav-toggle" @click="toggleMenu('heThong')">
                        <span class="nav-left">
                            <i class="bi bi-shield-lock"></i>
                            <span v-if="!isCollapsed">Hệ thống</span>
                        </span>
                        <i v-if="!isCollapsed"
                            :class="['bi', menus.heThong ? 'bi-chevron-down' : 'bi-chevron-right']"></i>
                    </button>
                    <div v-show="menus.heThong && !isCollapsed" class="sub-menu">
                        <RouterLink to="/users" class="sub-item" active-class="active">
                            Người dùng
                        </RouterLink>
                        <RouterLink to="/permissions" class="sub-item" active-class="active">
                            Phân quyền
                        </RouterLink>
                        <RouterLink to="/nhat-ky-he-thong" class="sub-item" active-class="active">
                            Nhật ký hệ thống
                        </RouterLink>
                    </div>
                </div>
            </nav>
        </aside>

        <div class="content-shell">
            <header class="topbar">
                <div class="topbar-left">
                    <div class="vn-header">
                        <img src="https://flagcdn.com/w40/vn.png" alt="VN" class="vn-flag" />
                        <div>
                            <h2>Việt Nam</h2>
                            <p>{{ currentDateTime }}</p>
                        </div>
                    </div>
                </div>

                <div class="topbar-right">
                    <div class="context-badge">
                        <span class="label">Đơn vị</span>
                        <strong>{{ user?.tenDonVi || 'Chưa xác định' }}</strong>
                    </div>

                    <div class="context-badge">
                        <span class="label">Vai trò</span>
                        <strong>{{ user?.vaiTro || 'Người dùng' }}</strong>
                    </div>

                    <div class="user-menu-wrapper">
                        <button type="button" class="user-menu" @click="toggleDropdown">
                            <i class="bi bi-person-circle"></i>
                            <div class="user-meta">
                                <strong>{{ user?.fullName || 'Tài khoản' }}</strong>
                                <span>{{ user?.email || '---' }}</span>
                            </div>
                            <i class="bi bi-chevron-down"></i>
                        </button>

                        <div v-if="dropdownOpen" class="user-dropdown-menu">
                            <button type="button" class="dropdown-item" @click.stop="changePassword">
                                Đổi mật khẩu
                            </button>
                            <button type="button" class="dropdown-item danger" @click.stop="logout">
                                Đăng xuất
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main class="main-content">
                <slot />
            </main>
        </div>
    </div>
</template>

<script setup>
    import { computed, onMounted, onUnmounted, ref, reactive, watch } from 'vue'
    import { RouterLink, useRoute, useRouter } from 'vue-router'
    import { useAuth } from '../composables/useAuth'
    import { RouterView } from 'vue-router'

    const router = useRouter()
    const route = useRoute()
    const { getMe, user } = useAuth()

    const dropdownOpen = ref(false)
    const isCollapsed = ref(false)
    const now = ref(new Date())
    let timer = null

    const defaultMenus = {
        quanLyChiTieu: false,
        giaoChiTieu: false,
        theoDoiGiamSat: false,
        danhGiaBaoCao: false,
        heThong: false
    }

    const savedMenus = localStorage.getItem('sidebar_menus')
    const menus = reactive(savedMenus ? JSON.parse(savedMenus) : defaultMenus)

    watch(
        menus,
        (newValue) => {
            localStorage.setItem('sidebar_menus', JSON.stringify(newValue))
        },
        { deep: true }
    )

    const routeTitleMap = {
        '/dashboard': 'Bảng điều khiển',

        '/chi-tieu': 'Danh mục chỉ tiêu',
        '/tao-chi-tieu': 'Tạo chỉ tiêu',
        '/ky-bao-cao': 'Kỳ báo cáo',
        '/don-vi': 'Danh mục đơn vị',

        '/dot-giao-chi-tieu': 'Đợt giao chỉ tiêu',
        '/giao-chi-tieu-don-vi': 'Giao chỉ tiêu cho đơn vị',
        '/chi-tieu-bo-giao': 'Chỉ tiêu Bộ giao',
        '/chi-tieu-thanh-pho-giao': 'Chỉ tiêu Thành phố giao',

        '/nhap-ket-qua': 'Nhập kết quả',
        '/tien-do-thuc-hien': 'Tiến độ thực hiện',
        '/lich-su-cap-nhat': 'Lịch sử cập nhật',
        '/khoa-ky': 'Khóa kỳ báo cáo',

        '/tong-hop-danh-gia': 'Tổng hợp đánh giá',
        '/xep-hang-don-vi': 'Xếp hạng đơn vị',
        '/so-sanh-don-vi': 'So sánh đơn vị',
        '/canh-bao-rui-ro': 'Cảnh báo rủi ro',

        '/bao-cao-tong-hop': 'Báo cáo tổng hợp',
        '/bao-cao-theo-don-vi': 'Báo cáo theo đơn vị',
        '/bao-cao-theo-chi-tieu': 'Báo cáo theo chỉ tiêu',
        '/xuat-bao-cao': 'Xuất Excel / PDF',

        '/users': 'Người dùng',
        '/permissions': 'Phân quyền',
        '/nhat-ky-he-thong': 'Nhật ký hệ thống',
    }

    const pageTitle = computed(() => routeTitleMap[route.path] || 'KPI Tracker')

    const currentDateTime = computed(() => {
        return now.value.toLocaleString('vi-VN', {
            weekday: 'long',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        })
    })

    const toggleSidebar = () => {
        isCollapsed.value = !isCollapsed.value
    }

    const toggleMenu = (menu) => {
        menus[menu] = !menus[menu]
    }

    const toggleDropdown = (e) => {
        e.stopPropagation()
        dropdownOpen.value = !dropdownOpen.value
    }

    const handleClickOutside = () => {
        dropdownOpen.value = false
    }

    const changePassword = () => {
        alert('Đổi mật khẩu')
    }

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('sidebar_menus')
        user.value = null
        router.push('/login')
    }

    onMounted(async () => {
        timer = setInterval(() => {
            now.value = new Date()
        }, 1000)

        try {
            await getMe()
            if (!user.value) {
                router.push('/login')
            }
        } catch (err) {
            router.push('/login')
        }

        document.addEventListener('click', handleClickOutside)
    })

    onUnmounted(() => {
        if (timer) clearInterval(timer)
        document.removeEventListener('click', handleClickOutside)
    })
</script>

<style scoped>
    * {
        box-sizing: border-box;
    }

    .app-shell {
        min-height: 100vh;
        display: flex;
        background: #f3f6fb;
        color: #1f3729;
    }

    .sidebar {
        width: 280px;
        background: linear-gradient(180deg, #0b5d2a 0%, #0f7a35 100%);
        color: #fff;
        padding: 20px 14px;
        transition: width 0.25s ease;
        overflow-y: auto;
        position: sticky;
        top: 0;
        height: 100vh;
    }

    .sidebar.collapsed {
        width: 84px;
    }

    .brand {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 4px 8px 18px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.14);
        margin-bottom: 18px;
    }

    .brand-text h1 {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
    }

    .brand-text p {
        margin: 4px 0 0;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.78);
        line-height: 1.5;
    }

    .icon-btn {
        width: 42px;
        height: 42px;
        border: none;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.12);
        color: #fff;
        cursor: pointer;
    }

    .section-label {
        margin: 18px 10px 10px;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: rgba(255, 255, 255, 0.6);
    }

    .nav-section {
        margin-bottom: 8px;
    }

    .nav-group {
        margin-bottom: 6px;
    }

    .nav-item,
    .sub-item {
        text-decoration: none;
    }

    .nav-item {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        border: none;
        background: transparent;
        color: #fff;
        padding: 12px 14px;
        border-radius: 14px;
        cursor: pointer;
        font-size: 14px;
        margin-bottom: 4px;
    }

    .nav-item:hover,
    .nav-item.active,
    .nav-toggle:hover {
        background: rgba(255, 255, 255, 0.14);
    }

    .nav-left {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .sub-menu {
        margin: 6px 0 10px 14px;
        padding-left: 10px;
        border-left: 1px solid rgba(255, 255, 255, 0.18);
    }

    .sub-item {
        display: block;
        color: rgba(255, 255, 255, 0.88);
        padding: 10px 12px;
        border-radius: 12px;
        font-size: 13px;
    }

    .sub-item:hover,
    .sub-item.active {
        background: rgba(255, 255, 255, 0.12);
        color: #fff;
    }

    .content-shell {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-width: 0;
    }

    .topbar {
        height: 76px;
        background: #fef3c7;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 24px;
        gap: 20px;
    }

    .topbar-left h2 {
        margin: 0;
        font-size: 22px;
        font-weight: 700;
        color: #0f172a;
    }

    .topbar-left p {
        margin: 4px 0 0;
        font-size: 13px;
        color: #64748b;
    }

    .topbar-right {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .context-badge {
        min-width: 150px;
        padding: 10px 14px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 14px;
    }

    .context-badge .label {
        display: block;
        font-size: 11px;
        color: #64748b;
        margin-bottom: 4px;
    }

    .context-badge strong {
        font-size: 13px;
        color: #0f172a;
    }

    .user-menu-wrapper {
        position: relative;
    }

    .user-menu {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 14px;
        border-radius: 16px;
        border: 1px solid #e5e7eb;
        background: #fff;
        cursor: pointer;
    }

    .user-menu i.bi-person-circle {
        font-size: 28px;
        color: #0f3d91;
    }

    .user-meta {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }

    .user-meta strong {
        font-size: 13px;
        color: #111827;
    }

    .user-meta span {
        font-size: 12px;
        color: #6b7280;
    }

    .user-dropdown-menu {
        position: absolute;
        right: 0;
        top: calc(100% + 8px);
        min-width: 220px;
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 16px;
        box-shadow: 0 16px 40px rgba(15, 23, 42, 0.12);
        overflow: hidden;
        z-index: 30;
    }

    .dropdown-item {
        width: 100%;
        display: block;
        text-align: left;
        padding: 12px 14px;
        border: none;
        background: transparent;
        color: #111827;
        cursor: pointer;
        font-size: 14px;
    }

    .dropdown-item:hover {
        background: #f8fafc;
    }

    .dropdown-item.danger {
        color: #dc2626;
    }

    .main-content {
        flex: 1;
        padding: 24px;
        overflow: auto;
    }

    @media (max-width: 1200px) {
        .context-badge {
            display: none;
        }
    }

    @media (max-width: 992px) {
        .sidebar {
            position: fixed;
            z-index: 40;
            left: 0;
            top: 0;
        }

        .content-shell {
            margin-left: 84px;
        }

        .sidebar:not(.collapsed)+.content-shell {
            margin-left: 280px;
        }
    }

    @media (max-width: 768px) {
        .topbar {
            height: auto;
            align-items: flex-start;
            flex-direction: column;
            padding: 16px;
        }

        .topbar-right {
            width: 100%;
            justify-content: space-between;
        }

        .main-content {
            padding: 16px;
        }
    }

    .vn-header {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .vn-flag {
        width: 32px;
        height: 22px;
        object-fit: cover;
        border-radius: 3px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    }

    .vn-flag {
        width: 32px;
        height: 32px;
        border-radius: 50%;
    }

    .vn-header h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
    }

    .vn-header p {
        margin: 0;
        font-size: 12px;
        color: #6b7280;
    }
</style>