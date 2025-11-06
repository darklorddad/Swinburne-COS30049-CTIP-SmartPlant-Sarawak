import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { metricSeverity } from "../firebase/thresholds";

export default function MetricPill({ label, value, unit, kind }) {
  const sev = metricSeverity(kind, value);
  const colors = { ok: "#1abc9c", warning: "#f39c12", critical: "#e74c3c" };

  return (
    <View style={[s.pill, { borderColor: colors[sev] }]}>
      <Text style={s.label}>{label}</Text>
      <Text style={[s.value, { color: colors[sev] }]}>
        {value ?? "—"} {unit}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  pill: {
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 8,
    marginBottom: 8
  },
  label: { fontSize: 12, opacity: 0.7 },
  value: { fontSize: 16, fontWeight: "600" }
});
