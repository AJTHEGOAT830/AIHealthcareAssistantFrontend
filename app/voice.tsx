import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform, ActivityIndicator } from "react-native";
import { Audio } from "expo-av";
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCAL_IP = Platform.OS === "android" ? "10.0.2.2" : "192.168.0.41";
const PORT = 5000;
const BASE_URL = `http://${LOCAL_IP}:${PORT}`;

export default function VoiceScreen() {
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [result, setResult] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [timer, setTimer] = useState(0);

    const startRecording = async () => {
        try {
            const permission = await Audio.requestPermissionsAsync();
            if (!permission.granted) {
                setResult("Microphone permission not granted.");
                return;
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const rec = new Audio.Recording();
            await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
            await rec.startAsync();

            setRecording(rec);
            setResult("");
            // Instruction for SVD-style analysis
            setResult("Please say 'aaa' steadily into the microphone...");
        } catch (e) {
            console.log(e);
            setResult("Recording failed.");
        }
    };

    const stopRecording = async () => {
        if (!recording || isProcessing) return;
        setIsProcessing(true);

        try {
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            setRecording(null);

            if (!uri) {
                setResult("Recording failed. Please try again.");
                setIsProcessing(false);
                return;
            }

            const userId = await AsyncStorage.getItem('user_id');
            const form = new FormData();
            form.append("audio", {
                uri,
                name: "voice.wav",
                type: "audio/wav",
            } as any);
            form.append("user_id", userId || "");

            const res = await fetch(`${BASE_URL}/voice-analysis`, {
                method: "POST",
                body: form,
            });

            const data = await res.json();
            setResult(data.result || "No result");
        } catch (e) {
            console.log(e);
            setResult("Could not connect to backend.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Vocal Biomarker Analysis</Text>

            <View style={styles.instructionCard}>
                <Text style={styles.instructionText}>
                    To ensure accuracy, please record yourself saying <Text style={{fontWeight: 'bold', color: '#2D9CDB'}}>"aaa"</Text> for at least 3 seconds.
                </Text>
            </View>

            <TouchableOpacity
                style={[
                    styles.button,
                    recording ? { backgroundColor: "#EB5757" } : null,
                    isProcessing ? { opacity: 0.6 } : null
                ]}
                onPress={recording ? stopRecording : startRecording}
                disabled={isProcessing}
            >
                {isProcessing ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>
                        {recording ? "Stop & Analyze" : "Start Recording"}
                    </Text>
                )}
            </TouchableOpacity>

            <View style={styles.resultContainer}>
                <Text style={styles.resultHeader}>Result:</Text>
                <Text style={styles.resultBody}>{result}</Text>
            </View>

            <View style={styles.disclaimerBox}>
                <Text style={styles.disclaimerText}>
                    <Text style={{fontWeight: 'bold'}}>Disclaimer:</Text> This analysis is for guidance and informational purposes only. It is not a clinical diagnosis. If you have concerns about your vocal health, please consult a medical professional.
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, backgroundColor: "#0D0D0D" },
    title: { color: "#fff", fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: 'center' },
    instructionCard: {
        backgroundColor: "#1A1A1A",
        padding: 15,
        borderRadius: 10,
        borderLeftWidth: 4,
        borderLeftColor: "#2D9CDB",
        marginBottom: 20
    },
    instructionText: { color: "#ccc", lineHeight: 20 },
    button: {
        backgroundColor: "#2D9CDB",
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        elevation: 3,
    },
    buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
    resultContainer: { marginTop: 30, backgroundColor: '#1A1A1A', padding: 15, borderRadius: 10 },
    resultHeader: { color: '#828282', fontSize: 12, textTransform: 'uppercase', marginBottom: 5 },
    resultBody: { color: "#fff", fontSize: 16, fontWeight: '500' },
    disclaimerBox: { marginTop: 'auto', padding: 15, borderTopWidth: 1, borderTopColor: '#333' },
    disclaimerText: { color: "#828282", fontSize: 12, textAlign: 'center', lineHeight: 18 },
});