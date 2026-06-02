<template>
    <BaseLayout>
        <div class="page-wrap">
            <div class="container-fluid py-4">
                <div class="gov-banner mb-4">
                    <div class="gov-emblem">
                        <i class="bi bi-hourglass-split"></i>
                    </div>
                    <div class="gov-text">
                        <div class="gov-title">BÁO CÁO CHỜ XÉT DUYỆT</div>
                        <div class="gov-sub">Kiểm tra báo cáo định kỳ đã nộp trước khi ghi nhận kết quả</div>
                    </div>
                </div>

                <div class="card custom-card mb-4">
                    <div class="card-header bg-white border-0 pb-0">
                        <h5 class="mb-1">Bộ lọc tìm kiếm</h5>
                        <small class="text-muted">Tra cứu nhanh các báo cáo đang chờ xét duyệt</small>
                    </div>

                    <div class="card-body">
                        <div class="row g-3">
                            <div class="col-12 col-md-4">
                                <label class="form-label">Kỳ báo cáo</label>
                                <select v-model="filters.kyBaoCaoKPIId" class="form-select">
                                    <option value="">Tất cả</option>
                                    <option v-for="item in kyBaoCaoOptions" :key="item.id" :value="String(item.id)">
                                        {{ item.label }}
                                    </option>
                                </select>
                            </div>

                            <div class="col-12 col-md-4">
                                <label class="form-label">Đơn vị thực hiện</label>
                                <select v-model="filters.tenDonViNhan" class="form-select">
                                    <option value="">Tất cả</option>
                                    <option v-for="item in donViOptions" :key="item" :value="item">
                                        {{ item }}
                                    </option>
                                </select>
                            </div>

                            <div class="col-12 col-md-4">
                                <label class="form-label">Danh mục chỉ tiêu</label>
                                <select v-model="filters.chiTietGiaoChiTieuId" class="form-select">
                                    <option value="">Tất cả</option>
                                    <option v-for="item in chiTieuOptions" :key="item.id" :value="String(item.id)">
                                        {{ item.label }}
                                    </option>
                                </select>
                            </div>

                            <div class="col-12">
                                <label class="form-label">Từ khóa</label>
                                <input v-model="filters.keyword" type="text" class="form-control"
                                    placeholder="Mã kỳ, mã chỉ tiêu, tên chỉ tiêu..." />
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
                            <h5 class="mb-1">Danh sách báo cáo chờ xét duyệt</h5>
                            <small class="text-muted">Chỉ hiển thị các báo cáo ở trạng thái chờ xét duyệt</small>
                        </div>
                        <span class="badge text-bg-warning border">Chờ duyệt: {{ filteredItems.length }}</span>
                    </div>

                    <div class="card-body p-0">
                        <div v-if="loading" class="empty-state">
                            <div class="spinner-border text-primary mb-3" role="status"></div>
                            <div>Đang tải dữ liệu...</div>
                        </div>

                        <div v-else-if="!filteredItems.length" class="empty-state">
                            <i class="bi bi-inbox fs-1 text-muted mb-2"></i>
                            <div>Không có báo cáo chờ xét duyệt</div>
                        </div>

                        <div v-else class="table-responsive">
                            <ColumnVisibilityTools table-id="BaoCaoChoXetDuyetPage-table" />
                            <table id="BaoCaoChoXetDuyetPage-table"
                                class="table table-hover align-middle mb-0 custom-table managed-table">
                                <thead>
                                    <tr>
                                        <th>Kỳ báo cáo</th>
                                        <th>Đơn vị thực hiện</th>
                                        <th>Danh mục chỉ tiêu</th>
                                        <th>Đầu kỳ</th>
                                        <th>Thực hiện trong kỳ</th>
                                        <th>Cuối kỳ</th>
                                        <th>Lũy kế</th>
                                        <th>Trạng thái</th>
                                        <th class="text-center" style="width: 320px">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="item in filteredItems" :key="getId(item)">
                                        <td>
                                            <div class="fw-semibold">{{ getKyDisplay(item) }}</div>
                                            <small class="text-muted">{{ item.MaKy || item.maKy || '' }}</small>
                                        </td>
                                        <td>{{ item.TenDonViNhan || item.tenDonViNhan || '-' }}</td>
                                        <td>
                                            <div class="fw-semibold text-primary">{{ getChiTieuDisplay(item) }}</div>
                                            <small v-if="item.MaChiTieu || item.maChiTieu" class="text-muted">
                                                {{ item.MaChiTieu || item.maChiTieu }}
                                            </small>
                                        </td>
                                        <td>{{ formatNumber(item.GiaTriDauKy ?? item.giaTriDauKy) }}</td>
                                        <td>{{ formatNumber(item.GiaTriThucHienTrongKy ?? item.giaTriThucHienTrongKy) }}</td>
                                        <td>{{ formatNumber(item.GiaTriCuoiKy ?? item.giaTriCuoiKy) }}</td>
                                        <td>{{ formatNumber(item.GiaTriLuyKe ?? item.giaTriLuyKe) }}</td>
                                        <td>
                                            <span class="badge status-badge">Chờ xét duyệt</span>
                                        </td>
                                        <td class="table-actions-cell">
                                            <div class="row-actions">
                                                <button v-if="canViewPendingReportDetails" class="action-btn action-view action-wide" title="Xem chi tiết báo cáo"
                                                    :disabled="processingId === getId(item)"
                                                    @click="openDetailModal(item)">
                                                    <span class="action-icon">
                                                        <i class="bi bi-eye"></i>
                                                    </span>
                                                    <span>Xem chi tiết</span>
                                                </button>
                                                <button v-if="canApprovePendingReports" class="action-btn action-approve" title="Chấp nhận báo cáo"
                                                    :disabled="processingId === getId(item)"
                                                    @click="approveItem(item)">
                                                    <span class="action-icon">
                                                        <i class="bi bi-check2-circle"></i>
                                                    </span>
                                                    <span>Duyệt</span>
                                                </button>
                                                <button v-if="canReturnPendingReports" class="action-btn action-delete" title="Gửi trả báo cáo"
                                                    :disabled="processingId === getId(item)"
                                                    @click="openReturnModal(item)">
                                                    <span class="action-icon">
                                                        <i class="bi bi-arrow-counterclockwise"></i>
                                                    </span>
                                                    <span>Gửi trả</span>
                                                </button>
                                                <span v-if="!canViewPendingReportDetails && !canApprovePendingReports && !canReturnPendingReports" class="text-muted small">Chỉ xem</span>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div v-if="selectedItem" class="modal fade show d-block custom-modal" tabindex="-1"
                    @click.self="closeDetailModal">
                    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                        <div class="modal-content border-0 shadow-lg rounded-4">
                            <div class="modal-header border-0 pb-0">
                                <div>
                                    <h4 class="modal-title mb-1">Chi tiết báo cáo chờ xét duyệt</h4>
                                    <p class="text-muted mb-0">Kiểm tra, chỉnh sửa số liệu và chấp nhận báo cáo</p>
                                </div>
                                <button type="button" class="btn-close" @click="closeDetailModal"></button>
                            </div>

                            <div class="modal-body">
                                <div class="detail-grid">
                                    <div class="detail-item">
                                        <span>Kỳ báo cáo</span>
                                        <strong>{{ getKyDisplay(selectedItem) }}</strong>
                                    </div>
                                    <div class="detail-item">
                                        <span>Đơn vị thực hiện</span>
                                        <strong>{{ selectedItem.TenDonViNhan || selectedItem.tenDonViNhan || '-' }}</strong>
                                    </div>
                                    <div class="detail-item">
                                        <span>Chỉ tiêu</span>
                                        <strong>{{ getChiTieuDisplay(selectedItem) }}</strong>
                                    </div>
                                    <div class="detail-item">
                                        <span>Đầu kỳ</span>
                                        <strong>{{ formatNumber(selectedItem.GiaTriDauKy ?? selectedItem.giaTriDauKy) }}</strong>
                                    </div>
                                    <div class="detail-item">
                                        <span>Cuối kỳ hiện tại</span>
                                        <strong>{{ formatNumber(selectedItem.GiaTriCuoiKy ?? selectedItem.giaTriCuoiKy) }}</strong>
                                    </div>
                                    <div class="detail-item">
                                        <span>Lũy kế hiện tại</span>
                                        <strong>{{ formatNumber(selectedItem.GiaTriLuyKe ?? selectedItem.giaTriLuyKe) }}</strong>
                                    </div>
                                </div>

                                <div v-if="!selectedIsDinhTinh" class="edit-grid mt-3">
                                    <div class="form-field">
                                        <label class="form-label">Giá trị phát sinh trong kỳ</label>
                                        <input v-model.number="detailForm.giaTriPhatSinhTrongKy" type="number" min="0"
                                            step="0.01" class="form-control" />
                                    </div>
                                    <div class="form-field">
                                        <label class="form-label">Giá trị thực hiện trong kỳ</label>
                                        <input v-model.number="detailForm.giaTriThucHienTrongKy" type="number" min="0"
                                            step="0.01" class="form-control" />
                                    </div>
                                </div>

                                <div v-if="selectedIsDinhTinh" class="form-field mt-3">
                                    <label class="form-label">Kết quả đánh giá định tính</label>
                                    <select v-model="detailForm.nhanXet" class="form-control">
                                        <option value="">Chọn kết quả đánh giá</option>
                                        <option v-for="option in qualitativeOptions" :key="option.value"
                                            :value="option.value">
                                            {{ option.label }}
                                        </option>
                                    </select>
                                </div>

                                <div v-else class="form-field mt-3">
                                    <label class="form-label">Nhận xét</label>
                                    <textarea v-model.trim="detailForm.nhanXet" class="form-control" rows="4"></textarea>
                                </div>
                            </div>

                            <div class="modal-footer border-0 pt-0">
                                <button class="btn btn-light" @click="closeDetailModal">Đóng</button>
                                <button v-if="canReturnPendingReports" class="btn btn-outline-danger"
                                    :disabled="processingId === getId(selectedItem)"
                                    @click="openReturnModal(selectedItem, { closeModal: true })">
                                    <i class="bi bi-arrow-counterclockwise me-1"></i>Gửi trả
                                </button>
                                <button v-if="canApprovePendingReports" class="btn btn-primary" :disabled="processingId === getId(selectedItem)"
                                    @click="saveAndApproveItem(selectedItem)">
                                    <span v-if="processingId === getId(selectedItem)"
                                        class="spinner-border spinner-border-sm me-2"></span>
                                    Lưu và chấp nhận
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="returnTarget" class="modal fade show d-block custom-modal" tabindex="-1"
                    @click.self="closeReturnModal">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content border-0 shadow-lg rounded-4">
                            <div class="modal-header border-0 pb-0">
                                <div>
                                    <h4 class="modal-title mb-1">Gửi trả báo cáo</h4>
                                    <p class="text-muted mb-0">Nhập lý do để đơn vị gửi báo cáo biết nội dung cần điều chỉnh.</p>
                                </div>
                                <button type="button" class="btn-close" @click="closeReturnModal"></button>
                            </div>

                            <div class="modal-body">
                                <div class="return-report-summary mb-3">
                                    <span>Kỳ báo cáo</span>
                                    <strong>{{ getKyDisplay(returnTarget) }}</strong>
                                    <span>Chỉ tiêu</span>
                                    <strong>{{ getChiTieuDisplay(returnTarget) }}</strong>
                                </div>
                                <label class="form-label">Lý do gửi trả</label>
                                <textarea v-model.trim="returnReason" class="form-control" rows="5"
                                    placeholder="Nhập lý do cần điều chỉnh số liệu hoặc nội dung báo cáo..."></textarea>
                            </div>

                            <div class="modal-footer border-0 pt-0">
                                <button class="btn btn-light" @click="closeReturnModal">Hủy</button>
                                <button v-if="canReturnPendingReports" class="btn btn-danger" :disabled="processingId === getId(returnTarget)"
                                    @click="submitReturn">
                                    <span v-if="processingId === getId(returnTarget)"
                                        class="spinner-border spinner-border-sm me-2"></span>
                                    Gửi trả
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </BaseLayout>
</template>

