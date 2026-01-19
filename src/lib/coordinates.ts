/**
 * WGS84 to GCJ-02 Coordinate Conversion
 * 
 * China uses the GCJ-02 coordinate system (also known as "Mars Coordinates").
 * GPS devices use WGS84, so coordinates need to be converted for Chinese maps
 * like Baidu and Gaode/Amap, otherwise pins can be 500m off.
 */

const PI = Math.PI;
const AXIS = 6378245.0; // Semi-major axis of the WGS84 ellipsoid
const OFFSET = 0.00669342162296594323; // Offset for the ellipsoid

function isOutOfChina(lat: number, lng: number): boolean {
  return lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271;
}

function transformLat(x: number, y: number): number {
  let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
  ret += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0;
  ret += (20.0 * Math.sin(y * PI) + 40.0 * Math.sin(y / 3.0 * PI)) * 2.0 / 3.0;
  ret += (160.0 * Math.sin(y / 12.0 * PI) + 320 * Math.sin(y * PI / 30.0)) * 2.0 / 3.0;
  return ret;
}

function transformLng(x: number, y: number): number {
  let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
  ret += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0;
  ret += (20.0 * Math.sin(x * PI) + 40.0 * Math.sin(x / 3.0 * PI)) * 2.0 / 3.0;
  ret += (150.0 * Math.sin(x / 12.0 * PI) + 300.0 * Math.sin(x / 30.0 * PI)) * 2.0 / 3.0;
  return ret;
}

/**
 * Convert WGS84 coordinates to GCJ-02 (used by Google Maps China, Gaode/Amap)
 */
export function wgs84ToGcj02(lat: number, lng: number): { lat: number; lng: number } {
  if (isOutOfChina(lat, lng)) {
    return { lat, lng };
  }

  let dLat = transformLat(lng - 105.0, lat - 35.0);
  let dLng = transformLng(lng - 105.0, lat - 35.0);
  const radLat = lat / 180.0 * PI;
  let magic = Math.sin(radLat);
  magic = 1 - OFFSET * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  dLat = (dLat * 180.0) / ((AXIS * (1 - OFFSET)) / (magic * sqrtMagic) * PI);
  dLng = (dLng * 180.0) / (AXIS / sqrtMagic * Math.cos(radLat) * PI);

  return {
    lat: lat + dLat,
    lng: lng + dLng
  };
}

/**
 * Convert GCJ-02 to BD-09 (used by Baidu Maps)
 * Baidu uses a further transformation on top of GCJ-02
 */
export function gcj02ToBd09(lat: number, lng: number): { lat: number; lng: number } {
  const x = lng;
  const y = lat;
  const z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * PI * 3000.0 / 180.0);
  const theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * PI * 3000.0 / 180.0);
  const bdLng = z * Math.cos(theta) + 0.0065;
  const bdLat = z * Math.sin(theta) + 0.006;
  return { lat: bdLat, lng: bdLng };
}

/**
 * Convert WGS84 directly to BD-09 (for Baidu Maps)
 */
export function wgs84ToBd09(lat: number, lng: number): { lat: number; lng: number } {
  const gcj = wgs84ToGcj02(lat, lng);
  return gcj02ToBd09(gcj.lat, gcj.lng);
}
