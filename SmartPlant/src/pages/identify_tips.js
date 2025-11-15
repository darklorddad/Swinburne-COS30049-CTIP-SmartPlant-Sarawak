import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';

export default function IdentificationTips({ navigation }) {
  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.container}>

        {/* Title */}
        <Text style={styles.title}>Identification Tips</Text>
        <Text style={styles.subtitle}>
          Create spaces where you can position and grow your plants
        </Text>

        {/* Correct image */}
        <Image
          source={require('../../assets/good.jpg')}
          style={styles.bigCircle}
        />

        {/* Three small images */}
        <View style={styles.row}>
          <View style={styles.item}>
            <Image
              source={require('../../assets/too_close.jpg')}
              style={styles.smallCircle}
            />
            <Text style={styles.label}>Too Close</Text>
          </View>

          <View style={styles.item}>
            <Image
              source={require('../../assets/too_far.jpeg')}
              style={styles.smallCircle}
            />
            <Text style={styles.label}>Too Far</Text>
          </View>

          <View style={styles.item}>
            <Image
              source={require('../../assets/multi_species.jpeg')}
              style={styles.smallCircle}
            />
            <Text style={styles.label}>Multi-species</Text>
          </View>
        </View>

        {/* Single View Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Single View</Text>
          <Text style={styles.sectionText}>
            Use this option when you want to upload or take a photo of a plant 
            for quick identification.  
            Make sure the plant is centered, clear, and only one species is visible.
          </Text>
        </View>

        {/* Multiple View Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Multiple Views</Text>
          <Text style={styles.sectionText}>
            Take or upload 3 photos of the same plant from different angles.  
            This helps the model understand the shape, leaves, and structure 
            better—making the identification more accurate.
          </Text>
        </View>

        {/* Done button */}
        <TouchableOpacity style={styles.doneButton} onPress={() => navigation.goBack()}>
          <Text style={{ color: "white", fontWeight: "bold", fontSize: 18 }}>Done</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  
  container: {
    flex: 1,
    backgroundColor: '#2B2B2B', 
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  bigCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginVertical: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
  },
  item: {
    alignItems: 'center',
  },
  smallCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: 'white',
  },

  /* New Sections */
  section: {
    backgroundColor: '#3A3A3A',
    width: '100%',
    padding: 16,
    borderRadius: 14,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    color: '#E5E5E5',
    lineHeight: 20,
  },

  /* Button */
  doneButton: {
    backgroundColor: "#496D4C",
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 16,
  },
});
