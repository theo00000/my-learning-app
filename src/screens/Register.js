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

const gradeOptions = ["Grade 10", "Grade 11", "Grade 12"];

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    grade: "Grade 12",
    school: "",
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (name, value) => {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (
      !form.name ||
      !form.email ||
      !form.password ||
      !form.grade ||
      !form.school
    ) {
      return "All fields are required.";
    }

    if (form.password.length < 6) {
      return "Password must be at least 6 characters.";
    }

    return "";
  };

  const handleRegister = async () => {
    setError("");

    const validationMessage = validateForm();

    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    try {
      setIsSubmitting(true);

      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        grade: form.grade,
        school: form.school,
      });
    } catch (err) {
      console.log("REGISTER ERROR:", {
        message: err.message,
        status: err?.response?.status,
        data: err?.response?.data,
      });

      setError(
        err?.response?.data?.msg ||
          err?.response?.data?.message ||
          err.message ||
          "Register failed. Please try again.",
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
          <Text style={styles.badge}>Start learning</Text>
          <Text style={globalStyles.title}>Create your student account.</Text>
          <Text style={globalStyles.subtitle}>
            Build a structured learning habit with materials organized by
            subject and difficulty.
          </Text>
        </View>

        <View style={[globalStyles.card, styles.formCard]}>
          <Text style={styles.formTitle}>Register</Text>

          {error ? (
            <View style={globalStyles.errorBox}>
              <Text style={globalStyles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View>
            <Text style={globalStyles.label}>Full Name</Text>
            <TextInput
              style={globalStyles.input}
              placeholder="Wesly Rismahadi"
              value={form.name}
              onChangeText={(value) => updateField("name", value)}
            />
          </View>

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
              placeholder="Minimum 6 characters"
              value={form.password}
              onChangeText={(value) => updateField("password", value)}
              secureTextEntry
            />
          </View>

          <View>
            <Text style={globalStyles.label}>Grade</Text>
            <View style={styles.gradeGrid}>
              {gradeOptions.map((grade) => {
                const isActive = form.grade === grade;

                return (
                  <Pressable
                    key={grade}
                    style={[
                      styles.gradeButton,
                      isActive && styles.gradeButtonActive,
                    ]}
                    onPress={() => updateField("grade", grade)}
                  >
                    <Text
                      style={[
                        styles.gradeButtonText,
                        isActive && styles.gradeButtonTextActive,
                      ]}
                    >
                      {grade}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View>
            <Text style={globalStyles.label}>School</Text>
            <TextInput
              style={globalStyles.input}
              placeholder="Your school name"
              value={form.school}
              onChangeText={(value) => updateField("school", value)}
            />
          </View>

          <Pressable
            style={[globalStyles.button, isSubmitting && { opacity: 0.65 }]}
            onPress={handleRegister}
            disabled={isSubmitting}
          >
            <Text style={globalStyles.buttonText}>
              {isSubmitting ? "Creating account..." : "Create Account"}
            </Text>
          </Pressable>

          <Pressable onPress={() => navigation.navigate("Login")}>
            <Text style={styles.footerText}>
              Already have an account?{" "}
              <Text style={styles.footerLink}>Login</Text>
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
  gradeGrid: {
    flexDirection: "row",
    gap: 8,
  },
  gradeButton: {
    flex: 1,
    height: 44,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  },
  gradeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  gradeButtonText: {
    color: colors.muted,
    fontWeight: "900",
    fontSize: 12,
  },
  gradeButtonTextActive: {
    color: "#FFFFFF",
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
