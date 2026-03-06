// Haversine formula for distance between 2 GPS coordinates
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

// Check if user is within geofence radius
const isWithinGeofence = (userLat, userLng, centerLat, centerLng, radius = 100) => {
  const distance = getDistance(userLat, userLng, centerLat, centerLng);
  return {
    isWithin: distance <= radius,
    distance: Math.round(distance),
    radius: radius
  };
};

// Monrovia default geofence (Paynesville area)
const DEFAULT_GEOFENCE = {
  lat: 6.3156,
  lng: -10.8074,
  radius: 500 // 500 meters
};

const geoUtils = {
  getDistance,
  isWithinGeofence,
  DEFAULT_GEOFENCE,
  
  // Check attendance geofence
  validateAttendanceLocation: (userLat, userLng) => {
    const result = isWithinGeofence(
      userLat, userLng,
      DEFAULT_GEOFENCE.lat,
      DEFAULT_GEOFENCE.lng,
      DEFAULT_GEOFENCE.radius
    );
    
    if (!result.isWithin) {
      return {
        valid: false,
        error: `Outside geofence: ${result.distance}m from center (max ${result.radius}m)`,
        distance: result.distance,
        geofence: DEFAULT_GEOFENCE
      };
    }
    
    return { valid: true, distance: result.distance };
  }
};

module.exports = geoUtils;
