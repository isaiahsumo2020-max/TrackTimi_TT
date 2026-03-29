exports.isWithinGeofence = (userLat, userLng, fenceLat, fenceLng, radiusMeters) => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = userLat * Math.PI / 180;
    const φ2 = fenceLat * Math.PI / 180;
    const Δφ = (fenceLat - userLat) * Math.PI / 180;
    const Δλ = (fenceLng - userLng) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; 
    return distance <= radiusMeters;
};