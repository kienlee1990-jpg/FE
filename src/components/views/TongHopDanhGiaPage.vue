<template>
    <BaseLayout>
        <div class="danh-gia-kpi-page">
            <div class="page-header">
                <h2>Tổng hợp đánh giá KPI</h2>
                <p>Theo dõi kết quả đánh giá KPI theo kỳ báo cáo</p>
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
                            placeholder="Nhập mã chỉ tiêu, tên chỉ tiêu, đơn vị, xếp loại..." />
                    </div>

                    <div class="form-group actions">
                        <button class="btn btn-primary" @click="fetchDanhGiaKPI">Tải dữ liệu</button>
                        <button class="btn btn-secondary" @click="resetFilters">Đặt lại</button>
                    </div>
                </div>
            </div>

            <div class="summary-grid">
                <div class="summary-card">
                    <span class="label">Tổng số bản ghi</span>
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
                                <th>Đơn vị</th>
                                <th>Mã kỳ</th>
                                <th>Tên kỳ</th>
                                <th>Loại kỳ</th>
                                <th>Năm</th>
                                <th>Số kỳ</th>
                                <th>Mục tiêu</th>
                                <th>Đầu kỳ</th>
                                <th>Cuối kỳ</th>
                                <th>Cùng kỳ năm trước</th>
                                <th>CL so với đầu kỳ</th>
                                <th>% tăng trưởng đầu kỳ</th>
                                <th>CL cùng kỳ năm trước</th>
                                <th>% tăng trưởng cùng kỳ</th>
                                <th>% hoàn thành</th>
                                <th>Xếp loại</th>
                                <th>Kết quả</th>
                                <th>Nhận xét</th>
                                <th>Người đánh giá</th>
                                <th>Ngày đánh giá</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="filteredRows.length === 0">
                                <td colspan="23" class="empty-cell">Không có dữ liệu</td>
                            </tr>
                            <tr v-for="(row, index) in filteredRows" :key="row.id">
                                <td>{{ index + 1 }}</td>
                                <td>{{ row.maChiTieu || '-' }}</td>
                                <td>{{ row.tenChiTieu || '-' }}</td>
                                <td>{{ row.tenDonViNhan || '-' }}</td>
                                <td>{{ row.maKy || '-' }}</td>
                                <td>{{ row.tenKy || '-' }}</td>
                                <td>{{ row.loaiKy || '-' }}</td>
                                <td class="text-center">{{ row.nam || '-' }}</td>
                                <td class="text-center">{{ row.soKy ?? '-' }}</td>
                                <td class="text-right">{{ formatNumber(row.giaTriMucTieu) }}</td>
                                <td class="text-right">{{ formatNumber(row.giaTriDauKy) }}</td>
                                <td class="text-right">{{ formatNumber(row.giaTriCuoiKy) }}</td>
                                <td class="text-right">{{ formatNumber(row.giaTriCungKyNamTruoc) }}</td>
                                <td class="text-right">{{ formatNumber(row.chenhLechSoVoiDauKy) }}</td>
                                <td class="text-right">{{ formatPercent(row.tyLeTangTruongSoVoiDauKy) }}</td>
                                <td class="text-right">{{ formatNumber(row.chenhLechSoVoiCungKyNamTruoc) }}</td>
                                <td class="text-right">{{ formatPercent(row.tyLeTangTruongSoVoiCungKyNamTruoc) }}</td>
                                <td class="text-right">{{ formatPercent(row.tyLeHoanThanh) }}</td>
                                <td>
                                    <span class="badge" :class="badgeClass(row.xepLoai)">
                                        {{ row.xepLoai || '-' }}
                                    </span>
                                </td>
                                <td>{{ row.ketQua || '-' }}</td>
                                <td>{{ row.nhanXetDanhGia || '-' }}</td>
                                <td>{{ row.nguoiDanhGia || '-' }}</td>
                                <td>{{ formatDateTime(row.ngayDanhGia) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </BaseLayout>
</template>

<script setup>
    import { computed, onMounted, reactive, ref } from 'vue'
    import axios from 'axios'
    import BaseLayout from '../BaseLayout.vue'

    const API_BASE = 'https://localhost:5000/api'

    const loading = ref(false)
    const errorMessage = ref('')
    const rows = ref([])
    const kyBaoCaoOptions = ref([])

    const filters = reactive({
        kyBaoCaoKPIId: '',
        keyword: ''
    })

    const filteredRows = computed(() => {
        let data = [...rows.value]

        if (filters.keyword) {
            const keyword = filters.keyword.toLowerCase()
            data = data.filter(item => {
                return [
                    item.maChiTieu,
                    item.tenChiTieu,
                    item.tenDonViNhan,
                    item.maKy,
                    item.tenKy,
                    item.loaiKy,
                    item.xepLoai,
                    item.ketQua,
                    item.nguoiDanhGia,
                    item.nhanXetDanhGia
                ]
                    .filter(Boolean)
                    .some(value => String(value).toLowerCase().includes(keyword))
            })
        }

        return data
    })

    const thongKe = computed(() => {
        const result = {
            xuatSac: 0,
            tot: 0,
            dat: 0,
            khongDat: 0
        }

        filteredRows.value.forEach(item => {
            const xepLoai = (item.xepLoai || '').toLowerCase()
            if (xepLoai === 'xuất sắc' || xepLoai === 'xuat sac') result.xuatSac++
            else if (xepLoai === 'tốt' || xepLoai === 'tot') result.tot++
            else if (xepLoai === 'đạt' || xepLoai === 'dat') result.dat++
            else if (xepLoai === 'không đạt' || xepLoai === 'khong dat') result.khongDat++
        })

        return result
    })

    onMounted(async () => {
        await Promise.all([fetchKyBaoCao(), fetchDanhGiaKPI()])
    })

    async function fetchKyBaoCao() {
        try {
            const response = await axios.get(`${API_BASE}/KyBaoCaoKPI`)
            kyBaoCaoOptions.value = Array.isArray(response.data) ? response.data : []
        } catch (error) {
            console.error('Lỗi tải kỳ báo cáo:', error)
        }
    }

    async function fetchDanhGiaKPI() {
        loading.value = true
        errorMessage.value = ''

        try {
            let response

            if (filters.kyBaoCaoKPIId) {
                response = await axios.get(`${API_BASE}/DanhGiaKPI/by-ky-bao-cao/${filters.kyBaoCaoKPIId}`)
            } else {
                response = await axios.get(`${API_BASE}/DanhGiaKPI`)
            }

            rows.value = Array.isArray(response.data) ? response.data : []
        } catch (error) {
            console.error(error)
            errorMessage.value = error?.response?.data?.message || 'Không thể tải dữ liệu đánh giá KPI.'
            rows.value = []
        } finally {
            loading.value = false
        }
    }

    function resetFilters() {
        filters.kyBaoCaoKPIId = ''
        filters.keyword = ''
        fetchDanhGiaKPI()
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

    function formatDateTime(value) {
        if (!value) return '-'
        const date = new Date(value)
        if (Number.isNaN(date.getTime())) return '-'
        return date.toLocaleString('vi-VN')
    }

    function badgeClass(xepLoai) {
        const value = (xepLoai || '').toLowerCase()
        if (value === 'xuất sắc' || value === 'xuat sac') return 'badge-excellent'
        if (value === 'tốt' || value === 'tot') return 'badge-good'
        if (value === 'đạt' || value === 'dat') return 'badge-pass'
        if (value === 'không đạt' || value === 'khong dat') return 'badge-fail'
        return 'badge-default'
    }

    function exportCsv() {
        const headers = [
            'Mã chỉ tiêu',
            'Tên chỉ tiêu',
            'Đơn vị',
            'Mã kỳ',
            'Tên kỳ',
            'Loại kỳ',
            'Năm',
            'Số kỳ',
            'Mục tiêu',
            'Đầu kỳ',
            'Cuối kỳ',
            'Cùng kỳ năm trước',
            'CL so với đầu kỳ',
            '% tăng trưởng đầu kỳ',
            'CL cùng kỳ năm trước',
            '% tăng trưởng cùng kỳ',
            '% hoàn thành',
            'Xếp loại',
            'Kết quả',
            'Nhận xét',
            'Người đánh giá',
            'Ngày đánh giá'
        ]

        const csvRows = filteredRows.value.map(item => [
            item.maChiTieu || '',
            item.tenChiTieu || '',
            item.tenDonViNhan || '',
            item.maKy || '',
            item.tenKy || '',
            item.loaiKy || '',
            item.nam ?? '',
            item.soKy ?? '',
            item.giaTriMucTieu ?? '',
            item.giaTriDauKy ?? '',
            item.giaTriCuoiKy ?? '',
            item.giaTriCungKyNamTruoc ?? '',
            item.chenhLechSoVoiDauKy ?? '',
            item.tyLeTangTruongSoVoiDauKy ?? '',
            item.chenhLechSoVoiCungKyNamTruoc ?? '',
            item.tyLeTangTruongSoVoiCungKyNamTruoc ?? '',
            item.tyLeHoanThanh ?? '',
            item.xepLoai || '',
            item.ketQua || '',
            item.nhanXetDanhGia || '',
            item.nguoiDanhGia || '',
            item.ngayDanhGia || ''
        ])

        const csvContent = [headers, ...csvRows]
            .map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
            .join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'tong-hop-danh-gia-kpi.csv')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
    }
</script>

<style scoped>
    .danh-gia-kpi-page {
        padding: 20px;
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
        overflow: auto;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        min-width: 2200px;
    }

    thead th {
        background: #f3f4f6;
        color: #111827;
        font-weight: 700;
        text-align: left;
        padding: 12px;
        border-bottom: 1px solid #e5e7eb;
        white-space: nowrap;
    }

    tbody td {
        padding: 12px;
        border-bottom: 1px solid #f1f5f9;
        vertical-align: top;
    }

    .text-right {
        text-align: right;
    }

    .text-center {
        text-align: center;
    }

    .empty-cell {
        text-align: center;
        color: #6b7280;
        padding: 24px;
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
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 88px;
        padding: 6px 10px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 700;
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

    .badge-default {
        background: #e5e7eb;
        color: #374151;
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
</style>