import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { colors, globalStyles } from "../styles/theme";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (name, value) => {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleLogin = async () => {
    setError("");

    if (!form.email || !form.password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setIsSubmitting(true);

      await login({
        email: form.email,
        password: form.password,
      });
    } catch (err) {
      setError(
        err?.response?.data?.msg ||
          err?.response?.data?.message ||
          "Login failed. Please check your email and password.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={globalStyles.safeArea}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hero}>
          <Text style={styles.badge}>Welcome back</Text>
          <Text style={globalStyles.title}>
            Continue your learning journey.
          </Text>
          <Text style={globalStyles.subtitle}>
            Access structured learning materials and prepare your study session
            anywhere.
          </Text>
        </View>

        <View style={[globalStyles.card, styles.formCard]}>
          <Text style={styles.formTitle}>Login</Text>

          {error ? (
            <View style={globalStyles.errorBox}>
              <Text style={globalStyles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View>
            <Text style={globalStyles.label}>Email</Text>
            <TextInput
              style={globalStyles.input}
              placeholder="student@example.com"
              value={form.email}
              onChangeText={(value) => updateField("email", value)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View>
            <Text style={globalStyles.label}>Password</Text>
            <TextInput
              style={globalStyles.input}
              placeholder="Your password"
              value={form.password}
              onChangeText={(value) => updateField("password", value)}
              secureTextEntry
            />
          </View>

          <Pressable
            style={[globalStyles.button, isSubmitting && { opacity: 0.65 }]}
            onPress={handleLogin}
            disabled={isSubmitting}
          >
            <Text style={globalStyles.buttonText}>
              {isSubmitting ? "Logging in..." : "Login"}
            </Text>
          </Pressable>

          <Pressable onPress={() => navigation.navigate("Register")}>
            <Text style={styles.footerText}>
              Don't have an account?{" "}
              <Text style={styles.footerLink}>Create account</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
  },
  hero: {
    marginBottom: 24,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#DBEAFE",
    color: colors.primaryDark,
    fontWeight: "900",
    marginBottom: 14,
  },
  formCard: {
    gap: 16,
  },
  formTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: colors.text,
  },
  footerText: {
    textAlign: "center",
    color: colors.muted,
    fontWeight: "600",
  },
  footerLink: {
    color: colors.primary,
    fontWeight: "900",
  },
});
