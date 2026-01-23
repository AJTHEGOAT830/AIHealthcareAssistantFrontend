import { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    Platform,
    Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

const LOCAL_IP = Platform.OS === "android" ? "10.0.2.2" : "192.168.0.41";
const PORT = 5000;
const BASE_URL = `http://${LOCAL_IP}:${PORT}`;

export default function ImageScreen() {
    const [image, setImage] = useState<string | null>(null);
    const [result, setResult] = useState<string>("");

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
        if (!image) return;

        const form = new FormData();
        form.append("image", {
            uri: image,
            name: "photo.jpg",
            type: "image/jpeg",
        } as any);

        try {
            const res = await fetch(`${BASE_URL}/image-analysis`, {
                method: "POST",
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                body: form,
            });

            const data = await res.json();
            setResult(data.result || "No result");
        } catch (e) {
            setResult("Could not connect to backend.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Image Analysis</Text>

            {image && <Image source={{ uri: image }} style={styles.preview} />}

            <TouchableOpacity style={styles.button} onPress={pickImage}>
                <Text style={styles.buttonText}>Pick Image</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={takePhoto}>
                <Text style={styles.buttonText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={analyzeImage}>
                <Text style={styles.buttonText}>Analyze</Text>
            </TouchableOpacity>

            <Text style={styles.result}>{result}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: "#0D0D0D" },
    title: { color: "#fff", fontSize: 20, fontWeight: "bold", marginBottom: 12 },
    preview: { width: 250, height: 250, marginVertical: 10, borderRadius: 10 },
    button: {
        backgroundColor: "#2D9CDB",
        padding: 12,
        borderRadius: 10,
        marginTop: 10,
        alignItems: "center",
    },
    buttonText: { color: "#fff", fontWeight: "600" },
    result: { color: "#fff", marginTop: 16 },
});
