<template>
    <BaseLayout>
        <div class="page-wrap">
            <div class="container-fluid py-4">
                <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
                    <div>
                        <h1 class="page-title mb-1">Đơn vị chưa nộp báo cáo KPI</h1>
                        <p class="page-subtitle mb-0">
                            Theo dõi các đơn vị/chỉ tiêu chưa có báo cáo theo kỳ
                        </p>
                    </div>

                    <button class="btn btn-primary btn-action" @click="fetchData">
                        <i class="bi bi-arrow-repeat me-2"></i>
                        Tải lại dữ liệu
                    </button>
                </div>

                <div class="card custom-card mb-4">
                    <div class="card-header bg-white border-0 pb-0">
                        <h5 class="mb-1">Bộ lọc tìm kiếm</h5>
                        <small class="text-muted">Tra cứu nhanh đơn vị chưa nộp báo cáo</small>
                    </div>

                    <div class="card-body">
                        <div class="row g-3">
                            <div class="col-12 col-md-4">
                                <label class="form-label">Kỳ báo cáo KPI</label>
                                <select v-model.number="filters.kyBaoCaoKPIId" class="form-select">
                                    <option :value="null">Tất cả</option>
                                    <option v-for="item in kyBaoCaoOptions" :key="getId(item)" :value="getId(item)">
                                        {{ getKyBaoCaoDisplay(item) }}
                                    </option>
                                </select>
                            </div>

                            <div class="col-12 col-md-4">
                                <label class="form-label">Đơn vị thực hiện</label>
                                <select v-model.number="filters.donViNhanId" class="form-select">
                                    <option :value="null">Tất cả</option>
                                    <option v-for="item in donViOptions" :key="getId(item)" :value="getId(item)">
                                        {{ getTenDonVi(item) }}
                                    </option>
                                </select>
                            </div>

                            <div class="col-12 col-md-4">
                                <label class="form-label">Từ khóa</label>
                                <input v-model="filters.keyword" type="text" class="form-control"
                                    placeholder="Mã chỉ tiêu, tên chỉ tiêu, tên đơn vị..." />
                            </div>
                        </div>

                        <div class="d-flex flex-wrap gap-2 mt-4">
                            <button class="btn btn-primary" @click="fetchData">
                                <i class="bi bi-search me-1"></i>
                                Tải dữ liệu
                            </button>
                            <button class="btn btn-outline-secondary" @click="resetFilters">
                                <i class="bi bi-arrow-clockwise me-1"></i>
                                Đặt lại
                            </button>
                        </div>
                    </div>
                </div>

                <div class="row g-3 mb-4">
                    <div class="col-12 col-md-4">
                        <div class="card custom-card stat-card">
                            <div class="card-body">
                                <div class="stat-label">Tổng chỉ tiêu phải báo cáo</div>
                                <div class="stat-value">{{ requiredReportItems.length }}</div>
                            </div>
                        </div>
                    </div>

                    <div class="col-12 col-md-4">
                        <div class="card custom-card stat-card">
                            <div class="card-body">
                                <div class="stat-label">Đã nộp báo cáo</div>
                                <div class="stat-value text-success">{{ submittedItems.length }}</div>
                            </div>
                        </div>
                    </div>

                    <div class="col-12 col-md-4">
                        <div class="card custom-card stat-card">
                            <div class="card-body">
                                <div class="stat-label">Chưa nộp báo cáo</div>
                                <div class="stat-value text-danger">{{ filteredMissingItems.length }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card custom-card">
                    <div class="card-header bg-white d-flex justify-content-between align-items-center border-0">
                        <div>
                            <h5 class="mb-1">Danh sách chưa nộp</h5>
                            <small class="text-muted">Các đơn vị/chỉ tiêu chưa có bản ghi theo dõi KPI</small>
                        </div>
                        <span class="badge text-bg-light border">Tổng: {{ filteredMissingItems.length }}</span>
                    </div>

                    <div class="card-body p-0">
                        <div v-if="loading" class="empty-state">
                            <div class="spinner-border text-primary mb-3" role="status"></div>
                            <div>Đang tải dữ liệu...</div>
                        </div>

                        <div v-else-if="!filteredMissingItems.length" class="empty-state">
                            <i class="bi bi-check-circle fs-1 text-success mb-2"></i>
                            <div>Không có đơn vị nào chưa nộp báo cáo</div>
                        </div>

                        <div v-else class="table-responsive">
                            <table class="table table-hover align-middle mb-0 custom-table">
                                <thead>
                                    <tr>
                                        <th>Kỳ báo cáo</th>
                                        <th>Đơn vị thực hiện</th>
                                        <th>Mã chỉ tiêu</th>
                                        <th>Tên chỉ tiêu</th>
                                        <th>Tần suất</th>
                                        <th>Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="item in filteredMissingItems" :key="item.uniqueKey">
                                        <td>
                                            <div class="fw-semibold">{{ item.tenKy }}</div>
                                            <small class="text-muted">{{ item.maKy || '-' }}</small>
                                        </td>
                                        <td>{{ item.tenDonViNhan || '-' }}</td>
                                        <td class="fw-semibold text-primary">{{ item.maChiTieu || '-' }}</td>
                                        <td>{{ item.tenChiTieu || '-' }}</td>
                                        <td>{{ mapTanSuat(item.tanSuatBaoCao) }}</td>
                                        <td>
                                            <span class="badge rounded-pill text-bg-danger">
                                                Chưa nộp
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </BaseLayout>
</template>

<script setup>
    import { computed, onMounted, reactive, ref } from 'vue'
    import axios from 'axios'
    import BaseLayout from '../BaseLayout.vue'

    const api = axios.create({
        baseURL: 'https://localhost:5000/api'
    })

    api.interceptors.request.use((config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    })

    const API_PATHS = {
        theoDoiThucHienKPI: '/TheoDoiThucHienKPI',
        chiTietGiaoChiTieu: '/ChiTietGiaoChiTieu',
        kyBaoCaoKPI: '/KyBaoCaoKPI',
        danhMucChiTieu: '/danh-muc-chi-tieu',
        donVi: '/DonVi'
    }

    const loading = ref(false)

    const theoDoiItems = ref([])
    const chiTietGiaoChiTieuOptions = ref([])
    const kyBaoCaoOptions = ref([])
    const danhMucChiTieuOptions = ref([])
    const donViOptions = ref([])

    const filters = reactive({
        kyBaoCaoKPIId: null,
        donViNhanId: null,
        keyword: ''
    })

    const getId = (item) => Number(item?.Id ?? item?.id ?? 0)

    const normalizeList = (response) => {
        if (Array.isArray(response?.data)) return response.data
        if (Array.isArray(response?.data?.data)) return response.data.data
        if (Array.isArray(response?.data?.items)) return response.data.items
        return []
    }

    const getKyBaoCaoDisplay = (item) => {
        return item?.TenKy || item?.tenKy || item?.TenKyBaoCao || item?.tenKyBaoCao || '-'
    }

    const getMaKy = (item) => {
        return item?.MaKy || item?.maKy || '-'
    }

    const getLoaiKy = (item) => {
        return item?.LoaiKy || item?.loaiKy || item?.LoaiKyBaoCao || item?.loaiKyBaoCao || ''
    }

    const getTrangThaiKy = (item) => {
        return item?.TrangThai || item?.trangThai || item?.TrangThaiKy || item?.trangThaiKy || ''
    }

    const getTanSuatBaoCao = (item) => {
        return item?.TanSuatBaoCao || item?.tanSuatBaoCao || ''
    }

    const getDanhMucChiTieuId = (item) => {
        return Number(item?.DanhMucChiTieuId ?? item?.danhMucChiTieuId ?? 0)
    }

    const getDonViNhanId = (item) => {
        return Number(item?.DonViNhanId ?? item?.donViNhanId ?? 0)
    }

    const getTenDonVi = (item) => {
        return item?.TenDonVi || item?.tenDonVi || '-'
    }

    const mapTanSuat = (value) => {
        const map = {
            THANG: 'Tháng',
            QUY: 'Quý',
            '6THANG': '6 tháng',
            NAM: 'Năm'
        }
        return map[value] || value || '-'
    }

    const isKyDangMo = (item) => {
        return getTrangThaiKy(item) === 'DANG_MO'
    }

    const isKyPhuHopTanSuat = (kyItem, tanSuatBaoCao) => {
        if (!tanSuatBaoCao) return true

        const loaiKy = getLoaiKy(kyItem)

        const map = {
            THANG: ['THANG'],
            QUY: ['QUY'],
            '6THANG': ['6THANG', 'SAU_THANG', 'BAN_NIEN'],
            NAM: ['NAM']
        }

        return (map[tanSuatBaoCao] || []).includes(loaiKy)
    }

    const findDanhMucById = (id) => {
        return danhMucChiTieuOptions.value.find((x) => getId(x) === Number(id)) || null
    }

    const findDonViById = (id) => {
        return donViOptions.value.find((x) => getId(x) === Number(id)) || null
    }

    const enrichedChiTietGiaoChiTieuOptions = computed(() => {
        return chiTietGiaoChiTieuOptions.value.map((item) => {
            const danhMuc = findDanhMucById(getDanhMucChiTieuId(item))
            const donVi = findDonViById(getDonViNhanId(item))

            return {
                ...item,
                id: getId(item),
                donViNhanId: getDonViNhanId(item),
                maChiTieu:
                    item?.MaChiTieu ||
                    item?.maChiTieu ||
                    danhMuc?.MaChiTieu ||
                    danhMuc?.maChiTieu ||
                    '',
                tenChiTieu:
                    item?.TenChiTieu ||
                    item?.tenChiTieu ||
                    danhMuc?.TenChiTieu ||
                    danhMuc?.tenChiTieu ||
                    '',
                tenDonViNhan:
                    item?.TenDonViNhan ||
                    item?.tenDonViNhan ||
                    donVi?.TenDonVi ||
                    donVi?.tenDonVi ||
                    '',
                tanSuatBaoCao: getTanSuatBaoCao(item) || getTanSuatBaoCao(danhMuc)
            }
        })
    })

    const reportedKeys = computed(() => {
        return new Set(
            theoDoiItems.value.map((item) => {
                const chiTietId = Number(item?.ChiTietGiaoChiTieuId ?? item?.chiTietGiaoChiTieuId ?? 0)
                const kyId = Number(item?.KyBaoCaoKPIId ?? item?.kyBaoCaoKPIId ?? 0)
                return `${chiTietId}_${kyId}`
            })
        )
    })

    const requiredReportItems = computed(() => {
        const result = []

        enrichedChiTietGiaoChiTieuOptions.value.forEach((chiTiet) => {
            kyBaoCaoOptions.value.forEach((ky) => {
                if (!isKyDangMo(ky)) return
                if (!isKyPhuHopTanSuat(ky, chiTiet.tanSuatBaoCao)) return

                result.push({
                    uniqueKey: `${chiTiet.id}_${getId(ky)}`,
                    chiTietGiaoChiTieuId: chiTiet.id,
                    kyBaoCaoKPIId: getId(ky),
                    donViNhanId: chiTiet.donViNhanId,
                    tenDonViNhan: chiTiet.tenDonViNhan,
                    maChiTieu: chiTiet.maChiTieu,
                    tenChiTieu: chiTiet.tenChiTieu,
                    tanSuatBaoCao: chiTiet.tanSuatBaoCao,
                    tenKy: getKyBaoCaoDisplay(ky),
                    maKy: getMaKy(ky)
                })
            })
        })

        return result
    })

    const submittedItems = computed(() => {
        return requiredReportItems.value.filter((item) =>
            reportedKeys.value.has(`${item.chiTietGiaoChiTieuId}_${item.kyBaoCaoKPIId}`)
        )
    })

    const missingItems = computed(() => {
        return requiredReportItems.value.filter((item) =>
            !reportedKeys.value.has(`${item.chiTietGiaoChiTieuId}_${item.kyBaoCaoKPIId}`)
        )
    })

    const parentOptions = computed(() => {
        return donViOptions.value
    })

    const filteredMissingItems = computed(() => {
        const keyword = filters.keyword.trim().toLowerCase()

        return missingItems.value.filter((item) => {
            const matchKy =
                !filters.kyBaoCaoKPIId ||
                Number(filters.kyBaoCaoKPIId) === Number(item.kyBaoCaoKPIId)

            const matchDonVi =
                !filters.donViNhanId ||
                Number(filters.donViNhanId) === Number(item.donViNhanId)

            const searchText = [
                item.maChiTieu || '',
                item.tenChiTieu || '',
                item.tenDonViNhan || '',
                item.tenKy || '',
                item.maKy || ''
            ]
                .join(' ')
                .toLowerCase()

            const matchKeyword = !keyword || searchText.includes(keyword)

            return matchKy && matchDonVi && matchKeyword
        })
    })

    const fetchTheoDoiItems = async () => {
        const response = await api.get(API_PATHS.theoDoiThucHienKPI)
        theoDoiItems.value = normalizeList(response)
    }

    const fetchChiTietGiaoChiTieuOptions = async () => {
        const response = await api.get(API_PATHS.chiTietGiaoChiTieu)
        chiTietGiaoChiTieuOptions.value = normalizeList(response)
    }

    const fetchKyBaoCaoOptions = async () => {
        const response = await api.get(API_PATHS.kyBaoCaoKPI)
        kyBaoCaoOptions.value = normalizeList(response)
    }

    const fetchDanhMucChiTieuOptions = async () => {
        const response = await api.get(API_PATHS.danhMucChiTieu)
        danhMucChiTieuOptions.value = normalizeList(response)
    }

    const fetchDonViOptions = async () => {
        const response = await api.get(API_PATHS.donVi)
        donViOptions.value = normalizeList(response)
    }

    const fetchData = async () => {
        try {
            loading.value = true
            await Promise.all([
                fetchTheoDoiItems(),
                fetchChiTietGiaoChiTieuOptions(),
                fetchKyBaoCaoOptions(),
                fetchDanhMucChiTieuOptions(),
                fetchDonViOptions()
            ])
        } catch (error) {
            console.error('fetchData error:', error?.response?.status, error?.config?.url, error)
            alert(error?.response?.data?.message || 'Không tải được dữ liệu.')
        } finally {
            loading.value = false
        }
    }

    const resetFilters = () => {
        filters.kyBaoCaoKPIId = null
        filters.donViNhanId = null
        filters.keyword = ''
    }

    onMounted(async () => {
        await fetchData()
    })
</script>

<style scoped>
    .page-wrap {
        background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
        min-height: 100vh;
    }

    .page-title {
        font-size: 1.75rem;
        font-weight: 700;
        color: #0f172a;
    }

    .page-subtitle {
        color: #64748b;
        font-size: 0.95rem;
    }

    .custom-card {
        border: 0;
        border-radius: 20px;
        box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
        overflow: hidden;
    }

    .btn-action {
        border-radius: 12px;
        padding: 0.75rem 1rem;
        font-weight: 600;
    }

    .form-control,
    .form-select {
        border-radius: 12px;
        min-height: 44px;
        border-color: #dbe2ea;
        box-shadow: none;
    }

    .form-control:focus,
    .form-select:focus {
        border-color: #86b7fe;
        box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.12);
    }

    .form-label {
        font-weight: 600;
        color: #334155;
        margin-bottom: 0.45rem;
    }

    .custom-table thead th {
        background: #f8fafc;
        color: #334155;
        font-weight: 700;
        border-bottom: 1px solid #e2e8f0;
        white-space: nowrap;
    }

    .custom-table tbody td {
        padding-top: 1rem;
        padding-bottom: 1rem;
        border-color: #eef2f7;
        color: #334155;
    }

    .custom-table tbody tr:hover {
        background-color: #f8fbff;
    }

    .empty-state {
        min-height: 260px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        color: #64748b;
        font-weight: 500;
    }

    .stat-card .card-body {
        padding: 1.25rem 1.5rem;
    }

    .stat-label {
        color: #64748b;
        font-weight: 600;
        margin-bottom: 0.4rem;
    }

    .stat-value {
        font-size: 2rem;
        font-weight: 700;
        color: #0f172a;
    }
</style>