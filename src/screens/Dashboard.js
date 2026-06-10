import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { colors, globalStyles, shadows } from "../styles/theme";

const subjectOptions = [
  "all",
  "Matematika",
  "Fisika",
  "Kimia",
  "Biologi",
  "Bahasa Indonesia",
  "Bahasa Inggris",
];

const getMaterialIdFromProgress = (item) => {
  if (!item) return "";

  if (typeof item.material === "string") return item.material;
  if (item.material?._id) return item.material._id;
  if (item.materialId) return item.materialId;
  if (item.course) return item.course;

  return item._id || "";
};

const normalizeProgress = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.progress)) return data.progress;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.enrollments)) return data.enrollments;

  return [];
};

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useAuth();

  const [materials, setMaterials] = useState([]);
  const [progressItems, setProgressItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");

  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiSources, setAiSources] = useState([]);
  const [isAskingAi, setIsAskingAi] = useState(false);
  const [aiError, setAiError] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const completedIds = useMemo(() => {
    return new Set(
      progressItems.map(getMaterialIdFromProgress).filter(Boolean),
    );
  }, [progressItems]);

  const fetchProgress = async () => {
    try {
      const response = await api.get("/progress");
      setProgressItems(normalizeProgress(response.data));
    } catch (err) {
      console.log("PROGRESS LOAD ERROR:", {
        message: err.message,
        status: err?.response?.status,
        data: err?.response?.data,
      });

      setProgressItems([]);
    }
  };

  const fetchMaterials = async ({ refreshing = false } = {}) => {
    try {
      if (refreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError("");

      const response = await api.get("/courses");
      setMaterials(Array.isArray(response.data) ? response.data : []);

      await fetchProgress();
    } catch (err) {
      console.log("MATERIAL LOAD ERROR:", {
        message: err.message,
        status: err?.response?.status,
        data: err?.response?.data,
      });

      setError(
        err?.response?.data?.msg ||
          err?.response?.data?.message ||
          "Failed to load learning materials.",
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMaterials();
    }, []),
  );

  const filteredMaterials = useMemo(() => {
    const keyword = searchTerm.toLowerCase().trim();

    return materials.filter((material) => {
      const title = material?.title?.toLowerCase() || "";
      const description = material?.description?.toLowerCase() || "";
      const subject = material?.subject || "";

      const matchesSearch =
        !keyword || title.includes(keyword) || description.includes(keyword);

      const matchesSubject =
        selectedSubject === "all" || subject === selectedSubject;

      return matchesSearch && matchesSubject;
    });
  }, [materials, searchTerm, selectedSubject]);

  const totalDuration = filteredMaterials.reduce(
    (total, material) => total + Number(material?.duration || 0),
    0,
  );

  const completionRate = materials.length
    ? Math.round((completedIds.size / materials.length) * 100)
    : 0;

  const handleLogout = async () => {
    await logout();
  };

  const handleAskAi = async () => {
    if (!aiQuestion.trim()) {
      setAiError("Please write a question first.");
      return;
    }

    try {
      setIsAskingAi(true);
      setAiError("");
      setAiAnswer("");
      setAiSources([]);

      const response = await api.post("/ai/ask", {
        question: aiQuestion.trim(),
      });

      setAiAnswer(response.data?.answer || "No answer returned yet.");
      setAiSources(
        Array.isArray(response.data?.sources) ? response.data.sources : [],
      );
    } catch (err) {
      console.log("AI ASSISTANT ERROR:", {
        message: err.message,
        status: err?.response?.status,
        data: err?.response?.data,
      });

      setAiError(
        err?.response?.data?.message ||
          err?.response?.data?.msg ||
          err.message ||
          "AI assistant failed to answer. Please try again.",
      );
    } finally {
      setIsAskingAi(false);
    }
  };

  const handleComplete = async (materialId) => {
    try {
      setProgressItems((current) => [
        ...current,
        { material: materialId, status: "completed" },
      ]);

      await api.post(`/progress/${materialId}/complete`);
      await fetchProgress();
    } catch (err) {
      console.log("COMPLETE MATERIAL ERROR:", {
        message: err.message,
        status: err?.response?.status,
        data: err?.response?.data,
      });

      await fetchProgress();
    }
  };

  const handleResetProgress = async (materialId) => {
    try {
      setProgressItems((current) =>
        current.filter(
          (item) => getMaterialIdFromProgress(item) !== materialId,
        ),
      );

      await api.delete(`/progress/${materialId}`);
      await fetchProgress();
    } catch (err) {
      console.log("RESET PROGRESS ERROR:", {
        message: err.message,
        status: err?.response?.status,
        data: err?.response?.data,
      });

      await fetchProgress();
    }
  };

  const renderMaterial = ({ item }) => {
    const isCompleted = completedIds.has(item._id);

    const difficultyStyle =
      item.difficulty === "Mudah"
        ? styles.easy
        : item.difficulty === "Sulit"
          ? styles.hard
          : styles.medium;

    return (
      <Pressable
        style={[styles.materialCard, isCompleted && styles.materialCardDone]}
        onPress={() =>
          navigation.navigate("MaterialDetail", {
            materialId: item._id,
          })
        }
      >
        <View style={styles.cardTop}>
          <Text style={styles.subjectPill}>{item.subject}</Text>
          <Text style={[styles.difficultyPill, difficultyStyle]}>
            {item.difficulty || "Medium"}
          </Text>
        </View>

        <Text style={styles.materialTitle}>{item.title}</Text>

        <Text style={styles.materialDescription} numberOfLines={3}>
          {item.description}
        </Text>

        <View style={styles.topicList}>
          {(item.topics || []).slice(0, 3).map((topic) => (
            <Text key={topic} style={styles.topicPill}>
              {topic}
            </Text>
          ))}
        </View>

        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.duration}>{item.duration || 0} min</Text>
            <Text style={styles.statusText}>
              {isCompleted ? "Completed" : "Not completed yet"}
            </Text>
          </View>

          <View style={styles.cardActions}>
            <Pressable
              style={[
                styles.smallButton,
                isCompleted && styles.smallButtonDone,
              ]}
              onPress={(event) => {
                event.stopPropagation();

                if (isCompleted) {
                  handleResetProgress(item._id);
                } else {
                  handleComplete(item._id);
                }
              }}
            >
              <Text
                style={[
                  styles.smallButtonText,
                  isCompleted && styles.smallButtonDoneText,
                ]}
              >
                {isCompleted ? "Reset" : "Done"}
              </Text>
            </Pressable>

            <Text style={styles.openText}>Open →</Text>
          </View>
        </View>
      </Pressable>
    );
  };

  const listHeader = (
    <View>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>LS</Text>
          </View>

          <View>
            <Text style={styles.brand}>Learning Support</Text>
            <Text style={styles.headerMuted}>Student Platform</Text>
          </View>
        </View>

        <Pressable style={globalStyles.ghostButton} onPress={handleLogout}>
          <Text style={globalStyles.ghostButtonText}>Logout</Text>
        </Pressable>
      </View>

      <View style={styles.heroCard}>
        <Text style={styles.heroBadge}>Student Dashboard</Text>

        <Text style={styles.heroTitle}>Hi, {user?.name || "Student"} 👋</Text>

        <Text style={styles.heroText}>
          Explore learning materials, ask AI for help, and keep your study
          progress organized.
        </Text>

        <View style={styles.userMeta}>
          <Text style={styles.metaPill}>{user?.grade || "Grade 12"}</Text>
          <Text style={styles.metaPill}>{user?.school || "Your School"}</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{materials.length}</Text>
            <Text style={styles.statLabel}>Materials</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{completedIds.size}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{completionRate}%</Text>
            <Text style={styles.statLabel}>Progress</Text>
          </View>
        </View>
      </View>

      <View style={styles.aiCard}>
        <View style={styles.aiHeader}>
          <View>
            <Text style={styles.aiEyebrow}>AI Study Assistant</Text>
            <Text style={styles.aiTitle}>Ask about your materials</Text>
          </View>

          <Text style={styles.aiIcon}>✨</Text>
        </View>

        <TextInput
          style={[globalStyles.input, styles.aiInput]}
          placeholder="Example: Explain math material simply"
          placeholderTextColor={colors.softText}
          value={aiQuestion}
          onChangeText={setAiQuestion}
          multiline
        />

        <Pressable
          style={[globalStyles.button, isAskingAi && styles.disabled]}
          onPress={handleAskAi}
          disabled={isAskingAi}
        >
          <Text style={globalStyles.buttonText}>
            {isAskingAi ? "Asking AI..." : "Ask AI"}
          </Text>
        </Pressable>

        {aiError ? (
          <View style={[globalStyles.errorBox, styles.aiResultBox]}>
            <Text style={globalStyles.errorText}>{aiError}</Text>
          </View>
        ) : null}

        {aiAnswer ? (
          <View style={styles.aiAnswerBox}>
            <Text style={styles.aiAnswerTitle}>Answer</Text>
            <Text style={styles.aiAnswerText}>{aiAnswer}</Text>

            {aiSources.length > 0 ? (
              <View style={styles.sourceList}>
                <Text style={styles.sourceTitle}>Related sources</Text>

                {aiSources.slice(0, 3).map((source) => (
                  <Text
                    key={source.id || source._id || source.title}
                    style={styles.sourceItem}
                  >
                    • {source.title || "Learning material"}
                  </Text>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}
      </View>

      <View style={styles.searchSection}>
        <Text style={styles.sectionTitle}>Learning Materials</Text>

        <Text style={styles.sectionSubtitle}>
          {filteredMaterials.length} visible materials • {totalDuration} minutes
        </Text>

        <TextInput
          style={[globalStyles.input, styles.searchInput]}
          placeholder="Search material..."
          placeholderTextColor={colors.softText}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subjectFilter}
        >
          {subjectOptions.map((subject) => {
            const isActive = selectedSubject === subject;

            return (
              <Pressable
                key={subject}
                style={[
                  styles.subjectButton,
                  isActive && styles.subjectButtonActive,
                ]}
                onPress={() => setSelectedSubject(subject)}
              >
                <Text
                  style={[
                    styles.subjectButtonText,
                    isActive && styles.subjectButtonTextActive,
                  ]}
                >
                  {subject === "all" ? "All Subjects" : subject}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {error ? (
        <View style={[globalStyles.errorBox, styles.errorBox]}>
          <Text style={globalStyles.errorText}>{error}</Text>

          <Pressable
            style={[globalStyles.button, styles.retryButton]}
            onPress={() => fetchMaterials()}
          >
            <Text style={globalStyles.buttonText}>Try Again</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );

  if (isLoading) {
    return (
      <View style={globalStyles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading materials...</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.safeArea}>
      <FlatList
        data={error ? [] : filteredMaterials}
        keyExtractor={(item) => item._id}
        renderItem={renderMaterial}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          !error ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>📚</Text>
              <Text style={styles.emptyTitle}>No materials found</Text>
              <Text style={styles.emptyText}>
                Try changing your keyword or subject filter.
              </Text>
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchMaterials({ refreshing: true })}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 20,
    paddingTop: 52,
    paddingBottom: 44,
  },
  loadingText: {
    marginTop: 14,
    color: colors.muted,
    fontWeight: "800",
  },
  header: {
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    flex: 1,
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
  brand: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.text,
  },
  headerMuted: {
    marginTop: 2,
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
  },
  heroCard: {
    borderRadius: 32,
    padding: 22,
    backgroundColor: colors.primaryDark,
    marginBottom: 14,
  },
  heroBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    color: "#FFFFFF",
    backgroundColor: "rgba(255,255,255,0.14)",
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 12,
    overflow: "hidden",
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 33,
    fontWeight: "900",
    lineHeight: 38,
    letterSpacing: -0.7,
  },
  heroText: {
    marginTop: 10,
    color: "rgba(255,255,255,0.78)",
    lineHeight: 23,
    fontWeight: "600",
  },
  userMeta: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metaPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    color: "#FFFFFF",
    backgroundColor: "rgba(255,255,255,0.13)",
    fontWeight: "800",
    fontSize: 12,
    overflow: "hidden",
  },
  statsGrid: {
    marginTop: 18,
    flexDirection: "row",
    gap: 8,
  },
  statBox: {
    flex: 1,
    borderRadius: 18,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  statNumber: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
  },
  statLabel: {
    marginTop: 2,
    color: "rgba(255,255,255,0.75)",
    fontSize: 11,
    fontWeight: "800",
  },
  aiCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
    ...shadows.card,
    gap: 12,
  },
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  aiEyebrow: {
    color: colors.primary,
    fontWeight: "900",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  aiTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
    marginTop: 3,
  },
  aiIcon: {
    fontSize: 26,
  },
  aiInput: {
    minHeight: 84,
    textAlignVertical: "top",
  },
  aiResultBox: {
    marginTop: 2,
  },
  aiAnswerBox: {
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  aiAnswerTitle: {
    color: colors.text,
    fontWeight: "900",
    marginBottom: 7,
  },
  aiAnswerText: {
    color: "#334155",
    lineHeight: 22,
    fontWeight: "600",
  },
  sourceList: {
    marginTop: 12,
    gap: 4,
  },
  sourceTitle: {
    color: colors.text,
    fontWeight: "900",
  },
  sourceItem: {
    color: colors.muted,
    fontWeight: "700",
    lineHeight: 20,
  },
  searchSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
    ...shadows.card,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: colors.text,
  },
  sectionSubtitle: {
    marginTop: 4,
    marginBottom: 12,
    color: colors.muted,
    fontWeight: "700",
  },
  searchInput: {
    marginBottom: 12,
  },
  subjectFilter: {
    gap: 8,
    paddingRight: 8,
  },
  subjectButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  subjectButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  subjectButtonText: {
    color: colors.muted,
    fontWeight: "900",
  },
  subjectButtonTextActive: {
    color: "#FFFFFF",
  },
  errorBox: {
    marginBottom: 16,
    gap: 12,
  },
  retryButton: {
    minHeight: 44,
  },
  materialCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: 17,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  materialCardDone: {
    borderColor: "#BBF7D0",
    backgroundColor: "#FCFFFD",
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  subjectPill: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.primarySoft,
    color: colors.primaryDark,
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
  materialTitle: {
    marginTop: 14,
    fontSize: 20,
    fontWeight: "900",
    color: colors.text,
    lineHeight: 26,
    letterSpacing: -0.2,
  },
  materialDescription: {
    marginTop: 8,
    color: colors.muted,
    lineHeight: 22,
    fontWeight: "600",
  },
  topicList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 12,
  },
  topicPill: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.surface,
    color: "#475569",
    fontSize: 11,
    fontWeight: "800",
    overflow: "hidden",
  },
  cardFooter: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  duration: {
    color: colors.text,
    fontWeight: "900",
  },
  statusText: {
    marginTop: 2,
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  cardActions: {
    alignItems: "flex-end",
    gap: 8,
  },
  smallButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  smallButtonDone: {
    backgroundColor: colors.successBg,
  },
  smallButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 12,
  },
  smallButtonDoneText: {
    color: colors.successText,
  },
  openText: {
    color: colors.primary,
    fontWeight: "900",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: 26,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  emptyIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.text,
  },
  emptyText: {
    marginTop: 8,
    color: colors.muted,
    textAlign: "center",
    lineHeight: 21,
  },
  disabled: {
    opacity: 0.65,
  },
});
