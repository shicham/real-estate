import geoip from 'geoip-lite'

export interface GeoInfo {
  ip?: string
  country?: string
  region?: string
  city?: string
  ll?: number[]
}

class GeoService {
  lookup(ip?: string): GeoInfo | null {
    if (!ip) return null
    // if IPv6 with zone id, strip it
    const cleanIp = ip.split('%')[0]
    const res = geoip.lookup(cleanIp)
    if (!res) return null
    return {
      ip: cleanIp,
      country: res.country,
      region: res.region,
      city: res.city,
      ll: res.ll
    }
  }
}

const geoService = new GeoService()
export default geoService
