<template>
    <BaseLayout>
        <div class="page-wrap">
            <div class="container-fluid py-4">
                <div class="gov-banner mb-4">
                    <div class="gov-emblem">
                        <i class="bi bi-bullseye"></i>
                    </div>
                    <div class="gov-text">
                        <div class="wave-title">HỆ THỐNG THEO DÕI CHỈ TIÊU CÔNG TÁC</div>
                        <div class="gov-title">BÁO CÁO THEO CHỈ TIÊU</div>
                        <div class="gov-sub"></div>
                    </div>
                </div>

                <div class="bao-cao-chi-tieu-page">
                    <div class="gov-banner">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/a/a3/Emblem_of_Vietnam.svg"
                            class="gov-emblem" />
                    </div>

                    <div class="filter-card">
                        <div class="filter-grid">
                            <div class="form-group">
                                <label>Kỳ báo cáo</label>
                                <select v-model="filters.kyBaoCaoKPIId" @change="fetchDanhGiaKPI">
                                    <option value="">-- Tất cả kỳ báo cáo --</option>
                                    <option v-for="item in kyBaoCaoOptions" :key="item.id" :value="item.id">
                                        {{ item.tenKy }}
                                    </option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>Từ khóa</label>
                                <input v-model.trim="filters.keyword" type="text"
                                    placeholder="Nhập mã chỉ tiêu, tên chỉ tiêu..." />
                            </div>

                            <div class="form-group actions">
                                <button class="btn btn-primary" @click="fetchDanhGiaKPI">Tải dữ liệu</button>
                                <button class="btn btn-secondary" @click="resetFilters">Đặt lại</button>
                            </div>
                        </div>
                    </div>

                    <div class="summary-grid">
                        <div class="summary-card">
                            <span class="label">Tổng số chỉ tiêu</span>
                            <strong>{{ filteredRows.length }}</strong>
                        </div>
                        <div class="summary-card">
                            <span class="label">Xuất sắc</span>
                            <strong>{{ thongKe.xuatSac }}</strong>
                        </div>
                        <div class="summary-card">
                            <span class="label">Tốt</span>
                            <strong>{{ thongKe.tot }}</strong>
                        </div>
                        <div class="summary-card">
                            <span class="label">Đạt</span>
                            <strong>{{ thongKe.dat }}</strong>
                        </div>
                        <div class="summary-card">
                            <span class="label">Không đạt</span>
                            <strong>{{ thongKe.khongDat }}</strong>
                        </div>
                    </div>

                    <div class="table-card">
                        <div class="table-toolbar">
                            <button class="btn btn-success" @click="exportCsv">Xuất CSV</button>
                        </div>

                        <div v-if="loading" class="state loading">Đang tải dữ liệu...</div>
                        <div v-else-if="errorMessage" class="state error">{{ errorMessage }}</div>
                        <div v-else class="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>STT</th>
                                        <th>Mã chỉ tiêu</th>
                                        <th>Tên chỉ tiêu</th>
                                        <th>Số đơn vị đánh giá</th>
                                        <th>Tổng mục tiêu</th>
                                        <th>Tổng đầu kỳ</th>
                                        <th>Tổng cuối kỳ</th>
                                        <th>Tổng cùng kỳ năm trước</th>
                                        <th>CL so với đầu kỳ</th>
                                        <th>% tăng trưởng đầu kỳ</th>
                                        <th>CL cùng kỳ năm trước</th>
                                        <th>% tăng trưởng cùng kỳ</th>
                                        <th>% hoàn thành bình quân</th>
                                        <th>Xếp loại tổng hợp</th>
                                        <th>Kết quả tổng hợp</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-if="filteredRows.length === 0">
                                        <td colspan="15" class="empty-cell">Không có dữ liệu</td>
                                    </tr>
                                    <tr v-for="(row, index) in filteredRows" :key="row.maChiTieu || index">
                                        <td>{{ index + 1 }}</td>
                                        <td>{{ row.maChiTieu || '-' }}</td>
                                        <td>{{ row.tenChiTieu || '-' }}</td>
                                        <td class="text-center">{{ row.soDonVi }}</td>
                                        <td class="text-right">{{ formatNumber(row.tongMucTieu) }}</td>
                                        <td class="text-right">{{ formatNumber(row.tongDauKy) }}</td>
                                        <td class="text-right">{{ formatNumber(row.tongCuoiKy) }}</td>
                                        <td class="text-right">{{ formatNumber(row.tongCungKyNamTruoc) }}</td>
                                        <td class="text-right">{{ formatNumber(row.chenhLechSoVoiDauKy) }}</td>
                                        <td class="text-right">{{ formatPercent(row.tyLeTangTruongSoVoiDauKy) }}</td>
                                        <td class="text-right">{{ formatNumber(row.chenhLechSoVoiCungKyNamTruoc) }}</td>
                                        <td class="text-right">{{ formatPercent(row.tyLeTangTruongSoVoiCungKyNamTruoc)
                                            }}</td>
                                        <td class="text-right">{{ formatPercent(row.tyLeHoanThanhBinhQuan) }}</td>
                                        <td>
                                            <span class="badge" :class="badgeClass(row.xepLoaiTongHop)">
                                                {{ row.xepLoaiTongHop || '-' }}
                                            </span>
                                        </td>
                                        <td>{{ row.ketQuaTongHop || '-' }}</td>
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
    import { apiRequest } from '../../services/api.js'

    const loading = ref(false)
    const errorMessage = ref('')
    const rawRows = ref([])
    const kyBaoCaoOptions = ref([])

    const filters = reactive({
        kyBaoCaoKPIId: '',
        keyword: ''
    })

    onMounted(async () => {
        await Promise.all([fetchKyBaoCao(), fetchDanhGiaKPI()])
    })

    async function fetchKyBaoCao() {
        try {
            const data = await apiRequest('/KyBaoCaoKPI')
            kyBaoCaoOptions.value = Array.isArray(data) ? data : []
        } catch (error) {
            console.error('Lỗi tải kỳ báo cáo:', error)
            kyBaoCaoOptions.value = []
        }
    }

    async function fetchDanhGiaKPI() {
        loading.value = true
        errorMessage.value = ''

        try {
            const data = filters.kyBaoCaoKPIId
                ? await apiRequest(`/DanhGiaKPI/by-ky-bao-cao/${filters.kyBaoCaoKPIId}`)
                : await apiRequest('/DanhGiaKPI')

            rawRows.value = Array.isArray(data) ? data : []
        } catch (error) {
            console.error(error)
            errorMessage.value = error.message || 'Không thể tải dữ liệu báo cáo theo chỉ tiêu.'
            rawRows.value = []
        } finally {
            loading.value = false
        }
    }

    const reportRows = computed(() => {
        const grouped = new Map()

        rawRows.value.forEach(item => {
            const key = item.maChiTieu || item.tenChiTieu || `unknown-${item.id}`

            if (!grouped.has(key)) {
                grouped.set(key, {
                    maChiTieu: item.maChiTieu || '',
                    tenChiTieu: item.tenChiTieu || '',
                    soDonVi: 0,
                    tongMucTieu: 0,
                    tongDauKy: 0,
                    tongCuoiKy: 0,
                    tongCungKyNamTruoc: 0,
                    tongTyLeHoanThanh: 0,
                    soBanGhi: 0,
                    xuatSac: 0,
                    tot: 0,
                    dat: 0,
                    khongDat: 0
                })
            }

            const group = grouped.get(key)

            group.soDonVi += 1
            group.soBanGhi += 1
            group.tongMucTieu += toNumber(item.giaTriMucTieu)
            group.tongDauKy += toNumber(item.giaTriDauKy)
            group.tongCuoiKy += toNumber(item.giaTriCuoiKy)
            group.tongCungKyNamTruoc += toNumber(item.giaTriCungKyNamTruoc)
            group.tongTyLeHoanThanh += toNumber(item.tyLeHoanThanh)

            const xepLoai = normalizeText(item.xepLoai)
            if (xepLoai === 'xuat sac') group.xuatSac += 1
            else if (xepLoai === 'tot') group.tot += 1
            else if (xepLoai === 'dat') group.dat += 1
            else if (xepLoai === 'khong dat') group.khongDat += 1
        })

        return Array.from(grouped.values()).map(item => {
            const chenhLechSoVoiDauKy = item.tongCuoiKy - item.tongDauKy
            const chenhLechSoVoiCungKyNamTruoc = item.tongCuoiKy - item.tongCungKyNamTruoc

            const tyLeTangTruongSoVoiDauKy =
                item.tongDauKy !== 0
                    ? (chenhLechSoVoiDauKy / item.tongDauKy) * 100
                    : 0

            const tyLeTangTruongSoVoiCungKyNamTruoc =
                item.tongCungKyNamTruoc !== 0
                    ? (chenhLechSoVoiCungKyNamTruoc / item.tongCungKyNamTruoc) * 100
                    : 0

            const tyLeHoanThanhBinhQuan =
                item.soBanGhi !== 0
                    ? item.tongTyLeHoanThanh / item.soBanGhi
                    : 0

            const xepLoaiTongHop = getTopXepLoai(item)
            const ketQuaTongHop = buildKetQuaTongHop(item)

            return {
                maChiTieu: item.maChiTieu,
                tenChiTieu: item.tenChiTieu,
                soDonVi: item.soDonVi,
                tongMucTieu: item.tongMucTieu,
                tongDauKy: item.tongDauKy,
                tongCuoiKy: item.tongCuoiKy,
                tongCungKyNamTruoc: item.tongCungKyNamTruoc,
                chenhLechSoVoiDauKy,
                tyLeTangTruongSoVoiDauKy,
                chenhLechSoVoiCungKyNamTruoc,
                tyLeTangTruongSoVoiCungKyNamTruoc,
                tyLeHoanThanhBinhQuan,
                xepLoaiTongHop,
                ketQuaTongHop
            }
        })
    })

    const filteredRows = computed(() => {
        let data = [...reportRows.value]

        if (filters.keyword) {
            const keyword = filters.keyword.toLowerCase()
            data = data.filter(item =>
                [item.maChiTieu, item.tenChiTieu]
                    .filter(Boolean)
                    .some(value => String(value).toLowerCase().includes(keyword))
            )
        }

        return data.sort((a, b) => {
            const aValue = toNumber(a.tyLeHoanThanhBinhQuan)
            const bValue = toNumber(b.tyLeHoanThanhBinhQuan)
            return bValue - aValue
        })
    })

    const thongKe = computed(() => {
        const result = {
            xuatSac: 0,
            tot: 0,
            dat: 0,
            khongDat: 0
        }

        filteredRows.value.forEach(item => {
            const xepLoai = normalizeText(item.xepLoaiTongHop)
            if (xepLoai === 'xuat sac') result.xuatSac++
            else if (xepLoai === 'tot') result.tot++
            else if (xepLoai === 'dat') result.dat++
            else if (xepLoai === 'khong dat') result.khongDat++
        })

        return result
    })

    function resetFilters() {
        filters.kyBaoCaoKPIId = ''
        filters.keyword = ''
        fetchDanhGiaKPI()
    }

    function toNumber(value) {
        if (value === null || value === undefined || value === '') return 0
        const parsed = Number(value)
        return Number.isNaN(parsed) ? 0 : parsed
    }

    function normalizeText(value) {
        return String(value || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim()
    }

    function getTopXepLoai(item) {
        const ranking = [
            { key: 'xuatSac', label: 'Xuất sắc' },
            { key: 'tot', label: 'Tốt' },
            { key: 'dat', label: 'Đạt' },
            { key: 'khongDat', label: 'Không đạt' }
        ]

        let top = ranking[0]

        ranking.forEach(entry => {
            if (item[entry.key] > item[top.key]) {
                top = entry
            }
        })

        return item[top.key] > 0 ? top.label : '-'
    }

    function buildKetQuaTongHop(item) {
        const parts = []

        if (item.xuatSac > 0) parts.push(`Xuất sắc: ${item.xuatSac}`)
        if (item.tot > 0) parts.push(`Tốt: ${item.tot}`)
        if (item.dat > 0) parts.push(`Đạt: ${item.dat}`)
        if (item.khongDat > 0) parts.push(`Không đạt: ${item.khongDat}`)

        return parts.length ? parts.join(' | ') : '-'
    }

    function formatNumber(value) {
        if (value === null || value === undefined || value === '') return '-'
        return Number(value).toLocaleString('vi-VN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        })
    }

    function formatPercent(value) {
        if (value === null || value === undefined || value === '') return '-'
        return `${Number(value).toLocaleString('vi-VN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        })}%`
    }

    function badgeClass(xepLoai) {
        const value = normalizeText(xepLoai)
        if (value === 'xuat sac') return 'badge-excellent'
        if (value === 'tot') return 'badge-good'
        if (value === 'dat') return 'badge-pass'
        if (value === 'khong dat') return 'badge-fail'
        return 'badge-default'
    }

    function exportCsv() {
        const headers = [
            'Mã chỉ tiêu',
            'Tên chỉ tiêu',
            'Số đơn vị đánh giá',
            'Tổng mục tiêu',
            'Tổng đầu kỳ',
            'Tổng cuối kỳ',
            'Tổng cùng kỳ năm trước',
            'CL so với đầu kỳ',
            '% tăng trưởng đầu kỳ',
            'CL cùng kỳ năm trước',
            '% tăng trưởng cùng kỳ',
            '% hoàn thành bình quân',
            'Xếp loại tổng hợp',
            'Kết quả tổng hợp'
        ]

        const csvRows = filteredRows.value.map(item => [
            item.maChiTieu || '',
            item.tenChiTieu || '',
            item.soDonVi ?? '',
            item.tongMucTieu ?? '',
            item.tongDauKy ?? '',
            item.tongCuoiKy ?? '',
            item.tongCungKyNamTruoc ?? '',
            item.chenhLechSoVoiDauKy ?? '',
            item.tyLeTangTruongSoVoiDauKy ?? '',
            item.chenhLechSoVoiCungKyNamTruoc ?? '',
            item.tyLeTangTruongSoVoiCungKyNamTruoc ?? '',
            item.tyLeHoanThanhBinhQuan ?? '',
            item.xepLoaiTongHop || '',
            item.ketQuaTongHop || ''
        ])

        const csvContent = [headers, ...csvRows]
            .map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
            .join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'bao-cao-theo-chi-tieu.csv')
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

    .bao-cao-chi-tieu-page {
        padding: 24px;
        background: #f6f8fb;
        min-height: 100%;
    }

    .page-header {
        margin-bottom: 16px;
    }

    .page-header h2 {
        margin: 0 0 6px;
        font-size: 24px;
        color: #1f2937;
    }

    .page-header p {
        margin: 0;
        color: #6b7280;
    }

    .filter-card,
    .table-card {
        background: #ffffff;
        border-radius: 12px;
        padding: 16px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        margin-bottom: 16px;
    }

    .filter-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
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
        border: 1px solid #d1d5db;
        border-radius: 8px;
        padding: 0 12px;
        outline: none;
    }

    .form-group input:focus,
    .form-group select:focus {
        border-color: #89d2ef;
        box-shadow: 0 0 0 0.2rem rgba(137, 210, 239, 0.2);
    }

    .actions {
        flex-direction: row;
        gap: 10px;
    }

    .btn {
        height: 40px;
        border: none;
        border-radius: 8px;
        padding: 0 16px;
        cursor: pointer;
        font-weight: 600;
    }

    .btn-primary {
        background: #2563eb;
        color: #fff;
    }

    .btn-secondary {
        background: #e5e7eb;
        color: #111827;
    }

    .btn-success {
        background: #16a34a;
        color: #fff;
    }

    .summary-grid {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 16px;
        margin-bottom: 16px;
    }

    .summary-card {
        background: #ffffff;
        border-radius: 12px;
        padding: 16px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .summary-card .label {
        color: #6b7280;
        font-size: 14px;
    }

    .summary-card strong {
        font-size: 24px;
        color: #111827;
    }

    .table-toolbar {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 12px;
    }

    .table-wrapper {
        width: 100%;
        overflow-x: auto;
    }

    table {
        width: max-content;
        min-width: 100%;
        border-collapse: collapse;
        table-layout: auto;
        border: 1px solid #dcdfe6;
    }

    th,
    td {
        border: 1px solid #dcdfe6;
        padding: 10px 12px;
        vertical-align: middle;
        box-sizing: border-box;
        white-space: nowrap;
    }

    th {
        background: #f5f7fa;
        text-align: center;
        font-weight: 600;
    }

    td {
        text-align: left;
    }

    .text-center {
        text-align: center;
    }

    .text-right {
        text-align: right;
    }

    .empty-cell {
        text-align: center;
        padding: 20px;
        color: #909399;
    }

    .state {
        padding: 20px;
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

    .badge {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 600;
        white-space: nowrap;
    }

    .badge-excellent {
        background: #ecfdf3;
        color: #067647;
    }

    .badge-good {
        background: #eff8ff;
        color: #175cd3;
    }

    .badge-pass {
        background: #fffaeb;
        color: #b54708;
    }

    .badge-fail {
        background: #fef3f2;
        color: #d92d20;
    }

    .badge-default {
        background: #f2f4f7;
        color: #344054;
    }

    @media (max-width: 1200px) {

        .filter-grid,
        .summary-grid {
            grid-template-columns: 1fr;
        }

        .actions {
            flex-direction: column;
        }
    }

    @media (max-width: 768px) {
        .gov-banner {
            padding: 16px;
            align-items: flex-start;
        }

        .gov-title {
            font-size: 1.05rem;
        }

        .bao-cao-chi-tieu-page {
            padding: 16px;
        }
    }
</style>