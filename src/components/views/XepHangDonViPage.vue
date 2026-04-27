<template>
    <BaseLayout>
        <div class="page-wrap">
            <div class="container-fluid py-4">
                <div class="gov-banner mb-4">
                    <div class="gov-emblem">
                        <i class="bi bi-trophy"></i>
                    </div>
                    <div class="gov-text">
                        <div class="gov-title">XẾP HẠNG ĐƠN VỊ THEO CHỈ TIÊU</div>
                        <div class="gov-sub"></div>
                    </div>
                </div>

                <div class="xep-hang-don-vi-page">
                    <div class="filter-card">
                        <div class="filter-grid">
                            <div class="form-group">
                                <label>Đợt giao chỉ tiêu</label>
                                <select v-model="filters.dotGiaoChiTieuId" @change="handleDotGiaoChange">
                                    <option value="">-- Chọn đợt giao chỉ tiêu --</option>
                                    <option v-for="item in dotGiaoOptions" :key="item.id" :value="item.id">
                                        {{ formatDotGiaoLabel(item) }}
                                    </option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>Danh mục chỉ tiêu</label>
                                <select v-model="filters.danhMucChiTieuId" :disabled="!filters.dotGiaoChiTieuId">
                                    <option value="">-- Chọn chỉ tiêu --</option>
                                    <option v-for="item in chiTieuOptions" :key="item.danhMucChiTieuId"
                                        :value="item.danhMucChiTieuId">
                                        {{ item.tenDanhMucChiTieu }}
                                    </option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>Từ khóa đơn vị</label>
                                <input v-model.trim="filters.keyword" type="text" placeholder="Nhập tên đơn vị..." />
                            </div>

                            <div class="form-group actions">
                                <button class="btn btn-primary" @click="fetchAllData">Tải dữ liệu</button>
                                <button class="btn btn-secondary" @click="resetFilters">Đặt lại</button>
                            </div>
                        </div>
                    </div>

                    <div class="summary-grid">
                        <div class="summary-card">
                            <span class="label">Số đơn vị</span>
                            <strong>{{ rankedRows.length }}</strong>
                        </div>
                        <div class="summary-card">
                            <span class="label">Chỉ tiêu đang xem</span>
                            <strong>{{ selectedChiTieuLabel || '-' }}</strong>
                        </div>
                        <div class="summary-card">
                            <span class="label">Số kỳ đã tổng hợp</span>
                            <strong>{{ totalKyBaoCao }}</strong>
                        </div>
                        <div class="summary-card">
                            <span class="label">Tỷ lệ hoàn thành TB</span>
                            <strong>{{ formatPercent(avgTyLeHoanThanh) }}</strong>
                        </div>
                    </div>

                    <div class="table-card">
                        <div class="table-toolbar">
                            <button class="btn btn-success" @click="exportCsv" :disabled="rankedRows.length === 0">
                                Xuất CSV
                            </button>
                        </div>

                        <div v-if="loading" class="state loading">Đang tải dữ liệu...</div>
                        <div v-else-if="errorMessage" class="state error">{{ errorMessage }}</div>
                        <div v-else-if="!filters.dotGiaoChiTieuId" class="state empty">
                            Vui lòng chọn đợt giao chỉ tiêu.
                        </div>
                        <div v-else-if="!filters.danhMucChiTieuId" class="state empty">
                            Vui lòng chọn danh mục chỉ tiêu.
                        </div>
                        <div v-else class="table-wrapper">
                            <ColumnVisibilityTools table-id="XepHangDonViPage-table" />
                            <table id="XepHangDonViPage-table" class="managed-table">
                                <thead>
                                    <tr>
                                        <th>Hạng</th>
                                        <th>Đơn vị</th>
                                        <th>Chỉ tiêu</th>
                                        <th>Số kỳ</th>
                                        <th>Giá trị mục tiêu</th>
                                        <th>Giá trị đầu kỳ cộng dồn</th>
                                        <th>Giá trị cuối kỳ cộng dồn</th>
                                        <th>Tỷ lệ hoàn thành</th>
                                        <th>Xếp loại</th>
                                        <th>Kết quả</th>
                                        <th>Người đánh giá</th>
                                        <th>Ngày đánh giá</th>
                                        <th>Nhận xét</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-if="rankedRows.length === 0">
                                        <td colspan="13" class="empty-cell">Không có dữ liệu phù hợp</td>
                                    </tr>

                                    <tr v-for="row in rankedRows" :key="row.uniqueKey">
                                        <td class="text-center">
                                            <span class="rank-badge">{{ row.ranking }}</span>
                                        </td>
                                        <td>{{ row.tenDonViNhan }}</td>
                                        <td>{{ row.tenChiTieu }}</td>
                                        <td class="text-center">{{ row.soKyBaoCao }}</td>
                                        <td class="text-right">{{ formatNumber(row.giaTriMucTieu) }}</td>
                                        <td class="text-right">{{ formatNumber(row.giaTriDauKy) }}</td>
                                        <td class="text-right">{{ formatNumber(row.giaTriCuoiKy) }}</td>
                                        <td class="text-right">{{ formatPercent(row.tyLeHoanThanh) }}</td>
                                        <td class="text-center">
                                            <span class="badge" :class="getXepLoaiClass(row.xepLoai)">
                                                {{ getDanhGiaLabel(row.xepLoai) || '-' }}
                                            </span>
                                        </td>
                                        <td class="text-center">{{ row.ketQua || '-' }}</td>
                                        <td>{{ row.nguoiDanhGia || '-' }}</td>
                                        <td>{{ formatDateTime(row.ngayDanhGia) }}</td>
                                        <td>{{ row.nhanXetDanhGia || '-' }}</td>
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
    import BaseLayout from '../BaseLayout.vue'
