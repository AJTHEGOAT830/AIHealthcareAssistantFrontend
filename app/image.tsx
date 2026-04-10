import { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    Platform,
    Alert,
    ActivityIndicator,
    ScrollView
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCAL_IP = Platform.OS === "android" ? "10.0.2.2" : "192.168.0.41";
const PORT = 5000;
const BASE_URL = `http://${LOCAL_IP}:${PORT}`;

export default function ImageScreen() {
    const [image, setImage] = useState<string | null>(null);
    const [result, setResult] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const pickImage = async () => {
        const res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
        });

        if (!res.canceled) {
            setImage(res.assets[0].uri);
            setResult("");
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();

        if (status !== "granted") {
            Alert.alert("Permission required", "Camera access is required.");
            return;
        }

        const res = await ImagePicker.launchCameraAsync({
            quality: 0.8,
        });

        if (!res.canceled) {
            setImage(res.assets[0].uri);
            setResult("");
        }
    };

    const analyzeImage = async () => {
        if (!image) {
            Alert.alert("No Image", "Please capture or select an image first.");
            return;
        }

        setLoading(true);
        const userId = await AsyncStorage.getItem('user_id');

        const form = new FormData();
        form.append("image", {
            uri: image,
            name: "photo.jpg",
            type: "image/jpeg",
        } as any);
        form.append("user_id", userId || "");

        try {
            const res = await fetch(`${BASE_URL}/image-analysis`, {
                method: "POST",
                body: form,
            });

            const data = await res.json();
            setResult(data.result || "No result");
        } catch (e) {
            setResult("Error: Could not connect to the diagnostic server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
            <Text style={styles.title}>Dermatological Analysis</Text>

            <View style={styles.instructionCard}>
                <Text style={styles.instructionText}>
                    Provide a clear, well-lit image of the affected area. Avoid shadows and background clutter for the best analysis.
                </Text>
            </View>

            <View style={styles.imageContainer}>
                {image ? (
                    <Image source={{ uri: image }} style={styles.preview} />
                ) : (
                    <View style={styles.placeholder}>
                        <Text style={styles.placeholderText}>No image selected</Text>
                    </View>
                )}
            </View>

            <View style={styles.actionRow}>
                <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={pickImage}>
                    <Text style={styles.buttonText}>Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={takePhoto}>
                    <Text style={styles.buttonText}>Camera</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={[styles.button, styles.primaryButton, loading && { opacity: 0.7 }]}
                onPress={analyzeImage}
                disabled={loading}
            >
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Start AI Analysis</Text>}
            </TouchableOpacity>

            {result !== "" && (
                <View style={styles.resultCard}>
                    <Text style={styles.resultLabel}>Analysis Result:</Text>
                    <Text style={styles.resultText}>{result}</Text>
                </View>
            )}

            <View style={styles.disclaimerBox}>
                <Text style={styles.disclaimerText}>
                    <Text style={{ fontWeight: 'bold' }}>Disclaimer:</Text> This tool provides non-diagnostic guidance based on visible symptoms. It is not a substitute for professional medical advice. Always consult a dermatologist for definitive diagnosis and treatment.
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0D0D0D", padding: 20 },
    title: { color: "#fff", fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: 'center' },
    instructionCard: { backgroundColor: "#1A1A1A", padding: 15, borderRadius: 10, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: "#2D9CDB" },
    instructionText: { color: "#AAA", fontSize: 14, lineHeight: 20 },
    imageContainer: { alignItems: 'center', marginBottom: 20 },
    preview: { width: '100%', height: 280, borderRadius: 12, borderWidth: 1, borderColor: '#333' },
    placeholder: { width: '100%', height: 280, backgroundColor: '#1A1A1A', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#444' },
    placeholderText: { color: '#666' },
    actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    button: { padding: 16, borderRadius: 12, alignItems: "center", justifyContent: 'center' },
    primaryButton: { backgroundColor: "#2D9CDB", width: '100%' },
    secondaryButton: { backgroundColor: "#333", width: '48%' },
    buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
    resultCard: { backgroundColor: "#1A1A1A", padding: 20, borderRadius: 12, marginTop: 20, borderTopWidth: 2, borderTopColor: '#2D9CDB' },
    resultLabel: { color: '#828282', fontSize: 12, textTransform: 'uppercase', marginBottom: 5 },
    resultText: { color: "#fff", fontSize: 18, fontWeight: '600' },
    disclaimerBox: { marginTop: 30, padding: 15, borderTopWidth: 1, borderTopColor: '#222' },
    disclaimerText: { color: "#666", fontSize: 11, textAlign: 'center', lineHeight: 16 },
});