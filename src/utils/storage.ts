export const STORAGE_KEYS = {
  auth: 'lunaris-auth',
  products: 'lunaris-products',
  customers: 'lunaris-customers',
  orders: 'lunaris-orders',
  inventory: 'lunaris-inventory',
  settings: 'lunaris-settings',
}

export function readStorage<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key)
    if (!data) return defaultValue
    return JSON.parse(data) as T
  } catch {
    return defaultValue
  }
}

export function writeStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}
