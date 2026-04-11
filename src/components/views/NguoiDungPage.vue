<template>
    <BaseLayout>
        <div class="container mt-4">

            <!-- HEADER -->
            <div class="d-flex justify-content-between align-items-center mb-3">
                <div class="gov-banner">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/a/a3/Emblem_of_Vietnam.svg"
                        class="gov-emblem" />

                    <div class="gov-text">
                        <div class="gov-title">DANH SÁCH NGƯỜI DÙNG</div>
                        <div class="gov-sub">Hệ thống đánh giá KPI</div>
                    </div>
                </div>
                <button @click="openAdd" class="btn btn-primary">+ Thêm</button>
            </div>

            <!-- LOADING -->
            <div v-if="loading" class="text-center">
                <div class="spinner-border"></div>
            </div>

            <!-- TABLE -->
            <div class="card shadow-sm" v-if="!loading && users.length">
                <div class="card-body p-0">
                    <table class="table table-hover mb-0 align-middle">
                        <thead class="table-info">
                            <tr>
                                <th>Tên</th>
                                <th>UserName</th>
                                <th>Email</th>
                                <th>Địa chỉ</th>
                                <th>SĐT</th>
                                <th>Vai trò</th>
                                <th class="text-center">Trạng thái</th>
                                <th class="text-center">Cập nhật</th>
                                <th class="text-center">Xóa</th>
                                <th class="text-center">Phân quyền</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr v-for="u in users" :key="u.id">
                                <td>{{ u.fullName }}</td>
                                <td>{{ u.userName }}</td>
                                <td>{{ u.email }}</td>
                                <td>{{ u.address }}</td>
                                <td>{{ u.phoneNumber }}</td>

                                <td>
                                    <span v-for="r in u.roles" :key="r" class="badge bg-info me-1">
                                        {{ r }}
                                    </span>
                                </td>

                                <!-- TRẠNG THÁI -->
                                <td class="text-center">
                                    <template v-if="u.id !== 'd12c48e3-825f-4799-b6f1-a55857131796'">
                                        <span @click="confirmToggle(u)" :class="[
                                    'badge px-3 py-2 d-inline-flex align-items-center gap-1',
                                    u.isActive ? 'bg-success' : 'bg-danger',
                                    u._loading ? 'opacity-50' : '',
                                    u._animate ? 'scale-effect' : ''
                                  ]" style="cursor:pointer">

                                            <span v-if="u._loading" class="spinner-border spinner-border-sm"></span>

                                            <template v-else-if="u.isActive">
                                                <i class="fa-solid fa-circle-check"></i>
                                                Hoạt động
                                            </template>

                                            <template v-else>
                                                <i class="fa-solid fa-ban"></i>
                                                Ngưng
                                            </template>
                                        </span>
                                    </template>
                                </td>

                                <!-- CẬP NHẬT -->
                                <td class="text-center">
                                    <button @click="openEdit(u)" class="btn btn-warning btn-sm">
                                        <i class="fa-solid fa-pen text-white"></i>
                                    </button>
                                </td>

                                <!-- XÓA -->
                                <td class="text-center">
                                    <template v-if="u.id !== 'd12c48e3-825f-4799-b6f1-a55857131796'">
                                        <button @click="deleteUser(u.id)" class="btn btn-danger btn-sm">
                                            <i class="fa-solid fa-trash text-white"></i>
                                        </button>
                                    </template>
                                </td>

                                <!-- PHÂN QUYỀN -->
                                <td class="text-center">
                                    <template v-if="u.id !== 'd12c48e3-825f-4799-b6f1-a55857131796'">
                                        <button @click="openRole(u)" class="btn btn-info btn-sm">
                                            <i class="fa-solid fa-user-gear text-white"></i>
                                        </button>
                                    </template>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- ===== MODAL USER ===== -->
            <div v-if="showForm" class="modal fade show d-block" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content shadow-lg border-0 rounded-4">

                        <!-- HEADER -->
                        <div class="modal-header bg-primary text-white rounded-top-4">
                            <h5 class="modal-title">
                                <i class="bi bi-person-circle me-2"></i>
                                {{ isEdit ? 'Sửa user' : 'Thêm user' }}
                            </h5>
                            <button class="btn-close btn-close-white" @click="closeForm"></button>
                        </div>

                        <!-- BODY -->
                        <div class="modal-body px-4 py-3">

                            <!-- ADD -->
                            <template v-if="!isEdit">
                                <input v-model="form.fullName" placeholder="Họ tên"
                                    class="form-control mb-3 shadow-sm" />

                                <input v-model="form.userName" placeholder="UserName"
                                    class="form-control mb-3 shadow-sm" />

                                <input v-model="form.email" placeholder="Email" class="form-control mb-3 shadow-sm" />

                                <input type="password" v-model="form.password" placeholder="Password"
                                    class="form-control mb-3 shadow-sm" />

                                <input v-model="form.address" placeholder="Địa chỉ"
                                    class="form-control mb-3 shadow-sm" />

                                <input v-model="form.phoneNumber" placeholder="SĐT"
                                    class="form-control mb-2 shadow-sm" />
                            </template>

                            <!-- EDIT -->
                            <template v-else>
                                <input v-model="form.fullName" placeholder="Họ tên"
                                    class="form-control mb-3 shadow-sm" />

                                <input v-model="form.address" placeholder="Địa chỉ"
                                    class="form-control mb-3 shadow-sm" />

                                <input v-model="form.phoneNumber" placeholder="SĐT"
                                    class="form-control mb-2 shadow-sm" />
                            </template>

                        </div>

                        <!-- FOOTER -->
                        <div class="modal-footer border-0 px-4 pb-4">
                            <button class="btn btn-outline-secondary rounded-pill px-4" @click="closeForm">
                                Hủy
                            </button>

                            <button class="btn btn-primary rounded-pill px-4 shadow-sm" @click="saveUser">
                                <i class="bi bi-save me-1"></i> Lưu
                            </button>
                        </div>

                    </div>
                </div>
            </div>

            <!-- ===== MODAL ROLE ===== -->
            <div v-if="showRoleForm" class="modal fade show d-block">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content shadow-lg border-0 rounded-4">

                        <!-- HEADER -->
                        <div class="modal-header bg-success text-white rounded-top-4">
                            <h5 class="modal-title">
                                <i class="bi bi-shield-lock me-2"></i>
                                Phân quyền - {{ currentUserName }}
                            </h5>
                            <button class="btn-close btn-close-white" @click="showRoleForm = false"></button>
                        </div>

                        <!-- BODY -->
                        <div class="modal-body px-4 py-3">

                            <!-- Loading -->
                            <div v-if="roleLoading" class="text-center py-4">
                                <div class="spinner-border text-primary"></div>
                            </div>

                            <!-- Roles -->
                            <div v-else>
                                <div v-for="r in roles" :key="r" class="form-check form-switch mb-2">

                                    <input class="form-check-input" type="checkbox" :value="r" v-model="selectedRoles"
                                        :id="'role-' + r">

                                    <label class="form-check-label ms-2" :for="'role-' + r">
                                        {{ r }}
                                    </label>
                                </div>
                            </div>

                        </div>

                        <!-- FOOTER -->
                        <div class="modal-footer border-0 px-4 pb-4">
                            <button class="btn btn-outline-secondary rounded-pill px-4" @click="showRoleForm = false">
                                Hủy
                            </button>

                            <button class="btn btn-success rounded-pill px-4 shadow-sm" @click="saveRole">
                                <i class="bi bi-check2-circle me-1"></i> Lưu
                            </button>
                        </div>

                    </div>
                </div>
            </div>

        </div>
    </BaseLayout>
