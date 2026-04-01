exports.isWithinGeofence = (userLat, userLng, fenceLat, fenceLng, radiusMeters) => {
    const R = 6371e3; // Radius of earth in meters
    
    // Ensure all inputs are numbers
    const lat1 = parseFloat(userLat);
    const lon1 = parseFloat(userLng);
    const lat2 = parseFloat(fenceLat);
    const lon2 = parseFloat(fenceLng);

    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; 

    return {
        isWithin: distance <= radiusMeters,
        distance: Math.round(distance)
    };
};