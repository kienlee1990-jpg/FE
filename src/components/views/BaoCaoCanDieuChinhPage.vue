<template>
    <BaseLayout>
        <div class="page-wrap">
            <div class="container-fluid py-4">
                <div class="gov-banner mb-4">
                    <div class="gov-emblem">
                        <i class="bi bi-arrow-counterclockwise"></i>
                    </div>
                    <div class="gov-text">
                        <div class="gov-title">BÁO CÁO CẦN ĐIỀU CHỈNH</div>
                        <div class="gov-sub">Các báo cáo của đơn vị cần điều chỉnh và gửi lại xét duyệt</div>
                    </div>
                </div>

                <div class="card custom-card">
                    <div class="card-header bg-white d-flex justify-content-between align-items-center border-0">
                        <div>
                            <h5 class="mb-1">Danh sách báo cáo cần điều chỉnh</h5>
                            <small class="text-muted">{{ returnedReportScopeText }}</small>
                        </div>
                        <span class="badge text-bg-danger border">Tổng: {{ returnedItems.length }}</span>
                    </div>

                    <div class="card-body p-0">
                        <div v-if="loading" class="empty-state">
                            <div class="spinner-border text-primary mb-3" role="status"></div>
                            <div>Đang tải dữ liệu...</div>
                        </div>

                        <div v-else-if="!returnedItems.length" class="empty-state">
                            <i class="bi bi-inbox fs-1 text-muted mb-2"></i>
                            <div>Không có báo cáo cần điều chỉnh</div>
                        </div>

                        <div v-else class="table-responsive">
                            <ColumnVisibilityTools table-id="BaoCaoCanDieuChinhPage-table" />
                            <table id="BaoCaoCanDieuChinhPage-table"
                                class="table table-hover align-middle mb-0 custom-table managed-table">
                                <thead>
                                    <tr>
                                        <th>Kỳ báo cáo</th>
                                        <th v-if="canViewAllReturnedReports">Đơn vị thực hiện</th>
                                        <th>Danh mục chỉ tiêu</th>
                                        <th>Thực hiện trong kỳ</th>
                                        <th>Nhận xét</th>
                                        <th>Trạng thái</th>
                                        <th class="text-center" style="width: 190px">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="item in returnedItems" :key="getId(item)">
                                        <td v-if="canViewAllReturnedReports">
                                            {{ item.TenDonViNhan || item.tenDonViNhan || '-' }}
                                        </td>
                                        <td>
                                            <div class="fw-semibold">{{ getKyDisplay(item) }}</div>
                                            <small class="text-muted">{{ item.MaKy || item.maKy || '' }}</small>
                                        </td>
                                        <td>
                                            <div class="fw-semibold text-primary">{{ getChiTieuDisplay(item) }}</div>
                                            <small v-if="item.MaChiTieu || item.maChiTieu" class="text-muted">
                                                {{ item.MaChiTieu || item.maChiTieu }}
                                            </small>
                                        </td>
                                        <td>{{ formatNumber(item.GiaTriThucHienTrongKy ?? item.giaTriThucHienTrongKy) }}</td>
                                        <td>{{ item.NhanXet || item.nhanXet || '-' }}</td>
                                        <td><span class="badge status-badge">Cần điều chỉnh</span></td>
                                        <td class="text-center">
                                            <div class="d-flex justify-content-center gap-2">
                                                <button class="btn btn-sm btn-outline-primary" @click="openViewModal(item)">
                                                    <i class="bi bi-eye me-1"></i>Xem lại
                                                </button>
                                                <button class="btn btn-sm btn-outline-danger"
                                                    :disabled="processingId === getId(item)"
                                                    @click="deleteItem(item)">
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

                <div v-if="selectedItem" class="modal fade show d-block custom-modal" tabindex="-1"
                    @click.self="closeViewModal">
                    <div class="modal-dialog modal-lg modal-dialog-centered">
                        <div class="modal-content border-0 shadow-lg rounded-4">
                            <div class="modal-header border-0 pb-0">
                                <div>
                                    <h4 class="modal-title mb-1">Xem lại báo cáo cần điều chỉnh</h4>
                                    <p class="text-muted mb-0">Điều chỉnh số liệu trước khi gửi lại xét duyệt</p>
                                </div>
                                <button type="button" class="btn-close" @click="closeViewModal"></button>
                            </div>

                            <div class="modal-body">
                                <div class="detail-grid">
                                    <div class="detail-item">
                                        <span>Kỳ báo cáo</span>
                                        <strong>{{ getKyDisplay(selectedItem) }}</strong>
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
                                        <span>Cuối kỳ</span>
                                        <strong>{{ formatNumber(selectedItem.GiaTriCuoiKy ?? selectedItem.giaTriCuoiKy) }}</strong>
                                    </div>
                                    <div class="detail-item">
                                        <span>Lũy kế</span>
                                        <strong>{{ formatNumber(selectedItem.GiaTriLuyKe ?? selectedItem.giaTriLuyKe) }}</strong>
                                    </div>
                                </div>

                                <div v-if="!selectedIsDinhTinh" class="edit-grid mt-3">
                                    <div class="form-field">
                                        <label class="form-label">Giá trị phát sinh trong kỳ</label>
                                        <input v-model.number="editForm.giaTriPhatSinhTrongKy" type="number" min="0"
                                            step="0.01" class="form-control" />
                                    </div>
                                    <div class="form-field">
                                        <label class="form-label">Giá trị thực hiện trong kỳ</label>
                                        <input v-model.number="editForm.giaTriThucHienTrongKy" type="number" min="0"
                                            step="0.01" class="form-control" />
                                    </div>
                                </div>

                                <div v-if="selectedIsDinhTinh" class="form-field mt-3">
                                    <label class="form-label">Kết quả đánh giá định tính</label>
                                    <select v-model="editForm.nhanXet" class="form-control">
                                        <option value="">Chọn kết quả đánh giá</option>
                                        <option v-for="option in qualitativeOptions" :key="option.value"
                                            :value="option.value">
                                            {{ option.label }}
                                        </option>
                                    </select>
                                </div>

                                <div v-else class="form-field mt-3">
                                    <label class="form-label">Nhận xét</label>
                                    <textarea v-model.trim="editForm.nhanXet" class="form-control" rows="4"></textarea>
                                </div>
                            </div>

                            <div class="modal-footer border-0 pt-0">
                                <button class="btn btn-light" @click="closeViewModal">Đóng</button>
                                <button class="btn btn-primary" :disabled="processingId === getId(selectedItem)"
                                    @click="saveAndResubmitItem(selectedItem)">
                                    <span v-if="processingId === getId(selectedItem)"
                                        class="spinner-border spinner-border-sm me-2"></span>
                                    Gửi lại xét duyệt
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
    import { getStoredUserProfile, isCatpProfile, isPrivilegedProfile } from '../../utils/accessControl'

    const API_PATH = '/TheoDoiThucHienKPI'
    const RETURNED_STATUS = 'TRA_LAI_NHAP_LAI'

    const items = ref([])
    const loading = ref(false)
    const processingId = ref(null)
    const selectedItem = ref(null)
    const editForm = reactive({
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
    const currentProfile = getStoredUserProfile()
    const currentDonViId = Number(currentProfile?.donViId || 0)
    const canViewAllReturnedReports = computed(() => isPrivilegedProfile(currentProfile) || isCatpProfile(currentProfile))
    const returnedReportScopeText = computed(() =>
        canViewAllReturnedReports.value
            ? 'Hiển thị tất cả báo cáo cần điều chỉnh trong hệ thống'
            : 'Chỉ hiển thị dữ liệu của đơn vị đang đăng nhập'
    )

    const normalizeList = (response) => {
        const data = response?.data ?? response
        if (Array.isArray(data)) return data
        if (Array.isArray(data?.items)) return data.items
        if (Array.isArray(data?.data)) return data.data
        return []
    }

    const getId = (item) => Number(item?.Id ?? item?.id ?? 0)

    const isReturned = (item) => {
        const status = item?.TrangThai ?? item?.trangThai ?? ''
        return String(status).trim().toUpperCase() === RETURNED_STATUS
    }

    const belongsToCurrentUnit = (item) => {
        const donViNhanId = Number(item?.DonViNhanId ?? item?.donViNhanId ?? 0)
        return currentDonViId > 0 && donViNhanId === currentDonViId
    }

    const returnedItems = computed(() => items.value.filter((item) =>
        isReturned(item) && (canViewAllReturnedReports.value || belongsToCurrentUnit(item))
    ))

    const getKyDisplay = (item) => item?.TenKy || item?.tenKy || item?.MaKy || item?.maKy || '-'

    const getChiTieuDisplay = (item) => {
        const code = item?.MaChiTieu || item?.maChiTieu || ''
        const name = item?.TenChiTieu || item?.tenChiTieu || '-'
        return code ? `${code} - ${name}` : name
    }

    const normalizeCode = (value) => String(value || '').trim().toUpperCase()

    const selectedIsDinhTinh = computed(() => {
        return normalizeCode(selectedItem.value?.TieuChiDanhGia ?? selectedItem.value?.tieuChiDanhGia) === 'DINH_TINH'
    })

    const fetchItems = async () => {
        try {
            loading.value = true
            const response = await httpClient.get(API_PATH)
            items.value = normalizeList(response)
        } catch (error) {
            console.error('fetch returned reports error:', error?.response?.status, error?.config?.url, error)
            items.value = []
            alert(error?.response?.data?.message || 'Tải danh sách báo cáo cần điều chỉnh thất bại.')
        } finally {
            loading.value = false
        }
    }

    const openViewModal = (item) => {
        selectedItem.value = item
        editForm.giaTriPhatSinhTrongKy = Number(item.GiaTriPhatSinhTrongKy ?? item.giaTriPhatSinhTrongKy ?? 0)
        editForm.giaTriThucHienTrongKy = Number(item.GiaTriThucHienTrongKy ?? item.giaTriThucHienTrongKy ?? 0)
        editForm.nhanXet = item.NhanXet ?? item.nhanXet ?? ''
    }

    const closeViewModal = () => {
        selectedItem.value = null
        editForm.giaTriPhatSinhTrongKy = 0
        editForm.giaTriThucHienTrongKy = 0
        editForm.nhanXet = ''
    }

    const validateEditForm = () => {
        if (selectedIsDinhTinh.value) {
            if (!editForm.nhanXet) {
                alert('Vui lòng chọn kết quả đánh giá định tính.')
                return false
            }

            return true
        }

        if (Number(editForm.giaTriPhatSinhTrongKy) < 0) {
            alert('Giá trị phát sinh trong kỳ không được nhỏ hơn 0.')
            return false
        }

        if (Number(editForm.giaTriThucHienTrongKy) < 0) {
            alert('Giá trị thực hiện trong kỳ không được nhỏ hơn 0.')
            return false
        }

        return true
    }

    const buildUpdatePayload = (item) => ({
        chiTietGiaoChiTieuId: Number(item.ChiTietGiaoChiTieuId ?? item.chiTietGiaoChiTieuId ?? 0),
        kyBaoCaoKPIId: Number(item.KyBaoCaoKPIId ?? item.kyBaoCaoKPIId ?? 0),
        giaTriDauKy: item.GiaTriDauKy ?? item.giaTriDauKy ?? 0,
        giaTriPhatSinhTrongKy: selectedIsDinhTinh.value ? null : Number(editForm.giaTriPhatSinhTrongKy || 0),
        giaTriThucHienTrongKy: selectedIsDinhTinh.value ? 0 : Number(editForm.giaTriThucHienTrongKy || 0),
        nhanXet: editForm.nhanXet
    })

    const saveAndResubmitItem = async (item) => {
        const id = getId(item)
        if (!id) return
        if (!validateEditForm()) return

        const ok = window.confirm('Lưu số liệu đã chỉnh và gửi lại báo cáo này để chờ xét duyệt?')
        if (!ok) return

        try {
            processingId.value = id
            await httpClient.put(`${API_PATH}/${id}`, buildUpdatePayload(item))
            await httpClient.post(`${API_PATH}/${id}/resubmit-returned`)
            closeViewModal()
            await fetchItems()
            window.dispatchEvent(new Event('returned-reports-updated'))
        } catch (error) {
            console.error('resubmit returned report error:', error?.response?.status, error?.config?.url, error)
            alert(error?.response?.data?.message || 'Gửi lại báo cáo thất bại.')
        } finally {
            processingId.value = null
        }
    }

    const deleteItem = async (item) => {
        const id = getId(item)
        if (!id) return

        const ok = window.confirm('Xóa báo cáo cần điều chỉnh này?')
        if (!ok) return

        try {
            processingId.value = id
            await httpClient.delete(`${API_PATH}/${id}`)
            await fetchItems()
            window.dispatchEvent(new Event('returned-reports-updated'))
        } catch (error) {
            console.error('delete returned report error:', error?.response?.status, error?.config?.url, error)
            alert(error?.response?.data?.message || 'Xóa báo cáo cần điều chỉnh thất bại.')
        } finally {
            processingId.value = null
        }
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
        background: linear-gradient(135deg, #dc3545, #f27482);
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

    .status-badge {
        background: #f8d7da;
        color: #842029;
        border: 1px solid #f1aeb5;
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

    .detail-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 12px;
    }

    .edit-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 12px;
    }

    .detail-item,
    .return-note {
        padding: 14px;
        border: 1px solid #e2e8f0;
        border-radius: 14px;
        background: #f8fafc;
    }

    .detail-item span,
    .return-note span {
        display: block;
        color: #64748b;
        font-size: 0.85rem;
        margin-bottom: 6px;
    }

    .detail-item strong,
    .return-note strong {
        color: #1f2937;
        line-height: 1.4;
    }

    .form-control {
        border-radius: 12px;
        min-height: 44px;
        border-color: #dbe2ea;
        box-shadow: none;
    }

    textarea.form-control {
        min-height: 110px;
        resize: vertical;
    }
</style>
