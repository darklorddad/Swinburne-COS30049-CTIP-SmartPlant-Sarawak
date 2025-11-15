import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";

export default function PlantSuggestionCard({ name, confidence, image, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {image ? (
        <Image source={{ uri: image }} style={styles.thumb} />
      ) : (
        <View style={[styles.thumb, { backgroundColor: "#fff" }]} />
      )}

      <View style={styles.infoContainer}>
        <Text style={styles.title}>{name}</Text>
        <Text style={styles.meta}>{confidence}% Confidence</Text>
      </View>

      {/* "See More" link positioned at bottom-right */}
      {/* <Text style={styles.link}>See More →</Text> */}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#E7F0E5",
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
    position: "relative", // allow absolute positioning inside
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: "#FFF",
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
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
    position: "absolute",
    bottom: 10,
    right: 12,
    fontWeight: "700",
    color: "#2b2b2b",
  },
});
