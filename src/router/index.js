import { createRouter, createWebHistory } from "vue-router"

import Login from "../components/login.vue"
import Dashboard from "../components/Dashboard.vue"
import BaoCaoChiTieuCongAnThanhPhoPage from "../components/views/BaoCaoChiTieuCongAnThanhPhoPage.vue"

import DanhMucChiTieuPage from "../components/views/DanhMucChiTieuPage.vue"
import DanhMucDonViPage from "../components/views/DanhMucDonViPage.vue"
import DanhSachChiTieuDuocGiaoPage from "../components/views/DanhSachChiTieuDuocGiaoPage.vue"
import CanhBaoRuiRoPage from "../components/views/CanhBaoRuiRoPage.vue"
import BaoCaoTheoChiTieuPage from "../components/views/BaoCaoTheoChiTieuPage.vue"
import CauHinhDanhGiaChiTieuPage from "../components/views/CauHinhDanhGiaChiTieuPage.vue"
import BaoCaoTongHopPage from "../components/views/BaoCaoTongHopPage.vue"
import BaoCaoTheoDonViPage from "../components/views/BaoCaoTheoDonViPage.vue"
import CapLaiMatKhauPage from "../components/views/CapLaiMatKhauPage.vue"

import DonViChuaCapNhatPage from "../components/views/DonViChuaCapNhatPage.vue"
import DotGiaoChiTieuPage from "../components/views/DotGiaoChiTieuPage.vue"
import GiaoChoCatpPage from "../components/views/GiaoChoCatpPage.vue"
import GiaoChoPhongPage from "../components/views/GiaoChoPhongPage.vue"
import GiaoChoCadpPhuongXaPage from "../components/views/GiaoChoCadpPhuongXaPage.vue"
import KyBaoCaoPage from "../components/views/KyBaoCaoPage.vue"
import NhapKetQuaPage from "../components/views/NhapKetQuaPage.vue"
import NhomThiDuaPage from "../components/views/NhomThiDuaPage.vue"
import ThietLapNhomThiDuaPage from "../components/views/ThietLapNhomThiDuaPage.vue"
import NhatKyHeThongPage from "../components/views/NhatKyHeThongPage.vue"
import Permissions from "../components/views/Permissions.vue"
import SoSanhDonViPage from "../components/views/SoSanhDonViPage.vue"
import TienDoThucHienPage from "../components/views/TienDoThucHienPage.vue"
import TongHopDanhGiaLuyKePage from "../components/views/TongHopDanhGiaLuyKePage.vue"
import Users from "../components/views/Users.vue"
import XepHangDonViPage from "../components/views/XepHangDonViPage.vue"
import {
    canAccessPermission,
    getStoredUserPermissions,
    getStoredUserProfile,
    hasRole,
    isCatpProfile,
    isPrivilegedProfile
} from "../utils/accessControl"

