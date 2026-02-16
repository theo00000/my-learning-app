import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import axios from "axios";

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    grade: "",
    school: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = async () => {
    setError("");
    if (formData.password !== formData.confirmPassword) {
      setError("Konfirmasi password tidak cocok!");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        "https://diy-karang-taruna.vercel.app/api/auth/register",
        {
          name: formData.name,
          email: formData.email,
          grade: formData.grade,
          school: formData.school,
          password: formData.password,
        },
      );

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }

      Alert.alert("Sukses", "Registrasi Berhasil!");
      navigation.navigate("Login");
    } catch (err) {
      setError(
        err.response?.data?.msg || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Learning Support Platform</Text>
        <Text style={styles.subtitle}>Daftar Akun Siswa SMA Kelas 12</Text>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.card}>
        {/* Nama & Email */}
        <TextInput
          placeholder="Nama Lengkap"
          value={formData.name}
          onChangeText={(v) => handleChange("name", v)}
          style={styles.input}
        />
        <TextInput
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={formData.email}
          onChangeText={(v) => handleChange("email", v)}
          style={styles.input}
        />

        {/* Kelas & Sekolah */}
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.grade}
            onValueChange={(v) => handleChange("grade", v)}
            style={styles.picker}
          >
            <Picker.Item label="Pilih Kelas" value="" />
            <Picker.Item label="12 IPA" value="12-IPA" />
            <Picker.Item label="12 IPS" value="12-IPS" />
            <Picker.Item label="12 Bahasa" value="12-Bahasa" />
          </Picker>
        </View>
        <TextInput
          placeholder="Nama Sekolah"
          value={formData.school}
          onChangeText={(v) => handleChange("school", v)}
          style={styles.input}
        />

        {/* Password */}
        <TextInput
          placeholder="Password"
          secureTextEntry
          value={formData.password}
          onChangeText={(v) => handleChange("password", v)}
          style={styles.input}
        />
        <TextInput
          placeholder="Konfirmasi Password"
          secureTextEntry
          value={formData.confirmPassword}
          onChangeText={(v) => handleChange("confirmPassword", v)}
          style={styles.input}
        />

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Mendaftarkan..." : "Daftar Sekarang"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("Login")}
          style={{ marginTop: 12 }}
        >
          <Text style={styles.linkText}>Sudah punya akun? Login di sini</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F7FAFC",
    padding: 20,
    alignItems: "center",
  },
  header: { marginBottom: 20, alignItems: "center" },
  title: { fontSize: 28, fontWeight: "bold", color: "#1F2937" },
  subtitle: { fontSize: 16, color: "#6B7280", marginTop: 4 },
  card: {
    width: "100%",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    backgroundColor: "#FFF",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
  },
  picker: { width: "100%" },
  button: {
    backgroundColor: "#6366F1",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  errorText: { color: "#DC2626", marginBottom: 8, fontWeight: "bold" },
  linkText: { color: "#6366F1", fontWeight: "bold", textAlign: "center" },
});
