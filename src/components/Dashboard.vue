<template>
  <BaseLayout>
    <div class="page-wrap">
      <div class="container-fluid py-4">
        <div class="gov-banner mb-4">
          <div class="gov-emblem">
            <i class="bi bi-speedometer2"></i>
          </div>
          <div class="gov-text">
            <div class="wave-title">HỆ THỐNG THEO DÕI CHỈ TIÊU CÔNG TÁC</div>
            <div class="gov-title">DASHBOARD ĐÁNH GIÁ KPI</div>
            <div class="gov-sub"></div>
          </div>
        </div>

        <div class="dashboard-page">
          <div class="page-header">
            <div class="gov-banner">
              <img src="https://upload.wikimedia.org/wikipedia/commons/a/a3/Emblem_of_Vietnam.svg" class="gov-emblem" />
            </div>
            <div class="header-actions">
              <button class="btn btn-primary" @click="fetchDashboardData">Tải dữ liệu</button>
              <button class="btn btn-secondary" @click="resetFilters">Đặt lại</button>
            </div>
          </div>

          <div class="filter-card">
            <div class="filter-grid">
              <div class="form-group">
                <label>Kỳ báo cáo</label>
                <select v-model="filters.kyBaoCaoKPIId" @change="fetchDashboardData">
                  <option value="">-- Tất cả kỳ báo cáo --</option>
                  <option v-for="item in kyBaoCaoOptions" :key="item.id" :value="item.id">
                    {{ item.tenKy }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label>Đơn vị</label>
                <select v-model="filters.donVi">
                  <option value="">-- Tất cả đơn vị --</option>
                  <option v-for="item in donViOptions" :key="item" :value="item">
                    {{ item }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label>Xếp loại</label>
                <select v-model="filters.xepLoai">
                  <option value="">-- Tất cả xếp loại --</option>
                  <option value="Xuất sắc">Xuất sắc</option>
                  <option value="Tốt">Tốt</option>
                  <option value="Đạt">Đạt</option>
                  <option value="Không đạt">Không đạt</option>
                </select>
              </div>

              <div class="form-group keyword-group">
                <label>Từ khóa</label>
                <input v-model.trim="filters.keyword" type="text"
                  placeholder="Nhập mã chỉ tiêu, tên chỉ tiêu, đơn vị, nhận xét..." />
              </div>
            </div>
          </div>

          <div v-if="loading" class="state loading">Đang tải dữ liệu dashboard...</div>
          <div v-else-if="errorMessage" class="state error">{{ errorMessage }}</div>

          <template v-else>
            <div class="stats-grid">
              <div class="stat-card">
                <span class="stat-label">Tổng KPI</span>
                <strong class="stat-value">{{ filteredRows.length }}</strong>
                <span class="stat-note">Bản ghi sau khi gộp và lọc</span>
              </div>

              <div class="stat-card">
                <span class="stat-label">Hoàn thành TB</span>
                <strong class="stat-value">{{ formatPercent(averageCompletion) }}</strong>
                <span class="stat-note">Theo % hoàn thành</span>
              </div>

              <div class="stat-card success">
                <span class="stat-label">Xuất sắc</span>
                <strong class="stat-value">{{ xepLoaiStats.xuatSac }}</strong>
                <span class="stat-note">{{ xepLoaiRate(xepLoaiStats.xuatSac) }}</span>
              </div>

              <div class="stat-card info">
                <span class="stat-label">Tốt</span>
                <strong class="stat-value">{{ xepLoaiStats.tot }}</strong>
                <span class="stat-note">{{ xepLoaiRate(xepLoaiStats.tot) }}</span>
              </div>

              <div class="stat-card warning">
                <span class="stat-label">Đạt</span>
                <strong class="stat-value">{{ xepLoaiStats.dat }}</strong>
                <span class="stat-note">{{ xepLoaiRate(xepLoaiStats.dat) }}</span>
              </div>

              <div class="stat-card danger">
                <span class="stat-label">Không đạt</span>
                <strong class="stat-value">{{ xepLoaiStats.khongDat }}</strong>
                <span class="stat-note">{{ xepLoaiRate(xepLoaiStats.khongDat) }}</span>
              </div>
            </div>

            <div class="dashboard-grid two-columns">
              <section class="panel-card">
                <div class="panel-header">
                  <h3>Cơ cấu xếp loại</h3>
                  <span>{{ filteredRows.length }} KPI</span>
                </div>

                <div v-if="filteredRows.length === 0" class="empty-panel">Không có dữ liệu</div>
                <div v-else class="chart-wrapper">
                  <apexchart type="donut" height="320" :options="xepLoaiChartOptions" :series="xepLoaiChartSeries" />
                </div>
              </section>

              <section class="panel-card">
                <div class="panel-header">
                  <h3>Insight nhanh</h3>
                  <span>Tóm tắt nổi bật</span>
                </div>

                <div class="insight-grid">
                  <div class="insight-card">
                    <span class="insight-label">Đơn vị tốt nhất</span>
                    <strong class="insight-title">{{ bestUnit?.tenDonVi || '-' }}</strong>
                    <span class="insight-value">
                      {{ bestUnit ? formatPercent(bestUnit.avgCompletion) : '-' }}
                    </span>
                  </div>

                  <div class="insight-card">
                    <span class="insight-label">Đơn vị cần chú ý</span>
                    <strong class="insight-title">{{ worstUnit?.tenDonVi || '-' }}</strong>
                    <span class="insight-value">
                      {{ worstUnit ? `${worstUnit.khongDat} KPI không đạt` : '-' }}
                    </span>
                  </div>

                  <div class="insight-card">
                    <span class="insight-label">KPI tốt nhất</span>
                    <strong class="insight-title">{{ bestKpi?.tenChiTieu || bestKpi?.maChiTieu || '-' }}</strong>
                    <span class="insight-value">
                      {{ bestKpi ? formatPercent(bestKpi.tyLeHoanThanh) : '-' }}
                    </span>
                  </div>

                  <div class="insight-card">
                    <span class="insight-label">KPI thấp nhất</span>
                    <strong class="insight-title">{{ worstKpi?.tenChiTieu || worstKpi?.maChiTieu || '-' }}</strong>
                    <span class="insight-value">
                      {{ worstKpi ? formatPercent(worstKpi.tyLeHoanThanh) : '-' }}
                    </span>
                  </div>
                </div>

                <div class="trend-detail compact">
                  <div class="trend-row">
                    <span>Tăng so với đầu kỳ</span>
                    <strong>{{ dauKySummary.positive }}</strong>
                  </div>
                  <div class="trend-row">
                    <span>Giảm so với đầu kỳ</span>
                    <strong>{{ dauKySummary.negative }}</strong>
                  </div>
                  <div class="trend-row">
                    <span>Tăng cùng kỳ năm trước</span>
                    <strong>{{ cungKySummary.positive }}</strong>
                  </div>
                  <div class="trend-row">
                    <span>Giảm cùng kỳ năm trước</span>
                    <strong>{{ cungKySummary.negative }}</strong>
                  </div>
                </div>
              </section>
            </div>

            <div class="dashboard-grid two-columns">
              <section class="panel-card">
                <div class="panel-header">
                  <h3>Top 8 đơn vị theo % hoàn thành TB</h3>
                  <span>Xếp hạng đơn vị</span>
                </div>

                <div v-if="unitPerformance.length === 0" class="empty-panel">Không có dữ liệu đơn vị</div>
                <div v-else class="chart-wrapper">
                  <apexchart type="bar" height="340" :options="unitChartOptions" :series="unitChartSeries" />
                </div>
              </section>

              <section class="panel-card">
                <div class="panel-header">
                  <h3>Top đơn vị có KPI không đạt</h3>
                  <span>Ưu tiên theo dõi</span>
                </div>

                <div v-if="worstUnitsChartSeries[0].data.length === 0" class="empty-panel">Không có dữ liệu</div>
                <div v-else class="chart-wrapper">
                  <apexchart type="bar" height="340" :options="worstUnitsChartOptions"
                    :series="worstUnitsChartSeries" />
                </div>
              </section>
            </div>

            <div class="dashboard-grid two-columns">
              <section class="panel-card">
                <div class="panel-header">
                  <h3>Top 5 KPI tốt nhất</h3>
                  <span>% hoàn thành cao nhất</span>
                </div>

                <div v-if="topPerformers.length === 0" class="empty-panel">Không có dữ liệu</div>
                <div v-else class="chart-wrapper">
                  <apexchart type="bar" height="340" :options="topPerformersChartOptions"
                    :series="topPerformersChartSeries" />
                </div>
              </section>

              <section class="panel-card">
                <div class="panel-header">
                  <h3>Top 5 KPI kém nhất</h3>
                  <span>% hoàn thành thấp nhất</span>
                </div>

                <div v-if="bottomPerformers.length === 0" class="empty-panel">Không có dữ liệu</div>
                <div v-else class="chart-wrapper">
                  <apexchart type="bar" height="340" :options="bottomPerformersChartOptions"
                    :series="bottomPerformersChartSeries" />
                </div>
              </section>
            </div>

            <section class="panel-card">
              <div class="panel-header">
                <h3>Bảng tổng hợp chi tiết sau khi gộp</h3>
                <span>{{ filteredRows.length }} dòng</span>
              </div>

              <div v-if="filteredRows.length === 0" class="empty-panel">Không có dữ liệu</div>
              <div v-else class="table-wrap">
                <table class="summary-table">
                  <thead>
                    <tr>
                      <th>Mã chỉ tiêu</th>
                      <th>Tên chỉ tiêu</th>
                      <th>Đơn vị</th>
                      <th>Đợt giao</th>
                      <th>Kỳ báo cáo</th>
                      <th>Xếp loại</th>
                      <th>% hoàn thành</th>
                      <th>Tăng trưởng đầu kỳ</th>
                      <th>Tăng trưởng cùng kỳ</th>
                      <th>Số bản ghi gộp</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in filteredRows" :key="buildGroupedRowKey(item)">
                      <td>{{ item.maChiTieu || '-' }}</td>
                      <td>{{ item.tenChiTieu || '-' }}</td>
                      <td>{{ item.tenDonViNhan || '-' }}</td>
                      <td>{{ item.tenDotGiao || item.maDotGiao || item.dotGiaoChiTieuId || '-' }}</td>
                      <td>{{ item.tenKy || item.maKy || '-' }}</td>
                      <td>
                        <span class="row-badge" :class="badgeClass(item.xepLoai)">
                          {{ item.xepLoai || '-' }}
                        </span>
                      </td>
                      <td>{{ formatPercent(item.tyLeHoanThanh) }}</td>
                      <td>{{ formatPercent(item.tyLeTangTruongSoVoiDauKy) }}</td>
                      <td>{{ formatPercent(item.tyLeTangTruongSoVoiCungKyNamTruoc) }}</td>
                      <td>{{ item._groupCount || 1 }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </template>
        </div>
      </div>
    </div>
  </BaseLayout>
</template>

<script setup>
  import { computed, onMounted, reactive, ref } from 'vue'
  import BaseLayout from './BaseLayout.vue'
  import { apiRequest } from '../services/api.js'
  import VueApexCharts from 'vue3-apexcharts'

  const apexchart = VueApexCharts
  const EXCLUDED_UNIT = 'Công an thành phố Đà Nẵng'

  const loading = ref(false)
  const errorMessage = ref('')
  const rows = ref([])
  const kyBaoCaoOptions = ref([])

  const filters = reactive({
    kyBaoCaoKPIId: '',
    donVi: '',
    xepLoai: '',
    keyword: ''
  })

  const groupedRows = computed(() => {
    const map = new Map()

    rows.value.forEach(item => {
      const tenDonVi = item.tenDonViNhan || item.tenDonViThucHien || ''
      if (normalizeText(tenDonVi) === normalizeText(EXCLUDED_UNIT)) return

      const chiTietGiaoChiTieuId =
        item.chiTietGiaoChiTieuId ??
        item.idChiTietGiaoChiTieu ??
        item.chiTietId ??
        item.idChiTiet ??
        ''

      const dotGiaoChiTieuId =
        item.dotGiaoChiTieuId ??
        item.idDotGiaoChiTieu ??
        item.maDotGiao ??
        item.dotGiaoId ??
        ''

      const key = [chiTietGiaoChiTieuId, normalizeText(tenDonVi), dotGiaoChiTieuId].join('___')

      if (!map.has(key)) {
        map.set(key, {
          ...item,
          _groupCount: 1,
          _tyLeHoanThanhValues: isFiniteNumber(item.tyLeHoanThanh) ? [Number(item.tyLeHoanThanh)] : [],
          _tangTruongDauKyValues: isFiniteNumber(item.tyLeTangTruongSoVoiDauKy)
            ? [Number(item.tyLeTangTruongSoVoiDauKy)]
            : [],
          _tangTruongCungKyValues: isFiniteNumber(item.tyLeTangTruongSoVoiCungKyNamTruoc)
            ? [Number(item.tyLeTangTruongSoVoiCungKyNamTruoc)]
            : [],
          _chenhLechDauKyValues: isFiniteNumber(item.chenhLechSoVoiDauKy)
            ? [Number(item.chenhLechSoVoiDauKy)]
            : [],
          _chenhLechCungKyValues: isFiniteNumber(item.chenhLechSoVoiCungKyNamTruoc)
            ? [Number(item.chenhLechSoVoiCungKyNamTruoc)]
            : []
        })
        return
      }

      const current = map.get(key)
      current._groupCount += 1

      if (isFiniteNumber(item.tyLeHoanThanh)) {
        current._tyLeHoanThanhValues.push(Number(item.tyLeHoanThanh))
      }

      if (isFiniteNumber(item.tyLeTangTruongSoVoiDauKy)) {
        current._tangTruongDauKyValues.push(Number(item.tyLeTangTruongSoVoiDauKy))
      }

      if (isFiniteNumber(item.tyLeTangTruongSoVoiCungKyNamTruoc)) {
        current._tangTruongCungKyValues.push(Number(item.tyLeTangTruongSoVoiCungKyNamTruoc))
      }

      if (isFiniteNumber(item.chenhLechSoVoiDauKy)) {
        current._chenhLechDauKyValues.push(Number(item.chenhLechSoVoiDauKy))
      }

      if (isFiniteNumber(item.chenhLechSoVoiCungKyNamTruoc)) {
        current._chenhLechCungKyValues.push(Number(item.chenhLechSoVoiCungKyNamTruoc))
      }

      const rank = {
        'khong dat': 1,
        dat: 2,
        tot: 3,
        'xuat sac': 4
      }

      const currentRank = rank[normalizeText(current.xepLoai)] || 0
      const nextRank = rank[normalizeText(item.xepLoai)] || 0

      if (nextRank > currentRank) {
        current.xepLoai = item.xepLoai
        current.ketQua = item.ketQua
        current.nguoiDanhGia = item.nguoiDanhGia
        current.nhanXetDanhGia = item.nhanXetDanhGia
      }
    })

    return Array.from(map.values()).map(item => ({
      ...item,
      tyLeHoanThanh: averageArray(item._tyLeHoanThanhValues),
      tyLeTangTruongSoVoiDauKy: averageArray(item._tangTruongDauKyValues),
      tyLeTangTruongSoVoiCungKyNamTruoc: averageArray(item._tangTruongCungKyValues),
      chenhLechSoVoiDauKy: averageArray(item._chenhLechDauKyValues),
      chenhLechSoVoiCungKyNamTruoc: averageArray(item._chenhLechCungKyValues)
    }))
  })

  const donViOptions = computed(() => {
    return [...new Set(groupedRows.value.map(item => item.tenDonViNhan).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b, 'vi')
    )
  })

  const filteredRows = computed(() => {
    let data = [...groupedRows.value]

    if (filters.donVi) {
      data = data.filter(item => item.tenDonViNhan === filters.donVi)
    }

    if (filters.xepLoai) {
      const normalized = normalizeText(filters.xepLoai)
      data = data.filter(item => normalizeText(item.xepLoai) === normalized)
    }

    if (filters.keyword) {
      const keyword = normalizeText(filters.keyword)
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
          item.nhanXetDanhGia,
          item.tenDotGiao,
          item.maDotGiao
        ]
          .filter(Boolean)
          .some(value => normalizeText(String(value)).includes(keyword))
      })
    }

    return data
  })

  const xepLoaiStats = computed(() => {
    const result = {
      xuatSac: 0,
      tot: 0,
      dat: 0,
      khongDat: 0
    }

    filteredRows.value.forEach(item => {
      const xepLoai = normalizeText(item.xepLoai)
      if (xepLoai === 'xuat sac') result.xuatSac++
      else if (xepLoai === 'tot') result.tot++
      else if (xepLoai === 'dat') result.dat++
      else if (xepLoai === 'khong dat') result.khongDat++
    })

    return result
  })

  const averageCompletion = computed(() => averageOf(filteredRows.value, 'tyLeHoanThanh'))
  const dauKySummary = computed(() => buildTrendSummary(filteredRows.value, 'tyLeTangTruongSoVoiDauKy'))
  const cungKySummary = computed(() => buildTrendSummary(filteredRows.value, 'tyLeTangTruongSoVoiCungKyNamTruoc'))

  const unitPerformance = computed(() => {
    const grouped = groupBy(filteredRows.value, item => item.tenDonViNhan || 'Chưa xác định')

    return Object.entries(grouped)
      .map(([tenDonVi, items]) => ({
        tenDonVi,
        total: items.length,
        avgCompletion: averageOf(items, 'tyLeHoanThanh'),
        khongDat: items.filter(item => normalizeText(item.xepLoai) === 'khong dat').length
      }))
      .sort((a, b) => b.avgCompletion - a.avgCompletion)
      .slice(0, 8)
  })

  const unitsByKhongDat = computed(() => {
    const grouped = groupBy(filteredRows.value, item => item.tenDonViNhan || 'Chưa xác định')

    return Object.entries(grouped)
      .map(([tenDonVi, items]) => ({
        tenDonVi,
        khongDat: items.filter(item => normalizeText(item.xepLoai) === 'khong dat').length,
        total: items.length,
        avgCompletion: averageOf(items, 'tyLeHoanThanh')
      }))
      .filter(item => item.khongDat > 0)
      .sort((a, b) => b.khongDat - a.khongDat || a.avgCompletion - b.avgCompletion)
      .slice(0, 8)
  })

  const topPerformers = computed(() => {
    return [...filteredRows.value]
      .filter(item => isFiniteNumber(item.tyLeHoanThanh))
      .sort((a, b) => Number(b.tyLeHoanThanh) - Number(a.tyLeHoanThanh))
      .slice(0, 5)
  })

  const bottomPerformers = computed(() => {
    return [...filteredRows.value]
      .filter(item => isFiniteNumber(item.tyLeHoanThanh))
      .sort((a, b) => Number(a.tyLeHoanThanh) - Number(b.tyLeHoanThanh))
      .slice(0, 5)
  })

  const bestUnit = computed(() => unitPerformance.value[0] || null)
  const worstUnit = computed(() => unitsByKhongDat.value[0] || null)
  const bestKpi = computed(() => topPerformers.value[0] || null)
  const worstKpi = computed(() => bottomPerformers.value[0] || null)

  const xepLoaiChartSeries = computed(() => [
    xepLoaiStats.value.xuatSac,
    xepLoaiStats.value.tot,
    xepLoaiStats.value.dat,
    xepLoaiStats.value.khongDat
  ])

  const xepLoaiChartOptions = computed(() => ({
    chart: {
      toolbar: { show: false }
    },
    labels: ['Xuất sắc', 'Tốt', 'Đạt', 'Không đạt'],
    legend: {
      position: 'bottom'
    },
    dataLabels: {
      enabled: true,
      formatter: value => `${value.toFixed(1)}%`
    },
    tooltip: {
      y: {
        formatter: value => `${formatNumber(value)} KPI`
      }
    },
    colors: ['#16a34a', '#2563eb', '#f59e0b', '#dc2626']
  }))

  const unitChartSeries = computed(() => [
    {
      name: '% hoàn thành TB',
      data: unitPerformance.value.map(item => roundNumber(item.avgCompletion))
    }
  ])

  const unitChartOptions = computed(() => ({
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
      categories: unitPerformance.value.map(item => item.tenDonVi),
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
  }))

  const worstUnitsChartSeries = computed(() => [
    {
      name: 'KPI không đạt',
      data: unitsByKhongDat.value.map(item => item.khongDat)
    }
  ])

  const worstUnitsChartOptions = computed(() => ({
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
      enabled: true
    },
    xaxis: {
      categories: unitsByKhongDat.value.map(item => item.tenDonVi)
    },
    tooltip: {
      y: {
        formatter: value => `${value} KPI không đạt`
      }
    },
    colors: ['#dc2626']
  }))

  const topPerformersChartSeries = computed(() => [
    {
      name: '% hoàn thành',
      data: topPerformers.value.map(item => roundNumber(Number(item.tyLeHoanThanh)))
    }
  ])

  const topPerformersChartOptions = computed(() => ({
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
      categories: topPerformers.value.map(item => buildKpiChartLabel(item)),
      labels: {
        formatter: value => `${value}%`
      }
    },
    tooltip: {
      y: {
        formatter: value => `${value}%`
      }
    },
    colors: ['#16a34a']
  }))

  const bottomPerformersChartSeries = computed(() => [
    {
      name: '% hoàn thành',
      data: bottomPerformers.value.map(item => roundNumber(Number(item.tyLeHoanThanh)))
    }
  ])

  const bottomPerformersChartOptions = computed(() => ({
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
      categories: bottomPerformers.value.map(item => buildKpiChartLabel(item)),
      labels: {
        formatter: value => `${value}%`
      }
    },
    tooltip: {
      y: {
        formatter: value => `${value}%`
      }
    },
    colors: ['#f97316']
  }))

  onMounted(async () => {
    await Promise.all([fetchKyBaoCao(), fetchDashboardData()])
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

  async function fetchDashboardData() {
    loading.value = true
    errorMessage.value = ''

    try {
      const data = filters.kyBaoCaoKPIId
        ? await apiRequest(`/DanhGiaKPI/by-ky-bao-cao/${filters.kyBaoCaoKPIId}`)
        : await apiRequest('/DanhGiaKPI')

      rows.value = Array.isArray(data) ? data : []
    } catch (error) {
      console.error(error)
      errorMessage.value = error.message || 'Không thể tải dữ liệu dashboard KPI.'
      rows.value = []
    } finally {
      loading.value = false
    }
  }

  function resetFilters() {
    filters.kyBaoCaoKPIId = ''
    filters.donVi = ''
    filters.xepLoai = ''
    filters.keyword = ''
    fetchDashboardData()
  }

  function buildGroupedRowKey(item) {
    return [
      item.chiTietGiaoChiTieuId ?? item.idChiTietGiaoChiTieu ?? item.chiTietId ?? item.idChiTiet ?? '',
      item.dotGiaoChiTieuId ?? item.idDotGiaoChiTieu ?? item.maDotGiao ?? item.dotGiaoId ?? '',
      normalizeText(item.tenDonViNhan || '')
    ].join('___')
  }

  function groupBy(items, getKey) {
    return items.reduce((acc, item) => {
      const key = getKey(item)
      if (!acc[key]) acc[key] = []
      acc[key].push(item)
      return acc
    }, {})
  }

  function averageArray(values) {
    if (!values || !values.length) return 0
    return roundNumber(values.reduce((sum, value) => sum + value, 0) / values.length)
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

  function buildKpiChartLabel(item) {
    const ma = item.maChiTieu || 'N/A'
    const ten = item.tenChiTieu || 'Chưa có tên'
    return `${ma} - ${truncateText(ten, 28)}`
  }

  function truncateText(value, length = 30) {
    const text = String(value || '')
    if (text.length <= length) return text
    return `${text.slice(0, length)}...`
  }

  function xepLoaiRate(value) {
    if (!filteredRows.value.length) return '0%'
    return `${roundNumber((value / filteredRows.value.length) * 100)}% tổng KPI`
  }

  function normalizeText(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
  }

  function isFiniteNumber(value) {
    return Number.isFinite(Number(value))
  }

  function roundNumber(value) {
    return Number(Number(value || 0).toFixed(2))
  }

  function formatNumber(value) {
    if (value === null || value === undefined || value === '') return '-'
    const number = Number(value)
    if (!Number.isFinite(number)) return '-'
    return number.toLocaleString('vi-VN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })
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

  function badgeClass(xepLoai) {
    const value = normalizeText(xepLoai)
    if (value === 'xuat sac') return 'badge-excellent'
    if (value === 'tot') return 'badge-good'
    if (value === 'dat') return 'badge-pass'
    if (value === 'khong dat') return 'badge-fail'
    return 'badge-default'
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

  .dashboard-page {
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
  }

  .page-header p {
    margin: 0;
    color: #64748b;
  }

  .header-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .filter-card,
  .panel-card,
  .stat-card,
  .insight-card {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    box-shadow: 0 6px 18px rgba(15, 23, 42, 0.05);
  }

  .filter-card,
  .panel-card {
    padding: 18px;
  }

  .filter-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
  }

  .keyword-group {
    grid-column: span 1;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .form-group label {
    font-size: 14px;
    font-weight: 600;
    color: #334155;
  }

  .form-group select,
  .form-group input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #dbe3ef;
    border-radius: 10px;
    font-size: 14px;
    outline: none;
  }

  .form-group select:focus,
  .form-group input:focus {
    border-color: #2563eb;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 16px;
  }

  .stat-card {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .stat-label {
    color: #64748b;
    font-size: 13px;
  }

  .stat-value {
    font-size: 28px;
    font-weight: 700;
    color: #0f172a;
  }

  .stat-note {
    color: #94a3b8;
    font-size: 13px;
  }

  .stat-card.success {
    border-left: 4px solid #16a34a;
  }

  .stat-card.info {
    border-left: 4px solid #2563eb;
  }

  .stat-card.warning {
    border-left: 4px solid #f59e0b;
  }

  .stat-card.danger {
    border-left: 4px solid #dc2626;
  }

  .dashboard-grid {
    display: grid;
    gap: 20px;
  }

  .dashboard-grid.two-columns {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }

  .panel-header h3 {
    margin: 0;
    font-size: 18px;
  }

  .panel-header span {
    color: #64748b;
    font-size: 13px;
  }

  .chart-wrapper {
    min-height: 320px;
  }

  .empty-panel {
    min-height: 220px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
    text-align: center;
  }

  .insight-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
    margin-bottom: 16px;
  }

  .insight-card {
    padding: 14px;
    background: #f8fafc;
  }

  .insight-label {
    display: block;
    font-size: 13px;
    color: #64748b;
    margin-bottom: 8px;
  }

  .insight-title {
    display: block;
    font-size: 15px;
    font-weight: 700;
    color: #0f172a;
    line-height: 1.4;
    margin-bottom: 6px;
  }

  .insight-value {
    color: #2563eb;
    font-weight: 600;
    font-size: 14px;
  }

  .trend-detail {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .trend-detail.compact {
    margin-top: 8px;
  }

  .trend-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px dashed #e2e8f0;
  }

  .trend-row:last-child {
    border-bottom: 0;
  }

  .state {
    padding: 16px;
    border-radius: 12px;
    font-weight: 500;
  }

  .state.loading {
    background: #eff6ff;
    color: #1d4ed8;
  }

  .state.error {
    background: #fef2f2;
    color: #dc2626;
  }

  .table-wrap {
    overflow-x: auto;
  }

  .summary-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 1200px;
  }

  .summary-table thead th {
    background: #f8fafc;
    color: #334155;
    font-weight: 700;
    border-bottom: 1px solid #e2e8f0;
    padding: 12px;
    text-align: left;
    white-space: nowrap;
  }

  .summary-table tbody td {
    padding: 12px;
    border-bottom: 1px solid #eef2f7;
    color: #334155;
    vertical-align: middle;
  }

  .summary-table tbody tr:hover {
    background-color: #f8fbff;
  }

  .row-badge {
    display: inline-flex;
    align-items: center;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
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
    color: #b45309;
  }

  .badge-fail {
    background: #fee2e2;
    color: #b91c1c;
  }

  .badge-default {
    background: #e5e7eb;
    color: #374151;
  }

  .btn {
    border: none;
    border-radius: 10px;
    padding: 10px 14px;
    font-weight: 600;
    cursor: pointer;
  }

  .btn-primary {
    background: #2563eb;
    color: #fff;
  }

  .btn-secondary {
    background: #e2e8f0;
    color: #0f172a;
  }

  @media (max-width: 1200px) {
    .stats-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .filter-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .dashboard-grid.two-columns {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {

    .stats-grid,
    .filter-grid,
    .insight-grid {
      grid-template-columns: 1fr;
    }

    .page-header {
      flex-direction: column;
      align-items: stretch;
    }

    .header-actions {
      width: 100%;
    }

    .header-actions .btn {
      flex: 1;
    }

    .gov-banner {
      padding: 16px;
      align-items: flex-start;
    }

    .gov-title {
      font-size: 1.05rem;
    }
  }
</style>