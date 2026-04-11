<template>
    <BaseLayout>
        <div class="page-wrap">
            <div class="container-fluid py-4">
                <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
                    <div>
                        <h1 class="page-title mb-1">Quản lý đơn vị</h1>
                        <p class="page-subtitle mb-0">
                            Quản lý danh sách đơn vị trong hệ thống
                        </p>
                    </div>

                    <button class="btn btn-primary btn-action" @click="openCreateModal">
                        <i class="bi bi-plus-circle me-2"></i>
                        Tạo đơn vị
                    </button>
                </div>

                <div class="card custom-card mb-4">
                    <div class="card-header bg-white border-0 pb-0">
                        <h5 class="mb-1">Bộ lọc tìm kiếm</h5>
                        <small class="text-muted">Tra cứu nhanh theo nhiều tiêu chí</small>
                    </div>

                    <div class="card-body">
                        <div class="row g-3">
                            <div class="col-12 col-md-6 col-xl-4">
                                <label class="form-label">Từ khóa</label>
                                <input v-model="filters.keyword" type="text" class="form-control"
                                    placeholder="Mã hoặc tên đơn vị" />
                            </div>

                            <div class="col-12 col-md-6 col-xl-3">
                                <label class="form-label">Loại đơn vị</label>
                                <select v-model="filters.loaiDonVi" class="form-select">
                                    <option value="">Tất cả</option>
                                    <option value="THANH_PHO">Thành phố</option>
                                    <option value="PHONG">Cấp phòng</option>
                                    <option value="XA">Cấp xã/phường</option>
                                </select>
                            </div>

                            <div class="col-12 col-md-6 col-xl-3">
                                <label class="form-label">Đơn vị cha</label>
                                <select v-model="filters.donViChaId" class="form-select">
                                    <option value="">Tất cả</option>
                                    <option v-for="parent in parentOptions" :key="parent.id" :value="parent.id">
                                        {{ parent.tenDonVi }}
                                    </option>
                                </select>
                            </div>

                            <div class="col-12 col-md-6 col-xl-2">
                                <label class="form-label">Trạng thái</label>
                                <select v-model="filters.trangThai" class="form-select">
                                    <option value="">Tất cả</option>
                                    <option value="HOAT_DONG">Hoạt động</option>
                                    <option value="NGUNG_HOAT_DONG">Ngừng hoạt động</option>
                                </select>
                            </div>
                        </div>

                        <div class="d-flex flex-wrap gap-2 mt-4">
                            <button class="btn btn-primary" @click="fetchDonVi">
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
                            <h5 class="mb-1">Danh sách đơn vị</h5>
                            <small class="text-muted">Theo dõi và quản lý dữ liệu đơn vị</small>
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
                                        <th>Mã đơn vị</th>
                                        <th>Tên đơn vị</th>
                                        <th>Loại đơn vị</th>
                                        <th>Đơn vị cha</th>
                                        <th>Người đại diện</th>
                                        <th>Trạng thái</th>
                                        <th class="text-center" style="width: 180px">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="item in items" :key="item.id">
                                        <td class="fw-semibold text-primary">{{ item.maDonVi }}</td>
                                        <td>{{ item.tenDonVi }}</td>
                                        <td>{{ mapLoaiDonVi(item.loaiDonVi) }}</td>
                                        <td>{{ item.tenDonViCha || '-' }}</td>
                                        <td>{{ item.nguoiDaiDien || '-' }}</td>
                                        <td>
                                            <span class="badge rounded-pill"
                                                :class="item.trangThai === 'HOAT_DONG' ? 'text-bg-success' : 'text-bg-danger'">
                                                {{ item.trangThai === 'HOAT_DONG' ? 'Hoạt động' : 'Ngừng hoạt động' }}
                                            </span>
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
                                        {{ isEdit ? 'Cập nhật đơn vị' : 'Tạo đơn vị mới' }}
                                    </h4>
                                    <p class="text-muted mb-0">Nhập thông tin đơn vị</p>
                                </div>
                                <button type="button" class="btn-close" @click="closeModal"></button>
                            </div>

                            <div class="modal-body pt-3">
                                <div class="row g-3">
                                    <div class="col-12 col-md-6">
                                        <label class="form-label">
                                            Mã đơn vị <span class="text-danger">*</span>
                                        </label>
                                        <input v-model="form.maDonVi" :disabled="isEdit" type="text"
                                            class="form-control" />
                                    </div>

                                    <div class="col-12 col-md-6">
                                        <label class="form-label">
                                            Tên đơn vị <span class="text-danger">*</span>
                                        </label>
                                        <input v-model="form.tenDonVi" type="text" class="form-control" />
                                    </div>

                                    <div class="col-12 col-md-6">
                                        <label class="form-label">
                                            Loại đơn vị <span class="text-danger">*</span>
                                        </label>
                                        <select v-model="form.loaiDonVi" class="form-select">
                                            <option value="THANH_PHO">Thành phố</option>
                                            <option value="PHONG">Cấp phòng</option>
                                            <option value="XA">Cấp xã/phường</option>
                                        </select>
                                    </div>

                                    <div class="col-12 col-md-6">
                                        <label class="form-label">Đơn vị cha</label>
                                        <select v-model="form.donViChaId" class="form-select">
                                            <option :value="null">Không có</option>
                                            <option v-for="parent in availableParentOptions" :key="parent.id"
                                                :value="parent.id">
                                                {{ parent.tenDonVi }}
                                            </option>
                                        </select>
                                    </div>

                                    <div class="col-12 col-md-6">
                                        <label class="form-label">Trạng thái</label>
                                        <select v-model="form.trangThai" class="form-select">
                                            <option value="HOAT_DONG">Hoạt động</option>
                                            <option value="NGUNG_HOAT_DONG">Ngừng hoạt động</option>
                                        </select>
                                    </div>

                                    <div class="col-12 col-md-6">
                                        <label class="form-label">Người đại diện</label>
                                        <input v-model="form.nguoiDaiDien" type="text" class="form-control" />
                                    </div>

                                    <div class="col-12 col-md-6">
                                        <label class="form-label">Số điện thoại</label>
                                        <input v-model="form.soDienThoai" type="text" class="form-control" />
                                    </div>

                                    <div class="col-12 col-md-6">
                                        <label class="form-label">Email</label>
                                        <input v-model="form.email" type="email" class="form-control" />
                                    </div>

                                    <div class="col-12">
                                        <label class="form-label">Địa chỉ</label>
                                        <input v-model="form.diaChi" type="text" class="form-control" />
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
                                    {{ saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Lưu đơn vị' }}
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
    import { computed, onMounted, reactive, ref } from 'vue'
    import axios from 'axios'
    import BaseLayout from "../BaseLayout.vue"

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
        loaiDonVi: '',
        donViChaId: '',
        trangThai: ''
    })

    const createDefaultForm = () => ({
        maDonVi: '',
        tenDonVi: '',
        loaiDonVi: 'THANH_PHO',
        donViChaId: null,
        trangThai: 'HOAT_DONG',
        diaChi: '',
        nguoiDaiDien: '',
        soDienThoai: '',
        email: '',
        ghiChu: ''
    })

    const form = reactive(createDefaultForm())

    const resetForm = () => {
        Object.assign(form, createDefaultForm())
    }

    const parentOptions = computed(() => items.value)

    const availableParentOptions = computed(() => {
        return items.value.filter(item => item.id !== editingId.value)
    })

    const buildPayload = () => {
        return {
            maDonVi: form.maDonVi?.trim(),
            tenDonVi: form.tenDonVi?.trim(),
            loaiDonVi: form.loaiDonVi,
            donViChaId: form.donViChaId || null,
            trangThai: form.trangThai,
            diaChi: form.diaChi?.trim() || null,
            nguoiDaiDien: form.nguoiDaiDien?.trim() || null,
            soDienThoai: form.soDienThoai?.trim() || null,
            email: form.email?.trim() || null,
            ghiChu: form.ghiChu?.trim() || null
        }
    }

    const fetchDonVi = async () => {
        try {
            loading.value = true
            const { data } = await api.get('/don-vi', {
                params: {
                    keyword: filters.keyword || undefined,
                    loaiDonVi: filters.loaiDonVi || undefined,
                    donViChaId: filters.donViChaId || undefined,
                    trangThai: filters.trangThai || undefined
                }
            })
            items.value = data
        } catch (error) {
            console.error(error)
            alert(error?.response?.data?.message || 'Không tải được danh sách đơn vị.')
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
            maDonVi: item.maDonVi,
            tenDonVi: item.tenDonVi,
            loaiDonVi: item.loaiDonVi,
            donViChaId: item.donViChaId || null,
            trangThai: item.trangThai || 'HOAT_DONG',
            diaChi: item.diaChi || '',
            nguoiDaiDien: item.nguoiDaiDien || '',
            soDienThoai: item.soDienThoai || '',
            email: item.email || '',
            ghiChu: item.ghiChu || ''
        })

        showModal.value = true
    }

    const closeModal = () => {
        showModal.value = false
        resetForm()
    }

    const validateForm = () => {
        if (!form.maDonVi && !isEdit.value) {
            alert('Vui lòng nhập mã đơn vị.')
            return false
        }

        if (!form.tenDonVi) {
            alert('Vui lòng nhập tên đơn vị.')
            return false
        }

        if (!form.loaiDonVi) {
            alert('Vui lòng chọn loại đơn vị.')
            return false
        }

        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            alert('Email không đúng định dạng.')
            return false
        }

        if (isEdit.value && editingId.value && form.donViChaId === editingId.value) {
            alert('Đơn vị cha không được trùng với chính đơn vị hiện tại.')
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
                await api.put(`/don-vi/${editingId.value}`, {
                    tenDonVi: payload.tenDonVi,
                    loaiDonVi: payload.loaiDonVi,
                    donViChaId: payload.donViChaId,
                    trangThai: payload.trangThai,
                    diaChi: payload.diaChi,
                    nguoiDaiDien: payload.nguoiDaiDien,
                    soDienThoai: payload.soDienThoai,
                    email: payload.email,
                    ghiChu: payload.ghiChu
                })
            } else {
                await api.post('/don-vi', payload)
            }

            closeModal()
            await fetchDonVi()
        } catch (error) {
            console.error(error)
            alert(error?.response?.data?.message || 'Lưu đơn vị thất bại.')
        } finally {
            saving.value = false
        }
    }

    const handleDelete = async (item) => {
        const ok = window.confirm(`Bạn có chắc muốn xóa đơn vị "${item.tenDonVi}" không?`)
        if (!ok) return

        try {
            await api.delete(`/don-vi/${item.id}`)
            await fetchDonVi()
        } catch (error) {
            console.error(error)
            alert(error?.response?.data?.message || 'Xóa đơn vị thất bại.')
        }
    }

    const resetFilters = async () => {
        filters.keyword = ''
        filters.loaiDonVi = ''
        filters.donViChaId = ''
        filters.trangThai = ''
        await fetchDonVi()
    }

    const mapLoaiDonVi = (value) => {
        const map = {
            THANH_PHO: 'Thành phố',
            PHONG: 'Cấp phòng',
            XA: 'Cấp xã/phường'
        }
        return map[value] || value
    }

    onMounted(() => {
        fetchDonVi()
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