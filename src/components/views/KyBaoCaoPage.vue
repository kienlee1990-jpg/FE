<template>
    <BaseLayout>
        <div class="page-wrap">
            <div class="container-fluid py-4">
                <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
                    <div>
                        <h1 class="page-title mb-1">Kỳ báo cáo KPI</h1>
                        <p class="page-subtitle mb-0">
                            Quản lý kỳ báo cáo phục vụ theo dõi, so sánh và đánh giá KPI
                        </p>
                    </div>

                    <button class="btn btn-primary btn-action" @click="openCreateModal">
                        <i class="bi bi-plus-circle me-2"></i>
                        Tạo kỳ báo cáo
                    </button>
                </div>

                <div class="card custom-card mb-4">
                    <div class="card-header bg-white border-0 pb-0">
                        <h5 class="mb-1">Bộ lọc tìm kiếm</h5>
                        <small class="text-muted">Lọc theo năm và loại kỳ</small>
                    </div>

                    <div class="card-body">
                        <div class="row g-3">
                            <div class="col-12 col-md-6 col-xl-3">
                                <label class="form-label">Loại kỳ</label>
                                <select v-model="filters.loaiKy" class="form-select">
                                    <option value="">Tất cả</option>
                                    <option value="THANG">Tháng</option>
                                    <option value="QUY">Quý</option>
                                    <option value="6THANG">6 tháng</option>
                                    <option value="NAM">Năm</option>
                                </select>
                            </div>

                            <div class="col-12 col-md-6 col-xl-3">
                                <label class="form-label">Năm</label>
                                <input v-model="filters.nam" type="number" class="form-control"
                                    placeholder="VD: 2026" />
                            </div>
                        </div>

                        <div class="d-flex flex-wrap gap-2 mt-4">
                            <button class="btn btn-primary" @click="fetchItems">
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
                            <h5 class="mb-1">Danh sách kỳ báo cáo</h5>
                            <small class="text-muted">Theo dõi các kỳ báo cáo KPI trong hệ thống</small>
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
                                        <th>Mã kỳ</th>
                                        <th>Tên kỳ</th>
                                        <th>Loại kỳ</th>
                                        <th>Năm</th>
                                        <th>Số kỳ</th>
                                        <th>Từ ngày</th>
                                        <th>Đến ngày</th>
                                        <th>Ngày đầu kỳ</th>
                                        <th>Ngày cuối kỳ</th>
                                        <th>Ghi chú</th>
                                        <th class="text-center" style="width: 180px">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="item in items" :key="item.id">
                                        <td class="fw-semibold text-primary">{{ item.maKy }}</td>
                                        <td>{{ item.tenKy }}</td>
                                        <td>{{ mapLoaiKy(item.loaiKy) }}</td>
                                        <td>{{ item.nam }}</td>
                                        <td>{{ item.soKy ?? '-' }}</td>
                                        <td>{{ formatDate(item.tuNgay) }}</td>
                                        <td>{{ formatDate(item.denNgay) }}</td>
                                        <td>{{ formatDate(item.ngayDauKy) }}</td>
                                        <td>{{ formatDate(item.ngayCuoiKy) }}</td>
                                        <td class="text-truncate" style="max-width: 220px">
                                            {{ item.ghiChu || '-' }}
                                        </td>
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
                                        {{ isEdit ? 'Cập nhật kỳ báo cáo KPI' : 'Tạo kỳ báo cáo KPI mới' }}
                                    </h4>
                                    <p class="text-muted mb-0">Nhập thông tin kỳ báo cáo</p>
                                </div>
                                <button type="button" class="btn-close" @click="closeModal"></button>
                            </div>

                            <div class="modal-body pt-3">
                                <div class="row g-3">
                                    <div class="col-12 col-md-4">
                                        <label class="form-label">
                                            Mã kỳ <span class="text-danger">*</span>
                                        </label>
                                        <input v-model="form.maKy" :disabled="isEdit" type="text" class="form-control"
                                            placeholder="VD: QUY_1_2026" />
                                    </div>

                                    <div class="col-12 col-md-4">
                                        <label class="form-label">
                                            Tên kỳ <span class="text-danger">*</span>
                                        </label>
                                        <input v-model="form.tenKy" type="text" class="form-control"
                                            placeholder="VD: Quý 1/2026" />
                                    </div>

                                    <div class="col-12 col-md-4">
                                        <label class="form-label">
                                            Loại kỳ <span class="text-danger">*</span>
                                        </label>
                                        <select v-model="form.loaiKy" class="form-select">
                                            <option value="THANG">Tháng</option>
                                            <option value="QUY">Quý</option>
                                            <option value="6THANG">6 tháng</option>
                                            <option value="NAM">Năm</option>
                                        </select>
                                    </div>

                                    <div class="col-12 col-md-3">
                                        <label class="form-label">
                                            Năm <span class="text-danger">*</span>
                                        </label>
                                        <input v-model="form.nam" type="number" class="form-control" />
                                    </div>

                                    <div class="col-12 col-md-3">
                                        <label class="form-label">Số kỳ</label>
                                        <input v-model="form.soKy" type="number" class="form-control" />
                                    </div>

                                    <div class="col-12 col-md-3">
                                        <label class="form-label">
                                            Từ ngày <span class="text-danger">*</span>
                                        </label>
                                        <input v-model="form.tuNgay" type="date" class="form-control" />
                                    </div>

                                    <div class="col-12 col-md-3">
                                        <label class="form-label">
                                            Đến ngày <span class="text-danger">*</span>
                                        </label>
                                        <input v-model="form.denNgay" type="date" class="form-control" />
                                    </div>

                                    <div class="col-12 col-md-3">
                                        <label class="form-label">
                                            Ngày đầu kỳ <span class="text-danger">*</span>
                                        </label>
                                        <input v-model="form.ngayDauKy" type="date" class="form-control" />
                                    </div>

                                    <div class="col-12 col-md-3">
                                        <label class="form-label">
                                            Ngày cuối kỳ <span class="text-danger">*</span>
                                        </label>
                                        <input v-model="form.ngayCuoiKy" type="date" class="form-control" />
                                    </div>

                                    <div class="col-12 col-md-3">
                                        <label class="form-label">
                                            Người cập nhật <span class="text-danger">*</span>
                                        </label>
                                        <input v-model="form.updatedBy" type="text" class="form-control"
                                            placeholder="VD: kienlee1990" />
                                    </div>

                                    <div class="col-12">
                                        <label class="form-label">Ghi chú</label>
                                        <textarea v-model="form.ghiChu" rows="3" class="form-control"></textarea>
                                    </div>
                                </div>
                            </div>

                            <div class="modal-footer border-0 pt-0">
                                <button class="btn btn-light" @click="closeModal">Hủy</button>
                                <button class="btn btn-primary" :disabled="saving" @click="handleSubmit">
                                    <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                                    {{ saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Lưu kỳ báo cáo' }}
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
    import { onMounted, reactive, ref } from 'vue'
    import BaseLayout from '../BaseLayout.vue'
    import { apiRequest } from '../../services/api.js'

    const API_CONTROLLER = '/KyBaoCaoKPI'

    const loading = ref(false)
    const saving = ref(false)
    const showModal = ref(false)
    const isEdit = ref(false)
    const editingId = ref(null)
    const items = ref([])

    const filters = reactive({
        loaiKy: '',
        nam: ''
    })

    const createDefaultForm = () => ({
        maKy: '',
        tenKy: '',
        loaiKy: 'QUY',
        nam: new Date().getFullYear(),
        soKy: '',
        tuNgay: '',
        denNgay: '',
        ngayDauKy: '',
        ngayCuoiKy: '',
        ghiChu: '',
        updatedBy:
            localStorage.getItem('username') ||
            localStorage.getItem('userName') ||
            localStorage.getItem('fullName') ||
            'admin'
    })

    const form = reactive(createDefaultForm())

    const resetForm = () => {
        Object.assign(form, createDefaultForm())
    }

    const normalizeList = (response) => {
        if (Array.isArray(response)) return response
        if (Array.isArray(response?.data)) return response.data
        if (Array.isArray(response?.data?.data)) return response.data.data
        return []
    }

    const toIsoDateStart = (dateValue) => {
        if (!dateValue) return null
        return new Date(`${dateValue}T00:00:00`).toISOString()
    }

    const toIsoDateEnd = (dateValue) => {
        if (!dateValue) return null
        return new Date(`${dateValue}T23:59:59`).toISOString()
    }

    const buildPayload = () => ({
        maKy: form.maKy?.trim(),
        tenKy: form.tenKy?.trim(),
        loaiKy: form.loaiKy,
        nam: Number(form.nam),
        soKy: form.soKy !== '' && form.soKy !== null ? Number(form.soKy) : 0,
        tuNgay: toIsoDateStart(form.tuNgay),
        denNgay: toIsoDateEnd(form.denNgay),
        ngayDauKy: toIsoDateStart(form.ngayDauKy),
        ngayCuoiKy: toIsoDateEnd(form.ngayCuoiKy),
        ghiChu: form.ghiChu?.trim() || '',
        updatedBy: form.updatedBy?.trim()
    })

    const fetchItems = async () => {
        try {
            loading.value = true

            if (filters.nam && filters.loaiKy) {
                const data = await apiRequest(`${API_CONTROLLER}/by-nam/${filters.nam}`)
                const list = normalizeList(data)
                items.value = list.filter((x) => x.loaiKy === filters.loaiKy)
                return
            }

            if (filters.nam) {
                const data = await apiRequest(`${API_CONTROLLER}/by-nam/${filters.nam}`)
                items.value = normalizeList(data)
                return
            }

            if (filters.loaiKy) {
                const data = await apiRequest(`${API_CONTROLLER}/by-loaiky/${filters.loaiKy}`)
                items.value = normalizeList(data)
                return
            }

            const data = await apiRequest(API_CONTROLLER)
            items.value = normalizeList(data)
        } catch (error) {
            console.error('Fetch error:', error)
            alert(error.message || 'Không tải được danh sách kỳ báo cáo KPI.')
            items.value = []
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

    const openEditModal = (item) => {
        isEdit.value = true
        editingId.value = item.id

        Object.assign(form, {
            maKy: item.maKy || '',
            tenKy: item.tenKy || '',
            loaiKy: item.loaiKy || 'QUY',
            nam: item.nam || new Date().getFullYear(),
            soKy: item.soKy ?? '',
            tuNgay: toInputDate(item.tuNgay),
            denNgay: toInputDate(item.denNgay),
            ngayDauKy: toInputDate(item.ngayDauKy),
            ngayCuoiKy: toInputDate(item.ngayCuoiKy),
            ghiChu: item.ghiChu || '',
            updatedBy:
                localStorage.getItem('username') ||
                localStorage.getItem('userName') ||
                localStorage.getItem('fullName') ||
                'admin'
        })

        showModal.value = true
    }

    const closeModal = () => {
        showModal.value = false
        resetForm()
    }

    const validateForm = () => {
        if (!form.maKy && !isEdit.value) {
            alert('Vui lòng nhập mã kỳ.')
            return false
        }

        if (!form.tenKy?.trim()) {
            alert('Vui lòng nhập tên kỳ.')
            return false
        }

        if (!form.loaiKy) {
            alert('Vui lòng chọn loại kỳ.')
            return false
        }

        if (!form.nam) {
            alert('Vui lòng nhập năm.')
            return false
        }

        if (!form.tuNgay || !form.denNgay) {
            alert('Vui lòng nhập từ ngày và đến ngày.')
            return false
        }

        if (!form.ngayDauKy || !form.ngayCuoiKy) {
            alert('Vui lòng nhập ngày đầu kỳ và ngày cuối kỳ.')
            return false
        }

        if (!form.updatedBy?.trim()) {
            alert('Vui lòng nhập người cập nhật.')
            return false
        }

        if (new Date(form.tuNgay) > new Date(form.denNgay)) {
            alert('Từ ngày không được lớn hơn đến ngày.')
            return false
        }

        if (new Date(form.ngayDauKy) > new Date(form.ngayCuoiKy)) {
            alert('Ngày đầu kỳ không được lớn hơn ngày cuối kỳ.')
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
                await apiRequest(`${API_CONTROLLER}/${editingId.value}`, 'PUT', payload)
            } else {
                await apiRequest(API_CONTROLLER, 'POST', payload)
            }

            closeModal()
            await fetchItems()
        } catch (error) {
            console.error('Submit error:', error)
            alert(error.message || 'Lưu kỳ báo cáo KPI thất bại.')
        } finally {
            saving.value = false
        }
    }

    const handleDelete = async (item) => {
        const ok = window.confirm(`Bạn có chắc muốn xóa kỳ báo cáo "${item.tenKy}" không?`)
        if (!ok) return

        try {
            await apiRequest(`${API_CONTROLLER}/${item.id}`, 'DELETE')
            await fetchItems()
        } catch (error) {
            console.error('Delete error:', error)
            alert(error.message || 'Xóa kỳ báo cáo KPI thất bại.')
        }
    }

    const resetFilters = async () => {
        filters.loaiKy = ''
        filters.nam = ''
        await fetchItems()
    }

    const mapLoaiKy = (value) => {
        const map = {
            THANG: 'Tháng',
            QUY: 'Quý',
            '6THANG': '6 tháng',
            NAM: 'Năm'
        }
        return map[value] || value || '-'
    }

    const formatDate = (value) => {
        if (!value) return '-'
        const date = new Date(value)
        if (Number.isNaN(date.getTime())) return '-'
        return date.toLocaleDateString('vi-VN')
    }

    const toInputDate = (value) => {
        if (!value) return ''
        const date = new Date(value)
        if (Number.isNaN(date.getTime())) return ''
        return date.toISOString().split('T')[0]
    }

    onMounted(() => {
        fetchItems()
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