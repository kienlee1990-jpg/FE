<template>
  <BaseLayout>
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-3">
        <div class="gov-banner">
          <img src="https://upload.wikimedia.org/wikipedia/commons/a/a3/Emblem_of_Vietnam.svg" class="gov-emblem" alt="Vietnam emblem" />
          <div>
            <div class="gov-title">DANH SÁCH NGƯỜI DÙNG</div>
            <div class="gov-sub">Quản trị người dùng theo backend hiện tại</div>
          </div>
        </div>
        <button @click="openAdd" class="btn btn-primary">+ Thêm</button>
      </div>

      <div class="alert alert-info">Backend hiện chưa có endpoint xóa user, nên màn này chỉ hỗ trợ thêm, sửa, khóa/mở và gán role.</div>

      <div v-if="loading" class="text-center py-4"><div class="spinner-border"></div></div>

      <div v-else-if="users.length" class="card shadow-sm">
        <div class="card-body p-0">
          <table class="table table-hover mb-0 align-middle">
            <thead class="table-info">
              <tr>
                <th>Tên</th><th>UserName</th><th>Email</th><th>Địa chỉ</th><th>SĐT</th><th>Vai trò</th><th class="text-center">Trạng thái</th><th class="text-center">Cập nhật</th><th class="text-center">Xóa</th><th class="text-center">Phân quyền</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in users" :key="item.id">
                <td>{{ item.fullName || '-' }}</td>
                <td>{{ item.userName || '-' }}</td>
                <td>{{ item.email || '-' }}</td>
                <td>{{ item.address || '-' }}</td>
                <td>{{ item.phoneNumber || '-' }}</td>
                <td>
                  <span v-for="role in item.roles || []" :key="role" class="badge bg-info me-1">{{ role }}</span>
                  <span v-if="!(item.roles || []).length" class="text-muted">Chưa có</span>
                </td>
                <td class="text-center">
                  <template v-if="!isProtectedUser(item)">
                    <span @click="confirmToggle(item)" :class="['badge px-3 py-2 d-inline-flex align-items-center gap-1', item.isActive ? 'bg-success' : 'bg-danger', item._loading ? 'opacity-50' : '', item._animate ? 'scale-effect' : '']" style="cursor:pointer">
                      <span v-if="item._loading" class="spinner-border spinner-border-sm"></span>
                      <template v-else-if="item.isActive"><i class="fa-solid fa-circle-check"></i> Hoạt động</template>
                      <template v-else><i class="fa-solid fa-ban"></i> Ngừng</template>
                    </span>
                  </template>
                </td>
                <td class="text-center"><button @click="openEdit(item)" class="btn btn-warning btn-sm"><i class="fa-solid fa-pen text-white"></i></button></td>
                <td class="text-center"><span class="badge text-bg-secondary">Chưa hỗ trợ</span></td>
                <td class="text-center">
                  <template v-if="!isProtectedUser(item)"><button @click="openRole(item)" class="btn btn-info btn-sm"><i class="fa-solid fa-user-gear text-white"></i></button></template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-else class="alert alert-light border">Chưa có người dùng nào để hiển thị.</div>

      <div v-if="showForm" class="modal fade show d-block" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content shadow-lg border-0 rounded-4">
            <div class="modal-header bg-primary text-white rounded-top-4">
              <h5 class="modal-title"><i class="bi bi-person-circle me-2"></i>{{ isEdit ? 'Sửa user' : 'Thêm user' }}</h5>
              <button class="btn-close btn-close-white" @click="closeForm"></button>
            </div>
            <div class="modal-body px-4 py-3">
              <template v-if="!isEdit">
                <input v-model="form.fullName" placeholder="Họ tên" class="form-control mb-3 shadow-sm" />
                <input v-model="form.userName" placeholder="UserName" class="form-control mb-3 shadow-sm" />
                <input v-model="form.email" placeholder="Email" class="form-control mb-3 shadow-sm" />
                <input type="password" v-model="form.password" placeholder="Mật khẩu" class="form-control mb-3 shadow-sm" />
                <input v-model="form.address" placeholder="Địa chỉ" class="form-control mb-3 shadow-sm" />
                <input v-model="form.phoneNumber" placeholder="SDT" class="form-control mb-2 shadow-sm" />
              </template>
              <template v-else>
                <input v-model="form.fullName" placeholder="Họ tên" class="form-control mb-3 shadow-sm" />
                <input v-model="form.address" placeholder="Địa chỉ" class="form-control mb-3 shadow-sm" />
                <input v-model="form.phoneNumber" placeholder="SDT" class="form-control mb-2 shadow-sm" />
              </template>
            </div>
            <div class="modal-footer border-0 px-4 pb-4">
              <button class="btn btn-outline-secondary rounded-pill px-4" @click="closeForm">Hủy</button>
              <button class="btn btn-primary rounded-pill px-4 shadow-sm" @click="saveUser"><i class="bi bi-save me-1"></i> Lưu</button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="showRoleForm" class="modal fade show d-block">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content shadow-lg border-0 rounded-4">
            <div class="modal-header bg-success text-white rounded-top-4">
              <h5 class="modal-title"><i class="bi bi-shield-lock me-2"></i>Phân quyền vai trò - {{ currentUserName }}</h5>
              <button class="btn-close btn-close-white" @click="showRoleForm = false"></button>
            </div>
            <div class="modal-body px-4 py-3">
              <div v-if="roleLoading" class="text-center py-4"><div class="spinner-border text-primary"></div></div>
              <div v-else>
                <div v-for="role in availableRoles" :key="role" class="form-check form-switch mb-2">
                  <input class="form-check-input" type="checkbox" :value="role" v-model="selectedRoles" :id="`role-${role}`" />
                  <label class="form-check-label ms-2" :for="`role-${role}`">{{ role }}</label>
                </div>
              </div>
            </div>
            <div class="modal-footer border-0 px-4 pb-4">
              <button class="btn btn-outline-secondary rounded-pill px-4" @click="showRoleForm = false">Hủy</button>
              <button class="btn btn-success rounded-pill px-4 shadow-sm" @click="saveRole"><i class="bi bi-check2-circle me-1"></i> Lưu</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseLayout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import BaseLayout from '../BaseLayout.vue'
