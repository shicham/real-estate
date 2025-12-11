declare module 'geoip-lite' {
  interface LookupResult {
    range: [number, number]
    country?: string
    region?: string
    eu?: string
    timezone?: string
    city?: string
    ll?: [number, number]
    metro?: number
    area?: number
  }

  function lookup(ip: string): LookupResult | null

  const geoip: {
    lookup: typeof lookup
    // ajoutez d'autres membres si nécessaire
  }

  export default geoip
}