</template>

<script setup>
    import { ref, onMounted } from 'vue'
    import axios from 'axios'
    import BaseLayout from '../BaseLayout.vue'

    // ===== STATE =====
    const users = ref([])
    const loading = ref(false)

    const showForm = ref(false)
    const showRoleForm = ref(false)
    const isEdit = ref(false)

    // ----- Role management -----
    const roles = ref([
        "Admin",
        "Công an Thành phố",
        "Công an cấp Phòng",
        "Công an cấp Xã/Phường"
    ])
    const selectedRoles = ref([])   // roles đang check cho user
    const currentUserId = ref(null)
    const currentUserName = ref("") // tên user đang phân quyền

    // ----- User form -----
    const form = ref({
        id: null,
        email: "",
        password: "",
        userName: "",
        fullName: "",
        phoneNumber: "",
        address: "",
        isActive: true
    })

    const token = localStorage.getItem("token")

    const api = axios.create({
        baseURL: "https://localhost:5000",
        headers: { Authorization: `Bearer ${token}` }
    })

    const authApi = axios.create({
        baseURL: "https://localhost:5000"
    })

    // ===== FETCH USERS =====
    const fetchUsers = async () => {
        loading.value = true
        try {
            const res = await api.get('/api/admin/users')

            // map dữ liệu và thêm _loading, _animate
            users.value = res.data
                .map(u => ({
                    ...u,
                    _loading: false,
                    _animate: false
                }))
                // sắp xếp: admin lên đầu
                .sort((a, b) => {
                    const adminId = 'd12c48e3-825f-4799-b6f1-a55857131796'
                    if (a.id === adminId) return -1
                    if (b.id === adminId) return 1
                    return 0
                })

        } catch (err) {
            console.error(err)
            alert("Không tải được danh sách user!")
        } finally {
            loading.value = false
        }
    }
    // ===== ADD USER =====
    const openAdd = () => {
        isEdit.value = false
        form.value = {
            email: "",
            password: "",
            userName: "",
            fullName: "",
            phoneNumber: "",
            address: "",
            isActive: true
        }
        showForm.value = true
    }

    // ===== EDIT USER =====
    const openEdit = (u) => {
        isEdit.value = true
        form.value = { ...u }
        showForm.value = true
    }

    // ===== SAVE USER =====
    const saveUser = async () => {
        try {
            if (isEdit.value) {
                await api.put(`/api/admin/users/${form.value.id}`, {
                    fullName: form.value.fullName,
                    address: form.value.address,
                    phoneNumber: form.value.phoneNumber,
                    isActive: form.value.isActive
                })
            } else {
                await api.post('/api/auth/register', form.value)
            }
            showForm.value = false
            fetchUsers()
        } catch (err) {
            console.error(err)
            alert("Lưu user thất bại!")
        }
    }

    // ===== DELETE USER =====
    const deleteUser = async (id) => {
        const ok = confirm("Bạn có chắc muốn xóa user này?")
        if (!ok) return

        try {
            await api.delete(`/api/admin/users/${id}`)
            fetchUsers()
        } catch (err) {
            console.error(err)
            alert("Xóa user thất bại!")
        }
    }

    // ===== TOGGLE USER ACTIVE =====
    const confirmToggle = (user) => {
        const ok = confirm(
            `Bạn có chắc muốn ${user.isActive ? 'ngưng' : 'kích hoạt'} user này không?`
        )
        if (!ok) return

        toggleActive(user)
    }

    const toggleActive = async (user) => {
        try {
            user._loading = true
            user._animate = true

            await api.put(`/api/admin/users/${user.id}`, {
                fullName: user.fullName,
                address: user.address,
                phoneNumber: user.phoneNumber,
                isActive: !user.isActive
            })

            user.isActive = !user.isActive

            setTimeout(() => {
                user._animate = false
            }, 200)
        } catch (err) {
            console.error(err)
            alert("Đổi trạng thái thất bại!")
        } finally {
            user._loading = false
        }
    }

    // ===== OPEN ROLE MODAL =====
    const openRole = (u) => {
        currentUserId.value = u.id
        currentUserName.value = u.fullName
        selectedRoles.value = [...u.roles] // check sẵn những role đang có
        showRoleForm.value = true
    }

    // ===== SAVE ROLE =====
    // Gửi từng roleName một, phù hợp với API backend
    const saveRole = async () => {
        if (!currentUserId.value) return

        try {
            const user = users.value.find(u => u.id === currentUserId.value)
            const currentRoles = user?.roles || []

            const rolesToAdd = selectedRoles.value.filter(r => !currentRoles.includes(r))
            const rolesToRemove = currentRoles.filter(r => !selectedRoles.value.includes(r))

            // Thêm role mới
            for (const role of rolesToAdd) {
                await api.post(`/api/admin/users/${currentUserId.value}/roles`, { roleName: role })
            }

            // Gỡ role bị bỏ tích (DELETE với body)
            for (const role of rolesToRemove) {
                await api.delete(`/api/admin/users/${currentUserId.value}/roles`, {
                    data: { roleName: role }
                })
            }

            showRoleForm.value = false
            fetchUsers()
            alert("Cập nhật role thành công!")
        } catch (err) {
            console.error(err)
            alert("Cập nhật role thất bại!")
        }
    }
    // ===== CLOSE FORM =====
    const closeForm = () => showForm.value = false

    // ===== MOUNT =====
    onMounted(fetchUsers)
