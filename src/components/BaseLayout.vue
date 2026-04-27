<template>
    <div class="app-shell">
        <aside :class="['sidebar', { collapsed: isCollapsed }]">
            <div class="brand">
                <button class="icon-btn" @click="toggleSidebar" aria-label="Thu gọn menu">
                    <img src="/hieu.png" alt="Logo" class="brand-logo" />
                </button>
                <div v-if="!isCollapsed" class="brand-text">
                    <h1>CATP ĐÀ NẴNG</h1>
                    <p></p>
                </div>
            </div>

            <nav v-if="hasAnyPermission(['ViewDashboard', 'ViewCatpIndicatorReport'])" class="nav-section">
                <p v-if="!isCollapsed" class="section-label">Tổng quan</p>
                <RouterLink v-if="hasPermission('ViewDashboard')" to="/dashboard" class="nav-item"
                    active-class="active">
                    <span class="nav-left">
                        <i class="bi bi-grid-1x2"></i>
                        <span v-if="!isCollapsed">Bảng điều khiển</span>
                    </span>
                </RouterLink>
                <RouterLink v-if="hasPermission('ViewCatpIndicatorReport')" to="/bao-cao-chi-tieu-cong-an-thanh-pho"
                    class="nav-item" active-class="active">
                    <span class="nav-left">
                        <i class="bi bi-clipboard2-data"></i>
                        <span v-if="!isCollapsed">Báo cáo chỉ tiêu CATP</span>
                    </span>
                </RouterLink>
            </nav>

            <nav v-if="hasAnyPermission(['ManageIndicatorCatalog', 'ManageUnitCatalog', 'ManageReportingPeriods'])"
                class="nav-section">
                <p v-if="!isCollapsed" class="section-label">Danh mục hệ thống</p>
                <div class="nav-group">
                    <button class="nav-item nav-toggle" @click="toggleMenu('thietLapNen')">
                        <span class="nav-left">
                            <i class="bi bi-journal-bookmark"></i>
                            <span v-if="!isCollapsed">Danh mục nền tảng</span>
                        </span>
                        <i v-if="!isCollapsed"
                            :class="['bi', menus.thietLapNen ? 'bi-chevron-down' : 'bi-chevron-right']"></i>
                    </button>
                    <div v-show="menus.thietLapNen && !isCollapsed" class="sub-menu">
                        <RouterLink v-if="hasPermission('ManageIndicatorCatalog')" to="/danh-muc-chi-tieu"
                            class="sub-item" active-class="active">
                            Danh mục chỉ tiêu
                        </RouterLink>
                        <RouterLink v-if="hasPermission('ManageUnitCatalog')" to="/don-vi" class="sub-item"
                            active-class="active">
                            Danh mục đơn vị
                        </RouterLink>
                        <RouterLink v-if="hasPermission('ManageReportingPeriods')" to="/ky-bao-cao" class="sub-item"
                            active-class="active">
                            Kỳ báo cáo
                        </RouterLink>
                    </div>
                </div>
            </nav>

            <nav v-if="hasAnyPermission(['ManageAssignmentWaves', 'AssignTargetsToCatp', 'AssignTargetsToPhong', 'AssignTargetsToCadp', 'ViewAssignedTargetsList'])"
                class="nav-section">
                <p v-if="!isCollapsed" class="section-label">Giao chỉ tiêu</p>
                <div class="nav-group">
                    <button class="nav-item nav-toggle" @click="toggleMenu('giaoVaPhanBo')">
                        <span class="nav-left">
                            <i class="bi bi-diagram-3"></i>
                            <span v-if="!isCollapsed">Giao và phân bổ chỉ tiêu</span>
                        </span>
                        <i v-if="!isCollapsed"
                            :class="['bi', menus.giaoVaPhanBo ? 'bi-chevron-down' : 'bi-chevron-right']"></i>
                    </button>
                    <div v-show="menus.giaoVaPhanBo && !isCollapsed" class="sub-menu">
                        <RouterLink v-if="hasPermission('ManageAssignmentWaves')" to="/dot-giao-chi-tieu"
                            class="sub-item" active-class="active">
                            Đợt giao chỉ tiêu
                        </RouterLink>
                        <RouterLink v-if="hasPermission('AssignTargetsToCatp')" to="/giao-cho-catp" class="sub-item"
                            active-class="active">
                            Giao chỉ tiêu cho CATP
                        </RouterLink>
                        <RouterLink v-if="hasPermission('AssignTargetsToPhong')" to="/giao-cho-phong" class="sub-item"
                            active-class="active">
                            Giao chỉ tiêu cho Phòng
                        </RouterLink>
                        <RouterLink v-if="hasPermission('AssignTargetsToCadp')" to="/giao-cho-cadp-phuong-xa"
                            class="sub-item" active-class="active">
                            Giao chỉ tiêu cho CADP phường/xã
                        </RouterLink>
                        <RouterLink v-if="hasPermission('ViewAssignedTargetsList')" to="/danh-sach-chi-tieu-duoc-giao"
                            class="sub-item" active-class="active">
                            Danh sách chỉ tiêu được giao
                        </RouterLink>
                    </div>
                </div>
            </nav>

            <nav v-if="hasAnyPermission(['SubmitPeriodicReports', 'ViewExecutionProgress', 'ViewUnitsPendingUpdate'])"
                class="nav-section">
                <p v-if="!isCollapsed" class="section-label">Theo dõi thực hiện</p>
                <div class="nav-group">
                    <button class="nav-item nav-toggle" @click="toggleMenu('theoDoiThucHien')">
                        <span class="nav-left">
                            <i class="bi bi-clipboard-data"></i>
                            <span v-if="!isCollapsed">Theo dõi kết quả</span>
                        </span>
                        <i v-if="!isCollapsed"
                            :class="['bi', menus.theoDoiThucHien ? 'bi-chevron-down' : 'bi-chevron-right']"></i>
                    </button>
                    <div v-show="menus.theoDoiThucHien && !isCollapsed" class="sub-menu">
                        <RouterLink v-if="hasPermission('SubmitPeriodicReports')" to="/nhap-ket-qua" class="sub-item"
                            active-class="active">
                            Nhập kết quả báo cáo
                        </RouterLink>
                        <RouterLink v-if="hasPermission('ViewExecutionProgress')" to="/tien-do-thuc-hien"
                            class="sub-item" active-class="active">
                            Tiến độ thực hiện
                        </RouterLink>
                        <RouterLink v-if="hasPermission('ViewUnitsPendingUpdate')" to="/don-vi-chua-cap-nhat"
                            class="sub-item" active-class="active">
                            Đơn vị chưa nộp báo cáo
                        </RouterLink>
                    </div>
                </div>
            </nav>

            <nav v-if="hasAnyPermission(['ConfigureEvaluationThresholds', 'ViewRiskWarnings', 'CompareUnits', 'RankUnits', 'ConfigureCompetitionGroups', 'ViewCompetitionGroups'])"
                class="nav-section">
                <p v-if="!isCollapsed" class="section-label">Đánh giá - phân tích</p>
                <div class="nav-group">
                    <button class="nav-item nav-toggle" @click="toggleMenu('danhGia')">
                        <span class="nav-left">
                            <i class="bi bi-bar-chart-line"></i>
                            <span v-if="!isCollapsed">Đánh giá và so sánh</span>
                        </span>
                        <i v-if="!isCollapsed"
                            :class="['bi', menus.danhGia ? 'bi-chevron-down' : 'bi-chevron-right']"></i>
                    </button>
                    <div v-show="menus.danhGia && !isCollapsed" class="sub-menu">
                        <RouterLink v-if="hasPermission('ConfigureEvaluationThresholds')"
                            to="/cau-hinh-danh-gia-chi-tieu" class="sub-item" active-class="active">
                            Cấu hình ngưỡng đánh giá
                        </RouterLink>
                        <RouterLink v-if="hasPermission('ViewRiskWarnings')" to="/canh-bao-rui-ro" class="sub-item"
                            active-class="active">
                            Cảnh báo rủi ro
                        </RouterLink>
                        <RouterLink v-if="hasPermission('CompareUnits')" to="/so-sanh-don-vi" class="sub-item"
                            active-class="active">
                            So sánh đơn vị
                        </RouterLink>
                        <RouterLink v-if="hasPermission('RankUnits')" to="/xep-hang-don-vi" class="sub-item"
                            active-class="active">
                            Xếp hạng đơn vị
                        </RouterLink>
                        <RouterLink v-if="hasPermission('ConfigureCompetitionGroups')" to="/thiet-lap-nhom-thi-dua"
                            class="sub-item" active-class="active">
                            Thiết lập nhóm thi đua
                        </RouterLink>
                        <RouterLink v-if="hasPermission('ViewCompetitionGroups')" to="/nhom-thi-dua" class="sub-item"
                            active-class="active">
                            Xếp hạng nhóm thi đua
                        </RouterLink>
                    </div>
                </div>
            </nav>

            <nav v-if="hasAnyPermission(['ViewSummaryReports', 'ViewAccumulatedEvaluation', 'ViewReportsByUnit', 'ViewReportsByIndicator'])"
                class="nav-section">
                <p v-if="!isCollapsed" class="section-label">Báo cáo</p>
                <div class="nav-group">
                    <button class="nav-item nav-toggle" @click="toggleMenu('baoCao')">
                        <span class="nav-left">
                            <i class="bi bi-file-earmark-bar-graph"></i>
                            <span v-if="!isCollapsed">Báo cáo và tổng hợp</span>
                        </span>
                        <i v-if="!isCollapsed"
                            :class="['bi', menus.baoCao ? 'bi-chevron-down' : 'bi-chevron-right']"></i>
                    </button>
                    <div v-show="menus.baoCao && !isCollapsed" class="sub-menu">
                        <RouterLink v-if="hasPermission('ViewSummaryReports')" to="/bao-cao-tong-hop" class="sub-item"
                            active-class="active">
                            Báo cáo tổng hợp
                        </RouterLink>
                        <RouterLink v-if="hasPermission('ViewAccumulatedEvaluation')" to="/tong-hop-so-lieu-cuoi-ky"
                            class="sub-item" active-class="active">
                            Tổng hợp số liệu cuối kỳ
                        </RouterLink>
                        <RouterLink v-if="hasPermission('ViewReportsByUnit')" to="/bao-cao-theo-don-vi" class="sub-item"
                            active-class="active">
                            Báo cáo theo đơn vị
                        </RouterLink>
                        <RouterLink v-if="hasPermission('ViewReportsByIndicator')" to="/bao-cao-theo-chi-tieu"
                            class="sub-item" active-class="active">
                            Báo cáo theo chỉ tiêu
                        </RouterLink>
                    </div>
                </div>
            </nav>

            <nav v-if="hasAnyPermission(['ManageUsers', 'ManagePermissions', 'ViewSystemLogs'])" class="nav-section">
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
                        <RouterLink v-if="hasPermission('ManageUsers')" to="/users" class="sub-item"
                            active-class="active">
                            Người dùng
                        </RouterLink>
                        <RouterLink v-if="hasAdminRole && hasPermission('ResetUserPasswords')" to="/cap-lai-mat-khau"
                            class="sub-item" active-class="active">
                            Cấp lại mật khẩu
                        </RouterLink>
                        <RouterLink v-if="hasPermission('ManagePermissions')" to="/permissions" class="sub-item"
                            active-class="active">
                            Phân quyền
                        </RouterLink>
                        <RouterLink v-if="hasPermission('ViewSystemLogs')" to="/nhat-ky-he-thong" class="sub-item"
                            active-class="active">
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
                        <img src="/dn.png" alt="Đà Nẵng" class="vn-flag" />
                        <div>
                            <h2>HỆ THỐNG THEO DÕI CHỈ TIÊU</h2>
                            <p>{{ currentDateTime }}</p>
                        </div>
                    </div>
                </div>

                <div class="topbar-right">
                    <div class="context-badge unit-badge">
                        <span class="label">Đơn vị</span>
                        <strong :title="currentUnitLabel">{{ currentUnitLabel }}</strong>
                    </div>

                    <div class="context-badge">
                        <span class="label">Vai trò</span>
                        <strong>{{ userRoleLabel }}</strong>
                    </div>

                    <div class="user-menu-wrapper">
                        <button type="button" class="user-menu" @click="toggleDropdown">
                            <i class="bi bi-person-circle"></i>
                            <div class="user-meta">
                                <strong :title="currentUserDisplayName">{{ currentUserDisplayName }}</strong>
                                <span>{{ user?.email || '---' }}</span>
                            </div>
                            <i class="bi bi-chevron-down"></i>
                        </button>

                        <div v-if="dropdownOpen" class="user-dropdown-menu">
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
    import { RouterLink, useRouter } from 'vue-router'
    import { useAuth } from '../composables/useAuth'
    import { canAccessAnyPermission, canAccessPermission, hasRole, resolveEffectivePermissions } from '../utils/accessControl'

    const router = useRouter()
    const { getMe, logout: authLogout, user } = useAuth()

    const dropdownOpen = ref(false)
    const savedCollapsed = localStorage.getItem('sidebar_collapsed')
    const isCollapsed = ref(savedCollapsed === null ? true : savedCollapsed === 'true')
    const now = ref(new Date())
    let timer = null

    const defaultMenus = {
        thietLapNen: true,
        giaoVaPhanBo: true,
        theoDoiThucHien: true,
        danhGia: true,
        baoCao: false,
        heThong: false
    }

    const savedMenus = localStorage.getItem('sidebar_menus')
    const menus = reactive({
        ...defaultMenus,
        ...(savedMenus ? JSON.parse(savedMenus) : {})
    })

    watch(
        menus,
        (newValue) => {
            localStorage.setItem('sidebar_menus', JSON.stringify(newValue))
        },
        { deep: true }
    )

    watch(isCollapsed, (value) => {
        localStorage.setItem('sidebar_collapsed', String(value))
    })

    const userRoleLabel = computed(() => {
        if (!Array.isArray(user.value?.roles) || user.value.roles.length === 0) {
            return 'Người dùng'
        }

        return user.value.roles.join(', ')
    })

    const currentUnitLabel = computed(() => {
        if (!user.value) return '---'
        return user.value.donVi || 'Chưa gán đơn vị'
    })

    const currentUserDisplayName = computed(() => {
        if (!user.value) return '---'
        return user.value.fullName || user.value.userName || user.value.email || '---'
    })

    const userPermissions = computed(() => resolveEffectivePermissions(user.value))

    const hasPermission = (permission) => canAccessPermission(userPermissions.value, permission, user.value)
    const hasAnyPermission = (permissions) => canAccessAnyPermission(userPermissions.value, permissions, user.value)
    const hasAdminRole = computed(() => hasRole(user.value, 'Admin'))

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

    const logout = async () => {
        await authLogout()
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
        background: linear-gradient(180deg, #f7f2e7 0%, #eef3fb 42%, #f7f9fd 100%);
        color: #1a263d;
    }

    .sidebar {
        width: 280px;
        background:
            radial-gradient(circle at top left, rgba(216, 173, 82, 0.26), transparent 24%),
            linear-gradient(180deg, #0b4a29 0%, #0d5f33 52%, #0f7340 100%);
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
        align-items: center;
        gap: 12px;
        padding: 4px 8px 18px;
        border-bottom: 1px solid rgba(230, 193, 106, 0.22);
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
        color: rgba(244, 229, 189, 0.82);
        line-height: 1.5;
    }

    .icon-btn {
        width: 64px;
        height: 64px;
        border: none;
        border-radius: 18px;
        background: rgba(255, 255, 255, 0.04);
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
        overflow: hidden;
        flex-shrink: 0;
    }

    .brand-logo {
        width: 100%;
        height: 100%;
        object-fit: contain;
        object-position: center;
        border-radius: 18px;
        display: block;
    }

    .section-label {
        margin: 18px 10px 10px;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: rgba(243, 221, 166, 0.7);
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
        color: #f8fbff;
        padding: 12px 14px;
        border-radius: 14px;
        cursor: pointer;
        font-size: 14px;
        margin-bottom: 4px;
        box-shadow: inset 0 0 0 1px transparent;
    }

    .nav-item:hover,
    .nav-item.active,
    .nav-toggle:hover {
        background: linear-gradient(90deg, rgba(216, 173, 82, 0.22), rgba(255, 255, 255, 0.08));
        box-shadow: inset 0 0 0 1px rgba(232, 200, 125, 0.18);
    }

    .nav-left {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .sub-menu {
        margin: 6px 0 10px 14px;
        padding-left: 10px;
        border-left: 1px solid rgba(228, 191, 102, 0.26);
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .sub-item {
        width: 100%;
        display: flex;
        align-items: center;
        min-height: 44px;
        color: rgba(246, 241, 227, 0.9);
        padding: 10px 14px;
        border-radius: 12px;
        font-size: 13px;
        line-height: 1.4;
        position: relative;
        transition: background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
    }

    .sub-item::before {
        content: '';
        width: 6px;
        height: 6px;
        border-radius: 999px;
        background: rgba(246, 241, 227, 0.58);
        margin-right: 10px;
        flex-shrink: 0;
    }

    .sub-item:hover,
    .sub-item.active {
        background: linear-gradient(90deg, rgba(216, 173, 82, 0.18), rgba(255, 255, 255, 0.08));
        color: #fffdf5;
        box-shadow: inset 0 0 0 1px rgba(232, 200, 125, 0.14);
    }

    .sub-item.active::before {
        background: #f7d88c;
    }

    .content-shell {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-width: 0;
    }

    .topbar {
        height: 76px;
        background:
            linear-gradient(90deg, rgba(255, 248, 230, 0.96), rgba(247, 239, 212, 0.96)),
            linear-gradient(180deg, #fef3c7, #f8e0a2);
        border-bottom: 1px solid rgba(200, 155, 60, 0.24);
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 24px;
        gap: 20px;
        box-shadow: 0 10px 20px rgba(8, 21, 47, 0.05);
    }

    .topbar-left h2 {
        margin: 0;
        font-size: 22px;
        font-weight: 700;
        color: #0f2759;
    }

    .topbar-left p {
        margin: 4px 0 0;
        font-size: 13px;
        color: #6c7287;
    }

    .topbar-right {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 0;
    }

    .context-badge {
        min-width: 150px;
        padding: 10px 14px;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(248, 241, 219, 0.88));
        border: 1px solid rgba(200, 155, 60, 0.18);
        border-radius: 14px;
        box-shadow: 0 10px 18px rgba(8, 21, 47, 0.06);
    }

    .unit-badge {
        min-width: 220px;
        max-width: 320px;
    }

    .context-badge .label {
        display: block;
        font-size: 11px;
        color: #7b6d4d;
        margin-bottom: 4px;
    }

    .context-badge strong {
        display: block;
        font-size: 13px;
        color: #122d61;
        max-width: 190px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
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
        border: 1px solid rgba(200, 155, 60, 0.2);
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(247, 240, 219, 0.9));
        cursor: pointer;
        box-shadow: 0 10px 22px rgba(8, 21, 47, 0.08);
        min-width: 220px;
        max-width: 320px;
    }

    .user-menu i.bi-person-circle {
        font-size: 28px;
        color: #c89b3c;
    }

    .user-meta {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        min-width: 0;
        flex: 1;
    }

    .user-meta strong {
        display: block;
        font-size: 13px;
        color: #102753;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .user-meta span {
        display: block;
        font-size: 12px;
        color: #6c7287;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .user-dropdown-menu {
        position: absolute;
        right: 0;
        top: calc(100% + 8px);
        min-width: 220px;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(251, 246, 233, 0.96));
        border: 1px solid rgba(200, 155, 60, 0.18);
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
        color: #122348;
        cursor: pointer;
        font-size: 14px;
    }

    .dropdown-item:hover {
        background: rgba(216, 173, 82, 0.12);
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
        width: 48px;
        height: 36px;
        object-fit: cover;
        border-radius: 3px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    }

    .vn-flag {
        width: 48px;
        height: 48px;
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
        color: #7b6d4d;
    }
</style>
