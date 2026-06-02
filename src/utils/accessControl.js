export const isPrivilegedProfile = (profile) => {
  if (!profile) return false
  if (String(profile.email || '').toLowerCase() === 'admin@example.com') return true
  return Array.isArray(profile.roles) && profile.roles.includes('Admin')
}

export const normalizeAccessText = (value) => {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase()
}

export const isCatpProfile = (profile) => {
  if (!profile) return false

  const roles = Array.isArray(profile.roles) ? profile.roles : []
  const roleMatch = roles.some(role => normalizeAccessText(role).includes('CONG AN THANH PHO'))
  const unitMatch = normalizeAccessText(profile.donVi).includes('CONG AN THANH PHO')
  const codeMatch = ['CATP', 'CONG AN THANH PHO'].includes(normalizeAccessText(profile.maDonVi))
  const typeMatch = normalizeAccessText(profile.loaiDonVi) === 'THANH_PHO'

  return roleMatch || unitMatch || codeMatch || typeMatch
}

export const isOwnerScopeProfile = (profile) => {
  if (!profile || isPrivilegedProfile(profile)) return false
  return ['THANH_PHO', 'CAP_QUAN_LY'].includes(normalizeAccessText(profile.loaiDonVi))
}

export const canBypassUnitFilter = (profile) => {
  return isPrivilegedProfile(profile) || isCatpProfile(profile) || isOwnerScopeProfile(profile)
}

export const hasRole = (profile, roleName) => {
  if (!profile || !Array.isArray(profile.roles) || !roleName) return false
  return profile.roles.includes(roleName)
}

export const resolveEffectivePermissions = (profile) => {
  if (!profile) return []

  const directPermissions = Array.isArray(profile.permissions) ? profile.permissions : []
  const rolePermissions = Array.isArray(profile.rolePermissions) ? profile.rolePermissions : []

  return [...new Set([...directPermissions, ...rolePermissions])]
}

export const canAccessPermission = (permissions, requiredPermission, profile = null) => {
  if (!requiredPermission) return true
  if (requiredPermission === 'ViewDashboard') return true
  if (isPrivilegedProfile(profile)) return true
  if (!Array.isArray(permissions)) return false
  return permissions.includes(requiredPermission)
}

export const canAccessAnyPermission = (permissions, requiredPermissions = [], profile = null) => {
  if (!Array.isArray(requiredPermissions) || requiredPermissions.length === 0) return true
  if (isPrivilegedProfile(profile)) return true
  if (!Array.isArray(permissions)) return false
  return requiredPermissions.some(permission => permissions.includes(permission))
}

export const getStoredUserProfile = () => {
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export const getStoredUserPermissions = () => {
  const parsed = getStoredUserProfile()
  return resolveEffectivePermissions(parsed)
}
