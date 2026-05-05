<template>
    <BaseLayout>
        <div class="page-wrap">
            <div class="container-fluid py-4">
                <div class="gov-banner mb-4">
                    <div class="gov-emblem">
                        <i class="bi bi-bar-chart-line"></i>
                    </div>
                    <div class="gov-text">
                        <div class="gov-title">BÁO CÁO TỔNG HỢP CHỈ TIÊU TOÀN HỆ THỐNG</div>
                    </div>
                </div>

                <div class="bao-cao-page">
                    <div class="filter-card">
                        <div class="filter-grid">
                            <div class="form-group">
                                <label>Kỳ báo cáo</label>
                                <select v-model="filters.kyBaoCaoKPIId" @change="fetchBaoCaoTongHop">
                                    <option value="">-- Tính đến kỳ mới nhất hiện có --</option>
                                    <option v-for="item in kyBaoCaoOptions" :key="getId(item)" :value="getId(item)">
                                        {{ getKyLabel(item) }}
                                    </option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>Đơn vị</label>
                                <select v-model="filters.donVi" :disabled="!canViewAllUnits">
                                    <option v-if="canViewAllUnits" value="">-- Tất cả đơn vị --</option>
                                    <option v-for="item in donViOptions" :key="item" :value="item">
                                        {{ item }}
                                    </option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>Xếp loại</label>
                                <select v-model="filters.xepLoai">
                                    <option value="">-- Tất cả xếp loại --</option>
                                    <option v-for="status in trackedStatusOptions" :key="status.value"
                                        :value="status.value">
                                        {{ status.label }}
                                    </option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>Từ khóa</label>
                                <input v-model.trim="filters.keyword" type="text"
                                    placeholder="Mã chỉ tiêu, tên chỉ tiêu, đơn vị, đợt giao..." />
                            </div>

                            <div class="form-group actions">
                                <button class="btn btn-primary" @click="fetchBaoCaoTongHop">Tải dữ liệu</button>
                                <button class="btn btn-secondary" @click="resetFilters">Đặt lại</button>
                                <button class="btn btn-success" @click="exportCsv">Xuất CSV</button>
                            </div>
                        </div>
                    </div>

                    <div class="summary-grid">
                        <div class="summary-card">
                            <span class="label">Tổng chỉ tiêu chính</span>
                            <strong>{{ filteredRows.length }}</strong>
                        </div>
                        <div class="summary-card">
                            <span class="label">Hoàn thành trung bình</span>
                            <strong>{{ formatPercent(averageCompletion) }}</strong>
                        </div>
                        <div class="summary-card">
                            <span class="label">Hoàn thành</span>
                            <strong>{{ (thongKe.HOAN_THANH || 0) + (thongKe.HOAN_THANH_VUOT_MUC || 0) }}</strong>
                        </div>
                        <div class="summary-card">
                            <span class="label">Vượt chỉ tiêu</span>
                            <strong>{{ thongKe.HOAN_THANH_VUOT_MUC }}</strong>
                        </div>
                        <div class="summary-card">
                            <span class="label">Chưa hoàn thành</span>
                            <strong>{{ thongKe.CHUA_HOAN_THANH }}</strong>
                        </div>
                        <div class="summary-card">
                            <span class="label">Không hoàn thành</span>
                            <strong>{{ thongKe.KHONG_HOAN_THANH }}</strong>
                        </div>
                    </div>

                    <div class="table-card">
                        <div v-if="loading" class="state loading">Đang tải dữ liệu...</div>
                        <div v-else-if="errorMessage" class="state error">{{ errorMessage }}</div>
                        <div v-else class="table-wrapper">
                            <ColumnVisibilityTools
                                table-id="BaoCaoTongHopPage-table-v2"
                                :default-visible-columns="[0, 1, 2, 3, 9, 10, 12, 13]"
                            />
                            <table id="BaoCaoTongHopPage-table-v2" class="managed-table">
                                <colgroup>
                                    <col class="col-stt" />
                                    <col class="col-danh-muc" />
                                    <col class="col-chi-tieu" />
                                    <col class="col-don-vi" />
                                    <col class="col-dot-giao" />
                                    <col class="col-ky" />
                                    <col class="col-number" />
                                    <col class="col-number" />
                                    <col class="col-number" />
                                    <col class="col-number" />
                                    <col class="col-number" />
                                    <col class="col-number" />
                                    <col class="col-percent" />
                                    <col class="col-status" />
                                </colgroup>
                                <thead>
                                    <tr>
                                        <th>STT</th>
                                        <th>Danh mục chỉ tiêu</th>
                                        <th>Chỉ tiêu giao</th>
                                        <th>Đơn vị nhận</th>
                                        <th>Đợt giao chỉ tiêu</th>
                                        <th>Kỳ gần nhất</th>
                                        <th>Giá trị mục tiêu</th>
                                        <th>Giá trị đầu kỳ</th>
                                        <th>Cuối kỳ gần nhất</th>
                                        <th>Số liệu lũy kế</th>
                                        <th>Số liệu trung bình tháng</th>
                                        <th>Số dư mục tiêu</th>
                                        <th>Kết quả thực tế</th>
                                        <th>Đánh giá</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-if="filteredRows.length === 0">
                                        <td colspan="14" class="empty-cell">Không có dữ liệu</td>
                                    </tr>

                                    <template v-for="(row, index) in filteredRows" :key="row.groupKey">
                                        <tr class="parent-row">
                                            <td>{{ index + 1 }}</td>
                                            <td>{{ row.tenDanhMucChiTieu || row.tenChiTieu || '-' }}</td>
                                            <td>{{ row.tenChiTieuGiao || row.tenChiTieuCha || '-' }}</td>
                                            <td>{{ row.tenDonViNhan || '-' }}</td>
                                            <td>{{ row.tenDotGiaoChiTieu || '-' }}</td>
                                            <td>{{ row.maKyGanNhat || '-' }} - {{ row.tenKyGanNhat || '-' }}</td>
                                            <td class="text-right">{{ row.isComparisonTarget ?
                                                formatPercent(row.giaTriMucTieu) : formatNumber(row.giaTriMucTieu,
                                                row.donViTinh) }}</td>
                                            <td class="text-right">{{ row.isComparisonTarget ?
                                                formatPercent(row.giaTriDauKyGanNhat) : formatNumber(row.giaTriDauKyGanNhat,
                                                row.donViTinh) }}</td>
                                            <td class="text-right">{{ formatNumber(row.giaTriCuoiKyGanNhat,
                                                row.donViTinh) }}</td>
                                            <td class="text-right">{{ formatNumber(row.giaTriLuyKeHienTai,
                                                row.donViTinhLuyKe || row.donViTinh) }}</td>
                                            <td class="text-right">{{ formatNumber(row.soLieuTrungBinhThang,
                                                row.donViTinhLuyKe || row.donViTinh) }}</td>
                                            <td class="text-right">{{ row.isComparisonTarget ?
                                                formatPercent(row.soDuMucTieu) : formatNumber(row.soDuMucTieu,
                                                row.donViTinh) }}</td>
                                            <td class="text-right">{{ formatPercent(row.tyLeHoanThanh) }}</td>
                                            <td>
                                                <span class="badge" :class="badgeClass(row.xepLoai)">
                                                    {{ getDanhGiaLabel(row.xepLoai) || '-' }}
                                                </span>
                                            </td>
                                        </tr>

                                        <tr v-for="child in row.children" :key="`${row.groupKey}-${child.groupKey}`"
                                            class="child-row">
                                            <td></td>
                                            <td>
                                                <div class="child-title"
                                                    :style="{ paddingLeft: `${12 + ((child.treeLevel || 1) - 1) * 18}px` }">
                                                    <span>{{ child.tenDanhMucChiTieu || child.tenChiTieu || '-' }}</span>
                                                </div>
                                            </td>
                                            <td>{{ child.tenChiTieuGiao || child.tenChiTieuCha || '-' }}</td>
                                            <td>{{ child.tenDonViNhan || '-' }}</td>
                                            <td>{{ child.tenDotGiaoChiTieu || '-' }}</td>
                                            <td>{{ child.maKyGanNhat || '-' }} - {{ child.tenKyGanNhat || '-' }}</td>
                                            <td class="text-right">{{ child.isComparisonTarget ?
                                                formatPercent(child.giaTriMucTieu) : formatNumber(child.giaTriMucTieu,
                                                child.donViTinh) }}</td>
                                            <td class="text-right">{{ child.isComparisonTarget ?
                                                formatPercent(child.giaTriDauKyGanNhat) : formatNumber(child.giaTriDauKyGanNhat,
                                                child.donViTinh) }}</td>
                                            <td class="text-right">{{ formatNumber(child.giaTriCuoiKyGanNhat,
                                                child.donViTinh) }}</td>
                                            <td class="text-right">{{ formatNumber(child.giaTriLuyKeHienTai,
                                                child.donViTinhLuyKe || child.donViTinh) }}</td>
                                            <td class="text-right">{{ formatNumber(child.soLieuTrungBinhThang,
                                                child.donViTinhLuyKe || child.donViTinh) }}</td>
                                            <td class="text-right">{{ child.isComparisonTarget ?
                                                formatPercent(child.soDuMucTieu) : formatNumber(child.soDuMucTieu,
                                                child.donViTinh) }}</td>
                                            <td class="text-right">{{ formatPercent(child.tyLeHoanThanh) }}</td>
                                            <td>
                                                <span class="badge child-badge" :class="badgeClass(child.xepLoai)">
                                                    {{ getDanhGiaLabel(child.xepLoai) || '-' }}
                                                </span>
                                            </td>
                                        </tr>
                                    </template>
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
    import BaseLayout from '../BaseLayout.vue'
    import ColumnVisibilityTools from '../shared/ColumnVisibilityTools.vue'
    import { useBaoCaoTongHopPage } from './baoCaoTongHopPageState.js'

    const {
        loading,
        errorMessage,
        kyBaoCaoOptions,
        trackedStatusOptions,
        filters,
        canViewAllUnits,
        donViOptions,
        filteredRows,
        thongKe,
        averageCompletion,
        fetchBaoCaoTongHop,
        resetFilters,
        getId,
        getKyLabel,
        buildDotGiaoMeta,
        buildLatestKyMeta,
        formatDate,
        formatNumber,
        formatPercent,
        badgeClass,
        getDanhGiaLabel,
        exportCsv
    } = useBaoCaoTongHopPage()
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

    .bao-cao-page {
        padding: 20px;
        background: #f6f8fb;
        min-height: 100%;
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
        grid-template-columns: repeat(4, minmax(0, 1fr));
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
        border-color: #2563eb;
        box-shadow: 0 0 0 0.2rem rgba(37, 99, 235, 0.15);
    }

    .actions {
        flex-direction: row;
        gap: 10px;
        align-items: stretch;
        justify-content: flex-end;
        grid-column: 1 / -1;
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

    .table-wrapper {
        width: 100%;
        overflow-x: auto;
    }

    .table-wrapper table {
        width: 1600px;
        min-width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
        border: 1px solid #dcdfe6;
    }

    .table-wrapper :deep(table.managed-table) {
        width: 2000px !important;
        min-width: 2000px !important;
        table-layout: fixed !important;
    }

    .table-wrapper :deep(table.managed-table thead th) {
        white-space: normal !important;
        overflow: visible !important;
        overflow-wrap: break-word !important;
        word-break: normal !important;
        line-height: 1.25 !important;
        padding: 10px 8px !important;
        height: auto !important;
        vertical-align: middle !important;
    }

    .table-wrapper .col-stt {
        width: 54px;
    }

    .table-wrapper .col-danh-muc {
        width: 210px;
    }

    .table-wrapper .col-chi-tieu {
        width: 190px;
    }

    .table-wrapper .col-don-vi {
        width: 145px;
    }

    .table-wrapper .col-dot-giao {
        width: 160px;
    }

    .table-wrapper .col-ky {
        width: 135px;
    }

    .table-wrapper .col-number {
        width: 115px;
    }

    .table-wrapper .col-percent {
        width: 105px;
    }

    .table-wrapper .col-status {
        width: 130px;
    }

    .table-wrapper th,
    .table-wrapper td {
        border: 1px solid #dcdfe6;
        padding: 8px 10px;
        vertical-align: top;
        box-sizing: border-box;
        white-space: normal;
        overflow: hidden;
        overflow-wrap: break-word;
        word-break: normal;
        line-height: 1.35;
    }

    .table-wrapper th {
        background: #f5f7fa;
        text-align: center;
        font-weight: 600;
        overflow: visible;
        white-space: normal;
        overflow-wrap: break-word;
        word-break: normal;
        line-height: 1.25;
    }

    .table-wrapper td {
        text-align: left;
    }

    .table-wrapper td.text-right {
        text-align: right;
        white-space: normal;
        overflow-wrap: break-word;
        word-break: normal;
    }

    .table-wrapper th:nth-child(1),
    .table-wrapper td:nth-child(1),
    .table-wrapper th:nth-child(n + 7),
    .table-wrapper td:nth-child(n + 7) {
        vertical-align: middle;
    }

    .parent-row {
        background: #ffffff;
        font-weight: 700;
    }

    .parent-row td {
        border-top: 2px solid #b8c7dc;
    }

    .child-row {
        background: #f8fafc;
        color: #475569;
        font-size: 13px;
    }

    .child-row td {
        border-color: #e5eaf2;
    }

    .child-title {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
        white-space: normal;
    }

    .child-badge {
        min-width: 72px;
        padding: 5px 8px;
        font-size: 11px;
    }

    .sub-label {
        margin-top: 4px;
        font-size: 12px;
        color: #6b7280;
        white-space: normal;
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
        min-width: 0;
        max-width: 100%;
        padding: 6px 10px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 700;
        line-height: 1.25;
        text-align: center;
        white-space: normal;
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

    .badge-default,
    .badge-pending,
    .badge-muted {
        background: #f2f4f7;
        color: #344054;
    }

    @media (max-width: 1200px) {

        .filter-grid,
        .summary-grid {
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

        .bao-cao-page {
            padding: 16px;
        }

        .actions {
            flex-direction: column;
        }
    }
</style>
