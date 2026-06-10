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

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please fill in your email and password.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      await login({
        email: email.trim(),
        password,
      });
    } catch (err) {
      console.log("LOGIN ERROR:", {
        message: err.message,
        status: err?.response?.status,
        data: err?.response?.data,
      });

      setError(
        err?.response?.data?.message ||
          "Login failed. Please check your account again.",
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
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>
                Learning Support Platform
              </Text>
            </View>

            <Text style={styles.heroTitle}>Welcome back 👋</Text>
            <Text style={styles.heroSubtitle}>
              Continue your study progress, explore materials, and ask the AI
              Study Assistant from your phone.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Login</Text>
            <Text style={styles.cardSubtitle}>
              Enter your student account to access the dashboard.
            </Text>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={globalStyles.input}
                placeholder="student@example.com"
                placeholderTextColor={colors.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={globalStyles.input}
                placeholder="Enter your password"
                placeholderTextColor={colors.muted}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <Pressable
              style={({ pressed }) => [
                globalStyles.button,
                pressed && styles.pressed,
              ]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={globalStyles.buttonText}>Login</Text>
              )}
            </Pressable>

            <Pressable
              style={styles.switchButton}
              onPress={() => navigation.navigate("Register")}
            >
              <Text style={styles.switchText}>
                Don't have an account?{" "}
                <Text style={styles.switchTextStrong}>Register</Text>
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
  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    marginBottom: 18,
  },
  heroBadgeText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 12,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 31,
    fontWeight: "900",
    letterSpacing: -0.8,
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
    fontSize: 24,
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
