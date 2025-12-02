const geoip = require('geoip-lite');


class LocationService {
  static getLocationFromIp(ip) {
    if (!ip) return { country: 'FR', city: undefined };
    const geo = geoip.lookup(ip);
    return {
      country: geo?.country || 'FR',
      city: geo?.city || undefined
    };
  }
}

module.exports = LocationService;
