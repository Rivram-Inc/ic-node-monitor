import { LRUCache } from "lru-cache";

const geoIpCache = new LRUCache({
  max: 1000,
  ttl: 600 * 1000, // 10 minutes in milliseconds
});

export async function getGeoIpDetails(ipAddress: string) {
  // Check if the data is already cached
  const cachedData = geoIpCache.get(ipAddress);
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await fetch(
      `http://ip-api.com/json/${ipAddress}?fields=status,message,country,regionName,city,lat,lon,query`
    );
    const data = await response.json();

    if (data.status === "fail") {
      console.error("GeoIP API error:", data.message);
      return null;
    }

    const geoIpData = {
      country: data.country,
      region: data.regionName,
      city: data.city,
      latitude: data.lat,
      longitude: data.lon,
      ip: data.query,
    };

    // Cache the data
    geoIpCache.set(ipAddress, geoIpData);

    return geoIpData;
  } catch (error) {
    console.error("Error fetching GeoIP details:", error);
    return null;
  }
}
