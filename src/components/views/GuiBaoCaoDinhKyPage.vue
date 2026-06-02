<template>
    <BaseLayout>
        <div class="page-wrap">
            <div class="container-fluid py-4">
                <div class="gov-banner mb-4">
                    <div class="gov-emblem">
                        <i class="bi bi-send-check"></i>
                    </div>
                    <div class="gov-text">
                        <div class="gov-title">GỬI BÁO CÁO ĐỊNH KỲ</div>
                        <div class="gov-sub">Danh sách báo cáo đã nhập số liệu nhưng chưa gửi xét duyệt</div>
                    </div>
                </div>

                <div class="d-flex justify-content-end mb-4">
                    <button v-if="canCreatePeriodicReports" class="btn btn-primary btn-action" @click="openCreateReport">
                        <i class="bi bi-plus-circle me-2"></i>
                        Nhập báo cáo định kỳ
                    </button>
                </div>

                <div class="summary-grid mb-4">
                    <div class="summary-card">
                        <span class="label">Chờ gửi</span>
                        <strong>{{ waitingItems.length }}</strong>
                    </div>
                    <div class="summary-card">
                        <span class="label">Đang hiển thị</span>
                        <strong>{{ filteredItems.length }}</strong>
                    </div>
                    <div class="summary-card">
                        <span class="label">Đơn vị</span>
                        <strong>{{ canManageAllUnits ? donViOptions.length : currentUnitName }}</strong>
                    </div>
                </div>

                <div class="card custom-card mb-4">
                    <div class="card-header bg-white border-0 pb-0">
                        <h5 class="mb-1">Bộ lọc tìm kiếm</h5>
                        <small class="text-muted">Lọc các báo cáo đang nằm trong danh sách chờ gửi</small>
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
                                <select v-model="filters.donViNhanId" class="form-select" :disabled="!canManageAllUnits">
                                    <option value="">{{ canManageAllUnits ? 'Tất cả' : currentUnitName }}</option>
                                    <option v-for="item in donViOptions" :key="item.id" :value="String(item.id)">
                                        {{ item.label }}
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
                                    placeholder="Mã kỳ, tên chỉ tiêu, đơn vị, ghi chú..." />
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
                    <div class="card-header bg-white border-0">
                        <div class="d-flex flex-column flex-lg-row justify-content-between align-items-start gap-3">
                            <div>
                                <h5 class="mb-1">Danh sách báo cáo chờ gửi</h5>
                                <small class="text-muted">Bấm gửi để chuyển báo cáo sang danh sách chờ xét duyệt</small>
                                <div v-if="canSendPeriodicReports && filteredItems.length" class="bulk-actions mt-3">
                                    <label class="select-all-control">
                                        <input v-model="allVisibleSelected" class="form-check-input" type="checkbox" />
                                        <span>Chọn tất cả đang hiển thị</span>
                                    </label>
                                    <button class="btn btn-sm btn-primary" type="button"
                                        :disabled="bulkSending || selectedVisibleCount === 0"
                                        @click="sendSelectedItems">
                                        <span v-if="bulkSending" class="spinner-border spinner-border-sm me-1"></span>
                                        <i v-else class="bi bi-send-check me-1"></i>
                                        Gửi đã chọn ({{ selectedVisibleCount }})
                                    </button>
                                    <button class="btn btn-sm btn-outline-primary" type="button"
                                        :disabled="bulkSending || filteredItems.length === 0"
                                        @click="sendAllItems">
                                        <i class="bi bi-send-fill me-1"></i>
                                        Gửi tất cả
                                    </button>
                                </div>
                            </div>
                            <span class="badge text-bg-light border">Tổng: {{ filteredItems.length }}</span>
                        </div>
                    </div>

                    <div class="card-body p-0">
                        <div v-if="loading" class="empty-state">
                            <div class="spinner-border text-primary mb-3" role="status"></div>
                            <div>Đang tải dữ liệu...</div>
                        </div>

                        <div v-else-if="!filteredItems.length" class="empty-state">
                            <i class="bi bi-inbox fs-1 text-muted mb-2"></i>
                            <div>Không có báo cáo chờ gửi</div>
                        </div>

                        <div v-else class="table-responsive">
                            <ColumnVisibilityTools table-id="GuiBaoCaoDinhKyPage-table" />
                            <table id="GuiBaoCaoDinhKyPage-table"
                                class="table table-hover align-middle mb-0 custom-table managed-table">
                                <thead>
                                    <tr>
                                        <th v-if="canSendPeriodicReports" class="text-center" style="width: 56px">
                                            <input v-model="allVisibleSelected" class="form-check-input" type="checkbox"
                                                aria-label="Chọn tất cả báo cáo đang hiển thị" />
                                        </th>
                                        <th>Kỳ báo cáo</th>
                                        <th>Đơn vị thực hiện</th>
                                        <th>Danh mục chỉ tiêu</th>
                                        <th>Đầu kỳ</th>
                                        <th>Kết quả nhập</th>
                                        <th>Phát sinh trong kỳ</th>
                                        <th>Ghi chú</th>
                                        <th>Trạng thái</th>
                                        <th class="text-center" style="width: 260px">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="item in filteredItems" :key="getId(item)">
                                        <td v-if="canSendPeriodicReports" class="text-center">
                                            <input v-model="selectedReportIds" class="form-check-input" type="checkbox"
                                                :value="getId(item)" :aria-label="`Chọn báo cáo ${getChiTieuDisplay(item)}`" />
                                        </td>
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
                                        <td>{{ formatNumber(item.GiaTriPhatSinhTrongKy ?? item.giaTriPhatSinhTrongKy) }}</td>
                                        <td>{{ item.NhanXet || item.nhanXet || '-' }}</td>
                                        <td>
                                            <span class="badge text-bg-warning">Chờ gửi</span>
                                        </td>
                                        <td class="table-actions-cell">
                                            <div class="row-actions has-three-actions">
                                                <button v-if="canSendPeriodicReports" class="action-btn action-send" :disabled="processingId === getId(item)"
                                                    title="Gửi báo cáo" @click="sendItem(item)">
                                                    <span v-if="processingId === getId(item)"
                                                        class="spinner-border spinner-border-sm me-1"></span>
                                                    <span v-else class="action-icon">
                                                        <i class="bi bi-send"></i>
                                                    </span>
                                                    <span>Gửi</span>
                                                </button>
                                                <button v-if="canEditPeriodicReports" class="action-btn action-edit"
                                                    :disabled="processingId === getId(item)" title="Sửa báo cáo"
                                                    @click="editItem(item)">
                                                    <span class="action-icon">
                                                        <i class="bi bi-pencil-square"></i>
                                                    </span>
                                                    <span>Sửa</span>
                                                </button>
                                                <button v-if="canDeletePeriodicReports" class="action-btn action-delete"
                                                    :disabled="processingId === getId(item)" title="Xóa báo cáo"
                                                    @click="deleteItem(item)">
                                                    <span class="action-icon">
                                                        <i class="bi bi-trash"></i>
                                                    </span>
                                                    <span>Xóa</span>
                                                </button>
                                                <span v-if="!canSendPeriodicReports && !canEditPeriodicReports && !canDeletePeriodicReports" class="text-muted small">Chá»‰ xem</span>
                                            </div>
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
    import { useRouter } from 'vue-router'
    import BaseLayout from '../BaseLayout.vue'
    import ColumnVisibilityTools from '../shared/ColumnVisibilityTools.vue'
    import httpClient from '../../services/httpClient'
    import { canAccessPermission, canBypassUnitFilter, getStoredUserPermissions, getStoredUserProfile } from '../../utils/accessControl'

    const API_PATH = '/TheoDoiThucHienKPI'
    const WAITING_SEND_STATUS = 'CHO_GUI'
    const router = useRouter()

    const items = ref([])
    const loading = ref(false)
    const processingId = ref(null)
    const bulkSending = ref(false)
    const selectedReportIds = ref([])
    const currentProfile = ref(getStoredUserProfile())
    const currentPermissions = getStoredUserPermissions()
    const canCreatePeriodicReports = canAccessPermission(currentPermissions, 'CreatePeriodicReports', currentProfile.value)
    const canSendPeriodicReports = canAccessPermission(currentPermissions, 'SendPeriodicReports', currentProfile.value)
    const canEditPeriodicReports = canAccessPermission(currentPermissions, 'EditPeriodicReports', currentProfile.value)
    const canDeletePeriodicReports = canAccessPermission(currentPermissions, 'DeletePeriodicReports', currentProfile.value)

    const filters = reactive({
        kyBaoCaoKPIId: '',
        donViNhanId: '',
        chiTietGiaoChiTieuId: '',
        keyword: ''
    })

    const currentDonViId = computed(() => Number(currentProfile.value?.donViId || 0))
    const currentUnitName = computed(() => currentProfile.value?.donVi || 'Đơn vị hiện tại')
    const canManageAllUnits = computed(() => canBypassUnitFilter(currentProfile.value))

    const normalizeList = (response) => {
        const data = response?.data ?? response
        if (Array.isArray(data)) return data
        if (Array.isArray(data?.items)) return data.items
        if (Array.isArray(data?.data)) return data.data
        return []
    }

    const getId = (item) => Number(item?.Id ?? item?.id ?? 0)

    const normalizeText = (value) => String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .trim()
        .toLowerCase()

    const getStatus = (item) => String(item?.TrangThai ?? item?.trangThai ?? '').trim().toUpperCase()

    const getKyDisplay = (item) => item?.TenKy || item?.tenKy || item?.MaKy || item?.maKy || '-'

    const getChiTieuDisplay = (item) => {
        const code = item?.MaChiTieu || item?.maChiTieu || ''
        const name = item?.TenChiTieu || item?.tenChiTieu || '-'
        return code ? `${code} - ${name}` : name
    }

    const getChiTieuOptionLabel = (item) => item?.TenChiTieu || item?.tenChiTieu || '-'

    const waitingItems = computed(() => {
        return items.value.filter((item) => {
            if (getStatus(item) !== WAITING_SEND_STATUS) return false

            if (!canManageAllUnits.value) {
                const donViNhanId = Number(item.DonViNhanId ?? item.donViNhanId ?? 0)
                return currentDonViId.value > 0 && donViNhanId === currentDonViId.value
            }

            return true
        })
    })

    const kyBaoCaoOptions = computed(() => {
        const map = new Map()
        waitingItems.value.forEach((item) => {
            const id = Number(item.KyBaoCaoKPIId ?? item.kyBaoCaoKPIId ?? 0)
            if (id > 0 && !map.has(id)) {
                map.set(id, { id, label: getKyDisplay(item) })
            }
        })
        return [...map.values()].sort((a, b) => a.label.localeCompare(b.label, 'vi'))
    })

    const donViOptions = computed(() => {
        const map = new Map()
        waitingItems.value.forEach((item) => {
            const id = Number(item.DonViNhanId ?? item.donViNhanId ?? 0)
            const label = item.TenDonViNhan || item.tenDonViNhan || ''
            if (id > 0 && label && !map.has(id)) {
                map.set(id, { id, label })
            }
        })
        return [...map.values()].sort((a, b) => a.label.localeCompare(b.label, 'vi'))
    })

    const chiTieuOptions = computed(() => {
        const map = new Map()
        waitingItems.value.forEach((item) => {
            const id = Number(item.ChiTietGiaoChiTieuId ?? item.chiTietGiaoChiTieuId ?? 0)
            if (id > 0 && !map.has(id)) {
                map.set(id, { id, label: getChiTieuOptionLabel(item) })
            }
        })
        return [...map.values()].sort((a, b) => a.label.localeCompare(b.label, 'vi'))
    })

    const filteredItems = computed(() => {
        const keyword = normalizeText(filters.keyword)

        return waitingItems.value.filter((item) => {
            const kyId = String(item.KyBaoCaoKPIId ?? item.kyBaoCaoKPIId ?? '')
            const chiTietId = String(item.ChiTietGiaoChiTieuId ?? item.chiTietGiaoChiTieuId ?? '')
            const donViNhanId = String(item.DonViNhanId ?? item.donViNhanId ?? '')
            const searchable = normalizeText([
                item.MaKy || item.maKy,
                item.TenKy || item.tenKy,
                item.MaChiTieu || item.maChiTieu,
                item.TenChiTieu || item.tenChiTieu,
                item.TenDonViNhan || item.tenDonViNhan,
                item.NhanXet || item.nhanXet
            ].join(' '))

            return (!filters.kyBaoCaoKPIId || filters.kyBaoCaoKPIId === kyId)
                && (!filters.donViNhanId || filters.donViNhanId === donViNhanId)
                && (!filters.chiTietGiaoChiTieuId || filters.chiTietGiaoChiTieuId === chiTietId)
                && (!keyword || searchable.includes(keyword))
        })
    })

    const filteredItemIds = computed(() => filteredItems.value.map(getId).filter(id => id > 0))

    const selectedReportIdSet = computed(() => new Set(selectedReportIds.value.map(Number)))

    const selectedVisibleIds = computed(() =>
        filteredItemIds.value.filter(id => selectedReportIdSet.value.has(id))
    )

    const selectedVisibleCount = computed(() => selectedVisibleIds.value.length)

    const allVisibleSelected = computed({
        get: () => filteredItemIds.value.length > 0 && selectedVisibleCount.value === filteredItemIds.value.length,
        set: (checked) => {
            const next = new Set(selectedReportIds.value.map(Number))
            filteredItemIds.value.forEach(id => {
                if (checked) next.add(id)
                else next.delete(id)
            })
            selectedReportIds.value = [...next]
        }
    })

    const removeSelectedIds = (ids) => {
        const removing = new Set(ids.map(Number))
        selectedReportIds.value = selectedReportIds.value
            .map(Number)
            .filter(id => !removing.has(id))
    }

    const fetchItems = async () => {
        try {
            loading.value = true
            const response = await httpClient.get(API_PATH)
            items.value = normalizeList(response)
            const waitingIds = new Set(waitingItems.value.map(getId))
            selectedReportIds.value = selectedReportIds.value
                .map(Number)
                .filter(id => waitingIds.has(id))
        } catch (error) {
            console.error('fetch waiting send reports error:', error?.response?.status, error?.config?.url, error)
            items.value = []
            alert(error?.response?.data?.message || 'Không tải được danh sách báo cáo chờ gửi.')
        } finally {
            loading.value = false
        }
    }

    const sendItem = async (item) => {
        if (!canSendPeriodicReports) return
        const id = getId(item)
        if (!id) return

        const ok = window.confirm('Gửi báo cáo này sang danh sách chờ xét duyệt?')
        if (!ok) return

        try {
            processingId.value = id
            await httpClient.post(`${API_PATH}/${id}/submit`)
            removeSelectedIds([id])
            await fetchItems()
        } catch (error) {
            console.error('submit report error:', error?.response?.status, error?.config?.url, error)
            alert(error?.response?.data?.message || 'Gửi báo cáo thất bại.')
        } finally {
            processingId.value = null
        }
    }

    const sendReports = async (targetItems, confirmMessage) => {
        if (!canSendPeriodicReports) return
        const uniqueItems = targetItems.filter((item, index, source) =>
            getId(item) > 0 && source.findIndex(candidate => getId(candidate) === getId(item)) === index
        )

        if (!uniqueItems.length) {
            alert('Vui lòng chọn ít nhất một báo cáo để gửi.')
            return
        }

        const ok = window.confirm(confirmMessage(uniqueItems.length))
        if (!ok) return

        try {
            bulkSending.value = true
            for (const item of uniqueItems) {
                const id = getId(item)
                processingId.value = id
                await httpClient.post(`${API_PATH}/${id}/submit`)
            }
            removeSelectedIds(uniqueItems.map(getId))
            await fetchItems()
        } catch (error) {
            console.error('bulk submit report error:', error?.response?.status, error?.config?.url, error)
            alert(error?.response?.data?.message || 'Gửi danh sách báo cáo thất bại.')
        } finally {
            processingId.value = null
            bulkSending.value = false
        }
    }

    const sendSelectedItems = () => {
        const selected = filteredItems.value.filter(item => selectedReportIdSet.value.has(getId(item)))
        sendReports(selected, count => `Gửi ${count} báo cáo đã chọn sang danh sách chờ xét duyệt?`)
    }

    const sendAllItems = () => {
        sendReports(filteredItems.value, count => `Gửi tất cả ${count} báo cáo đang hiển thị sang danh sách chờ xét duyệt?`)
    }

    const editItem = (item) => {
        if (!canEditPeriodicReports) return
        const id = getId(item)
        if (!id) return

        router.push({ path: '/nhap-ket-qua', query: { editId: String(id), returnTo: 'gui-bao-cao-dinh-ky' } })
    }

    const deleteItem = async (item) => {
        if (!canDeletePeriodicReports) return
        const id = getId(item)
        if (!id) return

        const ok = window.confirm('Xóa báo cáo chờ gửi này?')
        if (!ok) return

        try {
            processingId.value = id
            await httpClient.delete(`${API_PATH}/${id}`)
            removeSelectedIds([id])
            await fetchItems()
        } catch (error) {
            console.error('delete waiting report error:', error?.response?.status, error?.config?.url, error)
            alert(error?.response?.data?.message || 'Xóa báo cáo chờ gửi thất bại.')
        } finally {
            processingId.value = null
        }
    }

    const openCreateReport = () => {
        if (!canCreatePeriodicReports) return
        router.push({ path: '/nhap-ket-qua', query: { openCreate: '1', returnTo: 'gui-bao-cao-dinh-ky' } })
    }

    const resetFilters = () => {
        filters.kyBaoCaoKPIId = ''
        filters.donViNhanId = ''
        filters.chiTietGiaoChiTieuId = ''
        filters.keyword = ''
    }

    const formatNumber = (value) => {
        if (value === null || value === undefined || value === '') return '-'
        const parsed = Number(value)
        if (!Number.isFinite(parsed)) return '-'
        return parsed.toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
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

    .gov-title {
        font-size: 1.3rem;
        font-weight: 800;
        color: #0f172a;
        letter-spacing: 0.02em;
    }

    .gov-sub {
        color: #64748b;
        margin-top: 4px;
    }

    .summary-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 16px;
    }

    .summary-card {
        padding: 18px 20px;
    }

    .summary-card .label {
        display: block;
        color: #64748b;
        font-size: 0.88rem;
        font-weight: 700;
        margin-bottom: 8px;
    }

    .summary-card strong {
        display: block;
        color: #0f172a;
        font-size: 1.35rem;
        font-weight: 800;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .bulk-actions {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
        padding: 12px;
        border: 1px solid #dbeafe;
        border-radius: 16px;
        background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%);
    }

    .select-all-control {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin: 0;
        color: #1e3a8a;
        font-size: 0.9rem;
        font-weight: 700;
    }

    .form-check-input {
        width: 1.05rem;
        height: 1.05rem;
        cursor: pointer;
    }

    .table-responsive .btn {
        white-space: nowrap;
    }

    @media (max-width: 768px) {
        .summary-grid {
            grid-template-columns: 1fr;
        }

        .bulk-actions {
            align-items: stretch;
            flex-direction: column;
        }

        .bulk-actions .btn,
        .select-all-control {
            width: 100%;
        }
    }
</style>
