<template>
    <BaseLayout>
        <div class="bao-cao-don-vi-page">
            <div class="page-header">
                <h2>Báo cáo đánh giá KPI theo đơn vị</h2>
                <p>Tổng hợp kết quả đánh giá KPI theo từng đơn vị nhận</p>
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
                        <label>Từ khóa đơn vị</label>
                        <input v-model.trim="filters.keyword" type="text" placeholder="Nhập tên đơn vị..." />
                    </div>

                    <div class="form-group actions">
                        <button class="btn btn-primary" @click="fetchDanhGiaKPI">Tải dữ liệu</button>
                        <button class="btn btn-secondary" @click="resetFilters">Đặt lại</button>
                    </div>
                </div>
            </div>

            <div class="summary-grid">
                <div class="summary-card">
                    <span class="label">Tổng số đơn vị</span>
                    <strong>{{ groupedRows.length }}</strong>
                </div>
                <div class="summary-card">
                    <span class="label">Tổng số chỉ tiêu</span>
                    <strong>{{ tongChiTieu }}</strong>
                </div>
                <div class="summary-card">
                    <span class="label">Tỷ lệ hoàn thành TB</span>
                    <strong>{{ formatPercent(tongHopTyLeHoanThanh) }}</strong>
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
                                <th>Đơn vị</th>
                                <th>Số chỉ tiêu</th>
                                <th>Xuất sắc</th>
                                <th>Tốt</th>
                                <th>Đạt</th>
                                <th>Không đạt</th>
                                <th>Chưa cấu hình</th>
                                <th>Chưa đánh giá</th>
                                <th>Tỷ lệ hoàn thành TB</th>
                                <th>Tỷ lệ hoàn thành cao nhất</th>
                                <th>Tỷ lệ hoàn thành thấp nhất</th>
                                <th>Kỳ báo cáo</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="groupedRows.length === 0">
                                <td colspan="13" class="empty-cell">Không có dữ liệu</td>
                            </tr>
                            <tr v-for="(row, index) in groupedRows" :key="row.tenDonViNhan">
                                <td>{{ index + 1 }}</td>
                                <td>{{ row.tenDonViNhan }}</td>
                                <td class="text-center">{{ row.soChiTieu }}</td>
                                <td class="text-center">{{ row.xuatSac }}</td>
                                <td class="text-center">{{ row.tot }}</td>
                                <td class="text-center">{{ row.dat }}</td>
                                <td class="text-center">{{ row.khongDat }}</td>
                                <td class="text-center">{{ row.chuaCauHinh }}</td>
                                <td class="text-center">{{ row.chuaDanhGia }}</td>
                                <td class="text-right">{{ formatPercent(row.tyLeHoanThanhTrungBinh) }}</td>
                                <td class="text-right">{{ formatPercent(row.tyLeHoanThanhCaoNhat) }}</td>
                                <td class="text-right">{{ formatPercent(row.tyLeHoanThanhThapNhat) }}</td>
                                <td>{{ row.tenKy }}</td>
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

    const groupedRows = computed(() => {
        const keyword = filters.keyword.toLowerCase()
        const map = new Map()

        rows.value.forEach(item => {
            const tenDonViNhan = item.tenDonViNhan || 'Chưa xác định'

            if (keyword && !tenDonViNhan.toLowerCase().includes(keyword)) {
                return
            }

            if (!map.has(tenDonViNhan)) {
                map.set(tenDonViNhan, {
                    tenDonViNhan,
                    soChiTieu: 0,
                    xuatSac: 0,
                    tot: 0,
                    dat: 0,
                    khongDat: 0,
                    chuaCauHinh: 0,
                    chuaDanhGia: 0,
                    tongTyLeHoanThanh: 0,
                    soBanGhiCoTyLe: 0,
                    tyLeHoanThanhCaoNhat: null,
                    tyLeHoanThanhThapNhat: null,
                    tenKy: filters.kyBaoCaoKPIId
                        ? (rows.value.find(x => (x.tenDonViNhan || 'Chưa xác định') === tenDonViNhan)?.tenKy || '-')
                        : 'Nhiều kỳ'
                })
            }

            const group = map.get(tenDonViNhan)
            group.soChiTieu += 1

            const xepLoai = (item.xepLoai || '').toLowerCase()
            if (xepLoai === 'xuất sắc' || xepLoai === 'xuat sac') group.xuatSac += 1
            else if (xepLoai === 'tốt' || xepLoai === 'tot') group.tot += 1
            else if (xepLoai === 'đạt' || xepLoai === 'dat') group.dat += 1
            else if (xepLoai === 'không đạt' || xepLoai === 'khong dat') group.khongDat += 1
            else if (xepLoai === 'chưa cấu hình' || xepLoai === 'chua cau hinh') group.chuaCauHinh += 1
            else if (xepLoai === 'chưa đánh giá' || xepLoai === 'chua danh gia') group.chuaDanhGia += 1

            if (item.tyLeHoanThanh !== null && item.tyLeHoanThanh !== undefined) {
                const tyLe = Number(item.tyLeHoanThanh)
                group.tongTyLeHoanThanh += tyLe
                group.soBanGhiCoTyLe += 1

                if (group.tyLeHoanThanhCaoNhat === null || tyLe > group.tyLeHoanThanhCaoNhat) {
                    group.tyLeHoanThanhCaoNhat = tyLe
                }

                if (group.tyLeHoanThanhThapNhat === null || tyLe < group.tyLeHoanThanhThapNhat) {
                    group.tyLeHoanThanhThapNhat = tyLe
                }
            }
        })

        return Array.from(map.values())
            .map(item => ({
                ...item,
                tyLeHoanThanhTrungBinh: item.soBanGhiCoTyLe > 0
                    ? item.tongTyLeHoanThanh / item.soBanGhiCoTyLe
                    : null
            }))
            .sort((a, b) => a.tenDonViNhan.localeCompare(b.tenDonViNhan, 'vi'))
    })

    const tongChiTieu = computed(() => {
        return groupedRows.value.reduce((sum, item) => sum + item.soChiTieu, 0)
    })

    const tongHopTyLeHoanThanh = computed(() => {
        const valid = groupedRows.value.filter(x => x.tyLeHoanThanhTrungBinh !== null)
        if (valid.length === 0) return null
        return valid.reduce((sum, item) => sum + item.tyLeHoanThanhTrungBinh, 0) / valid.length
    })

    function formatPercent(value) {
        if (value === null || value === undefined || value === '') return '-'
        return `${Number(value).toLocaleString('vi-VN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        })}%`
    }

    function exportCsv() {
        const headers = [
            'Đơn vị',
            'Số chỉ tiêu',
            'Xuất sắc',
            'Tốt',
            'Đạt',
            'Không đạt',
            'Chưa cấu hình',
            'Chưa đánh giá',
            'Tỷ lệ hoàn thành TB',
            'Tỷ lệ hoàn thành cao nhất',
            'Tỷ lệ hoàn thành thấp nhất',
            'Kỳ báo cáo'
        ]

        const csvRows = groupedRows.value.map(item => [
            item.tenDonViNhan,
            item.soChiTieu,
            item.xuatSac,
            item.tot,
            item.dat,
            item.khongDat,
            item.chuaCauHinh,
            item.chuaDanhGia,
            item.tyLeHoanThanhTrungBinh ?? '',
            item.tyLeHoanThanhCaoNhat ?? '',
            item.tyLeHoanThanhThapNhat ?? '',
            item.tenKy
        ])

        const csvContent = [headers, ...csvRows]
            .map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
            .join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'bao-cao-danh-gia-kpi-theo-don-vi.csv')
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
    }
</script>

<style scoped>
    .bao-cao-don-vi-page {
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
        grid-template-columns: repeat(3, minmax(0, 1fr));
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
        min-width: 1400px;
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