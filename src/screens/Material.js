import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import api from "../services/api";
import { colors, globalStyles, shadows } from "../styles/theme";

export default function MaterialDetailScreen({ navigation, route }) {
  const { materialId } = route.params;

  const [material, setMaterial] = useState(null);
  const [relatedMaterials, setRelatedMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMaterial = async () => {
    try {
      setIsLoading(true);
      setError("");

      const [detailResponse, materialsResponse] = await Promise.all([
        api.get(`/courses/${materialId}`),
        api.get("/courses"),
      ]);

      const detail = detailResponse.data;
      const allMaterials = Array.isArray(materialsResponse.data)
        ? materialsResponse.data
        : [];

      setMaterial(detail);

      setRelatedMaterials(
        allMaterials
          .filter(
            (item) =>
              item._id !== detail._id && item.subject === detail.subject,
          )
          .slice(0, 3),
      );
    } catch (err) {
      console.log("MATERIAL DETAIL ERROR:", {
        message: err.message,
        status: err?.response?.status,
        data: err?.response?.data,
      });

      setError(
        err?.response?.data?.msg ||
          err?.response?.data?.message ||
          "Failed to load material detail.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterial();
  }, [materialId]);

  const contentBlocks = useMemo(() => {
    if (!material?.content) return [];

    return material.content
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }, [material]);

  const renderContentBlock = (block, index) => {
    if (block.startsWith("# ")) {
      return (
        <Text key={index} style={styles.contentTitle}>
          {block.replace("# ", "")}
        </Text>
      );
    }

    if (block.startsWith("## ")) {
      return (
        <Text key={index} style={styles.contentSubtitle}>
          {block.replace("## ", "")}
        </Text>
      );
    }

    if (block.startsWith("- ")) {
      return (
        <View key={index} style={styles.bulletRow}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.contentParagraph}>{block.replace("- ", "")}</Text>
        </View>
      );
    }

    return (
      <Text key={index} style={styles.contentParagraph}>
        {block}
      </Text>
    );
  };

  const difficultyStyle =
    material?.difficulty === "Mudah"
      ? styles.easy
      : material?.difficulty === "Sulit"
        ? styles.hard
        : styles.medium;

  if (isLoading) {
    return (
      <View style={globalStyles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading material detail...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={globalStyles.center}>
        <View style={globalStyles.errorBox}>
          <Text style={globalStyles.errorText}>{error}</Text>
        </View>

        <Pressable
          style={[globalStyles.button, styles.centerButton]}
          onPress={fetchMaterial}
        >
          <Text style={globalStyles.buttonText}>Try Again</Text>
        </Pressable>

        <Pressable
          style={[globalStyles.ghostButton, styles.centerButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={globalStyles.ghostButtonText}>Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={globalStyles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>← Dashboard</Text>
          </Pressable>

          <View style={styles.logoBox}>
            <Text style={styles.logoText}>LS</Text>
          </View>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.cardTop}>
            <Text style={styles.subjectPill}>{material?.subject}</Text>
            <Text style={[styles.difficultyPill, difficultyStyle]}>
              {material?.difficulty || "Medium"}
            </Text>
          </View>

          <Text style={styles.title}>{material?.title}</Text>
          <Text style={styles.description}>{material?.description}</Text>

          <View style={styles.metaList}>
            <Text style={styles.metaPill}>
              Category: {material?.category || "General"}
            </Text>
            <Text style={styles.metaPill}>
              {material?.duration || 0} minutes
            </Text>
          </View>
        </View>

        <View style={styles.topicCard}>
          <Text style={styles.smallSectionTitle}>Topics</Text>

          <View style={styles.topicList}>
            {(material?.topics || []).map((topic) => (
              <Text key={topic} style={styles.topicPill}>
                {topic}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.contentCard}>
          <Text style={styles.sectionTitle}>Learning Content</Text>

          {contentBlocks.length > 0 ? (
            contentBlocks.map(renderContentBlock)
          ) : (
            <Text style={styles.contentParagraph}>
              No detailed content is available for this material yet.
            </Text>
          )}
        </View>

        {relatedMaterials.length > 0 ? (
          <View style={styles.relatedSection}>
            <Text style={styles.sectionTitle}>Related Materials</Text>

            {relatedMaterials.map((item) => (
              <Pressable
                key={item._id}
                style={styles.relatedCard}
                onPress={() =>
                  navigation.replace("MaterialDetail", {
                    materialId: item._id,
                  })
                }
              >
                <View style={styles.relatedTop}>
                  <Text style={styles.relatedSubject}>{item.subject}</Text>
                  <Text style={styles.relatedOpen}>Open →</Text>
                </View>

                <Text style={styles.relatedTitle}>{item.title}</Text>

                <Text style={styles.relatedDescription} numberOfLines={2}>
                  {item.description}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 52,
    paddingBottom: 48,
  },
  loadingText: {
    marginTop: 14,
    color: colors.muted,
    fontWeight: "800",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backButton: {
    minHeight: 42,
    borderRadius: 999,
    paddingHorizontal: 14,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: {
    color: colors.primaryDark,
    fontWeight: "900",
  },
  logoBox: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.card,
  },
  logoText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 15,
  },
  heroCard: {
    backgroundColor: colors.primaryDark,
    borderRadius: 32,
    padding: 22,
    marginBottom: 14,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  subjectPill: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.14)",
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    overflow: "hidden",
  },
  difficultyPill: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "900",
    overflow: "hidden",
  },
  easy: {
    backgroundColor: colors.successBg,
    color: colors.successText,
  },
  medium: {
    backgroundColor: colors.warningBg,
    color: colors.warningText,
  },
  hard: {
    backgroundColor: "#FEE2E2",
    color: colors.danger,
  },
  title: {
    marginTop: 18,
    fontSize: 34,
    fontWeight: "900",
    color: "#FFFFFF",
    lineHeight: 40,
    letterSpacing: -0.7,
  },
  description: {
    marginTop: 10,
    color: "rgba(255,255,255,0.78)",
    lineHeight: 23,
    fontWeight: "600",
  },
  metaList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 18,
  },
  metaPill: {
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.13)",
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 12,
    overflow: "hidden",
  },
  topicCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
    ...shadows.card,
  },
  smallSectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 10,
  },
  topicList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },
  topicPill: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.surface,
    color: "#475569",
    fontSize: 12,
    fontWeight: "800",
    overflow: "hidden",
  },
  contentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.text,
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  contentTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.text,
    lineHeight: 31,
    marginTop: 8,
    marginBottom: 10,
  },
  contentSubtitle: {
    fontSize: 19,
    fontWeight: "900",
    color: colors.text,
    marginTop: 16,
    marginBottom: 6,
  },
  bulletRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  bulletDot: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: "900",
    marginTop: 1,
  },
  contentParagraph: {
    flex: 1,
    color: "#334155",
    lineHeight: 24,
    marginBottom: 8,
    fontWeight: "600",
  },
  relatedSection: {
    marginTop: 20,
  },
  relatedCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
    ...shadows.card,
  },
  relatedTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 10,
  },
  relatedSubject: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "900",
    overflow: "hidden",
  },
  relatedOpen: {
    color: colors.primary,
    fontWeight: "900",
    fontSize: 12,
  },
  relatedTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.text,
    lineHeight: 24,
  },
  relatedDescription: {
    marginTop: 6,
    color: colors.muted,
    lineHeight: 21,
    fontWeight: "600",
  },
  centerButton: {
    width: "100%",
    marginTop: 14,
  },
});
