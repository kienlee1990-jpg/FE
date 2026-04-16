<template>
  <BaseLayout>
    <div class="page">
      <div class="gov-banner">
        <img src="https://upload.wikimedia.org/wikipedia/commons/a/a3/Emblem_of_Vietnam.svg" class="gov-emblem" alt="Vietnam emblem" />
        <div>
          <div class="gov-title">PHÂN QUYỀN CHI TIẾT</div>
          <div class="gov-sub">Chỉ giữ quyền còn dùng với backend</div>
        </div>
      </div>

      <div class="alert alert-info">Hệ thống hiện chỉ giữ lại quyền ManageUsers vì đây là quyền quản trị còn khớp với chức năng hiện có.</div>

      <div class="mb-3">
        <label class="form-label">Chọn người dùng</label>
        <select class="form-select" v-model="selectedUserId" @change="handleUserChange">
          <option value="">-- Chọn user --</option>
          <option v-for="item in users" :key="item.id" :value="item.id">{{ item.fullName || item.userName || item.email }} - {{ item.email }}</option>
        </select>
      </div>

      <div v-if="loadingUsers" class="text-muted mb-2">Đang tải danh sách user...</div>
      <div v-if="loadingPermissions" class="text-muted mb-2">Đang tải quyền user...</div>
      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>

      <div v-if="selectedUserId" class="card shadow-sm">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center gap-3 flex-wrap mb-3">
            <div>
              <h5 class="mb-1">Danh sách quyền hợp lệ</h5>
              <div class="text-muted">Đã chọn {{ selectedPermissions.length }}/{{ permissionOptions.length }} quyền</div>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-outline-primary" @click="checkAll">Chọn tất cả</button>
              <button class="btn btn-sm btn-outline-secondary" @click="uncheckAll">Bỏ chọn tất cả</button>
            </div>
          </div>

          <div class="card border-0 shadow-sm">
            <div class="card-header bg-light d-flex justify-content-between align-items-center gap-2 flex-wrap">
              <div>
                <strong>Quản trị</strong>
                <div class="small text-muted">{{ selectedPermissions.length }}/{{ permissionOptions.length }} quyền</div>
              </div>
            </div>
            <div class="list-group list-group-flush">
              <label v-for="perm in permissionOptions" :key="perm.value" class="list-group-item d-flex justify-content-between align-items-center gap-3">
                <span class="d-flex align-items-center gap-2">
                  <input class="form-check-input mt-0" type="checkbox" :value="perm.value" v-model="selectedPermissions" />
                  <span>
                    <strong class="d-block">{{ perm.label }}</strong>
                    <small class="text-muted">{{ perm.value }}</small>
                  </span>
                </span>
                <span class="badge" :class="selectedPermissions.includes(perm.value) ? 'text-bg-success' : 'text-bg-secondary'">
                  {{ selectedPermissions.includes(perm.value) ? 'Đã chọn' : 'Chưa chọn' }}
                </span>
              </label>
            </div>
          </div>

          <div class="mt-3 d-flex gap-2 flex-wrap">
            <button class="btn btn-primary" :disabled="saving || loadingPermissions" @click="savePermissions">
              {{ saving ? 'Đang lưu...' : 'Lưu phân quyền' }}
            </button>
          </div>

          <div v-if="selectedPermissions.length" class="mt-3">
            <strong>Quyền hiện tại</strong>
            <div class="d-flex gap-2 flex-wrap mt-2">
              <span v-for="perm in selectedPermissions" :key="perm" class="badge text-bg-info">{{ perm }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseLayout>
</template>

<script setup>
import { onMounted, ref } from "vue"
import BaseLayout from "../BaseLayout.vue"
import httpClient from "../../services/httpClient"

const permissionOptions = [
  { label: "Quản trị người dùng", value: "ManageUsers" }
]
const users = ref([])
const selectedUserId = ref("")
const selectedPermissions = ref([])
const originalPermissions = ref([])
const loadingUsers = ref(false)
const loadingPermissions = ref(false)
const saving = ref(false)
const error = ref("")
const successMessage = ref("")

const handleApiError = (err, fallback) => {
  console.error(err)
  if (err.response?.status === 401) return (error.value = "Phiên đăng nhập đã hết hạn")
  if (err.response?.status === 403) return (error.value = "Bạn không có quyền truy cập chức năng này")
  error.value = err.response?.data?.message || err.response?.data?.title || fallback
}

const fetchUsers = async () => {
  try {
    loadingUsers.value = true
    error.value = ""
    const res = await httpClient.get('/admin/users')
    users.value = Array.isArray(res.data) ? res.data : []
  } catch (err) {
    handleApiError(err, "Không tải được danh sách user")
  } finally {
    loadingUsers.value = false
  }
}

const fetchUserPermissions = async (userId) => {
  try {
    loadingPermissions.value = true
    error.value = ""
    successMessage.value = ""
    const res = await httpClient.get(`/admin/users/${userId}`)
    const permissions = Array.isArray(res.data?.permissions)
      ? res.data.permissions.filter(permission => permissionOptions.some(option => option.value === permission))
      : []
    originalPermissions.value = [...permissions]
    selectedPermissions.value = [...permissions]
  } catch (err) {
    originalPermissions.value = []
    selectedPermissions.value = []
    handleApiError(err, "Không tải được quyền của user")
  } finally {
    loadingPermissions.value = false
  }
}

const handleUserChange = async () => {
  if (!selectedUserId.value) {
    originalPermissions.value = []
    selectedPermissions.value = []
    return
  }
  await fetchUserPermissions(selectedUserId.value)
}

const savePermissions = async () => {
  if (!selectedUserId.value) {
    error.value = "Vui lòng chọn user"
    return
  }
  try {
    saving.value = true
    error.value = ""
    successMessage.value = ""
    const current = new Set(originalPermissions.value)
    const next = new Set(selectedPermissions.value)
    const permissionsToAdd = [...next].filter(permission => !current.has(permission))
    const permissionsToRemove = [...current].filter(permission => !next.has(permission))
    await Promise.all([
      ...permissionsToAdd.map(permissionName => httpClient.post(`/admin/users/${selectedUserId.value}/permissions`, { permissionName })),
      ...permissionsToRemove.map(permissionName => httpClient.delete(`/admin/users/${selectedUserId.value}/permissions`, { data: { permissionName } }))
    ])
    originalPermissions.value = [...selectedPermissions.value]
    successMessage.value = permissionsToAdd.length || permissionsToRemove.length ? "Cập nhật phân quyền thành công" : "Không có thay đổi để lưu"
  } catch (err) {
    handleApiError(err, "Lưu phân quyền thất bại")
  } finally {
    saving.value = false
  }
}

const checkAll = () => { selectedPermissions.value = permissionOptions.map(item => item.value) }
const uncheckAll = () => { selectedPermissions.value = [] }

onMounted(fetchUsers)
</script>

<style scoped>
.page{padding:20px}.gov-banner{display:flex;align-items:center;gap:14px;width:400px;background:linear-gradient(180deg,#03943f 0%,#05ce48dd 100%);padding:14px 18px;border-radius:12px;color:#fff;box-shadow:0 6px 18px rgba(3,148,63,.25);margin-bottom:18px}.gov-emblem{width:46px;height:46px;object-fit:contain;filter:drop-shadow(0 2px 6px rgba(0,0,0,.3))}.gov-title{font-size:18px;font-weight:700;letter-spacing:.5px}.gov-sub{font-size:12px;opacity:.9}
</style>


