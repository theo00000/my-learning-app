import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { colors, globalStyles, shadows } from "../styles/theme";

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    grade: "",
    school: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const updateField = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleRegister = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError("Name, email, and password are required.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        grade: form.grade.trim(),
        school: form.school.trim(),
      });
    } catch (err) {
      console.log("REGISTER ERROR:", {
        message: err.message,
        status: err?.response?.status,
        data: err?.response?.data,
      });

      setError(
        err?.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={globalStyles.screen}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <Text style={styles.heroMini}>Create Account</Text>
            <Text style={styles.heroTitle}>Start your learning journey 🚀</Text>
            <Text style={styles.heroSubtitle}>
              Register as a student and access structured learning materials
              based on your study goals.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Student Registration</Text>
            <Text style={styles.cardSubtitle}>
              Fill in your profile to create a learning account.
            </Text>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.formGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={globalStyles.input}
                placeholder="Your name"
                placeholderTextColor={colors.muted}
                value={form.name}
                onChangeText={(value) => updateField("name", value)}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={globalStyles.input}
                placeholder="student@example.com"
                placeholderTextColor={colors.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={form.email}
                onChangeText={(value) => updateField("email", value)}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={globalStyles.input}
                placeholder="Minimum 6 characters"
                placeholderTextColor={colors.muted}
                secureTextEntry
                value={form.password}
                onChangeText={(value) => updateField("password", value)}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.formGroup, styles.rowItem]}>
                <Text style={styles.label}>Grade</Text>
                <TextInput
                  style={globalStyles.input}
                  placeholder="12"
                  placeholderTextColor={colors.muted}
                  value={form.grade}
                  onChangeText={(value) => updateField("grade", value)}
                />
              </View>

              <View style={[styles.formGroup, styles.rowItem]}>
                <Text style={styles.label}>School</Text>
                <TextInput
                  style={globalStyles.input}
                  placeholder="School"
                  placeholderTextColor={colors.muted}
                  value={form.school}
                  onChangeText={(value) => updateField("school", value)}
                />
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                globalStyles.button,
                pressed && styles.pressed,
              ]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={globalStyles.buttonText}>Create Account</Text>
              )}
            </Pressable>

            <Pressable
              style={styles.switchButton}
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={styles.switchText}>
                Already have an account?{" "}
                <Text style={styles.switchTextStrong}>Login</Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  hero: {
    backgroundColor: colors.primary,
    borderRadius: 30,
    padding: 24,
    marginBottom: 18,
    ...shadows.card,
  },
  heroMini: {
    color: "#DBEAFE",
    fontWeight: "800",
    marginBottom: 10,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -0.7,
  },
  heroSubtitle: {
    color: "#DBEAFE",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  cardTitle: {
    fontSize: 23,
    fontWeight: "900",
    color: colors.text,
  },
  cardSubtitle: {
    color: colors.muted,
    marginTop: 6,
    marginBottom: 18,
    lineHeight: 21,
  },
  formGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  rowItem: {
    flex: 1,
  },
  errorBox: {
    backgroundColor: colors.dangerSoft,
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
  },
  errorText: {
    color: colors.danger,
    fontWeight: "700",
    lineHeight: 20,
  },
  switchButton: {
    marginTop: 18,
    alignItems: "center",
  },
  switchText: {
    color: colors.muted,
    fontWeight: "600",
  },
  switchTextStrong: {
    color: colors.primary,
    fontWeight: "900",
  },
  pressed: {
    opacity: 0.85,
  },
});
