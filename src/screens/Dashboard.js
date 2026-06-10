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
import { colors, globalStyles } from "../styles/theme";

const subjectOptions = [
  "all",
  "Matematika",
  "Fisika",
  "Kimia",
  "Biologi",
  "Bahasa Indonesia",
  "Bahasa Inggris",
];

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useAuth();

  const [materials, setMaterials] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

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
    } catch (err) {
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

  const handleLogout = async () => {
    await logout();
  };

  const renderMaterial = ({ item }) => {
    const difficultyStyle =
      item.difficulty === "Mudah"
        ? styles.easy
        : item.difficulty === "Sulit"
          ? styles.hard
          : styles.medium;

    return (
      <Pressable
        style={styles.materialCard}
        onPress={() =>
          navigation.navigate("MaterialDetail", {
            materialId: item._id,
          })
        }
      >
        <View style={styles.cardTop}>
          <Text style={styles.subjectPill}>{item.subject}</Text>
          <Text style={[styles.difficultyPill, difficultyStyle]}>
            {item.difficulty}
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
          <Text style={styles.duration}>{item.duration} min</Text>
          <Text style={styles.openText}>Open →</Text>
        </View>
      </Pressable>
    );
  };

  const listHeader = (
    <View>
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>Learning Support</Text>
          <Text style={styles.headerMuted}>Student Platform</Text>
        </View>

        <Pressable style={globalStyles.ghostButton} onPress={handleLogout}>
          <Text style={globalStyles.ghostButtonText}>Logout</Text>
        </Pressable>
      </View>

      <View style={styles.heroCard}>
        <Text style={styles.heroBadge}>Student Dashboard</Text>
        <Text style={styles.heroTitle}>Hi, {user?.name || "Student"} 👋</Text>
        <Text style={styles.heroText}>
          Explore learning materials, filter by subject, and prepare your study
          session with structured content.
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
            <Text style={styles.statNumber}>{filteredMaterials.length}</Text>
            <Text style={styles.statLabel}>Visible</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{totalDuration}</Text>
            <Text style={styles.statLabel}>Minutes</Text>
          </View>
        </View>
      </View>

      <TextInput
        style={[globalStyles.input, styles.searchInput]}
        placeholder="Search material..."
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

      {!isLoading && !error ? (
        <Text style={styles.sectionTitle}>Learning Materials</Text>
      ) : null}
    </View>
  );

  if (isLoading) {
    return (
      <View style={globalStyles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 14, color: colors.muted, fontWeight: "700" }}>
          Loading materials...
        </Text>
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
    paddingBottom: 40,
  },
  header: {
    marginTop: 18,
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.text,
  },
  headerMuted: {
    marginTop: 2,
    color: colors.muted,
    fontWeight: "700",
  },
  heroCard: {
    borderRadius: 28,
    padding: 20,
    backgroundColor: colors.primaryDark,
    marginBottom: 16,
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
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 36,
  },
  heroText: {
    marginTop: 10,
    color: "rgba(255,255,255,0.78)",
    lineHeight: 23,
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
    fontSize: 12,
    fontWeight: "700",
  },
  searchInput: {
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
  },
  subjectFilter: {
    gap: 8,
    paddingBottom: 16,
  },
  subjectButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
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
    height: 44,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.text,
    marginBottom: 12,
  },
  materialCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    fontSize: 12,
    fontWeight: "900",
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
    fontSize: 19,
    fontWeight: "900",
    color: colors.text,
    lineHeight: 25,
  },
  materialDescription: {
    marginTop: 8,
    color: colors.muted,
    lineHeight: 22,
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
    backgroundColor: "#F1F5F9",
    color: "#475569",
    fontSize: 11,
    fontWeight: "800",
  },
  cardFooter: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  duration: {
    color: colors.muted,
    fontWeight: "900",
  },
  openText: {
    color: colors.primary,
    fontWeight: "900",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
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
  },
});
