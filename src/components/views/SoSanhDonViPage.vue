<template>
    <BaseLayout>
        <div class="page-wrap">
            <div class="container-fluid py-4">
                <div class="gov-banner mb-4">
                    <div class="gov-emblem">
                        <i class="bi bi-bar-chart-line"></i>
                    </div>
                    <div class="gov-text">
                        <div class="gov-title">SO SÁNH ĐƠN VỊ</div>
                        <div class="gov-sub"></div>
                    </div>
                </div>

                <div class="compare-page">
                    <div class="page-header">
                        <div class="header-actions ms-auto">
                            <button class="btn btn-primary" @click="fetchCompareData">Tải dữ liệu</button>
                            <button class="btn btn-secondary" @click="resetFilters">Đặt lại</button>
                        </div>
                    </div>

                    <div class="filter-card">
                        <div class="filter-grid">
                            <div class="form-group">
                                <label>Kỳ báo cáo</label>
                                <select v-model="filters.kyBaoCaoKPIId" @change="fetchCompareData">
                                    <option value="">-- Tất cả kỳ báo cáo --</option>
                                    <option v-for="item in kyBaoCaoOptions" :key="item.id" :value="item.id">
                                        {{ item.tenKy }}
                                    </option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>Đơn vị 1</label>
                                <select v-model="filters.unitA">
                                    <option value="">-- Chọn đơn vị --</option>
                                    <option v-for="item in donViOptions" :key="`a-${item}`" :value="item">
                                        {{ item }}
                                    </option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>Đơn vị 2</label>
                                <select v-model="filters.unitB">
                                    <option value="">-- Chọn đơn vị --</option>
                                    <option v-for="item in donViOptions" :key="`b-${item}`" :value="item">
                                        {{ item }}
                                    </option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>Sắp xếp</label>
                                <select v-model="filters.sortBy">
                                    <option value="avgCompletion">Theo % hoàn thành TB</option>
                                    <option value="total">Theo số chỉ tiêu</option>
                                    <option value="vuotMuc">Theo số chỉ tiêu hoàn thành vượt mức</option>
                                    <option value="canChuY">Theo số chỉ tiêu chưa/không hoàn thành</option>
                                </select>
                            </div>

                            <div class="form-group keyword-group">
                                <label>Từ khóa</label>
                                <input v-model.trim="filters.keyword" type="text"
                                    placeholder="Nhập tên đơn vị, mã chỉ tiêu, tên chỉ tiêu..." />
                            </div>
                        </div>
                    </div>

                    <div v-if="loading" class="state loading">Đang tải dữ liệu so sánh đơn vị...</div>
                    <div v-else-if="errorMessage" class="state error">{{ errorMessage }}</div>

                    <template v-else>
                        <div class="stats-grid">
                            <div class="stat-card">
                                <span class="stat-label">Tổng đơn vị</span>
                                <strong class="stat-value">{{ unitSummaries.length }}</strong>
                                <span class="stat-note">Trong phạm vi lọc</span>
                            </div>

                            <div class="stat-card">
                                <span class="stat-label">Tổng chỉ tiêu</span>
                                <strong class="stat-value">{{ filteredRows.length }}</strong>
                                <span class="stat-note">Bản ghi đánh giá</span>
                            </div>

                            <div class="stat-card success">
                                <span class="stat-label">Đơn vị tốt nhất</span>
                                <strong class="stat-value">{{ bestUnit?.tenDonVi || '-' }}</strong>
                                <span class="stat-note">
                                    {{ bestUnit ? formatPercent(bestUnit.avgCompletion) : '-' }}
                                </span>
                            </div>

                            <div class="stat-card danger">
                                <span class="stat-label">Đơn vị cần chú ý</span>
                                <strong class="stat-value">{{ worstUnit?.tenDonVi || '-' }}</strong>
                                <span class="stat-note">
                                    {{ worstUnit ? `${worstUnit.canChuY} chỉ tiêu cần chú ý` : '-' }}
                                </span>
                            </div>
                        </div>

                        <div class="dashboard-grid two-columns">
                            <section class="panel-card">
                                <div class="panel-header">
                                    <div class="panel-title">
                                        <h3>Xếp hạng đơn vị</h3>
                                        <span>Top {{ topUnitSummaries.length }}/{{ unitSummaries.length }} đơn vị</span>
                                    </div>
                                    <button v-if="hasMoreUnits" type="button" class="btn btn-light view-more-btn"
                                        @click="openFullChartModal('ranking')">
                                        <i class="bi bi-arrows-fullscreen"></i>
                                        <span>Xem thêm</span>
                                    </button>
                                </div>

                                <div v-if="unitSummaries.length === 0" class="empty-panel">Không có dữ liệu</div>
                                <div v-else class="chart-wrapper">
                                    <apexchart type="bar" height="360" :options="unitCompareChartOptions"
                                        :series="unitCompareChartSeries" />
                                </div>
                            </section>

                            <section class="panel-card">
                                <div class="panel-header">
                                    <div class="panel-title">
                                        <h3>Tỷ trọng xếp loại theo đơn vị</h3>
                                        <span>Top {{ topUnitSummaries.length }}/{{ unitSummaries.length }} đơn vị</span>
                                    </div>
                                    <button v-if="hasMoreUnits" type="button" class="btn btn-light view-more-btn"
                                        @click="openFullChartModal('status')">
                                        <i class="bi bi-arrows-fullscreen"></i>
                                        <span>Xem thêm</span>
                                    </button>
                                </div>

                                <div v-if="stackedUnitSeries.length === 0" class="empty-panel">Không có dữ liệu</div>
                                <div v-else class="chart-wrapper">
                                    <apexchart type="bar" height="360" :options="stackedUnitChartOptions"
                                        :series="stackedUnitSeries" />
                                </div>
                            </section>
                        </div>

                        <div class="dashboard-grid two-columns" v-if="selectedUnits.length > 0">
                            <section class="panel-card">
                                <div class="panel-header">
                                    <h3>So sánh trực tiếp 2 đơn vị</h3>
                                    <span>{{ selectedUnitsLabel }}</span>
                                </div>

                                <div class="compare-duo-grid">
                                    <div v-for="unit in selectedUnits" :key="unit.tenDonVi" class="compare-unit-card">
                                        <div class="compare-unit-head">
                                            <h4>{{ unit.tenDonVi }}</h4>
                                            <span>{{ unit.total }} chỉ tiêu</span>
                                        </div>

                                        <div class="compare-metrics">
                                            <div class="metric-item">
                                                <span>% hoàn thành TB</span>
                                                <strong>{{ formatPercent(unit.avgCompletion) }}</strong>
                                            </div>
                                            <div class="metric-item">
                                                <span>Hoàn thành vượt mức</span>
                                                <strong>{{ unit.HOAN_THANH_VUOT_MUC }}</strong>
                                            </div>
                                            <div class="metric-item">
                                                <span>Hoàn thành</span>
                                                <strong>{{ unit.HOAN_THANH }}</strong>
                                            </div>
                                            <div class="metric-item">
                                                <span>Chưa hoàn thành</span>
                                                <strong>{{ unit.CHUA_HOAN_THANH }}</strong>
                                            </div>
                                            <div class="metric-item">
                                                <span>Không hoàn thành</span>
                                                <strong>{{ unit.KHONG_HOAN_THANH }}</strong>
                                            </div>
                                            <div class="metric-item">
                                                <span>Tăng so với đầu kỳ</span>
                                                <strong>{{ unit.positiveDauKy }}</strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="compare-summary" v-if="selectedUnits.length === 2">
                                    <div class="summary-row">
                                        <span>Chênh lệch % hoàn thành TB</span>
                                        <strong>{{ formatPercent(compareGap.avgCompletionGap) }}</strong>
                                    </div>
                                    <div class="summary-row">
                                        <span>Chênh lệch chỉ tiêu cần chú ý</span>
                                        <strong>{{ compareGap.canChuYGap }}</strong>
                                    </div>
                                    <div class="summary-row">
                                        <span>Đơn vị nhỉnh hơn</span>
                                        <strong>{{ compareGap.betterUnit }}</strong>
                                    </div>
                                </div>
                            </section>

                            <section class="panel-card">
                                <div class="panel-header">
                                    <h3>Biểu đồ so sánh chi tiết</h3>
                                    <span>Theo 2 đơn vị đã chọn</span>
                                </div>

                                <div v-if="duoCompareSeries.length === 0" class="empty-panel">Chưa chọn đủ đơn vị</div>
                                <div v-else class="chart-wrapper">
                                    <apexchart type="radar" height="360" :options="duoCompareChartOptions"
                                        :series="duoCompareSeries" />
                                </div>
                            </section>
                        </div>

                        <section class="panel-card">
                            <div class="panel-header">
                                <h3>Bảng tổng hợp đơn vị</h3>
                                <span>{{ unitSummaries.length }} dòng</span>
                            </div>

                            <div v-if="unitSummaries.length === 0" class="empty-panel">Không có dữ liệu đơn vị</div>
                            <div v-else class="table-wrapper">
                                <ColumnVisibilityTools table-id="SoSanhDonViPage-table" />
                            <table id="SoSanhDonViPage-table" class="data-table managed-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Đơn vị</th>
                                            <th>Số chỉ tiêu</th>
                                            <th>% hoàn thành TB</th>
                                            <th>Hoàn thành vượt mức</th>
                                            <th>Hoàn thành</th>
                                            <th>Chưa hoàn thành</th>
                                            <th>Không hoàn thành</th>
                                            <th>Tăng đầu kỳ</th>
                                            <th>Giảm đầu kỳ</th>
                                            <th>Tăng cùng kỳ</th>
                                            <th>Giảm cùng kỳ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="(item, index) in unitSummaries" :key="item.tenDonVi">
                                            <td>{{ index + 1 }}</td>
                                            <td>{{ item.tenDonVi }}</td>
                                            <td>{{ item.total }}</td>
                                            <td>{{ formatPercent(item.avgCompletion) }}</td>
                                            <td>{{ item.HOAN_THANH_VUOT_MUC }}</td>
                                            <td>{{ item.HOAN_THANH }}</td>
                                            <td>{{ item.CHUA_HOAN_THANH }}</td>
                                            <td>{{ item.KHONG_HOAN_THANH }}</td>
                                            <td>{{ item.positiveDauKy }}</td>
                                            <td>{{ item.negativeDauKy }}</td>
                                            <td>{{ item.positiveCungKy }}</td>
                                            <td>{{ item.negativeCungKy }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <div v-if="chartModalMode" class="compare-modal-backdrop" @click.self="closeFullChartModal">
                            <div class="compare-modal">
                                <div class="compare-modal-header">
                                    <div class="modal-title-wrap">
                                        <div class="modal-title-icon">
                                            <i :class="chartModalIcon"></i>
                                        </div>
                                        <div>
                                            <h3>{{ chartModalTitle }}</h3>
                                            <span>{{ unitSummaries.length }} đơn vị trong phạm vi lọc</span>
                                        </div>
                                    </div>
                                    <button type="button" class="modal-close-btn" aria-label="Đóng"
                                        @click="closeFullChartModal">
                                        <i class="bi bi-x-lg"></i>
                                    </button>
                                </div>

                                <div class="modal-summary-strip">
                                    <div class="modal-summary-item">
                                        <span>Tổng đơn vị</span>
                                        <strong>{{ unitSummaries.length }}</strong>
                                    </div>
                                    <div class="modal-summary-item">
                                        <span>Tổng chỉ tiêu</span>
                                        <strong>{{ filteredRows.length }}</strong>
                                    </div>
                                    <div class="modal-summary-item">
                                        <span>Đơn vị tốt nhất</span>
                                        <strong>{{ bestUnit?.tenDonVi || '-' }}</strong>
                                    </div>
                                    <div class="modal-summary-item">
                                        <span>Hoàn thành TB tốt nhất</span>
                                        <strong>{{ bestUnit ? formatPercent(bestUnit.avgCompletion) : '-' }}</strong>
                                    </div>
                                </div>

                                <div class="modal-chart-wrapper">
                                    <apexchart v-if="chartModalMode === 'ranking'" type="bar" :height="fullChartHeight"
                                        :options="fullUnitCompareChartOptions" :series="fullUnitCompareChartSeries" />
                                    <apexchart v-else type="bar" :height="fullChartHeight"
                                        :options="fullStackedUnitChartOptions" :series="fullStackedUnitSeries" />
                                </div>

                                <div class="modal-table-wrapper">
                                    <table class="modal-summary-table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Đơn vị</th>
                                                <th>Số chỉ tiêu</th>
                                                <th>% hoàn thành TB</th>
                                                <th>Vượt mức</th>
                                                <th>Hoàn thành</th>
                                                <th>Chưa hoàn thành</th>
                                                <th>Không hoàn thành</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="(item, index) in unitSummaries" :key="`modal-${item.tenDonVi}`"
                                                :class="getModalRankClass(index)">
                                                <td>
                                                    <span class="modal-rank-badge">{{ index + 1 }}</span>
                                                </td>
                                                <td>
                                                    <strong>{{ item.tenDonVi }}</strong>
                                                </td>
                                                <td>{{ item.total }}</td>
                                                <td>{{ formatPercent(item.avgCompletion) }}</td>
                                                <td>{{ item.HOAN_THANH_VUOT_MUC }}</td>
                                                <td>{{ item.HOAN_THANH }}</td>
                                                <td>{{ item.CHUA_HOAN_THANH }}</td>
                                                <td>{{ item.KHONG_HOAN_THANH }}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
        </div>
    </BaseLayout>
</template>

<script setup>
    import { computed, reactive, ref } from 'vue'
    import BaseLayout from '../BaseLayout.vue'
import ColumnVisibilityTools from '../shared/ColumnVisibilityTools.vue'
    import VueApexCharts from 'vue3-apexcharts'
    import { useBaoCaoTongHopPage } from './baoCaoTongHopPageState.js'
    import { countTrackedStatuses, getDanhGiaStatusCode, isKhongHoanThanhStatus } from '../../utils/danhGiaStatusClean.js'

    const apexchart = VueApexCharts
    const {
        loading,
        errorMessage,
        kyBaoCaoOptions,
        donViOptions: reportDonViOptions,
        filteredRows: reportRows,
        filters: reportFilters,
        canViewAllUnits,
        currentUnitName,
        fetchBaoCaoTongHop
    } = useBaoCaoTongHopPage({ applyDefaultUnitFilter: false })
    const CITY_POLICE_UNIT_NAME = 'Công an thành phố Đà Nẵng'
    const TOP_UNITS_LIMIT = 10
    const rows = computed(() => reportRows.value)
    const donViOptions = computed(() =>
        reportDonViOptions.value.filter(item => !isCityPoliceUnitName(item))
    )
    const chartModalMode = ref('')

    const filters = reactive({
        kyBaoCaoKPIId: '',
        unitA: '',
        unitB: '',
        sortBy: 'avgCompletion',
        keyword: ''
    })
    const filteredRows = computed(() => {
        let data = rows.value.filter(item => !isCityPoliceUnitName(item.tenDonViNhan))

        if (!canViewAllUnits.value && currentUnitName.value) {
            data = data.filter(item => String(item.tenDonViNhan || '').trim() === currentUnitName.value)
        }

        if (filters.keyword) {
            const keyword = normalizeText(filters.keyword)
            data = data.filter(item =>
                [
                    item.tenDonViNhan,
                    item.maChiTieu,
                    item.tenChiTieu,
                    item.xepLoai,
                    item.tenKyGanNhat,
                    item.maKyGanNhat
                ]
                    .filter(Boolean)
                    .some(value => normalizeText(String(value)).includes(keyword))
            )
        }

        return data
    })

    const unitSummaries = computed(() => {
        const grouped = groupBy(filteredRows.value, item => item.tenDonViNhan || 'Chưa xác định')

        const result = Object.entries(grouped).map(([tenDonVi, items]) => {
            const dauKySummary = buildTrendSummary(items, 'tyLeTangTruongSoVoiDauKy')
            const cungKySummary = buildTrendSummary(items, 'tyLeTangTruongSoVoiCungKyNamTruoc')
            const trackedCounts = countTrackedStatuses(items)

            return {
                tenDonVi,
                total: items.length,
                avgCompletion: averageOf(items, 'tyLeHoanThanh'),
                ...trackedCounts,
                canChuY: items.filter(item => isKhongHoanThanhStatus(item.xepLoai)).length,
                positiveDauKy: dauKySummary.positive,
                negativeDauKy: dauKySummary.negative,
                positiveCungKy: cungKySummary.positive,
                negativeCungKy: cungKySummary.negative
            }
        })

        return result.sort((a, b) => compareUnits(a, b, filters.sortBy))
    })

    const topUnitSummaries = computed(() => unitSummaries.value.slice(0, TOP_UNITS_LIMIT))
    const hasMoreUnits = computed(() => unitSummaries.value.length > TOP_UNITS_LIMIT)

    const bestUnit = computed(() => unitSummaries.value[0] || null)

    const worstUnit = computed(() => {
        return [...unitSummaries.value]
            .sort((a, b) => b.canChuY - a.canChuY || a.avgCompletion - b.avgCompletion)[0] || null
    })

    const selectedUnits = computed(() => {
        return unitSummaries.value.filter(
            item => item.tenDonVi === filters.unitA || item.tenDonVi === filters.unitB
        )
    })

    const selectedUnitsLabel = computed(() => {
        if (selectedUnits.value.length === 0) return 'Chưa chọn đơn vị'
        return selectedUnits.value.map(item => item.tenDonVi).join(' vs ')
    })

    const compareGap = computed(() => {
        if (selectedUnits.value.length < 2) {
            return {
                avgCompletionGap: 0,
                canChuYGap: 0,
                betterUnit: '-'
            }
        }

        const [a, b] = selectedUnits.value
        const betterUnit = a.avgCompletion >= b.avgCompletion ? a.tenDonVi : b.tenDonVi

        return {
            avgCompletionGap: roundNumber(Math.abs(a.avgCompletion - b.avgCompletion)),
            canChuYGap: Math.abs(a.canChuY - b.canChuY),
            betterUnit
        }
    })

    const unitCompareChartSeries = computed(() => buildCompletionSeries(topUnitSummaries.value))
    const fullUnitCompareChartSeries = computed(() => buildCompletionSeries(unitSummaries.value))
    const unitCompareChartOptions = computed(() => buildCompletionChartOptions(topUnitSummaries.value))
    const fullUnitCompareChartOptions = computed(() => buildCompletionChartOptions(unitSummaries.value))

    const stackedUnitSeries = computed(() => buildStackedUnitSeries(topUnitSummaries.value))
    const fullStackedUnitSeries = computed(() => buildStackedUnitSeries(unitSummaries.value))
    const stackedUnitChartOptions = computed(() => buildStackedUnitChartOptions(topUnitSummaries.value))
    const fullStackedUnitChartOptions = computed(() =>
        buildStackedUnitChartOptions(unitSummaries.value, { horizontal: true, labelLength: 34 })
    )

    const chartModalTitle = computed(() =>
        chartModalMode.value === 'status'
            ? 'Tỷ trọng xếp loại theo đơn vị'
            : 'Xếp hạng đầy đủ các đơn vị'
    )
    const chartModalIcon = computed(() =>
        chartModalMode.value === 'status'
            ? 'bi bi-bar-chart-steps'
            : 'bi bi-trophy-fill'
    )
    const fullChartHeight = computed(() => Math.max(420, unitSummaries.value.length * 34))

    const duoCompareSeries = computed(() => {
        if (selectedUnits.value.length < 2) return []

        return selectedUnits.value.map(item => ({
            name: item.tenDonVi,
            data: [
                roundNumber(item.avgCompletion),
                item.HOAN_THANH_VUOT_MUC,
                item.HOAN_THANH,
                item.CHUA_HOAN_THANH,
                item.KHONG_HOAN_THANH
            ]
        }))
    })

    const duoCompareChartOptions = computed(() => ({
        chart: {
            toolbar: { show: false }
        },
        xaxis: {
            categories: ['% HT TB', 'Hoàn thành vượt mức', 'Hoàn thành', 'Chưa hoàn thành', 'Không hoàn thành']
        },
        yaxis: {
            show: true
        },
        legend: {
            position: 'bottom'
        },
        markers: {
            size: 5
        },
        stroke: {
            width: 2
        },
        fill: {
            opacity: 0.15
        }
    }))

    async function fetchCompareData() {
        reportFilters.kyBaoCaoKPIId = filters.kyBaoCaoKPIId
        reportFilters.donVi = ''
        reportFilters.xepLoai = ''
        reportFilters.keyword = ''
        await fetchBaoCaoTongHop()
    }

    function openFullChartModal(mode) {
        chartModalMode.value = mode
    }

    function closeFullChartModal() {
        chartModalMode.value = ''
    }

    function getModalRankClass(index) {
        if (index === 0) return 'rank-first'
        if (index === 1) return 'rank-second'
        if (index === 2) return 'rank-third'
        return ''
    }

    function resetFilters() {
        filters.kyBaoCaoKPIId = ''
        filters.unitA = canViewAllUnits.value ? '' : currentUnitName.value
        filters.unitB = canViewAllUnits.value ? '' : currentUnitName.value
        filters.sortBy = 'avgCompletion'
        filters.keyword = ''
        fetchCompareData()
    }

    function compareUnits(a, b, sortBy) {
        if (sortBy === 'total') return b.total - a.total
        if (sortBy === 'vuotMuc') {
            return b.HOAN_THANH_VUOT_MUC - a.HOAN_THANH_VUOT_MUC || b.avgCompletion - a.avgCompletion
        }
        if (sortBy === 'canChuY') return b.canChuY - a.canChuY || a.avgCompletion - b.avgCompletion
        return b.avgCompletion - a.avgCompletion
    }

    function groupBy(items, getKey) {
        return items.reduce((acc, item) => {
            const key = getKey(item)
            if (!acc[key]) acc[key] = []
            acc[key].push(item)
            return acc
        }, {})
    }

    function averageOf(items, field) {
        const values = items
            .map(item => Number(item[field]))
            .filter(value => Number.isFinite(value))

        if (values.length === 0) return 0
        return roundNumber(values.reduce((sum, value) => sum + value, 0) / values.length)
    }

    function buildTrendSummary(items, field) {
        return items.reduce(
            (acc, item) => {
                const value = Number(item[field])
                if (!Number.isFinite(value)) return acc
                if (value > 0) acc.positive++
                else if (value < 0) acc.negative++
                else acc.neutral++
                return acc
            },
            { positive: 0, negative: 0, neutral: 0 }
        )
    }

    function buildCompletionSeries(items) {
        return [
            {
                name: '% hoàn thành TB',
                data: items.map(item => roundNumber(item.avgCompletion))
            }
        ]
    }

    function buildCompletionChartOptions(items) {
        return {
            chart: {
                type: 'bar',
                toolbar: { show: false }
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                    borderRadius: 4
                }
            },
            dataLabels: {
                enabled: true,
                formatter: value => `${value}%`
            },
            xaxis: {
                categories: items.map(item => item.tenDonVi),
                labels: {
                    formatter: value => `${value}%`
                }
            },
            tooltip: {
                y: {
                    formatter: value => `${value}%`
                }
            },
            colors: ['#2563eb']
        }
    }

    function buildStackedUnitSeries(items) {
        if (items.length === 0) return []

        return [
            {
                name: 'Hoàn thành vượt mức',
                data: items.map(item => item.HOAN_THANH_VUOT_MUC)
            },
            {
                name: 'Hoàn thành',
                data: items.map(item => item.HOAN_THANH)
            },
            {
                name: 'Chưa hoàn thành',
                data: items.map(item => item.CHUA_HOAN_THANH)
            },
            {
                name: 'Không hoàn thành',
                data: items.map(item => item.KHONG_HOAN_THANH)
            }
        ]
    }

    function buildStackedUnitChartOptions(items, options = {}) {
        const horizontal = options.horizontal === true
        const labelLength = options.labelLength || 18

        return {
            chart: {
                type: 'bar',
                stacked: true,
                toolbar: { show: false }
            },
            plotOptions: {
                bar: {
                    horizontal,
                    borderRadius: 4
                }
            },
            xaxis: {
                categories: items.map(item => truncateText(item.tenDonVi, labelLength))
            },
            legend: {
                position: 'bottom'
            },
            dataLabels: {
                enabled: false
            },
            colors: ['#16a34a', '#2563eb', '#f59e0b', '#dc2626']
        }
    }

    function normalizeText(value) {
        return String(value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D')
            .toLowerCase()
            .trim()
    }

    function isCityPoliceUnitName(value) {
        return normalizeText(value) === normalizeText(CITY_POLICE_UNIT_NAME)
    }

    function roundNumber(value) {
        return Number(Number(value || 0).toFixed(2))
    }

    function truncateText(value, length = 30) {
        const text = String(value || '')
        if (text.length <= length) return text
        return `${text.slice(0, length)}...`
    }

    function formatPercent(value) {
        if (value === null || value === undefined || value === '') return '-'
        const number = Number(value)
        if (!Number.isFinite(number)) return '-'
        return `${number.toLocaleString('vi-VN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        })}%`
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

    .compare-page {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 16px;
        flex-wrap: wrap;
    }

    .page-header h2 {
        margin: 0 0 6px;
        font-size: 28px;
        font-weight: 700;
        color: #0f172a;
    }

    .page-header p {
        margin: 0;
        color: #64748b;
    }

    .header-actions {
        display: flex;
        gap: 10px;
    }

    .btn {
        border: none;
        border-radius: 10px;
        padding: 10px 16px;
        cursor: pointer;
        font-weight: 600;
    }

    .btn-primary {
        background: #2563eb;
        color: #fff;
    }

    .btn-secondary {
        background: #e2e8f0;
        color: #0f172a;
    }

    .filter-card,
    .panel-card,
    .stat-card {
        background: #fff;
        border-radius: 18px;
        box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
    }

    .filter-card,
    .panel-card {
        padding: 20px;
    }

    .filter-grid {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 16px;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .keyword-group {
        grid-column: span 1;
    }

    .form-group label {
        font-weight: 600;
        color: #334155;
    }

    .form-group input,
    .form-group select {
        height: 42px;
        border: 1px solid #cbd5e1;
        border-radius: 10px;
        padding: 0 12px;
        outline: none;
    }

    .form-group input:focus,
    .form-group select:focus {
        border-color: #89d2ef;
        box-shadow: 0 0 0 0.2rem rgba(137, 210, 239, 0.2);
    }

    .state {
        padding: 18px;
        border-radius: 14px;
        font-weight: 600;
    }

    .loading {
        background: #eff6ff;
        color: #1d4ed8;
    }

    .error {
        background: #fef2f2;
        color: #dc2626;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 16px;
    }

    .stat-card {
        padding: 18px;
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .stat-card.success {
        background: linear-gradient(135deg, #ecfdf5, #f0fdf4);
    }

    .stat-card.danger {
        background: linear-gradient(135deg, #fef2f2, #fff1f2);
    }

    .stat-label {
        color: #64748b;
        font-size: 14px;
    }

    .stat-value {
        font-size: 24px;
        font-weight: 700;
        color: #0f172a;
    }

    .stat-note {
        color: #475569;
        font-size: 13px;
    }

    .dashboard-grid {
        display: grid;
        gap: 20px;
    }

    .two-columns {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        gap: 12px;
    }

    .panel-title {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
    }

    .panel-header h3 {
        margin: 0;
        font-size: 18px;
        color: #0f172a;
    }

    .panel-header span {
        color: #64748b;
        font-size: 14px;
    }

    .view-more-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
        border: 1px solid #dbe3ef;
        background: #f8fafc;
        color: #1e40af;
        box-shadow: none;
        white-space: nowrap;
    }

    .view-more-btn:hover {
        background: #eef6ff;
        color: #1d4ed8;
    }

    .chart-wrapper {
        width: 100%;
    }

    .empty-panel {
        padding: 28px;
        text-align: center;
        color: #94a3b8;
        border: 1px dashed #cbd5e1;
        border-radius: 14px;
    }

    .compare-duo-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
        margin-bottom: 16px;
    }

    .compare-unit-card {
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        padding: 16px;
        background: #f8fafc;
    }

    .compare-unit-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        margin-bottom: 14px;
    }

    .compare-unit-head h4 {
        margin: 0;
        color: #0f172a;
    }

    .compare-unit-head span {
        color: #64748b;
        font-size: 13px;
    }

    .compare-metrics {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
    }

    .metric-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 12px;
        border-radius: 12px;
        background: #fff;
        border: 1px solid #e2e8f0;
    }

    .metric-item span {
        font-size: 13px;
        color: #64748b;
    }

    .metric-item strong {
        font-size: 18px;
        color: #0f172a;
    }

    .compare-summary {
        margin-top: 12px;
        border-top: 1px solid #e2e8f0;
        padding-top: 12px;
    }

    .summary-row {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        padding: 8px 0;
    }

    .summary-row span {
        color: #475569;
    }

    .summary-row strong {
        color: #0f172a;
    }

    .table-wrapper {
        overflow-x: auto;
    }

    .data-table {
        width: 100%;
        border-collapse: collapse;
        min-width: 1100px;
    }

    .data-table th,
    .data-table td {
        border-bottom: 1px solid #e2e8f0;
        padding: 12px;
        text-align: left;
        white-space: nowrap;
    }

    .data-table th {
        background: #f8fafc;
        color: #334155;
        font-weight: 700;
    }

    .data-table tbody tr:hover {
        background: #f8fafc;
    }

    .compare-modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 1060;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
        background:
            linear-gradient(180deg, rgba(15, 23, 42, 0.62), rgba(15, 23, 42, 0.46));
        backdrop-filter: blur(6px);
    }

    .compare-modal {
        width: min(1180px, 96vw);
        max-height: 92vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border: 1px solid rgba(226, 232, 240, 0.92);
        border-radius: 20px;
        background: #f8fafc;
        box-shadow: 0 28px 80px rgba(15, 23, 42, 0.32);
    }

    .compare-modal-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        padding: 20px 22px;
        border-bottom: 1px solid #e2e8f0;
        background: linear-gradient(135deg, #0f2f61 0%, #1d4f99 58%, #d8ad52 140%);
        color: #fff;
    }

    .modal-title-wrap {
        display: flex;
        align-items: center;
        min-width: 0;
        gap: 14px;
    }

    .modal-title-icon {
        width: 46px;
        height: 46px;
        display: grid;
        place-items: center;
        flex-shrink: 0;
        border: 1px solid rgba(255, 255, 255, 0.22);
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.13);
        color: #f8d27a;
        font-size: 20px;
    }

    .compare-modal-header h3 {
        margin: 0 0 4px;
        color: #fff;
        font-size: 20px;
        font-weight: 800;
    }

    .compare-modal-header span {
        color: rgba(255, 255, 255, 0.78);
        font-size: 14px;
    }

    .modal-close-btn {
        width: 36px;
        height: 36px;
        display: grid;
        place-items: center;
        flex-shrink: 0;
        border: 1px solid rgba(255, 255, 255, 0.24);
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.12);
        color: #fff;
        font-size: 15px;
        cursor: pointer;
    }

    .modal-close-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        color: #fff;
    }

    .modal-summary-strip {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
        padding: 16px 20px 0;
        background: #f8fafc;
    }

    .modal-summary-item {
        min-width: 0;
        padding: 12px 14px;
        border: 1px solid #e2e8f0;
        border-radius: 14px;
        background: #fff;
    }

    .modal-summary-item span {
        display: block;
        margin-bottom: 5px;
        color: #64748b;
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
    }

    .modal-summary-item strong {
        display: block;
        color: #0f172a;
        font-size: 17px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .modal-chart-wrapper {
        margin: 16px 20px 12px;
        padding: 16px 14px 8px;
        overflow: auto;
        min-height: 280px;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        background: #fff;
    }

    .modal-table-wrapper {
        margin: 0 20px 20px;
        max-height: 38vh;
        overflow: auto;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        background: #fff;
    }

    .modal-summary-table {
        width: 100%;
        min-width: 900px;
        border-collapse: separate;
        border-spacing: 0;
    }

    .modal-summary-table th,
    .modal-summary-table td {
        padding: 12px 14px;
        border-bottom: 1px solid #e2e8f0;
        white-space: nowrap;
        text-align: left;
    }

    .modal-summary-table th {
        position: sticky;
        top: 0;
        z-index: 2;
        background: #eef4fb;
        color: #334155;
        font-weight: 700;
        box-shadow: inset 0 -1px 0 #dbe4ef;
    }

    .modal-summary-table tbody tr:last-child td {
        border-bottom: none;
    }

    .modal-summary-table tbody tr:hover {
        background: #f8fbff;
    }

    .modal-summary-table tbody tr.rank-first {
        background: #fffaf0;
    }

    .modal-summary-table tbody tr.rank-second {
        background: #f8fafc;
    }

    .modal-summary-table tbody tr.rank-third {
        background: #fff7ed;
    }

    .modal-rank-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 999px;
        background: #e8eef7;
        color: #0f2f61;
        font-weight: 800;
    }

    .rank-first .modal-rank-badge {
        background: linear-gradient(180deg, #f8d27a, #c89b3c);
        color: #3f2b06;
    }

    .rank-second .modal-rank-badge {
        background: linear-gradient(180deg, #e5e7eb, #cbd5e1);
        color: #334155;
    }

    .rank-third .modal-rank-badge {
        background: linear-gradient(180deg, #fed7aa, #f59e0b);
        color: #422006;
    }

    @media (max-width: 1200px) {
        .filter-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .stats-grid,
        .two-columns,
        .compare-duo-grid {
            grid-template-columns: 1fr;
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

        .page-header h2 {
            font-size: 24px;
        }

        .panel-header {
            align-items: flex-start;
            flex-direction: column;
        }

        .compare-modal-backdrop {
            padding: 12px;
        }

        .compare-modal {
            width: 100%;
            max-height: 94vh;
        }

        .modal-summary-strip {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }
    }

    @media (max-width: 560px) {
        .modal-summary-strip {
            grid-template-columns: 1fr;
        }

        .compare-modal-header {
            padding: 16px;
        }

        .modal-chart-wrapper,
        .modal-table-wrapper {
            margin-left: 12px;
            margin-right: 12px;
        }
    }
</style>




