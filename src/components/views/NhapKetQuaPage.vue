<template>
    <BaseLayout>
        <div class="page-wrap">
            <div class="container-fluid py-4">
                <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
                    <div>
                        <h1 class="page-title mb-1">Theo dõi thực hiện KPI</h1>
                        <p class="page-subtitle mb-0">
                            Quản lý số liệu thực hiện KPI theo kỳ báo cáo
                        </p>
                    </div>

                    <button class="btn btn-primary btn-action" @click="openCreateModal">
                        <i class="bi bi-plus-circle me-2"></i>
                        Nhập số liệu báo cáo kỳ
                    </button>
                </div>

                <div class="card custom-card mb-4">
                    <div class="card-header bg-white border-0 pb-0">
                        <h5 class="mb-1">Bộ lọc tìm kiếm</h5>
                        <small class="text-muted">Tra cứu nhanh dữ liệu theo dõi KPI</small>
                    </div>

                    <div class="card-body">
                        <div class="row g-3">
                            <div class="col-12 col-md-3">
                                <label class="form-label">Kỳ báo cáo KPI</label>
                                <select v-model.number="filters.kyBaoCaoKPIId" class="form-select">
                                    <option :value="null">Tất cả</option>
                                    <option v-for="item in kyBaoCaoOptions" :key="getId(item)" :value="getId(item)">
                                        {{ getKyBaoCaoDisplay(item) }}
                                    </option>
                                </select>
                            </div>

                            <div class="col-12 col-md-3">
                                <label class="form-label">Đơn vị thực hiện</label>
                                <select v-model.number="filters.donViNhanId" class="form-select">
                                    <option :value="null">Tất cả</option>
                                    <option v-for="item in donViNhanFilterOptions" :key="item.id" :value="item.id">
                                        {{ item.ten }}
                                    </option>
                                </select>
                            </div>

                            <div class="col-12 col-md-3">
                                <label class="form-label">Tên chỉ tiêu</label>
                                <select v-model.number="filters.chiTietGiaoChiTieuId" class="form-select">
                                    <option :value="null">Tất cả</option>
                                    <option v-for="item in filteredChiTietGiaoFilterOptions" :key="getId(item)"
                                        :value="getId(item)">
                                        {{ getChiTietDisplayWithoutDonVi(item) }}
                                    </option>
                                </select>
                            </div>

                            <div class="col-12 col-md-3">
                                <label class="form-label">Trạng thái</label>
                                <select v-model="filters.trangThai" class="form-select">
                                    <option value="">Tất cả</option>
                                    <option value="MOI_TAO">Mới tạo</option>
                                    <option value="CHO_DUYET">Chờ duyệt</option>
                                    <option value="DA_DUYET">Đã duyệt</option>
                                    <option value="TU_CHOI">Từ chối</option>
                                </select>
                            </div>

                            <div class="col-12">
                                <label class="form-label">Từ khóa</label>
                                <input v-model="filters.keyword" type="text" class="form-control"
                                    placeholder="Mã chỉ tiêu, nhận xét..." />
                            </div>
                        </div>

                        <div class="d-flex flex-wrap gap-2 mt-4">
                            <button class="btn btn-primary" @click="fetchItems">
                                <i class="bi bi-arrow-repeat me-1"></i>
                                Tải lại dữ liệu
                            </button>
                            <button class="btn btn-outline-secondary" @click="resetFilters">
                                <i class="bi bi-arrow-clockwise me-1"></i>
                                Đặt lại
                            </button>
                        </div>
                    </div>
                </div>

                <div class="card custom-card">
                    <div class="card-header bg-white d-flex justify-content-between align-items-center border-0">
                        <div>
                            <h5 class="mb-1">Danh sách theo dõi KPI</h5>
                            <small class="text-muted">Theo dõi số liệu thực hiện theo kỳ báo cáo</small>
                        </div>
                        <span class="badge text-bg-light border">Tổng: {{ filteredItems.length }}</span>
                    </div>

                    <div class="card-body p-0">
                        <div v-if="loading" class="empty-state">
                            <div class="spinner-border text-primary mb-3" role="status"></div>
                            <div>Đang tải dữ liệu...</div>
                        </div>

                        <div v-else-if="!filteredItems.length" class="empty-state">
                            <i class="bi bi-inbox fs-1 text-muted mb-2"></i>
                            <div>Chưa có dữ liệu</div>
                        </div>

                        <div v-else class="table-responsive">
                            <table class="table table-hover align-middle mb-0 custom-table">
                                <thead>
                                    <tr>
                                        <th>Kỳ báo cáo</th>
                                        <th>Chỉ tiêu giao</th>
                                        <th>Đầu kỳ</th>
                                        <th>Thực hiện trong kỳ</th>
                                        <th>Cuối kỳ</th>
                                        <th>Lũy kế</th>
                                        <th>Trạng thái</th>
                                        <th>Nhận xét</th>
                                        <th class="text-center" style="width: 180px">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="item in filteredItems" :key="getId(item)">
                                        <td>
                                            <div class="fw-semibold">
                                                {{ item.TenKyHienThi }}
                                            </div>
                                            <small class="text-muted">
                                                {{ item.MaKy || item.maKy || '-' }}
                                            </small>
                                        </td>
                                        <td>
                                            <div class="fw-semibold text-primary">
                                                {{ item.TenChiTieu || item.tenChiTieu || '-' }}
                                            </div>
                                            <small class="text-muted">
                                                {{ item.MaChiTieu || item.maChiTieu || '' }}
                                                <span v-if="item.TenDonViNhan || item.tenDonViNhan">
                                                    - {{ item.TenDonViNhan || item.tenDonViNhan }}
                                                </span>
                                            </small>
                                        </td>
                                        <td>{{ formatNumber(item.GiaTriDauKy ?? item.giaTriDauKy) }}</td>
                                        <td>{{ formatNumber(item.GiaTriThucHienTrongKy ?? item.giaTriThucHienTrongKy) }}
                                        </td>
                                        <td>{{ formatNumber(item.GiaTriCuoiKy ?? item.giaTriCuoiKy) }}</td>
                                        <td>{{ formatNumber(item.GiaTriLuyKe ?? item.giaTriLuyKe) }}</td>
                                        <td>
                                            <span class="badge rounded-pill"
                                                :class="getTrangThaiClass(item.TrangThai || item.trangThai)">
                                                {{ mapTrangThai(item.TrangThai || item.trangThai) }}
                                            </span>
                                        </td>
                                        <td>{{ item.NhanXet || item.nhanXet || '-' }}</td>
                                        <td class="text-center">
                                            <div class="d-flex justify-content-center gap-2">
                                                <button class="btn btn-sm btn-outline-primary"
                                                    @click="openEditModal(item)">
                                                    <i class="bi bi-pencil-square me-1"></i>Sửa
                                                </button>
                                                <button class="btn btn-sm btn-outline-danger"
                                                    @click="handleDelete(item)">
                                                    <i class="bi bi-trash me-1"></i>Xóa
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div v-if="showModal" class="modal fade show d-block custom-modal" tabindex="-1"
                    @click.self="closeModal">
                    <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                        <div class="modal-content border-0 shadow-lg rounded-4">
                            <div class="modal-header border-0 pb-0">
                                <div>
                                    <h4 class="modal-title mb-1">
                                        {{ isEdit ? 'Cập nhật theo dõi KPI' : 'Thêm theo dõi KPI' }}
                                    </h4>
                                    <p class="text-muted mb-0">
                                        Chọn đơn vị, chỉ tiêu được giao, rồi nhập số liệu theo kỳ báo cáo
                                    </p>
                                </div>
                                <button type="button" class="btn-close" @click="closeModal"></button>
                            </div>

                            <div class="modal-body pt-3">
                                <div class="row g-3">
                                    <div class="col-12">
                                        <div class="alert alert-info mb-0">
                                            <i class="bi bi-info-circle me-2"></i>
                                            Chỉ được chọn kỳ báo cáo đang mở và phù hợp với tần suất của chỉ tiêu giao.
                                            Giá trị đầu kỳ chỉ nhập ở kỳ đầu tiên, các kỳ sau tự lấy từ cuối kỳ trước.
                                        </div>
                                    </div>

                                    <div class="col-12 col-md-4">
                                        <label class="form-label">
                                            Đơn vị thực hiện <span class="text-danger">*</span>
                                        </label>
                                        <select v-model.number="form.donViNhanId" class="form-select">
                                            <option :value="null">Chọn đơn vị thực hiện</option>
                                            <option v-for="item in donViNhanFilterOptions" :key="item.id"
                                                :value="item.id">
                                                {{ item.ten }}
                                            </option>
                                        </select>
                                    </div>

                                    <div class="col-12 col-md-4">
                                        <label class="form-label">
                                            Chỉ tiêu giao <span class="text-danger">*</span>
                                        </label>
                                        <select v-model.number="form.chiTietGiaoChiTieuId" class="form-select">
                                            <option :value="null">Chọn chỉ tiêu giao</option>
                                            <option v-for="item in filteredChiTietGiaoModalOptions" :key="getId(item)"
                                                :value="getId(item)">
                                                {{ getChiTietDisplayWithoutDonVi(item) }}
                                            </option>
                                        </select>
                                        <small class="text-muted" v-if="selectedChiTietGiao">
                                            Tần suất báo cáo:
                                            {{ mapTanSuat(getTanSuatBaoCao(selectedChiTietGiao)) }}
                                        </small>
                                    </div>

                                    <div class="col-12 col-md-4">
                                        <label class="form-label">
                                            Kỳ báo cáo KPI <span class="text-danger">*</span>
                                        </label>
                                        <select v-model.number="form.kyBaoCaoKPIId" class="form-select">
                                            <option :value="null">Chọn kỳ báo cáo</option>
                                            <option v-for="item in filteredKyBaoCaoOptions" :key="getId(item)"
                                                :value="getId(item)">
                                                {{ getKyBaoCaoDisplay(item) }}
                                            </option>
                                        </select>
                                        <small class="text-muted" v-if="selectedChiTietGiao">
                                            Chỉ hiển thị các kỳ đang mở và phù hợp với tần suất báo cáo của chỉ tiêu
                                            giao.
                                        </small>
                                    </div>

                                    <div class="col-12 col-md-4">
                                        <label class="form-label">
                                            Giá trị đầu kỳ <span class="text-danger" v-if="isKyDauTien">*</span>
                                        </label>
                                        <input v-model.number="form.giaTriDauKy" type="number" step="0.01" min="0"
                                            class="form-control" :readonly="!isKyDauTien" :disabled="!isKyDauTien"
                                            :placeholder="isKyDauTien ? 'Nhập giá trị đầu kỳ' : 'Tự động lấy từ kỳ trước'" />
                                        <small class="text-muted" v-if="!isKyDauTien">
                                            Giá trị đầu kỳ được tự động lấy từ cuối kỳ trước.
                                        </small>
                                    </div>

                                    <div class="col-12 col-md-4">
                                        <label class="form-label">
                                            Giá trị thực hiện trong kỳ <span class="text-danger">*</span>
                                        </label>
                                        <input v-model.number="form.giaTriThucHienTrongKy" type="number" step="0.01"
                                            min="0" class="form-control"
                                            placeholder="Nhập giá trị thực hiện trong kỳ" />
                                    </div>

                                    <div class="col-12 col-md-4">
                                        <label class="form-label">Giá trị cuối kỳ</label>
                                        <input :value="formatEditableNumber(giaTriCuoiKyPreview)" type="text"
                                            class="form-control" readonly />
                                    </div>

                                    <div class="col-12">
                                        <label class="form-label">Nhận xét</label>
                                        <textarea v-model="form.nhanXet" rows="4" class="form-control"
                                            placeholder="Nhập nhận xét, giải trình..."></textarea>
                                    </div>
                                </div>
                            </div>

                            <div class="modal-footer border-0 pt-0">
                                <button class="btn btn-light" @click="closeModal">Hủy</button>
                                <button class="btn btn-primary" :disabled="saving" @click="handleSubmit">
                                    <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                                    {{ saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Lưu theo dõi KPI' }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="showModal" class="modal-backdrop fade show"></div>
            </div>
        </div>
    </BaseLayout>
</template>

<script setup>
    import { computed, onMounted, reactive, ref, watch } from 'vue'
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
    const saving = ref(false)
    const showModal = ref(false)
    const isEdit = ref(false)
    const editingId = ref(null)

    const items = ref([])
    const chiTietGiaoChiTieuOptions = ref([])
    const kyBaoCaoOptions = ref([])
    const danhMucChiTieuOptions = ref([])
    const donViOptions = ref([])

    const filters = reactive({
        kyBaoCaoKPIId: null,
        donViNhanId: null,
        chiTietGiaoChiTieuId: null,
        trangThai: '',
        keyword: ''
    })

    const createDefaultForm = () => ({
        donViNhanId: null,
        chiTietGiaoChiTieuId: null,
        kyBaoCaoKPIId: null,
        giaTriDauKy: 0,
        giaTriThucHienTrongKy: 0,
        nhanXet: ''
    })

    const form = reactive(createDefaultForm())

    const resetForm = () => {
        Object.assign(form, createDefaultForm())
    }

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

    const getTanSuatBaoCao = (item) => {
        return item?.TanSuatBaoCao || item?.tanSuatBaoCao || ''
    }

    const getLoaiKy = (item) => {
        return item?.LoaiKy || item?.loaiKy || item?.LoaiKyBaoCao || item?.loaiKyBaoCao || ''
    }

    const getThuTuKy = (item) => {
        return Number(item?.ThuTuKy ?? item?.thuTuKy ?? item?.ThuTu ?? item?.thuTu ?? 0)
    }

    const getTrangThaiKy = (item) => {
        return item?.TrangThai || item?.trangThai || item?.TrangThaiKy || item?.trangThaiKy || ''
    }

    const getDanhMucChiTieuId = (item) => {
        return Number(item?.DanhMucChiTieuId ?? item?.danhMucChiTieuId ?? 0)
    }

    const getDonViNhanId = (item) => {
        return Number(item?.DonViNhanId ?? item?.donViNhanId ?? 0)
    }

    const findDanhMucById = (id) => {
        return danhMucChiTieuOptions.value.find((x) => getId(x) === Number(id)) || null
    }

    const findDonViById = (id) => {
        return donViOptions.value.find((x) => getId(x) === Number(id)) || null
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

    const mapTrangThai = (value) => {
        const map = {
            MOI_TAO: 'Mới tạo',
            CHO_DUYET: 'Chờ duyệt',
            DA_DUYET: 'Đã duyệt',
            TU_CHOI: 'Từ chối'
        }
        return map[value] || value || '-'
    }

    const getTrangThaiClass = (value) => {
        const map = {
            MOI_TAO: 'text-bg-secondary',
            CHO_DUYET: 'text-bg-warning',
            DA_DUYET: 'text-bg-success',
            TU_CHOI: 'text-bg-danger'
        }
        return map[value] || 'text-bg-light'
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

    const enrichedChiTietGiaoChiTieuOptions = computed(() => {
        return chiTietGiaoChiTieuOptions.value.map((item) => {
            const danhMuc = findDanhMucById(getDanhMucChiTieuId(item))
            const donVi = findDonViById(getDonViNhanId(item))

            return {
                ...item,
                MaChiTieuHienThi:
                    item.MaChiTieu ||
                    item.maChiTieu ||
                    danhMuc?.MaChiTieu ||
                    danhMuc?.maChiTieu ||
                    '',
                TenChiTieuHienThi:
                    item.TenChiTieu ||
                    item.tenChiTieu ||
                    danhMuc?.TenChiTieu ||
                    danhMuc?.tenChiTieu ||
                    '',
                TenDonViNhanHienThi:
                    item.TenDonViNhan ||
                    item.tenDonViNhan ||
                    donVi?.TenDonVi ||
                    donVi?.tenDonVi ||
                    ''
            }
        })
    })

    const donViNhanFilterOptions = computed(() => {
        const map = new Map()

        enrichedChiTietGiaoChiTieuOptions.value.forEach((item) => {
            const id = getDonViNhanId(item)
            const ten = item.TenDonViNhanHienThi

            if (id > 0 && ten && !map.has(id)) {
                map.set(id, { id, ten })
            }
        })

        return Array.from(map.values()).sort((a, b) => a.ten.localeCompare(b.ten, 'vi'))
    })

    const filteredChiTietGiaoFilterOptions = computed(() => {
        const donViId = Number(filters.donViNhanId || 0)
        if (!donViId) return []

        return enrichedChiTietGiaoChiTieuOptions.value.filter(
            (item) => getDonViNhanId(item) === donViId
        )
    })

    const filteredChiTietGiaoModalOptions = computed(() => {
        const donViId = Number(form.donViNhanId || 0)
        if (!donViId) return []

        return enrichedChiTietGiaoChiTieuOptions.value.filter(
            (item) => getDonViNhanId(item) === donViId
        )
    })

    const getChiTietDisplayWithoutDonVi = (item) => {
        const ma = item?.MaChiTieuHienThi || ''
        const ten = item?.TenChiTieuHienThi || ''
        return [ma, ten].filter(Boolean).join(' - ') || '-'
    }

    const selectedChiTietGiao = computed(() => {
        return (
            enrichedChiTietGiaoChiTieuOptions.value.find(
                (x) => getId(x) === Number(form.chiTietGiaoChiTieuId ?? 0)
            ) || null
        )
    })

    const selectedKyBaoCao = computed(() => {
        return (
            kyBaoCaoOptions.value.find(
                (x) => getId(x) === Number(form.kyBaoCaoKPIId ?? 0)
            ) || null
        )
    })

    const filteredKyBaoCaoOptions = computed(() => {
        const tanSuat = getTanSuatBaoCao(selectedChiTietGiao.value)

        return kyBaoCaoOptions.value.filter(
            (item) => isKyDangMo(item) && isKyPhuHopTanSuat(item, tanSuat)
        )
    })

    const isKyDauTien = computed(() => {
        const ky = selectedKyBaoCao.value
        if (!ky) return true
        return getThuTuKy(ky) <= 1
    })

    const giaTriCuoiKyPreview = computed(() => {
        const dauKy = Number(form.giaTriDauKy ?? 0)
        const thucHien = Number(form.giaTriThucHienTrongKy ?? 0)
        return dauKy + thucHien
    })

    const enrichedItems = computed(() => {
        return items.value.map((item) => {
            const chiTietId = Number(item.ChiTietGiaoChiTieuId ?? item.chiTietGiaoChiTieuId ?? 0)
            const kyId = Number(item.KyBaoCaoKPIId ?? item.kyBaoCaoKPIId ?? 0)

            const chiTiet = enrichedChiTietGiaoChiTieuOptions.value.find((x) => getId(x) === chiTietId)
            const kyBaoCao = kyBaoCaoOptions.value.find((x) => getId(x) === kyId)

            return {
                ...item,
                DonViNhanId: getDonViNhanId(chiTiet),
                MaChiTieu: item.MaChiTieu || item.maChiTieu || chiTiet?.MaChiTieuHienThi || '-',
                TenChiTieu: item.TenChiTieu || item.tenChiTieu || chiTiet?.TenChiTieuHienThi || '-',
                TenDonViNhan: item.TenDonViNhan || item.tenDonViNhan || chiTiet?.TenDonViNhanHienThi || '-',
                TenKyHienThi:
                    getKyBaoCaoDisplay(item) !== '-'
                        ? getKyBaoCaoDisplay(item)
                        : getKyBaoCaoDisplay(kyBaoCao),
                MaKy:
                    item.MaKy ||
                    item.maKy ||
                    kyBaoCao?.MaKy ||
                    kyBaoCao?.maKy ||
                    '-'
            }
        })
    })

    const previousTheoDoiRecord = computed(() => {
        const chiTietId = Number(form.chiTietGiaoChiTieuId ?? 0)
        const currentKy = selectedKyBaoCao.value

        if (!chiTietId || !currentKy) return null

        const currentThuTuKy = getThuTuKy(currentKy)
        if (currentThuTuKy <= 1) return null

        const candidates = enrichedItems.value.filter((item) => {
            const itemChiTietId = Number(item.ChiTietGiaoChiTieuId ?? item.chiTietGiaoChiTieuId ?? 0)
            const itemKyId = Number(item.KyBaoCaoKPIId ?? item.kyBaoCaoKPIId ?? 0)
            const kyItem = kyBaoCaoOptions.value.find((x) => getId(x) === itemKyId)
            const thuTuKy = getThuTuKy(kyItem)

            return itemChiTietId === chiTietId && thuTuKy === currentThuTuKy - 1
        })

        return candidates[0] || null
    })

    const filteredItems = computed(() => {
        return enrichedItems.value.filter((item) => {
            const keyword = filters.keyword.trim().toLowerCase()
            const kyId = Number(item.KyBaoCaoKPIId ?? item.kyBaoCaoKPIId ?? 0)
            const donViNhanId = Number(item.DonViNhanId ?? item.donViNhanId ?? 0)
            const chiTietId = Number(item.ChiTietGiaoChiTieuId ?? item.chiTietGiaoChiTieuId ?? 0)
            const trangThai = item.TrangThai || item.trangThai || ''

            const searchText = [
                item.MaKy || '',
                item.MaChiTieu || '',
                item.NhanXet || item.nhanXet || ''
            ]
                .join(' ')
                .toLowerCase()

            const matchKeyword = !keyword || searchText.includes(keyword)
            const matchKy = !filters.kyBaoCaoKPIId || Number(filters.kyBaoCaoKPIId) === kyId
            const matchDonViNhan = !filters.donViNhanId || Number(filters.donViNhanId) === donViNhanId
            const matchChiTiet =
                !filters.chiTietGiaoChiTieuId || Number(filters.chiTietGiaoChiTieuId) === chiTietId
            const matchTrangThai = !filters.trangThai || filters.trangThai === trangThai

            return matchKeyword && matchKy && matchDonViNhan && matchChiTiet && matchTrangThai
        })
    })

    const buildPayload = () => ({
        chiTietGiaoChiTieuId: form.chiTietGiaoChiTieuId,
        kyBaoCaoKPIId: form.kyBaoCaoKPIId,
        giaTriDauKy: Number(form.giaTriDauKy ?? 0),
        giaTriThucHienTrongKy: Number(form.giaTriThucHienTrongKy ?? 0),
        nhanXet: form.nhanXet?.trim() || ''
    })

    const fetchItems = async () => {
        try {
            loading.value = true
            const response = await api.get(API_PATHS.theoDoiThucHienKPI)
            items.value = normalizeList(response)
        } catch (error) {
            console.error('fetchItems error:', error?.response?.status, error?.config?.url, error)
            alert(error?.response?.data?.message || 'Không tải được danh sách theo dõi KPI.')
        } finally {
            loading.value = false
        }
    }

    const fetchChiTietGiaoChiTieuOptions = async () => {
        try {
            const response = await api.get(API_PATHS.chiTietGiaoChiTieu)
            chiTietGiaoChiTieuOptions.value = normalizeList(response)
        } catch (error) {
            console.error('fetchChiTietGiaoChiTieuOptions error:', error?.response?.status, error?.config?.url, error)
            chiTietGiaoChiTieuOptions.value = []
        }
    }

    const fetchKyBaoCaoOptions = async () => {
        try {
            const response = await api.get(API_PATHS.kyBaoCaoKPI)
            kyBaoCaoOptions.value = normalizeList(response)
        } catch (error) {
            console.error('fetchKyBaoCaoOptions error:', error?.response?.status, error?.config?.url, error)
            kyBaoCaoOptions.value = []
        }
    }

    const fetchDanhMucChiTieuOptions = async () => {
        try {
            const response = await api.get(API_PATHS.danhMucChiTieu)
            danhMucChiTieuOptions.value = normalizeList(response)
        } catch (error) {
            console.error('fetchDanhMucChiTieuOptions error:', error?.response?.status, error?.config?.url, error)
            danhMucChiTieuOptions.value = []
        }
    }

    const fetchDonViOptions = async () => {
        try {
            const response = await api.get(API_PATHS.donVi)
            donViOptions.value = normalizeList(response)
        } catch (error) {
            console.error('fetchDonViOptions error:', error?.response?.status, error?.config?.url, error)
            donViOptions.value = []
        }
    }

    const openCreateModal = () => {
        isEdit.value = false
        editingId.value = null
        resetForm()
        showModal.value = true
    }

    const openEditModal = (item) => {
        isEdit.value = true
        editingId.value = getId(item)

        const chiTietId = Number(item.ChiTietGiaoChiTieuId ?? item.chiTietGiaoChiTieuId ?? 0)
        const chiTiet = enrichedChiTietGiaoChiTieuOptions.value.find((x) => getId(x) === chiTietId)

        Object.assign(form, {
            donViNhanId: getDonViNhanId(chiTiet) || null,
            chiTietGiaoChiTieuId: chiTietId || null,
            kyBaoCaoKPIId: item.KyBaoCaoKPIId ?? item.kyBaoCaoKPIId ?? null,
            giaTriDauKy: item.GiaTriDauKy ?? item.giaTriDauKy ?? 0,
            giaTriThucHienTrongKy: item.GiaTriThucHienTrongKy ?? item.giaTriThucHienTrongKy ?? 0,
            nhanXet: item.NhanXet || item.nhanXet || ''
        })

        showModal.value = true
    }

    const closeModal = () => {
        showModal.value = false
        resetForm()
    }

    const validateForm = () => {
        if (!form.donViNhanId || Number(form.donViNhanId) <= 0) {
            alert('Vui lòng chọn đơn vị thực hiện.')
            return false
        }

        if (!form.chiTietGiaoChiTieuId || Number(form.chiTietGiaoChiTieuId) <= 0) {
            alert('Vui lòng chọn chỉ tiêu giao.')
            return false
        }

        const chiTietDangChon = selectedChiTietGiao.value
        if (!chiTietDangChon || getDonViNhanId(chiTietDangChon) !== Number(form.donViNhanId)) {
            alert('Chỉ tiêu giao không thuộc đơn vị thực hiện đã chọn.')
            return false
        }

        if (!form.kyBaoCaoKPIId || Number(form.kyBaoCaoKPIId) <= 0) {
            alert('Vui lòng chọn kỳ báo cáo KPI.')
            return false
        }

        const kyDangChon = selectedKyBaoCao.value
        const tanSuat = getTanSuatBaoCao(selectedChiTietGiao.value)

        if (!isKyDangMo(kyDangChon)) {
            alert('Chỉ được chọn kỳ báo cáo đang mở.')
            return false
        }

        if (!isKyPhuHopTanSuat(kyDangChon, tanSuat)) {
            alert('Kỳ báo cáo không phù hợp với tần suất báo cáo của chỉ tiêu giao.')
            return false
        }

        if (isKyDauTien.value) {
            if (Number(form.giaTriDauKy) < 0) {
                alert('Giá trị đầu kỳ không hợp lệ.')
                return false
            }
        } else {
            if (!previousTheoDoiRecord.value) {
                alert('Chưa có dữ liệu kỳ trước để xác định giá trị đầu kỳ.')
                return false
            }
        }

        if (Number(form.giaTriThucHienTrongKy) < 0) {
            alert('Giá trị thực hiện trong kỳ không hợp lệ.')
            return false
        }

        return true
    }

    const handleSubmit = async () => {
        if (!validateForm()) return

        try {
            saving.value = true
            const payload = buildPayload()

            if (isEdit.value && editingId.value) {
                await api.put(`${API_PATHS.theoDoiThucHienKPI}/${editingId.value}`, payload)
            } else {
                await api.post(API_PATHS.theoDoiThucHienKPI, payload)
            }

            closeModal()
            await fetchItems()
        } catch (error) {
            console.error('handleSubmit error:', error?.response?.status, error?.config?.url, error)

            const message =
                error?.response?.data?.message ||
                error?.response?.data?.title ||
                JSON.stringify(error?.response?.data?.errors || {}, null, 2) ||
                'Lưu theo dõi KPI thất bại.'

            alert(message)
        } finally {
            saving.value = false
        }
    }

    const handleDelete = async (item) => {
        const ok = window.confirm('Bạn có chắc muốn xóa bản ghi theo dõi KPI này không?')
        if (!ok) return

        try {
            await api.delete(`${API_PATHS.theoDoiThucHienKPI}/${getId(item)}`)
            await fetchItems()
        } catch (error) {
            console.error('handleDelete error:', error?.response?.status, error?.config?.url, error)
            alert(error?.response?.data?.message || 'Xóa theo dõi KPI thất bại.')
        }
    }

    const resetFilters = () => {
        filters.kyBaoCaoKPIId = null
        filters.donViNhanId = null
        filters.chiTietGiaoChiTieuId = null
        filters.trangThai = ''
        filters.keyword = ''
    }

    const formatNumber = (value) => {
        if (value === null || value === undefined || value === '') return '-'
        return Number(value).toLocaleString('vi-VN')
    }

    const formatEditableNumber = (value) => {
        if (value === null || value === undefined || Number.isNaN(Number(value))) return ''
        return String(value)
    }

    watch(
        () => filters.donViNhanId,
        () => {
            if (
                filters.chiTietGiaoChiTieuId &&
                !filteredChiTietGiaoFilterOptions.value.some(
                    (x) => getId(x) === Number(filters.chiTietGiaoChiTieuId)
                )
            ) {
                filters.chiTietGiaoChiTieuId = null
            }
        }
    )

    watch(
        () => form.donViNhanId,
        () => {
            if (
                form.chiTietGiaoChiTieuId &&
                !filteredChiTietGiaoModalOptions.value.some(
                    (x) => getId(x) === Number(form.chiTietGiaoChiTieuId)
                )
            ) {
                form.chiTietGiaoChiTieuId = null
            }
        }
    )

    watch(
        () => form.chiTietGiaoChiTieuId,
        () => {
            const selected = selectedChiTietGiao.value

            if (selected) {
                const donViNhanId = getDonViNhanId(selected)
                if (donViNhanId > 0) {
                    form.donViNhanId = donViNhanId
                }
            }

            const kyDangChon = selectedKyBaoCao.value
            const tanSuat = getTanSuatBaoCao(selectedChiTietGiao.value)

            if (
                form.kyBaoCaoKPIId &&
                (!isKyDangMo(kyDangChon) || !isKyPhuHopTanSuat(kyDangChon, tanSuat))
            ) {
                form.kyBaoCaoKPIId = null
            }
        }
    )

    watch(
        () => [form.chiTietGiaoChiTieuId, form.kyBaoCaoKPIId],
        () => {
            if (!form.kyBaoCaoKPIId) return

            if (isKyDauTien.value) {
                return
            }

            const giaTriCuoiKyTruoc =
                previousTheoDoiRecord.value?.GiaTriCuoiKy ??
                previousTheoDoiRecord.value?.giaTriCuoiKy ??
                previousTheoDoiRecord.value?.GiaTriLuyKe ??
                previousTheoDoiRecord.value?.giaTriLuyKe ??
                0

            form.giaTriDauKy = Number(giaTriCuoiKyTruoc ?? 0)
        },
        { immediate: true }
    )

    onMounted(async () => {
        await Promise.all([
            fetchItems(),
            fetchChiTietGiaoChiTieuOptions(),
            fetchKyBaoCaoOptions(),
            fetchDanhMucChiTieuOptions(),
            fetchDonViOptions()
        ])
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

    .custom-modal {
        background: rgba(15, 23, 42, 0.35);
    }

    .modal-content {
        border-radius: 24px;
    }

    textarea.form-control {
        min-height: 100px;
        resize: vertical;
    }
</style>