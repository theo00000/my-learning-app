import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
} from "react-native";
import axios from "axios";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email dan password wajib diisi!");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("https://", {
        email: email.trim().toLowerCase(),
        password,
      });

      const token = response.data.token;
      Alert.alert("Sukses", "Login Berhasil!");
      // navigasi ke Dashboard / Home, bawa token
      navigation.replace("Home", { userToken: token });
    } catch (error) {
      console.log("Detail Error Login:", error.response?.data);
      Alert.alert("Error", error.response?.data?.msg || "Login Gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo & Judul */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.title}>Learning Support Platform</Text>
        <Text style={styles.subtitle}>Platform Belajar Siswa SMA Kelas 12</Text>

        {/* Input Form */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="nama@email.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Masukkan password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {/* Tombol Login */}
        <TouchableOpacity
          style={[styles.btnPrimary, loading && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.btnText}>
            {loading ? "Memproses..." : "Login"}
          </Text>
        </TouchableOpacity>

        {/* Tombol Register */}
        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => navigation.navigate("Register")}
        >
          <Text style={styles.btnTextSecondary}>Daftar Sekarang</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  content: {
    flex: 1,
    padding: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    backgroundColor: "#6366F1",
    padding: 20,
    borderRadius: 25,
    marginBottom: 20,
  },
  logo: { width: 50, height: 50 },
  title: { fontSize: 28, fontWeight: "bold", color: "#1E293B" },
  subtitle: { fontSize: 14, color: "#64748B", marginBottom: 30 },
  inputContainer: { width: "100%" },
  label: { fontWeight: "bold", marginBottom: 8, color: "#1E293B" },
  input: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  btnPrimary: {
    backgroundColor: "#6366F1",
    width: "100%",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  btnText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  btnSecondary: {
    borderWidth: 2,
    borderColor: "#6366F1",
    width: "100%",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 15,
  },
  btnTextSecondary: { color: "#6366F1", fontWeight: "bold", fontSize: 16 },
});
