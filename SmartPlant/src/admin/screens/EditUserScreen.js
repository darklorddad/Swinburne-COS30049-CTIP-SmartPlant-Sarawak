import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { useAdminContext } from '../AdminContext';
import { Picker } from '@react-native-picker/picker';
import { BackIcon } from '../Icons';
import * as ImagePicker from 'expo-image-picker';
import { storage } from '../../firebase/FirebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function EditUserScreen({ route, navigation }) {
  const { handleUpdateUser } = useAdminContext();
  const { user } = route.params;
  
  const [name, setName] = useState(user.details.full_name);
  const [email, setEmail] = useState(user.details.email);
  const [role, setRole] = useState(user.details.role || 'User');
  const [phone, setPhone] = useState(user.details.phone_number);
  const [address, setAddress] = useState(user.details.address);
  const [dob, setDob] = useState(user.details.date_of_birth);
  const [nric, setNric] = useState(user.details.nric);
  const [postcode, setPostcode] = useState(user.details.postcode);
  const [race, setRace] = useState(user.details.race);
  const [occupation, setOccupation] = useState(user.details.occupation);
  const [division, setDivision] = useState(user.details.division);
  const [status, setStatus] = useState(user.status);
  const [imageUri, setImageUri] = useState(user.details.profile_pic);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "Permission to access the photo library is required.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri, email) => {
    if (!uri) return null;
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const filename = `profile_pictures/${email}_${Date.now()}.jpg`;
      const imageRef = ref(storage, filename);
      await uploadBytes(imageRef, blob);
      return await getDownloadURL(imageRef);
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  };

  const onSave = async () => {
    if (!name || !email) {
        Alert.alert("Error", "Name and email are required.");
        return;
    }
    
    const dataToUpdate = {
        full_name: name, 
        email, 
        role, 
        phone_number: phone, 
        address, 
        date_of_birth: dob, 
        nric, 
        postcode, 
        race, 
        occupation, 
        division,
        status,
    };

    if (imageUri && imageUri !== user.details.profile_pic) {
        try {
            const downloadURL = await uploadImage(imageUri, email);
            dataToUpdate.profile_pic = downloadURL;
        } catch (error) {
            Alert.alert("Upload Failed", "Could not upload the new profile picture. Please try again.");
            return;
        }
    }
    
    handleUpdateUser(user.id, dataToUpdate);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <BackIcon color="#3C3633" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit User</Text>
            <View style={{ width: 24 }} />
        </View>
        <ScrollView style={styles.formContainer}>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Profile Picture</Text>
                <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
                    {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, { backgroundColor: user.color || '#c8b6a6', justifyContent: 'center', alignItems: 'center' }]}>
                            <Text style={styles.avatarText}>{(name || 'U').charAt(0)}</Text>
                        </View>
                    )}
                    <Text style={styles.changeText}>Change Picture</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                    value={name}
                    onChangeText={setName}
                    style={styles.input}
                />
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                    value={email}
                    onChangeText={setEmail}
                    style={styles.input}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Role</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={role}
                        onValueChange={(itemValue) => setRole(itemValue)}
                        style={styles.picker}>
                        <Picker.Item label="User" value="User" />
                        <Picker.Item label="Expert" value="Expert" />
                        <Picker.Item label="Admin" value="Admin" />
                    </Picker>
                </View>
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Status</Text>
                <View style={styles.radioGroup}>
                    <TouchableOpacity style={styles.radioOption} onPress={() => setStatus('active')}>
                        <View style={styles.radioOuter}>
                            {status === 'active' && <View style={styles.radioInner} />}
                        </View>
                        <Text>Active</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.radioOption} onPress={() => setStatus('inactive')}>
                        <View style={styles.radioOuter}>
                            {status === 'inactive' && <View style={styles.radioInner} />}
                        </View>
                        <Text>Inactive</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone</Text>
                <TextInput
                    value={phone}
                    onChangeText={setPhone}
                    style={styles.input}
                    keyboardType="phone-pad"
                />
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Address</Text>
                <TextInput
                    value={address}
                    onChangeText={setAddress}
                    style={styles.input}
                />
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Date of Birth</Text>
                <TextInput
                    value={dob}
                    onChangeText={setDob}
                    style={styles.input}
                />
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>NRIC</Text>
                <TextInput
                    value={nric}
                    onChangeText={setNric}
                    style={styles.input}
                />
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Postcode</Text>
                <TextInput
                    value={postcode}
                    onChangeText={setPostcode}
                    style={styles.input}
                    keyboardType="numeric"
                />
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Race</Text>
                <TextInput
                    value={race}
                    onChangeText={setRace}
                    style={styles.input}
                />
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Occupation</Text>
                <TextInput
                    value={occupation}
                    onChangeText={setOccupation}
                    style={styles.input}
                />
            </View>
            <View style={[styles.inputGroup, { paddingBottom: 24 }]}>
                <Text style={styles.label}>Division</Text>
                <TextInput
                    value={division}
                    onChangeText={setDivision}
                    style={styles.input}
                />
            </View>
        </ScrollView>
        <TouchableOpacity onPress={onSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
        paddingHorizontal: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#3C3633',
    },
    formContainer: {
        flex: 1,
        marginTop: 16,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.20,
        shadowRadius: 1.41,
        elevation: 2,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4b5563',
        marginBottom: 4,
    },
    input: {
        width: '100%',
        marginTop: 4,
        padding: 12,
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        fontSize: 16,
        color: '#3C3633',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 8,
        backgroundColor: '#f1f5f9',
        marginTop: 4,
        justifyContent: 'center',
    },
    picker: {
        width: '100%',
        height: 50,
    },
    radioGroup: {
        flexDirection: 'row',
        gap: 16,
        marginTop: 8,
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    radioOuter: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#A59480',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioInner: {
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: '#A59480',
    },
    saveButton: {
        width: '100%',
        backgroundColor: '#A59480',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 16,
    },
    saveButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    avatarContainer: {
        alignItems: 'center',
        marginTop: 8,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    avatarText: {
        color: 'white',
        fontSize: 48,
        fontWeight: 'bold',
    },
    changeText: {
        color: '#3b82f6',
        marginTop: 8,
        fontWeight: '600',
    },
});
