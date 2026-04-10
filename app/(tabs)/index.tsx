import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter, Redirect, useFocusEffect } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

    useFocusEffect(
        useCallback(() => {
            const checkLoginStatus = async () => {
                const token = await AsyncStorage.getItem('userToken');
                setIsLoggedIn(!!token);
            };
            checkLoginStatus();
        }, [])
    );

    const handleLogout = async () => {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('username');
        setIsLoggedIn(false);
    };

    if (isLoggedIn === null) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#2D9CDB" />
            </View>
        );
    }

    if (isLoggedIn === false) {
        return <Redirect href="/auth" />;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>AI Healthcare Assistant</Text>

            <TouchableOpacity style={styles.button} onPress={() => router.push("/chatbot")}>
                <Text style={styles.buttonText}>Chatbot</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => router.push("/image")}>
                <Text style={styles.buttonText}>Image Analysis</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => router.push("/voice")}>
                <Text style={styles.buttonText}>Voice Analysis</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, { backgroundColor: '#56CCF2' }]}
                onPress={() => router.push("/history")}
            >
                <Text style={styles.buttonText}>My Health History</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, {backgroundColor: '#EB5757', marginTop: 40}]}
                onPress={handleLogout}
            >
                <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, backgroundColor: "#0D0D0D" },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 32, color: "#FFFFFF" },
    button: { backgroundColor: "#2D9CDB", paddingVertical: 14, paddingHorizontal: 24, borderRadius: 10, marginVertical: 10, width: "80%", alignItems: "center" },
    buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
});