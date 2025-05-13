type CacheEntry = {
  value: unknown
  expires: number
}
const cacheMap = new Map<string, CacheEntry>()

export const cache = {
  set<T>(key: string, value: T, ttl = 60): T {
    cacheMap.set(key, {
      value,
      expires: Date.now() + ttl * 1000,
    })
    return value
  },
  get<T>(key: string): T | undefined {
    const entry = cacheMap.get(key)
    if (entry) {
      if (entry.expires > Date.now()) {
        return entry.value as T
      }
      cacheMap.delete(key)
    }
    return undefined
  },
}
