import { createRouter, createWebHistory } from "vue-router"

import Login from "../components/login.vue"
import Dashboard from "../components/Dashboard.vue"

import DanhMucChiTieuPage from "../components/views/DanhMucChiTieuPage.vue"
import ChiTieuBoGiaoPage from "../components/views/ChiTieuBoGiaoPage.vue"
import ChiTieuThanhPhoGiaoPage from "../components/views/ChiTieuThanhPhoGiaoPage.vue"
import DanhMucDonViPage from "../components/views/DanhMucDonViPage.vue"
import CanhBaoRuiRoPage from "../components/views/CanhBaoRuiRoPage.vue"
import BaoCaoTheoChiTieuPage from "../components/views/BaoCaoTheoChiTieuPage.vue"

import DonViChuaCapNhatPage from "../components/views/DonViChuaCapNhatPage.vue"
import DotGiaoChiTieuPage from "../components/views/DotGiaoChiTieuPage.vue"
import GiaoChiTieuChoDonViPage from "../components/views/GiaoChiTieuChoDonViPage.vue"
import KyBaoCaoPage from "../components/views/KyBaoCaoPage.vue"
import NguoiDungPage from "../components/views/NguoiDungPage.vue"
import NhapKetQuaPage from "../components/views/NhapKetQuaPage.vue"
import NhatKyHeThongPage from "../components/views/NhatKyHeThongPage.vue"
import Permissions from "../components/views/Permissions.vue"
import PhanQuyenPage from "../components/views/PhanQuyenPage.vue"
import PhanRaChiTieuBoGiaoPage from "../components/views/PhanRaChiTieuBoGiaoPage.vue"
import SoSanhDonViPage from "../components/views/SoSanhDonViPage.vue"
import TienDoThucHienPage from "../components/views/TienDoThucHienPage.vue"
import TongHopDanhGiaPage from "../components/views/TongHopDanhGiaPage.vue"
import Users from "../components/views/Users.vue"
import XepHangDonViPage from "../components/views/XepHangDonViPage.vue"
import XuatBaoCaoPage from "../components/views/XuatBaoCaoPage.vue"

const routes = [
    {
        path: "/login",
        name: "Login",
        component: Login
    },

    {
        path: "/dashboard",
        name: "Dashboard",
        component: Dashboard,
        meta: { requiresAuth: true }
    },



    // Quản lý chỉ tiêu
    {
        path: "/danh-muc-chi-tieu",
        name: "DanhMucChiTieu",
        component: DanhMucChiTieuPage,
        meta: { requiresAuth: true }
    },

    {
        path: "/chi-tieu-bo-giao",
        name: "ChiTieuBoGiao",
        component: ChiTieuBoGiaoPage,
        meta: { requiresAuth: true }
    },

    {
        path: "/chi-tieu-thanh-pho-giao",
        name: "ChiTieuThanhPhoGiao",
        component: ChiTieuThanhPhoGiaoPage,
        meta: { requiresAuth: true }
    },

    {
        path: "/don-vi",
        name: "DonVi",
        component: DanhMucDonViPage,
        meta: { requiresAuth: true }
    },


    {
        path: "/ky-bao-cao",
        name: "KyBaoCao",
        component: KyBaoCaoPage,
        meta: { requiresAuth: true }
    },

    // Giao chỉ tiêu
    {
        path: "/dot-giao-chi-tieu",
        name: "DotGiaoChiTieu",
        component: DotGiaoChiTieuPage,
        meta: { requiresAuth: true }
    },
    {
        path: "/phan-ra-chi-tieu-bo-giao",
        name: "PhanRaChiTieuBoGiao",
        component: PhanRaChiTieuBoGiaoPage,
        meta: { requiresAuth: true }
    },
    {
        path: "/giao-chi-tieu-don-vi",
        name: "GiaoChiTieuChoDonVi",
        component: GiaoChiTieuChoDonViPage,
        meta: { requiresAuth: true }
    },

    // Theo dõi và giám sát
    {
        path: "/nhap-ket-qua",
        name: "NhapKetQua",
        component: NhapKetQuaPage,
        meta: { requiresAuth: true }
    },
    {
        path: "/tien-do-thuc-hien",
        name: "TienDoThucHien",
        component: TienDoThucHienPage,
        meta: { requiresAuth: true }
    },
    {
        path: "/don-vi-chua-cap-nhat",
        name: "DonViChuaCapNhat",
        component: DonViChuaCapNhatPage,
        meta: { requiresAuth: true }
    },
    {
        path: "/so-sanh-don-vi",
        name: "SoSanhDonVi",
        component: SoSanhDonViPage,
        meta: { requiresAuth: true }
    },

    // Đánh giá và báo cáo
    {
        path: "/tong-hop-danh-gia",
        name: "TongHopDanhGia",
        component: TongHopDanhGiaPage,
        meta: { requiresAuth: true }
    },
    {
        path: "/xep-hang-don-vi",
        name: "XepHangDonVi",
        component: XepHangDonViPage,
        meta: { requiresAuth: true }
    },
    {
        path: "/xuat-bao-cao",
        name: "XuatBaoCao",
        component: XuatBaoCaoPage,
        meta: { requiresAuth: true }
    },
    {
        path: "/canh-bao-rui-ro",
        name: "CanhBaoRuiRo",
        component: CanhBaoRuiRoPage,
        meta: { requiresAuth: true }
    },
    {
        path: "/bao-cao-theo-chi-tieu",
        name: "BaoCaoTheoChiTieu",
        component: BaoCaoTheoChiTieuPage,
        meta: { requiresAuth: true }
    },

    // Quản trị
    {
        path: "/users",
        name: "Users",
        component: Users,
        meta: { requiresAuth: true }
    },
    {
        path: "/users-page",
        name: "NguoiDungPage",
        component: NguoiDungPage,
        meta: { requiresAuth: true }
    },
    {
        path: "/permissions",
        name: "Permissions",
        component: Permissions,
        meta: { requiresAuth: true }
    },
    {
        path: "/phan-quyen",
        name: "PhanQuyen",
        component: PhanQuyenPage,
        meta: { requiresAuth: true }
    },
    {
        path: "/nhat-ky-he-thong",
        name: "NhatKyHeThong",
        component: NhatKyHeThongPage,
        meta: { requiresAuth: true }
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

router.beforeEach((to) => {
    const token = localStorage.getItem("token")

    if (to.meta.requiresAuth && !token) {
        return { path: "/login" }
    }

    if (to.path === "/login" && token) {
        return { path: "/dashboard" }
    }

    return true
})

export default router