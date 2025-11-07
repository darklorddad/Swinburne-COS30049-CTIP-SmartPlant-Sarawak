import React from "react";
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { user_register } from '../firebase/login_register/user_register.js';
import CheckBox from 'expo-checkbox';

export default function UserRegister({navigation}){
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [agree, setAgree] = React.useState(false);

  const minLength = /^.{8,}$/;
  const hasUppercase = /[A-Z]/;
  const hasNumber = /\d/;
  const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  async function handleRegister() {
    if (!fullName || !email || !password || !confirmPassword) return Alert.alert("Error", "All fields are required.");
    if (!emailPattern.test(email)) return Alert.alert("Invalid Email", "Please enter a valid email address.");
    if (password !== confirmPassword) return Alert.alert("Error", "Passwords do not match.");
    if (!minLength.test(password)) return Alert.alert("Weak Password", "Password must be at least 8 characters long.");
    if (!hasUppercase.test(password)) return Alert.alert("Weak Password", "Password must contain at least one uppercase letter.");
    if (!hasNumber.test(password)) return Alert.alert("Weak Password", "Password must contain at least one number.");
    if (!hasSymbol.test(password)) return Alert.alert("Weak Password", "Password must contain at least one special character.");
    if (!agree) return Alert.alert("Agreement Required", "You must agree to the Terms and Privacy Policy.");

    try {
      await user_register(fullName, email, password);
      Alert.alert("Success", "Account created successfully!", [
        { text: "OK", onPress: () => navigation.navigate("UserLogin") }
      ]);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert("Email Already Used", "This email is already registered. Please use another email.");
      } else {
        Alert.alert("Registration Failed", "Try Again!");
      }
    }
  }

  return(
    <View style={styles.screen}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Image style={styles.backlogo} source={require('../../assets/backlogo.png')} />
        </TouchableOpacity>
        <ScrollView contentContainerStyle={styles.container}>
            <Image style={styles.logo} source={require('../../assets/applogo.png')} alt="Logo" />
            <View style={styles.login_container1}> 
                <Text style={styles.login_title}>Create Your Account</Text>
                <Text style={styles.input_label}>Full Name</Text>
                <TextInput style={styles.input_textinput} placeholder="John Doe" onChangeText={setFullName} />
                <Text style={styles.input_label}>Email</Text>
                <TextInput style={styles.input_textinput} placeholder="john@gmail.com" value={email} onChangeText={setEmail} autoCapitalize="none" />
                <Text style={styles.input_label}>Password</Text>
                <TextInput style={styles.input_textinput} placeholder="Password" secureTextEntry={true} value={password} onChangeText={setPassword} />
                <Text style={styles.input_label}>Confirm Password</Text>
                <TextInput style={styles.input_textinput} placeholder="Confirm Password" secureTextEntry={true} value={confirmPassword} onChangeText={setConfirmPassword} />
                <View style={styles.text_agreement_container}>
                    <CheckBox style={styles.checkbox_agreement} value={agree} onValueChange={setAgree} color={agree ? '#43772cff' : undefined} />
                    <Text style={styles.text_agreement}>
                        I agree to the <Text style={{ textDecorationLine: 'underline' }}>Terms of Condition</Text> and <Text style={{ textDecorationLine: 'underline' }}>Privacy Policy</Text>
                    </Text>
                </View>
                <TouchableOpacity style={styles.button_login} onPress={handleRegister}>
                    <Text style={styles.button_text}>Create Account</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#FFFAE4' },
    backButton: { position: 'absolute', top: 70, left: 20, zIndex: 10 },
    backlogo: { width: 40, height: 40 },
    container: { 
        flexGrow: 1, 
        alignItems: 'center', 
        padding: 20, 
        paddingTop: 140, // Pushed content down
    },
    logo: {
        width: 100, height: 100, borderRadius: 50,
        backgroundColor: "rgba(255, 255, 255, 0.49)",
        shadowColor: "#366728ff", shadowOpacity: 0.3, shadowRadius: 10, elevation: 8,
        borderWidth: 2, borderColor: "rgba(255, 255, 255, 0.4)",
        marginBottom: 30, // Added space below logo
    },
    login_container1: { // Changed from login_container3 to match
        backgroundColor: '#578C5B', padding: 20, borderRadius: 20, width: '100%',
        shadowColor: '#143d17ff', shadowOpacity: 0.2, shadowRadius: 10, elevation: 10,
    },
    login_title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#fff', textAlign: 'center' },
    input_label: { fontSize: 17, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
    input_textinput: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 10, width: '100%', marginBottom: 15 },
    button_login: { backgroundColor: '#496D4C', padding: 15, borderRadius: 10, width: '100%', alignItems: 'center', marginVertical: 10 },
    button_text: { color: '#fff', fontWeight: 'bold', fontSize: 17 },
    text_agreement_container: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    checkbox_agreement: { borderColor: "#94b094", backgroundColor: '#fff', marginRight: 10 },
    text_agreement: { fontSize: 14, color: '#fff', flex: 1 },
});
