const PROVIDER_KEY = 'full_provider'
const SEEKER_KEY = 'full_seeker'

export function getProviderAccount() {
  try { return JSON.parse(localStorage.getItem(PROVIDER_KEY)) || null } catch { return null }
}

export function saveProviderAccount(account) {
  localStorage.setItem(PROVIDER_KEY, JSON.stringify(account))
}

export function clearProviderAccount() {
  localStorage.removeItem(PROVIDER_KEY)
}

export function getSeekerProfile() {
  try { return JSON.parse(localStorage.getItem(SEEKER_KEY)) || null } catch { return null }
}

export function saveSeekerProfile(profile) {
  if (!profile || Object.keys(profile).length === 0) return
  localStorage.setItem(SEEKER_KEY, JSON.stringify(profile))
}

export function clearSeekerProfile() {
  localStorage.removeItem(SEEKER_KEY)
}
