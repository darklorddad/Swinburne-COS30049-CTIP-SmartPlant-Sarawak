import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { loginWithEmail, saveBiometric, saveCredentials, checkUserRole, getSavedCredentials } from "../firebase/login_register/user_login";
import * as LocalAuthentication from 'expo-local-authentication';
import * as Facebook from 'expo-auth-session/providers/facebook';
import * as WebBrowser from 'expo-web-browser';
import { FacebookAuthProvider, onAuthStateChanged, signInWithCredential } from 'firebase/auth';
import { auth } from '../firebase/FirebaseConfig';
import * as Google from "expo-auth-session/providers/google";
import Recaptcha from "react-native-recaptcha-that-works";

WebBrowser.maybeCompleteAuthSession();

export default function UserLogin({ navigation }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const recaptchaRef = React.useRef();
    const [showCaptcha, setShowCaptcha] = useState(false);
    const [loggedInUser, setLoggedInUser] = useState(null);

    const SITE_KEY = "6LeViOkrAAAAAHFmBLtVJO5pc3VaeC6OINL3ThsB";
    const BASE_URL = "https://smartplantsarawak.com";

    const [request, response, promptAsync] = Facebook.useAuthRequest({
        clientId: '1388152972866413',
        redirectUri: "https://auth.expo.io/@lyqhkld/camera",
        useProxy: true,
    });

    const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest({
        androidClientId: "521669272766-f7jvvkdvski00tt3t4u84b8hmgv2eehr.apps.googleusercontent.com",
        iosClientId: "521669272766-kusmfbsh1muk77326qhcok00bh80km1t.apps.googleusercontent.com",
        webClientId: "521669272766-ppbcskhou545io4ec701j844mmmu98oh.apps.googleusercontent.com",
        useProxy: true,
    });

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {});
        return unsubscribe;
    }, []);

    useEffect(() => {
        if (response?.type === 'success') {
            const { access_token } = response.params;
            const credential = FacebookAuthProvider.credential(access_token);
            signInWithCredential(auth, credential)
                .then(async (userCredential) => {
                    const user = userCredential.user;
                    const userRole = await checkUserRole(user.uid);
                    if (userRole === 'admin') {
                        navigation.navigate("AdminDashboard", { userEmail: user.email });
                    } else if (userRole === 'expert') {
                        navigation.navigate("HomepageExpert", { userEmail: user.email });
                    } else {
                        navigation.navigate("HomepageUser", { userEmail: user.email });
                    }
                })
                .catch((err) => {
                    console.error('❌ Firebase sign-in error:', err);
                    Alert.alert("Login Failed", err.message);
                });
        }
    }, [response]);

    useEffect(() => {
        if (googleResponse?.type === "success") {
            const { id_token } = googleResponse.authentication;
            loginWithGoogle(id_token).then(async (res) => {
                if (res.success) {
                    const userRole = await checkUserRole(res.user.uid);
                    if (userRole === 'admin') {
                        navigation.navigate("AdminDashboard", { userEmail: res.user.email });
                    } else if (userRole === 'expert') {
                        navigation.navigate("HomepageExpert", { userEmail: res.user.email });
                    } else {
                        navigation.navigate("HomepageUser", { userEmail: res.user.email });
                    }
                } else {
                    Alert.alert("Login Failed", res.error);
                }
            });
        }
    }, [googleResponse]);

    async function handleLogin() {
        const result = await loginWithEmail(email, password);
        if (!result.success) return Alert.alert("Error", result.error);
        const userRole = await checkUserRole(result.user.uid);
        if (userRole === 'admin') {
            await saveBiometric(email);
            await saveCredentials(email, password);
            navigation.navigate("AdminDashboard", { userEmail: email });
        } else {
            setLoggedInUser(result.user);
            setShowCaptcha(true);
            setTimeout(() => recaptchaRef.current.open(), 500);
        }
    }

    async function onCaptchaSuccess(token) {
        setShowCaptcha(false);
        if (!token) return Alert.alert("Error", "reCAPTCHA failed. Please try again.");

        const userRole = loggedInUser ? await checkUserRole(loggedInUser.uid) : null;

        await saveBiometric(email);
        const saveResult = await saveCredentials(email, password);
        if (saveResult.success) {
            if (userRole === 'expert') {
                navigation.navigate("HomepageExpert", { userEmail: email });
            } else {
                navigation.navigate("HomepageUser", { userEmail: email });
            }
        } else {
            Alert.alert("Error", saveResult.error || "Unable to save credentials.");
        }
    }

    async function handleQuickLogin() {
        if (!await LocalAuthentication.hasHardwareAsync()) return Alert.alert("Error", "Biometric hardware not available.");
        if (!await LocalAuthentication.isEnrolledAsync()) return Alert.alert("Error", "No biometrics enrolled.");
        const { success } = await LocalAuthentication.authenticateAsync({ promptMessage: "Log in with your biometrics" });
        if (success) {
            const credentials = await getSavedCredentials();
            if (credentials) {
                const result = await loginWithEmail(credentials.email, credentials.password);
                if (result.success) {
                    const userRole = await checkUserRole(result.user.uid);
                    if (userRole === 'admin') {
                        navigation.navigate("AdminDashboard", { userEmail: credentials.email });
                    } else if (userRole === 'expert') {
                        navigation.navigate("HomepageExpert", { userEmail: credentials.email });
                    } else {
                        navigation.navigate("HomepageUser", { userEmail: credentials.email });
                    }
                } else {
                    Alert.alert("Quick Login Failed", result.error);
                }
            } else {
                Alert.alert("Quick Login Failed", "No saved credentials found.");
            }
        }
    }

    return (
        <View style={styles.screen}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Image style={styles.backlogo} source={require('../../assets/backlogo.png')} />
            </TouchableOpacity>
            <ScrollView contentContainerStyle={styles.container}>
                <Image style={styles.logo} source={require('../../assets/applogo.png')} alt="Logo" />
                {showCaptcha && (
                    <Recaptcha style={styles.captcha} ref={recaptchaRef} siteKey={SITE_KEY} baseUrl={BASE_URL} onVerify={onCaptchaSuccess} />
                )}
                <View style={styles.login_container1}>
                    <Text style={styles.login_title}>Welcome back!</Text>
                    <Text style={styles.input_label}>Email</Text>
                    <TextInput style={styles.input_textinput} placeholder="john@example.com" onChangeText={setEmail} autoCapitalize="none"/>
                    <Text style={styles.input_label}>Password</Text>
                    <TextInput style={styles.input_textinput} placeholder="********" secureTextEntry={true} onChangeText={setPassword} />
                    <View style={styles.row}>
                        <Text style={styles.text1}>Remember me</Text>
                        <Text style={styles.link1}>Forgot password?</Text>
                    </View>
                    <TouchableOpacity style={styles.button_login} onPress={handleLogin}>
                        <Text style={styles.button_text}>Log In</Text>
                    </TouchableOpacity>
                    <View style={styles.login_method_container}>
                        <TouchableOpacity style={styles.login_method} onPress={() => googlePromptAsync()}>
                            <Image style={styles.social_icon} source={require('../../assets/google.png')} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.login_method} disabled={!request} onPress={() => promptAsync()}>
                            <Image style={styles.social_icon} source={require('../../assets/facebook.png')} />
                        </TouchableOpacity>
                    </View>
                </View>
                <Text style={styles.text2}>Don't have an account? <Text style={styles.link2} onPress={() => navigation.navigate("UserRegister")}>Sign up.</Text></Text>
                <View style={styles.hr} />
                <View style={styles.quickLoginContainer}>
                    <Text style={styles.quicklogin_text1}>Quick login with Touch ID/fingerprint</Text>
                    <TouchableOpacity onPress={handleQuickLogin}>
                        <Image style={styles.touchid} source={require('../../assets/touchid.png')} />
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
    login_container1: {
        backgroundColor: '#578C5B', padding: 20, borderRadius: 20, width: '100%',
        shadowColor: '#143d17ff', shadowOpacity: 0.2, shadowRadius: 10, elevation: 10,
    },
    login_title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#fff', textAlign: 'center' },
    input_label: { fontSize: 17, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
    input_textinput: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 10, width: '100%', marginBottom: 15 },
    row: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 20 },
    text1: { fontSize: 15, fontWeight: 'bold', color: '#fff' },
    link1: { color: '#fff', fontWeight: 'bold', fontSize: 15, textDecorationLine: 'underline' },
    button_login: {
        backgroundColor: '#496D4C',
        height: 50,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    button_text: { color: '#fff', fontWeight: 'bold', fontSize: 17 },
    login_method_container: { 
        flexDirection: 'row', 
        gap: 10, 
    },
    login_method: {
        flex: 1,
        backgroundColor: '#fff',
        height: 50,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
    },
    social_icon: { width: 24, height: 24, resizeMode: 'contain' },
    text2: { fontSize: 15, fontWeight: 'bold', color: '#000', marginVertical: 20 },
    link2: { color: '#344d36ff', textDecorationLine: 'underline' },
    hr: { height: 1, backgroundColor: '#ccc', width: '100%', marginVertical: 10 },
    quickLoginContainer: { alignItems: 'center', marginTop: 20 },
    quicklogin_text1: { fontWeight: 'bold', fontSize: 17, color: '#000', marginBottom: 10 },
    touchid: { width: 85, height: 85, margin: 15 },
    captcha: { zIndex: 9999, backgroundColor: "rgba(0,0,0,0.5)" },
});
