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
import { colors, globalStyles } from "../styles/theme";

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

    return (
      <Text key={index} style={styles.contentParagraph}>
        {block}
      </Text>
    );
  };

  if (isLoading) {
    return (
      <View style={globalStyles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 14, color: colors.muted, fontWeight: "700" }}>
          Loading material detail...
        </Text>
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
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>← Back to dashboard</Text>
        </Pressable>

        <View style={styles.detailCard}>
          <View style={styles.cardTop}>
            <Text style={styles.subjectPill}>{material?.subject}</Text>
            <Text style={styles.difficultyPill}>{material?.difficulty}</Text>
          </View>

          <Text style={styles.title}>{material?.title}</Text>
          <Text style={styles.description}>{material?.description}</Text>

          <View style={styles.metaList}>
            <Text style={styles.metaPill}>
              Category: {material?.category || "General"}
            </Text>
            <Text style={styles.metaPill}>{material?.duration} minutes</Text>
          </View>

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
          {contentBlocks.map(renderContentBlock)}
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
                <Text style={styles.relatedSubject}>{item.subject}</Text>
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
    paddingTop: 40,
    paddingBottom: 48,
  },
  backButton: {
    marginBottom: 14,
  },
  backText: {
    color: colors.primary,
    fontWeight: "900",
  },
  detailCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
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
    backgroundColor: "#DBEAFE",
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "900",
  },
  difficultyPill: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.warningBg,
    color: colors.warningText,
    fontSize: 12,
    fontWeight: "900",
  },
  title: {
    marginTop: 16,
    fontSize: 30,
    fontWeight: "900",
    color: colors.text,
    lineHeight: 36,
  },
  description: {
    marginTop: 10,
    color: colors.muted,
    lineHeight: 23,
  },
  metaList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 16,
  },
  metaPill: {
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#F8FAFC",
    color: "#475569",
    fontWeight: "800",
    fontSize: 12,
  },
  topicList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 14,
  },
  topicPill: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#F1F5F9",
    color: "#475569",
    fontSize: 11,
    fontWeight: "800",
  },
  contentCard: {
    marginTop: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.text,
    marginBottom: 12,
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
  contentParagraph: {
    color: "#334155",
    lineHeight: 24,
    marginBottom: 8,
  },
  relatedSection: {
    marginTop: 20,
  },
  relatedCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  relatedSubject: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#DBEAFE",
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 10,
  },
  relatedTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: colors.text,
  },
  relatedDescription: {
    marginTop: 6,
    color: colors.muted,
    lineHeight: 21,
  },
  centerButton: {
    width: "100%",
    marginTop: 14,
  },
});