const routes = [
    {
        path: "/login",
        name: "Đăng nhập",
        component: Login
    },

    {
        path: "/dashboard",
        name: "Dashboard",
        component: Dashboard,
        meta: { requiresAuth: true, permission: "ViewDashboard" }
    },
    {
        path: "/bao-cao-chi-tieu-cong-an-thanh-pho",
        name: "BaoCaoChiTieuCongAnThanhPho",
        component: BaoCaoChiTieuCongAnThanhPhoPage,
        meta: { requiresAuth: true, permission: "ViewCatpIndicatorReport" }
    },



    // Quản lý chỉ tiêu
    {
        path: "/danh-muc-chi-tieu",
        name: "DanhMucChiTieu",
        component: DanhMucChiTieuPage,
        meta: { requiresAuth: true, permission: "ManageIndicatorCatalog" }
    },

    {
        path: "/giao-cho-catp",
        alias: "/chi-tieu-bo-giao",
        name: "GiaoChoCATP",
        component: GiaoChoCatpPage,
        meta: { requiresAuth: true, permission: "AssignTargetsToCatp" }
    },

    {
        path: "/giao-cho-phong",
        alias: "/chi-tieu-thanh-pho-giao",
        name: "GiaoChoPhong",
        component: GiaoChoPhongPage,
        meta: { requiresAuth: true, permission: "AssignTargetsToPhong" }
    },

    {
        path: "/don-vi",
        name: "DonVi",
        component: DanhMucDonViPage,
        meta: { requiresAuth: true, permission: "ManageUnitCatalog" }
    },


    {
        path: "/ky-bao-cao",
        name: "KyBaoCao",
        component: KyBaoCaoPage,
        meta: { requiresAuth: true, permission: "ManageReportingPeriods" }
    },

    // Giao chỉ tiêu
    {
        path: "/dot-giao-chi-tieu",
        name: "DotGiaoChiTieu",
        component: DotGiaoChiTieuPage,
        meta: { requiresAuth: true, permission: "ManageAssignmentWaves" }
    },
    {
        path: "/cau-hinh-danh-gia-chi-tieu",
        name: "CauHinhDanhGiaChiTieu",
        component: CauHinhDanhGiaChiTieuPage,
        meta: { requiresAuth: true, permission: "ConfigureEvaluationThresholds" }
    },
    {
        path: "/giao-cho-cadp-phuong-xa",
        alias: "/giao-chi-tieu-don-vi",
        name: "GiaoChoCadpPhuongXa",
        component: GiaoChoCadpPhuongXaPage,
        meta: { requiresAuth: true, permission: "AssignTargetsToCadp" }
    },
    {
        path: "/danh-sach-chi-tieu-duoc-giao",
        name: "DanhSachChiTieuDuocGiao",
        component: DanhSachChiTieuDuocGiaoPage,
        meta: { requiresAuth: true, permission: "ViewAssignedTargetsList" }
    },

    // Theo dõi và giám sát
    {
        path: "/nhap-ket-qua",
        name: "NhapKetQua",
        component: NhapKetQuaPage,
        meta: { requiresAuth: true, permission: "SubmitPeriodicReports" }
    },
    {
        path: "/tien-do-thuc-hien",
        name: "TienDoThucHien",
        component: TienDoThucHienPage,
        meta: { requiresAuth: true, permission: "ViewExecutionProgress" }
    },
    {
        path: "/don-vi-chua-cap-nhat",
        name: "DonViChuaCapNhat",
        component: DonViChuaCapNhatPage,
        meta: { requiresAuth: true, permission: "ViewUnitsPendingUpdate" }
    },
    {
        path: "/so-sanh-don-vi",
        name: "SoSanhDonVi",
        component: SoSanhDonViPage,
        meta: { requiresAuth: true, permission: "CompareUnits" }
    },

    // Đánh giá và báo cáo
    {
        path: "/tong-hop-so-lieu-cuoi-ky",
        alias: ["/tong-hop-danh-gia-luy-ke", "/tong-hop-danh-gia"],
        name: "TongHopSoLieuCuoiKy",
        component: TongHopDanhGiaLuyKePage,
        meta: { requiresAuth: true, permission: "ViewAccumulatedEvaluation" }
    },
    {
        path: "/xep-hang-don-vi",
        name: "XepHangDonVi",
        component: XepHangDonViPage,
        meta: { requiresAuth: true, permission: "RankUnits" }
    },
    {
        path: "/thiet-lap-nhom-thi-dua",
        name: "ThietLapNhomThiDua",
        component: ThietLapNhomThiDuaPage,
        meta: { requiresAuth: true, permission: "ConfigureCompetitionGroups" }
    },
    {
        path: "/nhom-thi-dua",
        name: "NhomThiDua",
        component: NhomThiDuaPage,
        meta: { requiresAuth: true, permission: "ViewCompetitionGroups" }
    },
    {
        path: "/bao-cao-tong-hop",
        name: "BaoCaoTongHop",
        component: BaoCaoTongHopPage,
        meta: { requiresAuth: true, permission: "ViewSummaryReports" }
    },
    {
        path: "/bao-cao-theo-don-vi",
        name: "BaoCaoTheoDonVi",
        component: BaoCaoTheoDonViPage,
        meta: { requiresAuth: true, permission: "ViewReportsByUnit" }
    },

    {
        path: "/canh-bao-rui-ro",
        name: "CanhBaoRuiRo",
        component: CanhBaoRuiRoPage,
        meta: { requiresAuth: true, permission: "ViewRiskWarnings" }
    },
    {
        path: "/bao-cao-theo-chi-tieu",
        name: "BaoCaoTheoChiTieu",
        component: BaoCaoTheoChiTieuPage,
        meta: { requiresAuth: true, permission: "ViewReportsByIndicator" }
    },

    // Quản trị
    {
        path: "/users",
        name: "Users",
        component: Users,
        meta: { requiresAuth: true, permission: "ManageUsers" }
    },
    {
        path: "/cap-lai-mat-khau",
        name: "CapLaiMatKhau",
        component: CapLaiMatKhauPage,
        meta: { requiresAuth: true, permission: "ResetUserPasswords", adminOnly: true }
    },
    {
        path: "/permissions",
        name: "Permissions",
        component: Permissions,
        meta: { requiresAuth: true, permission: "ManagePermissions" }
    },

    {
        path: "/nhat-ky-he-thong",
        name: "NhatKyHeThong",
        component: NhatKyHeThongPage,
        meta: { requiresAuth: true, permission: "ViewSystemLogs" }
    },

    {
        path: "/",
        redirect: "/login"
    },
    {
        path: "/:pathMatch(.*)*",
        redirect: "/login"
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

const shouldLandOnDonVi = (profile) => {
    if (!profile) return false
    return !isPrivilegedProfile(profile) && !isCatpProfile(profile)
}

const getFirstAuthorizedPath = (permissions, profile) => {
    if (shouldLandOnDonVi(profile)) {
        return "/don-vi"
    }

    const firstRoute = routes.find(route => {
        if (!route?.path || route.path === "/login" || route.path === "/") return false
        if (!route?.meta?.requiresAuth) return false
        return canAccessPermission(permissions, route.meta.permission, profile)
    })

    return firstRoute?.path || "/login"
}

router.beforeEach((to) => {
    const token = localStorage.getItem("token")
    const permissions = getStoredUserPermissions()
    const profile = getStoredUserProfile()

    if (to.meta.requiresAuth && !token) {
        return { path: "/login" }
    }

    if (token && to.meta?.adminOnly && !hasRole(profile, "Admin")) {
        const fallbackPath = getFirstAuthorizedPath(permissions, profile)
        if (fallbackPath !== to.path) {
            return { path: fallbackPath }
        }
        return { path: "/login" }
    }

    if (to.path === "/login" && token) {
        return { path: getFirstAuthorizedPath(permissions, profile) }
    }

    if (token && to.path === "/don-vi" && shouldLandOnDonVi(profile)) {
        return true
    }

    if (token && to.meta.requiresAuth && !canAccessPermission(permissions, to.meta.permission, profile)) {
        const fallbackPath = getFirstAuthorizedPath(permissions, profile)
        if (fallbackPath === "/login") {
            localStorage.removeItem("token")
            localStorage.removeItem("refreshToken")
            localStorage.removeItem("user")
            return { path: "/login" }
        }

        if (fallbackPath !== to.path) {
            return { path: fallbackPath }
        }
    }

    return true
})

export default router


