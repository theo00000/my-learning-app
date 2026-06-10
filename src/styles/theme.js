import { StyleSheet } from "react-native";

export const colors = {
  background: "#F4F7FB",
  card: "#FFFFFF",
  surface: "#F8FAFC",
  primary: "#2563EB",
  primaryDark: "#1E3A8A",
  primarySoft: "#DBEAFE",
  sky: "#0EA5E9",
  text: "#0F172A",
  muted: "#64748B",
  softText: "#94A3B8",
  border: "#E2E8F0",
  danger: "#B91C1C",
  dangerBg: "#FEF2F2",
  successBg: "#DCFCE7",
  successText: "#166534",
  warningBg: "#FEF3C7",
  warningText: "#92400E",
  purpleBg: "#EDE9FE",
  purpleText: "#5B21B6",
};

export const shadows = {
  card: {
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
};

export const globalStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 34,
    fontWeight: "900",
    color: colors.text,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    color: colors.muted,
    lineHeight: 24,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  label: {
    fontSize: 13,
    color: colors.text,
    fontWeight: "900",
    marginBottom: 8,
  },
  button: {
    minHeight: 54,
    borderRadius: 999,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  ghostButton: {
    minHeight: 46,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  ghostButtonText: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: "900",
  },
  errorBox: {
    padding: 12,
    borderRadius: 18,
    backgroundColor: colors.dangerBg,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorText: {
    color: colors.danger,
    fontWeight: "800",
    lineHeight: 20,
  },
});