import ColumnVisibilityTools from '../shared/ColumnVisibilityTools.vue'
    import { apiRequest } from '../../services/api.js'
    import { getStoredUserProfile, isCatpProfile, isPrivilegedProfile } from '../../utils/accessControl'
    import {
        getDanhGiaBadgeClass,
        getDanhGiaLabel,
        getDanhGiaRank
    } from '../../utils/danhGiaStatusClean.js'

    const loading = ref(false)
    const errorMessage = ref('')

    const dotGiaoOptions = ref([])
    const chiTietGiaoRows = ref([])
    const kyBaoCaoOptions = ref([])
    const danhGiaRows = ref([])
    const currentProfile = ref(getStoredUserProfile())

    const filters = reactive({
        dotGiaoChiTieuId: '',
        danhMucChiTieuId: '',
        keyword: ''
    })
    const canViewAllUnits = computed(() =>
        isPrivilegedProfile(currentProfile.value) || isCatpProfile(currentProfile.value)
    )
    const currentUnitName = computed(() => String(currentProfile.value?.donVi || '').trim())

    onMounted(async () => {
        await fetchInitialData()
    })

    async function fetchInitialData() {
        loading.value = true
        errorMessage.value = ''

        try {
            const [dotGiaoData, chiTietData, kyBaoCaoData, danhGiaData] = await Promise.all([
                apiRequest('/dot-giao-chi-tieu'),
                apiRequest('/ChiTietGiaoChiTieu'),
                apiRequest('/KyBaoCaoKPI'),
                apiRequest('/DanhGiaKPI')
            ])

            dotGiaoOptions.value = Array.isArray(dotGiaoData) ? dotGiaoData : []
            chiTietGiaoRows.value = Array.isArray(chiTietData) ? chiTietData : []
            kyBaoCaoOptions.value = Array.isArray(kyBaoCaoData) ? kyBaoCaoData : []
            danhGiaRows.value = Array.isArray(danhGiaData) ? danhGiaData : []
        } catch (error) {
            console.error(error)
            errorMessage.value = error.message || 'Không thể tải dữ liệu ban đầu.'
        } finally {
            loading.value = false
        }
    }

    async function fetchAllData() {
        await fetchInitialData()
    }

    function resetFilters() {
        filters.dotGiaoChiTieuId = ''
        filters.danhMucChiTieuId = ''
        filters.keyword = ''
        errorMessage.value = ''
    }

    function handleDotGiaoChange() {
        filters.danhMucChiTieuId = ''
    }

    function normalizeText(value) {
        return String(value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim()
    }

    function formatDotGiaoLabel(item) {
        const ma = item.maDotGiao || ''
        const ten = item.tenDotGiao || `Đợt #${item.id}`
        return ma ? `${ma} - ${ten}` : ten
    }

    const flattenedChiTietGiaoRows = computed(() => {
        return chiTietGiaoRows.value.flatMap(item => flattenChiTietGiao(item))
    })

    const chiTieuOptions = computed(() => {
        if (!filters.dotGiaoChiTieuId) return []

        const filtered = flattenedChiTietGiaoRows.value.filter(
            x => String(x.dotGiaoChiTieuId) === String(filters.dotGiaoChiTieuId)
        )

        const map = new Map()

        for (const item of filtered) {
            const key = item.danhMucChiTieuId
            if (!key) continue

            if (!map.has(key)) {
                map.set(key, {
                    danhMucChiTieuId: item.danhMucChiTieuId,
                    tenDanhMucChiTieu:
                        item.tenDanhMucChiTieu || `Chỉ tiêu #${item.danhMucChiTieuId}`,
                    tanSuatBaoCao: item.tanSuatBaoCao || ''
                })
            }
        }

        return Array.from(map.values()).sort((a, b) =>
            a.tenDanhMucChiTieu.localeCompare(b.tenDanhMucChiTieu, 'vi')
        )
    })

    const selectedChiTieu = computed(() => {
        return (
            chiTieuOptions.value.find(
                x => String(x.danhMucChiTieuId) === String(filters.danhMucChiTieuId)
            ) || null
        )
    })

    const selectedChiTieuLabel = computed(() => {
        return selectedChiTieu.value?.tenDanhMucChiTieu || ''
    })

    const chiTietByIdMap = computed(() => {
        const map = new Map()

        for (const item of flattenedChiTietGiaoRows.value) {
            map.set(String(item.id), item)
        }

        return map
    })

    function getXepLoaiScore(xepLoai) {
        return getDanhGiaRank(xepLoai)
    }

    function getXepLoaiClass(xepLoai) {
        return getDanhGiaBadgeClass(xepLoai)
    }

    const joinedRows = computed(() => {
        return danhGiaRows.value
            .map(dg => {
                const chiTiet = chiTietByIdMap.value.get(String(dg.chiTietGiaoChiTieuId))
                if (!chiTiet) return null

                const ky = kyBaoCaoOptions.value.find(
                    x => String(x.id) === String(dg.kyBaoCaoKPIId)
                )

                return {
                    ...dg,
                    dotGiaoChiTieuId: chiTiet.dotGiaoChiTieuId,
                    danhMucChiTieuId: chiTiet.danhMucChiTieuId,
                    tenDanhMucChiTieu: chiTiet.tenDanhMucChiTieu,
                    tenDonViNhanFromGiao: chiTiet.tenDonViNhan,
                    tenKyBaoCao: ky?.tenKy || '',
                    kySort: extractKySortInfo({ ...ky, ...dg })
                }
            })
            .filter(Boolean)
    })

    const filteredSourceRows = computed(() => {
        if (!filters.dotGiaoChiTieuId || !filters.danhMucChiTieuId) {
            return []
        }

        const keyword = normalizeText(filters.keyword)

        return joinedRows.value.filter(item => {
            const matchDot =
                String(item.dotGiaoChiTieuId) === String(filters.dotGiaoChiTieuId)
            const matchDanhMuc =
                String(item.danhMucChiTieuId) === String(filters.danhMucChiTieuId)
            const tenDonVi = item.tenDonViNhan || item.tenDonViNhanFromGiao || ''
            const matchKeyword = !keyword || normalizeText(tenDonVi).includes(keyword)
            const matchCurrentUnit =
                canViewAllUnits.value ||
                !currentUnitName.value ||
                normalizeText(tenDonVi) === normalizeText(currentUnitName.value)

            return matchDot && matchDanhMuc && matchKeyword && matchCurrentUnit
        })
    })

    const aggregatedRows = computed(() => {
        const groupedMap = new Map()

        for (const item of filteredSourceRows.value) {
            const tenDonVi = item.tenDonViNhan || item.tenDonViNhanFromGiao || 'Chưa xác định'
            const tenChiTieu = item.tenChiTieu || item.tenDanhMucChiTieu || 'Chưa xác định'
            const groupKey = `${tenDonVi}__${item.danhMucChiTieuId}`

            if (!groupedMap.has(groupKey)) {
                groupedMap.set(groupKey, {
                    uniqueKey: groupKey,
                    tenDonViNhan: tenDonVi,
                    tenChiTieu,
                    danhMucChiTieuId: item.danhMucChiTieuId,
                    dotGiaoChiTieuId: item.dotGiaoChiTieuId,

                    giaTriMucTieu: toFiniteNumberOrNull(item.giaTriMucTieu),
                    giaTriDauKy: 0,
                    giaTriCuoiKy: 0,

                    tongTyLeHoanThanh: 0,
                    soBanGhiTyLe: 0,

                    kyBaoCaoIds: new Set(),
                    latestItem: item,

                    ketQua: item.ketQua || '',
                    nguoiDanhGia: item.nguoiDanhGia || '',
                    ngayDanhGia: item.ngayDanhGia || null,
                    nhanXetDanhGia: item.nhanXetDanhGia || ''
                })
            }

            const target = groupedMap.get(groupKey)

            target.giaTriDauKy += numberOrZero(item.giaTriDauKy)
            target.giaTriCuoiKy += numberOrZero(item.giaTriCuoiKy)

            if (target.giaTriMucTieu === null) {
                target.giaTriMucTieu = toFiniteNumberOrNull(item.giaTriMucTieu)
            }

            const tyLe = toFiniteNumberOrNull(item.tyLeHoanThanh)
            if (tyLe !== null) {
                target.tongTyLeHoanThanh += tyLe
                target.soBanGhiTyLe += 1
            }

            if (
                item.kyBaoCaoKPIId !== null &&
                item.kyBaoCaoKPIId !== undefined &&
                item.kyBaoCaoKPIId !== ''
            ) {
                target.kyBaoCaoIds.add(String(item.kyBaoCaoKPIId))
            }

            if (compareEvaluationOrder(item, target.latestItem) > 0) {
                target.latestItem = item
                target.ketQua = item.ketQua || ''
                target.nguoiDanhGia = item.nguoiDanhGia || ''
                target.ngayDanhGia = item.ngayDanhGia || null
                target.nhanXetDanhGia = item.nhanXetDanhGia || ''
            }
        }

        return Array.from(groupedMap.values()).map(item => {
            const tyLeHoanThanh =
                item.soBanGhiTyLe > 0
                    ? item.tongTyLeHoanThanh / item.soBanGhiTyLe
                    : null

            const latest = item.latestItem || null
            const xepLoai = latest?.xepLoai || 'CHUA_DANH_GIA'

            return {
                ...item,
                giaTriMucTieu: item.giaTriMucTieu ?? toFiniteNumberOrNull(latest?.giaTriMucTieu) ?? 0,
                tyLeHoanThanh,
                xepLoai,
                ketQua: latest?.ketQua || item.ketQua || '',
                nguoiDanhGia: latest?.nguoiDanhGia || item.nguoiDanhGia || '',
                ngayDanhGia: latest?.ngayDanhGia || item.ngayDanhGia || null,
                nhanXetDanhGia: latest?.nhanXetDanhGia || item.nhanXetDanhGia || '',
                soKyBaoCao: item.kyBaoCaoIds.size
            }
        })
    })

    const rankedRows = computed(() => {
        const rows = aggregatedRows.value
            .map(item => ({
                ...item,
                xepLoaiScore: getXepLoaiScore(item.xepLoai),
                tyLeHoanThanhNumber: Number(item.tyLeHoanThanh ?? -1),
                giaTriCuoiKyNumber: Number(item.giaTriCuoiKy ?? -1)
            }))
            .sort((a, b) =>
                (b.tyLeHoanThanhNumber - a.tyLeHoanThanhNumber) ||
                (b.xepLoaiScore - a.xepLoaiScore) ||
                (b.giaTriCuoiKyNumber - a.giaTriCuoiKyNumber) ||
                a.tenDonViNhan.localeCompare(b.tenDonViNhan, 'vi')
            )

        let currentRank = 0
        let previousScoreKey = ''
        let displayedIndex = 0

        return rows.map(item => {
            displayedIndex += 1

            const scoreKey = [
                item.tyLeHoanThanhNumber,
                item.xepLoaiScore,
                item.giaTriCuoiKyNumber
            ].join('|')

            if (scoreKey !== previousScoreKey) {
                currentRank = displayedIndex
                previousScoreKey = scoreKey
            }

            return {
                ...item,
                ranking: currentRank
            }
        })
    })

    const totalKyBaoCao = computed(() => {
        const ids = new Set()

        for (const item of filteredSourceRows.value) {
            if (item.kyBaoCaoKPIId) {
                ids.add(String(item.kyBaoCaoKPIId))
            }
        }

        return ids.size
    })

    const avgTyLeHoanThanh = computed(() => {
        const valid = rankedRows.value
            .map(x => Number(x.tyLeHoanThanh))
            .filter(x => Number.isFinite(x))

        if (valid.length === 0) return null

        return valid.reduce((sum, value) => sum + value, 0) / valid.length
    })

    function flattenChiTietGiao(item, parent = null) {
        const children = Array.isArray(item?.tieuChiCon || item?.TieuChiCon)
            ? (item.tieuChiCon || item.TieuChiCon)
            : []

        const current = {
            ...item,
            id: Number(item?.id || item?.Id || 0),
            dotGiaoChiTieuId: Number(item?.dotGiaoChiTieuId || item?.DotGiaoChiTieuId || parent?.dotGiaoChiTieuId || 0),
            danhMucChiTieuId: Number(item?.danhMucChiTieuId || item?.DanhMucChiTieuId || 0),
            tenDanhMucChiTieu: item?.tenDanhMucChiTieu || item?.TenDanhMucChiTieu || item?.tenChiTieu || item?.TenChiTieu || '',
            tenDonViNhan: item?.tenDonViNhan || item?.TenDonViNhan || parent?.tenDonViNhan || '',
            tenDonViThucHienChinh: item?.tenDonViThucHienChinh || item?.TenDonViThucHienChinh || parent?.tenDonViThucHienChinh || ''
        }

        return [
            current,
            ...children.flatMap(child => flattenChiTietGiao(child, current))
        ]
    }

    function toFiniteNumberOrNull(value) {
        if (value === null || value === undefined || value === '') return null
        const parsed = Number(value)
        return Number.isFinite(parsed) ? parsed : null
    }

    function numberOrZero(value) {
        return toFiniteNumberOrNull(value) ?? 0
    }

    function compareEvaluationOrder(left, right) {
        const kyDiff = compareKySort(left?.kySort, right?.kySort)
        if (kyDiff !== 0) return kyDiff

        const leftDate = parseDate(left?.updatedAt || left?.ngayDanhGia || left?.createdAt)
        const rightDate = parseDate(right?.updatedAt || right?.ngayDanhGia || right?.createdAt)
        return (leftDate?.getTime() || 0) - (rightDate?.getTime() || 0)
    }

    function extractKySortInfo(source) {
        return {
            nam: Number(source?.nam || source?.Nam || 0),
            loaiKy: source?.loaiKy || source?.LoaiKy || '',
            soKy: Number(source?.soKy || source?.SoKy || 0),
            kyBaoCaoKPIId: Number(source?.kyBaoCaoKPIId || source?.KyBaoCaoKPIId || source?.id || source?.Id || 0)
        }
    }

    function compareKySort(left, right) {
        const namDiff = Number(left?.nam || 0) - Number(right?.nam || 0)
        if (namDiff !== 0) return namDiff

        const loaiKyDiff = getLoaiKyOrder(left?.loaiKy) - getLoaiKyOrder(right?.loaiKy)
        if (loaiKyDiff !== 0) return loaiKyDiff

        const soKyDiff = Number(left?.soKy || 0) - Number(right?.soKy || 0)
        if (soKyDiff !== 0) return soKyDiff

        return Number(left?.kyBaoCaoKPIId || 0) - Number(right?.kyBaoCaoKPIId || 0)
    }

    function getLoaiKyOrder(loaiKy) {
        switch (normalizeText(loaiKy).toUpperCase()) {
            case 'THANG':
                return 1
            case 'QUY':
                return 2
            case '6THANG':
                return 3
            case 'NAM':
                return 4
            default:
                return 99
        }
    }

    function parseDate(value) {
        if (!value) return null
        const date = new Date(value)
        return Number.isNaN(date.getTime()) ? null : date
    }

    function formatPercent(value) {
        if (value === null || value === undefined || value === '') return '-'
        const num = Number(value)
        if (Number.isNaN(num)) return '-'

        return `${num.toLocaleString('vi-VN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        })}%`
    }

    function formatNumber(value) {
        if (value === null || value === undefined || value === '') return '-'
        const num = Number(value)
        if (Number.isNaN(num)) return '-'

        return num.toLocaleString('vi-VN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        })
    }

    function formatDateTime(value) {
        if (!value) return '-'

        const date = new Date(value)
        if (Number.isNaN(date.getTime())) return '-'

        return date.toLocaleString('vi-VN')
    }

    function escapeCsvValue(value) {
        return `"${String(value ?? '').replace(/"/g, '""')}"`
    }

    function exportCsv() {
        const headers = [
            'Hạng',
            'Đơn vị',
            'Chỉ tiêu',
            'Số kỳ',
            'Giá trị mục tiêu',
            'Giá trị đầu kỳ cộng dồn',
            'Giá trị cuối kỳ cộng dồn',
            'Tỷ lệ hoàn thành',
            'Xếp loại',
            'Kết quả',
            'Người đánh giá',
            'Ngày đánh giá',
            'Nhận xét'
        ]

        const csvRows = rankedRows.value.map(item => [
            item.ranking,
            item.tenDonViNhan,
            item.tenChiTieu,
            item.soKyBaoCao,
            formatNumber(item.giaTriMucTieu),
            formatNumber(item.giaTriDauKy),
            formatNumber(item.giaTriCuoiKy),
            formatPercent(item.tyLeHoanThanh),
            item.xepLoai || '',
            item.ketQua || '',
            item.nguoiDanhGia || '',
            formatDateTime(item.ngayDanhGia),
            item.nhanXetDanhGia || ''
        ])

        const csvContent = [headers, ...csvRows]
            .map(row => row.map(escapeCsvValue).join(','))
            .join('\n')

        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')

        link.href = url
        link.setAttribute('download', 'xep-hang-don-vi-theo-chi-tieu-kpi-cong-don.csv')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
    }
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

    .wave-title {
        font-weight: 700;
        letter-spacing: 0.08em;
        font-size: 0.8rem;
        color: #0d6efd;
        margin-bottom: 6px;
        text-transform: uppercase;
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

    .xep-hang-don-vi-page {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .page-header h2 {
        margin: 0 0 8px;
        color: #1f2937;
    }

    .page-header p {
        margin: 0;
        color: #666;
    }

    .filter-card,
    .table-card {
        background: #fff;
        border-radius: 12px;
        padding: 16px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
    }

    .filter-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 16px;
        align-items: end;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .form-group label {
        font-weight: 600;
        color: #374151;
    }

    .form-group input,
    .form-group select {
        height: 40px;
        padding: 0 12px;
        border: 1px solid #dcdfe6;
        border-radius: 8px;
        outline: none;
        font-size: 14px;
    }

    .form-group input:focus,
    .form-group select:focus {
        border-color: #89d2ef;
        box-shadow: 0 0 0 0.2rem rgba(137, 210, 239, 0.2);
    }

    .form-group.actions {
        display: flex;
        flex-direction: row;
        gap: 8px;
        align-items: end;
    }

    .btn {
        height: 40px;
        padding: 0 16px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
    }

    .btn-primary {
        background: #1677ff;
        color: #fff;
    }

    .btn-secondary {
        background: #f3f4f6;
        color: #111827;
    }

    .btn-success {
        background: #16a34a;
        color: #fff;
    }

    .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .summary-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 16px;
    }

    .summary-card {
        background: #fff;
        border-radius: 12px;
        padding: 16px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .summary-card .label {
        color: #666;
        font-size: 13px;
    }

    .summary-card strong {
        font-size: 20px;
        color: #111827;
    }

    .table-toolbar {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 12px;
    }

    .table-wrapper {
        overflow-x: auto;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        min-width: 1400px;
    }

    th,
    td {
        border: 1px solid #e5e7eb;
        padding: 10px 12px;
        vertical-align: middle;
    }

    th {
        background: #f9fafb;
        text-align: center;
        font-weight: 700;
        white-space: nowrap;
    }

    .text-center {
        text-align: center;
    }

    .text-right {
        text-align: right;
    }

    .state {
        padding: 24px;
        text-align: center;
        border-radius: 8px;
    }

    .state.loading {
        background: #eff6ff;
        color: #1d4ed8;
    }

    .state.error {
        background: #fef2f2;
        color: #dc2626;
    }

    .state.empty {
        background: #f9fafb;
        color: #6b7280;
    }

    .empty-cell {
        text-align: center;
        color: #6b7280;
        padding: 24px;
    }

    .rank-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 32px;
        height: 32px;
        padding: 0 10px;
        border-radius: 999px;
        background: #111827;
        color: #fff;
        font-weight: 700;
    }

    .badge {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 600;
        white-space: nowrap;
    }

    .badge-excellent {
        background: #dcfce7;
        color: #166534;
    }

    .badge-good {
        background: #dbeafe;
        color: #1d4ed8;
    }

    .badge-pass {
        background: #fef3c7;
        color: #92400e;
    }

    .badge-fail {
        background: #fee2e2;
        color: #b91c1c;
    }

    .badge-pending {
        background: #ede9fe;
        color: #6d28d9;
    }

    .badge-muted,
    .badge-default {
        background: #f3f4f6;
        color: #4b5563;
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




