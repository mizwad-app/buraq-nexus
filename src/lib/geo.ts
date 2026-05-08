/**
 * Calculate distance between two GPS points using Haversine formula.
 * Returns distance in kilometers.
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface City {
  slug: string;
  name_uz: string;
  name_en?: string | null;
  latitude: number;
  longitude: number;
}

/**
 * Find the closest city to given coordinates.
 * Returns null if no city within maxDistanceKm (default 200km).
 */
export function findClosestCity(
  userLat: number,
  userLng: number,
  cities: City[],
  maxDistanceKm: number = 200
): { city: City; distanceKm: number } | null {
  let closest: City | null = null;
  let minDistance = Infinity;

  for (const city of cities) {
    const dist = haversineDistance(userLat, userLng, city.latitude, city.longitude);
    if (dist < minDistance) {
      minDistance = dist;
      closest = city;
    }
  }

  if (!closest || minDistance > maxDistanceKm) return null;
  return { city: closest, distanceKm: minDistance };
}

export interface ChinaCity {
  slug: string;
  name_uz: string;
  latitude: number;
  longitude: number;
}

export function findClosestChinaCity(
  userLat: number,
  userLng: number,
  cities: ChinaCity[],
  maxDistanceKm: number = 200
): { city: ChinaCity; distanceKm: number } | null {
  let closest: ChinaCity | null = null;
  let minDist = Infinity;
  for (const c of cities) {
    const d = haversineDistance(userLat, userLng, c.latitude, c.longitude);
    if (d < minDist) {
      minDist = d;
      closest = c;
    }
  }
  if (!closest || minDist > maxDistanceKm) return null;
  return { city: closest, distanceKm: minDist };
}