<script setup>
    import { computed, onMounted, reactive, ref } from 'vue'
    import BaseLayout from '../BaseLayout.vue'
    import ColumnVisibilityTools from '../shared/ColumnVisibilityTools.vue'
    import httpClient from '../../services/httpClient'
    import { canAccessPermission, getStoredUserPermissions, getStoredUserProfile } from '../../utils/accessControl'

    const API_PATH = '/TheoDoiThucHienKPI'
    const PENDING_STATUS = 'CHO_XET_DUYET'

    const items = ref([])
    const loading = ref(false)
    const processingId = ref(null)
    const selectedItem = ref(null)
    const returnTarget = ref(null)
    const returnReason = ref('')
    const returnOptions = ref({})
    const currentProfile = getStoredUserProfile()
    const currentPermissions = getStoredUserPermissions()
    const canViewPendingReportDetails = canAccessPermission(currentPermissions, 'ViewPendingReportDetails', currentProfile)
    const canApprovePendingReports = canAccessPermission(currentPermissions, 'ApprovePendingReports', currentProfile)
    const canReturnPendingReports = canAccessPermission(currentPermissions, 'ReturnPendingReports', currentProfile)
    const detailForm = reactive({
        giaTriPhatSinhTrongKy: 0,
        giaTriThucHienTrongKy: 0,
        nhanXet: ''
    })
    const qualitativeOptions = [
        { value: 'KHONG_XAY_RA', label: 'Không xảy ra' },
        { value: 'DAM_BAO', label: 'Đảm bảo' },
        { value: 'DAT_100', label: 'Đạt 100%' },
        { value: 'XAY_RA', label: 'Xảy ra' },
        { value: 'KHONG_DAM_BAO', label: 'Không đảm bảo' },
        { value: 'KHONG_DAT', label: 'Không đạt' }
    ]
    const filters = reactive({
        kyBaoCaoKPIId: '',
        tenDonViNhan: '',
        chiTietGiaoChiTieuId: '',
        keyword: ''
    })

    const normalizeList = (response) => {
        const data = response?.data ?? response
        if (Array.isArray(data)) return data
        if (Array.isArray(data?.items)) return data.items
        if (Array.isArray(data?.data)) return data.data
        return []
    }

    const getId = (item) => Number(item?.Id ?? item?.id ?? 0)

    const normalizeText = (value) => String(value || '').trim().toLowerCase()
    const normalizeCode = (value) => String(value || '').trim().toUpperCase()

    const isPending = (item) => {
        const status = item?.TrangThai ?? item?.trangThai ?? ''
        return String(status).trim().toUpperCase() === PENDING_STATUS
    }

    const getKyDisplay = (item) => {
        return item?.TenKy || item?.tenKy || item?.MaKy || item?.maKy || '-'
    }

    const getChiTieuDisplay = (item) => {
        const code = item?.MaChiTieu || item?.maChiTieu || ''
        const name = item?.TenChiTieu || item?.tenChiTieu || '-'
        return code ? `${code} - ${name}` : name
    }

    const getChiTieuOptionLabel = (item) => item?.TenChiTieu || item?.tenChiTieu || '-'

    const selectedIsDinhTinh = computed(() =>
        normalizeCode(selectedItem.value?.TieuChiDanhGia ?? selectedItem.value?.tieuChiDanhGia) === 'DINH_TINH'
    )

    const pendingItems = computed(() => items.value.filter(isPending))

    const kyBaoCaoOptions = computed(() => {
        const map = new Map()
        pendingItems.value.forEach((item) => {
            const id = Number(item.KyBaoCaoKPIId ?? item.kyBaoCaoKPIId ?? 0)
            if (id > 0 && !map.has(id)) {
                map.set(id, { id, label: getKyDisplay(item) })
            }
        })
        return [...map.values()].sort((a, b) => a.label.localeCompare(b.label, 'vi'))
    })

    const donViOptions = computed(() => {
        return [...new Set(
            pendingItems.value
                .map((item) => item.TenDonViNhan || item.tenDonViNhan || '')
                .filter(Boolean)
        )].sort((a, b) => a.localeCompare(b, 'vi'))
    })

    const chiTieuOptions = computed(() => {
        const map = new Map()
        pendingItems.value.forEach((item) => {
            const id = Number(item.ChiTietGiaoChiTieuId ?? item.chiTietGiaoChiTieuId ?? 0)
            if (id > 0 && !map.has(id)) {
                map.set(id, { id, label: getChiTieuOptionLabel(item) })
            }
        })
        return [...map.values()].sort((a, b) => a.label.localeCompare(b.label, 'vi'))
    })

    const filteredItems = computed(() => {
        const keyword = normalizeText(filters.keyword)

        return pendingItems.value.filter((item) => {
            const kyId = String(item.KyBaoCaoKPIId ?? item.kyBaoCaoKPIId ?? '')
            const chiTietId = String(item.ChiTietGiaoChiTieuId ?? item.chiTietGiaoChiTieuId ?? '')
            const donVi = item.TenDonViNhan || item.tenDonViNhan || ''
            const searchable = normalizeText([
                item.MaKy || item.maKy,
                item.TenKy || item.tenKy,
                item.MaChiTieu || item.maChiTieu,
                item.TenChiTieu || item.tenChiTieu,
                donVi,
                item.NhanXet || item.nhanXet
            ].join(' '))

            return (!filters.kyBaoCaoKPIId || filters.kyBaoCaoKPIId === kyId)
                && (!filters.tenDonViNhan || filters.tenDonViNhan === donVi)
                && (!filters.chiTietGiaoChiTieuId || filters.chiTietGiaoChiTieuId === chiTietId)
                && (!keyword || searchable.includes(keyword))
        })
    })

    const fetchItems = async () => {
        try {
            loading.value = true
            const response = await httpClient.get(API_PATH)
            items.value = normalizeList(response)
        } catch (error) {
            console.error('fetch pending reports error:', error?.response?.status, error?.config?.url, error)
            items.value = []
            alert(error?.response?.data?.message || 'Tải danh sách báo cáo chờ xét duyệt thất bại.')
        } finally {
            loading.value = false
        }
    }

    const openDetailModal = (item) => {
        if (!canViewPendingReportDetails) return
        selectedItem.value = item
        detailForm.giaTriPhatSinhTrongKy = Number(item.GiaTriPhatSinhTrongKy ?? item.giaTriPhatSinhTrongKy ?? 0)
        detailForm.giaTriThucHienTrongKy = Number(item.GiaTriThucHienTrongKy ?? item.giaTriThucHienTrongKy ?? 0)
        detailForm.nhanXet = item.NhanXet ?? item.nhanXet ?? ''
    }

    const closeDetailModal = () => {
        selectedItem.value = null
        detailForm.giaTriPhatSinhTrongKy = 0
        detailForm.giaTriThucHienTrongKy = 0
        detailForm.nhanXet = ''
    }

    const validateDetailForm = () => {
        if (selectedIsDinhTinh.value) {
            if (!detailForm.nhanXet) {
                alert('Vui lòng chọn kết quả đánh giá định tính.')
                return false
            }

            return true
        }

        if (Number(detailForm.giaTriPhatSinhTrongKy) < 0) {
            alert('Giá trị phát sinh trong kỳ không được nhỏ hơn 0.')
            return false
        }

        if (Number(detailForm.giaTriThucHienTrongKy) < 0) {
            alert('Giá trị thực hiện trong kỳ không được nhỏ hơn 0.')
            return false
        }

        return true
    }

    const buildUpdatePayload = (item) => ({
        chiTietGiaoChiTieuId: Number(item.ChiTietGiaoChiTieuId ?? item.chiTietGiaoChiTieuId ?? 0),
        kyBaoCaoKPIId: Number(item.KyBaoCaoKPIId ?? item.kyBaoCaoKPIId ?? 0),
        giaTriDauKy: item.GiaTriDauKy ?? item.giaTriDauKy ?? 0,
        giaTriPhatSinhTrongKy: selectedIsDinhTinh.value ? null : Number(detailForm.giaTriPhatSinhTrongKy || 0),
        giaTriThucHienTrongKy: selectedIsDinhTinh.value ? 0 : Number(detailForm.giaTriThucHienTrongKy || 0),
        nhanXet: detailForm.nhanXet
    })

    const approveItem = async (item) => {
        if (!canApprovePendingReports) return
        const id = getId(item)
        if (!id) return

        const ok = window.confirm('Chấp nhận báo cáo này và ghi nhận kết quả?')
        if (!ok) return

        try {
            processingId.value = id
            await httpClient.post(`${API_PATH}/${id}/approve`)
            await fetchItems()
        } catch (error) {
            console.error('approve pending report error:', error?.response?.status, error?.config?.url, error)
            alert(error?.response?.data?.message || 'Chấp nhận báo cáo thất bại.')
        } finally {
            processingId.value = null
        }
    }

    const saveAndApproveItem = async (item) => {
        if (!canApprovePendingReports) return
        const id = getId(item)
        if (!id) return
        if (!validateDetailForm()) return

        const ok = window.confirm('Lưu số liệu đã chỉnh và chấp nhận báo cáo này?')
        if (!ok) return

        try {
            processingId.value = id
            await httpClient.put(`${API_PATH}/${id}`, buildUpdatePayload(item))
            await httpClient.post(`${API_PATH}/${id}/approve`)
            closeDetailModal()
            await fetchItems()
        } catch (error) {
            console.error('save and approve pending report error:', error?.response?.status, error?.config?.url, error)
            alert(error?.response?.data?.message || 'Lưu và chấp nhận báo cáo thất bại.')
        } finally {
            processingId.value = null
        }
    }

    const openReturnModal = (item, options = {}) => {
        if (!canReturnPendingReports) return
        returnTarget.value = item
        returnReason.value = ''
        returnOptions.value = options
    }

    const closeReturnModal = () => {
        returnTarget.value = null
        returnReason.value = ''
        returnOptions.value = {}
    }

    const submitReturn = async () => {
        if (!canReturnPendingReports) return
        const item = returnTarget.value
        const id = getId(item)
        if (!id) return

        const lyDo = returnReason.value.trim()
        if (!lyDo) {
            alert('Vui lòng nhập lý do gửi trả báo cáo.')
            return
        }

        try {
            processingId.value = id
            await httpClient.post(`${API_PATH}/${id}/return-for-reentry`, { lyDo })
            const shouldCloseDetail = returnOptions.value?.closeModal
            closeReturnModal()
            if (shouldCloseDetail) {
                closeDetailModal()
            }
            await fetchItems()
            window.dispatchEvent(new Event('returned-reports-updated'))
        } catch (error) {
            console.error('return pending report error:', error?.response?.status, error?.config?.url, error)
            alert(error?.response?.data?.message || 'Gửi trả yêu cầu nhập lại thất bại.')
        } finally {
            processingId.value = null
        }
    }

    const resetFilters = () => {
        filters.kyBaoCaoKPIId = ''
        filters.tenDonViNhan = ''
        filters.chiTietGiaoChiTieuId = ''
        filters.keyword = ''
    }

    const formatNumber = (value) => {
        if (value === null || value === undefined || value === '') return '-'
        return Number(value).toLocaleString('vi-VN')
    }

    onMounted(fetchItems)
