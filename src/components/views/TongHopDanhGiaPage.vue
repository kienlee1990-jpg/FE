<template>
    <BaseLayout>
        <div class="page-wrap">
            <div class="container-fluid py-4">
                <div class="gov-banner mb-4">
                    <div class="gov-emblem">
                        <i class="bi bi-collection"></i>
                    </div>
                    <div class="gov-text">
                        <div class="wave-title">HỆ THỐNG THEO DÕI CHỈ TIÊU CÔNG TÁC</div>
                        <div class="gov-title">TỔNG HỢP ĐÁNH GIÁ KPI THEO NHÓM</div>
                        <div class="gov-sub"></div>
                    </div>
                </div>

                <div class="danh-gia-kpi-page">
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
                                    <option v-for="item in kyBaoCaoOptions" :key="item.id || item.Id"
                                        :value="item.id || item.Id">
                                        {{ item.tenKy || item.TenKy || '-' }}
                                    </option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>Từ khóa</label>
                                <input v-model.trim="filters.keyword" type="text"
                                    placeholder="Mã chỉ tiêu, tên chỉ tiêu, đơn vị, đợt giao, xếp loại..." />
                            </div>

                            <div class="form-group actions">
                                <button class="btn btn-primary" @click="fetchDanhGiaKPI">Tải dữ liệu</button>
                                <button class="btn btn-secondary" @click="resetFilters">Đặt lại</button>
                            </div>
                        </div>
                    </div>

                    <div class="summary-grid">
                        <div class="summary-card">
                            <span class="label">Tổng số nhóm</span>
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
                                        <th>Đợt giao chỉ tiêu</th>
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
                                        <th class="text-center">Số bản ghi gộp</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-if="filteredRows.length === 0">
                                        <td colspan="25" class="empty-cell">Không có dữ liệu</td>
                                    </tr>

                                    <tr v-for="(row, index) in filteredRows" :key="row.groupKey">
                                        <td>{{ index + 1 }}</td>
                                        <td>{{ row.maChiTieu || '-' }}</td>
                                        <td>{{ row.tenChiTieu || '-' }}</td>
                                        <td>{{ row.tenDonViNhan || '-' }}</td>
                                        <td>{{ row.tenDotGiaoChiTieu || '-' }}</td>
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
                                        <td class="text-right">{{ formatPercent(row.tyLeTangTruongSoVoiCungKyNamTruoc)
                                            }}</td>
                                        <td class="text-right">{{ formatPercent(row.tyLeHoanThanh) }}</td>
                                        <td>
                                            <span class="badge" :class="badgeClass(row.xepLoai)">
                                                {{ row.xepLoai || '-' }}
                                            </span>
                                        </td>
                                        <td>{{ row.ketQuaText || '-' }}</td>
                                        <td>{{ row.nhanXetDanhGia || '-' }}</td>
                                        <td>{{ row.nguoiDanhGia || '-' }}</td>
                                        <td>{{ formatDateTime(row.ngayDanhGia) }}</td>
                                        <td class="text-center">{{ row.soBanGhiGop }}</td>
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

    const groupedRows = computed(() => {
        const map = new Map()

        for (const item of rows.value) {
            const groupKey = buildGroupKey(item)

            if (!map.has(groupKey)) {
                map.set(groupKey, createInitialGroup(item, groupKey))
            }

            mergeIntoGroup(map.get(groupKey), item)
        }

        return Array.from(map.values())
            .map(finalizeGroup)
            .sort((a, b) => {
                const tenA = `${a.tenDonViNhan || ''} ${a.tenChiTieu || ''} ${a.tenDotGiaoChiTieu || ''}`.toLowerCase()
                const tenB = `${b.tenDonViNhan || ''} ${b.tenChiTieu || ''} ${b.tenDotGiaoChiTieu || ''}`.toLowerCase()
                return tenA.localeCompare(tenB, 'vi')
            })
    })

    const filteredRows = computed(() => {
        let data = [...groupedRows.value]

        if (filters.keyword) {
            const keyword = filters.keyword.toLowerCase()
            data = data.filter(item =>
                [
                    item.maChiTieu,
                    item.tenChiTieu,
                    item.tenDonViNhan,
                    item.tenDotGiaoChiTieu,
                    item.maKy,
                    item.tenKy,
                    item.loaiKy,
                    item.xepLoai,
                    item.ketQuaText,
                    item.nguoiDanhGia,
                    item.nhanXetDanhGia
                ]
                    .filter(Boolean)
                    .some(value => String(value).toLowerCase().includes(keyword))
            )
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
            const xepLoai = normalizeVietnamese(item.xepLoai)
            if (xepLoai === 'xuat sac') result.xuatSac++
            else if (xepLoai === 'tot') result.tot++
            else if (xepLoai === 'dat') result.dat++
            else if (xepLoai === 'khong dat') result.khongDat++
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
            console.error('Lỗi tải dữ liệu đánh giá KPI:', error)
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

    function buildGroupKey(item) {
        const chiTieuKey = getChiTieuKey(item)
        const donViKey = getDonViKey(item)
        const dotKey = getDotGiaoChiTieuKey(item)

        if (!dotKey || dotKey === 'khong-xac-dinh') {
            const fallbackId =
                item.id ??
                item.Id ??
                item.danhGiaKPIId ??
                item.DanhGiaKPIId ??
                `${chiTieuKey}__${donViKey}__${Math.random()}`
            return `${chiTieuKey}__${donViKey}__${fallbackId}`
        }

        return `${chiTieuKey}__${donViKey}__${dotKey}`
    }

    function createInitialGroup(item, groupKey) {
        return {
            groupKey,
            maChiTieu: item.maChiTieu || item.MaChiTieu || '',
            tenChiTieu: item.tenChiTieu || item.TenChiTieu || '',
            tenDonViNhan: item.tenDonViNhan || item.TenDonViNhan || '',
            tenDotGiaoChiTieu: getTenDotGiaoChiTieu(item),
            maKy: item.maKy || item.MaKy || '',
            tenKy: item.tenKy || item.TenKy || '',
            loaiKy: item.loaiKy || item.LoaiKy || '',
            nam: item.nam ?? item.Nam ?? '',
            soKy: item.soKy ?? item.SoKy ?? '',
            giaTriMucTieu: getNumberOrNull(item.giaTriMucTieu ?? item.GiaTriMucTieu),
            giaTriDauKy: 0,
            giaTriCuoiKy: 0,
            giaTriCungKyNamTruoc: 0,
            chenhLechSoVoiDauKy: 0,
            tyLeTangTruongSoVoiDauKy: 0,
            chenhLechSoVoiCungKyNamTruoc: 0,
            tyLeTangTruongSoVoiCungKyNamTruoc: 0,
            tyLeHoanThanh: 0,
            ketQuaNumber: 0,
            ketQuaText: '',
            nhanXetDanhGia: item.nhanXetDanhGia || item.NhanXetDanhGia || '',
            nguoiDanhGia: item.nguoiDanhGia || item.NguoiDanhGia || '',
            ngayDanhGia: item.ngayDanhGia || item.NgayDanhGia || null,
            xepLoai: '',
            soBanGhiGop: 0
        }
    }

    function mergeIntoGroup(group, item) {
        group.soBanGhiGop += 1

        if (!group.maChiTieu) group.maChiTieu = item.maChiTieu || item.MaChiTieu || ''
        if (!group.tenChiTieu) group.tenChiTieu = item.tenChiTieu || item.TenChiTieu || ''
        if (!group.tenDonViNhan) group.tenDonViNhan = item.tenDonViNhan || item.TenDonViNhan || ''
        if (!group.tenDotGiaoChiTieu || group.tenDotGiaoChiTieu === '-') {
            group.tenDotGiaoChiTieu = getTenDotGiaoChiTieu(item)
        }
        if (!group.maKy) group.maKy = item.maKy || item.MaKy || ''
        if (!group.tenKy) group.tenKy = item.tenKy || item.TenKy || ''
        if (!group.loaiKy) group.loaiKy = item.loaiKy || item.LoaiKy || ''
        if (group.nam === '' || group.nam === null || group.nam === undefined) group.nam = item.nam ?? item.Nam ?? ''
        if (group.soKy === '' || group.soKy === null || group.soKy === undefined) group.soKy = item.soKy ?? item.SoKy ?? ''

        group.giaTriDauKy += toNumber(item.giaTriDauKy ?? item.GiaTriDauKy)
        group.giaTriCuoiKy += toNumber(item.giaTriCuoiKy ?? item.GiaTriCuoiKy)
        group.giaTriCungKyNamTruoc += toNumber(item.giaTriCungKyNamTruoc ?? item.GiaTriCungKyNamTruoc)

        const ketQuaNumber = extractKetQuaNumber(item.ketQua ?? item.KetQua)
        group.ketQuaNumber += ketQuaNumber

        const mucTieu = getNumberOrNull(item.giaTriMucTieu ?? item.GiaTriMucTieu)
        if (group.giaTriMucTieu === null && mucTieu !== null) {
            group.giaTriMucTieu = mucTieu
        }

        const nhanXet = item.nhanXetDanhGia || item.NhanXetDanhGia || ''
        if (!group.nhanXetDanhGia && nhanXet) {
            group.nhanXetDanhGia = nhanXet
        }

        const nguoiDanhGia = item.nguoiDanhGia || item.NguoiDanhGia || ''
        if (!group.nguoiDanhGia && nguoiDanhGia) {
            group.nguoiDanhGia = nguoiDanhGia
        }

        const ngayDanhGia = item.ngayDanhGia || item.NgayDanhGia || null
        if (isLaterDate(ngayDanhGia, group.ngayDanhGia)) {
            group.ngayDanhGia = ngayDanhGia
        }
    }

    function finalizeGroup(group) {
        const dauKy = toNumber(group.giaTriDauKy)
        const cuoiKy = toNumber(group.giaTriCuoiKy)
        const cungKy = toNumber(group.giaTriCungKyNamTruoc)
        const mucTieu = toNumber(group.giaTriMucTieu)

        group.chenhLechSoVoiDauKy = cuoiKy - dauKy
        group.tyLeTangTruongSoVoiDauKy = dauKy !== 0 ? ((cuoiKy - dauKy) / dauKy) * 100 : 0

        group.chenhLechSoVoiCungKyNamTruoc = cuoiKy - cungKy
        group.tyLeTangTruongSoVoiCungKyNamTruoc =
            cungKy !== 0 ? ((cuoiKy - cungKy) / cungKy) * 100 : 0

        group.tyLeHoanThanh = mucTieu !== 0 ? (cuoiKy / mucTieu) * 100 : 0
        group.xepLoai = xepLoaiFromTyLeHoanThanh(group.tyLeHoanThanh)
        group.ketQuaText = formatNumber(group.ketQuaNumber)

        return group
    }

    function getChiTieuKey(item) {
        return (
            item.chiTieuId ??
            item.ChiTieuId ??
            item.maChiTieu ??
            item.MaChiTieu ??
            item.tenChiTieu ??
            item.TenChiTieu ??
            'khong-xac-dinh'
        )
    }

    function getDonViKey(item) {
        return (
            item.donViNhanId ??
            item.DonViNhanId ??
            item.tenDonViNhan ??
            item.TenDonViNhan ??
            'khong-xac-dinh'
        )
    }

    function getDotGiaoChiTieuKey(item) {
        return (
            item.dotGiaoChiTieuId ??
            item.DotGiaoChiTieuId ??
            item.maDotGiaoChiTieu ??
            item.MaDotGiaoChiTieu ??
            item.tenDotGiaoChiTieu ??
            item.TenDotGiaoChiTieu ??
            item.dotGiaoChiTieu ??
            item.DotGiaoChiTieu ??
            null
        ) || 'khong-xac-dinh'
    }

    function getTenDotGiaoChiTieu(item) {
        return (
            item.tenDotGiaoChiTieu ||
            item.TenDotGiaoChiTieu ||
            item.dotGiaoChiTieu ||
            item.DotGiaoChiTieu ||
            item.maDotGiaoChiTieu ||
            item.MaDotGiaoChiTieu ||
            (item.dotGiaoChiTieuId ?? item.DotGiaoChiTieuId ?? '')
        ) || '-'
    }

    function extractKetQuaNumber(value) {
        if (value === null || value === undefined || value === '') return 0
        if (typeof value === 'number') return value

        const normalized = String(value).replace(/\./g, '').replace(',', '.').trim()
        const parsed = Number(normalized)
        return Number.isFinite(parsed) ? parsed : 0
    }

    function xepLoaiFromTyLeHoanThanh(value) {
        const percent = toNumber(value)
        if (percent >= 120) return 'Xuất sắc'
        if (percent >= 100) return 'Tốt'
        if (percent >= 80) return 'Đạt'
        return 'Không đạt'
    }

    function toNumber(value) {
        if (value === null || value === undefined || value === '') return 0
        const num = Number(value)
        return Number.isFinite(num) ? num : 0
    }

    function getNumberOrNull(value) {
        if (value === null || value === undefined || value === '') return null
        const num = Number(value)
        return Number.isFinite(num) ? num : null
    }

    function normalizeVietnamese(value) {
        return String(value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D')
            .trim()
            .toLowerCase()
    }

    function isLaterDate(a, b) {
        if (!a) return false
        if (!b) return true

        const dateA = new Date(a)
        const dateB = new Date(b)

        if (Number.isNaN(dateA.getTime())) return false
        if (Number.isNaN(dateB.getTime())) return true

        return dateA.getTime() > dateB.getTime()
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
        const value = normalizeVietnamese(xepLoai)
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
            'Đơn vị',
            'Đợt giao chỉ tiêu',
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
            'Ngày đánh giá',
            'Số bản ghi gộp'
        ]

        const csvRows = filteredRows.value.map(item => [
            item.maChiTieu || '',
            item.tenChiTieu || '',
            item.tenDonViNhan || '',
            item.tenDotGiaoChiTieu || '',
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
            item.ketQuaText || '',
            item.nhanXetDanhGia || '',
            item.nguoiDanhGia || '',
            item.ngayDanhGia || '',
            item.soBanGhiGop ?? 0
        ])

        const csvContent = [headers, ...csvRows]
            .map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
            .join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'tong-hop-danh-gia-kpi-theo-nhom.csv')
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

    .table-wrapper table {
        width: max-content;
        min-width: 100%;
        border-collapse: collapse;
        table-layout: auto;
        border: 1px solid #dcdfe6;
    }

    .table-wrapper th,
    .table-wrapper td {
        border: 1px solid #dcdfe6;
        padding: 10px 12px;
        vertical-align: middle;
        box-sizing: border-box;
        white-space: nowrap;
    }

    .table-wrapper th {
        background: #f5f7fa;
        text-align: center;
        font-weight: 600;
    }

    .table-wrapper td {
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
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 88px;
        padding: 6px 10px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 700;
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

        .danh-gia-kpi-page {
            padding: 16px;
        }
    }
</style>