import httpClient from '../../services/httpClient'

const users = ref([])
const loading = ref(false)
const showForm = ref(false)
const showRoleForm = ref(false)
const roleLoading = ref(false)
const isEdit = ref(false)
const defaultRoles = ['Admin', 'Công an Thành phố', 'Công an cấp Phòng', 'Công an cấp Xã/Phường']
const selectedRoles = ref([])
const currentUserId = ref(null)
const currentUserName = ref('')
const form = ref({ id: null, email: '', password: '', userName: '', fullName: '', phoneNumber: '', address: '', isActive: true })
const protectedUserId = 'd12c48e3-825f-4799-b6f1-a55857131796'
const isProtectedUser = (user) => user?.id === protectedUserId
const availableRoles = computed(() => {
  const merged = new Set(defaultRoles)
  users.value.forEach(item => (item.roles || []).forEach(role => merged.add(role)))
  return [...merged]
})

const fetchUsers = async () => {
  loading.value = true
  try {
    const res = await httpClient.get('/admin/users')
    users.value = (Array.isArray(res.data) ? res.data : []).map(item => ({ ...item, _loading: false, _animate: false })).sort((a, b) => a.id === protectedUserId ? -1 : b.id === protectedUserId ? 1 : 0)
  } catch (err) {
    console.error(err)
    alert('Không tải được danh sách user!')
  } finally {
    loading.value = false
  }
}

const openAdd = () => {
  isEdit.value = false
  form.value = { id: null, email: '', password: '', userName: '', fullName: '', phoneNumber: '', address: '', isActive: true }
  showForm.value = true
}

