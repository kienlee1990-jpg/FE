<template>
    <BaseLayout>
        <div class="page">
            <div class="gov-banner">
                <img src="https://upload.wikimedia.org/wikipedia/commons/a/a3/Emblem_of_Vietnam.svg"
                    class="gov-emblem" />

                <div class="gov-text">
                    <div class="gov-title">PHÂN QUYỀN CHI TIẾT</div>
                    <div class="gov-sub">Hệ thống đánh giá KPI</div>
                </div>
            </div>

            <div class="form-group mb-3">
                <label class="form-label">Chọn user</label>
                <select class="form-select custom-select" v-model="selectedUserId" @change="handleUserChange">
                    <option value="">-- Chọn user --</option>
                    <option v-for="user in users" :key="user.id" :value="user.id">
                        {{ user.fullName || user.name }} - {{ user.email }}
                    </option>
                </select>
            </div>

            <div v-if="loadingUsers" class="alert-text">Đang tải danh sách user...</div>
            <div v-if="loadingPermissions" class="alert-text">Đang tải quyền user...</div>
            <div v-if="error" class="message error-message">{{ error }}</div>
            <div v-if="successMessage" class="message success-message">{{ successMessage }}</div>

            <div v-if="selectedUserId" class="card-box">
                <div class="card-header-custom">
                    <div>
                        <h5 class="mb-1">Danh sách quyền chi tiết</h5>
                        <p class="card-subtitle">
                            Đã chọn {{ selectedPermissions.length }}/{{ permissionOptions.length }} quyền
                        </p>
                    </div>

                    <div class="permission-actions">
                        <button class="btn btn-sm btn-outline-primary" @click="checkAll">
                            Chọn tất cả
                        </button>
                        <button class="btn btn-sm btn-outline-secondary" @click="uncheckAll">
                            Bỏ chọn tất cả
                        </button>
                    </div>
                </div>

                <div class="toolbar">
                    <input v-model="searchKeyword" type="text" class="form-control search-input"
                        placeholder="Tìm kiếm quyền..." />
                </div>

                <div class="permission-groups">
                    <div v-for="group in filteredPermissionGroups" :key="group.key" class="permission-group-card">
                        <div class="group-header">
                            <div>
                                <h6 class="group-title">{{ group.label }}</h6>
                                <span class="group-count">
                                    {{ countSelectedInGroup(group.permissions) }}/{{ group.permissions.length }} quyền
                                </span>
                            </div>

                            <button class="btn btn-sm btn-light border" @click="toggleGroup(group.permissions)">
                                {{
                                isGroupChecked(group.permissions)
                                ? "Bỏ chọn nhóm"
                                : "Chọn nhóm"
                                }}
                            </button>
                        </div>

                        <div class="permission-table">
                            <label v-for="perm in group.permissions" :key="perm.value" class="permission-row"
                                :class="{ active: selectedPermissions.includes(perm.value) }">
                                <div class="permission-left">
                                    <input class="form-check-input" type="checkbox" :value="perm.value"
                                        v-model="selectedPermissions" />
                                    <div class="permission-info">
                                        <span class="permission-label">{{ perm.label }}</span>
                                        <small class="permission-code">{{ perm.value }}</small>
                                    </div>
                                </div>

                                <span class="status-badge"
                                    :class="selectedPermissions.includes(perm.value) ? 'checked' : 'unchecked'">
                                    {{ selectedPermissions.includes(perm.value) ? "Đã chọn" : "Chưa chọn" }}
                                </span>
                            </label>
                        </div>
                    </div>
                </div>

                <div class="save-box">
                    <button class="btn btn-primary" :disabled="saving || loadingPermissions" @click="savePermissions">
                        {{ saving ? "Đang lưu..." : "Lưu phân quyền" }}
                    </button>
                </div>

                <div class="selected-box" v-if="selectedPermissions.length">
                    <strong class="selected-title">Quyền hiện tại</strong>
                    <div class="selected-tags">
                        <span v-for="perm in selectedPermissions" :key="perm" class="selected-tag">
                            {{ perm }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </BaseLayout>
</template>

<script setup>
    import { ref, onMounted, computed } from "vue"
    import axios from "axios"
    import BaseLayout from "../BaseLayout.vue"

    const API_BASE = "https://localhost:5000/api"

    const permissionOptions = [
        { label: "Xem đơn vị", value: "UNIT_VIEW", group: "unit" },
        { label: "Tạo đơn vị", value: "UNIT_CREATE", group: "unit" },
        { label: "Sửa đơn vị", value: "UNIT_EDIT", group: "unit" },
        { label: "Xóa đơn vị", value: "UNIT_DELETE", group: "unit" },

        { label: "Xem chỉ tiêu", value: "KPI_VIEW", group: "kpi" },
        { label: "Tạo chỉ tiêu", value: "KPI_CREATE", group: "kpi" },
        { label: "Sửa chỉ tiêu", value: "KPI_EDIT", group: "kpi" },
        { label: "Xóa chỉ tiêu", value: "KPI_DELETE", group: "kpi" },
        { label: "Cấu hình rule KPI", value: "KPI_CONFIG", group: "kpi" },

        { label: "Xem đợt giao chỉ tiêu", value: "ASSIGNMENT_VIEW", group: "assignment" },
        { label: "Tạo đợt giao chỉ tiêu", value: "ASSIGNMENT_CREATE", group: "assignment" },
        { label: "Sửa đợt giao chỉ tiêu", value: "ASSIGNMENT_EDIT", group: "assignment" },
        { label: "Xóa đợt giao chỉ tiêu", value: "ASSIGNMENT_DELETE", group: "assignment" },
        { label: "Phê duyệt giao chỉ tiêu", value: "ASSIGNMENT_APPROVE", group: "assignment" },

        { label: "Xem chi tiết giao chỉ tiêu", value: "ASSIGNMENT_DETAIL_VIEW", group: "assignment_detail" },
        { label: "Thêm chi tiết giao chỉ tiêu", value: "ASSIGNMENT_DETAIL_CREATE", group: "assignment_detail" },
        { label: "Sửa chi tiết giao chỉ tiêu", value: "ASSIGNMENT_DETAIL_EDIT", group: "assignment_detail" },
        { label: "Xóa chi tiết giao chỉ tiêu", value: "ASSIGNMENT_DETAIL_DELETE", group: "assignment_detail" },

        { label: "Xem kỳ báo cáo", value: "PERIOD_VIEW", group: "period" },
        { label: "Tạo kỳ báo cáo", value: "PERIOD_CREATE", group: "period" },
        { label: "Sửa kỳ báo cáo", value: "PERIOD_EDIT", group: "period" },
        { label: "Xóa kỳ báo cáo", value: "PERIOD_DELETE", group: "period" },
        { label: "Mở kỳ báo cáo", value: "PERIOD_OPEN", group: "period" },
        { label: "Khóa kỳ báo cáo", value: "PERIOD_LOCK", group: "period" },

        { label: "Xem kết quả KPI", value: "RESULT_VIEW", group: "result" },
        { label: "Nhập kết quả KPI", value: "RESULT_CREATE", group: "result" },
        { label: "Sửa kết quả KPI", value: "RESULT_EDIT", group: "result" },
        { label: "Xóa kết quả KPI", value: "RESULT_DELETE", group: "result" },
        { label: "Gửi kết quả", value: "RESULT_SUBMIT", group: "result" },
        { label: "Duyệt kết quả", value: "RESULT_APPROVE", group: "result" },

        { label: "Xem đánh giá KPI", value: "EVALUATION_VIEW", group: "evaluation" },
        { label: "Chạy đánh giá tự động", value: "EVALUATION_RUN", group: "evaluation" },
        { label: "Sửa đánh giá KPI", value: "EVALUATION_EDIT", group: "evaluation" },
        { label: "Duyệt đánh giá KPI", value: "EVALUATION_APPROVE", group: "evaluation" },
        { label: "Xem lịch sử đánh giá KPI", value: "EVALUATION_HISTORY_VIEW", group: "evaluation" },

        { label: "Xem dashboard", value: "DASHBOARD_VIEW", group: "dashboard" },
        { label: "Xem dashboard cấp thành phố", value: "DASHBOARD_CITY_VIEW", group: "dashboard" },
        { label: "Xem dashboard cấp phòng", value: "DASHBOARD_DEPARTMENT_VIEW", group: "dashboard" },
        { label: "Xem dashboard cấp xã", value: "DASHBOARD_WARD_VIEW", group: "dashboard" },
        { label: "Xem drill-down dashboard", value: "DASHBOARD_DRILLDOWN_VIEW", group: "dashboard" },

        { label: "Xem xếp hạng đơn vị", value: "RANKING_VIEW", group: "analytics" },
        { label: "Xem so sánh đơn vị", value: "COMPARISON_VIEW", group: "analytics" },

        { label: "Xem báo cáo", value: "REPORT_VIEW", group: "report" },
        { label: "Xuất báo cáo Excel", value: "REPORT_EXPORT_EXCEL", group: "report" },
        { label: "Xuất báo cáo PDF", value: "REPORT_EXPORT_PDF", group: "report" },

        { label: "Xem người dùng", value: "USER_VIEW", group: "user" },
        { label: "Tạo người dùng", value: "USER_CREATE", group: "user" },
        { label: "Sửa người dùng", value: "USER_EDIT", group: "user" },
        { label: "Xóa người dùng", value: "USER_DELETE", group: "user" },

        { label: "Xem vai trò", value: "ROLE_VIEW", group: "role" },
        { label: "Tạo vai trò", value: "ROLE_CREATE", group: "role" },
        { label: "Sửa vai trò", value: "ROLE_EDIT", group: "role" },
        { label: "Xóa vai trò", value: "ROLE_DELETE", group: "role" },
        { label: "Gán quyền cho vai trò", value: "ROLE_ASSIGN_PERMISSION", group: "role" },
        { label: "Gán vai trò cho người dùng", value: "USER_ASSIGN_ROLE", group: "role" },

        { label: "Đổi mật khẩu", value: "CHANGE_PASSWORD", group: "system" },
        { label: "Xem log hệ thống", value: "SYSTEM_LOG_VIEW", group: "system" },
        { label: "Quản lý cấu hình hệ thống", value: "SYSTEM_CONFIG", group: "system" }
    ]

    const groupLabels = {
        unit: "Quản lý đơn vị",
        kpi: "Danh mục chỉ tiêu",
        assignment: "Giao chỉ tiêu",
        assignment_detail: "Chi tiết giao chỉ tiêu",
        period: "Kỳ báo cáo",
        result: "Kết quả thực hiện",
        evaluation: "Đánh giá",
        dashboard: "Dashboard",
        analytics: "So sánh / xếp hạng",
        report: "Báo cáo",
        user: "Người dùng",
        role: "Vai trò / phân quyền",
        system: "Hệ thống"
    }

    const permissionMap = Object.fromEntries(permissionOptions.map(p => [p.label, p.value]))

    const users = ref([])
    const selectedUserId = ref("")
    const selectedPermissions = ref([])
    const searchKeyword = ref("")

    const loadingUsers = ref(false)
    const loadingPermissions = ref(false)
    const saving = ref(false)

    const error = ref("")
    const successMessage = ref("")

    const permissionGroups = computed(() => {
        const grouped = {}

        permissionOptions.forEach(item => {
            if (!grouped[item.group]) grouped[item.group] = []
            grouped[item.group].push(item)
        })

        return Object.keys(grouped).map(key => ({
            key,
            label: groupLabels[key] || key,
            permissions: grouped[key]
        }))
    })

    const filteredPermissionGroups = computed(() => {
        const keyword = searchKeyword.value.trim().toLowerCase()

        if (!keyword) return permissionGroups.value

        return permissionGroups.value
            .map(group => ({
                ...group,
                permissions: group.permissions.filter(
                    perm =>
                        perm.label.toLowerCase().includes(keyword) ||
                        perm.value.toLowerCase().includes(keyword)
                )
            }))
            .filter(group => group.permissions.length > 0)
    })

    const getAuthHeaders = () => {
        const token = localStorage.getItem("token")
        if (!token) throw new Error("Bạn chưa đăng nhập!")
        return { Authorization: `Bearer ${token}` }
    }

    const fetchUsers = async () => {
        try {
            loadingUsers.value = true
            const res = await axios.get(`${API_BASE}/admin/users`, {
                headers: getAuthHeaders()
            })
            users.value = res.data || []
        } catch (err) {
            handleApiError(err, "Không tải được danh sách user!")
        } finally {
            loadingUsers.value = false
        }
    }

    const fetchUserPermissions = async (userId) => {
        try {
            loadingPermissions.value = true
            error.value = ""
            successMessage.value = ""

            const res = await axios.get(`${API_BASE}/admin/users/${userId}`, {
                headers: getAuthHeaders()
            })

            const data = res.data

            if (Array.isArray(data.permissions)) {
                selectedPermissions.value = data.permissions
                    .map(p => permissionMap[p] || p)
                    .filter(Boolean)
            } else {
                selectedPermissions.value = []
            }
        } catch (err) {
            selectedPermissions.value = []
            handleApiError(err, "Không tải được quyền!")
        } finally {
            loadingPermissions.value = false
        }
    }

    const savePermissions = async () => {
        if (!selectedUserId.value) {
            error.value = "Vui lòng chọn user!"
            return
        }

        try {
            saving.value = true
            error.value = ""
            successMessage.value = ""

            await axios.put(
                `${API_BASE}/admin/users/${selectedUserId.value}/permissions`,
                { permissions: selectedPermissions.value },
                {
                    headers: {
                        ...getAuthHeaders(),
                        "Content-Type": "application/json"
                    }
                }
            )

            successMessage.value = "Cập nhật thành công!"
        } catch (err) {
            handleApiError(err, "Lưu thất bại!")
        } finally {
            saving.value = false
        }
    }

    const handleUserChange = async () => {
        if (!selectedUserId.value) {
            selectedPermissions.value = []
            return
        }
        await fetchUserPermissions(selectedUserId.value)
    }

    const checkAll = () => {
        selectedPermissions.value = permissionOptions.map(p => p.value)
    }

    const uncheckAll = () => {
        selectedPermissions.value = []
    }

    const isGroupChecked = (permissions) => {
        return permissions.every(p => selectedPermissions.value.includes(p.value))
    }

    const toggleGroup = (permissions) => {
        const allChecked = isGroupChecked(permissions)

        if (allChecked) {
            selectedPermissions.value = selectedPermissions.value.filter(
                item => !permissions.some(p => p.value === item)
            )
        } else {
            const merged = new Set(selectedPermissions.value)
            permissions.forEach(p => merged.add(p.value))
            selectedPermissions.value = [...merged]
        }
    }

    const countSelectedInGroup = (permissions) => {
        return permissions.filter(p => selectedPermissions.value.includes(p.value)).length
    }

    const handleApiError = (err, fallback) => {
        console.error(err)

        if (err.response) {
            if (err.response.status === 401) {
                error.value = "Token hết hạn!"
            } else if (err.response.status === 403) {
                error.value = "Không có quyền!"
            } else {
                error.value = err.response.data?.message || fallback
            }
        } else {
            error.value = "Không kết nối server!"
        }
    }

    onMounted(fetchUsers)
</script>

<style scoped>
    .page {
        padding: 20px;
    }

    .page-title {
        margin-bottom: 18px;
        font-weight: 700;
        color: #1f2937;
    }

    .custom-select,
    .search-input {
        border-radius: 10px;
        min-height: 42px;
    }

    .card-box {
        margin-top: 16px;
        padding: 20px;
        border: 1px solid #e5e7eb;
        border-radius: 18px;
        background: #ffffff;
        box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
    }

    .card-header-custom {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
        flex-wrap: wrap;
    }

    .card-subtitle {
        margin: 0;
        color: #6b7280;
        font-size: 14px;
    }

    .toolbar {
        margin-bottom: 18px;
    }

    .permission-actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
    }

    .permission-groups {
        display: grid;
        grid-template-columns: repeat(2, minmax(320px, 1fr));
        gap: 16px;
    }

    .permission-group-card {
        border: 1px solid #e5e7eb;
        border-radius: 16px;
        background: #f9fafb;
        overflow: hidden;
    }

    .group-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 14px 16px;
        background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
        border-bottom: 1px solid #e5e7eb;
    }

    .group-title {
        margin: 0;
        font-weight: 700;
        color: #0f172a;
    }

    .group-count {
        font-size: 13px;
        color: #64748b;
    }

    .permission-table {
        display: flex;
        flex-direction: column;
    }

    .permission-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 16px;
        border-bottom: 1px solid #edf2f7;
        cursor: pointer;
        transition: all 0.2s ease;
        background: #fff;
    }

    .permission-row:last-child {
        border-bottom: none;
    }

    .permission-row:hover {
        background: #f8fafc;
    }

    .permission-row.active {
        background: #ecfdf3;
    }

    .permission-left {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .permission-info {
        display: flex;
        flex-direction: column;
    }

    .permission-label {
        font-weight: 600;
        color: #111827;
    }

    .permission-code {
        color: #6b7280;
        font-size: 12px;
        margin-top: 2px;
    }

    .form-check-input {
        margin: 0;
        width: 18px;
        height: 18px;
        cursor: pointer;
    }

    .status-badge {
        padding: 4px 10px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 600;
        white-space: nowrap;
    }

    .status-badge.checked {
        background: #dcfce7;
        color: #166534;
    }

    .status-badge.unchecked {
        background: #f3f4f6;
        color: #6b7280;
    }

    .save-box {
        margin-top: 20px;
    }

    .selected-box {
        margin-top: 18px;
        padding: 16px;
        border-radius: 14px;
        background: #f8fafc;
        border: 1px dashed #cbd5e1;
    }

    .selected-title {
        display: block;
        margin-bottom: 10px;
        color: #0f172a;
    }

    .selected-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }

    .selected-tag {
        padding: 6px 10px;
        border-radius: 999px;
        background: #e0f2fe;
        color: #075985;
        font-size: 12px;
        font-weight: 600;
    }

    .message {
        margin-bottom: 14px;
        padding: 10px 14px;
        border-radius: 10px;
        font-weight: 500;
    }

    .error-message {
        background: #fef2f2;
        color: #b91c1c;
        border: 1px solid #fecaca;
    }

    .success-message {
        background: #ecfdf5;
        color: #166534;
        border: 1px solid #bbf7d0;
    }

    .alert-text {
        margin-bottom: 10px;
        color: #475569;
    }

    @media (max-width: 992px) {
        .permission-groups {
            grid-template-columns: 1fr;
        }
    }

    @media (max-width: 576px) {

        .card-header-custom,
        .group-header,
        .permission-row {
            flex-direction: column;
            align-items: flex-start;
        }

        .status-badge {
            align-self: flex-start;
        }
    }

    .gov-banner {
        display: flex;
        align-items: center;
        gap: 14px;
        width: 400px;
        background: linear-gradient(180deg, #03943f 0%, #05ce48dd 100%);
        padding: 14px 18px;

        border-radius: 12px;
        color: white;

        box-shadow: 0 6px 18px rgba(3, 148, 63, 0.25);
        margin-bottom: 18px;
    }

    .gov-emblem {
        width: 46px;
        height: 46px;
        object-fit: contain;

        filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.3));
    }

    .gov-text {
        display: flex;
        flex-direction: column;
    }

    .gov-title {
        font-size: 18px;
        font-weight: 700;
        letter-spacing: 0.5px;
    }

    .gov-sub {
        font-size: 12px;
        opacity: 0.9;
    }
</style>