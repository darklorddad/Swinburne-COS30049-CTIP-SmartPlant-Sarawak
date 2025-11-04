import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";

export default function PlantSuggestionCard({ name, confidence, image, onPress }) {
  console.log("card image:", image);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {image ? (
        <Image source={{ uri: image }} style={styles.thumb} />
      ) : (
        <View style={[styles.thumb, { backgroundColor: "#fff" }]} />
      )}

      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{name}</Text>
        <Text style={styles.meta}>{confidence}% Confidence</Text>
      </View>

      <Text style={styles.link}>See More →</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#E7F0E5",
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: "#FFF",
  },
  title: {
    fontWeight: "800",
    fontSize: 16,
    color: "#2b2b2b",
  },
  meta: {
    fontSize: 12,
    color: "#2b2b2b",
  },
  link: {
    fontWeight: "700",
    color: "#2b2b2b",
  },
});
