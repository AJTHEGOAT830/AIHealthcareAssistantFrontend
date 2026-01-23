import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Audio } from "expo-av";

const LOCAL_IP = Platform.OS === "android" ? "10.0.2.2" : "192.168.0.41";
const PORT = 5000;
const BASE_URL = `http://${LOCAL_IP}:${PORT}`;

export default function VoiceScreen() {
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [result, setResult] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const startRecording = async () => {
        try {
            const permission = await Audio.requestPermissionsAsync();
            if (!permission.granted) {
                setResult("Microphone permission not granted.");
                return;
            }

            // Stop any previous recording just in case
            if (recording) {
                await recording.stopAndUnloadAsync();
                setRecording(null);
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const rec = new Audio.Recording();
            await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
            await rec.startAsync();

            setRecording(rec);
            setResult(""); // reset previous result
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
            setRecording(null); // reset recording state before sending

            if (!uri) {
                setResult("Recording failed. Please try again.");
                setIsProcessing(false);
                return;
            }

            // Small delay to ensure file is fully written
            await new Promise(r => setTimeout(r, 300));

            const form = new FormData();
            form.append("audio", {
                uri,
                name: "voice.wav",
                type: "audio/wav",
            } as any);

            const res = await fetch(`${BASE_URL}/voice-analysis`, {
                method: "POST",
                headers: { "Content-Type": "multipart/form-data" },
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
            <Text style={styles.title}>Voice Analysis</Text>

            <TouchableOpacity
                style={[
                    styles.button,
                    recording ? { backgroundColor: "#EB5757" } : null,
                    isProcessing ? { opacity: 0.6 } : null
                ]}
                onPress={recording ? stopRecording : startRecording}
                disabled={isProcessing}
            >
                <Text style={styles.buttonText}>
                    {recording ? "Stop & Analyze" : "Record Voice"}
                </Text>
            </TouchableOpacity>

            <Text style={styles.result}>{result}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: "#0D0D0D" },
    title: { color: "#fff", fontSize: 20, fontWeight: "bold", marginBottom: 12 },
    button: {
        backgroundColor: "#2D9CDB",
        padding: 14,
        borderRadius: 10,
        marginTop: 10,
        alignItems: "center",
    },
    buttonText: { color: "#fff", fontWeight: "600" },
    result: { color: "#fff", marginTop: 20 },
});
