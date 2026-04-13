<template>
    <BaseLayout>
        <div class="page-wrap">
            <div class="container-fluid py-4">
                <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
                    <div>
                        <h1 class="page-title mb-1">Chỉ tiêu Bộ giao</h1>
                        <p class="page-subtitle mb-0">
                            Quản lý danh sách chỉ tiêu do Bộ giao cho đơn vị
                        </p>
                    </div>

                    <button class="btn btn-primary btn-action" @click="openCreateModal">
                        <i class="bi bi-plus-circle me-2"></i>
                        Tạo chỉ tiêu Bộ giao
                    </button>
                </div>

                <div class="card custom-card mb-4">
                    <div class="card-header bg-white border-0 pb-0">
                        <h5 class="mb-1">Bộ lọc tìm kiếm</h5>
                        <small class="text-muted">Tra cứu nhanh chỉ tiêu Bộ giao</small>
                    </div>

                    <div class="card-body">
                        <div class="row g-3">
                            <div class="col-12 col-md-6 col-xl-4">
                                <label class="form-label">Từ khóa</label>
                                <input v-model="filters.keyword" type="text" class="form-control"
                                    placeholder="Mã hoặc tên chỉ tiêu" />
                            </div>

                            <div class="col-12 col-md-6 col-xl-3">
                                <label class="form-label">Loại chỉ tiêu</label>
                                <select v-model="filters.loaiChiTieu" class="form-select">
                                    <option value="">Tất cả</option>
                                    <option value="DINH_TINH">Định tính</option>
                                    <option value="DINH_LUONG_TICH_LUY">Định lượng tích lũy</option>
                                    <option value="DINH_LUONG_SO_SANH">Định lượng so sánh</option>
                                </select>
                            </div>

                            <div class="col-12 col-md-6 col-xl-3">
                                <label class="form-label">Cấp áp dụng</label>
                                <select v-model="filters.capApDung" class="form-select">
                                    <option value="">Tất cả</option>
                                    <option value="THANH_PHO">Thành phố</option>
                                    <option value="PHONG">Cấp phòng</option>
                                    <option value="XA">Cấp xã/phường</option>
                                </select>
                            </div>

                            <div class="col-12 col-md-6 col-xl-2">
                                <label class="form-label">Trạng thái</label>
                                <select v-model="filters.trangThaiSuDung" class="form-select">
                                    <option value="">Tất cả</option>
                                    <option value="DANG_AP_DUNG">Đang áp dụng</option>
                                    <option value="NGUNG_AP_DUNG">Ngừng áp dụng</option>
                                </select>
                            </div>
                        </div>

                        <div class="d-flex flex-wrap gap-2 mt-4">
                            <button class="btn btn-primary" @click="fetchChiTieuBoGiao">
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
                            <h5 class="mb-1">Danh sách chỉ tiêu Bộ giao</h5>
                            <small class="text-muted">Theo dõi và quản lý dữ liệu chỉ tiêu nguồn Bộ</small>
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
                                        <th>Mã chỉ tiêu</th>
                                        <th>Tên chỉ tiêu</th>
                                        <th>Loại</th>
                                        <th>Cấp áp dụng</th>
                                        <th>Cho phép phân rã</th>
                                        <th>Trạng thái</th>
                                        <th class="text-center" style="width: 180px">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="item in items" :key="item.id">
                                        <td class="fw-semibold text-primary">{{ item.maChiTieu }}</td>
                                        <td>{{ item.tenChiTieu }}</td>
                                        <td>{{ mapLoai(item.loaiChiTieu) }}</td>
                                        <td>{{ mapCap(item.capApDung) }}</td>
                                        <td>
                                            <span class="badge rounded-pill"
                                                :class="item.coChoPhepPhanRa ? 'text-bg-info' : 'text-bg-secondary'">
                                                {{ item.coChoPhepPhanRa ? 'Có' : 'Không' }}
                                            </span>
                                        </td>
                                        <td>
                                            <span class="badge rounded-pill"
                                                :class="item.trangThaiSuDung === 'DANG_AP_DUNG' ? 'text-bg-success' : 'text-bg-danger'">
                                                {{ item.trangThaiSuDung === 'DANG_AP_DUNG'
                                                ? 'Đang áp dụng'
                                                : 'Ngừng áp dụng' }}
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
                                        {{ isEdit ? 'Cập nhật chỉ tiêu Bộ giao' : 'Tạo chỉ tiêu Bộ giao' }}
                                    </h4>
                                    <p class="text-muted mb-0">Nhập thông tin chỉ tiêu nguồn Bộ</p>
                                </div>
                                <button type="button" class="btn-close" @click="closeModal"></button>
                            </div>

                            <div class="modal-body pt-3">
                                <div class="row g-3">
                                    <div class="col-12 col-md-6">
                                        <label class="form-label">
                                            Mã chỉ tiêu <span class="text-danger">*</span>
                                        </label>
                                        <input v-model="form.maChiTieu" :disabled="isEdit" type="text"
                                            class="form-control" />
                                    </div>

                                    <div class="col-12 col-md-6">
                                        <label class="form-label">
                                            Tên chỉ tiêu <span class="text-danger">*</span>
                                        </label>
                                        <input v-model="form.tenChiTieu" type="text" class="form-control" />
                                    </div>

                                    <div class="col-12 col-md-6">
                                        <label class="form-label">Nguồn chỉ tiêu</label>
                                        <input type="text" class="form-control" value="Bộ" disabled />
                                    </div>

                                    <div class="col-12 col-md-6">
                                        <label class="form-label">
                                            Loại chỉ tiêu <span class="text-danger">*</span>
                                        </label>
                                        <select v-model="form.loaiChiTieu" class="form-select">
                                            <option value="DINH_TINH">Định tính</option>
                                            <option value="DINH_LUONG_TICH_LUY">Định lượng tích lũy</option>
                                            <option value="DINH_LUONG_SO_SANH">Định lượng so sánh</option>
                                        </select>
                                    </div>

                                    <div class="col-12 col-md-6">
                                        <label class="form-label">
                                            Cấp áp dụng <span class="text-danger">*</span>
                                        </label>
                                        <select v-model="form.capApDung" class="form-select">
                                            <option value="THANH_PHO">Thành phố</option>
                                            <option value="PHONG">Cấp phòng</option>
                                            <option value="XA">Cấp xã/phường</option>
                                        </select>
                                    </div>

                                    <div class="col-12 col-md-6">
                                        <label class="form-label">Lĩnh vực nghiệp vụ</label>
                                        <input v-model="form.linhVucNghiepVu" type="text" class="form-control" />
                                    </div>

                                    <div class="col-12 col-md-6">
                                        <label class="form-label">Đơn vị tính</label>
                                        <input v-model="form.donViTinh" type="text" class="form-control" />
                                    </div>

                                    <div class="col-12 col-md-6">
                                        <label class="form-label">Trạng thái sử dụng</label>
                                        <select v-model="form.trangThaiSuDung" class="form-select">
                                            <option value="DANG_AP_DUNG">Đang áp dụng</option>
                                            <option value="NGUNG_AP_DUNG">Ngừng áp dụng</option>
                                        </select>
                                    </div>

                                    <div class="col-12 col-md-6">
                                        <label class="form-label">Ngày hiệu lực</label>
                                        <input v-model="form.ngayHieuLuc" type="date" class="form-control" />
                                    </div>

                                    <div class="col-12 col-md-6">
                                        <label class="form-label">Ngày hết hiệu lực</label>
                                        <input v-model="form.ngayHetHieuLuc" type="date" class="form-control" />
                                    </div>

                                    <div class="col-12">
                                        <div class="form-check custom-check">
                                            <input v-model="form.coChoPhepPhanRa" class="form-check-input"
                                                type="checkbox" id="coChoPhepPhanRa" />
                                            <label class="form-check-label" for="coChoPhepPhanRa">
                                                Cho phép phân rã chỉ tiêu xuống đơn vị cấp dưới
                                            </label>
                                        </div>
                                    </div>

                                    <div class="col-12">
                                        <label class="form-label">Mô tả</label>
                                        <textarea v-model="form.moTa" rows="3" class="form-control"></textarea>
                                    </div>

                                    <div class="col-12">
                                        <label class="form-label">Hướng dẫn tính toán</label>
                                        <textarea v-model="form.huongDanTinhToan" rows="3"
                                            class="form-control"></textarea>
                                    </div>

                                    <template v-if="form.loaiChiTieu === 'DINH_TINH'">
                                        <div class="col-12 col-md-6">
                                            <label class="form-label">Điều kiện hoàn thành</label>
                                            <input v-model="form.dieuKienHoanThanh" type="text" class="form-control" />
                                        </div>
                                        <div class="col-12 col-md-6">
                                            <label class="form-label">Điều kiện không hoàn thành</label>
                                            <input v-model="form.dieuKienKhongHoanThanh" type="text"
                                                class="form-control" />
                                        </div>
                                    </template>

                                    <template v-if="form.loaiChiTieu === 'DINH_LUONG_SO_SANH'">
                                        <div class="col-12 col-md-4">
                                            <label class="form-label">Tỷ lệ % mục tiêu</label>
                                            <input v-model.number="form.tyLePhanTramMucTieu" type="number" min="0"
                                                class="form-control" />
                                        </div>
                                        <div class="col-12 col-md-4">
                                            <label class="form-label">Loại mốc so sánh</label>
                                            <select v-model="form.loaiMocSoSanh" class="form-select">
                                                <option value="">Chọn</option>
                                                <option value="DAU_KY">Đầu kỳ</option>
                                                <option value="CUNG_KY">Cùng kỳ</option>
                                                <option value="KY_TRUOC">Kỳ trước</option>
                                            </select>
                                        </div>
                                        <div class="col-12 col-md-4">
                                            <label class="form-label">Chiều so sánh</label>
                                            <select v-model="form.chieuSoSanh" class="form-select">
                                                <option value="">Chọn</option>
                                                <option value="TANG">Tăng</option>
                                                <option value="GIAM">Giảm</option>
                                            </select>
                                        </div>
                                    </template>
                                </div>
                            </div>

                            <div class="modal-footer border-0 pt-0">
                                <button class="btn btn-light" @click="closeModal">Hủy</button>
                                <button class="btn btn-primary" :disabled="saving" @click="handleSubmit">
                                    <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                                    {{ saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Lưu chỉ tiêu' }}
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

    const loading = ref(false)
    const saving = ref(false)
    const showModal = ref(false)
    const isEdit = ref(false)
    const editingId = ref(null)
    const items = ref([])

    const filters = reactive({
        keyword: '',
        loaiChiTieu: '',
        capApDung: '',
        trangThaiSuDung: ''
    })

    const createDefaultForm = () => ({
        maChiTieu: '',
        tenChiTieu: '',
        nguonChiTieu: 'BO',
        loaiChiTieu: 'DINH_TINH',
        capApDung: 'THANH_PHO',
        linhVucNghiepVu: '',
        donViTinh: '',
        moTa: '',
        huongDanTinhToan: '',
        coChoPhepPhanRa: true,
        trangThaiSuDung: 'DANG_AP_DUNG',
        ngayHieuLuc: '',
        ngayHetHieuLuc: '',
        dieuKienHoanThanh: '',
        dieuKienKhongHoanThanh: '',
        tyLePhanTramMucTieu: null,
        loaiMocSoSanh: '',
        chieuSoSanh: ''
    })

    const form = reactive(createDefaultForm())

    const resetForm = () => {
        Object.assign(form, createDefaultForm())
    }

    const buildPayload = () => {
        return {
            maChiTieu: form.maChiTieu?.trim(),
            tenChiTieu: form.tenChiTieu?.trim(),
            nguonChiTieu: 'BO',
            loaiChiTieu: form.loaiChiTieu,
            capApDung: form.capApDung,
            linhVucNghiepVu: form.linhVucNghiepVu || null,
            donViTinh: form.donViTinh || null,
            moTa: form.moTa || null,
            huongDanTinhToan: form.huongDanTinhToan || null,
            coChoPhepPhanRa: form.coChoPhepPhanRa,
            trangThaiSuDung: form.trangThaiSuDung,
            ngayHieuLuc: form.ngayHieuLuc || null,
            ngayHetHieuLuc: form.ngayHetHieuLuc || null,
            dieuKienHoanThanh: form.loaiChiTieu === 'DINH_TINH' ? form.dieuKienHoanThanh || null : null,
            dieuKienKhongHoanThanh: form.loaiChiTieu === 'DINH_TINH' ? form.dieuKienKhongHoanThanh || null : null,
            tyLePhanTramMucTieu: form.loaiChiTieu === 'DINH_LUONG_SO_SANH' ? form.tyLePhanTramMucTieu : null,
            loaiMocSoSanh: form.loaiChiTieu === 'DINH_LUONG_SO_SANH' ? form.loaiMocSoSanh || null : null,
            chieuSoSanh: form.loaiChiTieu === 'DINH_LUONG_SO_SANH' ? form.chieuSoSanh || null : null
        }
    }

    const buildQueryString = (params) => {
        const searchParams = new URLSearchParams()

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                searchParams.append(key, value)
            }
        })

        const query = searchParams.toString()
        return query ? `?${query}` : ''
    }

    const fetchChiTieuBoGiao = async () => {
        try {
            loading.value = true

            const queryString = buildQueryString({
                keyword: filters.keyword || undefined,
                nguonChiTieu: 'BO',
                loaiChiTieu: filters.loaiChiTieu || undefined,
                capApDung: filters.capApDung || undefined,
                trangThaiSuDung: filters.trangThaiSuDung || undefined
            })

            const data = await apiRequest(`/danh-muc-chi-tieu${queryString}`)
            items.value = Array.isArray(data) ? data : []
        } catch (error) {
            console.error(error)
            alert(error.message || 'Không tải được chỉ tiêu Bộ giao.')
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
            maChiTieu: item.maChiTieu,
            tenChiTieu: item.tenChiTieu,
            nguonChiTieu: 'BO',
            loaiChiTieu: item.loaiChiTieu,
            capApDung: item.capApDung,
            linhVucNghiepVu: item.linhVucNghiepVu || '',
            donViTinh: item.donViTinh || '',
            moTa: item.moTa || '',
            huongDanTinhToan: item.huongDanTinhToan || '',
            coChoPhepPhanRa: item.coChoPhepPhanRa,
            trangThaiSuDung: item.trangThaiSuDung || 'DANG_AP_DUNG',
            ngayHieuLuc: item.ngayHieuLuc ? item.ngayHieuLuc.slice(0, 10) : '',
            ngayHetHieuLuc: item.ngayHetHieuLuc ? item.ngayHetHieuLuc.slice(0, 10) : '',
            dieuKienHoanThanh: item.dieuKienHoanThanh || '',
            dieuKienKhongHoanThanh: item.dieuKienKhongHoanThanh || '',
            tyLePhanTramMucTieu: item.tyLePhanTramMucTieu,
            loaiMocSoSanh: item.loaiMocSoSanh || '',
            chieuSoSanh: item.chieuSoSanh || ''
        })

        showModal.value = true
    }

    const closeModal = () => {
        showModal.value = false
        resetForm()
    }

    const validateForm = () => {
        if (!form.maChiTieu && !isEdit.value) {
            alert('Vui lòng nhập mã chỉ tiêu.')
            return false
        }

        if (!form.tenChiTieu) {
            alert('Vui lòng nhập tên chỉ tiêu.')
            return false
        }

        if (form.loaiChiTieu === 'DINH_TINH') {
            if (!form.dieuKienHoanThanh || !form.dieuKienKhongHoanThanh) {
                alert('Chỉ tiêu định tính phải nhập điều kiện hoàn thành và điều kiện không hoàn thành.')
                return false
            }
        }

        if (form.loaiChiTieu === 'DINH_LUONG_SO_SANH') {
            if (!form.tyLePhanTramMucTieu || !form.loaiMocSoSanh || !form.chieuSoSanh) {
                alert('Chỉ tiêu định lượng so sánh phải nhập đủ tỷ lệ %, loại mốc so sánh và chiều so sánh.')
                return false
            }
        }

        return true
    }

    const handleSubmit = async () => {
        if (!validateForm()) return

        try {
            saving.value = true
            const payload = buildPayload()

            if (isEdit.value && editingId.value) {
                await apiRequest(`/danh-muc-chi-tieu/${editingId.value}`, 'PUT', payload)
            } else {
                await apiRequest('/danh-muc-chi-tieu', 'POST', payload)
            }

            closeModal()
            await fetchChiTieuBoGiao()
        } catch (error) {
            console.error(error)
            alert(error.message || 'Lưu chỉ tiêu Bộ giao thất bại.')
        } finally {
            saving.value = false
        }
    }

    const handleDelete = async (item) => {
        const ok = window.confirm(`Bạn có chắc muốn xóa chỉ tiêu "${item.tenChiTieu}" không?`)
        if (!ok) return

        try {
            await apiRequest(`/danh-muc-chi-tieu/${item.id}`, 'DELETE')
            await fetchChiTieuBoGiao()
        } catch (error) {
            console.error(error)
            alert(error.message || 'Xóa chỉ tiêu thất bại.')
        }
    }

    const resetFilters = async () => {
        filters.keyword = ''
        filters.loaiChiTieu = ''
        filters.capApDung = ''
        filters.trangThaiSuDung = ''
        await fetchChiTieuBoGiao()
    }

    const mapLoai = (value) => {
        const map = {
            DINH_TINH: 'Định tính',
            DINH_LUONG_TICH_LUY: 'Định lượng tích lũy',
            DINH_LUONG_SO_SANH: 'Định lượng so sánh'
        }
        return map[value] || value
    }

    const mapCap = (value) => {
        const map = {
            THANH_PHO: 'Thành phố',
            PHONG: 'Cấp phòng',
            XA: 'Cấp xã/phường'
        }
        return map[value] || value
    }

    onMounted(() => {
        fetchChiTieuBoGiao()
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

    .custom-check {
        background: #f8fafc;
        padding: 14px 16px;
        border-radius: 14px;
        border: 1px solid #e2e8f0;
    }

    textarea.form-control {
        min-height: 100px;
        resize: vertical;
    }
</style>