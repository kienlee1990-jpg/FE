<template>
    <BaseLayout>
        <div class="page-wrap">
            <div class="container-fluid py-4">
                <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
                    <div>
                        <h1 class="page-title mb-1">Đợt giao chỉ tiêu</h1>
                        <p class="page-subtitle mb-0">
                            Quản lý các đợt giao chỉ tiêu trong hệ thống
                        </p>
                    </div>

                    <button class="btn btn-primary btn-action" @click="openCreateModal">
                        <i class="bi bi-plus-circle me-2"></i>
                        Tạo đợt giao
                    </button>
                </div>

                <div class="card custom-card mb-4">
                    <div class="card-header bg-white border-0 pb-0">
                        <h5 class="mb-1">Bộ lọc tìm kiếm</h5>
                        <small class="text-muted">Tra cứu nhanh theo nhiều tiêu chí</small>
                    </div>

                    <div class="card-body">
                        <div class="row g-3">
                            <div class="col-12 col-md-6 col-xl-3">
                                <label class="form-label">Từ khóa</label>
                                <input v-model="filters.keyword" type="text" class="form-control"
                                    placeholder="Mã hoặc tên đợt giao" />
                            </div>

                            <div class="col-12 col-md-6 col-xl-2">
                                <label class="form-label">Năm áp dụng</label>
                                <input v-model="filters.namApDung" type="number" class="form-control"
                                    placeholder="Ví dụ: 2026" />
                            </div>

                            <div class="col-12 col-md-6 col-xl-2">
                                <label class="form-label">Nguồn đợt giao</label>
                                <select v-model="filters.nguonDotGiao" class="form-select">
                                    <option value="">Tất cả</option>
                                    <option value="BO_GIAO">Bộ giao</option>
                                    <option value="THANH_PHO_GIAO">Thành phố giao</option>
                                </select>
                            </div>

                            <div class="col-12 col-md-6 col-xl-2">
                                <label class="form-label">Cấp giao</label>
                                <select v-model="filters.capGiao" class="form-select">
                                    <option value="">Tất cả</option>
                                    <option value="BO">Bộ</option>
                                    <option value="THANH_PHO">Thành phố</option>
                                </select>
                            </div>

                            <div class="col-12 col-md-6 col-xl-3">
                                <label class="form-label">Trạng thái</label>
                                <select v-model="filters.trangThai" class="form-select">
                                    <option value="">Tất cả</option>
                                    <option value="DRAFT">Nháp</option>
                                    <option value="MOI_TAO">Mới tạo</option>
                                    <option value="DANG_MO">Đang mở</option>
                                    <option value="DA_KHOA">Đã khóa</option>
                                    <option value="HOAN_TAT">Hoàn tất</option>
                                </select>
                            </div>
                        </div>

                        <div class="d-flex flex-wrap gap-2 mt-4">
                            <button class="btn btn-primary" @click="fetchDotGiaoChiTieu">
                                <i class="bi bi-search me-1"></i>
                                Tìm kiếm
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
                            <h5 class="mb-1">Danh sách đợt giao chỉ tiêu</h5>
                            <small class="text-muted">Theo dõi và quản lý dữ liệu đợt giao</small>
                        </div>
                        <span class="badge text-bg-light border">Tổng: {{ items.length }}</span>
                    </div>

                    <div class="card-body p-0">
                        <div v-if="loading" class="empty-state">
                            <div class="spinner-border text-primary mb-3" role="status"></div>
                            <div>Đang tải dữ liệu...</div>
                        </div>

                        <div v-else-if="!items.length" class="empty-state">
                            <i class="bi bi-inbox fs-1 text-muted mb-2"></i>
                            <div>Chưa có dữ liệu</div>
                        </div>

                        <div v-else class="table-responsive">
                            <table class="table table-hover align-middle mb-0 custom-table">
                                <thead>
                                    <tr>
                                        <th>Mã đợt</th>
                                        <th>Tên đợt giao</th>
                                        <th>Năm áp dụng</th>
                                        <th>Nguồn đợt giao</th>
                                        <th>Cấp giao</th>
                                        <th>Đơn vị giao ID</th>
                                        <th>Ngày giao</th>
                                        <th>Trạng thái</th>
                                        <th>Ghi chú</th>
                                        <th class="text-center" style="width: 180px">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="item in items" :key="item.id">
                                        <td class="fw-semibold text-primary">{{ item.maDotGiao }}</td>
                                        <td>{{ item.tenDotGiao }}</td>
                                        <td>{{ item.namApDung ?? '-' }}</td>
                                        <td>{{ mapNguonDotGiao(item.nguonDotGiao) }}</td>
                                        <td>{{ mapCapGiao(item.capGiao) }}</td>
                                        <td>{{ item.donViGiaoId ?? '-' }}</td>
                                        <td>{{ formatDateTime(item.ngayGiao) }}</td>
                                        <td>
                                            <span class="badge rounded-pill" :class="getTrangThaiClass(item.trangThai)">
                                                {{ mapTrangThai(item.trangThai) }}
                                            </span>
                                        </td>
                                        <td>{{ item.ghiChu || '-' }}</td>
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
                    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                        <div class="modal-content border-0 shadow-lg rounded-4">
                            <div class="modal-header border-0 pb-0">
                                <div>
                                    <h4 class="modal-title mb-1">
                                        {{ isEdit ? 'Cập nhật đợt giao chỉ tiêu' : 'Tạo đợt giao chỉ tiêu mới' }}
                                    </h4>
                                    <p class="text-muted mb-0">Nhập thông tin đợt giao chỉ tiêu</p>
                                </div>
                                <button type="button" class="btn-close" @click="closeModal"></button>
                            </div>

                            <div class="modal-body pt-3">
                                <div class="row g-3">
                                    <div class="col-12 col-md-6">
                                        <label class="form-label">
                                            Mã đợt giao <span class="text-danger">*</span>
                                        </label>
                                        <input v-model="form.maDotGiao" :disabled="isEdit" type="text"
                                            class="form-control" />
                                    </div>

                                    <div class="col-12 col-md-6">
                                        <label class="form-label">
                                            Tên đợt giao <span class="text-danger">*</span>
                                        </label>
                                        <input v-model="form.tenDotGiao" type="text" class="form-control" />
                                    </div>

                                    <div class="col-12 col-md-6">
                                        <label class="form-label">
                                            Năm áp dụng <span class="text-danger">*</span>
                                        </label>
                                        <input v-model="form.namApDung" type="number" class="form-control" min="2000"
                                            max="2100" />
                                    </div>

                                    <div class="col-12 col-md-6">
                                        <label class="form-label">
                                            Ngày giao <span class="text-danger">*</span>
                                        </label>
                                        <input v-model="form.ngayGiao" type="datetime-local" class="form-control" />
                                    </div>

                                    <div class="col-12 col-md-6">
                                        <label class="form-label">
                                            Nguồn đợt giao <span class="text-danger">*</span>
                                        </label>
                                        <select v-model="form.nguonDotGiao" class="form-select">
                                            <option value="BO_GIAO">Bộ giao</option>
                                            <option value="THANH_PHO_GIAO">Thành phố giao</option>
                                        </select>
                                    </div>

                                    <div class="col-12 col-md-6">
                                        <label class="form-label">
                                            Cấp giao <span class="text-danger">*</span>
                                        </label>
                                        <select v-model="form.capGiao" class="form-select">
                                            <option value="BO">Bộ</option>
                                            <option value="THANH_PHO">Thành phố</option>
                                        </select>
                                    </div>

                                    <div class="col-12 col-md-6">
                                        <label class="form-label">
                                            Đơn vị giao ID <span class="text-danger">*</span>
                                        </label>
                                        <input v-model="form.donViGiaoId" type="number" min="1" class="form-control" />
                                    </div>

                                    <div class="col-12">
                                        <label class="form-label">Ghi chú</label>
                                        <textarea v-model="form.ghiChu" rows="4" class="form-control"></textarea>
                                    </div>
                                </div>
                            </div>

                            <div class="modal-footer border-0 pt-0">
                                <button class="btn btn-light" @click="closeModal">Hủy</button>
                                <button class="btn btn-primary" :disabled="saving" @click="handleSubmit">
                                    <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                                    {{ saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Lưu đợt giao' }}
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
    import { onMounted, reactive, ref, watch } from 'vue'
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

    const loading = ref(false)
    const saving = ref(false)
    const showModal = ref(false)
    const isEdit = ref(false)
    const editingId = ref(null)
    const items = ref([])

    const filters = reactive({
        keyword: '',
        namApDung: '',
        nguonDotGiao: '',
        capGiao: '',
        trangThai: ''
    })

    const createDefaultForm = () => ({
        maDotGiao: '',
        tenDotGiao: '',
        namApDung: new Date().getFullYear(),
        nguonDotGiao: 'BO_GIAO',
        capGiao: 'BO',
        donViGiaoId: '',
        ngayGiao: '',
        ghiChu: ''
    })

    const form = reactive(createDefaultForm())

    const resetForm = () => {
        Object.assign(form, createDefaultForm())
    }

    watch(
        () => form.nguonDotGiao,
        (value) => {
            if (value === 'BO_GIAO') {
                form.capGiao = 'BO'
            } else if (value === 'THANH_PHO_GIAO') {
                form.capGiao = 'THANH_PHO'
            }
        }
    )

    const buildPayload = () => {
        return {
            maDotGiao: form.maDotGiao?.trim(),
            tenDotGiao: form.tenDotGiao?.trim(),
            namApDung: Number(form.namApDung),
            nguonDotGiao: form.nguonDotGiao,
            capGiao: form.capGiao,
            donViGiaoId: Number(form.donViGiaoId),
            ngayGiao: form.ngayGiao ? new Date(form.ngayGiao).toISOString() : null,
            ghiChu: form.ghiChu?.trim() || null
        }
    }

    const normalizeResponseData = (response) => {
        if (Array.isArray(response?.data)) return response.data
        if (Array.isArray(response?.data?.data)) return response.data.data
        return []
    }

    const fetchDotGiaoChiTieu = async () => {
        try {
            loading.value = true
            const response = await api.get('/dot-giao-chi-tieu', {
                params: {
                    keyword: filters.keyword || undefined,
                    namApDung: filters.namApDung ? Number(filters.namApDung) : undefined,
                    nguonDotGiao: filters.nguonDotGiao || undefined,
                    capGiao: filters.capGiao || undefined,
                    trangThai: filters.trangThai || undefined
                }
            })
            items.value = normalizeResponseData(response)
        } catch (error) {
            console.error(error)
            alert(error?.response?.data?.message || 'Không tải được danh sách đợt giao chỉ tiêu.')
        } finally {
            loading.value = false
        }
    }

    const openCreateModal = () => {
        isEdit.value = false
        editingId.value = null
        resetForm()
        showModal.value = true
    }

    const toDateTimeLocal = (value) => {
        if (!value) return ''
        const date = new Date(value)
        if (Number.isNaN(date.getTime())) return ''
        const offset = date.getTimezoneOffset()
        const localDate = new Date(date.getTime() - offset * 60000)
        return localDate.toISOString().slice(0, 16)
    }

    const openEditModal = (item) => {
        isEdit.value = true
        editingId.value = item.id

        Object.assign(form, {
            maDotGiao: item.maDotGiao || '',
            tenDotGiao: item.tenDotGiao || '',
            namApDung: item.namApDung ?? new Date().getFullYear(),
            nguonDotGiao: item.nguonDotGiao || 'BO_GIAO',
            capGiao: item.capGiao || 'BO',
            donViGiaoId: item.donViGiaoId ?? '',
            ngayGiao: toDateTimeLocal(item.ngayGiao),
            ghiChu: item.ghiChu || ''
        })

        showModal.value = true
    }

    const closeModal = () => {
        showModal.value = false
        resetForm()
    }

    const validateForm = () => {
        if (!form.maDotGiao && !isEdit.value) {
            alert('Vui lòng nhập mã đợt giao.')
            return false
        }

        if (!form.tenDotGiao?.trim()) {
            alert('Vui lòng nhập tên đợt giao.')
            return false
        }

        const namApDung = Number(form.namApDung)
        if (!namApDung || namApDung < 2000 || namApDung > 2100) {
            alert('Năm áp dụng không hợp lệ.')
            return false
        }

        if (!['BO_GIAO', 'THANH_PHO_GIAO'].includes(form.nguonDotGiao)) {
            alert('Nguồn đợt giao không hợp lệ.')
            return false
        }

        if (!['BO', 'THANH_PHO'].includes(form.capGiao)) {
            alert('Cấp giao không hợp lệ.')
            return false
        }

        if (form.nguonDotGiao === 'BO_GIAO' && form.capGiao !== 'BO') {
            alert('Nguồn Bộ giao phải đi kèm cấp giao là BO.')
            return false
        }

        if (form.nguonDotGiao === 'THANH_PHO_GIAO' && form.capGiao !== 'THANH_PHO') {
            alert('Nguồn Thành phố giao phải đi kèm cấp giao là THANH_PHO.')
            return false
        }

        const donViGiaoId = Number(form.donViGiaoId)
        if (!donViGiaoId || donViGiaoId <= 0) {
            alert('Vui lòng nhập đơn vị giao ID hợp lệ.')
            return false
        }

        if (!form.ngayGiao) {
            alert('Vui lòng chọn ngày giao.')
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
                await api.put(`/dot-giao-chi-tieu/${editingId.value}`, payload)
            } else {
                await api.post('/dot-giao-chi-tieu', payload)
            }

            closeModal()
            await fetchDotGiaoChiTieu()
        } catch (error) {
            console.error(error)
            alert(error?.response?.data?.message || 'Lưu đợt giao chỉ tiêu thất bại.')
        } finally {
            saving.value = false
        }
    }

    const handleDelete = async (item) => {
        const ok = window.confirm(`Bạn có chắc muốn xóa đợt giao "${item.tenDotGiao}" không?`)
        if (!ok) return

        try {
            await api.delete(`/dot-giao-chi-tieu/${item.id}`)
            await fetchDotGiaoChiTieu()
        } catch (error) {
            console.error(error)
            alert(error?.response?.data?.message || 'Xóa đợt giao chỉ tiêu thất bại.')
        }
    }

    const resetFilters = async () => {
        filters.keyword = ''
        filters.namApDung = ''
        filters.nguonDotGiao = ''
        filters.capGiao = ''
        filters.trangThai = ''
        await fetchDotGiaoChiTieu()
    }

    const mapTrangThai = (value) => {
        const map = {
            DRAFT: 'Nháp',
            MOI_TAO: 'Mới tạo',
            DANG_MO: 'Đang mở',
            DA_KHOA: 'Đã khóa',
            HOAN_TAT: 'Hoàn tất'
        }
        return map[value] || value || '-'
    }

    const getTrangThaiClass = (value) => {
        const map = {
            DRAFT: 'text-bg-secondary',
            MOI_TAO: 'text-bg-secondary',
            DANG_MO: 'text-bg-primary',
            DA_KHOA: 'text-bg-warning',
            HOAN_TAT: 'text-bg-success'
        }
        return map[value] || 'text-bg-light'
    }

    const mapNguonDotGiao = (value) => {
        const map = {
            BO_GIAO: 'Bộ giao',
            THANH_PHO_GIAO: 'Thành phố giao'
        }
        return map[value] || value || '-'
    }

    const mapCapGiao = (value) => {
        const map = {
            BO: 'Bộ',
            THANH_PHO: 'Thành phố'
        }
        return map[value] || value || '-'
    }

    const formatDateTime = (value) => {
        if (!value) return '-'
        const date = new Date(value)
        if (Number.isNaN(date.getTime())) return '-'
        return date.toLocaleString('vi-VN')
    }

    onMounted(() => {
        fetchDotGiaoChiTieu()
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