</script>

<style scoped>
    /* ===== TABLE ===== */
    :deep(.table) {
        margin-bottom: 0;
        border-collapse: collapse;
    }

    /* ===== HEADER ===== */
    :deep(.table thead th) {
        border-bottom: 2px solid #dee2e6;
        /* đường dưới header */
    }

    /* ===== CHIA CỘT DỌC ===== */
    :deep(.table td),
    :deep(.table th) {
        border-right: 1px solid #eee;
    }

    /* ❌ bỏ cột cuối */
    :deep(.table td:last-child),
    :deep(.table th:last-child) {
        border-right: none;
    }

    /* ===== CHIA DÒNG ===== */
    :deep(.table tbody tr) {
        border-bottom: 1px solid #f1f1f1;
    }

    /* ===== HOVER ĐẸP ===== */
    :deep(.table-hover tbody tr:hover) {
        background-color: rgba(0, 0, 0, 0.03);
    }

    .modal {
        background: rgba(137, 210, 239, 0.5);
    }

    .modal-content {
        animation: fadeInUp 0.3s ease;
    }

    @keyframes fadeInUp {
        from {
            transform: translateY(20px);
            opacity: 0;
        }

        to {
            transform: translateY(0);
            opacity: 1;
        }
    }

    .wave-title {
        position: relative;
        display: inline-block;
        padding: 14px 28px;
        font-size: 20px;
        font-weight: 700;
        color: white;
        background: linear-gradient(90deg, #03943f, #05ce48dd);
        border-radius: 50px;
        overflow: hidden;
    }

    /* hiệu ứng lượn sóng */
    .wave-title::before {
        content: "";
        position: absolute;
        bottom: -10px;
        left: 0;
        width: 200%;
        height: 40px;
        background: radial-gradient(circle at 20px -10px, white 20px, transparent 21px);
        background-size: 40px 40px;
        opacity: 0.2;
    }

    /* glow nhẹ */
    .wave-title::after {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.3), transparent);
        opacity: 0.4;
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