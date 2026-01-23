import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();
  return (
      <View style={styles.container}>
        <Text style={styles.title}>AI Healthcare Assistant</Text>

        <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/chatbot")}
        >
          <Text style={styles.buttonText}>Chatbot</Text>
        </TouchableOpacity>

        <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/image")}
        >
          <Text style={styles.buttonText}>Image Analysis</Text>
        </TouchableOpacity>

        <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/voice")} // Removed (tabs)
        >
          <Text style={styles.buttonText}>Voice Analysis</Text>
        </TouchableOpacity>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#0D0D0D",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 32,
    color: "#FFFFFF",
  },
  button: {
    backgroundColor: "#2D9CDB",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginVertical: 10,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});