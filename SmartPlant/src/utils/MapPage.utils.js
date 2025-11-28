// distance (km)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

export const getLatestMarkers = (markers, count = 3, userLocation = null) => {
  const sorted = markers.sort(
    (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
  );
  const latest = sorted.slice(0, count);

  if (!userLocation) return latest;

  return latest.map((m) => ({
    ...m,
    distance: calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      m.coordinate.latitude,
      m.coordinate.longitude
    )
  }));
};

export const getLatestInArea = (markers, userLocation = null, radius = 50) => {
  if (!userLocation) {
    return markers.sort(
      (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
    );
  }

  return markers
    .map((m) => ({
      ...m,
      distance: calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        m.coordinate.latitude,
        m.coordinate.longitude
      )
    }))
    .filter((m) => m.distance <= radius)
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
};

export const formatTime = (timeData) => {
  if (!timeData) return "Unknown time";

  if (timeData.seconds) {
    const date = new Date(timeData.seconds * 1000);
    const now = new Date();
    const diffInMs = now - date;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;

    return date.toLocaleDateString();
  }

  if (typeof timeData === "string") return timeData;

  return "Unknown time";
};