const openEdit = (user) => {
  isEdit.value = true
  form.value = { id: user.id, fullName: user.fullName || '', address: user.address || '', phoneNumber: user.phoneNumber || '', isActive: user.isActive }
  showForm.value = true
}

const saveUser = async () => {
  try {
    if (isEdit.value) {
      await httpClient.put(`/admin/users/${form.value.id}`, { fullName: form.value.fullName, address: form.value.address, phoneNumber: form.value.phoneNumber, isActive: form.value.isActive })
    } else {
      await httpClient.post('/auth/register', { email: form.value.email, password: form.value.password, userName: form.value.userName, fullName: form.value.fullName, phoneNumber: form.value.phoneNumber, address: form.value.address })
    }
    showForm.value = false
    await fetchUsers()
  } catch (err) {
    console.error(err)
    alert('Lưu user thất bại!')
  }
}

const confirmToggle = (user) => {
  const ok = confirm(`Bạn có chắc muốn ${user.isActive ? 'ngừng' : 'kích hoạt'} user này không?`)
  if (!ok) return
  toggleActive(user)
}

const toggleActive = async (user) => {
  try {
    user._loading = true
    user._animate = true
    await httpClient.put(`/admin/users/${user.id}`, { fullName: user.fullName, address: user.address, phoneNumber: user.phoneNumber, isActive: !user.isActive })
    user.isActive = !user.isActive
    setTimeout(() => { user._animate = false }, 200)
  } catch (err) {
    console.error(err)
    alert('Đổi trạng thái thất bại!')
  } finally {
    user._loading = false
  }
}

const openRole = (user) => {
  currentUserId.value = user.id
  currentUserName.value = user.fullName || user.email || ''
  selectedRoles.value = [...(user.roles || [])]
  showRoleForm.value = true
}

const saveRole = async () => {
  if (!currentUserId.value) return
  try {
    roleLoading.value = true
    const user = users.value.find(item => item.id === currentUserId.value)
    const currentRoles = user?.roles || []
    const rolesToAdd = selectedRoles.value.filter(role => !currentRoles.includes(role))
    const rolesToRemove = currentRoles.filter(role => !selectedRoles.value.includes(role))
    for (const roleName of rolesToAdd) {
      await httpClient.post(`/admin/users/${currentUserId.value}/roles`, { roleName })
    }
    for (const roleName of rolesToRemove) {
      await httpClient.delete(`/admin/users/${currentUserId.value}/roles`, { data: { roleName } })
    }
    showRoleForm.value = false
    await fetchUsers()
    alert('Cập nhật vai trò thành công!')
  } catch (err) {
    console.error(err)
    alert('Cập nhật vai trò thất bại!')
  } finally {
    roleLoading.value = false
  }
}

const closeForm = () => { showForm.value = false }
onMounted(fetchUsers)
</script>

<style scoped>
:deep(.table){margin-bottom:0;border-collapse:collapse}:deep(.table thead th){border-bottom:2px solid #dee2e6}:deep(.table td),:deep(.table th){border-right:1px solid #eee}:deep(.table td:last-child),:deep(.table th:last-child){border-right:none}:deep(.table tbody tr){border-bottom:1px solid #f1f1f1}:deep(.table-hover tbody tr:hover){background-color:rgba(0,0,0,.03)}.modal{background:rgba(137,210,239,.5)}.modal-content{animation:fadeInUp .3s ease}@keyframes fadeInUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}.gov-banner{display:flex;align-items:center;gap:14px;width:400px;background:linear-gradient(180deg,#03943f 0%,#05ce48dd 100%);padding:14px 18px;border-radius:12px;color:#fff;box-shadow:0 6px 18px rgba(3,148,63,.25)}.gov-emblem{width:46px;height:46px;object-fit:contain;filter:drop-shadow(0 2px 6px rgba(0,0,0,.3))}.gov-title{font-size:18px;font-weight:700;letter-spacing:.5px}.gov-sub{font-size:12px;opacity:.9}
</style>


