import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform } from "react-native";

const LOCAL_IP = Platform.OS === "android"
    ? "10.0.2.2" // Android emulator
    : "192.168.0.41"; // iOS simulator or real devices
const PORT = 5000;
const API_URL = `http://${LOCAL_IP}:${PORT}/chatbot`;

export default function ChatbotScreen() {
    const [messages, setMessages] = useState<string[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMsg = input;
        setMessages(prev => [...prev, "You: " + userMsg]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMsg }),
            });

            if (!res.ok) {
                throw new Error(`Server responded with status ${res.status}`);
            }

            const data = await res.json();
            setMessages(prev => [...prev, "Bot: " + (data.response || "No response")]);
        } catch (err) {
            console.log("Error:", err);
            setMessages(prev => [
                ...prev,
                "Bot: Could not connect to backend. Make sure Flask is running and your device is on the same network.",
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>

            <Text style={styles.title}>Healthcare Chatbot</Text>

            {/* Input at TOP */}
            <View style={styles.inputRow}>
                <TextInput
                    value={input}
                    onChangeText={setInput}
                    placeholder="Ask a question..."
                    placeholderTextColor="#888"
                    style={styles.input}
                />

                <TouchableOpacity style={styles.button} onPress={sendMessage}>
                    <Text style={styles.buttonText}>{loading ? "..." : "Send"}</Text>
                </TouchableOpacity>
            </View>

            {/* Messages BELOW */}
            <ScrollView style={styles.chatBox}>
                {messages.map((m, index) => (
                    <Text key={index} style={styles.message}>{m}</Text>
                ))}
            </ScrollView>

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: "#0D0D0D" },
    title: { color: "#fff", fontSize: 20, fontWeight: "bold", marginBottom: 12 },
    chatBox: { flex: 1, backgroundColor: "#111", padding: 10, borderRadius: 10 },
    message: { color: "#fff", marginVertical: 4 },
    inputRow: { flexDirection: "row", marginTop: 10 },
    input: {
        flex: 1,
        backgroundColor: "#222",
        color: "#fff",
        padding: 10,
        borderRadius: 8,
        marginRight: 8,
    },
    button: {
        backgroundColor: "#2D9CDB",
        paddingHorizontal: 16,
        justifyContent: "center",
        borderRadius: 8,
    },
    buttonText: { color: "#fff" },
});
