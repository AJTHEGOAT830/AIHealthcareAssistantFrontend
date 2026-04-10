import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCAL_IP = Platform.OS === "android" ? "10.0.2.2" : "192.168.0.41";
const BASE_URL = `http://${LOCAL_IP}:5000`;

export default function AuthScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const router = useRouter();

    const handleAuth = async () => {
        const endpoint = isLogin ? '/login' : '/register';
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                if (isLogin) {
                    await AsyncStorage.setItem('userToken', 'isLoggedIn');
                    await AsyncStorage.setItem('username', username);
                    await AsyncStorage.setItem('user_id', data.user_id.toString());
                    router.replace('/');
                } else {
                    Alert.alert("Success", "Account created! Now please login.");
                    setIsLogin(true);
                }
            } else {
                Alert.alert("Authentication Failed", data.error);
            }
        } catch (err) {
            Alert.alert("Connection Error", "Is your Flask server running?");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{isLogin ? 'Login' : 'Sign Up'}</Text>
            <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} autoCapitalize="none" />
            <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
            <TouchableOpacity style={styles.button} onPress={handleAuth}>
                <Text style={styles.buttonText}>{isLogin ? 'Enter' : 'Register'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                <Text style={styles.switchText}>{isLogin ? "New user? Create account" : "Have an account? Login"}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 25, backgroundColor: '#f5f5f5' },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 30, textAlign: 'center', color: '#333' },
    input: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
    button: { backgroundColor: '#2D5AF0', padding: 18, borderRadius: 10, alignItems: 'center' },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    switchText: { marginTop: 20, color: '#2D5AF0', textAlign: 'center' },
});