</script>

<style scoped>
    .page-wrap {
        min-height: 100vh;
        background: linear-gradient(180deg, #f8fbff 0%, #eef5fb 100%);
    }

    .gov-banner {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 20px 24px;
        border-radius: 20px;
        background: linear-gradient(135deg, #ffffff 0%, #f4f9ff 100%);
        box-shadow: 0 10px 30px rgba(13, 110, 253, 0.08);
        border: 1px solid rgba(13, 110, 253, 0.08);
    }

    .gov-emblem {
        width: 64px;
        height: 64px;
        border-radius: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #0d6efd, #4ea1ff);
        color: #fff;
        font-size: 1.6rem;
        flex-shrink: 0;
    }

    .gov-text {
        flex: 1;
    }

    .gov-title {
        font-size: 1.3rem;
        font-weight: 800;
        color: #1f2d3d;
        line-height: 1.3;
    }

    .gov-sub {
        color: #6b7280;
        margin-top: 4px;
        font-size: 0.95rem;
    }

    .custom-card {
        border: 0;
        border-radius: 20px;
        box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
        overflow: hidden;
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
        border-color: #89d2ef;
        box-shadow: 0 0 0 0.2rem rgba(137, 210, 239, 0.2);
    }

    .form-label {
        font-weight: 600;
        color: #334155;
        margin-bottom: 0.45rem;
    }

    :deep(.table) {
        margin-bottom: 0;
        border-collapse: collapse;
    }

    :deep(.table thead th) {
        background: #f8fafc;
        color: #334155;
        font-weight: 700;
        white-space: nowrap;
        border-bottom: 2px solid #dee2e6;
    }

    :deep(.table th),
    :deep(.table td) {
        padding: 14px 16px;
        vertical-align: middle;
        border-right: 1px solid #eee;
    }

    :deep(.table th:last-child),
    :deep(.table td:last-child) {
        border-right: none;
    }

    .status-badge {
        background: #fff3cd;
        color: #8a5a00;
        border: 1px solid #ffe08a;
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
        background: rgba(15, 23, 42, 0.32);
    }

    .detail-grid,
    .edit-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 12px;
    }

    .detail-item {
        padding: 14px;
        border: 1px solid #e2e8f0;
        border-radius: 14px;
        background: #f8fafc;
    }

    .detail-item span {
        display: block;
        color: #64748b;
        font-size: 0.85rem;
        margin-bottom: 6px;
    }

    .detail-item strong {
        color: #1f2937;
        line-height: 1.4;
    }

    .return-report-summary {
        display: grid;
        grid-template-columns: 110px 1fr;
        gap: 8px 12px;
        padding: 14px;
        border: 1px solid #e2e8f0;
        border-radius: 14px;
        background: #f8fafc;
    }

    .return-report-summary span {
        color: #64748b;
        font-size: 0.85rem;
        font-weight: 700;
    }

    .return-report-summary strong {
        color: #1f2937;
        line-height: 1.4;
    }

    textarea.form-control {
        min-height: 110px;
        resize: vertical;
    }

    @media (max-width: 768px) {
        .gov-banner {
            padding: 16px;
            align-items: flex-start;
        }

        .gov-title {
            font-size: 1.05rem;
        }
    }
</style>
