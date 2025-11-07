export const thresholds = {
  temp: { min: 10, max: 40 },
  humi: { min: 20, max: 95 },
  movement: { warn: 3, critical: 8 },
  soil: { min: 20, max: 90 },
  rain: { max: 90 },
  battery: { min: 20 }
};

export function metricSeverity(key, value) {
  if (value == null) return "ok";
  const t = thresholds[key];
  if (!t) return "ok";

  if (key === "movement") {
    if (value >= t.critical) return "critical";
    if (value >= t.warn) return "warning";
    return "ok";
  }

  if (t.min !== undefined && value < t.min) return "warning";
  if (t.max !== undefined && value > t.max) return "warning";
  return "ok";
}
