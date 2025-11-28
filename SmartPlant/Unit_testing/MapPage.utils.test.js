import {
  calculateDistance,
  getLatestMarkers,
  getLatestInArea,
  formatTime
} from "../src/utils/MapPage.utils";

// ⭐ calculateDistance
test("calculateDistance returns correct distance", () => {
  const dist = calculateDistance(1.0, 110.0, 1.1, 110.1);
  expect(dist).toBeGreaterThan(15);   // lower bound
  expect(dist).toBeLessThan(16);      // upper bound
});


// ⭐ getLatestMarkers
test("getLatestMarkers returns latest 2 items", () => {
  const markers = [
    { id: "a", createdAt: { seconds: 100 } },
    { id: "b", createdAt: { seconds: 200 } },
    { id: "c", createdAt: { seconds: 300 } }
  ];

  const result = getLatestMarkers(markers, 2);
  expect(result.length).toBe(2);
  expect(result[0].id).toBe("c"); // newest
});

// ⭐ getLatestInArea
test("getLatestInArea filters markers within radius", () => {
  const markers = [
    {
      id: "near",
      createdAt: { seconds: 100 },
      coordinate: { latitude: 1.0, longitude: 110.0 }
    },
    {
      id: "far",
      createdAt: { seconds: 200 },
      coordinate: { latitude: 10.0, longitude: 120.0 }
    }
  ];

  const userLocation = { latitude: 1.01, longitude: 110.01 };

  const result = getLatestInArea(markers, userLocation, 5); // 5 km radius
  expect(result.length).toBe(1);
  expect(result[0].id).toBe("near");
});

// ⭐ formatTime
test("formatTime handles timestamps correctly", () => {
  const now = Math.floor(Date.now() / 1000);

  expect(formatTime({ seconds: now })).toBe("Today");
  expect(formatTime({ seconds: now - 86400 })).toBe("Yesterday");
});

test("formatTime returns string when input is a string", () => {
  expect(formatTime("Hello")).toBe("Hello");
});
